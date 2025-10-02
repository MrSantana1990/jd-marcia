// Integração Real com Google Sheets API
class GoogleSheetsIntegration {
    constructor() {
        this.spreadsheetId = '1VCzpN_lkaeX8C8wIk77Nw4_YFjgnuXrL3Zle19q0Yig';
        this.apiKey = null; // Será configurado via ambiente
        this.accessToken = null;
        
        // Mapeamento das abas
        this.sheets = {
            louvores: 'Louvores',
            oracoes: 'Orações',
            visitantes: 'Visitantes',
            documentos: 'Documentos',
            avisos: 'Avisos'
        };
        
        // Configuração das colunas para cada aba
        this.columnMappings = {
            louvores: {
                headers: ['ID', 'Cantor', 'Música', 'Link YouTube', 'Observações', 'Data', 'Status'],
                range: 'Louvores!A:G'
            },
            oracoes: {
                headers: ['ID', 'Nome', 'Pedido', 'Reservado', 'Data', 'Status'],
                range: 'Orações!A:F'
            },
            visitantes: {
                headers: ['ID', 'Nome', 'Telefone', 'Endereço', 'Como Conheceu', 'Interesses', 'Data da Visita'],
                range: 'Visitantes!A:G'
            },
            documentos: {
                headers: ['ID', 'Nome', 'Tipo', 'Finalidade', 'Observações', 'Data da Solicitação', 'Status'],
                range: 'Documentos!A:G'
            },
            avisos: {
                headers: ['ID', 'Título', 'Mensagem', 'Autor', 'Data', 'Status'],
                range: 'Avisos!A:F'
            }
        };
        
        this.initializeAuth();
    }

    // Inicializar autenticação
    async initializeAuth() {
        try {
            // Em um ambiente real, isso seria feito via OAuth2 ou Service Account
            // Por enquanto, vamos simular a autenticação
            console.log('Inicializando autenticação com Google Sheets...');
            
            // Verificar se há credenciais salvas
            const savedCredentials = localStorage.getItem('google_sheets_credentials');
            if (savedCredentials) {
                const credentials = JSON.parse(savedCredentials);
                this.accessToken = credentials.access_token;
                console.log('Credenciais carregadas do localStorage');
            }
            
            return true;
        } catch (error) {
            console.error('Erro na autenticação:', error);
            return false;
        }
    }

    // Configurar credenciais manualmente (para desenvolvimento)
    setCredentials(credentials) {
        this.accessToken = credentials.access_token;
        localStorage.setItem('google_sheets_credentials', JSON.stringify(credentials));
        console.log('Credenciais configuradas manualmente');
    }

