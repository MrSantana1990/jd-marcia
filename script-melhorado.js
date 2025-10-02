// AD Jardim Márcia - Sistema Melhorado
document.addEventListener('DOMContentLoaded', function() {
    console.log('Sistema AD Jardim Márcia Melhorado inicializado');
    
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
    
    // Configurar PIX
    setupPIX();

    // Configurar integração do calendário na página principal
    setupCalendarIntegration();

    // Configurar banner de instalação PWA
    setupPWAInstallPrompt();
});

// Configuração do backend
const BACKEND_URL = window.CONFIG ? window.CONFIG.BACKEND_URL : 'http://localhost:5500';

// Estado da aplicação
const appState = {
    currentSection: 'inicio',
    avisos: [],
    isLoading: false,
    lastUpdate: null,
    showAllAvisos: false
};

let deferredInstallPrompt = null;

// Inicialização do sistema
function initializeSystem() {
    console.log('Inicializando sistema melhorado...');
    
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

// Função para mostrar seção (usada pelo botão de ação rápida)
function showSection(sectionName) {
    const navButton = document.querySelector(`[data-section="${sectionName}"]`);
    if (navButton) {
        navButton.click();
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
                nome: formData.get('nome') || '',
                musica: formData.get('musica') || '',
                artista: formData.get('artista') || '',
                linkYouTube: formData.get('linkYouTube') || '',
                observacoes: formData.get('observacoes') || ''
            };
            
            await submitData('/api/louvores', data, this, 'Pedido de louvor enviado com sucesso!');
        });
    }
    
    // Formulário de Orações
    const oracaoForm = document.getElementById('oracao-form');
    if (oracaoForm) {
        oracaoForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            const data = {
                nome: formData.get('nome') || '',
                pedido: formData.get('pedido') || '',
                reservado: formData.get('reservado') ? 'Sim' : 'Não'
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
            
            // Coletar interesses selecionados
            const interessesCheckboxes = this.querySelectorAll('input[name="interesses"]:checked');
            const interesses = Array.from(interessesCheckboxes).map(cb => cb.value).join(', ');
            
            const data = {
                nome: formData.get('nome') || '',
                telefone: formData.get('telefone') || '',
                email: formData.get('email') || '',
                endereco: formData.get('endereco') || '',
                comoConheceu: formData.get('comoConheceu') || '',
                interesses: interesses
            };
            
            await submitData('/api/visitantes', data, this, 'Cadastro de visitante enviado com sucesso!');
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
        field.style.borderColor = '#10b981';
    } else {
        field.classList.remove('valid');
        field.classList.add('error');
        field.style.borderColor = '#ef4444';
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
        submitButton.style.opacity = '0.7';
        
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
                field.style.borderColor = '';
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
        submitButton.style.opacity = '1';
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
            console.log('falso',result);
            throw new Error(result.error || 'Erro ao carregar avisos');
        }
    } catch (error) {
        console.log('erros',error);
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
    
    if (!avisos || avisos.length === 0) {
        container.innerHTML = '<div class="no-avisos">Nenhum aviso disponível no momento.</div>';
        return;
    }
    
    // Filtrar avisos ativos
    const avisosAtivos = avisos.filter(aviso => {
        const status = aviso.status || aviso[6]; // Compatibilidade com formatos diferentes
        return status && status.toLowerCase() !== 'inativo';
    });
    
    if (avisosAtivos.length === 0) {
        container.innerHTML = '<div class="no-avisos">Nenhum aviso ativo no momento.</div>';
        return;
    }
    
    const expanded = !!appState.showAllAvisos;
    const toShow = expanded ? avisosAtivos : avisosAtivos.slice(0, 4);

    const cards = toShow.map((aviso, index) => {
        // Suporte para diferentes formatos de dados
        const titulo = aviso.titulo || aviso[2] || 'Aviso';
        const mensagem = aviso.mensagem || aviso[3] || 'Conteúdo do aviso';
        const autor = aviso.autor || aviso[4] || '';
        const timestamp = aviso.timestamp || aviso[1] || '';
        
        return `
            <div class="aviso-card" style="animation-delay: ${index * 0.1}s">
                <h4>${titulo}</h4>
                <p>${mensagem}</p>
                ${autor ? `<small>Por: ${autor}</small>` : ''}
                ${timestamp ? `<small> • ${formatDate(timestamp)}</small>` : ''}
            </div>
        `;
    }).join('');

    const hasMore = avisosAtivos.length > 4;
    const footer = hasMore ? `
        <div class="avisos-footer" style="display:flex;justify-content:center;margin-top:12px;">
            <button id="toggle-avisos" class="btn" style="padding:10px 16px;border-radius:10px;">${expanded ? 'Ver menos' : 'Ver mais avisos'}</button>
        </div>
    ` : '';

    container.innerHTML = `${cards}${footer}`;

    const toggle = document.getElementById('toggle-avisos');
    if (toggle) {
        toggle.addEventListener('click', () => {
            appState.showAllAvisos = !appState.showAllAvisos;
            displayAvisos(avisos);
        });
    }
}

