const express = require('express');
const router = express.Router();
const db = require('../database/database');

// Register user
router.post('/register', (req, res) => {
    const { name, phone } = req.body;

    if (!phone) {
        return res.status(400).json({
            success: false,
            message: 'Teléfono es requerido'
        });
    }

    const database = db.getDb();
    
    // Check if user already exists
    database.get(
        'SELECT * FROM users WHERE phone = ?',
        [phone],
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
                    message: 'Ya existe una cuenta con este número de teléfono'
                });
            }

            // Create new user
            database.run(
                'INSERT INTO users (name, phone) VALUES (?, ?)',
                [name || null, phone],
                function(err) {
                    if (err) {
                        console.error('Database error:', err);
                        return res.status(500).json({
                            success: false,
                            message: 'Error al crear la cuenta'
                        });
                    }

                    const newUser = {
                        id: this.lastID,
                        name: name || phone,
                        phone
                    };

                    res.status(201).json({
                        success: true,
                        message: 'Cuenta creada exitosamente',
                        user: newUser
                    });
                }
            );
        }
    );
});

// Login user
router.post('/login', (req, res) => {
    const { phone } = req.body;

    if (!phone) {
        return res.status(400).json({
            success: false,
            message: 'Número de teléfono es requerido'
        });
    }

    const database = db.getDb();
    
    database.get(
        'SELECT * FROM users WHERE phone = ?',
        [phone],
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
                    message: 'No se encontró una cuenta con este número de teléfono'
                });
            }

            const user = {
                id: row.id,
                name: row.name,
                phone: row.phone
            };

            res.json({
                success: true,
                message: 'Inicio de sesión exitoso',
                user
            });
        }
    );
});

module.exports = router;
