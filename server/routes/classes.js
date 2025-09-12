const express = require('express');
const router = express.Router();
const db = require('../database/database');

// Get all classes
router.get('/', (req, res) => {
    const database = db.getDb();
    const userId = req.query.userId; // Get userId from query parameter
    
    database.all(
        'SELECT * FROM classes ORDER BY day, time',
        [],
        (err, rows) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Error al cargar las clases'
                });
            }

            // Add availability status for each class
            const classesWithAvailability = rows.map(cls => {
                const now = new Date();
                const classDate = cls.next_class_date ? new Date(cls.next_class_date) : null;
                let hoursUntilClass = 0;
                let canReserve = false;
                
                if (classDate && !isNaN(classDate.getTime())) {
                    hoursUntilClass = (classDate.getTime() - now.getTime()) / (1000 * 60 * 60);
                    canReserve = hoursUntilClass <= 24 && hoursUntilClass > 0;
                } else {
                    // Se não há data da próxima aula, considerar como "muito cedo para reservar"
                    hoursUntilClass = 48; // Simular que falta mais de 24h
                    canReserve = false;
                }
                
                return {
                    ...cls,
                    canReserve: canReserve,
                    hoursUntilClass: Math.round(hoursUntilClass),
                    nextClassDate: classDate ? classDate.toISOString() : null,
                    isBooked: false, // Will be updated below if user provided
                    currentBookings: 0, // Will be updated below
                    isWaitlisted: false // Will be updated below if user provided
                };
            });

            // Get booking counts for all classes first
            database.all(
                'SELECT class_id, COUNT(*) as booking_count FROM bookings GROUP BY class_id',
                [],
                (err, bookingCounts) => {
                    if (err) {
                        console.error('Error getting booking counts:', err);
                        return res.status(500).json({
                            success: false,
                            message: 'Error al cargar las reservas'
                        });
                    }

                    // Create booking count map
                    const bookingCountMap = {};
                    bookingCounts.forEach(bc => {
                        bookingCountMap[bc.class_id] = bc.booking_count;
                    });

                    // Update classes with booking counts
                    const classesWithCounts = classesWithAvailability.map(cls => {
                        const currentBookings = bookingCountMap[cls.id] || 0;
                        const maxCapacity = cls.max_capacity || 10;
                        return {
                            ...cls,
                            currentBookings: currentBookings,
                            isFull: currentBookings >= maxCapacity
                        };
                    });

                    // If userId provided, check user's bookings and waitlist status
                    if (userId) {
                        // Check bookings
                        database.all(
                            'SELECT class_id FROM bookings WHERE user_id = ?',
                            [userId],
                            (err, userBookings) => {
                                if (err) {
                                    console.error('Error checking user bookings:', err);
                                    return res.json({
                                        success: true,
                                        classes: classesWithCounts
                                    });
                                }

                                const bookedClassIds = userBookings.map(booking => booking.class_id);

                                // Check waitlist
                                database.all(
                                    'SELECT class_id FROM waitlist WHERE user_id = ?',
                                    [userId],
                                    (err, userWaitlist) => {
                                        if (err) {
                                            console.error('Error checking user waitlist:', err);
                                            return res.json({
                                                success: true,
                                                classes: classesWithCounts.map(cls => ({
                                                    ...cls,
                                                    isBooked: bookedClassIds.includes(cls.id)
                                                }))
                                            });
                                        }

                                        const waitlistedClassIds = userWaitlist.map(wl => wl.class_id);

                                        // Final classes with all status
                                        const finalClasses = classesWithCounts.map(cls => ({
                                            ...cls,
                                            isBooked: bookedClassIds.includes(cls.id),
                                            isWaitlisted: waitlistedClassIds.includes(cls.id)
                                        }));

                                        res.json({
                                            success: true,
                                            classes: finalClasses
                                        });
                                    }
                                );
                            }
                        );
                    } else {
                        res.json({
                            success: true,
                            classes: classesWithCounts
                        });
                    }
                }
            );
        }
    );
});