// Configurar transmissão (melhorado)
function setupTransmission() {
    // Configurar botões de transmissão
    window.transmitirAvisos = function() {
        const telaoUrl = window.location.origin + '/telao.html';
        const newWindow = window.open(telaoUrl, 'telao', 'width=1920,height=1080,fullscreen=yes');
        
        if (newWindow) {
            showToast('Telão de avisos aberto!', 'success');
        } else {
            showToast('Erro ao abrir telão. Verifique o bloqueador de pop-ups.', 'error');
        }
    };
    
    window.transmitirPIX = function() {
        const telaoUrl = window.location.origin + '/telao.html#pix';
        const newWindow = window.open(telaoUrl, 'telao-pix', 'width=1920,height=1080,fullscreen=yes');
        
        if (newWindow) {
            showToast('Telão PIX aberto!', 'success');
        } else {
            showToast('Erro ao abrir telão. Verifique o bloqueador de pop-ups.', 'error');
        }
    };
}

// Configurar PIX
function setupPIX() {
    const copyPixBtn = document.getElementById('copy-pix');
    const copyObsBtn = document.getElementById('copy-obs');
    const sendProofBtn = document.getElementById('send-proof-wa');
    
    if (copyPixBtn) {
        copyPixBtn.addEventListener('click', function() {
            const pixKey = document.getElementById('pix-key-display').textContent;
            copyToClipboard(pixKey, 'Chave PIX copiada!');
        });
    }
    
    if (copyObsBtn) {
        copyObsBtn.addEventListener('click', function() {
            const pixObs = document.getElementById('pix-obs-display').textContent;
            copyToClipboard(pixObs, 'Observação copiada!');
        });
    }

    if (sendProofBtn) {
        sendProofBtn.addEventListener('click', function() {
            const key = (document.getElementById('pix-key-display')?.textContent || '').trim();
            const obs = (document.getElementById('pix-obs-display')?.textContent || '').trim();
            const phone = '5519992302478'; // Irmã Márcia
            const msg = `Paz do Senhor! Segue o comprovante do PIX.\nChave: ${key}\nObservação: ${obs}`;
            const url = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
            window.open(url, '_blank');
        });
    }
}

function createInstallBanner() {
    let banner = document.getElementById('installBanner');
    if (banner) {
        return banner;
    }

    banner = document.createElement('div');
    banner.id = 'installBanner';
    banner.className = 'install-banner';
    banner.innerHTML = [
        '<img src="icons/jdmarcia-icon-192.png" alt="Ícone JDMarcia">',
        '<div class="install-info">',
        '    <strong>Instalar JDMarcia</strong>',
        '    <span>Adicione o app ao seu dispositivo para acesso rápido.</span>',
        '</div>',
        '<div class="install-actions">',
        '    <button class="install-now">Instalar agora</button>',
        '    <button class="dismiss-install">Mais tarde</button>',
        '</div>'
    ].join('');

    document.body.appendChild(banner);
    return banner;
}

function setupPWAInstallPrompt() {
    const banner = createInstallBanner();
    const installBtn = banner.querySelector('.install-now');
    const dismissBtn = banner.querySelector('.dismiss-install');

    if (!installBtn || !dismissBtn) {
        console.warn('Banner de instalação não pôde ser carregado corretamente.');
        return;
    }

    window.addEventListener('beforeinstallprompt', (event) => {
        event.preventDefault();
        deferredInstallPrompt = event;
        banner.classList.add('visible');
    });

    window.addEventListener('appinstalled', () => {
        deferredInstallPrompt = null;
        banner.classList.remove('visible');
        showToast('JDMarcia instalado no seu dispositivo!', 'success');
    });

    installBtn.addEventListener('click', async () => {
        if (!deferredInstallPrompt) {
            showToast('Instalação não disponível no momento.', 'warning');
            return;
        }

        banner.classList.remove('visible');
        deferredInstallPrompt.prompt();

        try {
            const choiceResult = await deferredInstallPrompt.userChoice;
            if (choiceResult.outcome === 'accepted') {
                showToast('Aplicativo instalado com sucesso!', 'success');
            } else {
                showToast('Instalação cancelada.', 'info');
            }
        } catch (error) {
            console.error('Erro ao exibir prompt de instalação:', error);
            showToast('Não foi possível iniciar a instalação.', 'error');
        }

        deferredInstallPrompt = null;
    });

    dismissBtn.addEventListener('click', () => {
        banner.classList.remove('visible');
        deferredInstallPrompt = null;
    });
}

