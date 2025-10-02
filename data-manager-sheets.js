// Sistema de Gerenciamento de Dados Integrado com Google Sheets
// Mantém compatibilidade com localStorage e adiciona sincronização com planilha

class DataManagerSheets {
    constructor() {
        this.storageKeys = {
            louvores: 'ad_jardim_marcia_louvores',
            oracoes: 'ad_jardim_marcia_oracoes',
            visitantes: 'ad_jardim_marcia_visitantes',
            documentos: 'ad_jardim_marcia_documentos',
            avisos: 'ad_jardim_marcia_avisos',
            config: 'ad_jardim_marcia_config'
        };
        
        this.googleSheets = window.googleSheetsIntegration;
        this.initializeStorage();
        this.setupAutoSync();
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
                sheetsSync: true,
                lastSync: null,
                lastUpdate: new Date().toISOString()
            });
        }
    }

    // Configurar sincronização automática
    setupAutoSync() {
        // Sincroniza a cada 5 minutos
        setInterval(() => {
            this.syncWithSheets();
        }, 5 * 60 * 1000);

        // Sincroniza quando a página é fechada
        window.addEventListener('beforeunload', () => {
            this.syncWithSheets();
        });
    }

    // Métodos genéricos de storage
    async saveData(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            
            // Sincroniza com planilha se habilitado
            const config = this.getConfig();
            if (config && config.sheetsSync && this.googleSheets) {
                await this.syncDataToSheets(key, data);
            }
            
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

    // Sincronizar dados específicos com a planilha
    async syncDataToSheets(storageKey, data) {
        if (!this.googleSheets) return;

        const sheetType = this.getSheetTypeFromStorageKey(storageKey);
        if (sheetType) {
            await this.googleSheets.writeSheet(sheetType, data);
        }
    }

    // Mapear chave de storage para tipo de aba
    getSheetTypeFromStorageKey(storageKey) {
        const mapping = {
            'ad_jardim_marcia_louvores': 'louvores',
            'ad_jardim_marcia_oracoes': 'oracoes',
            'ad_jardim_marcia_visitantes': 'visitantes',
            'ad_jardim_marcia_documentos': 'documentos',
            'ad_jardim_marcia_avisos': 'avisos'
        };
        return mapping[storageKey];
    }

    // Sincronizar todos os dados com a planilha
    async syncWithSheets() {
        if (!this.googleSheets) return;

        try {
            const results = await this.googleSheets.syncLocalToSheets();
            
            // Atualiza timestamp da última sincronização
            const config = this.getConfig();
            config.lastSync = new Date().toISOString();
            this.saveConfig(config);

            console.log('Sincronização com planilha concluída:', results);
            return results;
        } catch (error) {
            console.error('Erro na sincronização:', error);
            return null;
        }
    }

    // === MÉTODOS DE LOUVORES ===
    async getLouvores() {
        if (this.googleSheets) {
            try {
                return await this.googleSheets.readSheet('louvores');
            } catch (error) {
                console.error('Erro ao carregar louvores da planilha:', error);
            }
        }
        return this.getData(this.storageKeys.louvores) || [];
    }

    async saveLouvores(louvores) {
        return await this.saveData(this.storageKeys.louvores, louvores);
    }

    async addLouvor(louvor) {
        louvor.id = this.generateId();
        louvor.data = new Date().toISOString();
        louvor.status = louvor.status || 'Pendente';
        
        // Adicionar à planilha primeiro
        if (this.googleSheets) {
            try {
                await this.googleSheets.appendToSheet('louvores', louvor);
            } catch (error) {
                console.error('Erro ao adicionar louvor à planilha:', error);
            }
        }
        
        // Adicionar ao localStorage como backup
        const louvores = await this.getLouvores();
        louvores.push(louvor);
        return await this.saveLouvores(louvores);
    }

    async updateLouvor(id, updatedLouvor) {
        const louvores = await this.getLouvores();
        const index = louvores.findIndex(l => l.id === id);
        if (index !== -1) {
            louvores[index] = { ...louvores[index], ...updatedLouvor };
            return await this.saveLouvores(louvores);
        }
        return false;
    }

    async deleteLouvor(id) {
        const louvores = await this.getLouvores();
        const filtered = louvores.filter(l => l.id !== id);
        return await this.saveLouvores(filtered);
    }

    // === MÉTODOS DE ORAÇÕES ===
    async getOracoes() {
        if (this.googleSheets) {
            try {
                return await this.googleSheets.readSheet('oracoes');
            } catch (error) {
                console.error('Erro ao carregar orações da planilha:', error);
            }
        }
        return this.getData(this.storageKeys.oracoes) || [];
    }

    async saveOracoes(oracoes) {
        return await this.saveData(this.storageKeys.oracoes, oracoes);
    }

    async addOracao(oracao) {
        oracao.id = this.generateId();
        oracao.data = new Date().toISOString();
        oracao.status = oracao.status || 'Pendente';
        
        // Adicionar à planilha primeiro
        if (this.googleSheets) {
            try {
                await this.googleSheets.appendToSheet('oracoes', oracao);
            } catch (error) {
                console.error('Erro ao adicionar oração à planilha:', error);
            }
        }
        
        // Adicionar ao localStorage como backup
        const oracoes = await this.getOracoes();
        oracoes.push(oracao);
        return await this.saveOracoes(oracoes);
    }

    async updateOracao(id, updatedOracao) {
        const oracoes = await this.getOracoes();
        const index = oracoes.findIndex(o => o.id === id);
        if (index !== -1) {
            oracoes[index] = { ...oracoes[index], ...updatedOracao };
            return await this.saveOracoes(oracoes);
        }
        return false;
    }

    async deleteOracao(id) {
        const oracoes = await this.getOracoes();
        const filtered = oracoes.filter(o => o.id !== id);
        return await this.saveOracoes(filtered);
    }

    // === MÉTODOS DE VISITANTES ===
    async getVisitantes() {
        if (this.googleSheets) {
            try {
                return await this.googleSheets.readSheet('visitantes');
            } catch (error) {
                console.error('Erro ao carregar visitantes da planilha:', error);
            }
        }
        return this.getData(this.storageKeys.visitantes) || [];
    }

    async saveVisitantes(visitantes) {
        return await this.saveData(this.storageKeys.visitantes, visitantes);
    }

    async addVisitante(visitante) {
        visitante.id = this.generateId();
        visitante.data_da_visita = visitante.data_da_visita || new Date().toISOString();
        
        // Adicionar à planilha primeiro
        if (this.googleSheets) {
            try {
                await this.googleSheets.appendToSheet('visitantes', visitante);
            } catch (error) {
                console.error('Erro ao adicionar visitante à planilha:', error);
            }
        }
        
        // Adicionar ao localStorage como backup
        const visitantes = await this.getVisitantes();
        visitantes.push(visitante);
        return await this.saveVisitantes(visitantes);
    }

    async updateVisitante(id, updatedVisitante) {
        const visitantes = await this.getVisitantes();
        const index = visitantes.findIndex(v => v.id === id);
        if (index !== -1) {
            visitantes[index] = { ...visitantes[index], ...updatedVisitante };
            return await this.saveVisitantes(visitantes);
        }
        return false;
    }

    async deleteVisitante(id) {
        const visitantes = await this.getVisitantes();
        const filtered = visitantes.filter(v => v.id !== id);
        return await this.saveVisitantes(filtered);
    }

    // === MÉTODOS DE DOCUMENTOS ===
    async getDocumentos() {
        if (this.googleSheets) {
            try {
                return await this.googleSheets.readSheet('documentos');
            } catch (error) {
                console.error('Erro ao carregar documentos da planilha:', error);
            }
        }
        return this.getData(this.storageKeys.documentos) || [];
    }

    async saveDocumentos(documentos) {
        return await this.saveData(this.storageKeys.documentos, documentos);
    }

    async addDocumento(documento) {
        documento.id = this.generateId();
        documento.data_da_solicitacao = documento.data_da_solicitacao || new Date().toISOString();
        
        // Adicionar à planilha primeiro
        if (this.googleSheets) {
            try {
                await this.googleSheets.appendToSheet('documentos', documento);
            } catch (error) {
                console.error('Erro ao adicionar documento à planilha:', error);
            }
        }
        
        // Adicionar ao localStorage como backup
        const documentos = await this.getDocumentos();
        documentos.push(documento);
        return await this.saveDocumentos(documentos);
    }

    async updateDocumento(id, updatedDocumento) {
        const documentos = await this.getDocumentos();
        const index = documentos.findIndex(d => d.id === id);
        if (index !== -1) {
            documentos[index] = { ...documentos[index], ...updatedDocumento };
            return await this.saveDocumentos(documentos);
        }
        return false;
    }

    async deleteDocumento(id) {
        const documentos = await this.getDocumentos();
        const filtered = documentos.filter(d => d.id !== id);
        return await this.saveDocumentos(filtered);
    }

    // === MÉTODOS DE AVISOS ===
    async getAvisos() {
        if (this.googleSheets) {
            try {
                return await this.googleSheets.readSheet('avisos');
            } catch (error) {
                console.error('Erro ao carregar avisos da planilha:', error);
            }
        }
        return this.getData(this.storageKeys.avisos) || [];
    }

    async saveAvisos(avisos) {
        return await this.saveData(this.storageKeys.avisos, avisos);
    }

    async addAviso(aviso) {
        aviso.id = this.generateId();
        aviso.data = new Date().toISOString();
        aviso.status = aviso.status || 'Ativo';
        
        // Adicionar à planilha primeiro
        if (this.googleSheets) {
            try {
                await this.googleSheets.appendToSheet('avisos', aviso);
            } catch (error) {
                console.error('Erro ao adicionar aviso à planilha:', error);
            }
        }
        
        // Adicionar ao localStorage como backup
        const avisos = await this.getAvisos();
        avisos.push(aviso);
        return await this.saveAvisos(avisos);
    }

    async updateAviso(id, updatedAviso) {
        const avisos = await this.getAvisos();
        const index = avisos.findIndex(a => a.id === id);
        if (index !== -1) {
            avisos[index] = { ...avisos[index], ...updatedAviso };
            return await this.saveAvisos(avisos);
        }
        return false;
    }

    async deleteAviso(id) {
        const avisos = await this.getAvisos();
        const filtered = avisos.filter(a => a.id !== id);
        return await this.saveAvisos(filtered);
    }

    // === MÉTODOS DE CONFIGURAÇÃO ===
    getConfig() {
        return this.getData(this.storageKeys.config);
    }

    saveConfig(config) {
        return this.saveData(this.storageKeys.config, config);
    }

    // === MÉTODOS UTILITÁRIOS ===
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // Exportar dados para CSV
    exportToCSV(type) {
        if (!this.googleSheets) return;

        let data = [];
        switch(type) {
            case 'louvores':
                data = this.getLouvores();
                break;
            case 'oracoes':
                data = this.getOracoes();
                break;
            case 'visitantes':
                data = this.getVisitantes();
                break;
            case 'documentos':
                data = this.getDocumentos();
                break;
            case 'avisos':
                data = this.getAvisos();
                break;
        }

        // Implementar exportação CSV aqui
        console.log('Exportando dados:', type, data);
    }

    // Obter link da planilha
    getSheetUrl() {
        if (!this.googleSheets) return null;
        return this.googleSheets.getSpreadsheetUrl();
    }

    // Verificar status da conexão com a planilha
    async checkSheetsConnection() {
        if (!this.googleSheets) return false;
        return await this.googleSheets.checkConnection();
    }

    // Limpar todos os dados (para desenvolvimento)
    clearAllData() {
        Object.values(this.storageKeys).forEach(key => {
            localStorage.removeItem(key);
        });
        this.initializeStorage();
    }
}

// Instância global do gerenciador
window.dataManager = new DataManagerSheets();
