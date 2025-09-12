// MaragonFit - Frontend JavaScript
class MaragonFitApp {
    constructor() {
        this.currentUser = null;
        this.currentView = 'auth';
        this.apiUrl = window.location.hostname === 'localhost' ? 'http://localhost:3000/api' : '/api';
        this.refreshInterval = null;
        this.init();
    }

    init() {
        this.bindEvents();
        this.checkAuthStatus();
        // Removido loadClasses() para evitar conflitos
        // As aulas serão carregadas pelo checkAuthStatus ou quando o usuário fazer login
    }

    bindEvents() {
        // Auth tabs
        document.getElementById('loginTab').addEventListener('click', () => this.showLogin());
        document.getElementById('registerTab').addEventListener('click', () => this.showRegister());

        // Forms
        document.getElementById('loginForm').addEventListener('submit', (e) => this.handleLogin(e));
        document.getElementById('registerForm').addEventListener('submit', (e) => this.handleRegister(e));
        document.getElementById('addClassForm').addEventListener('submit', (e) => this.handleAddClass(e));
        document.getElementById('adminLoginForm').addEventListener('submit', (e) => this.handleAdminLogin(e));

        // Buttons
        document.getElementById('logoutBtn').addEventListener('click', () => this.logout());
        document.getElementById('adminAccessBtn').addEventListener('click', () => this.showAdminLoginModal());
        document.getElementById('cancelAdminLogin').addEventListener('click', () => this.hideAdminLoginModal());

        // Close modal when clicking outside
        document.getElementById('adminLoginModal').addEventListener('click', (e) => {
            if (e.target.id === 'adminLoginModal') {
                this.hideAdminLoginModal();
            }
        });

        // Close modal with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !document.getElementById('adminLoginModal').classList.contains('hidden')) {
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
        document.getElementById('authSection').classList.add('hidden');
        document.getElementById('adminPanel').classList.add('hidden');
        document.getElementById('userDashboard').classList.remove('hidden');
        document.getElementById('userMenu').classList.remove('hidden');
        this.currentView = 'user';
        localStorage.setItem('maragonfit_view', 'user');
        this.loadUserClasses();
    }

    showAdminPanel() {
        document.getElementById('authSection').classList.add('hidden');
        document.getElementById('userDashboard').classList.add('hidden');
        document.getElementById('adminPanel').classList.remove('hidden');
        document.getElementById('userMenu').classList.remove('hidden');
        this.currentView = 'admin';
        localStorage.setItem('maragonfit_view', 'admin');
        this.loadAdminClasses();
    }

    showAdminLoginModal() {
        const modal = document.getElementById('adminLoginModal');
        const modalContent = modal.querySelector('.bg-white');
        modal.classList.remove('hidden');
        modalContent.classList.add('modal-enter');
        
        // Clear form
        document.getElementById('adminUsername').value = '';
        document.getElementById('adminPassword').value = '';
        
        // Focus on username field
        setTimeout(() => {
            document.getElementById('adminUsername').focus();
        }, 100);
    }

    hideAdminLoginModal() {
        const modal = document.getElementById('adminLoginModal');
        const modalContent = modal.querySelector('.bg-white');
        modalContent.classList.remove('modal-enter');
        modal.classList.add('hidden');
    }

