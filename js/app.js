/**
 * Aplicação principal - Gestor ProPlus
 * @file app.js
 * @version 2.0.0
 */

// Configuração global
const CONFIG = {
    app: {
        name: 'R.M. Estética Automotiva',
        version: '2.0.0'
    }
};

// Estado global da aplicação
const STATE = {
    currentTab: 'dashboard',
    isOnline: navigator.onLine,
    data: {
        clientes: [],
        servicos: [],
        orcamentos: []
    },
    ui: {
        loading: false,
        notifications: []
    }
};

// Dados de exemplo
const SAMPLE_DATA = {
    clientes: [
        {
            id: 'c1',
            nome: 'João Silva',
            telefone: '(24) 99999-9999',
            email: 'joao.silva@email.com',
            carro: 'Honda Civic 2020',
            placa: 'ABC-1234',
            endereco: 'Rua das Flores, 123',
            created_at: '2024-01-15T10:00:00Z'
        },
        {
            id: 'c2',
            nome: 'Maria Santos',
            telefone: '(24) 88888-8888',
            email: 'maria.santos@email.com',
            carro: 'Toyota Corolla 2019',
            placa: 'DEF-5678',
            endereco: 'Avenida Central, 456',
            created_at: '2024-01-10T14:30:00Z'
        },
        {
            id: 'c3',
            nome: 'Pedro Oliveira',
            telefone: '(24) 77777-7777',
            email: 'pedro.oliveira@email.com',
            carro: 'Volkswagen Jetta 2021',
            placa: 'GHI-9012',
            endereco: 'Rua da Praia, 789',
            created_at: '2024-01-08T16:45:00Z'
        }
    ],
    servicos: [
        {
            id: 's1',
            descricao: 'Lavagem Completa',
            valor: 35.00,
            duracao: 60,
            categoria: 'Lavagem',
            ativo: true
        },
        {
            id: 's2',
            descricao: 'Enceramento',
            valor: 45.00,
            duracao: 90,
            categoria: 'Proteção',
            ativo: true
        },
        {
            id: 's3',
            descricao: 'Lavagem Simples',
            valor: 25.00,
            duracao: 30,
            categoria: 'Lavagem',
            ativo: true
        },
        {
            id: 's4',
            descricao: 'Limpeza Interna',
            valor: 40.00,
            duracao: 45,
            categoria: 'Limpeza',
            ativo: true
        }
    ],
    orcamentos: [
        {
            id: 'o1',
            cliente_id: 'c1',
            valor_total: 80.00,
            desconto: 0,
            status: 'Finalizado',
            observacoes: 'Serviço realizado com sucesso',
            created_at: '2024-01-15T10:30:00Z',
            itens: [
                { servico_id: 's1', quantidade: 1, valor: 35.00 },
                { servico_id: 's2', quantidade: 1, valor: 45.00 }
            ]
        },
        {
            id: 'o2',
            cliente_id: 'c2',
            valor_total: 65.00,
            desconto: 5,
            status: 'Aprovado',
            observacoes: 'Cliente aprovou o orçamento',
            created_at: '2024-01-12T14:15:00Z',
            itens: [
                { servico_id: 's1', quantidade: 1, valor: 35.00 },
                { servico_id: 's4', quantidade: 1, valor: 40.00 }
            ]
        },
        {
            id: 'o3',
            cliente_id: 'c3',
            valor_total: 25.00,
            desconto: 0,
            status: 'Orçamento',
            observacoes: 'Aguardando resposta do cliente',
            created_at: '2024-01-10T11:20:00Z',
            itens: [
                { servico_id: 's3', quantidade: 1, valor: 25.00 }
            ]
        }
    ]
};

// Gerenciador de dados
const DataManager = {
    // Carregar dados
    loadData() {
        STATE.data = { ...SAMPLE_DATA };
        console.log('📋 Dados carregados');
    },

    // Salvar cliente
    saveCliente(cliente) {
        cliente.id = generateId();
        cliente.created_at = new Date().toISOString();
        STATE.data.clientes.push(cliente);
        return cliente;
    },

    // Salvar serviço
    saveServico(servico) {
        servico.id = generateId();
        servico.created_at = new Date().toISOString();
        STATE.data.servicos.push(servico);
        return servico;
    },

    // Salvar orçamento
    saveOrcamento(orcamento) {
        orcamento.id = generateId();
        orcamento.created_at = new Date().toISOString();
        STATE.data.orcamentos.push(orcamento);
        return orcamento;
    }
};

