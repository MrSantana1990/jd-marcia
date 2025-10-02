// Sistema de Gerenciamento de Dados Local
// Simula um backend usando localStorage

class DataManager {
    constructor() {
        this.storageKeys = {
            louvores: 'ad_jardim_marcia_louvores',
            oracoes: 'ad_jardim_marcia_oracoes',
            visitantes: 'ad_jardim_marcia_visitantes',
            documentos: 'ad_jardim_marcia_documentos',
            avisos: 'ad_jardim_marcia_avisos',
            config: 'ad_jardim_marcia_config'
        };
        
        this.initializeStorage();
    }

    // Inicializar storage com dados padrão
    initializeStorage() {
        // Configurações padrão
        if (!this.getConfig()) {
            this.saveConfig({
                pixKey: '[CHAVE_PIX_DA_IGREJA]',
                pixObservacao: 'JD MARCIA - SETOR 13',
                calendarId: 'jdmarciaad@gmail.com',
                notificationsEnabled: false,
                lastUpdate: new Date().toISOString()
            });
        }


    }

    // Métodos genéricos de storage
    saveData(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Erro ao salvar dados:', error);
            return false;
        }
    }

    getData(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
            return null;
        }
    }

    // Métodos específicos para Louvores
    saveLouvores(louvores) {
        return this.saveData(this.storageKeys.louvores, louvores);
    }

    getLouvores() {
        return this.getData(this.storageKeys.louvores) || [];
    }

    addLouvor(louvor) {
        const louvores = this.getLouvores();
        louvor.id = Date.now();
        louvor.status = 'pendente';
        louvor.timestamp = new Date().toISOString();
        louvores.push(louvor);
        return this.saveLouvores(louvores);
    }

    updateLouvorStatus(id, status) {
        const louvores = this.getLouvores();
        const index = louvores.findIndex(l => l.id === id);
        if (index !== -1) {
            louvores[index].status = status;
            louvores[index].updatedAt = new Date().toISOString();
            return this.saveLouvores(louvores);
        }
        return false;
    }

    // Métodos específicos para Orações
    saveOracoes(oracoes) {
        return this.saveData(this.storageKeys.oracoes, oracoes);
    }

    getOracoes() {
        return this.getData(this.storageKeys.oracoes) || [];
    }

    addOracao(oracao) {
        const oracoes = this.getOracoes();
        oracao.id = Date.now();
        oracao.status = 'novo';
        oracao.timestamp = new Date().toISOString();
        oracoes.push(oracao);
        return this.saveOracoes(oracoes);
    }

    // Métodos específicos para Visitantes
    saveVisitantes(visitantes) {
        return this.saveData(this.storageKeys.visitantes, visitantes);
    }

    getVisitantes() {
        return this.getData(this.storageKeys.visitantes) || [];
    }

    addVisitante(visitante) {
        const visitantes = this.getVisitantes();
        visitante.id = Date.now();
        visitante.status = 'novo';
        visitante.timestamp = new Date().toISOString();
        visitantes.push(visitante);
        return this.saveVisitantes(visitantes);
    }

    updateVisitanteStatus(id, status) {
        const visitantes = this.getVisitantes();
        const index = visitantes.findIndex(v => v.id === id);
        if (index !== -1) {
            visitantes[index].status = status;
            visitantes[index].updatedAt = new Date().toISOString();
            return this.saveVisitantes(visitantes);
        }
        return false;
    }

    // Métodos específicos para Documentos
    saveDocumentos(documentos) {
        return this.saveData(this.storageKeys.documentos, documentos);
    }

    getDocumentos() {
        return this.getData(this.storageKeys.documentos) || [];
    }

    addDocumento(documento) {
        const documentos = this.getDocumentos();
        documento.id = Date.now();
        documento.status = 'solicitado';
        documento.timestamp = new Date().toISOString();
        documentos.push(documento);
        return this.saveDocumentos(documentos);
    }

    updateDocumentoStatus(id, status) {
        const documentos = this.getDocumentos();
        const index = documentos.findIndex(d => d.id === id);
        if (index !== -1) {
            documentos[index].status = status;
            documentos[index].updatedAt = new Date().toISOString();
            return this.saveDocumentos(documentos);
        }
        return false;
    }

    // Métodos específicos para Avisos
    saveAvisos(avisos) {
        const versionedAvisos = { version: Date.now(), data: avisos };
        return this.saveData(this.storageKeys.avisos, versionedAvisos);
    }

    getAvisos() {
        const versionedAvisos = this.getData(this.storageKeys.avisos);
        return versionedAvisos ? versionedAvisos.data : [];
    }

    addAviso(aviso) {
        const avisos = this.getAvisos();
        aviso.id = Date.now();
        aviso.data = new Date().toLocaleDateString('pt-BR');
        aviso.ativo = true;
        avisos.unshift(aviso); // Adiciona no início
        return this.saveAvisos(avisos);
    }

    // Métodos específicos para Configurações
    saveConfig(config) {
        return this.saveData(this.storageKeys.config, config);
    }

    getConfig() {
        return this.getData(this.storageKeys.config);
    }

    updateConfig(updates) {
        const config = this.getConfig() || {};
        const newConfig = { ...config, ...updates };
        newConfig.lastUpdate = new Date().toISOString();
        return this.saveConfig(newConfig);
    }

    // Métodos de estatísticas
    getStats() {
        return {
            louvores: {
                total: this.getLouvores().length,
                pendentes: this.getLouvores().filter(l => l.status === 'pendente').length,
                atendidos: this.getLouvores().filter(l => l.status === 'atendido').length
            },
            oracoes: {
                total: this.getOracoes().length,
                novos: this.getOracoes().filter(o => o.status === 'novo').length,
                reservados: this.getOracoes().filter(o => o.reservado).length
            },
            visitantes: {
                total: this.getVisitantes().length,
                novos: this.getVisitantes().filter(v => v.status === 'novo').length,
                contatados: this.getVisitantes().filter(v => v.status === 'contatado').length
            },
            documentos: {
                total: this.getDocumentos().length,
                solicitados: this.getDocumentos().filter(d => d.status === 'solicitado').length,
                prontos: this.getDocumentos().filter(d => d.status === 'pronto').length
            }
        };
    }

    // Método para exportar dados (backup)
    exportData() {
        const data = {
            louvores: this.getLouvores(),
            oracoes: this.getOracoes(),
            visitantes: this.getVisitantes(),
            documentos: this.getDocumentos(),
            avisos: this.getAvisos(),
            config: this.getConfig(),
            exportDate: new Date().toISOString()
        };
        return JSON.stringify(data, null, 2);
    }

    // Método para importar dados (restore)
    importData(jsonData) {
        try {
            const data = JSON.parse(jsonData);
            
            if (data.louvores) this.saveLouvores(data.louvores);
            if (data.oracoes) this.saveOracoes(data.oracoes);
            if (data.visitantes) this.saveVisitantes(data.visitantes);
            if (data.documentos) this.saveDocumentos(data.documentos);
            if (data.avisos) this.saveAvisos(data.avisos);
            if (data.config) this.saveConfig(data.config);
            
            return true;
        } catch (error) {
            console.error('Erro ao importar dados:', error);
            return false;
        }
    }

    // Track area do membro access
    trackAreaMembroAccess() {
        const accessData = {
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            referrer: document.referrer
        };
        
        let accessLog = JSON.parse(localStorage.getItem('area_membro_access') || '[]');
        accessLog.push(accessData);
        
        // Keep only last 100 access records
        if (accessLog.length > 100) {
            accessLog = accessLog.slice(-100);
        }
        
        localStorage.setItem('area_membro_access', JSON.stringify(accessLog));
        console.log('Área do Membro access tracked:', accessData);
    }

    // Get area do membro access statistics
    getAreaMembroStats() {
        const accessLog = JSON.parse(localStorage.getItem('area_membro_access') || '[]');
        return {
            totalAccess: accessLog.length,
            lastAccess: accessLog.length > 0 ? accessLog[accessLog.length - 1].timestamp : null,
            accessLog: accessLog
        };
    }

    // Método para limpar todos os dados
    clearAllData() {
        Object.values(this.storageKeys).forEach(key => {
            localStorage.removeItem(key);
        });
        this.initializeStorage();
    }
}

// Instância global do gerenciador de dados
window.dataManager = new DataManager();
