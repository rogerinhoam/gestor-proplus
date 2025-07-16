// ===== CONFIGURAÇÃO GLOBAL =====
const CONFIG = {
    supabase: {
        url: 'https://bezbszbkaifcanqsmdbi.supabase.co',
        key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJlemJzemJrYWlmY2FucXNtZGJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI2MTM5MTksImV4cCI6MjA2ODE4OTkxOX0.zLXAuQz7g5ym3Bd5pkhg5vsnf_3rdJFRAXI_kX8tM18'
    },
    app: {
        name: 'R.M. Estética Automotiva',
        version: '2.0.0'
    }
};

// ===== ESTADO GLOBAL =====
const STATE = {
    db: null,
    currentTab: 'dashboard',
    isOnline: navigator.onLine,
    data: {
        clientes: [],
        servicos: [],
        orcamentos: []
    },
    ui: {
        loading: false,
        modals: {},
        notifications: []
    }
};

// ===== DADOS DE EXEMPLO =====
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
            created_at: '2024-01-15T10:00:00Z',
            updated_at: '2024-01-15T10:00:00Z'
        },
        {
            id: 'c2',
            nome: 'Maria Santos',
            telefone: '(24) 88888-8888',
            email: 'maria.santos@email.com',
            carro: 'Toyota Corolla 2019',
            placa: 'DEF-5678',
            endereco: 'Avenida Central, 456',
            created_at: '2024-01-10T14:30:00Z',
            updated_at: '2024-01-10T14:30:00Z'
        },
        {
            id: 'c3',
            nome: 'Pedro Oliveira',
            telefone: '(24) 77777-7777',
            email: 'pedro.oliveira@email.com',
            carro: 'Volkswagen Gol 2018',
            placa: 'GHI-9012',
            endereco: 'Travessa do Porto, 789',
            created_at: '2024-01-05T09:15:00Z',
            updated_at: '2024-01-05T09:15:00Z'
        }
    ],
    servicos: [
        {
            id: 's1',
            descricao: 'Lavagem Completa',
            valor: 35.00,
            duracao: 60,
            categoria: 'Lavagem',
            ativo: true,
            created_at: '2024-01-01T08:00:00Z',
            updated_at: '2024-01-01T08:00:00Z'
        },
        {
            id: 's2',
            descricao: 'Enceramento',
            valor: 45.00,
            duracao: 90,
            categoria: 'Proteção',
            ativo: true,
            created_at: '2024-01-01T08:00:00Z',
            updated_at: '2024-01-01T08:00:00Z'
        },
        {
            id: 's3',
            descricao: 'Lavagem + Enceramento',
            valor: 75.00,
            duracao: 120,
            categoria: 'Combo',
            ativo: true,
            created_at: '2024-01-01T08:00:00Z',
            updated_at: '2024-01-01T08:00:00Z'
        },
        {
            id: 's4',
            descricao: 'Aspiração Completa',
            valor: 20.00,
            duracao: 30,
            categoria: 'Interno',
            ativo: true,
            created_at: '2024-01-01T08:00:00Z',
            updated_at: '2024-01-01T08:00:00Z'
        },
        {
            id: 's5',
            descricao: 'Pneu Pretinho',
            valor: 25.00,
            duracao: 15,
            categoria: 'Detalhamento',
            ativo: true,
            created_at: '2024-01-01T08:00:00Z',
            updated_at: '2024-01-01T08:00:00Z'
        }
    ],
    orcamentos: [
        {
            id: 'o1',
            cliente_id: 'c1',
            valor_total: 110.00,
            desconto: 0,
            status: 'Finalizado',
            observacoes: 'Serviço executado com excelência',
            created_at: '2024-01-15T10:30:00Z',
            updated_at: '2024-01-15T11:30:00Z',
            itens: [
                { servico_id: 's3', quantidade: 1, valor: 75.00 },
                { servico_id: 's4', quantidade: 1, valor: 20.00 },
                { servico_id: 's5', quantidade: 1, valor: 25.00 }
            ]
        },
        {
            id: 'o2',
            cliente_id: 'c2',
            valor_total: 80.00,
            desconto: 0,
            status: 'Orçamento',
            observacoes: 'Aguardando aprovação do cliente',
            created_at: '2024-01-14T15:00:00Z',
            updated_at: '2024-01-14T15:00:00Z',
            itens: [
                { servico_id: 's1', quantidade: 1, valor: 35.00 },
                { servico_id: 's2', quantidade: 1, valor: 45.00 }
            ]
        },
        {
            id: 'o3',
            cliente_id: 'c3',
            valor_total: 60.00,
            desconto: 5,
            status: 'Aprovado',
            observacoes: 'Cliente pediu desconto, aprovado',
            created_at: '2024-01-12T11:00:00Z',
            updated_at: '2024-01-12T11:15:00Z',
            itens: [
                { servico_id: 's1', quantidade: 1, valor: 35.00 },
                { servico_id: 's4', quantidade: 1, valor: 20.00 }
            ]
        }
    ]
};

