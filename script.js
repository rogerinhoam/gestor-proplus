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
    currentEdit: {
        cliente: null,
        servico: null,
        orcamento: null
    },
    data: {
        clientes: [],
        servicos: [],
        orcamentos: []
    },
    orcamentoBuild: {
        cliente_id: null,
        itens: [],
        desconto: 0,
        subtotal: 0,
        total: 0
    }
};

// ===== UTILITÁRIOS =====
const Utils = {
    // Formatação de moeda
    formatCurrency: (value) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value || 0);
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
    },

    // Criar elemento a partir de template
    createFromTemplate: (templateId) => {
        const template = document.getElementById(templateId);
        if (!template) {
            console.error(`Template ${templateId} não encontrado`);
            return null;
        }
        return template.content.cloneNode(true);
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
        STATE.data.clientes = [
            { id: '1', nome: 'João Silva', telefone: '(24) 99999-9999', email: 'joao@email.com', carro: 'Honda Civic', placa: 'ABC-1234' },
            { id: '2', nome: 'Maria Santos', telefone: '(24) 88888-8888', email: 'maria@email.com', carro: 'Toyota Corolla', placa: 'DEF-5678' },
            { id: '3', nome: 'Pedro Oliveira', telefone: '(24) 77777-7777', email: 'pedro@email.com', carro: 'VW Gol', placa: 'GHI-9012' }
        ];
        
        STATE.data.servicos = [
            { id: '1', descricao: 'Lavagem Completa', valor: 35.00, categoria: 'Lavagem' },
            { id: '2', descricao: 'Enceramento', valor: 45.00, categoria: 'Proteção' },
            { id: '3', descricao: 'Lavagem + Enceramento', valor: 75.00, categoria: 'Combo' },
            { id: '4', descricao: 'Aspiração Completa', valor: 20.00, categoria: 'Interno' },
            { id: '5', descricao: 'Pneu Pretinho', valor: 25.00, categoria: 'Detalhamento' }
        ];
        
        STATE.data.orcamentos = [
            {
                id: '1',
                numero_orcamento: 'ORC-2024-000001',
                cliente_id: '1',
                valor_total: 100.00,
                status: 'finalizado',
                created_at: '2024-01-15T10:30:00Z'
            }
        ];
        
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
            STATE.data.clientes = [];
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
            STATE.data.servicos = [];
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
                        id,
                        descricao_servico,
                        valor_unitario,
                        quantidade,
                        valor_total
                    )
                `)
                .order('created_at', { ascending: false });
            
            if (error) throw error;
            STATE.data.orcamentos = data || [];
        } catch (error) {
            console.error('❌ Erro ao carregar orçamentos:', error);
            STATE.data.orcamentos = [];
        }
    },

    // Salvar cliente
    async saveCliente(clienteData) {
        try {
            if (STATE.db) {
                let result;
                if (STATE.currentEdit.cliente) {
                    result = await STATE.db
                        .from('clientes')
                        .update(clienteData)
                        .eq('id', STATE.currentEdit.cliente)
                        .select()
                        .single();
                } else {
                    result = await STATE.db
                        .from('clientes')
                        .insert([clienteData])
                        .select()
                        .single();
                }
                
                if (result.error) throw result.error;
                
                // Atualizar lista local
                if (STATE.currentEdit.cliente) {
                    const index = STATE.data.clientes.findIndex(c => c.id === STATE.currentEdit.cliente);
                    if (index !== -1) {
                        STATE.data.clientes[index] = result.data;
                    }
                } else {
                    STATE.data.clientes.push(result.data);
                }
                
                return result.data;
            } else {
                // Modo offline
                const newCliente = {
                    id: STATE.currentEdit.cliente || Utils.generateId(),
                    ...clienteData,
                    created_at: new Date().toISOString()
                };
                
                if (STATE.currentEdit.cliente) {
                    const index = STATE.data.clientes.findIndex(c => c.id === STATE.currentEdit.cliente);
                    if (index !== -1) {
                        STATE.data.clientes[index] = newCliente;
                    }
                } else {
                    STATE.data.clientes.push(newCliente);
                }
                
                return newCliente;
            }
        } catch (error) {
            console.error('❌ Erro ao salvar cliente:', error);
            throw error;
        }
    },

    // Salvar serviço
    async saveServico(servicoData) {
        try {
            if (STATE.db) {
                let result;
                if (STATE.currentEdit.servico) {
                    result = await STATE.db
                        .from('servicos')
                        .update(servicoData)
                        .eq('id', STATE.currentEdit.servico)
                        .select()
                        .single();
                } else {
                    result = await STATE.db
                        .from('servicos')
                        .insert([servicoData])
                        .select()
                        .single();
                }
                
                if (result.error) throw result.error;
                
                // Atualizar lista local
                if (STATE.currentEdit.servico) {
                    const index = STATE.data.servicos.findIndex(s => s.id === STATE.currentEdit.servico);
                    if (index !== -1) {
                        STATE.data.servicos[index] = result.data;
                    }
                } else {
                    STATE.data.servicos.push(result.data);
                }
                
                return result.data;
            } else {
                // Modo offline
                const newServico = {
                    id: STATE.currentEdit.servico || Utils.generateId(),
                    ...servicoData,
                    created_at: new Date().toISOString()
                };
                
                if (STATE.currentEdit.servico) {
                    const index = STATE.data.servicos.findIndex(s => s.id === STATE.currentEdit.servico);
                    if (index !== -1) {
                        STATE.data.servicos[index] = newServico;
                    }
                } else {
                    STATE.data.servicos.push(newServico);
                }
                
                return newServico;
            }
        } catch (error) {
            console.error('❌ Erro ao salvar serviço:', error);
            throw error;
        }
    },

    // Salvar orçamento
    async saveOrcamento(orcamentoData, itens) {
        try {
            if (STATE.db) {
                let result;
                if (STATE.currentEdit.orcamento) {
                    result = await STATE.db
                        .from('orcamentos')
                        .update(orcamentoData)
                        .eq('id', STATE.currentEdit.orcamento)
                        .select()
                        .single();
                } else {
                    result = await STATE.db
                        .from('orcamentos')
                        .insert([orcamentoData])
                        .select()
                        .single();
                }
                
                if (result.error) throw result.error;
                
                const orcamentoId = result.data.id;
                
                // Deletar itens antigos se editando
                if (STATE.currentEdit.orcamento) {
                    await STATE.db
                        .from('orcamento_itens')
                        .delete()
                        .eq('orcamento_id', STATE.currentEdit.orcamento);
                }
                
                // Inserir novos itens
                if (itens.length > 0) {
                    const itensData = itens.map(item => ({
                        orcamento_id: orcamentoId,
                        servico_id: item.servico_id,
                        descricao_servico: item.descricao_servico,
                        valor_unitario: item.valor_unitario,
                        quantidade: item.quantidade,
                        valor_total: item.valor_total
                    }));
                    
                    const { error: itensError } = await STATE.db
                        .from('orcamento_itens')
                        .insert(itensData);
                    
                    if (itensError) throw itensError;
                }
                
                // Atualizar lista local
                const cliente = STATE.data.clientes.find(c => c.id === orcamentoData.cliente_id);
                const novoOrcamento = {
                    ...result.data,
                    clientes: cliente,
                    orcamento_itens: itens
                };
                
                if (STATE.currentEdit.orcamento) {
                    const index = STATE.data.orcamentos.findIndex(o => o.id === STATE.currentEdit.orcamento);
                    if (index !== -1) {
                        STATE.data.orcamentos[index] = novoOrcamento;
                    }
                } else {
                    STATE.data.orcamentos.unshift(novoOrcamento);
                }
                
                return novoOrcamento;
            } else {
                // Modo offline
                const novoOrcamento = {
                    id: STATE.currentEdit.orcamento || Utils.generateId(),
                    numero_orcamento: `ORC-${new Date().getFullYear()}-${String(STATE.data.orcamentos.length + 1).padStart(6, '0')}`,
                    ...orcamentoData,
                    created_at: new Date().toISOString(),
                    clientes: STATE.data.clientes.find(c => c.id === orcamentoData.cliente_id),
                    orcamento_itens: itens
                };
                
                if (STATE.currentEdit.orcamento) {
                    const index = STATE.data.orcamentos.findIndex(o => o.id === STATE.currentEdit.orcamento);
                    if (index !== -1) {
                        STATE.data.orcamentos[index] = novoOrcamento;
                    }
                } else {
                    STATE.data.orcamentos.unshift(novoOrcamento);
                }
                
                return novoOrcamento;
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
        }
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
        console.log('🔄 Mudando para aba:', tabName);
        
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
            case 'orcamentos':
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
            .filter(o => o.status === 'finalizado')
            .reduce((sum, o) => sum + (parseFloat(o.valor_total) || 0), 0);

        // Atualizar métricas
        this.updateElement('metricTotalClients', totalClientes);
        this.updateElement('metricServices', totalServicos);
        this.updateElement('metricQuotes', totalOrcamentos);
        this.updateElement('metricRevenue', Utils.formatCurrency(faturamento));
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
                    <span class="card-badge active">Ativo</span>
                </header>
                <div class="card-body">
                    <div class="card-info">
                        <div class="card-info-item">
                            <i class="fas fa-dollar-sign"></i>
                            <span>${Utils.formatCurrency(servico.valor)}</span>
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
            const cliente = STATE.data.clientes.find(c => c.id === orcamento.cliente_id) || orcamento.clientes;
            const statusColors = {
                'orcamento': 'warning',
                'aprovado': 'info',
                'finalizado': 'success',
                'cancelado': 'danger'
            };

            return `
                <article class="card">
                    <header class="card-header">
                        <h3 class="card-title">${Utils.sanitizeHtml(cliente?.nome || 'Cliente não encontrado')}</h3>
                        <span class="card-badge ${statusColors[orcamento.status] || 'secondary'}">${orcamento.status}</span>
                    </header>
                    <div class="card-body">
                        <div class="card-info">
                            <div class="card-info-item">
                                <i class="fas fa-hashtag"></i>
                                <span>${orcamento.numero_orcamento || 'N/A'}</span>
                            </div>
                            <div class="card-info-item">
                                <i class="fas fa-calendar"></i>
                                <span>${Utils.formatDate(orcamento.created_at)}</span>
                            </div>
                            <div class="card-info-item">
                                <i class="fas fa-dollar-sign"></i>
                                <span>${Utils.formatCurrency(orcamento.valor_total)}</span>
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
            const cliente = STATE.data.clientes.find(c => c.id === orcamento.cliente_id) || orcamento.clientes;
            
            return `
                <article class="timeline-item">
                    <div class="timeline-content">
                        <header class="timeline-header">
                            <h3 class="timeline-title">${Utils.sanitizeHtml(cliente?.nome || 'Cliente não encontrado')}</h3>
                            <time class="timeline-date">${Utils.formatDateTime(orcamento.created_at)}</time>
                        </header>
                        <div class="timeline-body">
                            <p><strong>Orçamento:</strong> ${orcamento.numero_orcamento || 'N/A'}</p>
                            <p><strong>Status:</strong> ${orcamento.status}</p>
                            <p><strong>Valor:</strong> ${Utils.formatCurrency(orcamento.valor_total)}</p>
                            <p><strong>Itens:</strong> ${orcamento.orcamento_itens?.length || 0}</p>
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

// ===== GERENCIADOR DE MODAIS =====
const ModalManager = {
    // Abrir modal de cliente
    openClienteModal(clienteId = null) {
        const modal = Utils.createFromTemplate('tplModalCliente');
        if (!modal) return;

        const modalElement = modal.querySelector('.modal-overlay');
        const form = modal.querySelector('#clienteForm');
        const title = modal.querySelector('#modalClienteTitle');

        // Configurar estado
        STATE.currentEdit.cliente = clienteId;
        
        if (clienteId) {
            const cliente = STATE.data.clientes.find(c => c.id === clienteId);
            if (cliente) {
                title.textContent = 'Editar Cliente';
                modal.querySelector('#clienteNome').value = cliente.nome || '';
                modal.querySelector('#clienteTelefone').value = cliente.telefone || '';
                modal.querySelector('#clienteEmail').value = cliente.email || '';
                modal.querySelector('#clienteCarro').value = cliente.carro || '';
                modal.querySelector('#clientePlaca').value = cliente.placa || '';
            }
        } else {
            title.textContent = 'Novo Cliente';
        }

        // Configurar eventos
        form.addEventListener('submit', this.handleClienteSubmit);
        
        // Configurar máscaras
        const telefoneInput = modal.querySelector('#clienteTelefone');
        const placaInput = modal.querySelector('#clientePlaca');
        
        telefoneInput.addEventListener('input', (e) => {
            e.target.value = Utils.formatPhone(e.target.value);
        });
        
        placaInput.addEventListener('input', (e) => {
            e.target.value = Utils.formatPlate(e.target.value);
        });

        // Adicionar ao DOM e mostrar
        document.body.appendChild(modalElement);
        this.setupModalEvents(modalElement);
        modal.querySelector('#clienteNome').focus();
    },

    // Abrir modal de serviço
    openServicoModal(servicoId = null) {
        const modal = Utils.createFromTemplate('tplModalServico');
        if (!modal) return;

        const modalElement = modal.querySelector('.modal-overlay');
        const form = modal.querySelector('#servicoForm');
        const title = modal.querySelector('#modalServicoTitle');

        // Configurar estado
        STATE.currentEdit.servico = servicoId;
        
        if (servicoId) {
            const servico = STATE.data.servicos.find(s => s.id === servicoId);
            if (servico) {
                title.textContent = 'Editar Serviço';
                modal.querySelector('#servicoDescricao').value = servico.descricao || '';
                modal.querySelector('#servicoValor').value = servico.valor || '';
                modal.querySelector('#servicoCategoria').value = servico.categoria || '';
            }
        } else {
            title.textContent = 'Novo Serviço';
        }

        // Configurar eventos
        form.addEventListener('submit', this.handleServicoSubmit);

        // Adicionar ao DOM e mostrar
        document.body.appendChild(modalElement);
        this.setupModalEvents(modalElement);
        modal.querySelector('#servicoDescricao').focus();
    },

    // Abrir modal de orçamento
    openOrcamentoModal(orcamentoId = null) {
        const modal = Utils.createFromTemplate('tplModalOrcamento');
        if (!modal) return;

        const modalElement = modal.querySelector('.modal-overlay');
        const form = modal.querySelector('#orcamentoForm');
        const title = modal.querySelector('#modalOrcTitle');

        // Configurar estado
        STATE.currentEdit.orcamento = orcamentoId;
        STATE.orcamentoBuild = {
            cliente_id: null,
            itens: [],
            desconto: 0,
            subtotal: 0,
            total: 0
        };
        
        if (orcamentoId) {
            const orcamento = STATE.data.orcamentos.find(o => o.id === orcamentoId);
            if (orcamento) {
                title.textContent = 'Editar Orçamento';
                modal.querySelector('#orcClienteSelect').value = orcamento.cliente_id;
                modal.querySelector('#orcDesconto').value = orcamento.percentual_desconto || 0;
                
                STATE.orcamentoBuild.cliente_id = orcamento.cliente_id;
                STATE.orcamentoBuild.desconto = orcamento.percentual_desconto || 0;
                STATE.orcamentoBuild.itens = (orcamento.orcamento_itens || []).map(item => ({
                    servico_id: item.servico_id,
                    descricao_servico: item.descricao_servico,
                    valor_unitario: item.valor_unitario,
                    quantidade: item.quantidade,
                    valor_total: item.valor_total
                }));
            }
        } else {
            title.textContent = 'Novo Orçamento';
        }

        // Popular selects
        this.populateOrcamentoSelects(modal);

        // Configurar eventos
        form.addEventListener('submit', this.handleOrcamentoSubmit);
        
        const addBtn = modal.querySelector('#orcAddService');
        addBtn.addEventListener('click', () => this.addServicoToOrcamento(modal));
        
        const descontoInput = modal.querySelector('#orcDesconto');
        descontoInput.addEventListener('input', () => this.calculateOrcamentoTotal(modal));

        // Renderizar itens existentes
        this.renderOrcamentoItens(modal);
        this.calculateOrcamentoTotal(modal);

        // Adicionar ao DOM e mostrar
        document.body.appendChild(modalElement);
        this.setupModalEvents(modalElement);
    },

    // Popular selects do orçamento
    populateOrcamentoSelects(modal) {
        const clienteSelect = modal.querySelector('#orcClienteSelect');
        const servicoSelect = modal.querySelector('#orcServicoSelect');

        // Popular clientes
        clienteSelect.innerHTML = '<option value="">Selecione um cliente</option>';
        STATE.data.clientes.forEach(cliente => {
            const option = document.createElement('option');
            option.value = cliente.id;
            option.textContent = `${cliente.nome} - ${cliente.carro || 'Sem veículo'}`;
            clienteSelect.appendChild(option);
        });

        // Popular serviços
        servicoSelect.innerHTML = '<option value="">Selecione um serviço</option>';
        STATE.data.servicos.forEach(servico => {
            const option = document.createElement('option');
            option.value = servico.id;
            option.textContent = `${servico.descricao} - ${Utils.formatCurrency(servico.valor)}`;
            servicoSelect.appendChild(option);
        });
    },

    // Adicionar serviço ao orçamento
    addServicoToOrcamento(modal) {
        const servicoSelect = modal.querySelector('#orcServicoSelect');
        const quantidadeInput = modal.querySelector('#orcQuantidade');
        
        const servicoId = servicoSelect.value;
        const quantidade = parseInt(quantidadeInput.value) || 1;
        
        if (!servicoId) {
            UIManager.showNotification('Selecione um serviço', 'warning');
            return;
        }
        
        const servico = STATE.data.servicos.find(s => s.id === servicoId);
        if (!servico) return;
        
        // Verificar se já existe
        const existingIndex = STATE.orcamentoBuild.itens.findIndex(item => item.servico_id === servicoId);
        
        if (existingIndex !== -1) {
            STATE.orcamentoBuild.itens[existingIndex].quantidade += quantidade;
            STATE.orcamentoBuild.itens[existingIndex].valor_total = 
                STATE.orcamentoBuild.itens[existingIndex].quantidade * STATE.orcamentoBuild.itens[existingIndex].valor_unitario;
        } else {
            STATE.orcamentoBuild.itens.push({
                servico_id: servicoId,
                descricao_servico: servico.descricao,
                valor_unitario: servico.valor,
                quantidade: quantidade,
                valor_total: servico.valor * quantidade
            });
        }
        
        // Limpar campos
        servicoSelect.value = '';
        quantidadeInput.value = '1';
        
        // Atualizar interface
        this.renderOrcamentoItens(modal);
        this.calculateOrcamentoTotal(modal);
        
        UIManager.showNotification('Serviço adicionado!', 'success');
    },

    // Renderizar itens do orçamento
    renderOrcamentoItens(modal) {
        const container = modal.querySelector('#orcItens');
        
        if (STATE.orcamentoBuild.itens.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: var(--text-muted); padding: 2rem;">Nenhum serviço adicionado</p>';
            return;
        }
        
        container.innerHTML = STATE.orcamentoBuild.itens.map((item, index) => `
            <div class="orc-item">
                <div class="orc-item-info">
                    <h4>${item.descricao_servico}</h4>
                    <p>${Utils.formatCurrency(item.valor_unitario)} x ${item.quantidade} = ${Utils.formatCurrency(item.valor_total)}</p>
                </div>
                <div class="orc-item-actions">
                    <div class="orc-qty-controls">
                        <button type="button" onclick="ModalManager.changeQuantity(${index}, -1)">-</button>
                        <span>${item.quantidade}</span>
                        <button type="button" onclick="ModalManager.changeQuantity(${index}, 1)">+</button>
                    </div>
                    <button type="button" class="btn btn-danger btn-sm" onclick="ModalManager.removeItem(${index})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    },

    // Alterar quantidade
    changeQuantity(index, change) {
        const item = STATE.orcamentoBuild.itens[index];
        if (!item) return;
        
        const newQuantity = item.quantidade + change;
        
        if (newQuantity > 0) {
            item.quantidade = newQuantity;
            item.valor_total = item.valor_unitario * item.quantidade;
            
            const modal = document.querySelector('.modal-overlay');
            this.renderOrcamentoItens(modal);
            this.calculateOrcamentoTotal(modal);
        }
    },

    // Remover item
    removeItem(index) {
        STATE.orcamentoBuild.itens.splice(index, 1);
        
        const modal = document.querySelector('.modal-overlay');
        this.renderOrcamentoItens(modal);
        this.calculateOrcamentoTotal(modal);
        
        UIManager.showNotification('Serviço removido!', 'info');
    },

    // Calcular total do orçamento
    calculateOrcamentoTotal(modal) {
        const subtotal = STATE.orcamentoBuild.itens.reduce((sum, item) => sum + item.valor_total, 0);
        const desconto = parseFloat(modal.querySelector('#orcDesconto').value) || 0;
        const valorDesconto = subtotal * (desconto / 100);
        const total = subtotal - valorDesconto;
        
        STATE.orcamentoBuild.subtotal = subtotal;
        STATE.orcamentoBuild.desconto = desconto;
        STATE.orcamentoBuild.total = total;
        
        modal.querySelector('#orcSubtotal').textContent = Utils.formatCurrency(subtotal);
        modal.querySelector('#orcTotal').textContent = Utils.formatCurrency(total);
    },

    // Configurar eventos do modal
    setupModalEvents(modalElement) {
        // Fechar modal
        const closeButtons = modalElement.querySelectorAll('.js-close-modal');
        closeButtons.forEach(btn => {
            btn.addEventListener('click', () => this.closeModal(modalElement));
        });

        // Fechar ao clicar fora
        modalElement.addEventListener('click', (e) => {
            if (e.target === modalElement) {
                this.closeModal(modalElement);
            }
        });

        // Fechar com ESC
        const handleEsc = (e) => {
            if (e.key === 'Escape') {
                this.closeModal(modalElement);
                document.removeEventListener('keydown', handleEsc);
            }
        };
        document.addEventListener('keydown', handleEsc);
    },

    // Fechar modal
    closeModal(modalElement) {
        modalElement.remove();
        
        // Limpar estado
        STATE.currentEdit = {
            cliente: null,
            servico: null,
            orcamento: null
        };
        
        STATE.orcamentoBuild = {
            cliente_id: null,
            itens: [],
            desconto: 0,
            subtotal: 0,
            total: 0
        };
    },

    // Handler para submit de cliente
    async handleClienteSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const clienteData = {
            nome: formData.get('clienteNome') || e.target.querySelector('#clienteNome').value,
            telefone: e.target.querySelector('#clienteTelefone').value,
            email: e.target.querySelector('#clienteEmail').value,
            carro: e.target.querySelector('#clienteCarro').value,
            placa: e.target.querySelector('#clientePlaca').value
        };
        
        if (!clienteData.nome.trim()) {
            UIManager.showNotification('Nome é obrigatório', 'error');
            return;
        }
        
        try {
            UIManager.showLoading('Salvando cliente...');
            
            await DataManager.saveCliente(clienteData);
            
            UIManager.hideLoading();
            UIManager.showNotification(
                STATE.currentEdit.cliente ? 'Cliente atualizado!' : 'Cliente salvo!',
                'success'
            );
            
            UIManager.renderClientes();
            UIManager.renderDashboard();
            
            const modal = e.target.closest('.modal-overlay');
            ModalManager.closeModal(modal);
            
        } catch (error) {
            UIManager.hideLoading();
            UIManager.showNotification('Erro ao salvar cliente', 'error');
        }
    },

    // Handler para submit de serviço
    async handleServicoSubmit(e) {
        e.preventDefault();
        
        const servicoData = {
            descricao: e.target.querySelector('#servicoDescricao').value.trim(),
            valor: parseFloat(e.target.querySelector('#servicoValor').value),
            categoria: e.target.querySelector('#servicoCategoria').value.trim()
        };
        
        if (!servicoData.descricao || !servicoData.valor) {
            UIManager.showNotification('Descrição e valor são obrigatórios', 'error');
            return;
        }
        
        try {
            UIManager.showLoading('Salvando serviço...');
            
            await DataManager.saveServico(servicoData);
            
            UIManager.hideLoading();
            UIManager.showNotification(
                STATE.currentEdit.servico ? 'Serviço atualizado!' : 'Serviço salvo!',
                'success'
            );
            
            UIManager.renderServicos();
            UIManager.renderDashboard();
            
            const modal = e.target.closest('.modal-overlay');
            ModalManager.closeModal(modal);
            
        } catch (error) {
            UIManager.hideLoading();
            UIManager.showNotification('Erro ao salvar serviço', 'error');
        }
    },

    // Handler para submit de orçamento
    async handleOrcamentoSubmit(e) {
        e.preventDefault();
        
        const clienteId = e.target.querySelector('#orcClienteSelect').value;
        
        if (!clienteId) {
            UIManager.showNotification('Selecione um cliente', 'error');
            return;
        }
        
        if (STATE.orcamentoBuild.itens.length === 0) {
            UIManager.showNotification('Adicione pelo menos um serviço', 'error');
            return;
        }
        
        const orcamentoData = {
            cliente_id: clienteId,
            valor_subtotal: STATE.orcamentoBuild.subtotal,
            percentual_desconto: STATE.orcamentoBuild.desconto,
            valor_total: STATE.orcamentoBuild.total,
            status: 'orcamento'
        };
        
        try {
            UIManager.showLoading('Salvando orçamento...');
            
            await DataManager.saveOrcamento(orcamentoData, STATE.orcamentoBuild.itens);
            
            UIManager.hideLoading();
            UIManager.showNotification(
                STATE.currentEdit.orcamento ? 'Orçamento atualizado!' : 'Orçamento salvo!',
                'success'
            );
            
            UIManager.renderOrcamentos();
            UIManager.renderHistorico();
            UIManager.renderDashboard();
            
            const modal = e.target.closest('.modal-overlay');
            ModalManager.closeModal(modal);
            
        } catch (error) {
            UIManager.hideLoading();
            UIManager.showNotification('Erro ao salvar orçamento', 'error');
        }
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
        document.getElementById('btnAddClient')?.addEventListener('click', () => ModalManager.openClienteModal());
        document.getElementById('btnAddService')?.addEventListener('click', () => ModalManager.openServicoModal());
        document.getElementById('btnNewQuote')?.addEventListener('click', () => ModalManager.openOrcamentoModal());
        document.getElementById('quickClientBtn')?.addEventListener('click', () => ModalManager.openClienteModal());
        document.getElementById('quickQuoteBtn')?.addEventListener('click', () => ModalManager.openOrcamentoModal());
        document.getElementById('quickAddBtn')?.addEventListener('click', () => this.showQuickMenu());

        // Pesquisa
        const searchInput = document.getElementById('searchClientes');
        if (searchInput) {
            searchInput.addEventListener('input', Utils.debounce((e) => {
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
                syncStatus.innerHTML = '<i class="fas fa-wifi"></i> Online';
                syncStatus.className = 'sync-status';
            } else {
                syncStatus.innerHTML = '<i class="fas fa-wifi-slash"></i> Offline';
                syncStatus.className = 'sync-status offline';
            }
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
            container.innerHTML = UIManager.getEmptyState('Nenhum cliente encontrado', `Nenhum resultado para "${searchTerm}"`);
            return;
        }

        // Renderizar clientes filtrados
        const originalClientes = STATE.data.clientes;
        STATE.data.clientes = filteredClientes;
        UIManager.renderClientes();
        STATE.data.clientes = originalClientes;
    },

    // Mostrar menu rápido
    showQuickMenu() {
        const actions = [
            { text: 'Novo Cliente', icon: 'fas fa-user-plus', action: () => ModalManager.openClienteModal() },
            { text: 'Novo Serviço', icon: 'fas fa-plus', action: () => ModalManager.openServicoModal() },
            { text: 'Novo Orçamento', icon: 'fas fa-file-invoice', action: () => ModalManager.openOrcamentoModal() }
        ];

        // Criar menu dinâmico
        const menu = document.createElement('div');
        menu.className = 'modal-overlay';
        menu.innerHTML = `
            <div class="modal" style="max-width: 300px;">
                <header class="modal-header">
                    <h2>Ações Rápidas</h2>
                    <button class="btn btn-ghost btn-sm js-close-modal"><i class="fas fa-times"></i></button>
                </header>
                <div class="modal-body">
                    ${actions.map(action => `
                        <button class="btn btn-ghost" style="width: 100%; margin-bottom: 0.5rem; justify-content: flex-start;" data-action="${action.text}">
                            <i class="${action.icon}"></i> ${action.text}
                        </button>
                    `).join('')}
                </div>
            </div>
        `;

        // Configurar eventos
        menu.addEventListener('click', (e) => {
            const actionBtn = e.target.closest('[data-action]');
            if (actionBtn) {
                const action = actions.find(a => a.text === actionBtn.dataset.action);
                if (action) {
                    action.action();
                    menu.remove();
                }
            }
            
            if (e.target.classList.contains('modal-overlay') || e.target.closest('.js-close-modal')) {
                menu.remove();
            }
        });

        document.body.appendChild(menu);
    },

    // Editar cliente
    editClient(clienteId) {
        ModalManager.openClienteModal(clienteId);
    },

    // Editar serviço
    editService(servicoId) {
        ModalManager.openServicoModal(servicoId);
    },

    // Editar orçamento
    editOrcamento(orcamentoId) {
        ModalManager.openOrcamentoModal(orcamentoId);
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
                UIManager.renderDashboard();
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
                UIManager.renderDashboard();
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
        const orcamento = STATE.data.orcamentos.find(o => o.id === orcamentoId);
        if (!orcamento) return;
        
        UIManager.showNotification(`Visualizando orçamento ${orcamento.numero_orcamento}`, 'info');
        // Aqui você pode implementar um modal de visualização detalhada
    },

    // Download PDF
    downloadPDF(orcamentoId) {
        const orcamento = STATE.data.orcamentos.find(o => o.id === orcamentoId);
        if (!orcamento) return;
        
        UIManager.showNotification('Funcionalidade PDF em desenvolvimento', 'info');
        // Aqui você pode implementar a geração de PDF
    }
};

// ===== INICIALIZAÇÃO =====
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Iniciando R.M. CRM Pro+ v' + CONFIG.app.version);
    App.init();
});

// ===== TORNAR GLOBALMENTE ACESSÍVEL =====
window.App = App;
window.UIManager = UIManager;
window.DataManager = DataManager;
window.ModalManager = ModalManager;
window.Utils = Utils;
window.STATE = STATE;

console.log('📝 R.M. CRM Pro+ Script carregado - Versão 2.0.0');
