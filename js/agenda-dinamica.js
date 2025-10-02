document.addEventListener("DOMContentLoaded", function() {
    const agendaContent = document.querySelector(".agenda-content");

    // Configuração dos eventos da igreja
    const eventosIgreja = {
        // Eventos fixos semanais
        terca: {
            titulo: "Culto de Ensino e Doutrina",
            horario: "19:00h",
            descricao: "Estudo aprofundado da Palavra de Deus",
            tipo: "fixo",
            interativo: true,
            icone: "📖"
        },
        quinta: {
            titulo: "Culto Livre",
            horario: "19:00h", 
            descricao: "Momento livre para direção do Espírito Santo — acompanhe os avisos para temas e departamentos convidados",
            tipo: "variavel",
            interativo: true,
            icone: "⛪"
        },
        // Eventos especiais mensais
        primeiroSabado: {
            titulo: "Santa Ceia",
            horario: "19:00h",
            descricao: "Celebração da Santa Ceia do Senhor",
            tipo: "mensal",
            icone: "🍞",
            destaque: true
        },
        // Eventos de domingo por semana do mês
        domingos: {
            manha: {
                titulo: "Escola Bíblica Dominical",
                horario: "09:00h",
                descricao: "Estudo bíblico para todas as idades",
                tipo: "fixo",
                icone: "📚"
            },
            primeiro: {
                titulo: "Culto com Departamento do Pai",
                horario: "18:00h",
                descricao: "Celebração noturna conduzida pelo Departamento do Pai",
                tipo: "mensal",
                icone: "👨‍👩‍👧‍👦"
            },
            segundo: {
                titulo: "Culto com Departamento de Missão",
                horario: "18:00h",
                descricao: "Foco na obra missionária e evangelização",
                tipo: "mensal",
                icone: "🌍"
            },
            terceiro: {
                titulo: "Culto com Departamento dos Jovens",
                horario: "18:00h",
                descricao: "Celebração dinâmica conduzida pela juventude",
                tipo: "mensal",
                icone: "🎵"
            },
            quarto: {
                titulo: "Culto com Departamento da Família",
                horario: "18:00h",
                descricao: "Celebração voltada para toda a família",
                tipo: "mensal",
                icone: "👨‍👩‍👧‍👦"
            },
            quinto: {
                titulo: "Culto de Celebração",
                horario: "18:00h",
                descricao: "Culto especial de louvor e adoração",
                tipo: "eventual",
                icone: "🎉"
            }
        }
    };

    function obterDiaSemana(data) {
        return data.getDay(); // 0 = Domingo, 1 = Segunda, ..., 6 = Sábado
    }

    function obterSemanaMes(data) {
        return Math.floor((data.getDate() - 1) / 7) + 1;
    }

    function obterProximaData(diaSemana) {
        const hoje = new Date();
        const diasAte = (diaSemana - hoje.getDay() + 7) % 7;
        const proximaData = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
        proximaData.setDate(proximaData.getDate() + (diasAte === 0 ? 7 : diasAte));
        return proximaData;
    }

    function normalizarData(data) {
        return new Date(data.getFullYear(), data.getMonth(), data.getDate());
    }

    function ehMesmoDia(a, b) {
        return a.getFullYear() === b.getFullYear() &&
            a.getMonth() === b.getMonth() &&
            a.getDate() === b.getDate();
    }

    function obterPrimeiroSabadoDoMes(ano, mes) {
        const primeiroDia = new Date(ano, mes, 1);
        const deslocamento = (6 - primeiroDia.getDay() + 7) % 7;
        primeiroDia.setDate(1 + deslocamento);
        return primeiroDia;
    }

    function obterProximoPrimeiroSabado(referencia = new Date()) {
        const base = normalizarData(referencia);
        let ano = base.getFullYear();
        let mes = base.getMonth();
        let candidato = obterPrimeiroSabadoDoMes(ano, mes);
        if (candidato < base) {
            mes += 1;
            if (mes > 11) {
                mes = 0;
                ano += 1;
            }
            candidato = obterPrimeiroSabadoDoMes(ano, mes);
        }
        return candidato;
    }

    function formatarData(data) {
        return data.toLocaleDateString('pt-BR', { 
            weekday: 'long', 
            day: 'numeric', 
            month: 'long' 
        });
    }

    function criarCardEvento(evento, data, isHoje = false) {
        const statusHoje = isHoje ? ' evento-hoje' : '';
        const textoData = isHoje ? 'HOJE' : formatarData(data);
        const badge = evento.destaque ? '<span class="evento-badge destaque">Próxima Santa Ceia</span>' : '';
        // calcular horário real do evento com base no campo evento.horario (ex: "19:00h")
        const match = (evento.horario || '').toString().match(/(\d{1,2}):(\d{2})/);
        const inicio = new Date(data);
        if (match) {
            inicio.setHours(parseInt(match[1], 10), parseInt(match[2], 10), 0, 0);
        }
        const inicioISO = inicio.toISOString();
        
        return `
            <div class="evento-card${statusHoje}">
                <div class="evento-header">
                    <span class="evento-icone">${evento.icone}</span>
                    <div class="evento-info">
                        <h3 class="evento-titulo">${evento.titulo}</h3>
                        <p class="evento-horario">${evento.horario}</p>
                    </div>
                    <span class="evento-data">${textoData}</span>${badge}
                </div>
                <p class="evento-descricao">${evento.descricao}</p>
                ${evento.departamentos ? `
                    <div class="evento-departamentos">
                        <small>Departamentos: ${evento.departamentos.join(', ')}</small>
                        <small class="verificar-programacao">(Verificar programação semanal)</small>
                    </div>
                ` : ''}
                ${evento.interativo ? `
                    <div class="evento-acoes">
                        <button class="btn-confirmar-presenca" onclick="confirmarPresenca('${evento.titulo}', '${inicioISO}')">
                            ✅ Confirmar Presença
                        </button>
                        <button class="btn-lembrete" onclick="criarLembrete('${evento.titulo}', '${inicioISO}')">
                            🔔 Criar Lembrete
                        </button>
                    </div>
                ` : ''}
            </div>
        `;
    }

    function gerarAgendaDinamica() {
        const hoje = new Date();
        const hojeNormalizado = normalizarData(hoje);
        const diaSemanaHoje = obterDiaSemana(hoje);
        const semanaMesHoje = obterSemanaMes(hoje);
        
        let eventosHTML = '<div class="agenda-dinamica">';
        eventosHTML += '<h3 class="agenda-titulo">📅 Próximos Eventos</h3>';

        // Verificar eventos de hoje
        let eventosHoje = [];
        
        // Terça-feira
        if (diaSemanaHoje === 2) {
            eventosHoje.push(criarCardEvento(eventosIgreja.terca, hoje, true));
        }
        
        // Quinta-feira
        if (diaSemanaHoje === 4) {
            eventosHoje.push(criarCardEvento(eventosIgreja.quinta, hoje, true));
        }
        
        // Primeiro sábado do mês
        if (diaSemanaHoje === 6 && semanaMesHoje === 1) {
            eventosHoje.push(criarCardEvento(eventosIgreja.primeiroSabado, hoje, true));
        }
        
        // Domingo
        if (diaSemanaHoje === 0) {
            // Escola Bíblica sempre acontece
            eventosHoje.push(criarCardEvento(eventosIgreja.domingos.manha, hoje, true));
            
            // Culto da noite varia por semana
            if (semanaMesHoje === 1) {
                eventosHoje.push(criarCardEvento(eventosIgreja.domingos.primeiro, hoje, true));
            } else if (semanaMesHoje === 2) {
                eventosHoje.push(criarCardEvento(eventosIgreja.domingos.segundo, hoje, true));
            } else if (semanaMesHoje === 3) {
                eventosHoje.push(criarCardEvento(eventosIgreja.domingos.terceiro, hoje, true));
            } else if (semanaMesHoje === 4) {
                eventosHoje.push(criarCardEvento(eventosIgreja.domingos.quarto, hoje, true));
            } else {
                eventosHoje.push(criarCardEvento(eventosIgreja.domingos.quinto, hoje, true));
            }
        }

        // Adicionar eventos de hoje
        if (eventosHoje.length > 0) {
            eventosHTML += '<div class="eventos-hoje">';
            eventosHTML += eventosHoje.join('');
            eventosHTML += '</div>';
        }

        // Próximos eventos da semana
        eventosHTML += '<div class="proximos-eventos">';
        
        // Próxima terça
        if (diaSemanaHoje !== 2) {
            const proximaTerca = obterProximaData(2);
            eventosHTML += criarCardEvento(eventosIgreja.terca, proximaTerca);
        }
        
        // Próxima quinta
        if (diaSemanaHoje !== 4) {
            const proximaQuinta = obterProximaData(4);
            eventosHTML += criarCardEvento(eventosIgreja.quinta, proximaQuinta);
        }
        
        // Próximo primeiro sábado (Santa Ceia)
        const proximoPrimeiroSabado = obterProximoPrimeiroSabado(hoje);
        if (!ehMesmoDia(proximoPrimeiroSabado, hojeNormalizado)) {
            eventosHTML += criarCardEvento(eventosIgreja.primeiroSabado, proximoPrimeiroSabado);
        }
        
        // Próximo domingo (se não for domingo)
        if (diaSemanaHoje !== 0) {
            const proximoDomingo = obterProximaData(0);
            const semanaMesProximo = obterSemanaMes(proximoDomingo);
            
            eventosHTML += criarCardEvento(eventosIgreja.domingos.manha, proximoDomingo);
            
            if (semanaMesProximo === 1) {
                eventosHTML += criarCardEvento(eventosIgreja.domingos.primeiro, proximoDomingo);
            } else if (semanaMesProximo === 2) {
                eventosHTML += criarCardEvento(eventosIgreja.domingos.segundo, proximoDomingo);
            } else if (semanaMesProximo === 3) {
                eventosHTML += criarCardEvento(eventosIgreja.domingos.terceiro, proximoDomingo);
            } else if (semanaMesProximo === 4) {
                eventosHTML += criarCardEvento(eventosIgreja.domingos.quarto, proximoDomingo);
            } else {
                eventosHTML += criarCardEvento(eventosIgreja.domingos.quinto, proximoDomingo);
            }
        }

        eventosHTML += '</div>';

        // Integração com Google Calendar
        eventosHTML += `
            <div class="integracao-calendario">
                <h4>🔗 Integração com Calendário</h4>
                <p>Adicione nossa agenda ao seu calendário pessoal:</p>
                <div class="botoes-integracao">
                    <button class="btn-google-calendar" onclick="adicionarGoogleCalendar()">
                        📅 Google Calendar
                    </button>
                    <button class="btn-notificacoes" onclick="ativarNotificacoes()">
                        🔔 Ativar Notificações
                    </button>
                </div>
            </div>
        `;

        eventosHTML += '</div>';

        agendaContent.innerHTML = eventosHTML;
    }

    // Funções interativas globais
    function getCalendarIdFromConfig() {
        try {
            const cfg = JSON.parse(localStorage.getItem('ad_jardim_marcia_config') || '{}');
            return cfg.calendarId || 'jdmarciaad@gmail.com';
        } catch { return 'jdmarciaad@gmail.com'; }
    }

    function fmtGCalDateLocal(isoString, addMinutes = 0) {
        const d = new Date(isoString);
        if (addMinutes) d.setMinutes(d.getMinutes() + addMinutes);
        const pad = (n) => String(n).padStart(2, '0');
        const yyyy = d.getFullYear();
        const mm = pad(d.getMonth() + 1);
        const dd = pad(d.getDate());
        const HH = pad(d.getHours());
        const MM = pad(d.getMinutes());
        const SS = pad(d.getSeconds());
        return `${yyyy}${mm}${dd}T${HH}${MM}${SS}`; // local time; usar ctz
    }

    window.confirmarPresenca = function(evento, dataISO) {
        // abre criação de evento no Google Calendar do usuário
        const start = fmtGCalDateLocal(dataISO, 0);
        const end = fmtGCalDateLocal(dataISO, 120); // duração padrão 2h
        const details = 'Confirmação de presença via site AD Jardim Márcia.';
        const location = 'Rua Dra. Zanaga Aboim Gomes, 211 - Jardim Yeda, Setor 13 - Santa Lúcia';
        const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(evento)}&dates=${start}/${end}&details=${encodeURIComponent(details)}&location=${encodeURIComponent(location)}&ctz=America/Sao_Paulo`;
        if (typeof showToast === 'function') showToast('Abrindo Google Calendar…', 'info');
        window.open(url, '_blank');
    };

    window.criarLembrete = function(evento, dataISO) {
        // usar a mesma estratégia: abrir template de evento
        const start = fmtGCalDateLocal(dataISO, 0);
        const end = fmtGCalDateLocal(dataISO, 120);
        const details = 'Lembrete criado pelo site AD Jardim Márcia.';
        const location = 'Rua Dra. Zanaga Aboim Gomes, 211 - Jardim Yeda, Setor 13 - Santa Lúcia';
        const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(evento)}&dates=${start}/${end}&details=${encodeURIComponent(details)}&location=${encodeURIComponent(location)}&ctz=America/Sao_Paulo`;
        if (typeof showToast === 'function') showToast('Abrindo criação de lembrete no Google Calendar…', 'info');
        window.open(url, '_blank');
    };

    window.adicionarGoogleCalendar = function() {
        const cid = getCalendarIdFromConfig();
        const link = `https://calendar.google.com/calendar/u/0/r?cid=${encodeURIComponent(cid)}`;
        if (typeof showToast === 'function') showToast('Abrindo Google Calendar para adicionar agenda…', 'info');
        window.open(link, '_blank');
    };

    window.ativarNotificacoes = function() {
        if ('Notification' in window) {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    if (typeof showToast === 'function') {
                        showToast('Notificações ativadas com sucesso!', 'success');
                    }
                } else {
                    if (typeof showToast === 'function') {
                        showToast('Permissão para notificações negada', 'warning');
                    }
                }
            });
        } else {
            if (typeof showToast === 'function') {
                showToast('Notificações não suportadas neste navegador', 'warning');
            }
        }
    };

    // Inicializar agenda
    gerarAgendaDinamica();
    
    // Atualizar a cada hora
    setInterval(gerarAgendaDinamica, 3600000);
});
