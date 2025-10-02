// AD Jardim Márcia - Sistema Modernizado V2
document.addEventListener('DOMContentLoaded', function() {
    console.log('Sistema AD Jardim Márcia V2 inicializado');
    
    // Inicializar sistema
    initializeSystem();
    
    // Configurar navegação
    setupNavigation();
    
    // Configurar formulários
    setupForms();
    
    // Carregar avisos
    loadAvisos();
    
    // Configurar transmissão
    setupTransmission();
    
    // Configurar auto-refresh
    setupAutoRefresh();
});

// Configuração do backend
const BACKEND_URL = window.CONFIG ? window.CONFIG.BACKEND_URL : 'http://localhost:8000';

// Estado da aplicação
const appState = {
    currentSection: 'inicio',
    avisos: [],
    isLoading: false,
    lastUpdate: null
};

// Inicialização do sistema
function initializeSystem() {
    console.log('Inicializando sistema V2...');
    
    // Verificar conectividade com backend
    checkBackendHealth();
    
    // Configurar service worker para PWA (se disponível)
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js').catch(err => {
            console.log('Service Worker registration failed:', err);
        });
    }
    
    // Configurar notificações de erro global
    window.addEventListener('error', handleGlobalError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
}

// Verificar saúde do backend
async function checkBackendHealth() {
    try {
        const response = await fetch(`${BACKEND_URL}/api/health`);
        const data = await response.json();
        
        if (data.status === 'OK') {
            console.log('✅ Backend conectado:', data.message);
            showToast('Sistema conectado com sucesso!', 'success');
        } else {
            throw new Error('Backend não está funcionando corretamente');
        }
    } catch (error) {
        console.error('❌ Erro ao conectar com backend:', error);
        showToast('Erro de conexão. Usando dados locais.', 'warning');
        loadLocalData();
    }
}

// Configurar navegação por abas (melhorada)
function setupNavigation() {
    const navButtons = document.querySelectorAll('.nav-tab');
    const sections = document.querySelectorAll('.section');

    navButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetSection = this.dataset.section;
            
            // Se for área do membro, abrir link externo
            if (this.classList.contains('area-membro')) {
                window.open('https://adcamp.app/', '_blank');
                return;
            }
            
            // Verificar se a seção existe
            if (!targetSection) {
                console.warn('Seção não definida para o botão:', this);
                return;
            }
            
            // Atualizar estado
            appState.currentSection = targetSection;
            
            // Remover classe active de todos os botões e seções
            navButtons.forEach(btn => btn.classList.remove('active'));
            sections.forEach(section => section.classList.remove('active'));
            
            // Adicionar classe active ao botão clicado
            this.classList.add('active');
            
            // Mostrar seção correspondente com animação
            const targetElement = document.getElementById(targetSection);
            if (targetElement) {
                targetElement.classList.add('active');
                
                // Scroll suave para o topo
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
                
                // Trigger evento personalizado
                window.dispatchEvent(new CustomEvent('sectionChanged', {
                    detail: { section: targetSection }
                }));
            } else {
                console.error('Seção não encontrada:', targetSection);
                showToast('Seção não encontrada', 'error');
            }
        });
    });
    
    // Configurar navegação por teclado
    document.addEventListener('keydown', function(e) {
        if (e.altKey) {
            const keyMap = {
                '1': 'inicio',
                '2': 'horarios',
                '3': 'louvores',
                '4': 'oracoes',
                '5': 'visitantes',
                '6': 'pix',
                '7': 'agenda'
            };
            
            const section = keyMap[e.key];
            if (section) {
                const button = document.querySelector(`[data-section="${section}"]`);
                if (button) button.click();
            }
        }
    });
}

// Configurar formulários (melhorado)
function setupForms() {
    // Formulário de Louvores
    const louvorForm = document.getElementById('louvor-form');
    if (louvorForm) {
        louvorForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            const data = {
                nome: formData.get('nome'),
                telefone: formData.get('telefone') || '',
                email: formData.get('email') || '',
                motivo: formData.get('motivo') || '',
                timestamp: new Date().toISOString(),
                tipo: 'louvor'
            };
            
            await submitData('/api/louvores', data, this, 'Louvor enviado com sucesso!');
        });
    }
    
    // Formulário de Orações
    const oracaoForm = document.getElementById('oracao-form');
    if (oracaoForm) {
        oracaoForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            const data = {
                nome: formData.get('nome'),
                telefone: formData.get('telefone') || '',
                email: formData.get('email') || '',
                motivo: formData.get('motivo') || '',
                timestamp: new Date().toISOString(),
                tipo: 'oracao'
            };
            
            await submitData('/api/oracoes', data, this, 'Pedido de oração enviado com sucesso!');
        });
    }
    
    // Formulário de Visitantes
    const visitanteForm = document.getElementById('visitante-form');
    if (visitanteForm) {
        visitanteForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            const data = {
                nome: formData.get('nome'),
                telefone: formData.get('telefone') || '',
                email: formData.get('email') || '',
                endereco: formData.get('endereco') || '',
                cidade: formData.get('cidade') || '',
                como_conheceu: formData.get('como_conheceu') || '',
                observacoes: formData.get('observacoes') || '',
                timestamp: new Date().toISOString(),
                tipo: 'visitante'
            };
            
            await submitData('/api/visitantes', data, this, 'Dados de visitante enviados com sucesso!');
        });
    }
    
    // Configurar validação em tempo real
    setupFormValidation();
}

