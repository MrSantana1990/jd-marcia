// Data Manager com integração ao Backend Flask
class DataManagerSheets {
    constructor() {
        this.isInitialized = false;
        this.init();
    }

    async init() {
        // Aguardar o backend estar disponível
        if (window.backendIntegration) {
            await window.backendIntegration.testConnection();
            this.isInitialized = true;
            console.log('DataManager inicializado com backend');
        } else {
            // Fallback se o backend não estiver disponível
            setTimeout(() => this.init(), 1000);
        }
    }

    // Método para adicionar louvor
    async addLouvor(data) {
        try {
            if (!window.backendIntegration) {
                return this.fallbackSave('louvores', data);
            }

            const result = await window.backendIntegration.addToSheet('louvores', {
                id: data.id || Date.now().toString(),
                cantor: data.cantor || '',
                musica: data.musica || '',
                youtubeLink: data.youtubeLink || '',
                observacoes: data.observacoes || '',
                data: data.data || new Date().toISOString(),
                status: data.status || 'Pendente'
            });

            return result.success;
        } catch (error) {
            console.error('Erro ao adicionar louvor:', error);
            return this.fallbackSave('louvores', data);
        }
    }

    // Método para adicionar oração
    async addOracao(data) {
        try {
            if (!window.backendIntegration) {
                return this.fallbackSave('oracoes', data);
            }

            const result = await window.backendIntegration.addToSheet('oracoes', {
                id: data.id || Date.now().toString(),
                nome: data.nome || '',
                pedido: data.pedido || '',
                reservado: data.reservado || false,
                data: data.data || new Date().toISOString(),
                status: data.status || 'Pendente'
            });

            return result.success;
        } catch (error) {
            console.error('Erro ao adicionar oração:', error);
            return this.fallbackSave('oracoes', data);
        }
    }

    // Método para adicionar visitante
    async addVisitante(data) {
        try {
            if (!window.backendIntegration) {
                return this.fallbackSave('visitantes', data);
            }

            const result = await window.backendIntegration.addToSheet('visitantes', {
                id: data.id || Date.now().toString(),
                nome: data.nome || '',
                telefone: data.telefone || '',
                endereco: data.endereco || '',
                comoConheceu: data.comoConheceu || '',
                interesses: data.interesses || [],
                data: data.data || new Date().toISOString()
            });

            return result.success;
        } catch (error) {
            console.error('Erro ao adicionar visitante:', error);
            return this.fallbackSave('visitantes', data);
        }
    }

    // Método para adicionar documento
    async addDocumento(data) {
        try {
            if (!window.backendIntegration) {
                return this.fallbackSave('documentos', data);
            }

            const result = await window.backendIntegration.addToSheet('documentos', {
                id: data.id || Date.now().toString(),
                nome: data.nome || '',
                tipo: data.tipo || '',
                finalidade: data.finalidade || '',
                observacoes: data.observacoes || '',
                data: data.data || new Date().toISOString(),
                status: data.status || 'Solicitado'
            });

            return result.success;
        } catch (error) {
            console.error('Erro ao adicionar documento:', error);
            return this.fallbackSave('documentos', data);
        }
    }

    // Método para adicionar aviso
    async addAviso(data) {
        try {
            if (!window.backendIntegration) {
                return this.fallbackSave('avisos', data);
            }

            const result = await window.backendIntegration.addToSheet('avisos', {
                id: data.id || Date.now().toString(),
                titulo: data.titulo || '',
                mensagem: data.mensagem || '',
                autor: data.autor || 'Administração',
                data: data.data || new Date().toISOString(),
                status: data.status || 'Ativo'
            });

            return result.success;
        } catch (error) {
            console.error('Erro ao adicionar aviso:', error);
            return this.fallbackSave('avisos', data);
        }
    }

    // Métodos para ler dados
    async getLouvores() {
        try {
            console.log('backint',window.backendIntegration);
            if (!window.backendIntegration) {
                return this.fallbackLoad('louvores');
            }
            return await window.backendIntegration.readFromSheet('louvores');
        } catch (error) {
            console.error('Erro ao carregar louvores:', error);
            return this.fallbackLoad('louvores');
        }
    }

    async getOracoes() {
        try {
            if (!window.backendIntegration) {
                return this.fallbackLoad('oracoes');
            }
            return await window.backendIntegration.readFromSheet('oracoes');
        } catch (error) {
            console.error('Erro ao carregar orações:', error);
            return this.fallbackLoad('oracoes');
        }
    }

    async getVisitantes() {
        try {
            if (!window.backendIntegration) {
                return this.fallbackLoad('visitantes');
            }
            return await window.backendIntegration.readFromSheet('visitantes');
        } catch (error) {
            console.error('Erro ao carregar visitantes:', error);
            return this.fallbackLoad('visitantes');
        }
    }

    async getDocumentos() {
        try {
            if (!window.backendIntegration) {
                return this.fallbackLoad('documentos');
            }
            return await window.backendIntegration.readFromSheet('documentos');
        } catch (error) {
            console.error('Erro ao carregar documentos:', error);
            return this.fallbackLoad('documentos');
        }
    }

    async getAvisos() {
        try {
            if (!window.backendIntegration) {
                return this.fallbackLoad('avisos');
            }
            return await window.backendIntegration.readFromSheet('avisos');
        } catch (error) {
            console.error('Erro ao carregar avisos:', error);
            return this.fallbackLoad('avisos');
        }
    }

    // Método para sincronizar todos os dados
    async syncAll() {
        try {
            if (!window.backendIntegration) {
                return { success: false, message: 'Backend não disponível' };
            }
            return await window.backendIntegration.syncAllData();
        } catch (error) {
            console.error('Erro na sincronização:', error);
            return { success: false, message: 'Erro na sincronização' };
        }
    }

    // Métodos de fallback para localStorage
    fallbackSave(type, data) {
        try {
            const key = `ad_jardim_marcia_${type}`;
            const existingData = JSON.parse(localStorage.getItem(key) || '[]');
            
            if (!data.id) {
                data.id = Date.now().toString(36) + Math.random().toString(36).substr(2);
            }
            
            if (!data.data && !data.timestamp) {
                data.data = new Date().toISOString();
            }
            
            existingData.push(data);
            localStorage.setItem(key, JSON.stringify(existingData));
            
            console.log(`Dados salvos localmente (${type}):`, data);
            return true;
        } catch (error) {
            console.error('Erro no fallback save:', error);
            return false;
        }
    }

    fallbackLoad(type) {
        try {
            const key = `ad_jardim_marcia_${type}`;
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Erro no fallback load:', error);
            return [];
        }
    }

    // Método para verificar status da conexão
    getConnectionStatus() {
        if (window.backendIntegration) {
            return window.backendIntegration.getStatus();
        }
        return { online: false, backendUrl: 'N/A', lastCheck: new Date().toISOString() };
    }

    // Método para forçar reconexão
    async reconnect() {
        if (window.backendIntegration) {
            return await window.backendIntegration.testConnection();
        }
        return false;
    }
}

// Instância global
window.dataManager = new DataManagerSheets();