// Get class by ID
router.get('/:id', (req, res) => {
    const { id } = req.params;
    const database = db.getDb();
    
    database.get(
        'SELECT * FROM classes WHERE id = ?',
        [id],
        (err, row) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Error en la base de datos'
                });
            }

            if (!row) {
                return res.status(404).json({
                    success: false,
                    message: 'Clase no encontrada'
                });
            }

            res.json({
                success: true,
                class: row
            });
        }
    );
});

// Create new class
router.post('/', (req, res) => {
    const { name, instructor, description, day, time, maxCapacity } = req.body;

    if (!name || !instructor || !description || !day || !time || !maxCapacity) {
        return res.status(400).json({
            success: false,
            message: 'Todos los campos son requeridos'
        });
    }

    // Calculate next class date
    const getNextClassDate = (dayName, time) => {
        const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
        const dayIndex = days.indexOf(dayName);
        const now = new Date();
        const [hours, minutes] = time.split(':');
        
        let nextDate = new Date();
        // Ajustar horário considerando fuso local (UTC-3 para São Paulo/Argentina)
        nextDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        
        while (nextDate.getDay() !== dayIndex || nextDate <= now) {
            nextDate.setDate(nextDate.getDate() + 1);
            nextDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        }
        
        // Salvar como string local sem conversão UTC
        return nextDate.toISOString();
    };

    const nextClassDate = getNextClassDate(day, time);
    const database = db.getDb();
    
    database.run(
        'INSERT INTO classes (name, instructor, description, day, time, max_capacity, next_class_date) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [name, instructor, description, day, time, maxCapacity, nextClassDate],
        function(err) {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Error al crear la clase'
                });
            }

            const newClass = {
                id: this.lastID,
                name,
                instructor,
                description,
                day,
                time,
                max_capacity: maxCapacity,
                next_class_date: nextClassDate
            };

            res.status(201).json({
                success: true,
                message: 'Clase creada exitosamente',
                class: newClass
            });
        }
    );
});

// Update class
router.put('/:id', (req, res) => {
    const { id } = req.params;
    const { name, instructor, description, day, time, maxCapacity } = req.body;

    if (!name || !instructor || !description || !day || !time || !maxCapacity) {
        return res.status(400).json({
            success: false,
            message: 'Todos los campos son requeridos'
        });
    }

    // Recalculate next class date when updating
    const getNextClassDate = (dayName, time) => {
        const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
        const dayIndex = days.indexOf(dayName);
        const now = new Date();
        const [hours, minutes] = time.split(':');
        
        let nextDate = new Date();
        nextDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        
        while (nextDate.getDay() !== dayIndex || nextDate <= now) {
            nextDate.setDate(nextDate.getDate() + 1);
            nextDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        }
        
        return nextDate.toISOString();
    };

    const nextClassDate = getNextClassDate(day, time);
    const database = db.getDb();
    
    database.run(
        'UPDATE classes SET name = ?, instructor = ?, description = ?, day = ?, time = ?, max_capacity = ?, next_class_date = ? WHERE id = ?',
        [name, instructor, description, day, time, maxCapacity, nextClassDate, id],
        function(err) {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Error al actualizar la clase'
                });
            }

            if (this.changes === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Clase no encontrada'
                });
            }

            res.json({
                success: true,
                message: 'Clase actualizada exitosamente'
            });
        }
    );
});

// Delete class
router.delete('/:id', (req, res) => {
    const { id } = req.params;
    const database = db.getDb();
    
    // First, delete all bookings for this class
    database.run(
        'DELETE FROM bookings WHERE class_id = ?',
        [id],
        (err) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Error al eliminar las reservas de la clase'
                });
            }

            // Then delete the class
            database.run(
                'DELETE FROM classes WHERE id = ?',
                [id],
                function(err) {
                    if (err) {
                        console.error('Database error:', err);
                        return res.status(500).json({
                            success: false,
                            message: 'Error al eliminar la clase'
                        });
                    }

                    if (this.changes === 0) {
                        return res.status(404).json({
                            success: false,
                            message: 'Clase no encontrada'
                        });
                    }

                    res.json({
                        success: true,
                        message: 'Clase eliminada exitosamente'
                    });
                }
            );
        }
    );
});