// Configurar validação de formulários
function setupFormValidation() {
    const requiredFields = document.querySelectorAll('input[required], textarea[required], select[required]');
    
    requiredFields.forEach(field => {
        field.addEventListener('blur', function() {
            validateField(this);
        });
        
        field.addEventListener('input', function() {
            if (this.classList.contains('error')) {
                validateField(this);
            }
        });
    });
}

// Validar campo individual
function validateField(field) {
    const value = field.value.trim();
    const isValid = value.length > 0;
    
    if (isValid) {
        field.classList.remove('error');
        field.classList.add('valid');
    } else {
        field.classList.remove('valid');
        field.classList.add('error');
    }
    
    return isValid;
}

// Submeter dados para o backend (melhorado)
async function submitData(endpoint, data, form, successMessage) {
    const submitButton = form.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    
    try {
        // Validar formulário
        const requiredFields = form.querySelectorAll('input[required], textarea[required], select[required]');
        let isValid = true;
        
        requiredFields.forEach(field => {
            if (!validateField(field)) {
                isValid = false;
            }
        });
        
        if (!isValid) {
            showToast('Por favor, preencha todos os campos obrigatórios', 'error');
            return;
        }
        
        // Mostrar loading
        submitButton.textContent = 'Enviando...';
        submitButton.disabled = true;
        
        const response = await fetch(`${BACKEND_URL}${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (response.ok && result.success) {
            showToast(successMessage, 'success');
            form.reset();
            
            // Limpar classes de validação
            requiredFields.forEach(field => {
                field.classList.remove('valid', 'error');
            });
            
            // Atualizar dados se for aviso
            if (endpoint.includes('avisos')) {
                setTimeout(loadAvisos, 1000);
            }
        } else {
            throw new Error(result.error || 'Erro ao enviar dados');
        }
    } catch (error) {
        console.error('Erro ao submeter dados:', error);
        showToast('Erro ao enviar dados. Tente novamente.', 'error');
        
        // Salvar localmente como backup
        saveLocalData(endpoint, data);
    } finally {
        // Restaurar botão
        submitButton.textContent = originalText;
        submitButton.disabled = false;
    }
}

// Carregar avisos (melhorado)
async function loadAvisos() {
    const container = document.getElementById('mural-avisos-container');
    if (!container) return;
    
    // Mostrar loading
    container.innerHTML = '<p class="loading-avisos">Carregando avisos...</p>';
    appState.isLoading = true;
    
    try {
        const response = await fetch(`${BACKEND_URL}/api/avisos`);
        const result = await response.json();
        
        if (response.ok && result.success) {
            appState.avisos = result.data || [];
            appState.lastUpdate = new Date();
            displayAvisos(appState.avisos);
            
            // Salvar no localStorage como backup
            localStorage.setItem('avisos_backup', JSON.stringify({
                data: appState.avisos,
                timestamp: appState.lastUpdate.toISOString()
            }));
        } else {
            throw new Error(result.error || 'Erro ao carregar avisos');
        }
    } catch (error) {
        console.error('Erro ao carregar avisos:', error);
        
        // Tentar carregar dados locais
        const backup = localStorage.getItem('avisos_backup');
        if (backup) {
            const backupData = JSON.parse(backup);
            appState.avisos = backupData.data;
            displayAvisos(appState.avisos);
            showToast('Carregando avisos salvos localmente', 'warning');
        } else {
            container.innerHTML = '<div class="no-avisos">Erro ao carregar avisos. Tente novamente mais tarde.</div>';
        }
    } finally {
        appState.isLoading = false;
    }
}

// Exibir avisos (melhorado)
function displayAvisos(avisos) {
    const container = document.getElementById('mural-avisos-container');
    if (!container) return;
    
    if (!avisos || avisos.length <= 1) { // <= 1 porque o primeiro item é o header
        container.innerHTML = '<div class="no-avisos">Nenhum aviso disponível no momento.</div>';
        return;
    }
    
    // Filtrar header e avisos ativos
    const avisosAtivos = avisos.slice(1).filter(aviso => {
        const status = aviso[4]; // Coluna de status
        return status && status.toLowerCase() !== 'inativo';
    });
    
    if (avisosAtivos.length === 0) {
        container.innerHTML = '<div class="no-avisos">Nenhum aviso ativo no momento.</div>';
        return;
    }
    
    container.innerHTML = avisosAtivos.map((aviso, index) => {
        const [id, titulo, autor, data, status, conteudo, url] = aviso;
        
        return `
            <div class="aviso-card" style="animation-delay: ${index * 0.1}s">
                <h4>${titulo || 'Aviso'}</h4>
                <p>${conteudo || 'Conteúdo do aviso'}</p>
                ${autor ? `<small>Por: ${autor}</small>` : ''}
                ${data ? `<small> • ${formatDate(data)}</small>` : ''}
                ${url ? `<br><a href="${url}" target="_blank" style="color: #fff; text-decoration: underline;">Saiba mais</a>` : ''}
            </div>
        `;
    }).join('');
}

// Configurar transmissão (melhorado)
function setupTransmission() {
    // Configurar botões de transmissão
    const transmitAvisosBtn = document.querySelector('[onclick="transmitirAvisos()"]');
    const transmitPixBtn = document.querySelector('[onclick="transmitirPIX()"]');
    
    if (transmitAvisosBtn) {
        transmitAvisosBtn.onclick = function() {
            transmitirAvisos();
        };
    }
    
    if (transmitPixBtn) {
        transmitPixBtn.onclick = function() {
            transmitirPIX();
        };
    }
}

// Transmitir avisos
function transmitirAvisos() {
    const telaoUrl = window.location.origin + '/telao.html';
    const newWindow = window.open(telaoUrl, 'telao', 'width=1920,height=1080,fullscreen=yes');
    
    if (newWindow) {
        showToast('Telão de avisos aberto!', 'success');
    } else {
        showToast('Erro ao abrir telão. Verifique o bloqueador de pop-ups.', 'error');
    }
}

// Transmitir PIX
function transmitirPIX() {
    const telaoUrl = window.location.origin + '/telao.html#pix';
    const newWindow = window.open(telaoUrl, 'telao-pix', 'width=1920,height=1080,fullscreen=yes');
    
    if (newWindow) {
        showToast('Telão PIX aberto!', 'success');
    } else {
        showToast('Erro ao abrir telão. Verifique o bloqueador de pop-ups.', 'error');
    }
}

// Configurar auto-refresh
function setupAutoRefresh() {
    // Atualizar avisos a cada 2 minutos
    setInterval(() => {
        if (!appState.isLoading && appState.currentSection === 'inicio') {
            loadAvisos();
        }
    }, 2 * 60 * 1000);
    
    // Verificar conectividade a cada 5 minutos
    setInterval(checkBackendHealth, 5 * 60 * 1000);
}

// Salvar dados localmente
function saveLocalData(endpoint, data) {
    try {
        const key = `local_${endpoint.replace('/api/', '')}`;
        const existing = JSON.parse(localStorage.getItem(key) || '[]');
        existing.push({
            ...data,
            savedAt: new Date().toISOString(),
            synced: false
        });
        localStorage.setItem(key, JSON.stringify(existing));
        console.log('Dados salvos localmente:', key);
    } catch (error) {
        console.error('Erro ao salvar dados localmente:', error);
    }
}

// Carregar dados locais
function loadLocalData() {
    try {
        const backup = localStorage.getItem('avisos_backup');
        if (backup) {
            const backupData = JSON.parse(backup);
            appState.avisos = backupData.data;
            displayAvisos(appState.avisos);
        }
    } catch (error) {
        console.error('Erro ao carregar dados locais:', error);
    }
}

// Mostrar toast (melhorado)
function showToast(message, type = 'info', duration = 4000) {
    // Remover toast existente
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
        existingToast.remove();
    }
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    
    // Adicionar ícone baseado no tipo
    const icons = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
    };
    
    toast.innerHTML = `${icons[type] || icons.info} ${message}`;
    
    document.body.appendChild(toast);
    
    // Mostrar toast
    setTimeout(() => toast.classList.add('show'), 100);
    
    // Remover toast
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

// Formatear data
function formatDate(dateString) {
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (error) {
        return dateString;
    }
}

// Copiar texto para clipboard
function copyToClipboard(text) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => {
            showToast('Texto copiado!', 'success');
        }).catch(() => {
            fallbackCopyToClipboard(text);
        });
    } else {
        fallbackCopyToClipboard(text);
    }
}

// Fallback para copiar texto
function fallbackCopyToClipboard(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
        document.execCommand('copy');
        showToast('Texto copiado!', 'success');
    } catch (err) {
        showToast('Erro ao copiar texto', 'error');
    }
    
    document.body.removeChild(textArea);
}

// Tratamento de erros globais
function handleGlobalError(event) {
    console.error('Erro global:', event.error);
    showToast('Ocorreu um erro inesperado', 'error');
}

function handleUnhandledRejection(event) {
    console.error('Promise rejeitada:', event.reason);
    showToast('Erro de conexão', 'error');
}

// Configurar botões de cópia PIX
document.addEventListener('DOMContentLoaded', function() {
    const copyButtons = document.querySelectorAll('.copy-btn');
    copyButtons.forEach(button => {
        button.addEventListener('click', function() {
            const pixKey = this.parentElement.querySelector('.pix-key-text');
            if (pixKey) {
                copyToClipboard(pixKey.textContent);
            }
        });
    });
});

// Exportar funções globais para compatibilidade
window.transmitirAvisos = transmitirAvisos;
window.transmitirPIX = transmitirPIX;
window.copyToClipboard = copyToClipboard;
window.showToast = showToast;

