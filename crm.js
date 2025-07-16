// Sistema CRM Avançado
class CRMSystem {
    constructor() {
        this.pipeline = {
            lead: [],
            contato: [],
            orcamento: [],
            negociacao: [],
            fechamento: []
        };
        this.followups = [];
        this.notifications = [];
        this.analytics = {
            conversions: {},
            revenue: {},
            customers: {}
        };
        this.init();
    }

    init() {
        this.setupPipeline();
        this.setupFollowUpSystem();
        this.setupNotifications();
        this.setupAnalytics();
        this.loadPipelineData();
    }

    // Pipeline Management
    setupPipeline() {
        const columns = document.querySelectorAll('.column-content');
        columns.forEach(column => {
            new Sortable(column, {
                group: 'pipeline',
                animation: 150,
                ghostClass: 'dragging',
                onEnd: (evt) => {
                    this.updatePipelineStage(evt.item.dataset.clientId, evt.to.dataset.stage);
                }
            });
        });
    }

    async loadPipelineData() {
        try {
            const {  clientes, error } = await db
                .from('clientes')
                .select('*, orcamentos(*)')
                .order('created_at', { ascending: false });

            if (error) throw error;

            this.processPipelineData(clientes);
            this.renderPipeline();
            this.updatePipelineMetrics();
        } catch (error) {
            console.error('Erro ao carregar pipeline:', error);
        }
    }

    processPipelineData(clientes) {
        // Reset pipeline
        Object.keys(this.pipeline).forEach(stage => {
            this.pipeline[stage] = [];
        });

        clientes.forEach(cliente => {
            const stage = this.determineClientStage(cliente);
            this.pipeline[stage].push({
                id: cliente.id,
                nome: cliente.nome,
                telefone: cliente.telefone,
                carro: cliente.carro,
                valor: this.calculateClientValue(cliente),
                lastContact: cliente.updated_at,
                stage: stage,
                orcamentos: cliente.orcamentos || []
            });
        });
    }

    determineClientStage(cliente) {
        const orcamentos = cliente.orcamentos || [];
        
        if (orcamentos.length === 0) {
            return 'lead';
        }
        
        const lastOrcamento = orcamentos[orcamentos.length - 1];
        
        switch (lastOrcamento.status) {
            case 'Orçamento':
                return 'orcamento';
            case 'Aprovado':
                return 'negociacao';
            case 'Finalizado':
                return 'fechamento';
            default:
                return 'contato';
        }
    }

    calculateClientValue(cliente) {
        const orcamentos = cliente.orcamentos || [];
        return orcamentos.reduce((total, orc) => total + parseFloat(orc.valor_total), 0);
    }

    renderPipeline() {
        Object.keys(this.pipeline).forEach(stage => {
            const column = document.getElementById(`${stage}Column`);
            const count = document.getElementById(`${stage}Count`);
            
            if (column && count) {
                count.textContent = this.pipeline[stage].length;
                column.innerHTML = this.pipeline[stage].map(cliente => 
                    this.createPipelineCard(cliente)
                ).join('');
            }
        });
    }

    createPipelineCard(cliente) {
        const daysSinceContact = this.calculateDaysSinceLastContact(cliente.lastContact);
        const urgencyClass = daysSinceContact > 7 ? 'urgent' : daysSinceContact > 3 ? 'warning' : '';
        
        return `
            <div class="pipeline-card ${urgencyClass}" data-client-id="${cliente.id}">
                <h4>${cliente.nome}</h4>
                <p><i class="fas fa-car"></i> ${cliente.carro || 'Veículo não informado'}</p>
                <p><i class="fas fa-phone"></i> ${cliente.telefone || 'Sem telefone'}</p>
                <div class="pipeline-card-value">
                    ${formatCurrency(cliente.valor)}
                </div>
                <div class="pipeline-card-meta">
                    <small>Último contato: ${daysSinceContact} dias</small>
                </div>
                <div class="pipeline-card-actions">
                    <button class="btn btn-small btn-primary" onclick="crmSystem.quickCall('${cliente.id}')">
                        <i class="fas fa-phone"></i>
                    </button>
                    <button class="btn btn-small btn-success" onclick="crmSystem.quickWhatsApp('${cliente.id}')">
                        <i class="fab fa-whatsapp"></i>
                    </button>
                    <button class="btn btn-small btn-info" onclick="crmSystem.viewClientDetails('${cliente.id}')">
                        <i class="fas fa-eye"></i>
                    </button>
                </div>
            </div>
        `;
    }