// ===== UTILITÁRIOS =====
const Utils = {
    // Formatação de moeda
    formatCurrency: (value) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    },

    // Formatação de data
    formatDate: (date) => {
        return new Intl.DateTimeFormat('pt-BR').format(new Date(date));
    },

    // Formatação de data e hora
    formatDateTime: (date) => {
        return new Intl.DateTimeFormat('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(new Date(date));
    },

    // Máscara de telefone
    formatPhone: (value) => {
        return value
            .replace(/\D/g, '')
            .replace(/^(\d{2})(\d)/, '($1) $2')
            .replace(/(\d)(\d{4})$/, '$1-$2');
    },

    // Máscara de placa
    formatPlate: (value) => {
        return value
            .replace(/[^a-zA-Z0-9]/g, '')
            .toUpperCase()
            .replace(/^([A-Z]{3})(\d)/, '$1-$2');
    },

    // Debounce para pesquisas
    debounce: (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Gerar ID único
    generateId: () => {
        return Math.random().toString(36).substr(2, 9);
    },

    // Sanitizar HTML
    sanitizeHtml: (str) => {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }
};

// ===== GERENCIADOR DE DADOS =====
const DataManager = {
    // Inicializar Supabase
    async initSupabase() {
        try {
            if (window.supabase) {
                const { createClient } = supabase;
                STATE.db = createClient(CONFIG.supabase.url, CONFIG.supabase.key);
                
                // Testar conexão
                const { data, error } = await STATE.db
                    .from('clientes')
                    .select('id')
                    .limit(1);
                
                if (error && error.code !== 'PGRST116') {
                    throw error;
                }
                
                console.log('✅ Supabase conectado');
                return true;
            }
        } catch (error) {
            console.warn('⚠️ Supabase não disponível:', error);
        }
        return false;
    },

    // Carregar dados
    async loadData() {
        try {
            if (STATE.db) {
                await Promise.all([
                    this.loadClientes(),
                    this.loadServicos(),
                    this.loadOrcamentos()
                ]);
            } else {
                this.loadSampleData();
            }
        } catch (error) {
            console.error('❌ Erro ao carregar dados:', error);
            this.loadSampleData();
        }
    },

    // Carregar dados de exemplo
    loadSampleData() {
        STATE.data = { ...SAMPLE_DATA };
        console.log('📋 Dados de exemplo carregados');
    },

    // Carregar clientes
    async loadClientes() {
        try {
            const { data, error } = await STATE.db
                .from('clientes')
                .select('*')
                .order('nome');
            
            if (error) throw error;
            STATE.data.clientes = data || [];
        } catch (error) {
            console.error('❌ Erro ao carregar clientes:', error);
            STATE.data.clientes = SAMPLE_DATA.clientes;
        }
    },

    // Carregar serviços
    async loadServicos() {
        try {
            const { data, error } = await STATE.db
                .from('servicos')
                .select('*')
                .order('descricao');
            
            if (error) throw error;
            STATE.data.servicos = data || [];
        } catch (error) {
            console.error('❌ Erro ao carregar serviços:', error);
            STATE.data.servicos = SAMPLE_DATA.servicos;
        }
    },

    // Carregar orçamentos
    async loadOrcamentos() {
        try {
            const { data, error } = await STATE.db
                .from('orcamentos')
                .select(`
                    *,
                    clientes(nome, carro, placa),
                    orcamento_itens(
                        servico_id,
                        quantidade,
                        valor_cobrado,
                        servicos(descricao)
                    )
                `)
                .order('created_at', { ascending: false });
            
            if (error) throw error;
            STATE.data.orcamentos = data || [];
        } catch (error) {
            console.error('❌ Erro ao carregar orçamentos:', error);
            STATE.data.orcamentos = SAMPLE_DATA.orcamentos;
        }
    },

    // Salvar cliente
    async saveCliente(cliente) {
        try {
            if (STATE.db) {
                const { data, error } = await STATE.db
                    .from('clientes')
                    .insert([cliente])
                    .select()
                    .single();
                
                if (error) throw error;
                
                STATE.data.clientes.push(data);
                return data;
            } else {
                cliente.id = Utils.generateId();
                cliente.created_at = new Date().toISOString();
                cliente.updated_at = new Date().toISOString();
                STATE.data.clientes.push(cliente);
                return cliente;
            }
        } catch (error) {
            console.error('❌ Erro ao salvar cliente:', error);
            throw error;
        }
    },

    // Salvar serviço
    async saveServico(servico) {
        try {
            if (STATE.db) {
                const { data, error } = await STATE.db
                    .from('servicos')
                    .insert([servico])
                    .select()
                    .single();
                
                if (error) throw error;
                
                STATE.data.servicos.push(data);
                return data;
            } else {
                servico.id = Utils.generateId();
                servico.created_at = new Date().toISOString();
                servico.updated_at = new Date().toISOString();
                STATE.data.servicos.push(servico);
                return servico;
            }
        } catch (error) {
            console.error('❌ Erro ao salvar serviço:', error);
            throw error;
        }
    },

    // Salvar orçamento
    async saveOrcamento(orcamento) {
        try {
            if (STATE.db) {
                const { data, error } = await STATE.db
                    .from('orcamentos')
                    .insert([orcamento])
                    .select()
                    .single();
                
                if (error) throw error;
                
                STATE.data.orcamentos.unshift(data);
                return data;
            } else {
                orcamento.id = Utils.generateId();
                orcamento.created_at = new Date().toISOString();
                orcamento.updated_at = new Date().toISOString();
                STATE.data.orcamentos.unshift(orcamento);
                return orcamento;
            }
        } catch (error) {
            console.error('❌ Erro ao salvar orçamento:', error);
            throw error;
        }
    },

    // Deletar cliente
    async deleteCliente(id) {
        try {
            if (STATE.db) {
                const { error } = await STATE.db
                    .from('clientes')
                    .delete()
                    .eq('id', id);
                
                if (error) throw error;
            }
            
            STATE.data.clientes = STATE.data.clientes.filter(c => c.id !== id);
        } catch (error) {
            console.error('❌ Erro ao deletar cliente:', error);
            throw error;
        }
    },

    // Deletar serviço
    async deleteServico(id) {
        try {
            if (STATE.db) {
                const { error } = await STATE.db
                    .from('servicos')
                    .delete()
                    .eq('id', id);
                
                if (error) throw error;
            }
            
            STATE.data.servicos = STATE.data.servicos.filter(s => s.id !== id);
        } catch (error) {
            console.error('❌ Erro ao deletar serviço:', error);
            throw error;
        }
    }
};

// ===== GERENCIADOR DE UI =====
const UIManager = {
    // Mostrar loading
    showLoading(message = 'Carregando...') {
        const loading = document.getElementById('loadingScreen');
        if (loading) {
            loading.classList.remove('hidden');
            if (message) {
                const p = loading.querySelector('p');
                if (p) p.textContent = message;
            }
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

    // Atualizar progresso do loading
    updateProgress(percent) {
        const progress = document.getElementById('loadingProgress');
        if (progress) {
            progress.style.width = `${percent}%`;
        }
    },

    // Mostrar notificação
    showNotification(message, type = 'info', duration = 5000) {
        const toast = document.getElementById('notification');
        if (!toast) return;

        toast.textContent = message;
        toast.className = `toast ${type}`;
        toast.classList.add('show');

        setTimeout(() => {
            toast.classList.remove('show');
        }, duration);
    },

    // Confirmar ação
    async confirm(message, title = 'Confirmar') {
        return new Promise((resolve) => {
            const result = window.confirm(`${title}\n\n${message}`);
            resolve(result);
        });
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
        this.updateElement('metricRevenue', Utils.formatCurrency(faturamento));

        // Renderizar gráficos
        this.renderCharts();
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
            <article class="card">
                <header class="card-header">
                    <h3 class="card-title">${Utils.sanitizeHtml(cliente.nome)}</h3>
                    <span class="card-badge active">Ativo</span>
                </header>
                <div class="card-body">
                    <div class="card-info">
                        <div class="card-info-item">
                            <i class="fas fa-phone"></i>
                            <span>${Utils.sanitizeHtml(cliente.telefone || 'Não informado')}</span>
                        </div>
                        <div class="card-info-item">
                            <i class="fas fa-car"></i>
                            <span>${Utils.sanitizeHtml(cliente.carro || 'Não informado')}</span>
                        </div>
                        <div class="card-info-item">
                            <i class="fas fa-id-badge"></i>
                            <span>${Utils.sanitizeHtml(cliente.placa || 'Não informado')}</span>
                        </div>
                    </div>
                </div>
                <footer class="card-actions">
                    <button class="btn btn-success btn-sm" onclick="App.callClient('${cliente.telefone}')">
                        <i class="fas fa-phone"></i> Ligar
                    </button>
                    <button class="btn btn-primary btn-sm" onclick="App.whatsappClient('${cliente.telefone}', '${cliente.nome}')">
                        <i class="fab fa-whatsapp"></i> WhatsApp
                    </button>
                    <button class="btn btn-secondary btn-sm" onclick="App.editClient('${cliente.id}')">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="App.deleteClient('${cliente.id}')">
                        <i class="fas fa-trash"></i> Excluir
                    </button>
                </footer>
            </article>
        `).join('');
    },

    // Renderizar serviços
    renderServicos() {
        const container = document.getElementById('servicosGrid');
        if (!container) return;

        if (STATE.data.servicos.length === 0) {
            container.innerHTML = this.getEmptyState('Nenhum serviço cadastrado', 'Adicione seus serviços para começar a criar orçamentos');
            return;
        }

        container.innerHTML = STATE.data.servicos.map(servico => `
            <article class="card">
                <header class="card-header">
                    <h3 class="card-title">${Utils.sanitizeHtml(servico.descricao)}</h3>
                    <span class="card-badge ${servico.ativo ? 'active' : 'inactive'}">
                        ${servico.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                </header>
                <div class="card-body">
                    <div class="card-info">
                        <div class="card-info-item">
                            <i class="fas fa-dollar-sign"></i>
                            <span>${Utils.formatCurrency(servico.valor)}</span>
                        </div>
                        <div class="card-info-item">
                            <i class="fas fa-clock"></i>
                            <span>${servico.duracao || 60} min</span>
                        </div>
                        <div class="card-info-item">
                            <i class="fas fa-tag"></i>
                            <span>${Utils.sanitizeHtml(servico.categoria || 'Geral')}</span>
                        </div>
                    </div>
                </div>
                <footer class="card-actions">
                    <button class="btn btn-secondary btn-sm" onclick="App.editService('${servico.id}')">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="App.deleteService('${servico.id}')">
                        <i class="fas fa-trash"></i> Excluir
                    </button>
                </footer>
            </article>
        `).join('');
    },

    // Renderizar orçamentos
    renderOrcamentos() {
        const container = document.getElementById('orcamentosGrid');
        if (!container) return;

        if (STATE.data.orcamentos.length === 0) {
            container.innerHTML = this.getEmptyState('Nenhum orçamento criado', 'Crie seu primeiro orçamento para um cliente');
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
                <article class="card">
                    <header class="card-header">
                        <h3 class="card-title">${Utils.sanitizeHtml(cliente?.nome || 'Cliente não encontrado')}</h3>
                        <span class="card-badge ${statusColor}">${orcamento.status}</span>
                    </header>
                    <div class="card-body">
                        <div class="card-info">
                            <div class="card-info-item">
                                <i class="fas fa-calendar"></i>
                                <span>${Utils.formatDate(orcamento.created_at)}</span>
                            </div>
                            <div class="card-info-item">
                                <i class="fas fa-dollar-sign"></i>
                                <span>${Utils.formatCurrency(orcamento.valor_total)}</span>
                            </div>
                            <div class="card-info-item">
                                <i class="fas fa-list"></i>
                                <span>${orcamento.itens?.length || 0} itens</span>
                            </div>
                        </div>
                    </div>
                    <footer class="card-actions">
                        <button class="btn btn-primary btn-sm" onclick="App.viewOrcamento('${orcamento.id}')">
                            <i class="fas fa-eye"></i> Ver
                        </button>
                        <button class="btn btn-secondary btn-sm" onclick="App.editOrcamento('${orcamento.id}')">
                            <i class="fas fa-edit"></i> Editar
                        </button>
                        <button class="btn btn-success btn-sm" onclick="App.downloadPDF('${orcamento.id}')">
                            <i class="fas fa-download"></i> PDF
                        </button>
                    </footer>
                </article>
            `;
        }).join('');
    },

    // Renderizar histórico
    renderHistorico() {
        const container = document.getElementById('historicoList');
        if (!container) return;

        if (STATE.data.orcamentos.length === 0) {
            container.innerHTML = this.getEmptyState('Nenhum histórico disponível', 'Os orçamentos criados aparecerão aqui');
            return;
        }

        container.innerHTML = STATE.data.orcamentos.map(orcamento => {
            const cliente = STATE.data.clientes.find(c => c.id === orcamento.cliente_id);
            
            return `
                <article class="timeline-item">
                    <div class="timeline-content">
                        <header class="timeline-header">
                            <h3 class="timeline-title">${Utils.sanitizeHtml(cliente?.nome || 'Cliente não encontrado')}</h3>
                            <time class="timeline-date">${Utils.formatDateTime(orcamento.created_at)}</time>
                        </header>
                        <div class="timeline-body">
                            <p><strong>Status:</strong> ${orcamento.status}</p>
                            <p><strong>Valor:</strong> ${Utils.formatCurrency(orcamento.valor_total)}</p>
                            <p><strong>Itens:</strong> ${orcamento.itens?.length || 0}</p>
                            ${orcamento.observacoes ? `<p><strong>Observações:</strong> ${Utils.sanitizeHtml(orcamento.observacoes)}</p>` : ''}
                        </div>
                    </div>
                </article>
            `;
        }).join('');
    },

    // Estado vazio
    getEmptyState(title, description) {
        return `
            <div class="empty-state">
                <i class="fas fa-inbox" style="font-size: 3rem; color: var(--text-muted); margin-bottom: 1rem;"></i>
                <h3 style="color: var(--text-secondary); margin-bottom: 0.5rem;">${title}</h3>
                <p style="color: var(--text-muted);">${description}</p>
            </div>
        `;
    },

    // Renderizar gráficos
    renderCharts() {
        // Implementação dos gráficos seria aqui
        // Por enquanto, apenas placeholder
        console.log('📊 Gráficos renderizados');
    },

    // Atualizar elemento
    updateElement(id, value) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    },

    // Filtrar clientes
    filterClientes(searchTerm) {
        const filteredClientes = STATE.data.clientes.filter(cliente => 
            cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
            cliente.telefone?.includes(searchTerm) ||
            cliente.carro?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            cliente.placa?.toLowerCase().includes(searchTerm.toLowerCase())
        );

        const container = document.getElementById('clientesGrid');
        if (!container) return;

        if (filteredClientes.length === 0) {
            container.innerHTML = this.getEmptyState('Nenhum cliente encontrado', `Nenhum resultado para "${searchTerm}"`);
            return;
        }

        // Renderizar clientes filtrados usando a mesma lógica
        const originalClientes = STATE.data.clientes;
        STATE.data.clientes = filteredClientes;
        this.renderClientes();
        STATE.data.clientes = originalClientes;
    }
};

// ===== APLICAÇÃO PRINCIPAL =====
const App = {
    // Inicializar aplicação
    async init() {
        try {
            UIManager.showLoading('Inicializando sistema...');
            UIManager.updateProgress(10);

            // Configurar event listeners
            this.setupEventListeners();
            UIManager.updateProgress(30);

            // Inicializar Supabase
            await DataManager.initSupabase();
            UIManager.updateProgress(50);

            // Carregar dados
            await DataManager.loadData();
            UIManager.updateProgress(70);

            // Renderizar interface
            UIManager.renderDashboard();
            UIManager.updateProgress(90);

            // Configurar estado inicial
            this.setupInitialState();
            UIManager.updateProgress(100);

            // Esconder loading
            setTimeout(() => {
                UIManager.hideLoading();
                UIManager.showNotification('Sistema carregado com sucesso!', 'success');
            }, 500);

        } catch (error) {
            console.error('❌ Erro na inicialização:', error);
            UIManager.hideLoading();
            UIManager.showNotification('Erro ao inicializar sistema', 'error');
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
        document.getElementById('btnNewQuote')?.addEventListener('click', () => this.showQuoteForm());
        document.getElementById('quickClientBtn')?.addEventListener('click', () => this.showClientForm());
        document.getElementById('quickQuoteBtn')?.addEventListener('click', () => this.showQuoteForm());
        document.getElementById('quickAddBtn')?.addEventListener('click', () => this.showQuickMenu());

        // Pesquisa
        const searchInput = document.getElementById('searchClientes');
        if (searchInput) {
            searchInput.addEventListener('input', Utils.debounce((e) => {
                UIManager.filterClientes(e.target.value);
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

        // Teclas de atalho
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case 'n':
                        e.preventDefault();
                        if (STATE.currentTab === 'clientes') this.showClientForm();
                        else if (STATE.currentTab === 'servicos') this.showServiceForm();
                        else if (STATE.currentTab === 'orcamento') this.showQuoteForm();
                        break;
                    case 'f':
                        e.preventDefault();
                        document.getElementById('searchClientes')?.focus();
                        break;
                }
            }
        });
    },

    // Configurar estado inicial
    setupInitialState() {
        this.updateConnectionStatus();
        this.updateNotificationBadge();
    },

    // Atualizar status de conexão
    updateConnectionStatus() {
        const syncStatus = document.getElementById('syncStatus');
        const syncIcon = document.getElementById('syncIcon');
        
        if (syncStatus && syncIcon) {
            if (STATE.isOnline) {
                syncStatus.textContent = 'Online';
                syncIcon.className = 'fas fa-wifi';
                syncStatus.className = 'sync-status';
            } else {
                syncStatus.textContent = 'Offline';
                syncIcon.className = 'fas fa-wifi-slash';
                syncStatus.className = 'sync-status offline';
            }
        }
    },

    // Atualizar badge de notificações
    updateNotificationBadge() {
        const badge = document.getElementById('badgeCount');
        if (badge) {
            const count = STATE.ui.notifications.length;
            badge.textContent = count;
            badge.classList.toggle('active', count > 0);
        }
    },

    // Mostrar formulário de cliente
    showClientForm(clienteId = null) {
        const cliente = clienteId ? STATE.data.clientes.find(c => c.id === clienteId) : null;
        
        const form = `
            <div class="modal-overlay" onclick="this.remove()">
                <div class="modal" onclick="event.stopPropagation()">
                    <header class="modal-header">
                        <h2>${cliente ? 'Editar Cliente' : 'Novo Cliente'}</h2>
                        <button class="btn btn-ghost btn-sm" onclick="this.closest('.modal-overlay').remove()">
                            <i class="fas fa-times"></i>
                        </button>
                    </header>
                    <form class="modal-body" onsubmit="App.saveClient(event, '${clienteId || ''}')">
                        <div class="form-group">
                            <label for="clienteNome">Nome *</label>
                            <input type="text" id="clienteNome" value="${cliente?.nome || ''}" required>
                        </div>
                        <div class="form-group">
                            <label for="clienteTelefone">Telefone</label>
                            <input type="text" id="clienteTelefone" value="${cliente?.telefone || ''}" 
                                   oninput="this.value = App.formatPhone(this.value)">
                        </div>
                        <div class="form-group">
                            <label for="clienteEmail">Email</label>
                            <input type="email" id="clienteEmail" value="${cliente?.email || ''}">
                        </div>
                        <div class="form-group">
                            <label for="clienteCarro">Veículo</label>
                            <input type="text" id="clienteCarro" value="${cliente?.carro || ''}">
                        </div>
                        <div class="form-group">
                            <label for="clientePlaca">Placa</label>
                            <input type="text" id="clientePlaca" value="${cliente?.placa || ''}" 
                                   oninput="this.value = App.formatPlate(this.value)">
                        </div>
                        <div class="form-group">
                            <label for="clienteEndereco">Endereço</label>
                            <input type="text" id="clienteEndereco" value="${cliente?.endereco || ''}">
                        </div>
                        <footer class="modal-footer">
                            <button type="button" class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">
                                Cancelar
                            </button>
                            <button type="submit" class="btn btn-primary">
                                <i class="fas fa-save"></i> Salvar
                            </button>
                        </footer>
                    </form>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', form);
        document.getElementById('clienteNome').focus();
    },

    // Mostrar formulário de serviço
    showServiceForm(servicoId = null) {
        const servico = servicoId ? STATE.data.servicos.find(s => s.id === servicoId) : null;
        
        const form = `
            <div class="modal-overlay" onclick="this.remove()">
                <div class="modal" onclick="event.stopPropagation()">
                    <header class="modal-header">
                        <h2>${servico ? 'Editar Serviço' : 'Novo Serviço'}</h2>
                        <button class="btn btn-ghost btn-sm" onclick="this.closest('.modal-overlay').remove()">
                            <i class="fas fa-times"></i>
                        </button>
                    </header>
                    <form class="modal-body" onsubmit="App.saveService(event, '${servicoId || ''}')">
                        <div class="form-group">
                            <label for="servicoDescricao">Descrição *</label>
                            <input type="text" id="servicoDescricao" value="${servico?.descricao || ''}" required>
                        </div>
                        <div class="form-group">
                            <label for="servicoValor">Valor *</label>
                            <input type="number" id="servicoValor" value="${servico?.valor || ''}" 
                                   step="0.01" min="0" required>
                        </div>
                        <div class="form-group">
                            <label for="servicoDuracao">Duração (min)</label>
                            <input type="number" id="servicoDuracao" value="${servico?.duracao || 60}" 
                                   min="1" max="480">
                        </div>
                        <div class="form-group">
                            <label for="servicoCategoria">Categoria</label>
                            <select id="servicoCategoria">
                                <option value="Lavagem" ${servico?.categoria === 'Lavagem' ? 'selected' : ''}>Lavagem</option>
                                <option value="Proteção" ${servico?.categoria === 'Proteção' ? 'selected' : ''}>Proteção</option>
                                <option value="Interno" ${servico?.categoria === 'Interno' ? 'selected' : ''}>Interno</option>
                                <option value="Detalhamento" ${servico?.categoria === 'Detalhamento' ? 'selected' : ''}>Detalhamento</option>
                                <option value="Combo" ${servico?.categoria === 'Combo' ? 'selected' : ''}>Combo</option>
                            </select>
                        </div>
                        <footer class="modal-footer">
                            <button type="button" class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">
                                Cancelar
                            </button>
                            <button type="submit" class="btn btn-primary">
                                <i class="fas fa-save"></i> Salvar
                            </button>
                        </footer>
                    </form>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', form);
        document.getElementById('servicoDescricao').focus();
    },

    // Mostrar formulário de orçamento
    showQuoteForm(orcamentoId = null) {
        UIManager.showNotification('Formulário de orçamento em desenvolvimento', 'info');
    },

    // Mostrar menu rápido
    showQuickMenu() {
        const menu = `
            <div class="modal-overlay" onclick="this.remove()">
                <div class="quick-menu" onclick="event.stopPropagation()">
                    <h3>Ações Rápidas</h3>
                    <div class="quick-actions">
                        <button class="btn btn-primary" onclick="App.showClientForm(); this.closest('.modal-overlay').remove();">
                            <i class="fas fa-user-plus"></i> Novo Cliente
                        </button>
                        <button class="btn btn-primary" onclick="App.showServiceForm(); this.closest('.modal-overlay').remove();">
                            <i class="fas fa-plus"></i> Novo Serviço
                        </button>
                        <button class="btn btn-primary" onclick="App.showQuoteForm(); this.closest('.modal-overlay').remove();">
                            <i class="fas fa-file-invoice"></i> Novo Orçamento
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', menu);
    },

    // Salvar cliente
    async saveClient(event, clienteId = null) {
        event.preventDefault();
        
        const cliente = {
            nome: document.getElementById('clienteNome').value.trim(),
            telefone: document.getElementById('clienteTelefone').value.trim(),
            email: document.getElementById('clienteEmail').value.trim(),
            carro: document.getElementById('clienteCarro').value.trim(),
            placa: document.getElementById('clientePlaca').value.trim(),
            endereco: document.getElementById('clienteEndereco').value.trim()
        };

        if (!cliente.nome) {
            UIManager.showNotification('Nome é obrigatório', 'error');
            return;
        }

        try {
            UIManager.showLoading('Salvando cliente...');
            
            if (clienteId) {
                // Atualizar cliente existente
                const index = STATE.data.clientes.findIndex(c => c.id === clienteId);
                if (index !== -1) {
                    STATE.data.clientes[index] = { ...STATE.data.clientes[index], ...cliente };
                }
            } else {
                // Criar novo cliente
                await DataManager.saveCliente(cliente);
            }

            UIManager.hideLoading();
            UIManager.showNotification('Cliente salvo com sucesso!', 'success');
            UIManager.renderClientes();
            
            // Fechar modal
            document.querySelector('.modal-overlay').remove();

        } catch (error) {
            UIManager.hideLoading();
            UIManager.showNotification('Erro ao salvar cliente', 'error');
        }
    },

    // Salvar serviço
    async saveService(event, servicoId = null) {
        event.preventDefault();
        
        const servico = {
            descricao: document.getElementById('servicoDescricao').value.trim(),
            valor: parseFloat(document.getElementById('servicoValor').value),
            duracao: parseInt(document.getElementById('servicoDuracao').value) || 60,
            categoria: document.getElementById('servicoCategoria').value,
            ativo: true
        };

        if (!servico.descricao || !servico.valor) {
            UIManager.showNotification('Descrição e valor são obrigatórios', 'error');
            return;
        }

        try {
            UIManager.showLoading('Salvando serviço...');
            
            if (servicoId) {
                // Atualizar serviço existente
                const index = STATE.data.servicos.findIndex(s => s.id === servicoId);
                if (index !== -1) {
                    STATE.data.servicos[index] = { ...STATE.data.servicos[index], ...servico };
                }
            } else {
                // Criar novo serviço
                await DataManager.saveServico(servico);
            }

            UIManager.hideLoading();
            UIManager.showNotification('Serviço salvo com sucesso!', 'success');
            UIManager.renderServicos();
            
            // Fechar modal
            document.querySelector('.modal-overlay').remove();

        } catch (error) {
            UIManager.hideLoading();
            UIManager.showNotification('Erro ao salvar serviço', 'error');
        }
    },

    // Editar cliente
    editClient(clienteId) {
        this.showClientForm(clienteId);
    },

    // Editar serviço
    editService(servicoId) {
        this.showServiceForm(servicoId);
    },

    // Deletar cliente
    async deleteClient(clienteId) {
        const cliente = STATE.data.clientes.find(c => c.id === clienteId);
        if (!cliente) return;

        const confirmed = await UIManager.confirm(
            `Tem certeza que deseja excluir o cliente "${cliente.nome}"?`,
            'Excluir Cliente'
        );

        if (confirmed) {
            try {
                UIManager.showLoading('Excluindo cliente...');
                await DataManager.deleteCliente(clienteId);
                UIManager.hideLoading();
                UIManager.showNotification('Cliente excluído com sucesso!', 'success');
                UIManager.renderClientes();
            } catch (error) {
                UIManager.hideLoading();
                UIManager.showNotification('Erro ao excluir cliente', 'error');
            }
        }
    },

    // Deletar serviço
    async deleteService(servicoId) {
        const servico = STATE.data.servicos.find(s => s.id === servicoId);
        if (!servico) return;

        const confirmed = await UIManager.confirm(
            `Tem certeza que deseja excluir o serviço "${servico.descricao}"?`,
            'Excluir Serviço'
        );

        if (confirmed) {
            try {
                UIManager.showLoading('Excluindo serviço...');
                await DataManager.deleteServico(servicoId);
                UIManager.hideLoading();
                UIManager.showNotification('Serviço excluído com sucesso!', 'success');
                UIManager.renderServicos();
            } catch (error) {
                UIManager.hideLoading();
                UIManager.showNotification('Erro ao excluir serviço', 'error');
            }
        }
    },

    // Ligar para cliente
    callClient(telefone) {
        if (telefone && telefone !== 'Não informado') {
            window.location.href = `tel:${telefone}`;
        } else {
            UIManager.showNotification('Telefone não informado', 'warning');
        }
    },

    // WhatsApp para cliente
    whatsappClient(telefone, nome) {
        if (telefone && telefone !== 'Não informado') {
            const cleanPhone = telefone.replace(/\D/g, '');
            const message = `Olá ${nome}, tudo bem? Gostaria de agendar um serviço de estética automotiva. Poderia me passar mais informações?`;
            const url = `https://wa.me/55${cleanPhone}?text=${encodeURIComponent(message)}`;
            window.open(url, '_blank');
        } else {
            UIManager.showNotification('Telefone não informado', 'warning');
        }
    },

    // Ver orçamento
    viewOrcamento(orcamentoId) {
        UIManager.showNotification('Visualização de orçamento em desenvolvimento', 'info');
    },

    // Editar orçamento
    editOrcamento(orcamentoId) {
        UIManager.showNotification('Edição de orçamento em desenvolvimento', 'info');
    },

    // Download PDF
    downloadPDF(orcamentoId) {
        UIManager.showNotification('Download de PDF em desenvolvimento', 'info');
    },

    // Formatação de telefone
    formatPhone(value) {
        return Utils.formatPhone(value);
    },

    // Formatação de placa
    formatPlate(value) {
        return Utils.formatPlate(value);
    }
};

// ===== INICIALIZAÇÃO =====
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Iniciando R.M. CRM Pro+ v' + CONFIG.app.version);
    App.init();
});