    // Fazer requisição para a API do Google Sheets
    async makeRequest(url, options = {}) {
        try {
            const defaultOptions = {
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`,
                    'Content-Type': 'application/json'
                }
            };

            const response = await fetch(url, { ...defaultOptions, ...options });
            
            if (!response.ok) {
                throw new Error(`Erro na API: ${response.status} - ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Erro na requisição:', error);
            
            // Fallback para localStorage se a API falhar
            console.log('Usando localStorage como fallback...');
            return null;
        }
    }

    // Ler dados de uma aba específica
    async readSheet(sheetType) {
        try {
            const mapping = this.columnMappings[sheetType];
            if (!mapping) {
                throw new Error(`Tipo de aba não encontrado: ${sheetType}`);
            }

            const url = `https://sheets.googleapis.com/v4/spreadsheets/${this.spreadsheetId}/values/${mapping.range}`;
            const response = await this.makeRequest(url);

            if (!response || !response.values) {
                // Fallback para localStorage
                return this.getLocalData(sheetType);
            }

            // Converter dados da planilha para formato do sistema
            const [headers, ...rows] = response.values;
            const data = rows.map(row => {
                const item = {};
                headers.forEach((header, index) => {
                    const key = this.headerToKey(header);
                    item[key] = row[index] || '';
                });
                return item;
            });

            // Salvar no localStorage como backup
            this.saveLocalData(sheetType, data);
            
            return data;
        } catch (error) {
            console.error(`Erro ao ler aba ${sheetType}:`, error);
            return this.getLocalData(sheetType);
        }
    }

    // Escrever dados em uma aba específica
    async writeSheet(sheetType, data) {
        try {
            const mapping = this.columnMappings[sheetType];
            if (!mapping) {
                throw new Error(`Tipo de aba não encontrado: ${sheetType}`);
            }

            // Preparar dados para a planilha
            const headers = mapping.headers;
            const rows = data.map(item => {
                return headers.map(header => {
                    const key = this.headerToKey(header);
                    return item[key] || '';
                });
            });

            const values = [headers, ...rows];

            const url = `https://sheets.googleapis.com/v4/spreadsheets/${this.spreadsheetId}/values/${mapping.range}`;
            const response = await this.makeRequest(url, {
                method: 'PUT',
                body: JSON.stringify({
                    values: values,
                    majorDimension: 'ROWS'
                })
            });

            if (response) {
                console.log(`Dados salvos na aba ${sheetType}:`, response);
                
                // Salvar no localStorage como backup
                this.saveLocalData(sheetType, data);
                
                return { success: true, message: 'Dados salvos com sucesso!' };
            } else {
                throw new Error('Falha na resposta da API');
            }
        } catch (error) {
            console.error(`Erro ao escrever na aba ${sheetType}:`, error);
            
            // Fallback para localStorage
            this.saveLocalData(sheetType, data);
            return { success: false, message: 'Dados salvos localmente (offline)' };
        }
    }

    // Adicionar uma linha a uma aba específica
    async appendToSheet(sheetType, item) {
        try {
            const mapping = this.columnMappings[sheetType];
            if (!mapping) {
                throw new Error(`Tipo de aba não encontrado: ${sheetType}`);
            }

            // Preparar dados para adicionar
            const headers = mapping.headers;
            const row = headers.map(header => {
                const key = this.headerToKey(header);
                return item[key] || '';
            });

            const url = `https://sheets.googleapis.com/v4/spreadsheets/${this.spreadsheetId}/values/${mapping.range}:append`;
            const response = await this.makeRequest(url, {
                method: 'POST',
                body: JSON.stringify({
                    values: [row],
                    majorDimension: 'ROWS'
                }),
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response) {
                console.log(`Item adicionado à aba ${sheetType}:`, response);
                
                // Adicionar ao localStorage como backup
                this.appendLocalData(sheetType, item);
                
                return { success: true, message: 'Item adicionado com sucesso!' };
            } else {
                throw new Error('Falha na resposta da API');
            }
        } catch (error) {
            console.error(`Erro ao adicionar à aba ${sheetType}:`, error);
            
            // Fallback para localStorage
            this.appendLocalData(sheetType, item);
            return { success: false, message: 'Item salvo localmente (offline)' };
        }
    }

    // Converter cabeçalho para chave do objeto
    headerToKey(header) {
        return header.toLowerCase()
            .replace(/\s+/g, '_')
            .replace(/[^a-z0-9_]/g, '')
            .replace(/^_+|_+$/g, '');
    }

    // Métodos de fallback para localStorage
    getLocalData(sheetType) {
        const key = `ad_jardim_marcia_${sheetType}`;
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : [];
    }

    saveLocalData(sheetType, data) {
        const key = `ad_jardim_marcia_${sheetType}`;
        localStorage.setItem(key, JSON.stringify(data));
    }

    appendLocalData(sheetType, item) {
        const data = this.getLocalData(sheetType);
        data.push(item);
        this.saveLocalData(sheetType, data);
    }

    // Sincronizar dados locais com a planilha
    async syncLocalToSheets() {
        const results = {};
        
        for (const sheetType of Object.keys(this.sheets)) {
            try {
                const localData = this.getLocalData(sheetType);
                if (localData.length > 0) {
                    const result = await this.writeSheet(sheetType, localData);
                    results[sheetType] = result;
                } else {
                    results[sheetType] = { success: true, message: 'Nenhum dado para sincronizar' };
                }
            } catch (error) {
                results[sheetType] = { success: false, message: error.message };
            }
        }
        
        return results;
    }

    // Verificar status da conexão
    async checkConnection() {
        try {
            const url = `https://sheets.googleapis.com/v4/spreadsheets/${this.spreadsheetId}`;
            const response = await this.makeRequest(url);
            return response !== null;
        } catch (error) {
            console.error('Erro na verificação de conexão:', error);
            return false;
        }
    }

    // Obter URL da planilha
    getSpreadsheetUrl() {
        return `https://docs.google.com/spreadsheets/d/${this.spreadsheetId}/edit`;
    }
}

// Instância global da integração
window.googleSheetsIntegration = new GoogleSheetsIntegration();

// Função para configurar credenciais (para desenvolvimento)
window.configureGoogleSheets = function(accessToken) {
    window.googleSheetsIntegration.setCredentials({ access_token: accessToken });
};