// Copiar para clipboard
function copyToClipboard(text, successMessage) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => {
            showToast(successMessage, 'success');
        }).catch(err => {
            console.error('Erro ao copiar:', err);
            fallbackCopyTextToClipboard(text, successMessage);
        });
    } else {
        fallbackCopyTextToClipboard(text, successMessage);
    }
}

// Fallback para copiar texto
function fallbackCopyTextToClipboard(text, successMessage) {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-999999px";
    textArea.style.top = "-999999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
        const successful = document.execCommand('copy');
        if (successful) {
            showToast(successMessage, 'success');
        } else {
            showToast('Erro ao copiar texto', 'error');
        }
    } catch (err) {
        console.error('Fallback: Erro ao copiar', err);
        showToast('Erro ao copiar texto', 'error');
    }
    
    document.body.removeChild(textArea);
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

// === Integração com Google Calendar na página principal ===
function getCalendarIdFromConfig() {
    try {
        const cfg = JSON.parse(localStorage.getItem('ad_jardim_marcia_config') || '{}');
        return cfg.calendarId || 'jdmarciaad@gmail.com';
    } catch (e) {
        return 'jdmarciaad@gmail.com';
    }
}

function setupCalendarIntegration() {
    const addCalendarBtn = document.getElementById('add-calendar');
    if (addCalendarBtn) {
        addCalendarBtn.addEventListener('click', function() {
            const cid = getCalendarIdFromConfig();
            const link = `https://calendar.google.com/calendar/u/0/r?cid=${encodeURIComponent(cid)}`;
            showToast('Abrindo Google Calendar…', 'info');
            window.open(link, '_blank');
        });
    }
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
        showToast('Dados salvos localmente para sincronização posterior', 'info');
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
    const existingToast = document.querySelector('.notification-toast.show');
    if (existingToast) {
        existingToast.classList.remove('show');
        setTimeout(() => existingToast.remove(), 300);
    }
    
    const toast = document.getElementById('notification-toast');
    if (!toast) return;
    
    // Configurar toast
    toast.textContent = message;
    toast.className = `notification-toast ${type}`;
    
    // Mostrar toast
    setTimeout(() => toast.classList.add('show'), 100);
    
    // Ocultar toast após duração especificada
    setTimeout(() => {
        toast.classList.remove('show');
    }, duration);
}

// Formatar data
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

// Manipuladores de erro global
function handleGlobalError(event) {
    console.error('Erro global:', event.error);
    showToast('Ocorreu um erro inesperado', 'error');
}

function handleUnhandledRejection(event) {
    console.error('Promise rejeitada:', event.reason);
    showToast('Erro de conexão', 'error');
}

// Configurar agenda (se necessário)
document.addEventListener('DOMContentLoaded', function() {
    const addCalendarBtn = document.getElementById('add-calendar');
    const receiveAlertsBtn = document.getElementById('receive-alerts');
    
    if (addCalendarBtn) {
        addCalendarBtn.addEventListener('click', function() {
            showToast('Funcionalidade em desenvolvimento', 'info');
        });
    }
    
    if (receiveAlertsBtn) {
        receiveAlertsBtn.addEventListener('click', function() {
            showToast('Funcionalidade em desenvolvimento', 'info');
        });
    }
});

// Exportar funções globais necessárias
window.showSection = showSection;
window.transmitirAvisos = function() {
    const telaoUrl = window.location.origin + '/telao.html';
    const newWindow = window.open(telaoUrl, 'telao', 'width=1920,height=1080,fullscreen=yes');
    
    if (newWindow) {
        showToast('Telão de avisos aberto!', 'success');
    } else {
        showToast('Erro ao abrir telão. Verifique o bloqueador de pop-ups.', 'error');
    }
};

window.transmitirPIX = function() {
    const telaoUrl = window.location.origin + '/telao.html#pix';
    const newWindow = window.open(telaoUrl, 'telao-pix', 'width=1920,height=1080,fullscreen=yes');
    
    if (newWindow) {
        showToast('Telão PIX aberto!', 'success');
    } else {
        showToast('Erro ao abrir telão. Verifique o bloqueador de pop-ups.', 'error');
    }
};
