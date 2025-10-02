document.addEventListener("DOMContentLoaded", function() {
    const agendaContent = document.querySelector(".agenda-content");

    const events = {
        terca: {
            title: "Culto de Ensino e Doutrina",
            time: "19:00h",
            description: "Participe do nosso culto de ensino e doutrina. \nConfirme sua presença!",
            interactive: true
        },
        quinta: {
            title: "Culto de Doutrina",
            time: "19:00h",
            description: "Culto com departamentos. \nVerifique a programação semanal para saber qual departamento estará responsável (Senhoras, Crianças ou Livre).",
            interactive: true
        },
        primeiroSabado: {
            title: "Santa Ceia",
            time: "19:00h",
            description: "Celebração da Santa Ceia do Senhor. Momento de comunhão e reflexão."
        },
        primeiroDomingo: {
            title: "Culto com Departamento do Pai",
            time: "18:00h",
            description: "Culto especial com a participação do Departamento do Pai."
        },
        segundoDomingo: {
            title: "Culto com Departamento de Missão",
            time: "18:00h",
            description: "Culto dedicado à obra missionária com o Departamento de Missão."
        },
        terceiroDomingo: {
            title: "Culto da Família",
            time: "18:00h",
            description: "Culto especial para toda a família, promovendo a união e os valores cristãos."
        },
        quartoDomingo: {
            title: "Culto com Departamento de Jovens",
            time: "18:00h",
            description: "Culto vibrante com a participação do Departamento de Jovens."
        },
        domingoManha: {
            title: "Escola Bíblica Dominical",
            time: "09:00h",
            description: "Estudo aprofundado da Palavra de Deus para todas as idades."
        },
        domingoNoite: {
            title: "Culto de Celebração",
            time: "18:00h",
            description: "Celebração da Palavra e louvor ao Senhor."
        }
    };

    function getDayOfWeek(date) {
        const day = date.getDay();
        return day;
    }

    function getWeekOfMonth(date) {
        const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
        const dayOfWeek = firstDayOfMonth.getDay();
        return Math.ceil((date.getDate() + dayOfWeek) / 7);
    }

    function renderAgenda() {
        const today = new Date();
        const dayOfWeek = getDayOfWeek(today); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
        const weekOfMonth = getWeekOfMonth(today);

        let currentEvents = [];

        // Eventos fixos da semana
        if (dayOfWeek === 2) { // Terça-feira
            currentEvents.push(events.terca);
        } else if (dayOfWeek === 4) { // Quinta-feira
            currentEvents.push(events.quinta);
        }

        // Eventos de Sábado
        if (dayOfWeek === 6 && weekOfMonth === 1) { // Primeiro Sábado do Mês
            currentEvents.push(events.primeiroSabado);
        }

        // Eventos de Domingo
        if (dayOfWeek === 0) { // Domingo
            currentEvents.push(events.domingoManha);
            if (weekOfMonth === 1) {
                currentEvents.push(events.primeiroDomingo);
            } else if (weekOfMonth === 2) {
                currentEvents.push(events.segundoDomingo);
            } else if (weekOfMonth === 3) {
                currentEvents.push(events.terceiroDomingo);
            } else if (weekOfMonth === 4) {
                currentEvents.push(events.quartoDomingo);
            } else {
                currentEvents.push(events.domingoNoite);
            }
        }

        if (currentEvents.length === 0) {
            agendaContent.innerHTML = `
                <div class="agenda-card no-events">
                    <h3>Nenhum evento programado para hoje.</h3>
                    <p>Fique atento à nossa programação semanal!</p>
                </div>
            `;
        } else {
            agendaContent.innerHTML = currentEvents.map(event => `
                <div class="agenda-card">
                    <h3>${event.title}</h3>
                    <p class="event-time">${event.time}</p>
                    <p class="event-description">${event.description.replace(/\n/g, '<br>')}</p>
                    ${event.interactive ? '<button class="confirm-presence-btn">Confirme sua presença</button>' : ''}
                </div>
            `).join('');
        }
    }

    renderAgenda();
    // Atualizar a agenda a cada hora, ou conforme necessário
    setInterval(renderAgenda, 3600000); 
});

