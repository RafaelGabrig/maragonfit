# 🏋️‍♂️ MaragonFit - Sistema de Gestión de Gimnasio

Sistema completo de gestión para gimnasios con reservas de clases, panel administrativo y diseño responsive optimizado para móviles.

## 🌟 Características

### 🎯 **Para Usuarios**
- ✅ Registro y autenticación de usuarios
- 📅 Visualización de clases disponibles
- 🎫 Sistema de reservas en tiempo real
- 📊 Visualización de vagas disponibles por clase
- ⏰ Reservas habilitadas solo en las últimas 24 horas
- 📋 Lista de espera automática cuando las clases están llenas
- 📱 Diseño completamente responsive (mobile-first)

### 🛠️ **Para Administradores**
- 👨‍💼 Panel de administración completo
- ➕ Creación y gestión de clases
- 📈 Visualización de reservas y estadísticas
- 👥 Gestión de lista de espera
- 🗑️ Eliminación de clases
- 📊 Control de capacidad por clase

### 💻 **Técnicas**
- 📱 Diseño responsive (< 440px optimizado)
- 🎨 Interfaz moderna con Tailwind CSS
- 🚀 Backend robusto con Node.js + Express
- 💾 Base de datos SQLite integrada
- 🔒 Sistema de autenticación seguro
- 📡 API RESTful completa

## 🚀 Instalación

### Prerrequisitos
- Node.js (v14 o superior)
- npm o yarn

### Pasos de instalación

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/tu-usuario/maragonfit.git
   cd maragonfit
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Iniciar el servidor:**
   ```bash
   npm start
   ```

4. **Acceder a la aplicación:**
   - Navegador: `http://localhost:3000`
   - Móvil (misma red): `http://[tu-ip]:3000`

## 📁 Estructura del Proyecto

```
maragonfit/
├── public/                 # Frontend
│   ├── assets/
│   │   └── images/        # Logos y recursos
│   ├── js/
│   │   └── app.js         # JavaScript principal
│   └── index.html         # Interfaz principal
├── server/                # Backend
│   ├── database/
│   │   └── database.js    # Configuración SQLite
│   ├── routes/
│   │   ├── auth.js        # Autenticación
│   │   └── classes.js     # Gestión de clases
│   └── app.js             # Servidor Express
├── package.json
└── README.md
```

## 🎮 Uso

### 👤 **Para Usuarios**

1. **Registro:** Crear cuenta con teléfono y contraseña
2. **Login:** Acceder al dashboard personal
3. **Explorar Clases:** Ver clases disponibles y vagas restantes
4. **Reservar:** Hacer reservas en las últimas 24h antes de la clase
5. **Lista de Espera:** Unirse automáticamente si la clase está llena

### 👨‍💼 **Para Administradores**

1. **Acceso Admin:** Click en el botón de administración
2. **Login Admin:** Usar credenciales administrativas
3. **Crear Clases:** Agregar nuevas clases con horarios
4. **Gestionar:** Ver reservas y eliminar clases si necesario

## 🛠️ Tecnologías Utilizadas

### Frontend
- **HTML5** - Estructura semántica
- **Tailwind CSS** - Framework de estilos utilitarios
- **JavaScript ES6+** - Funcionalidad interactiva
- **Font Awesome** - Iconografía

### Backend
- **Node.js** - Runtime de JavaScript
- **Express.js** - Framework web
- **SQLite** - Base de datos embebida
- **CORS** - Política de origen cruzado

## 📱 Responsive Design

El sistema está optimizado para todos los dispositivos:

- **📱 Mobile (< 440px):** Layout optimizado para móviles
- **📟 Tablet (440px - 768px):** Diseño adaptativo
- **💻 Desktop (> 768px):** Experiencia completa

### Media Queries Implementadas:
- `@media (max-width: 440px)` - Móviles
- `@media (max-width: 375px)` - Móviles pequeños  
- `@media (max-width: 320px)` - Móviles muy pequeños

## 🗄️ Base de Datos

### Tablas:
- **users** - Información de usuarios
- **classes** - Clases del gimnasio
- **bookings** - Reservas realizadas
- **waitlist** - Lista de espera

## 🔧 Configuración

### Variables de Entorno (opcional):
```bash
PORT=3000              # Puerto del servidor
DB_PATH=./database/    # Ruta de la base de datos
```

### Configuración del Servidor:
- Puerto por defecto: **3000**
- Base de datos: **SQLite** (se crea automáticamente)
- Archivos estáticos: Servidos desde `/public`

## 🚦 API Endpoints

### Autenticación
- `POST /api/auth/register` - Registro de usuarios
- `POST /api/auth/login` - Inicio de sesión

### Clases
- `GET /api/classes` - Obtener todas las clases
- `POST /api/classes` - Crear nueva clase (admin)
- `DELETE /api/classes/:id` - Eliminar clase (admin)

### Reservas
- `POST /api/classes/:id/book` - Reservar clase
- `DELETE /api/classes/:id/cancel` - Cancelar reserva
- `POST /api/classes/:id/waitlist` - Unirse a lista de espera
- `DELETE /api/classes/:id/waitlist` - Salir de lista de espera

## 🎨 Características de Diseño

- **🎨 Marca Visual:** Logo MaragonFit integrado
- **🌈 Paleta de Colores:** Negro, azul y gradientes
- **📱 Mobile-First:** Diseñado primero para móviles
- **⚡ Animaciones:** Transiciones suaves
- **🎯 UX Intuitiva:** Interfaz fácil de usar

## 🔒 Seguridad

- Validación de datos en frontend y backend
- Protección contra inyección SQL
- Manejo seguro de sesiones
- Validación de capacidad de clases

## 🐛 Troubleshooting

### Problemas Comunes:

1. **Puerto en uso:**
   ```bash
   # Windows
   taskkill /F /IM node.exe
   
   # Linux/Mac
   pkill node
   ```

2. **Base de datos corrupta:**
   ```bash
   # Eliminar y recrear
   rm server/database/*.db
   npm start
   ```

3. **Problemas de responsive:**
   - Verificar meta viewport en HTML
   - Limpiar caché del navegador

## 📈 Futuras Mejoras

- [ ] Sistema de pagos integrado
- [ ] Notificaciones push
- [ ] Calendario avanzado
- [ ] Métricas y analytics
- [ ] App móvil nativa
- [ ] Integración con redes sociales

## 🤝 Contribución

1. Fork el proyecto
2. Crear rama para feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit los cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abrir Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

## 👨‍💻 Autor

Desarrollado con ❤️ para MaragonFit Gym

---

**¡Entrena duro, reserva fácil! 💪🏋️‍♂️**
