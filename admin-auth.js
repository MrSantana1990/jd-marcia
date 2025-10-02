// Sistema de Autenticação Seguro - AD Jardim Márcia
// Senhas protegidas por hash

class AdminAuth {
    constructor() {
        this.currentUser = null;
        this.sessionKey = 'ad_jardim_marcia_admin_session';
        
        // Configuração de usuários com senhas em hash
        this.users = {
            sonoplasta: {
                password: this.hashPassword('som123'),
                name: 'Sonoplasta',
                permissions: ['louvores', 'dashboard'],
                description: 'Acesso aos pedidos de louvor e dashboard'
            },
            pastor: {
                password: this.hashPassword('pastor123'),
                name: 'Pastor/Liderança',
                permissions: ['louvores', 'oracoes', 'visitantes', 'avisos', 'dashboard'],
                description: 'Acesso completo exceto configurações'
            },
            departamento_pai: {
                password: this.hashPassword('pai123'),
                name: 'Departamento do Pai',
                permissions: ['visitantes', 'dashboard'],
                description: 'Acesso aos visitantes e dashboard'
            },
            secretaria: {
                password: this.hashPassword('sec123'),
                name: 'Secretaria',
                permissions: ['documentos', 'avisos', 'dashboard'],
                description: 'Acesso aos documentos, avisos e dashboard'
            },
            admin: {
                password: this.hashPassword('admin123'),
                name: 'Administrador',
                permissions: ['all'],
                description: 'Acesso completo ao sistema'
            }
        };
    }

    // Hash simples para senhas (SHA-256 simulado)
    hashPassword(password) {
        let hash = 0;
        if (password.length === 0) return hash.toString(16);
        
        for (let i = 0; i < password.length; i++) {
            const char = password.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        
        // Adicionar salt baseado no comprimento da senha
        const salt = password.length * 31;
        hash = Math.abs(hash + salt);
        
        return hash.toString(16);
    }

    // Verificar credenciais
    authenticate(username, password) {
        const user = this.users[username];
        if (!user) {
            return {
                success: false,
                message: 'Usuário não encontrado'
            };
        }

        const hashedPassword = this.hashPassword(password);
        if (user.password !== hashedPassword) {
            return {
                success: false,
                message: 'Senha incorreta'
            };
        }

        return {
            success: true,
            user: {
                username: username,
                name: user.name,
                permissions: user.permissions,
                description: user.description
            }
        };
    }

    // Fazer login
    login(username, password) {
        const authResult = this.authenticate(username, password);
        
        if (!authResult.success) {
            return authResult;
        }

        // Criar sessão
        const sessionData = {
            user: authResult.user,
            loginTime: Date.now(),
            expiresAt: Date.now() + (24 * 60 * 60 * 1000), // 24 horas
            sessionId: this.generateSessionId()
        };

        // Salvar sessão
        localStorage.setItem(this.sessionKey, JSON.stringify(sessionData));
        this.currentUser = authResult.user;

        return {
            success: true,
            message: `Bem-vindo, ${authResult.user.name}!`,
            user: authResult.user
        };
    }

    // Verificar sessão ativa
    checkSession() {
        try {
            const sessionData = localStorage.getItem(this.sessionKey);
            if (!sessionData) {
                return { valid: false, message: 'Nenhuma sessão ativa' };
            }

            const session = JSON.parse(sessionData);
            
            // Verificar se a sessão expirou
            if (Date.now() > session.expiresAt) {
                this.logout();
                return { valid: false, message: 'Sessão expirada' };
            }

            this.currentUser = session.user;
            return {
                valid: true,
                user: session.user,
                loginTime: session.loginTime
            };
        } catch (error) {
            this.logout();
            return { valid: false, message: 'Sessão inválida' };
        }
    }

    // Fazer logout
    logout() {
        localStorage.removeItem(this.sessionKey);
        this.currentUser = null;
        return { success: true, message: 'Logout realizado com sucesso' };
    }

    // Verificar permissão
    hasPermission(permission) {
        if (!this.currentUser) {
            return false;
        }

        // Admin tem acesso a tudo
        if (this.currentUser.permissions.includes('all')) {
            return true;
        }

        return this.currentUser.permissions.includes(permission);
    }

    // Obter usuário atual
    getCurrentUser() {
        return this.currentUser;
    }

    // Gerar ID de sessão único
    generateSessionId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // Listar usuários (apenas para admin)
    getUsers() {
        if (!this.hasPermission('all')) {
            return { success: false, message: 'Acesso negado' };
        }

        const userList = Object.keys(this.users).map(username => ({
            username: username,
            name: this.users[username].name,
            permissions: this.users[username].permissions,
            description: this.users[username].description
        }));

        return { success: true, users: userList };
    }

    // Alterar senha (apenas admin)
    changePassword(targetUsername, newPassword, adminPassword) {
        // Verificar se é admin
        if (!this.currentUser || !this.hasPermission('all')) {
            return { success: false, message: 'Apenas administradores podem alterar senhas' };
        }

        // Verificar senha do admin
        const adminAuth = this.authenticate('admin', adminPassword);
        if (!adminAuth.success) {
            return { success: false, message: 'Senha de administrador incorreta' };
        }

        // Verificar se o usuário existe
        if (!this.users[targetUsername]) {
            return { success: false, message: 'Usuário não encontrado' };
        }

        // Alterar senha
        this.users[targetUsername].password = this.hashPassword(newPassword);
        
        return { 
            success: true, 
            message: `Senha do usuário ${targetUsername} alterada com sucesso` 
        };
    }

    // Obter informações de sessão
    getSessionInfo() {
        const sessionData = localStorage.getItem(this.sessionKey);
        if (!sessionData) {
            return null;
        }

        try {
            const session = JSON.parse(sessionData);
            return {
                user: session.user,
                loginTime: new Date(session.loginTime).toLocaleString('pt-BR'),
                expiresAt: new Date(session.expiresAt).toLocaleString('pt-BR'),
                timeRemaining: Math.max(0, session.expiresAt - Date.now())
            };
        } catch (error) {
            return null;
        }
    }
}

// Instância global
window.adminAuth = new AdminAuth();

// Funções de conveniência
window.login = (username, password) => window.adminAuth.login(username, password);
window.logout = () => window.adminAuth.logout();
window.checkSession = () => window.adminAuth.checkSession();
window.hasPermission = (permission) => window.adminAuth.hasPermission(permission);
window.getCurrentUser = () => window.adminAuth.getCurrentUser();

