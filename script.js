// Sistema AD Jardim Márcia - Script Principal
document.addEventListener('DOMContentLoaded', function() {
    console.log('Sistema AD Jardim Márcia inicializado');
    
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
});

// Configuração do backend
const BACKEND_URL = window.CONFIG ? window.CONFIG.BACKEND_URL : 'http://localhost:8000';

// Inicialização do sistema
function initializeSystem() {
    console.log('Inicializando sistema...');
    
    // Verificar se há avisos salvos localmente
    const savedAvisos = localStorage.getItem('avisos');
    if (savedAvisos) {
        try {
            const avisos = JSON.parse(savedAvisos);
            displayAvisos(avisos);
        } catch (e) {
            console.error('Erro ao carregar avisos salvos:', e);
        }
    }
}

// Configurar navegação por abas
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
            
            // Remover classe active de todos os botões e seções
            navButtons.forEach(btn => btn.classList.remove('active'));
            sections.forEach(section => section.classList.remove('active'));
            
            // Adicionar classe active ao botão clicado
            this.classList.add('active');
            
            // Mostrar seção correspondente
            const targetElement = document.getElementById(targetSection);
            if (targetElement) {
                targetElement.classList.add('active');
                
                // Scroll suave para o topo
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Configurar formulários
function setupForms() {
    // Formulário de Louvores
    const louvorForm = document.getElementById('louvor-form');
    if (louvorForm) {
        louvorForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            const data = {
                nome: formData.get('nome'),
                musica: formData.get('musica'),
                artista: formData.get('artista'),
                observacoes: formData.get('observacoes') || '',
                timestamp: new Date().toISOString(),
                tipo: 'louvor'
            };
            
            submitData('/api/louvores', data, this);
        });
    }
    
    // Formulário de Orações
    const oracaoForm = document.getElementById('oracao-form');
    if (oracaoForm) {
        oracaoForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            const data = {
                nome: formData.get('nome'),
                pedido: formData.get('pedido'),
                reservado: formData.get('reservado') ? 'Sim' : 'Não',
                timestamp: new Date().toISOString(),
                tipo: 'oracao'
            };
            
            submitData('/api/oracoes', data, this);
        });
    }
    
    // Formulário de Visitantes
    const visitanteForm = document.getElementById('visitante-form');
    if (visitanteForm) {
        visitanteForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            const data = {
                nome: formData.get('nome'),
                telefone: formData.get('telefone'),
                email: formData.get('email') || '',
                endereco: formData.get('endereco') || '',
                como_conheceu: formData.get('como_conheceu'),
                timestamp: new Date().toISOString(),
                tipo: 'visitante'
            };
            
            submitData('/api/visitantes', data, this);
        });
    }
}

// Função para enviar dados para o backend
async function submitData(endpoint, data, form) {
    try {
        showToast('Enviando...', 'info');
        
        const response = await fetch(BACKEND_URL + endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        
        if (response.ok) {
            const result = await response.json();
            showToast('Dados enviados com sucesso!', 'success');
            form.reset();
        } else {
            throw new Error('Erro na resposta do servidor');
        }
    } catch (error) {
        console.error('Erro ao enviar dados:', error);
        showToast('Erro ao enviar dados. Tente novamente.', 'error');
    }
}

// Carregar avisos do backend
async function loadAvisos() {
    try {
        const response = await fetch(BACKEND_URL + '/api/avisos');
        
        if (response.ok) {
            const avisos = await response.json();
            displayAvisos(avisos);
            
            // Salvar avisos localmente
            localStorage.setItem('avisos', JSON.stringify(avisos));
        } else {
            throw new Error('Erro ao carregar avisos');
        }
    } catch (error) {
        console.error('Erro ao carregar avisos:', error);
        
        // Tentar carregar avisos salvos localmente
        const savedAvisos = localStorage.getItem('avisos');
        if (savedAvisos) {
            try {
                const avisos = JSON.parse(savedAvisos);
                displayAvisos(avisos);
            } catch (e) {
                displayNoAvisos();
            }
        } else {
            displayNoAvisos();
        }
    }
}

// Exibir avisos na página
function displayAvisos(avisos) {
    const container = document.getElementById('mural-avisos-container');
    if (!container) return;
    
    if (!avisos || avisos.length === 0) {
        displayNoAvisos();
        return;
    }
    
    container.innerHTML = '';
    
    avisos.forEach(aviso => {
        const avisoElement = document.createElement('div');
        avisoElement.className = 'aviso-card';
        
        const date = new Date(aviso.timestamp || aviso.data_criacao);
        const dateStr = date.toLocaleDateString('pt-BR');
        
        avisoElement.innerHTML = `
            <h4>${aviso.titulo}</h4>
            <p>${aviso.conteudo}</p>
            <small>📅 ${dateStr}</small>
        `;
        
        container.appendChild(avisoElement);
    });
}

// Exibir mensagem quando não há avisos
function displayNoAvisos() {
    const container = document.getElementById('mural-avisos-container');
    if (!container) return;
    
    container.innerHTML = `
        <div class="no-avisos">
            <p>📝 Nenhum aviso disponível no momento.</p>
            <p>Fique atento às próximas atualizações!</p>
        </div>
    `;
}

// Configurar funcionalidades de transmissão
function setupTransmission() {
    // As funções de transmissão serão chamadas pelos botões no HTML
    window.transmitirAvisos = function() {
        const telaoWindow = window.open('telao.html', '_blank');
        
        setTimeout(() => {
            if (telaoWindow) {
                telaoWindow.postMessage({ action: 'showAvisos' }, '*');
            }
        }, 1000);
        
        showToast('Transmitindo avisos para o telão...', 'success');
    };
    
    window.transmitirPIX = function() {
        const telaoWindow = window.open('telao.html', '_blank');
        
        setTimeout(() => {
            if (telaoWindow) {
                telaoWindow.postMessage({ action: 'showPIX' }, '*');
            }
        }, 1000);
        
        showToast('Transmitindo PIX para o telão...', 'success');
    };
}

// Função para exibir notificações toast
function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    if (!toast) return;
    
    // Remover classes anteriores
    toast.className = 'toast';
    
    // Adicionar classe do tipo
    if (type === 'success') {
        toast.style.background = '#10b981';
    } else if (type === 'error') {
        toast.style.background = '#ef4444';
    } else {
        toast.style.background = '#3b82f6';
    }
    
    toast.textContent = message;
    toast.classList.add('show');
    
    // Remover toast após 3 segundos
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Função para copiar texto para a área de transferência
function copyToClipboard(text, successMessage) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => {
            showToast(successMessage || 'Texto copiado!', 'success');
        }).catch(() => {
            fallbackCopyTextToClipboard(text, successMessage);
        });
    } else {
        fallbackCopyTextToClipboard(text, successMessage);
    }
}

// Fallback para copiar texto em navegadores mais antigos
function fallbackCopyTextToClipboard(text, successMessage) {
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
        showToast(successMessage || 'Texto copiado!', 'success');
    } catch (err) {
        showToast('Erro ao copiar texto', 'error');
    }
    
    document.body.removeChild(textArea);
}

// Atualizar avisos periodicamente
setInterval(loadAvisos, 30000); // Atualizar a cada 30 segundos