    async handleAdminLogin(e) {
        e.preventDefault();
        const username = document.getElementById('adminUsername').value;
        const password = document.getElementById('adminPassword').value;

        // Credenciales de administrador (hardcoded por seguridad local)
        const ADMIN_USERNAME = 'adm';
        const ADMIN_PASSWORD = 'maragonfitadm';

        if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
            this.hideAdminLoginModal();
            this.showAdminPanel();
            this.startAutoRefresh(); // Iniciar auto-refresh para admin
            this.showMessage('Acceso de administrador autorizado', 'success');
        } else {
            this.showMessage('Credenciales de administrador incorrectas', 'error');
            // Clear password field for security
            document.getElementById('adminPassword').value = '';
        }
    }

    showAuthSection() {
        document.getElementById('userDashboard').classList.add('hidden');
        document.getElementById('adminPanel').classList.add('hidden');
        document.getElementById('authSection').classList.remove('hidden');
        document.getElementById('userMenu').classList.add('hidden');
        this.currentView = 'auth';
    }

    // Authentication Methods
    async handleLogin(e) {
        e.preventDefault();
        const phone = document.getElementById('loginPhone').value;

        if (!phone) {
            this.showMessage('Por favor, ingresa tu número de teléfono', 'error');
            return;
        }

        this.showLoading(true);

        try {
            const response = await fetch(`${this.apiUrl}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone })
            });

            const data = await response.json();

            if (response.ok) {
                this.currentUser = data.user;
                localStorage.setItem('maragonfit_user', JSON.stringify(data.user));
                this.updateUserInfo();
                this.showUserDashboard();
                this.startAutoRefresh(); // Iniciar auto-refresh após login
                this.showMessage('¡Bienvenido de nuevo!', 'success');
            } else {
                this.showMessage(data.message || 'Error al iniciar sesión', 'error');
            }
        } catch (error) {
            console.error('Login error:', error);
            this.showMessage('Error de conexión', 'error');
        }

        this.showLoading(false);
    }

    async handleRegister(e) {
        e.preventDefault();
        const name = document.getElementById('registerName').value;
        const phone = document.getElementById('registerPhone').value;

        if (!name || !phone) {
            this.showMessage('Por favor, completa todos los campos', 'error');
            return;
        }

        this.showLoading(true);

        try {
            const response = await fetch(`${this.apiUrl}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, phone })
            });

            const data = await response.json();

            if (response.ok) {
                this.currentUser = data.user;
                localStorage.setItem('maragonfit_user', JSON.stringify(data.user));
                this.updateUserInfo();
                this.showUserDashboard();
                this.startAutoRefresh(); // Iniciar auto-refresh após registro
                this.showMessage('¡Cuenta creada exitosamente!', 'success');
            } else {
                this.showMessage(data.message || 'Error al crear la cuenta', 'error');
            }
        } catch (error) {
            console.error('Register error:', error);
            this.showMessage('Error de conexión', 'error');
        }

        this.showLoading(false);
    }

    logout() {
        this.currentUser = null;
        localStorage.removeItem('maragonfit_user');
        localStorage.removeItem('maragonfit_view'); // Limpar view salva
        
        // Parar auto-refresh
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
            this.refreshInterval = null;
        }
        
        this.hideAdminLoginModal(); // Cerrar modal si está abierto
        this.showAuthSection();
        this.showMessage('Sesión cerrada', 'success');
    }

    checkAuthStatus() {
        const storedUser = localStorage.getItem('maragonfit_user');
        const storedView = localStorage.getItem('maragonfit_view');
        
        // Se tem view admin salva, mostrar painel admin mesmo sem user
        if (storedView === 'admin') {
            this.showAdminPanel();
            this.startAutoRefresh();
            return;
        }
        
        // Caso contrário, verificar se há usuário logado
        if (storedUser) {
            this.currentUser = JSON.parse(storedUser);
            this.updateUserInfo();
            this.showUserDashboard();
            this.startAutoRefresh();
        } else {
            // Se não há usuário logado, carregar aulas para preview na tela de autenticação
            this.loadUserClasses();
        }
    }

    updateUserInfo() {
        if (this.currentUser) {
            document.getElementById('userName').textContent = this.currentUser.name;
            document.getElementById('userPhone').textContent = this.currentUser.phone;
        } else {
            // Para admin sem currentUser
            const userNameEl = document.getElementById('userName');
            const userPhoneEl = document.getElementById('userPhone');
            if (userNameEl) userNameEl.textContent = 'Administrador';
            if (userPhoneEl) userPhoneEl.textContent = 'Admin';
        }
    }

    startAutoRefresh() {
        // Limpar qualquer intervalo anterior
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
        }

        // Configurar auto-refresh a cada 30 segundos
        this.refreshInterval = setInterval(() => {
            const currentView = localStorage.getItem('maragonfit_view');
            
            // Recarregar dados baseado na view atual
            if (currentView === 'admin') {
                this.loadAdminClasses();
            } else if (this.currentUser) {
                this.loadUserClasses();
            }
        }, 30000); // 30 segundos
    }

    // Classes Methods
    async loadClasses() {
        try {
            const response = await fetch(`${this.apiUrl}/classes`);
            const data = await response.json();
            
            if (response.ok) {
                this.classes = data.classes;
            }
        } catch (error) {
            console.error('Error loading classes:', error);
        }
    }

    async loadUserClasses() {
        try {
            // Include user ID to get booking status
            const baseUrl = this.currentUser 
                ? `${this.apiUrl}/classes?userId=${this.currentUser.id}`
                : `${this.apiUrl}/classes`;
            
            // Add cache buster to ensure fresh data
            const separator = baseUrl.includes('?') ? '&' : '?';
            const url = `${baseUrl}${separator}t=${Date.now()}`;
            
            const response = await fetch(url);
            const data = await response.json();
            
            if (response.ok) {
                this.classes = data.classes; // Store classes for availability checking
                this.renderUserClasses(data.classes);
            }
        } catch (error) {
            console.error('Error loading user classes:', error);
            this.showMessage('Error al cargar las clases', 'error');
        }
    }

    async loadAdminClasses() {
        try {
            // Add cache buster to ensure fresh data
            const url = `${this.apiUrl}/classes?t=${Date.now()}`;
            const response = await fetch(url);
            const data = await response.json();
            
            if (response.ok) {
                this.renderAdminClasses(data.classes);
            }
        } catch (error) {
            console.error('Error loading admin classes:', error);
            this.showMessage('Error al cargar las clases', 'error');
        }
    }

    renderUserClasses(classes) {
        const container = document.getElementById('classesList');
        
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

        container.innerHTML = classes.map(cls => {
            const canReserve = cls.canReserve;
            const hoursUntil = cls.hoursUntilClass;
            
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
                                <div class="text-white text-lg font-bold" style="font-family: 'Arial', sans-serif; letter-spacing: -1px;">
                                    <span style="transform: skew(-15deg); display: inline-block;">M</span>
                                </div>
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
                            <p><i class="fas fa-calendar mr-2"></i>Horario: ${cls.day} - ${cls.time}</p>
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
                                <div class="text-white text-lg font-bold" style="font-family: 'Arial', sans-serif; letter-spacing: -1px;">
                                    <span style="transform: skew(-15deg); display: inline-block;">M</span>
                                </div>
                            </div>
                            <h3 class="text-xl font-bold text-dark">${cls.name}</h3>
                        </div>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-2 text-gray-600 ml-11">
                            <p><i class="fas fa-user mr-2"></i>Instructor: ${cls.instructor}</p>
                            <p><i class="fas fa-calendar mr-2"></i>${cls.day} - ${cls.time}</p>
                            <p><i class="fas fa-users mr-2"></i>Capacidad: ${cls.currentBookings || 0}/${cls.max_capacity || 10}</p>
                            <p class="md:col-span-2"><i class="fas fa-info-circle mr-2"></i>${cls.description}</p>
                        </div>
                        ${cls.currentBookings > 0 ? `
                            <div class="mt-4 ml-11">
                                <button onclick="app.viewClassBookings(${cls.id})" class="text-blue-600 hover:text-blue-800 text-sm font-medium mr-4">
                                    <i class="fas fa-list mr-1"></i>Ver reservas (${cls.currentBookings})
                                </button>
                                <button onclick="app.manageClassReservations(${cls.id})" class="text-green-600 hover:text-green-800 text-sm font-medium">
                                    <i class="fas fa-cog mr-1"></i>Gestionar
                                </button>
                            </div>
                        ` : `
                            <div class="mt-4 ml-11">
                                <button onclick="app.manageClassReservations(${cls.id})" class="text-green-600 hover:text-green-800 text-sm font-medium">
                                    <i class="fas fa-cog mr-1"></i>Gestionar Reservas
                                </button>
                            </div>
                        `}
                    </div>
                    <div class="flex flex-col space-y-2 md:ml-4">
                        <button onclick="app.editClass(${cls.id})" class="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 px-6 rounded-lg transition-colors shadow-lg">
                            <i class="fas fa-edit mr-2"></i>Editar
                        </button>
                        <button onclick="app.deleteClass(${cls.id})" class="bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-lg transition-colors shadow-lg">
                            <i class="fas fa-trash mr-2"></i>Eliminar
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    async handleAddClass(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const classData = {
            name: document.getElementById('className').value,
            instructor: document.getElementById('classInstructor').value,
            day: document.getElementById('classDay').value,
            time: document.getElementById('classTime').value,
            maxCapacity: parseInt(document.getElementById('classCapacity').value),
            description: document.getElementById('classDescription').value
        };

        this.showLoading(true);

        try {
            const response = await fetch(`${this.apiUrl}/classes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(classData)
            });

            const data = await response.json();

            if (response.ok) {
                this.showMessage('Clase creada exitosamente', 'success');
                e.target.reset();
                // Recarregar ambas as views para sincronizar
                this.loadAdminClasses();
                this.loadUserClasses(); // Atualizar também a view do usuário
            } else {
                this.showMessage(data.message || 'Error al crear la clase', 'error');
            }
        } catch (error) {
            console.error('Error creating class:', error);
            this.showMessage('Error de conexión', 'error');
        }

        this.showLoading(false);
    }

    async bookClass(classId) {
        if (!this.currentUser) {
            this.showMessage('Debes iniciar sesión para reservar', 'error');
            return;
        }

        // Find the class to check availability
        const classToBook = this.classes?.find(cls => cls.id === classId);
        if (classToBook && !classToBook.canReserve) {
            if (classToBook.hoursUntilClass > 24) {
                this.showMessage('Solo puedes reservar en las últimas 24 horas antes de la clase', 'error');
            } else {
                this.showMessage('La clase ya no está disponible para reservar', 'error');
            }
            return;
        }

        this.showLoading(true);

        try {
            const response = await fetch(`${this.apiUrl}/bookings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: this.currentUser.id,
                    classId: classId
                })
            });

            const data = await response.json();

            if (response.ok) {
                if (data.isWaitlist) {
                    this.showMessage(`${data.message}`, 'info');
                } else {
                    this.showMessage('¡Clase reservada exitosamente!', 'success');
                }
                // Refresh classes to update availability in both views
                this.loadUserClasses();
                this.loadAdminClasses(); // Atualizar também a view do admin
            } else {
                this.showMessage(data.message || 'Error al reservar la clase', 'error');
            }
        } catch (error) {
            console.error('Error booking class:', error);
            this.showMessage('Error de conexión', 'error');
        }

        this.showLoading(false);
    }

    async cancelBooking(classId) {
        if (!this.currentUser) {
            this.showMessage('Debes iniciar sesión', 'error');
            return;
        }

        this.showLoading(true);

        try {
            const response = await fetch(`${this.apiUrl}/bookings/${this.currentUser.id}/${classId}`, {
                method: 'DELETE'
            });

            const data = await response.json();

            if (response.ok) {
                this.showMessage('Reserva cancelada', 'success');
                // Refresh classes to update availability in both views
                this.loadUserClasses();
                this.loadAdminClasses(); // Atualizar também a view do admin
            } else {
                this.showMessage(data.message || 'Error al cancelar la reserva', 'error');
            }
        } catch (error) {
            console.error('Error canceling booking:', error);
            this.showMessage('Error de conexión', 'error');
        }

        this.showLoading(false);
    }

    async deleteClass(classId) {
        if (!confirm('¿Estás seguro de que quieres eliminar esta clase?')) {
            return;
        }

        this.showLoading(true);

        try {
            const response = await fetch(`${this.apiUrl}/classes/${classId}`, {
                method: 'DELETE'
            });

            const data = await response.json();

            if (response.ok) {
                this.showMessage('Clase eliminada', 'success');
                // Recarregar ambas as views para sincronizar
                this.loadAdminClasses();
                this.loadUserClasses(); // Atualizar também a view do usuário
            } else {
                this.showMessage(data.message || 'Error al eliminar la clase', 'error');
            }
        } catch (error) {
            console.error('Error deleting class:', error);
            this.showMessage('Error de conexión', 'error');
        }

        this.showLoading(false);
    }

    editClass(classId) {
        // Find the class data
        fetch(`${this.apiUrl}/classes/${classId}`)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    this.showEditClassModal(data.class);
                } else {
                    this.showMessage('Error al cargar datos de la clase', 'error');
                }
            })
            .catch(error => {
                console.error('Error loading class:', error);
                this.showMessage('Error de conexión', 'error');
            });
    }

    showEditClassModal(classData) {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.onclick = (e) => { if (e.target === modal) modal.remove(); };

        modal.innerHTML = `
            <div class="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-lg font-bold">Editar Clase</h3>
                    <button onclick="this.parentElement.parentElement.parentElement.remove()" class="text-gray-500 hover:text-gray-700">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <form id="editClassForm" class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label class="block text-gray-700 text-sm font-medium mb-2">Nombre de la Clase</label>
                        <input type="text" id="editClassName" value="${classData.name}" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent" required>
                    </div>
                    <div>
                        <label class="block text-gray-700 text-sm font-medium mb-2">Instructor</label>
                        <input type="text" id="editClassInstructor" value="${classData.instructor}" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent" required>
                    </div>
                    <div>
                        <label class="block text-gray-700 text-sm font-medium mb-2">Día de la Semana</label>
                        <select id="editClassDay" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent" required>
                            <option value="Lunes" ${classData.day === 'Lunes' ? 'selected' : ''}>Lunes</option>
                            <option value="Martes" ${classData.day === 'Martes' ? 'selected' : ''}>Martes</option>
                            <option value="Miércoles" ${classData.day === 'Miércoles' ? 'selected' : ''}>Miércoles</option>
                            <option value="Jueves" ${classData.day === 'Jueves' ? 'selected' : ''}>Jueves</option>
                            <option value="Viernes" ${classData.day === 'Viernes' ? 'selected' : ''}>Viernes</option>
                            <option value="Sábado" ${classData.day === 'Sábado' ? 'selected' : ''}>Sábado</option>
                            <option value="Domingo" ${classData.day === 'Domingo' ? 'selected' : ''}>Domingo</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-gray-700 text-sm font-medium mb-2">Horario</label>
                        <input type="time" id="editClassTime" value="${classData.time}" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent" required>
                    </div>
                    <div>
                        <label class="block text-gray-700 text-sm font-medium mb-2">Capacidad Máxima</label>
                        <input type="number" id="editClassCapacity" value="${classData.max_capacity || 10}" min="1" max="100" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent" required>
                    </div>
                    <div class="md:col-span-2">
                        <label class="block text-gray-700 text-sm font-medium mb-2">Descripción</label>
                        <textarea id="editClassDescription" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent" rows="3" required>${classData.description}</textarea>
                    </div>
                    <div class="md:col-span-2 flex gap-4">
                        <button type="submit" class="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition-colors shadow-lg">
                            <i class="fas fa-save mr-2"></i>Guardar Cambios
                        </button>
                        <button type="button" onclick="this.parentElement.parentElement.parentElement.parentElement.remove()" class="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition-colors shadow-lg">
                            <i class="fas fa-times mr-2"></i>Cancelar
                        </button>
                    </div>
                </form>
            </div>
        `;

        document.body.appendChild(modal);

        // Bind form submit
        document.getElementById('editClassForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleEditClass(classData.id);
            modal.remove();
        });
    }

    async handleEditClass(classId) {
        const classData = {
            name: document.getElementById('editClassName').value,
            instructor: document.getElementById('editClassInstructor').value,
            day: document.getElementById('editClassDay').value,
            time: document.getElementById('editClassTime').value,
            maxCapacity: parseInt(document.getElementById('editClassCapacity').value),
            description: document.getElementById('editClassDescription').value
        };

        this.showLoading(true);

        try {
            const response = await fetch(`${this.apiUrl}/classes/${classId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(classData)
            });

            const data = await response.json();

            if (response.ok) {
                this.showMessage('Clase actualizada exitosamente', 'success');
                // Recarregar ambas as views para sincronizar
                this.loadAdminClasses();
                this.loadUserClasses(); // Atualizar também a view do usuário
            } else {
                this.showMessage(data.message || 'Error al actualizar la clase', 'error');
            }
        } catch (error) {
            console.error('Error updating class:', error);
            this.showMessage('Error de conexión', 'error');
        }

        this.showLoading(false);
    }

    // Utility Methods
    showMessage(message, type = 'info') {
        const container = document.getElementById('messageContainer');
        const messageId = 'msg_' + Date.now();
        
        const colors = {
            success: 'bg-green-500',
            error: 'bg-red-500',
            info: 'bg-blue-500',
            warning: 'bg-yellow-500'
        };

        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            info: 'fa-info-circle',
            warning: 'fa-exclamation-triangle'
        };

        const messageDiv = document.createElement('div');
        messageDiv.id = messageId;
        messageDiv.className = `${colors[type]} text-white px-6 py-4 rounded-lg shadow-lg mb-4 transform transition-all duration-300 translate-x-full`;
        messageDiv.innerHTML = `
            <div class="flex items-center">
                <i class="fas ${icons[type]} mr-3"></i>
                <span>${message}</span>
                <button onclick="this.parentElement.parentElement.remove()" class="ml-4 text-white hover:text-gray-200">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;

        container.appendChild(messageDiv);

        // Trigger animation
        setTimeout(() => {
            messageDiv.classList.remove('translate-x-full');
        }, 100);

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (document.getElementById(messageId)) {
                messageDiv.classList.add('translate-x-full');
                setTimeout(() => {
                    messageDiv.remove();
                }, 300);
            }
        }, 5000);
    }

    showLoading(show) {
        const spinner = document.getElementById('loadingSpinner');
        if (show) {
            spinner.classList.remove('hidden');
        } else {
            spinner.classList.add('hidden');
        }
    }

    // View class bookings and waitlist
    async viewClassBookings(classId) {
        try {
            const [bookingsResponse, waitlistResponse] = await Promise.all([
                fetch(`${this.apiUrl}/bookings/class/${classId}`),
                fetch(`${this.apiUrl}/bookings/waitlist/${classId}`)
            ]);

            const bookingsData = await bookingsResponse.json();
            const waitlistData = await waitlistResponse.json();

            if (bookingsResponse.ok && waitlistResponse.ok) {
                this.showBookingsModal(bookingsData.bookings || [], waitlistData.waitlist || []);
            }
        } catch (error) {
            console.error('Error loading bookings:', error);
            this.showMessage('Error al cargar las reservas', 'error');
        }
    }

    showBookingsModal(bookings, waitlist) {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.onclick = (e) => { if (e.target === modal) modal.remove(); };

        modal.innerHTML = `
            <div class="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-lg font-bold">Reservas de la Clase</h3>
                    <button onclick="this.parentElement.parentElement.parentElement.remove()" class="text-gray-500 hover:text-gray-700">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="mb-6">
                    <h4 class="font-bold mb-2 text-green-600"><i class="fas fa-check mr-2"></i>Reservas Confirmadas (${bookings.length})</h4>
                    ${bookings.length > 0 ? `
                        <div class="space-y-2">
                            ${bookings.map(booking => `
                                <div class="flex justify-between items-center p-2 bg-green-50 rounded">
                                    <span>${booking.user_name}</span>
                                    <span class="text-sm text-gray-500">${booking.phone}</span>
                                </div>
                            `).join('')}
                        </div>
                    ` : '<p class="text-gray-500">No hay reservas confirmadas</p>'}
                </div>

                <div>
                    <h4 class="font-bold mb-2 text-yellow-600"><i class="fas fa-clock mr-2"></i>Lista de Espera (${waitlist.length})</h4>
                    ${waitlist.length > 0 ? `
                        <div class="space-y-2">
                            ${waitlist.map(wait => `
                                <div class="flex justify-between items-center p-2 bg-yellow-50 rounded">
                                    <span>${wait.user_name} <span class="text-sm text-gray-500">(Posición ${wait.position})</span></span>
                                    <span class="text-sm text-gray-500">${wait.phone}</span>
                                </div>
                            `).join('')}
                        </div>
                    ` : '<p class="text-gray-500">No hay personas en lista de espera</p>'}
                </div>
            </div>
        `;

        document.body.appendChild(modal);
    }

    // Cancel waitlist
    async cancelWaitlist(classId) {
        if (!this.currentUser) {
            this.showMessage('Debes iniciar sesión', 'error');
            return;
        }

        this.showLoading(true);

        try {
            const response = await fetch(`${this.apiUrl}/bookings/waitlist/${this.currentUser.id}/${classId}`, {
                method: 'DELETE'
            });

            const data = await response.json();

            if (response.ok) {
                this.showMessage(data.message || 'Saliste de la lista de espera exitosamente', 'success');
                // Refresh classes to update status
                this.loadUserClasses();
            } else {
                this.showMessage(data.message || 'Error al salir de la lista de espera', 'error');
            }
        } catch (error) {
            console.error('Error canceling waitlist:', error);
            this.showMessage('Error de conexión', 'error');
        }

        this.showLoading(false);
    }

    // Função para gerenciar reservas de uma aula (Admin)
    async manageClassReservations(classId) {
        try {
            const response = await fetch(`/api/classes/${classId}/reservations`);
            if (!response.ok) throw new Error('Erro ao buscar reservas');
            
            const data = await response.json();
            const reservations = data.reservations;
            const waitlist = data.waitlist;
            
            const modalHtml = `
                <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div class="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                        <div class="flex justify-between items-center mb-6">
                            <h3 class="text-xl font-bold text-gray-800">Gestionar Reservas - ${data.className}</h3>
                            <button onclick="app.closeReservationsModal()" class="text-gray-500 hover:text-gray-700">
                                <i class="fas fa-times text-xl"></i>
                            </button>
                        </div>
                        
                        <!-- Reservas Confirmadas -->
                        <div class="mb-6">
                            <h4 class="text-lg font-semibold text-gray-700 mb-3">Reservas Confirmadas (${reservations.length}/${data.maxCapacity})</h4>
                            ${reservations.length > 0 ? `
                                <div class="space-y-2">
                                    ${reservations.map(res => `
                                        <div class="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                                            <div>
                                                <span class="font-medium">${res.user_phone}</span>
                                                <span class="text-sm text-gray-500 ml-2">${new Date(res.booking_date).toLocaleString('es-ES', { timeZone: 'America/Sao_Paulo' })}</span>
                                            </div>
                                            <button onclick="app.removeReservation(${classId}, ${res.user_id})" 
                                                    class="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm">
                                                <i class="fas fa-times mr-1"></i>Eliminar
                                            </button>
                                        </div>
                                    `).join('')}
                                </div>
                            ` : `
                                <p class="text-gray-500">No hay reservas confirmadas</p>
                            `}
                        </div>

                        <!-- Lista de Espera -->
                        <div class="mb-6">
                            <h4 class="text-lg font-semibold text-gray-700 mb-3">Lista de Espera (${waitlist.length})</h4>
                            ${waitlist.length > 0 ? `
                                <div class="space-y-2">
                                    ${waitlist.map((wait, index) => `
                                        <div class="flex justify-between items-center bg-yellow-50 p-3 rounded-lg">
                                            <div>
                                                <span class="font-medium">${wait.user_phone}</span>
                                                <span class="text-sm text-gray-500 ml-2">Posición: ${index + 1}</span>
                                                <span class="text-sm text-gray-500 ml-2">${new Date(wait.waitlist_date).toLocaleString('es-ES', { timeZone: 'America/Sao_Paulo' })}</span>
                                            </div>
                                            <div class="space-x-2">
                                                <button onclick="app.promoteFromWaitlist(${classId}, ${wait.user_id})" 
                                                        class="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm"
                                                        ${reservations.length >= data.maxCapacity ? 'disabled' : ''}>
                                                    <i class="fas fa-arrow-up mr-1"></i>Promover
                                                </button>
                                                <button onclick="app.removeFromWaitlist(${classId}, ${wait.user_id})" 
                                                        class="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm">
                                                    <i class="fas fa-times mr-1"></i>Eliminar
                                                </button>
                                            </div>
                                        </div>
                                    `).join('')}
                                </div>
                            ` : `
                                <p class="text-gray-500">No hay usuarios en lista de espera</p>
                            `}
                        </div>

                        <!-- Agregar Usuario -->
                        <div class="border-t pt-6">
                            <h4 class="text-lg font-semibold text-gray-700 mb-3">Agregar Usuario</h4>
                            <div class="flex space-x-3">
                                <input type="text" id="addUserPhone" placeholder="Número de teléfono" 
                                       class="flex-1 border border-gray-300 rounded-lg px-3 py-2">
                                <button onclick="app.addUserToReservation(${classId})" 
                                        class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg">
                                    <i class="fas fa-plus mr-1"></i>Agregar
                                </button>
                            </div>
                            <p class="text-sm text-gray-500 mt-2">Se agregará a la reserva si hay espacio, o a la lista de espera</p>
                        </div>
                    </div>
                </div>
            `;
            
            document.body.insertAdjacentHTML('beforeend', modalHtml);
        } catch (error) {
            console.error('Error managing reservations:', error);
            this.showMessage('Error al gestionar las reservas', 'error');
        }
    }

    closeReservationsModal() {
        const modal = document.querySelector('.fixed.inset-0.bg-black.bg-opacity-50');
        if (modal) modal.remove();
    }

    async removeReservation(classId, userId) {
        try {
            const response = await fetch(`/api/classes/${classId}/bookings/${userId}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                this.showMessage('Reserva eliminada exitosamente', 'success');
                this.closeReservationsModal();
                setTimeout(() => {
                    this.manageClassReservations(classId);
                }, 1000);
            } else {
                throw new Error('Error al eliminar reserva');
            }
        } catch (error) {
            console.error('Error removing reservation:', error);
            this.showMessage('Error al eliminar la reserva', 'error');
        }
    }

    async promoteFromWaitlist(classId, userId) {
        try {
            const response = await fetch(`/api/classes/${classId}/waitlist/${userId}/promote`, {
                method: 'POST'
            });
            
            if (response.ok) {
                this.showMessage('Usuario promovido exitosamente', 'success');
                this.closeReservationsModal();
                setTimeout(() => {
                    this.manageClassReservations(classId);
                }, 1000);
            } else {
                throw new Error('Error al promover usuario');
            }
        } catch (error) {
            console.error('Error promoting user:', error);
            this.showMessage('Error al promover usuario', 'error');
        }
    }

    async removeFromWaitlist(classId, userId) {
        try {
            const response = await fetch(`/api/classes/${classId}/waitlist/${userId}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                this.showMessage('Usuario eliminado de lista de espera', 'success');
                this.closeReservationsModal();
                setTimeout(() => {
                    this.manageClassReservations(classId);
                }, 1000);
            } else {
                throw new Error('Error al eliminar de lista de espera');
            }
        } catch (error) {
            console.error('Error removing from waitlist:', error);
            this.showMessage('Error al eliminar de lista de espera', 'error');
        }
    }

    async addUserToReservation(classId) {
        const phoneInput = document.getElementById('addUserPhone');
        const phone = phoneInput.value.trim();
        
        if (!phone) {
            this.showMessage('Por favor ingrese un número de teléfono', 'error');
            return;
        }
        
        try {
            const response = await fetch(`/api/classes/${classId}/admin-booking`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ phone })
            });
            
            const result = await response.json();
            
            if (response.ok) {
                this.showMessage(result.message, 'success');
                phoneInput.value = '';
                this.closeReservationsModal();
                setTimeout(() => {
                    this.manageClassReservations(classId);
                }, 1000);
            } else {
                this.showMessage(result.error || 'Error al agregar usuario', 'error');
            }
        } catch (error) {
            console.error('Error adding user:', error);
            this.showMessage('Error al agregar usuario', 'error');
        }
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new MaragonFitApp();
});
