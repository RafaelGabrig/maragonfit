const express = require('express');
const router = express.Router();
const db = require('../database/database');

// Get all bookings for a user
router.get('/user/:userId', (req, res) => {
    const { userId } = req.params;
    const database = db.getDb();
    
    database.all(
        `SELECT b.*, c.name as class_name, c.instructor, c.day, c.time, c.description
         FROM bookings b
         JOIN classes c ON b.class_id = c.id
         WHERE b.user_id = ?
         ORDER BY c.day, c.time`,
        [userId],
        (err, rows) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Error al cargar las reservas'
                });
            }

            res.json({
                success: true,
                bookings: rows
            });
        }
    );
});

// Get all bookings for a class
router.get('/class/:classId', (req, res) => {
    const { classId } = req.params;
    const database = db.getDb();
    
    database.all(
        `SELECT b.*, u.name as user_name, u.phone
         FROM bookings b
         JOIN users u ON b.user_id = u.id
         WHERE b.class_id = ?
         ORDER BY b.booking_date`,
        [classId],
        (err, rows) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Error al cargar las reservas de la clase'
                });
            }

            res.json({
                success: true,
                bookings: rows
            });
        }
    );
});

// Get waitlist for a class
router.get('/waitlist/:classId', (req, res) => {
    const { classId } = req.params;
    const database = db.getDb();
    
    database.all(
        `SELECT w.*, u.name as user_name, u.phone
         FROM waitlist w
         JOIN users u ON w.user_id = u.id
         WHERE w.class_id = ?
         ORDER BY w.position`,
        [classId],
        (err, rows) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Error al cargar la lista de espera'
                });
            }

            res.json({
                success: true,
                waitlist: rows
            });
        }
    );
});

// Create new booking
router.post('/', (req, res) => {
    const { userId, classId } = req.body;

    if (!userId || !classId) {
        return res.status(400).json({
            success: false,
            message: 'ID de usuario y clase son requeridos'
        });
    }

    const database = db.getDb();
    
    // First check if the class exists and if it's available for booking
    database.get(
        'SELECT * FROM classes WHERE id = ?',
        [classId],
        (err, classRow) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Error en la base de datos'
                });
            }

            if (!classRow) {
                return res.status(404).json({
                    success: false,
                    message: 'Clase no encontrada'
                });
            }

            // Check 24-hour rule - only allow booking within last 24 hours
            const now = new Date();
            const classDate = classRow.next_class_date ? new Date(classRow.next_class_date) : null;
            const hoursUntilClass = classDate ? (classDate.getTime() - now.getTime()) / (1000 * 60 * 60) : 0;

            if (hoursUntilClass > 24) {
                return res.status(400).json({
                    success: false,
                    message: 'Solo se puede reservar en las últimas 24 horas antes de la clase'
                });
            }

            if (hoursUntilClass <= 0) {
                return res.status(400).json({
                    success: false,
                    message: 'La clase ya ha comenzado o ha terminado'
                });
            }

            // Check if booking already exists
            database.get(
                'SELECT * FROM bookings WHERE user_id = ? AND class_id = ?',
                [userId, classId],
                (err, row) => {
                    if (err) {
                        console.error('Database error:', err);
                        return res.status(500).json({
                            success: false,
                            message: 'Error en la base de datos'
                        });
                    }

                    if (row) {
                        return res.status(400).json({
                            success: false,
                            message: 'Ya tienes una reserva para esta clase'
                        });
                    }

                    // Check if user is already on waitlist
                    database.get(
                        'SELECT * FROM waitlist WHERE user_id = ? AND class_id = ?',
                        [userId, classId],
                        (err, waitlistRow) => {
                            if (err) {
                                console.error('Database error:', err);
                                return res.status(500).json({
                                    success: false,
                                    message: 'Error en la base de datos'
                                });
                            }

                            if (waitlistRow) {
                                return res.status(400).json({
                                    success: false,
                                    message: 'Ya estás en la lista de espera para esta clase'
                                });
                            }

                            // Check current booking count vs capacity
                            database.get(
                                'SELECT COUNT(*) as current_bookings FROM bookings WHERE class_id = ?',
                                [classId],
                                (err, countRow) => {
                                    if (err) {
                                        console.error('Database error:', err);
                                        return res.status(500).json({
                                            success: false,
                                            message: 'Error en la base de datos'
                                        });
                                    }

                                    const currentBookings = countRow.current_bookings;
                                    const maxCapacity = classRow.max_capacity || 10;

                                    if (currentBookings >= maxCapacity) {
                                        // Add to waitlist
                                        database.get(
                                            'SELECT COUNT(*) as waitlist_count FROM waitlist WHERE class_id = ?',
                                            [classId],
                                            (err, waitlistCountRow) => {
                                                if (err) {
                                                    console.error('Database error:', err);
                                                    return res.status(500).json({
                                                        success: false,
                                                        message: 'Error en la base de datos'
                                                    });
                                                }

                                                const position = waitlistCountRow.waitlist_count + 1;

                                                database.run(
                                                    'INSERT INTO waitlist (user_id, class_id, position) VALUES (?, ?, ?)',
                                                    [userId, classId, position],
                                                    function(err) {
                                                        if (err) {
                                                            console.error('Database error:', err);
                                                            return res.status(500).json({
                                                                success: false,
                                                                message: 'Error al añadir a la lista de espera'
                                                            });
                                                        }

                                                        res.status(201).json({
                                                            success: true,
                                                            message: `Clase llena. Añadido a lista de espera en posición ${position}`,
                                                            isWaitlist: true,
                                                            position: position
                                                        });
                                                    }
                                                );
                                            }
                                        );
                                    } else {
                                        // Create normal booking
                                        database.run(
                                            'INSERT INTO bookings (user_id, class_id) VALUES (?, ?)',
                                            [userId, classId],
                                            function(err) {
                                                if (err) {
                                                    console.error('Database error:', err);
                                                    return res.status(500).json({
                                                        success: false,
                                                        message: 'Error al crear la reserva'
                                                    });
                                                }

                                                res.status(201).json({
                                                    success: true,
                                                    message: 'Reserva creada exitosamente',
                                                    isWaitlist: false
                                                });
                                            }
                                        );
                                    }
                                }
                            );
                        }
                    );
                }
            );
        }
    );
});