// Gerenciador de UI
const UIManager = {
    // Mostrar loading
    showLoading(message = 'Carregando...') {
        const loading = document.getElementById('loadingScreen');
        if (loading) {
            loading.classList.remove('hidden');
            const p = loading.querySelector('p');
            if (p) p.textContent = message;
        }
        STATE.ui.loading = true;
    },

    // Esconder loading
    hideLoading() {
        const loading = document.getElementById('loadingScreen');
        if (loading) {
            loading.classList.add('hidden');
            setTimeout(() => {
                loading.style.display = 'none';
            }, 500);
        }
        STATE.ui.loading = false;
    },

    // Atualizar progresso
    updateProgress(percent) {
        const progress = document.getElementById('loadingProgress');
        if (progress) {
            progress.style.width = `${percent}%`;
        }
    },

    // Alternar tab
    switchTab(tabName) {
        // Atualizar navegação
        document.querySelectorAll('.nav-tab, .mobile-nav-item').forEach(item => {
            item.classList.remove('active');
        });
        
        document.querySelectorAll(`[data-tab="${tabName}"]`).forEach(item => {
            item.classList.add('active');
        });

        // Atualizar conteúdo
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        
        const activeContent = document.getElementById(tabName);
        if (activeContent) {
            activeContent.classList.add('active');
        }

        STATE.currentTab = tabName;
        this.onTabChange(tabName);
    },

    // Quando a tab muda
    onTabChange(tabName) {
        switch (tabName) {
            case 'dashboard':
                this.renderDashboard();
                break;
            case 'clientes':
                this.renderClientes();
                break;
            case 'servicos':
                this.renderServicos();
                break;
            case 'orcamento':
                this.renderOrcamentos();
                break;
            case 'historico':
                this.renderHistorico();
                break;
        }
    },

    // Renderizar dashboard
    renderDashboard() {
        const totalClientes = STATE.data.clientes.length;
        const totalServicos = STATE.data.servicos.length;
        const totalOrcamentos = STATE.data.orcamentos.length;
        
        const faturamento = STATE.data.orcamentos
            .filter(o => o.status === 'Finalizado')
            .reduce((sum, o) => sum + o.valor_total, 0);

        // Atualizar métricas
        this.updateElement('metricTotalClients', totalClientes);
        this.updateElement('metricServices', totalServicos);
        this.updateElement('metricQuotes', totalOrcamentos);
        this.updateElement('metricRevenue', formatCurrency(faturamento));
    },

    // Renderizar clientes
    renderClientes() {
        const container = document.getElementById('clientesGrid');
        if (!container) return;

        if (STATE.data.clientes.length === 0) {
            container.innerHTML = this.getEmptyState('Nenhum cliente cadastrado', 'Adicione seu primeiro cliente para começar');
            return;
        }

        container.innerHTML = STATE.data.clientes.map(cliente => `
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">${sanitizeHtml(cliente.nome)}</h3>
                    <span class="card-badge active">Ativo</span>
                </div>
                <div class="card-body">
                    <div class="card-info">
                        <div class="card-info-item">
                            <i class="fas fa-phone"></i>
                            <span>${sanitizeHtml(cliente.telefone || 'Não informado')}</span>
                        </div>
                        <div class="card-info-item">
                            <i class="fas fa-envelope"></i>
                            <span>${sanitizeHtml(cliente.email || 'Não informado')}</span>
                        </div>
                        <div class="card-info-item">
                            <i class="fas fa-car"></i>
                            <span>${sanitizeHtml(cliente.carro || 'Não informado')}</span>
                        </div>
                        <div class="card-info-item">
                            <i class="fas fa-id-card"></i>
                            <span>${sanitizeHtml(cliente.placa || 'Não informado')}</span>
                        </div>
                    </div>
                </div>
                <div class="card-actions">
                    <button class="btn btn-sm btn-secondary" onclick="editClient('${cliente.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-success" onclick="callClient('${cliente.telefone}')">
                        <i class="fas fa-phone"></i>
                    </button>
                    <button class="btn btn-sm btn-primary" onclick="whatsappClient('${cliente.telefone}', '${cliente.nome}')">
                        <i class="fab fa-whatsapp"></i>
                    </button>
                </div>
            </div>
        `).join('');
    },

    // Renderizar serviços
    renderServicos() {
        const container = document.getElementById('servicosGrid');
        if (!container) return;

        if (STATE.data.servicos.length === 0) {
            container.innerHTML = this.getEmptyState('Nenhum serviço cadastrado', 'Adicione seus serviços para começar');
            return;
        }

        container.innerHTML = STATE.data.servicos.map(servico => `
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">${sanitizeHtml(servico.descricao)}</h3>
                    <span class="card-badge ${servico.ativo ? 'active' : 'inactive'}">
                        ${servico.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                </div>
                <div class="card-body">
                    <div class="card-info">
                        <div class="card-info-item">
                            <i class="fas fa-dollar-sign"></i>
                            <span>${formatCurrency(servico.valor)}</span>
                        </div>
                        <div class="card-info-item">
                            <i class="fas fa-clock"></i>
                            <span>${servico.duracao || 60} min</span>
                        </div>
                        <div class="card-info-item">
                            <i class="fas fa-tag"></i>
                            <span>${sanitizeHtml(servico.categoria || 'Geral')}</span>
                        </div>
                    </div>
                </div>
                <div class="card-actions">
                    <button class="btn btn-sm btn-secondary" onclick="editService('${servico.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteService('${servico.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    },

    // Renderizar orçamentos
    renderOrcamentos() {
        const container = document.getElementById('orcamentosGrid');
        if (!container) return;

        if (STATE.data.orcamentos.length === 0) {
            container.innerHTML = this.getEmptyState('Nenhum orçamento criado', 'Crie seu primeiro orçamento');
            return;
        }

        container.innerHTML = STATE.data.orcamentos.map(orcamento => {
            const cliente = STATE.data.clientes.find(c => c.id === orcamento.cliente_id);
            const statusColor = {
                'Orçamento': 'warning',
                'Aprovado': 'info',
                'Finalizado': 'success',
                'Cancelado': 'danger'
            }[orcamento.status] || 'secondary';

            return `
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">${cliente ? sanitizeHtml(cliente.nome) : 'Cliente não encontrado'}</h3>
                        <span class="card-badge ${statusColor}">${orcamento.status}</span>
                    </div>
                    <div class="card-body">
                        <div class="card-info">
                            <div class="card-info-item">
                                <i class="fas fa-calendar"></i>
                                <span>${formatDate(orcamento.created_at)}</span>
                            </div>
                            <div class="card-info-item">
                                <i class="fas fa-dollar-sign"></i>
                                <span>${formatCurrency(orcamento.valor_total)}</span>
                            </div>
                            <div class="card-info-item">
                                <i class="fas fa-list"></i>
                                <span>${orcamento.itens?.length || 0} itens</span>
                            </div>
                        </div>
                        ${orcamento.observacoes ? `<p style="margin-top: 0.5rem; color: var(--text-secondary); font-size: 0.875rem;">${sanitizeHtml(orcamento.observacoes)}</p>` : ''}
                    </div>
                    <div class="card-actions">
                        <button class="btn btn-sm btn-primary" onclick="viewOrcamento('${orcamento.id}')">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-secondary" onclick="editOrcamento('${orcamento.id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-success" onclick="downloadPDF('${orcamento.id}')">
                            <i class="fas fa-download"></i>
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    },

    // Renderizar histórico
    renderHistorico() {
        const container = document.getElementById('historicoList');
        if (!container) return;

        if (STATE.data.orcamentos.length === 0) {
            container.innerHTML = this.getEmptyState('Nenhum histórico disponível', 'Os orçamentos aparecerão aqui');
            return;
        }

        container.innerHTML = STATE.data.orcamentos.map(orcamento => {
            const cliente = STATE.data.clientes.find(c => c.id === orcamento.cliente_id);
            
            return `
                <div class="timeline-item">
                    <div class="timeline-content">
                        <div class="timeline-header">
                            <h3 class="timeline-title">${cliente ? sanitizeHtml(cliente.nome) : 'Cliente não encontrado'}</h3>
                            <span class="timeline-date">${formatDateTime(orcamento.created_at)}</span>
                        </div>
                        <div class="timeline-body">
                            <p><strong>Status:</strong> ${orcamento.status}</p>
                            <p><strong>Valor:</strong> ${formatCurrency(orcamento.valor_total)}</p>
                            <p><strong>Itens:</strong> ${orcamento.itens?.length || 0}</p>
                            ${orcamento.observacoes ? `<p><strong>Observações:</strong> ${sanitizeHtml(orcamento.observacoes)}</p>` : ''}
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    },

    // Estado vazio
    getEmptyState(title, description) {
        return `
            <div class="empty-state">
                <i class="fas fa-inbox"></i>
                <h3>${title}</h3>
                <p>${description}</p>
            </div>
        `;
    },

    // Atualizar elemento
    updateElement(id, value) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    }
};

// Aplicação principal
const App = {
    // Inicializar aplicação
    async init() {
        try {
            UIManager.showLoading('Inicializando sistema...');
            UIManager.updateProgress(10);

            // Configurar event listeners
            this.setupEventListeners();
            UIManager.updateProgress(30);

            // Carregar dados
            DataManager.loadData();
            UIManager.updateProgress(60);

            // Renderizar interface
            UIManager.renderDashboard();
            UIManager.updateProgress(90);

            // Configurar estado inicial
            this.setupInitialState();
            UIManager.updateProgress(100);

            // Esconder loading
            setTimeout(() => {
                UIManager.hideLoading();
                showNotification('Sistema carregado com sucesso!', 'success');
            }, 1000);

        } catch (error) {
            console.error('❌ Erro na inicialização:', error);
            UIManager.hideLoading();
            showNotification('Erro ao inicializar sistema', 'error');
        }
    },

    // Configurar event listeners
    setupEventListeners() {
        // Navegação
        document.addEventListener('click', (e) => {
            const tabElement = e.target.closest('[data-tab]');
            if (tabElement) {
                e.preventDefault();
                UIManager.switchTab(tabElement.dataset.tab);
            }
        });

        // Botões de ação
        document.getElementById('btnAddClient')?.addEventListener('click', () => this.showClientForm());
        document.getElementById('btnAddService')?.addEventListener('click', () => this.showServiceForm());
        document.getElementById('quickClientBtn')?.addEventListener('click', () => this.showClientForm());
        document.getElementById('quickQuoteBtn')?.addEventListener('click', () => this.showQuoteForm());
        document.getElementById('quickAddBtn')?.addEventListener('click', () => this.showQuickMenu());

        // Pesquisa
        const searchInput = document.getElementById('searchClientes');
        if (searchInput) {
            searchInput.addEventListener('input', debounce((e) => {
                this.filterClientes(e.target.value);
            }, 300));
        }

        // Status de conexão
        window.addEventListener('online', () => {
            STATE.isOnline = true;
            this.updateConnectionStatus();
        });

        window.addEventListener('offline', () => {
            STATE.isOnline = false;
            this.updateConnectionStatus();
        });
    },

    // Configurar estado inicial
    setupInitialState() {
        this.updateConnectionStatus();
    },

    // Atualizar status de conexão
    updateConnectionStatus() {
        const syncStatus = document.getElementById('syncStatus');
        const syncIcon = document.getElementById('syncIcon');
        
        if (syncStatus && syncIcon) {
            if (STATE.isOnline) {
                syncStatus.textContent = 'Online';
                syncIcon.className = 'fas fa-wifi';
                syncStatus.parentElement.classList.remove('offline');
            } else {
                syncStatus.textContent = 'Offline';
                syncIcon.className = 'fas fa-wifi-slash';
                syncStatus.parentElement.classList.add('offline');
            }
        }
    },

    // Filtrar clientes
    filterClientes(query) {
        const filteredClientes = STATE.data.clientes.filter(cliente => 
            cliente.nome.toLowerCase().includes(query.toLowerCase()) ||
            cliente.telefone.includes(query) ||
            cliente.email.toLowerCase().includes(query.toLowerCase()) ||
            cliente.carro.toLowerCase().includes(query.toLowerCase())
        );

        const container = document.getElementById('clientesGrid');
        if (!container) return;

        if (filteredClientes.length === 0) {
            container.innerHTML = UIManager.getEmptyState('Nenhum cliente encontrado', 'Tente uma busca diferente');
            return;
        }

        container.innerHTML = filteredClientes.map(cliente => `
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">${sanitizeHtml(cliente.nome)}</h3>
                    <span class="card-badge active">Ativo</span>
                </div>
                <div class="card-body">
                    <div class="card-info">
                        <div class="card-info-item">
                            <i class="fas fa-phone"></i>
                            <span>${sanitizeHtml(cliente.telefone || 'Não informado')}</span>
                        </div>
                        <div class="card-info-item">
                            <i class="fas fa-envelope"></i>
                            <span>${sanitizeHtml(cliente.email || 'Não informado')}</span>
                        </div>
                        <div class="card-info-item">
                            <i class="fas fa-car"></i>
                            <span>${sanitizeHtml(cliente.carro || 'Não informado')}</span>
                        </div>
                        <div class="card-info-item">
                            <i class="fas fa-id-card"></i>
                            <span>${sanitizeHtml(cliente.placa || 'Não informado')}</span>
                        </div>
                    </div>
                </div>
                <div class="card-actions">
                    <button class="btn btn-sm btn-secondary" onclick="editClient('${cliente.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-success" onclick="callClient('${cliente.telefone}')">
                        <i class="fas fa-phone"></i>
                    </button>
                    <button class="btn btn-sm btn-primary" onclick="whatsappClient('${cliente.telefone}', '${cliente.nome}')">
                        <i class="fab fa-whatsapp"></i>
                    </button>
                </div>
            </div>
        `).join('');
    },

    // Mostrar formulário de cliente
    showClientForm() {
        showNotification('Formulário de cliente será implementado em breve', 'info');
    },

    // Mostrar formulário de serviço
    showServiceForm() {
        showNotification('Formulário de serviço será implementado em breve', 'info');
    },

    // Mostrar formulário de orçamento
    showQuoteForm() {
        showNotification('Formulário de orçamento será implementado em breve', 'info');
    },

    // Mostrar menu rápido
    showQuickMenu() {
        showNotification('Menu rápido será implementado em breve', 'info');
    }
};

// Funções globais para uso no HTML
function editClient(clienteId) {
    App.showClientForm();
}

function editService(servicoId) {
    App.showServiceForm();
}

function deleteService(servicoId) {
    confirmAction('Tem certeza que deseja excluir este serviço?').then(confirmed => {
        if (confirmed) {
            // Aqui você removeria o serviço do array
            STATE.data.servicos = STATE.data.servicos.filter(s => s.id !== servicoId);
            UIManager.renderServicos();
            showNotification('Serviço excluído com sucesso', 'success');
        }
    });
}

function callClient(telefone) {
    if (telefone && telefone !== 'Não informado') {
        window.location.href = `tel:${telefone}`;
    } else {
        showNotification('Telefone não informado', 'warning');
    }
}

function whatsappClient(telefone, nome) {
    if (telefone && telefone !== 'Não informado') {
        const cleanPhone = telefone.replace(/\D/g, '');
        const message = `Olá ${nome}, tudo bem? Gostaria de informações sobre nossos serviços.`;
        const url = `https://wa.me/55${cleanPhone}?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
    } else {
        showNotification('Telefone não informado', 'warning');
    }
}

function viewOrcamento(orcamentoId) {
    showNotification('Visualização de orçamento será implementada em breve', 'info');
}

function editOrcamento(orcamentoId) {
    showNotification('Edição de orçamento será implementada em breve', 'info');
}

function downloadPDF(orcamentoId) {
    showNotification('Download de PDF será implementado em breve', 'info');
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Iniciando R.M. CRM Pro+ v' + CONFIG.app.version);
    App.init();
});

// Exportar para uso global
window.App = App;
window.UIManager = UIManager;
window.DataManager = DataManager;
window.STATE = STATE;