// Obter reservas e lista de espera de uma aula específica (Admin)
router.get('/:id/reservations', (req, res) => {
    const database = db.getDb();
    const classId = req.params.id;
    
    // Buscar informações da aula
    database.get('SELECT name, max_capacity FROM classes WHERE id = ?', [classId], (err, classInfo) => {
        if (err) {
            console.error('Error fetching class info:', err);
            return res.status(500).json({ error: 'Erro interno do servidor' });
        }
        
        if (!classInfo) {
            return res.status(404).json({ error: 'Classe não encontrada' });
        }
        
        // Buscar reservas confirmadas
        database.all(`
            SELECT b.user_id, u.phone as user_phone, b.booking_date
            FROM bookings b
            JOIN users u ON b.user_id = u.id
            WHERE b.class_id = ?
            ORDER BY b.booking_date
        `, [classId], (err, reservations) => {
            if (err) {
                console.error('Error fetching reservations:', err);
                return res.status(500).json({ error: 'Erro interno do servidor' });
            }

            // Buscar lista de espera
            database.all(`
                SELECT w.user_id, u.phone as user_phone, w.waitlist_date
                FROM waitlist w
                JOIN users u ON w.user_id = u.id
                WHERE w.class_id = ?
                ORDER BY w.position
            `, [classId], (err, waitlist) => {
                if (err) {
                    console.error('Error fetching waitlist:', err);
                    return res.status(500).json({ error: 'Erro interno do servidor' });
                }

                res.json({
                    success: true,
                    className: classInfo.name,
                    maxCapacity: classInfo.max_capacity,
                    reservations: reservations || [],
                    waitlist: waitlist || []
                });
            });
        });
    });
});

// Remover reserva de usuário (Admin)
router.delete('/:classId/bookings/:userId', (req, res) => {
    const database = db.getDb();
    const { classId, userId } = req.params;
    
    database.run('DELETE FROM bookings WHERE class_id = ? AND user_id = ?', [classId, userId], function(err) {
        if (err) {
            console.error('Error removing reservation:', err);
            return res.status(500).json({ error: 'Erro interno do servidor' });
        }
        
        if (this.changes === 0) {
            return res.status(404).json({ error: 'Reserva não encontrada' });
        }
        
        // Promover próximo da lista de espera automaticamente
        database.get(`
            SELECT user_id FROM waitlist 
            WHERE class_id = ? 
            ORDER BY position 
            LIMIT 1
        `, [classId], (err, nextInWaitlist) => {
            if (err) {
                console.error('Error finding next in waitlist:', err);
                return res.json({ success: true, message: 'Reserva eliminada exitosamente' });
            }
            
            if (nextInWaitlist) {
                // Criar reserva para o próximo da lista
                database.run('INSERT INTO bookings (user_id, class_id, booking_date) VALUES (?, ?, ?)', 
                    [nextInWaitlist.user_id, classId, new Date().toISOString()], (err) => {
                    if (err) {
                        console.error('Error creating booking for waitlist user:', err);
                        return res.json({ success: true, message: 'Reserva eliminada exitosamente' });
                    }
                    
                    // Remover da lista de espera
                    database.run('DELETE FROM waitlist WHERE class_id = ? AND user_id = ?', 
                        [classId, nextInWaitlist.user_id], (err) => {
                        if (err) {
                            console.error('Error removing from waitlist:', err);
                        }
                        
                        // Atualizar posições na lista de espera
                        database.run(`
                            UPDATE waitlist 
                            SET position = position - 1 
                            WHERE class_id = ? AND position > 1
                        `, [classId], (err) => {
                            if (err) {
                                console.error('Error updating waitlist positions:', err);
                            }
                            res.json({ success: true, message: 'Reserva eliminada e próximo usuario promovido' });
                        });
                    });
                });
            } else {
                res.json({ success: true, message: 'Reserva eliminada exitosamente' });
            }
        });
    });
});

