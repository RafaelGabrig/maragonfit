// MaragonFit - Demo Version for Netlify
class MaragonFitDemo {
    constructor() {
        this.currentUser = null;
        this.currentView = 'auth';
        this.demoMode = true;
        this.classes = this.getDemoClasses();
        this.init();
    }

    getDemoClasses() {
        return [
            {
                id: 1,
                name: "CrossFit Intenso",
                instructor: "Carlos Rodriguez",
                day: "Lunes",
                time: "07:00",
                description: "Entrenamiento funcional de alta intensidad",
                max_capacity: 15,
                currentBookings: 8,
                canReserve: true,
                hoursUntilClass: 12,
                nextClassDate: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
                isBooked: false,
                isWaitlisted: false,
                isFull: false
            },
            {
                id: 2,
                name: "Yoga Matutino",
                instructor: "Ana García",
                day: "Martes",
                time: "08:00",
                description: "Clase de yoga para empezar el día con energía",
                max_capacity: 20,
                currentBookings: 12,
                canReserve: true,
                hoursUntilClass: 18,
                nextClassDate: new Date(Date.now() + 18 * 60 * 60 * 1000).toISOString(),
                isBooked: false,
                isWaitlisted: false,
                isFull: false
            },
            {
                id: 3,
                name: "Spinning",
                instructor: "Miguel Torres",
                day: "Miércoles",
                time: "19:00",
                description: "Cardio intenso sobre bicicleta estática",
                max_capacity: 12,
                currentBookings: 12,
                canReserve: true,
                hoursUntilClass: 6,
                nextClassDate: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
                isBooked: false,
                isWaitlisted: false,
                isFull: true
            },
            {
                id: 4,
                name: "Pilates",
                instructor: "Laura Martínez",
                day: "Jueves",
                time: "10:00",
                description: "Fortalecimiento del core y flexibilidad",
                max_capacity: 10,
                currentBookings: 3,
                canReserve: true,
                hoursUntilClass: 22,
                nextClassDate: new Date(Date.now() + 22 * 60 * 60 * 1000).toISOString(),
                isBooked: false,
                isWaitlisted: false,
                isFull: false
            }
        ];
    }

    init() {
        this.bindEvents();
        this.checkAuthStatus();
        this.showDemoMessage();
    }

