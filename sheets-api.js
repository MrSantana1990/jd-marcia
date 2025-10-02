// Google Sheets API Integration Module
class SheetsAPI {
    constructor() {
        this.spreadsheetId = '1VCzpN_lkaeX8C8wIk77Nw4_YFjgnuXrL3Zle19q0Yig';
        this.baseUrl = 'https://docs.google.com/spreadsheets/d/' + this.spreadsheetId;
        
        // Mapeamento das abas
        this.sheets = {
            louvores: 'Louvores',
            oracoes: 'Orações', 
            visitantes: 'Visitantes',
            documentos: 'Documentos',
            avisos: 'Avisos'
        };
        
        // Estrutura das colunas para cada aba
        this.columns = {
            louvores: ['ID', 'Título', 'Autor', 'Data', 'Status'],
            oracoes: ['ID', 'Solicitante', 'Pedido', 'Data', 'Status'],
            visitantes: ['ID', 'Nome', 'Telefone', 'Email', 'Data da Visita', 'Observações'],
            documentos: ['ID', 'Título', 'Tipo de Documento', 'Data da Solicitação'],
            avisos: ['ID', 'Título', 'Mensagem', 'Data', 'Status']
        };
    }

    // Função para gerar CSV a partir dos dados
    generateCSV(data, columns) {
        if (!data || data.length === 0) return columns.join(',') + '\n';
        
        let csv = columns.join(',') + '\n';
        data.forEach(item => {
            const row = columns.map(col => {
                const value = item[col.toLowerCase().replace(/\s+/g, '_')] || '';
                return '"' + String(value).replace(/"/g, '""') + '"';
            });
            csv += row.join(',') + '\n';
        });
        return csv;
    }

    // Função para fazer download do CSV (simulação de envio para planilha)
    async saveToSheet(sheetName, data) {
        try {
            const columns = this.columns[sheetName];
            if (!columns) {
                throw new Error('Aba não encontrada: ' + sheetName);
            }

            const csv = this.generateCSV(data, columns);
            
            // Simula o salvamento - em um ambiente real, usaria a API do Google Sheets
            console.log('Dados salvos na aba:', sheetName);
            console.log('CSV gerado:', csv);
            
            // Salva no localStorage como backup
            localStorage.setItem('sheets_backup_' + sheetName, JSON.stringify(data));
            
            return { success: true, message: 'Dados salvos com sucesso!' };
        } catch (error) {
            console.error('Erro ao salvar na planilha:', error);
            return { success: false, message: error.message };
        }
    }

    // Função para carregar dados da planilha (simulação)
    async loadFromSheet(sheetName) {
        try {
            // Em um ambiente real, faria uma requisição para a API do Google Sheets
            // Por enquanto, carrega do localStorage como fallback
            const backup = localStorage.getItem('sheets_backup_' + sheetName);
            if (backup) {
                return JSON.parse(backup);
            }
            return [];
        } catch (error) {
            console.error('Erro ao carregar da planilha:', error);
            return [];
        }
    }

    // Função para sincronizar dados do localStorage com a planilha
    async syncAllData() {
        const results = {};
        
        for (const [key, sheetName] of Object.entries(this.sheets)) {
            try {
                // Carrega dados do localStorage
                const localData = JSON.parse(localStorage.getItem(key) || '[]');
                
                if (localData.length > 0) {
                    const result = await this.saveToSheet(key, localData);
                    results[key] = result;
                } else {
                    results[key] = { success: true, message: 'Nenhum dado para sincronizar' };
                }
            } catch (error) {
                results[key] = { success: false, message: error.message };
            }
        }
        
        return results;
    }

    // Função para gerar link direto para a aba da planilha
    getSheetUrl(sheetName) {
        const gid = this.getSheetGid(sheetName);
        return this.baseUrl + '/edit#gid=' + gid;
    }

    // Função para obter o GID da aba (simulado)
    getSheetGid(sheetName) {
        const gids = {
            louvores: '0',
            oracoes: '1', 
            visitantes: '2',
            documentos: '3',
            avisos: '4'
        };
        return gids[sheetName] || '0';
    }

    // Função para exportar dados como CSV para download
    exportToCSV(sheetName, data) {
        const columns = this.columns[sheetName];
        if (!columns) return null;

        const csv = this.generateCSV(data, columns);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', sheetName + '_export.csv');
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }
}

// Instância global da API
window.sheetsAPI = new SheetsAPI();