// Promover usuário da lista de espera (Admin)
router.post('/:classId/waitlist/:userId/promote', (req, res) => {
    const database = db.getDb();
    const { classId, userId } = req.params;
    
    // Verificar se há espaço disponível
    database.get('SELECT max_capacity FROM classes WHERE id = ?', [classId], (err, classInfo) => {
        if (err) {
            console.error('Error fetching class info:', err);
            return res.status(500).json({ error: 'Erro interno do servidor' });
        }
        
        database.get('SELECT COUNT(*) as count FROM bookings WHERE class_id = ?', [classId], (err, currentBookings) => {
            if (err) {
                console.error('Error counting bookings:', err);
                return res.status(500).json({ error: 'Erro interno do servidor' });
            }
            
            if (currentBookings.count >= classInfo.max_capacity) {
                return res.status(400).json({ error: 'Não há espaço disponível na aula' });
            }
            
            // Criar reserva
            database.run('INSERT INTO bookings (user_id, class_id, booking_date) VALUES (?, ?, ?)', 
                [userId, classId, new Date().toISOString()], (err) => {
                if (err) {
                    console.error('Error creating booking:', err);
                    return res.status(500).json({ error: 'Erro interno do servidor' });
                }
                
                // Remover da lista de espera
                database.get('SELECT position FROM waitlist WHERE class_id = ? AND user_id = ?', [classId, userId], (err, waitlistUser) => {
                    if (err) {
                        console.error('Error finding waitlist user:', err);
                        return res.json({ success: true, message: 'Usuario promovido exitosamente' });
                    }
                    
                    if (waitlistUser) {
                        database.run('DELETE FROM waitlist WHERE class_id = ? AND user_id = ?', [classId, userId], (err) => {
                            if (err) {
                                console.error('Error removing from waitlist:', err);
                            }
                            
                            // Atualizar posições
                            database.run(`
                                UPDATE waitlist 
                                SET position = position - 1 
                                WHERE class_id = ? AND position > ?
                            `, [classId, waitlistUser.position], (err) => {
                                if (err) {
                                    console.error('Error updating positions:', err);
                                }
                                res.json({ success: true, message: 'Usuario promovido exitosamente' });
                            });
                        });
                    } else {
                        res.json({ success: true, message: 'Usuario promovido exitosamente' });
                    }
                });
            });
        });
    });
});

// Remover usuário da lista de espera (Admin)
router.delete('/:classId/waitlist/:userId', (req, res) => {
    const database = db.getDb();
    const { classId, userId } = req.params;
    
    database.get('SELECT position FROM waitlist WHERE class_id = ? AND user_id = ?', [classId, userId], (err, waitlistUser) => {
        if (err) {
            console.error('Error finding waitlist user:', err);
            return res.status(500).json({ error: 'Erro interno do servidor' });
        }
        
        if (!waitlistUser) {
            return res.status(404).json({ error: 'Usuário não encontrado na lista de espera' });
        }
        
        database.run('DELETE FROM waitlist WHERE class_id = ? AND user_id = ?', [classId, userId], (err) => {
            if (err) {
                console.error('Error removing from waitlist:', err);
                return res.status(500).json({ error: 'Erro interno do servidor' });
            }
            
            // Atualizar posições
            database.run(`
                UPDATE waitlist 
                SET position = position - 1 
                WHERE class_id = ? AND position > ?
            `, [classId, waitlistUser.position], (err) => {
                if (err) {
                    console.error('Error updating positions:', err);
                }
                res.json({ success: true, message: 'Usuario eliminado de la lista de espera' });
            });
        });
    });
});