    showDemoMessage() {
        // Show demo banner
        const banner = document.createElement('div');
        banner.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-align: center;
            padding: 10px;
            z-index: 10000;
            font-size: 14px;
            font-weight: bold;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        `;
        banner.innerHTML = `
            🚀 DEMO - MaragonFit en Netlify | 
            Usuario demo: <strong>demo@maragonfit.com</strong> | 
            Contraseña: <strong>demo123</strong> |
            <span style="font-size: 12px; opacity: 0.9;">Backend simulado para demostración</span>
        `;
        document.body.insertBefore(banner, document.body.firstChild);
        document.body.style.paddingTop = '60px';
    }

    bindEvents() {
        // Auth tabs
        document.getElementById('loginTab')?.addEventListener('click', () => this.showLogin());
        document.getElementById('registerTab')?.addEventListener('click', () => this.showRegister());

        // Forms
        document.getElementById('loginForm')?.addEventListener('submit', (e) => this.handleLogin(e));
        document.getElementById('registerForm')?.addEventListener('submit', (e) => this.handleRegister(e));
        document.getElementById('addClassForm')?.addEventListener('submit', (e) => this.handleAddClass(e));
        document.getElementById('adminLoginForm')?.addEventListener('submit', (e) => this.handleAdminLogin(e));

        // Buttons
        document.getElementById('logoutBtn')?.addEventListener('click', () => this.logout());
        document.getElementById('adminAccessBtn')?.addEventListener('click', () => this.showAdminLoginModal());
        document.getElementById('cancelAdminLogin')?.addEventListener('click', () => this.hideAdminLoginModal());

        // Close modal when clicking outside
        document.getElementById('adminLoginModal')?.addEventListener('click', (e) => {
            if (e.target.id === 'adminLoginModal') {
                this.hideAdminLoginModal();
            }
        });

        // Close modal with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !document.getElementById('adminLoginModal')?.classList.contains('hidden')) {
                this.hideAdminLoginModal();
            }
        });
    }

    // UI Methods
    showLogin() {
        document.getElementById('loginTab').className = 'flex-1 py-3 px-6 rounded-md font-bold transition-colors bg-black text-white shadow-lg';
        document.getElementById('registerTab').className = 'flex-1 py-3 px-6 rounded-md font-bold transition-colors text-gray-600 hover:text-black hover:bg-gray-100';
        
        document.getElementById('loginForm').classList.remove('hidden');
        document.getElementById('registerForm').classList.add('hidden');
    }

    showRegister() {
        document.getElementById('registerTab').className = 'flex-1 py-3 px-6 rounded-md font-bold transition-colors bg-black text-white shadow-lg';
        document.getElementById('loginTab').className = 'flex-1 py-3 px-6 rounded-md font-bold transition-colors text-gray-600 hover:text-black hover:bg-gray-100';
        
        document.getElementById('registerForm').classList.remove('hidden');
        document.getElementById('loginForm').classList.add('hidden');
    }

    showUserDashboard() {
        document.getElementById('homePage').style.display = 'none';
        document.getElementById('userDashboard').classList.remove('hidden');
        document.getElementById('adminPanel').classList.add('hidden');
        document.getElementById('userMenu').classList.remove('hidden');
        this.loadUserClasses();
    }

    showAdminPanel() {
        document.getElementById('homePage').style.display = 'none';
        document.getElementById('userDashboard').classList.add('hidden');
        document.getElementById('adminPanel').classList.remove('hidden');
        document.getElementById('userMenu').classList.remove('hidden');
        this.loadAdminClasses();
    }

    showAdminLoginModal() {
        document.getElementById('adminLoginModal').classList.remove('hidden');
    }

    hideAdminLoginModal() {
        document.getElementById('adminLoginModal').classList.add('hidden');
    }

    // Demo Authentication
    async handleLogin(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const phone = formData.get('phone');
        const password = formData.get('password');

        // Demo validation
        if ((phone === 'demo@maragonfit.com' || phone === 'demo') && password === 'demo123') {
            this.currentUser = {
                id: 1,
                name: 'Usuario Demo',
                phone: phone,
                role: 'user'
            };
            this.showMessage('¡Bienvenido a MaragonFit Demo!', 'success');
            this.showUserDashboard();
        } else {
            this.showMessage('Demo: Usa demo@maragonfit.com / demo123', 'error');
        }
    }

    async handleRegister(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const name = formData.get('name');
        const phone = formData.get('phone');
        const password = formData.get('password');

        if (name && phone && password) {
            this.currentUser = {
                id: Math.floor(Math.random() * 1000),
                name: name,
                phone: phone,
                role: 'user'
            };
            this.showMessage('¡Registro exitoso en modo demo!', 'success');
            this.showUserDashboard();
        } else {
            this.showMessage('Por favor completa todos los campos', 'error');
        }
    }

    async handleAdminLogin(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const username = formData.get('adminUsername');
        const password = formData.get('adminPassword');

        if (username === 'admin' && password === 'admin123') {
            this.currentUser = {
                id: 999,
                name: 'Administrador Demo',
                phone: 'admin',
                role: 'admin'
            };
            this.hideAdminLoginModal();
            this.showMessage('¡Acceso administrativo concedido!', 'success');
            this.showAdminPanel();
        } else {
            this.showMessage('Demo Admin: admin / admin123', 'error');
        }
    }

    checkAuthStatus() {
        // Demo: Check if user was previously logged in
        const savedUser = localStorage.getItem('maragonfit_demo_user');
        if (savedUser) {
            this.currentUser = JSON.parse(savedUser);
            if (this.currentUser.role === 'admin') {
                this.showAdminPanel();
            } else {
                this.showUserDashboard();
            }
        }
    }

    logout() {
        this.currentUser = null;
        localStorage.removeItem('maragonfit_demo_user');
        document.getElementById('homePage').style.display = 'block';
        document.getElementById('userDashboard').classList.add('hidden');
        document.getElementById('adminPanel').classList.add('hidden');
        document.getElementById('userMenu').classList.add('hidden');
        this.showMessage('Sesión cerrada', 'success');
    }

    // Classes Methods
    async loadUserClasses() {
        this.renderUserClasses(this.classes);
    }

    async loadAdminClasses() {
        this.renderAdminClasses(this.classes);
    }

    renderUserClasses(classes) {
        const container = document.getElementById('classesList');
        
        if (!container) return;

        if (classes.length === 0) {
            container.innerHTML = `
                <div class="bg-white rounded-lg shadow-lg p-6 text-center">
                    <i class="fas fa-calendar-times text-gray-400 text-4xl mb-4"></i>
                    <h3 class="text-lg font-bold text-gray-600 mb-2">No hay clases disponibles</h3>
                    <p class="text-gray-500">Vuelve pronto para ver nuevas clases</p>
                </div>
            `;
            return;
        }

        const formatDate = (dateString) => {
            const date = new Date(dateString);
            const options = { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            };
            return date.toLocaleDateString('es-ES', options);
        };

        container.innerHTML = classes.map(cls => {
            const canReserve = cls.canReserve;
            const hoursUntil = cls.hoursUntilClass;
            const nextClassFormatted = cls.nextClassDate ? formatDate(cls.nextClassDate) : 'Fecha por confirmar';
            
            let statusMessage = '';
            let statusClass = '';
            
            if (hoursUntil <= 0) {
                statusMessage = 'Clase finalizada';
                statusClass = 'border-gray-400';
            } else if (hoursUntil > 24) {
                statusMessage = 'Muy pronto para reservar';
                statusClass = 'border-yellow-500';
            } else {
                statusMessage = 'Disponible para reservar';
                statusClass = 'border-green-500';
            }
            
            return `
            <div class="bg-white rounded-lg shadow-lg p-6 border-l-4 ${statusClass}">
                <div class="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div class="mb-4 md:mb-0 flex-1">
                        <div class="flex items-center mb-3">
                            <div class="bg-black p-2 rounded-lg mr-3">
                                <img src="assets/images/logofit.jpeg" alt="MaragonFit Logo" class="h-6 w-6 object-contain rounded">
                            </div>
                            <div>
                                <div class="flex items-center gap-2">
                                    <h3 class="text-xl font-bold text-dark">${cls.name}</h3>
                                    <div class="flex items-center gap-2">
                                        ${cls.isBooked ? 
                                            '<div class="flex items-center bg-green-100 text-green-800 px-2 py-1 rounded-full"><i class="fas fa-check text-green-600 mr-1"></i><span class="text-xs font-medium">Reservada</span></div>' : 
                                            cls.isWaitlisted ?
                                            '<div class="flex items-center bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full"><i class="fas fa-clock text-yellow-600 mr-1"></i><span class="text-xs font-medium">En espera</span></div>' :
                                            ''
                                        }
                                        <div class="flex items-center ${(cls.currentBookings || 0) >= (cls.max_capacity || 10) ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'} px-2 py-1 rounded-full">
                                            <i class="fas fa-users mr-1 text-xs"></i>
                                            <span class="text-xs font-medium">${cls.currentBookings || 0}/${cls.max_capacity || 10}</span>
                                        </div>
                                    </div>
                                </div>
                                ${hoursUntil <= 0 ? 
                                    '<span class="bg-gray-100 text-gray-800 text-xs font-medium px-2 py-1 rounded-full">Finalizada</span>' : 
                                    canReserve ? 
                                        '<span class="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">Disponible</span>' : 
                                        '<span class="bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-1 rounded-full">Muy pronto</span>'
                                }
                            </div>
                        </div>
                        <div class="space-y-1 text-gray-600 ml-11">
                            <p><i class="fas fa-user mr-2"></i>Instructor: ${cls.instructor}</p>
                            <p><i class="fas fa-calendar mr-2"></i>Próxima clase: ${nextClassFormatted}</p>
                            <p><i class="fas fa-clock mr-2"></i>Faltan ${hoursUntil} horas</p>
                            <p><i class="fas fa-users mr-2"></i>Capacidad: ${cls.currentBookings || 0}/${cls.max_capacity || 10} 
                                <span class="text-sm font-medium ${(cls.currentBookings || 0) >= (cls.max_capacity || 10) ? 'text-red-600' : 'text-green-600'}">
                                    (${Math.max(0, (cls.max_capacity || 10) - (cls.currentBookings || 0))} vagas disponibles)
                                </span>
                            </p>
                            <p><i class="fas fa-info-circle mr-2"></i>${cls.description}</p>
                            ${!canReserve && hoursUntil > 0 ? 
                                '<p class="text-yellow-600 text-sm font-medium"><i class="fas fa-hourglass-half mr-2"></i>Reservas solo en las últimas 24h</p>' : 
                                hoursUntil <= 0 ? 
                                    '<p class="text-gray-600 text-sm font-medium"><i class="fas fa-clock mr-2"></i>Clase no disponible</p>' : 
                                    '<p class="text-green-600 text-sm font-medium"><i class="fas fa-check-circle mr-2"></i>¡Puedes reservar ahora!</p>'
                            }
                        </div>
                    </div>
                    <div class="flex flex-col space-y-2">
                        ${cls.isBooked ? 
                            '<button class="bg-green-500 text-white font-bold py-3 px-6 rounded-lg shadow-lg cursor-default"><i class="fas fa-check mr-2"></i>Reservada</button>' :
                            cls.isWaitlisted ?
                            '<button class="bg-yellow-500 text-white font-bold py-3 px-6 rounded-lg shadow-lg cursor-default"><i class="fas fa-clock mr-2"></i>En Espera</button>' :
                            cls.isFull ?
                            `<button onclick="app.bookClass(${cls.id})" class="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-lg transition-colors shadow-lg ${canReserve ? '' : 'opacity-50 cursor-not-allowed'}" ${canReserve ? '' : 'disabled'}>
                                <i class="fas fa-hourglass-half mr-2"></i>Unirse a Lista de Espera
                            </button>` :
                            `<button onclick="app.bookClass(${cls.id})" class="bg-black hover:bg-gray-800 text-white font-bold py-3 px-6 rounded-lg transition-colors shadow-lg ${canReserve ? '' : 'opacity-50 cursor-not-allowed'}" ${canReserve ? '' : 'disabled'}>
                                <i class="fas fa-calendar-plus mr-2"></i>Reservar
                            </button>`
                        }
                        ${cls.isBooked ? 
                            `<button onclick="app.cancelBooking(${cls.id})" class="bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-lg transition-colors shadow-lg">
                                <i class="fas fa-calendar-minus mr-2"></i>Cancelar
                            </button>` : 
                            cls.isWaitlisted ?
                            `<button onclick="app.cancelWaitlist(${cls.id})" class="bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-lg transition-colors shadow-lg">
                                <i class="fas fa-times mr-2"></i>Salir de Espera
                            </button>` :
                            ''
                        }
                    </div>
                </div>
            </div>
            `;
        }).join('');
    }

    renderAdminClasses(classes) {
        const container = document.getElementById('adminClassesList');
        
        if (!container) return;

        if (classes.length === 0) {
            container.innerHTML = `
                <div class="bg-white rounded-lg shadow-lg p-6 text-center">
                    <i class="fas fa-calendar-times text-gray-400 text-4xl mb-4"></i>
                    <h3 class="text-lg font-bold text-gray-600 mb-2">No hay clases creadas</h3>
                    <p class="text-gray-500">Crea la primera clase usando el formulario de arriba</p>
                </div>
            `;
            return;
        }

        container.innerHTML = classes.map(cls => `
            <div class="bg-white rounded-lg shadow-lg p-6 border-l-4 border-black">
                <div class="flex flex-col md:flex-row md:items-start md:justify-between">
                    <div class="mb-4 md:mb-0 flex-1">
                        <div class="flex items-center mb-3">
                            <div class="bg-black p-2 rounded-lg mr-3">
                                <img src="assets/images/logofit.jpeg" alt="MaragonFit Logo" class="h-6 w-6 object-contain rounded">
                            </div>
                            <h3 class="text-xl font-bold text-dark">${cls.name}</h3>
                        </div>
                        <div class="space-y-2 text-gray-600">
                            <p><i class="fas fa-user mr-2"></i><strong>Instructor:</strong> ${cls.instructor}</p>
                            <p><i class="fas fa-calendar mr-2"></i><strong>Día:</strong> ${cls.day}</p>
                            <p><i class="fas fa-clock mr-2"></i><strong>Hora:</strong> ${cls.time}</p>
                            <p><i class="fas fa-users mr-2"></i><strong>Capacidad:</strong> ${cls.currentBookings || 0}/${cls.max_capacity}</p>
                            <p><i class="fas fa-info-circle mr-2"></i><strong>Descripción:</strong> ${cls.description}</p>
                        </div>
                    </div>
                    <div class="flex flex-col space-y-2">
                        <div class="text-center p-3 bg-gray-50 rounded-lg">
                            <p class="text-2xl font-bold text-blue-600">${cls.currentBookings || 0}</p>
                            <p class="text-sm text-gray-600">Reservas</p>
                        </div>
                        <button onclick="app.deleteClass(${cls.id})" class="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                            <i class="fas fa-trash mr-2"></i>Eliminar
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    // Demo booking methods
    bookClass(classId) {
        const cls = this.classes.find(c => c.id === classId);
        if (cls) {
            if (cls.isFull) {
                cls.isWaitlisted = true;
                this.showMessage('Te has unido a la lista de espera', 'success');
            } else {
                cls.isBooked = true;
                cls.currentBookings++;
                if (cls.currentBookings >= cls.max_capacity) {
                    cls.isFull = true;
                }
                this.showMessage('¡Clase reservada exitosamente!', 'success');
            }
            this.loadUserClasses();
            this.saveUserState();
        }
    }

    cancelBooking(classId) {
        const cls = this.classes.find(c => c.id === classId);
        if (cls) {
            cls.isBooked = false;
            cls.currentBookings = Math.max(0, cls.currentBookings - 1);
            cls.isFull = false;
            this.showMessage('Reserva cancelada', 'success');
            this.loadUserClasses();
            this.saveUserState();
        }
    }

    cancelWaitlist(classId) {
        const cls = this.classes.find(c => c.id === classId);
        if (cls) {
            cls.isWaitlisted = false;
            this.showMessage('Saliste de la lista de espera', 'success');
            this.loadUserClasses();
            this.saveUserState();
        }
    }

    deleteClass(classId) {
        if (confirm('¿Estás seguro de que quieres eliminar esta clase?')) {
            this.classes = this.classes.filter(c => c.id !== classId);
            this.showMessage('Clase eliminada exitosamente', 'success');
            this.loadAdminClasses();
            this.saveUserState();
        }
    }

    handleAddClass(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        
        const newClass = {
            id: Math.max(...this.classes.map(c => c.id)) + 1,
            name: formData.get('name'),
            instructor: formData.get('instructor'),
            day: formData.get('day'),
            time: formData.get('time'),
            description: formData.get('description'),
            max_capacity: parseInt(formData.get('capacity')) || 10,
            currentBookings: 0,
            canReserve: true,
            hoursUntilClass: Math.floor(Math.random() * 48),
            nextClassDate: new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
            isBooked: false,
            isWaitlisted: false,
            isFull: false
        };

        this.classes.push(newClass);
        this.showMessage('Clase creada exitosamente', 'success');
        this.loadAdminClasses();
        this.saveUserState();
        e.target.reset();
    }

    saveUserState() {
        if (this.currentUser) {
            localStorage.setItem('maragonfit_demo_user', JSON.stringify(this.currentUser));
            localStorage.setItem('maragonfit_demo_classes', JSON.stringify(this.classes));
        }
    }

    showMessage(message, type = 'info') {
        // Remove existing messages
        const existingMessages = document.querySelectorAll('.demo-message');
        existingMessages.forEach(msg => msg.remove());

        const messageDiv = document.createElement('div');
        messageDiv.className = 'demo-message fixed top-20 right-4 p-4 rounded-lg shadow-lg z-50 transition-all duration-300';
        
        const colors = {
            success: 'bg-green-500 text-white',
            error: 'bg-red-500 text-white',
            info: 'bg-blue-500 text-white'
        };
        
        messageDiv.className += ` ${colors[type] || colors.info}`;
        messageDiv.textContent = message;
        
        document.body.appendChild(messageDiv);
        
        setTimeout(() => {
            messageDiv.style.opacity = '0';
            messageDiv.style.transform = 'translateX(100%)';
            setTimeout(() => messageDiv.remove(), 300);
        }, 3000);
    }
}

// Initialize the demo app
document.addEventListener('DOMContentLoaded', () => {
    window.app = new MaragonFitDemo();
});