// Delete booking
router.delete('/:userId/:classId', (req, res) => {
    const { userId, classId } = req.params;
    const database = db.getDb();
    
    database.run(
        'DELETE FROM bookings WHERE user_id = ? AND class_id = ?',
        [userId, classId],
        function(err) {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Error al cancelar la reserva'
                });
            }

            if (this.changes === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Reserva no encontrada'
                });
            }

            // Check if there's someone on the waitlist who can be promoted
            database.get(
                'SELECT * FROM waitlist WHERE class_id = ? ORDER BY position LIMIT 1',
                [classId],
                (err, waitlistRow) => {
                    if (err) {
                        console.error('Error checking waitlist:', err);
                    } else if (waitlistRow) {
                        // Promote first person from waitlist to booking
                        database.run(
                            'INSERT INTO bookings (user_id, class_id) VALUES (?, ?)',
                            [waitlistRow.user_id, classId],
                            function(err) {
                                if (!err) {
                                    // Remove from waitlist
                                    database.run(
                                        'DELETE FROM waitlist WHERE id = ?',
                                        [waitlistRow.id],
                                        (err) => {
                                            if (!err) {
                                                // Update positions for remaining waitlist
                                                database.run(
                                                    'UPDATE waitlist SET position = position - 1 WHERE class_id = ? AND position > ?',
                                                    [classId, waitlistRow.position]
                                                );
                                            }
                                        }
                                    );
                                }
                            }
                        );
                    }
                }
            );

            res.json({
                success: true,
                message: 'Reserva cancelada exitosamente'
            });
        }
    );
});

// Cancel waitlist entry
router.delete('/waitlist/:userId/:classId', (req, res) => {
    const { userId, classId } = req.params;
    const database = db.getDb();
    
    // First get the waitlist entry to know its position
    database.get(
        'SELECT * FROM waitlist WHERE user_id = ? AND class_id = ?',
        [userId, classId],
        (err, waitlistRow) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Error en la base de datos'
                });
            }

            if (!waitlistRow) {
                return res.status(404).json({
                    success: false,
                    message: 'No estás en la lista de espera para esta clase'
                });
            }

            // Remove from waitlist
            database.run(
                'DELETE FROM waitlist WHERE user_id = ? AND class_id = ?',
                [userId, classId],
                function(err) {
                    if (err) {
                        console.error('Database error:', err);
                        return res.status(500).json({
                            success: false,
                            message: 'Error al salir de la lista de espera'
                        });
                    }

                    if (this.changes === 0) {
                        return res.status(404).json({
                            success: false,
                            message: 'No estás en la lista de espera para esta clase'
                        });
                    }

                    // Update positions for remaining waitlist entries
                    database.run(
                        'UPDATE waitlist SET position = position - 1 WHERE class_id = ? AND position > ?',
                        [classId, waitlistRow.position],
                        (err) => {
                            if (err) {
                                console.error('Error updating positions:', err);
                            }
                        }
                    );

                    res.json({
                        success: true,
                        message: 'Saliste de la lista de espera exitosamente'
                    });
                }
            );
        }
    );
});

module.exports = router;