    calculateDaysSinceLastContact(lastContact) {
        const now = new Date();
        const last = new Date(lastContact);
        const diffTime = Math.abs(now - last);
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    async updatePipelineStage(clientId, newStage) {
        try {
            const { error } = await db
                .from('clientes')
                .update({ stage: newStage })
                .eq('id', clientId);

            if (error) throw error;

            // Update local pipeline
            this.movePipelineCard(clientId, newStage);
            this.updatePipelineMetrics();
            
            // Create follow-up if needed
            this.createStageFollowUp(clientId, newStage);
            
            showNotification(`Cliente movido para ${newStage}`, 'success');
        } catch (error) {
            console.error('Erro ao atualizar stage:', error);
            showNotification('Erro ao atualizar pipeline', 'error');
        }
    }

    movePipelineCard(clientId, newStage) {
        // Find and move card in pipeline data
        let movedCard = null;
        
        Object.keys(this.pipeline).forEach(stage => {
            const cardIndex = this.pipeline[stage].findIndex(card => card.id === clientId);
            if (cardIndex !== -1) {
                movedCard = this.pipeline[stage].splice(cardIndex, 1)[0];
            }
        });
        
        if (movedCard) {
            movedCard.stage = newStage;
            this.pipeline[newStage].push(movedCard);
            this.renderPipeline();
        }
    }

    // Follow-up System
    setupFollowUpSystem() {
        // Check for follow-ups every 5 minutes
        setInterval(() => {
            this.checkFollowUps();
        }, 5 * 60 * 1000);
        
        // Initial check
        this.checkFollowUps();
    }

    async checkFollowUps() {
        const now = new Date();
        const pendingFollowUps = [];
        
        // Check pipeline for overdue follow-ups
        Object.keys(this.pipeline).forEach(stage => {
            this.pipeline[stage].forEach(cliente => {
                const daysSinceContact = this.calculateDaysSinceLastContact(cliente.lastContact);
                
                if (daysSinceContact >= 3 && stage !== 'fechamento') {
                    pendingFollowUps.push({
                        id: cliente.id,
                        nome: cliente.nome,
                        telefone: cliente.telefone,
                        type: daysSinceContact >= 7 ? 'urgent' : 'normal',
                        stage: stage,
                        daysSinceContact: daysSinceContact
                    });
                }
            });
        });
        
        this.followups = pendingFollowUps;
        this.renderFollowUps();
        this.updateNotificationBadge();
    }

    renderFollowUps() {
        const container = document.getElementById('followupList');
        if (!container) return;
        
        if (this.followups.length === 0) {
            container.innerHTML = '<p class="text-center">Nenhum follow-up pendente 🎉</p>';
            return;
        }
        
        container.innerHTML = this.followups.map(followup => `
            <div class="followup-item ${followup.type}">
                <div class="followup-icon">
                    <i class="fas fa-${followup.type === 'urgent' ? 'exclamation' : 'clock'}"></i>
                </div>
                <div class="followup-content">
                    <h4>${followup.nome}</h4>
                    <p>
                        ${followup.stage.charAt(0).toUpperCase() + followup.stage.slice(1)} • 
                        ${followup.daysSinceContact} dias sem contato
                    </p>
                </div>
                <div class="followup-actions">
                    <button class="btn btn-small btn-primary" onclick="crmSystem.quickCall('${followup.id}')">
                        <i class="fas fa-phone"></i>
                    </button>
                    <button class="btn btn-small btn-success" onclick="crmSystem.quickWhatsApp('${followup.id}')">
                        <i class="fab fa-whatsapp"></i>
                    </button>
                    <button class="btn btn-small btn-secondary" onclick="crmSystem.markAsContacted('${followup.id}')">
                        <i class="fas fa-check"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    async markAsContacted(clientId) {
        try {
            const { error } = await db
                .from('clientes')
                .update({ updated_at: new Date().toISOString() })
                .eq('id', clientId);

            if (error) throw error;

            // Remove from follow-ups
            this.followups = this.followups.filter(f => f.id !== clientId);
            this.renderFollowUps();
            this.updateNotificationBadge();
            
            showNotification('Marcado como contatado', 'success');
        } catch (error) {
            console.error('Erro ao marcar como contatado:', error);
            showNotification('Erro ao atualizar', 'error');
        }
    }

    // Notification System
    setupNotifications() {
        this.requestNotificationPermission();
        this.scheduleNotifications();
    }

    async requestNotificationPermission() {
        if ('Notification' in window) {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                console.log('Notificações habilitadas');
            }
        }
    }

    scheduleNotifications() {
        // Check for notifications every 30 minutes
        setInterval(() => {
            this.checkNotifications();
        }, 30 * 60 * 1000);
    }

    checkNotifications() {
        const urgentFollowUps = this.followups.filter(f => f.type === 'urgent');
        
        if (urgentFollowUps.length > 0 && 'Notification' in window && Notification.permission === 'granted') {
            new Notification('R.M. CRM - Follow-up Urgente', {
                body: `${urgentFollowUps.length} cliente(s) precisam de follow-up urgente`,
                icon: '/icon-192x192.png',
                badge: '/badge-72x72.png'
            });
        }
    }

    updateNotificationBadge() {
        const badge = document.getElementById('badgeCount');
        if (badge) {
            const count = this.followups.length;
            badge.textContent = count;
            badge.style.display = count > 0 ? 'block' : 'none';
        }
    }

    // Quick Actions
    async quickCall(clientId) {
        const cliente = await this.getClientById(clientId);
        if (cliente && cliente.telefone) {
            window.location.href = `tel:${cliente.telefone}`;
            this.logInteraction(clientId, 'call');
        }
    }

    async quickWhatsApp(clientId) {
        const cliente = await this.getClientById(clientId);
        if (cliente && cliente.telefone) {
            const phone = cliente.telefone.replace(/\D/g, '');
            const message = `Olá ${cliente.nome}, como posso ajudar você hoje?`;
            window.open(`https://wa.me/55${phone}?text=${encodeURIComponent(message)}`, '_blank');
            this.logInteraction(clientId, 'whatsapp');
        }
    }

    async viewClientDetails(clientId) {
        showClienteDetails(clientId);
        this.logInteraction(clientId, 'view');
    }

    async getClientById(clientId) {
        try {
            const { data, error } = await db
                .from('clientes')
                .select('*')
                .eq('id', clientId)
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Erro ao buscar cliente:', error);
            return null;
        }
    }

    async logInteraction(clientId, type) {
        try {
            const { error } = await db
                .from('client_interactions')
                .insert([{
                    client_id: clientId,
                    interaction_type: type,
                    interaction_date: new Date().toISOString()
                }]);

            if (error) throw error;
        } catch (error) {
            console.error('Erro ao registrar interação:', error);
        }
    }

    // Analytics
    setupAnalytics() {
        this.updateAnalytics();
        
        // Update analytics every hour
        setInterval(() => {
            this.updateAnalytics();
        }, 60 * 60 * 1000);
    }

    async updateAnalytics() {
        try {
            await Promise.all([
                this.calculateConversionRate(),
                this.calculatePipelineValue(),
                this.calculateAverageTicket(),
                this.calculateResponseTime()
            ]);
            
            this.renderAnalytics();
        } catch (error) {
            console.error('Erro ao atualizar analytics:', error);
        }
    }

    async calculateConversionRate() {
        const totalLeads = Object.values(this.pipeline).flat().length;
        const closedDeals = this.pipeline.fechamento.length;
        
        this.analytics.conversionRate = totalLeads > 0 ? (closedDeals / totalLeads) * 100 : 0;
    }

    calculatePipelineValue() {
        this.analytics.pipelineValue = Object.values(this.pipeline)
            .flat()
            .reduce((total, cliente) => total + cliente.valor, 0);
    }

    async calculateAverageTicket() {
        try {
            const {  orcamentos, error } = await db
                .from('orcamentos')
                .select('valor_total')
                .eq('status', 'Finalizado');

            if (error) throw error;

            const total = orcamentos.reduce((sum, orc) => sum + parseFloat(orc.valor_total), 0);
            this.analytics.averageTicket = orcamentos.length > 0 ? total / orcamentos.length : 0;
        } catch (error) {
            console.error('Erro ao calcular ticket médio:', error);
            this.analytics.averageTicket = 0;
        }
    }

    calculateResponseTime() {
        // Simulate response time calculation
        // In real implementation, this would be calculated from interaction logs
        this.analytics.responseTime = 2.5; // hours
    }

    renderAnalytics() {
        const elements = {
            conversionRate: document.getElementById('conversionRate'),
            pipelineValue: document.getElementById('pipelineValue'),
            avgTicket: document.getElementById('avgTicket'),
            responseTime: document.getElementById('responseTime')
        };

        if (elements.conversionRate) {
            elements.conversionRate.textContent = `${this.analytics.conversionRate.toFixed(1)}%`;
        }
        
        if (elements.pipelineValue) {
            elements.pipelineValue.textContent = formatCurrency(this.analytics.pipelineValue);
        }
        
        if (elements.avgTicket) {
            elements.avgTicket.textContent = formatCurrency(this.analytics.averageTicket);
        }
        
        if (elements.responseTime) {
            elements.responseTime.textContent = `${this.analytics.responseTime}h`;
        }
    }

    updatePipelineMetrics() {
        // Update pipeline counts
        Object.keys(this.pipeline).forEach(stage => {
            const countElement = document.getElementById(`${stage}Count`);
            if (countElement) {
                countElement.textContent = this.pipeline[stage].length;
            }
        });
    }

    // Chart Methods
    renderSalesFunnelChart() {
        const ctx = document.getElementById('salesFunnelChart');
        if (!ctx) return;

        const data = {
            labels: ['Leads', 'Contato', 'Orçamento', 'Negociação', 'Fechamento'],
            datasets: [{
                label: 'Funil de Vendas',
                 [
                    this.pipeline.lead.length,
                    this.pipeline.contato.length,
                    this.pipeline.orcamento.length,
                    this.pipeline.negociacao.length,
                    this.pipeline.fechamento.length
                ],
                backgroundColor: [
                    '#ef4444',
                    '#f97316',
                    '#3b82f6',
                    '#8b5cf6',
                    '#22c55e'
                ]
            }]
        };

        new Chart(ctx, {
            type: 'bar',
             data,
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    renderRevenueChart() {
        const ctx = document.getElementById('revenueChart');
        if (!ctx) return;

        // Generate last 6 months data
        const months = [];
        const revenues = [];
        
        for (let i = 5; i >= 0; i--) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            months.push(date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }));
            
            // Simulate revenue data - in real implementation, this would come from database
            revenues.push(Math.random() * 10000 + 5000);
        }

        new Chart(ctx, {
            type: 'line',
             {
                labels: months,
                datasets: [{
                    label: 'Receita Mensal',
                     revenues,
                    borderColor: '#22c55e',
                    backgroundColor: 'rgba(34, 197, 94, 0.1)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return formatCurrency(value);
                            }
                        }
                    }
                }
            }
        });
    }
}

// Initialize CRM System
let crmSystem;

document.addEventListener('DOMContentLoaded', function() {
    crmSystem = new CRMSystem();
});

// Quick Action Functions
function quickAddClient() {
    switchTab('clientes');
    toggleClienteForm();
}

function quickOrcamento() {
    switchTab('orcamento');
}

function addToPipeline() {
    switchTab('clientes');
    toggleClienteForm();
}

// Export functions for global access
window.crmSystem = crmSystem;