// Adicionar usuário à aula (Admin) - reserva ou lista de espera
router.post('/:classId/admin-booking', (req, res) => {
    const database = db.getDb();
    const { classId } = req.params;
    const { phone } = req.body;
    
    if (!phone) {
        return res.status(400).json({ error: 'Número de telefone é obrigatório' });
    }
    
    // Verificar se o usuário existe
    database.get('SELECT * FROM users WHERE phone = ?', [phone], (err, user) => {
        if (err) {
            console.error('Error finding user:', err);
            return res.status(500).json({ error: 'Erro interno do servidor' });
        }
        
        const processUser = (userData) => {
            // Verificar se já tem reserva ou está na lista de espera
            database.get('SELECT id FROM bookings WHERE user_id = ? AND class_id = ?', [userData.id, classId], (err, existingBooking) => {
                if (err) {
                    console.error('Error checking existing booking:', err);
                    return res.status(500).json({ error: 'Erro interno do servidor' });
                }
                
                database.get('SELECT id FROM waitlist WHERE user_id = ? AND class_id = ?', [userData.id, classId], (err, existingWaitlist) => {
                    if (err) {
                        console.error('Error checking existing waitlist:', err);
                        return res.status(500).json({ error: 'Erro interno do servidor' });
                    }
                    
                    if (existingBooking || existingWaitlist) {
                        return res.status(400).json({ error: 'Usuario ya está registrado en esta clase' });
                    }
                    
                    // Verificar capacidade
                    database.get('SELECT max_capacity FROM classes WHERE id = ?', [classId], (err, classInfo) => {
                        if (err) {
                            console.error('Error fetching class info:', err);
                            return res.status(500).json({ error: 'Erro interno do servidor' });
                        }
                        
                        database.get('SELECT COUNT(*) as count FROM bookings WHERE class_id = ?', [classId], (err, currentBookings) => {
                            if (err) {
                                console.error('Error counting bookings:', err);
                                return res.status(500).json({ error: 'Erro interno do servidor' });
                            }
                            
                            if (currentBookings.count < classInfo.max_capacity) {
                                // Adicionar à reserva
                                database.run('INSERT INTO bookings (user_id, class_id, booking_date) VALUES (?, ?, ?)', 
                                    [userData.id, classId, new Date().toISOString()], (err) => {
                                    if (err) {
                                        console.error('Error creating booking:', err);
                                        return res.status(500).json({ error: 'Erro interno do servidor' });
                                    }
                                    res.json({ success: true, message: 'Usuario agregado a la reserva exitosamente' });
                                });
                            } else {
                                // Adicionar à lista de espera
                                database.get('SELECT MAX(position) as max FROM waitlist WHERE class_id = ?', [classId], (err, maxPosition) => {
                                    if (err) {
                                        console.error('Error finding max position:', err);
                                        return res.status(500).json({ error: 'Erro interno do servidor' });
                                    }
                                    
                                    const newPosition = (maxPosition.max || 0) + 1;
                                    
                                    database.run('INSERT INTO waitlist (user_id, class_id, position, waitlist_date) VALUES (?, ?, ?, ?)', 
                                        [userData.id, classId, newPosition, new Date().toISOString()], (err) => {
                                        if (err) {
                                            console.error('Error adding to waitlist:', err);
                                            return res.status(500).json({ error: 'Erro interno do servidor' });
                                        }
                                        res.json({ success: true, message: `Usuario agregado a la lista de espera (posición ${newPosition})` });
                                    });
                                });
                            }
                        });
                    });
                });
            });
        };
        
        if (!user) {
            // Criar usuário básico se não existir
            database.run('INSERT INTO users (phone, created_at) VALUES (?, ?)', 
                [phone, new Date().toISOString()], function(err) {
                if (err) {
                    console.error('Error creating user:', err);
                    return res.status(500).json({ error: 'Erro interno do servidor' });
                }
                processUser({ id: this.lastID, phone });
            });
        } else {
            processUser(user);
        }
    });
});

module.exports = router;