// ===== ESTILOS ADICIONAIS PARA MODAIS =====
const modalStyles = `
    <style>
        .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 2000;
            backdrop-filter: blur(4px);
        }
        
        .modal {
            background: var(--bg-secondary);
            border: 1px solid var(--border);
            border-radius: var(--radius-lg);
            width: 90%;
            max-width: 500px;
            max-height: 80vh;
            overflow: hidden;
            animation: modalIn 0.3s ease-out;
        }
        
        @keyframes modalIn {
            from {
                opacity: 0;
                transform: scale(0.9) translateY(-20px);
            }
            to {
                opacity: 1;
                transform: scale(1) translateY(0);
            }
        }
        
        .modal-header {
            padding: var(--space-lg);
            border-bottom: 1px solid var(--border);
            display: flex;
            align-items: center;
            justify-content: space-between;
        }
        
        .modal-header h2 {
            margin: 0;
            color: var(--text-primary);
            font-size: 1.25rem;
        }
        
        .modal-body {
            padding: var(--space-lg);
            overflow-y: auto;
        }
        
        .modal-footer {
            padding: var(--space-lg);
            border-top: 1px solid var(--border);
            display: flex;
            gap: var(--space-sm);
            justify-content: flex-end;
        }
        
        .form-group {
            margin-bottom: var(--space-md);
        }
        
        .form-group label {
            display: block;
            margin-bottom: var(--space-xs);
            color: var(--text-secondary);
            font-weight: 500;
        }
        
        .form-group input,
        .form-group select,
        .form-group textarea {
            width: 100%;
            padding: var(--space-sm);
            border: 1px solid var(--border);
            border-radius: var(--radius);
            background: var(--bg-tertiary);
            color: var(--text-primary);
            font-size: 0.875rem;
            transition: var(--transition);
        }
        
        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
            outline: none;
            border-color: var(--primary);
            box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
        }
        
        .quick-menu {
            background: var(--bg-secondary);
            border: 1px solid var(--border);
            border-radius: var(--radius-lg);
            padding: var(--space-lg);
            width: 90%;
            max-width: 400px;
            animation: modalIn 0.3s ease-out;
        }
        
        .quick-menu h3 {
            margin: 0 0 var(--space-md) 0;
            color: var(--text-primary);
            text-align: center;
        }
        
        .quick-menu .quick-actions {
            display: flex;
            flex-direction: column;
            gap: var(--space-sm);
        }
        
        .empty-state {
            text-align: center;
            padding: var(--space-2xl);
            grid-column: 1 / -1;
        }
    </style>
`;

document.head.insertAdjacentHTML('beforeend', modalStyles);

// ===== EXPORTAÇÃO GLOBAL =====
window.App = App;
window.UIManager = UIManager;
window.DataManager = DataManager;
window.Utils = Utils;
window.STATE = STATE;
