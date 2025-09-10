const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'maragonfit.db');
let db;

const init = () => {
    return new Promise((resolve, reject) => {
        db = new sqlite3.Database(dbPath, (err) => {
            if (err) {
                console.error('Error opening database:', err.message);
                reject(err);
                return;
            }
            console.log('✅ Conectado a la base de datos SQLite');
            
            // Create tables
            createTables()
                .then(() => {
                    console.log('✅ Tablas de base de datos inicializadas');
                    resolve();
                })
                .catch(reject);
        });
    });
};

const createTables = () => {
    return new Promise((resolve, reject) => {
        const queries = [
            // Users table
            `CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT,
                phone TEXT UNIQUE NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`,
            
            // Classes table
            `CREATE TABLE IF NOT EXISTS classes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                instructor TEXT NOT NULL,
                description TEXT NOT NULL,
                day TEXT NOT NULL,
                time TEXT NOT NULL,
                max_capacity INTEGER DEFAULT 10,
                next_class_date DATETIME,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`,
            
            // Bookings table
            `CREATE TABLE IF NOT EXISTS bookings (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                class_id INTEGER NOT NULL,
                booking_date DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id),
                FOREIGN KEY (class_id) REFERENCES classes (id),
                UNIQUE(user_id, class_id)
            )`,

            // Waitlist table
            `CREATE TABLE IF NOT EXISTS waitlist (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                class_id INTEGER NOT NULL,
                waitlist_date DATETIME DEFAULT CURRENT_TIMESTAMP,
                position INTEGER,
                FOREIGN KEY (user_id) REFERENCES users (id),
                FOREIGN KEY (class_id) REFERENCES classes (id),
                UNIQUE(user_id, class_id)
            )`
        ];

        let completed = 0;
        const total = queries.length;

        queries.forEach((query) => {
            db.run(query, (err) => {
                if (err) {
                    console.error('Error creating table:', err.message);
                    reject(err);
                    return;
                }
                
                completed++;
                if (completed === total) {
                    // Insert sample data
                    insertSampleData()
                        .then(resolve)
                        .catch(reject);
                }
            });
        });
    });
};

const insertSampleData = () => {
    return new Promise((resolve, reject) => {
        // Check if we already have data
        db.get("SELECT COUNT(*) as count FROM classes", (err, row) => {
            if (err) {
                reject(err);
                return;
            }

            if (row.count > 0) {
                resolve(); // Data already exists
                return;
            }

            // Helper function to get next occurrence of a day
            const getNextClassDate = (dayName, time) => {
                const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
                const dayIndex = days.indexOf(dayName);
                const now = new Date();
                const [hours, minutes] = time.split(':');
                
                // Find next occurrence of this day
                let nextDate = new Date();
                nextDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
                
                // If today is the same day but time has passed, or different day
                while (nextDate.getDay() !== dayIndex || nextDate <= now) {
                    nextDate.setDate(nextDate.getDate() + 1);
                    nextDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
                }
                
                return nextDate.toISOString();
            };

            // Insert sample classes
            const sampleClasses = [
                {
                    name: 'Yoga Matutino',
                    instructor: 'Ana García',
                    description: 'Sesión de yoga relajante para comenzar el día con energía positiva',
                    day: 'Lunes',
                    time: '07:00',
                    maxCapacity: 15
                },
                {
                    name: 'CrossFit Intensivo',
                    instructor: 'Carlos Ruiz',
                    description: 'Entrenamiento de alta intensidad para mejorar fuerza y resistencia',
                    day: 'Martes',
                    time: '18:00',
                    maxCapacity: 12
                },
                {
                    name: 'Pilates',
                    instructor: 'María López',
                    description: 'Ejercicios de bajo impacto para fortalecer el core y mejorar la flexibilidad',
                    day: 'Miércoles',
                    time: '10:00',
                    maxCapacity: 20
                },
                {
                    name: 'Spinning',
                    instructor: 'David Martín',
                    description: 'Clase de ciclismo indoor con música motivacional',
                    day: 'Jueves',
                    time: '19:00',
                    maxCapacity: 25
                },
                {
                    name: 'Zumba',
                    instructor: 'Laura Hernández',
                    description: 'Baile fitness divertido con ritmos latinos',
                    day: 'Viernes',
                    time: '20:00',
                    maxCapacity: 30
                },
                {
                    name: 'Aqua Aeróbicos',
                    instructor: 'Pedro Sánchez',
                    description: 'Ejercicios aeróbicos en agua, ideales para todas las edades',
                    day: 'Sábado',
                    time: '11:00',
                    maxCapacity: 18
                },
                // Clases de prueba para demostrar la regla de 24h
                {
                    name: 'Clase de Prueba - Mañana',
                    instructor: 'Instructor Test',
                    description: 'Clase que será mañana para probar la regla de 24h',
                    day: 'Manual',
                    time: '10:00',
                    maxCapacity: 3,
                    customDate: new Date(Date.now() + 25 * 60 * 60 * 1000) // 25 horas desde ahora
                },
                {
                    name: 'Clase de Prueba - Dentro de 12h',
                    instructor: 'Instructor Test',
                    description: 'Clase disponible para reservar (menos de 24h)',
                    day: 'Manual',
                    time: '14:00',
                    maxCapacity: 2,
                    customDate: new Date(Date.now() + 12 * 60 * 60 * 1000) // 12 horas desde ahora
                }
            ];

            let inserted = 0;
            const total = sampleClasses.length;

            sampleClasses.forEach((cls) => {
                let nextClassDate;
                
                if (cls.customDate) {
                    // Use custom date for test classes
                    nextClassDate = cls.customDate.toISOString();
                } else {
                    // Calculate normal recurring class date
                    nextClassDate = getNextClassDate(cls.day, cls.time);
                }
                
                db.run(
                    `INSERT INTO classes (name, instructor, description, day, time, max_capacity, next_class_date) VALUES (?, ?, ?, ?, ?, ?, ?)`,
                    [cls.name, cls.instructor, cls.description, cls.day, cls.time, cls.maxCapacity, nextClassDate],
                    (err) => {
                        if (err) {
                            console.error('Error inserting sample class:', err.message);
                            reject(err);
                            return;
                        }
                        
                        inserted++;
                        if (inserted === total) {
                            console.log('✅ Datos de ejemplo insertados con fechas calculadas');
                            resolve();
                        }
                    }
                );
            });
        });
    });
};

const getDb = () => {
    return db;
};

const close = () => {
    return new Promise((resolve, reject) => {
        if (db) {
            db.close((err) => {
                if (err) {
                    reject(err);
                } else {
                    console.log('✅ Conexión a base de datos cerrada');
                    resolve();
                }
            });
        } else {
            resolve();
        }
    });
};

module.exports = {
    init,
    getDb,
    close
};
