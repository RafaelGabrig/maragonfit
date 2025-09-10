const express = require('express');
const cors = require('cors');
const path = require('path');
const bodyParser = require('body-parser');
const db = require('./database/database');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, '../public')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/classes', require('./routes/classes'));
app.use('/api/bookings', require('./routes/bookings'));

// Serve the main page for all other routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        success: false, 
        message: 'Error interno del servidor' 
    });
});

// Initialize database and start server
db.init().then(() => {
    app.listen(PORT, () => {
        console.log(`🚀 Servidor MaragonFit iniciado en http://localhost:${PORT}`);
        console.log('� ¡MaragonFit está listo para entrenar!');
        console.log('🏋️ ¡Listo para gestionar reservas de clases!');
    });
}).catch(err => {
    console.error('❌ Error al inicializar la base de datos:', err);
    process.exit(1);
});

module.exports = app;
