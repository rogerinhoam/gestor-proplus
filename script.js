// ===== CONFIGURAÇÃO E VARIÁVEIS GLOBAIS =====
const supabaseUrl = 'https://bezbszbkaifcanqsmdbi.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJlemJzemJrYWlmY2FucXNtZGJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI2MTM5MTksImV4cCI6MjA2ODE4OTkxOX0.zLXAuQz7g5ym3Bd5pkhg5vsnf_3rdJFRAXI_kX8tM18';

// Variáveis globais
let db = null;
let currentTab = 'dashboard';
let clientes = [];
let servicos = [];
let orcamentos = [];
let servicosOrcamento = [];
let currentClienteId = null;
let currentServicoId = null;
let currentOrcamento = null;

// ===== INICIALIZAÇÃO PRINCIPAL =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Inicializando R.M. CRM Pro+...');
    
    // Configurar loading
    updateLoadingProgress(20);
    
    // Inicializar sistema
    setTimeout(() => {
        initializeSystem();
    }, 500);
});

// ===== INICIALIZAÇÃO DO SISTEMA =====
async function initializeSystem() {
    try {
        console.log('📋 Configurando sistema...');
        updateLoadingProgress(40);
        
        // Configurar Supabase
        await setupSupabase();
        updateLoadingProgress(60);
        
        // Configurar interface
        setupInterface();
        updateLoadingProgress(80);
        
        // Carregar dados
        await loadData();
        updateLoadingProgress(100);
        
        // Finalizar
        setTimeout(() => {
            hideLoadingScreen();
            showNotification('Sistema carregado com sucesso!', 'success');
        }, 500);
        
    } catch (error) {
        console.error('❌ Erro na inicialização:', error);
        handleError(error);
    }
}

// ===== CONFIGURAÇÃO SUPABASE =====
async function setupSupabase() {
    try {
        if (window.supabase) {
            const { createClient } = supabase;
            db = createClient(supabaseUrl, supabaseAnonKey);
            
            // Testar conexão
            const { data, error } = await db.from('clientes').select('id').limit(1);
            if (error && error.code !== 'PGRST116') {
                throw error;
            }
            
            console.log('✅ Supabase conectado');
        } else {
            console.log('⚠️ Supabase não disponível - modo offline');
        }
    } catch (error) {
        console.log('⚠️ Erro no Supabase, usando modo offline:', error);
        db = null;
    }
}

// ===== CONFIGURAÇÃO DA INTERFACE =====
function setupInterface() {
    console.log('🎨 Configurando interface...');
    
    // Configurar navegação
    setupNavigation();
    
    // Configurar formulários
    setupForms();
    
    // Configurar botões
    setupButtons();
    
    // Configurar pesquisa
    setupSearch();
    
    // Configurar filtros
    setupFilters();
    
    // Configurar máscaras
    setupMasks();
    
    // Configurar payment options
    setupPaymentOptions();
    
    console.log('✅ Interface configurada');
}

// ===== CONFIGURAÇÃO DE NAVEGAÇÃO =====
function setupNavigation() {
    // Navegação desktop
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.addEventListener('click', function(e) {
            e.preventDefault();
            const tabName = this.dataset.tab;
            switchTab(tabName);
        });
    });
    
    // Navegação mobile
    document.querySelectorAll('.mobile-nav-item').forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const tabName = this.dataset.tab;
            switchTab(tabName);
        });
    });
}

// ===== CONFIGURAÇÃO DE FORMULÁRIOS =====
function setupForms() {
    // Formulário de cliente
    const clienteForm = document.getElementById('clienteFormElement');
    if (clienteForm) {
        clienteForm.addEventListener('submit', handleClienteSubmit);
    }
    
    // Formulário de serviço
    const servicoForm = document.getElementById('servicoFormElement');
    if (servicoForm) {
        servicoForm.addEventListener('submit', handleServicoSubmit);
    }
    
    // Formulário de orçamento
    const orcamentoForm = document.getElementById('orcamentoForm');
    if (orcamentoForm) {
        orcamentoForm.addEventListener('submit', handleOrcamentoSubmit);
    }
    
    // Desconto input
    const descontoInput = document.getElementById('orcamentoDesconto');
    if (descontoInput) {
        descontoInput.addEventListener('input', calculateTotal);
    }
}

// ===== CONFIGURAÇÃO DE BOTÕES =====
function setupButtons() {
    // Botões principais
    const buttons = [
        { id: 'quickClientBtn', handler: () => { switchTab('clientes'); toggleClienteForm(); } },
        { id: 'quickOrcamentoBtn', handler: () => switchTab('orcamento') },
        { id: 'newClientBtn', handler: toggleClienteForm },
        { id: 'cancelClientBtn', handler: cancelClienteForm },
        { id: 'newServiceBtn', handler: toggleServicoForm },
        { id: 'cancelServiceBtn', handler: cancelServicoForm },
        { id: 'addServiceBtn', handler: adicionarServico },
        { id: 'clearOrcamentoBtn', handler: limparOrcamento },
        { id: 'closeDetailsBtn', handler: closeClienteDetails },
        { id: 'applyFiltersBtn', handler: applyFilters },
        { id: 'modalCancelBtn', handler: closeModal },
        { id: 'modalConfirmBtn', handler: () => {} }
    ];
    
    buttons.forEach(({ id, handler }) => {
        const button = document.getElementById(id);
        if (button) {
            button.addEventListener('click', handler);
        }
    });
}

// ===== CONFIGURAÇÃO DE PESQUISA =====
function setupSearch() {
    const searchInput = document.getElementById('searchClientes');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(filterClientes, 300));
    }
}

// ===== CONFIGURAÇÃO DE FILTROS =====
function setupFilters() {
    const filterStatus = document.getElementById('filterStatus');
    if (filterStatus) {
        filterStatus.addEventListener('change', filterHistorico);
    }
}

// ===== CONFIGURAÇÃO DE MÁSCARAS =====
function setupMasks() {
    const telefoneInput = document.getElementById('clienteTelefone');
    if (telefoneInput) {
        telefoneInput.addEventListener('input', formatTelefone);
    }
    
    const placaInput = document.getElementById('clientePlaca');
    if (placaInput) {
        placaInput.addEventListener('input', formatPlaca);
    }
}

// ===== CONFIGURAÇÃO DE PAYMENT OPTIONS =====
function setupPaymentOptions() {
    document.querySelectorAll('.payment-option input').forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            this.parentElement.classList.toggle('selected', this.checked);
        });
    });
}

// ===== CARREGAMENTO DE DADOS =====
async function loadData() {
    console.log('📊 Carregando dados...');
    
    try {
        if (db) {
            // Carregar dados do Supabase
            await Promise.all([
                loadClientes(),
                loadServicos(),
                loadOrcamentos()
            ]);
        } else {
            // Carregar dados de exemplo
            loadSampleData();
        }
        
        // Atualizar interface
        updateInterface();
        
    } catch (error) {
        console.error('❌ Erro ao carregar dados:', error);
        loadSampleData();
        updateInterface();
    }
}

// ===== CARREGAR DADOS DO SUPABASE =====
async function loadClientes() {
    try {
        const { data, error } = await db.from('clientes').select('*').order('nome');
        if (error) throw error;
        clientes = data || [];
    } catch (error) {
        console.error('Erro ao carregar clientes:', error);
        clientes = [];
    }
}

async function loadServicos() {
    try {
        const { data, error } = await db.from('servicos').select('*').order('descricao');
        if (error) throw error;
        servicos = data || [];
    } catch (error) {
        console.error('Erro ao carregar serviços:', error);
        servicos = [];
    }
}

async function loadOrcamentos() {
    try {
        const { data, error } = await db
            .from('orcamentos')
            .select(`
                *,
                clientes (nome, carro, placa),
                orcamento_itens (
                    id,
                    descricao_servico,
                    valor_cobrado,
                    quantidade
                )
            `)
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        orcamentos = data || [];
    } catch (error) {
        console.error('Erro ao carregar orçamentos:', error);
        orcamentos = [];
    }
}

// ===== DADOS DE EXEMPLO =====
function loadSampleData() {
    console.log('📋 Carregando dados de exemplo...');
    
    clientes = [
        { id: '1', nome: 'João Silva', telefone: '(24) 99999-9999', carro: 'Honda Civic', placa: 'ABC-1234' },
        { id: '2', nome: 'Maria Santos', telefone: '(24) 88888-8888', carro: 'Toyota Corolla', placa: 'DEF-5678' },
        { id: '3', nome: 'Pedro Oliveira', telefone: '(24) 77777-7777', carro: 'VW Gol', placa: 'GHI-9012' }
    ];
    
    servicos = [
        { id: '1', descricao: 'Lavagem Completa', valor: 35.00 },
        { id: '2', descricao: 'Enceramento', valor: 40.00 },
        { id: '3', descricao: 'Lavagem + Cera', valor: 60.00 },
        { id: '4', descricao: 'Aspiração', valor: 15.00 },
        { id: '5', descricao: 'Pneu Pretinho', valor: 20.00 }
    ];
    
    orcamentos = [
        {
            id: '1',
            cliente_id: '1',
            valor_total: 75.00,
            status: 'Finalizado',
            created_at: new Date().toISOString(),
            clientes: { nome: 'João Silva', carro: 'Honda Civic' },
            orcamento_itens: [
                { descricao_servico: 'Lavagem Completa', valor_cobrado: 35.00, quantidade: 1 },
                { descricao_servico: 'Enceramento', valor_cobrado: 40.00, quantidade: 1 }
            ]
        }
    ];
}

// ===== ATUALIZAR INTERFACE =====
function updateInterface() {
    console.log('🔄 Atualizando interface...');
    
    // Atualizar métricas
    updateMetrics();
    
    // Atualizar grids
    renderClientes();
    renderServicos();
    renderHistorico();
    
    // Atualizar selects
    populateSelects();
    
    // Atualizar atividades
    updateRecentActivity();
}

// ===== ATUALIZAR MÉTRICAS =====
function updateMetrics() {
    const totalClientesEl = document.getElementById('totalClientes');
    const totalServicosEl = document.getElementById('totalServicos');
    const totalOrcamentosEl = document.getElementById('totalOrcamentos');
    const faturamentoTotalEl = document.getElementById('faturamentoTotal');
    
    if (totalClientesEl) totalClientesEl.textContent = clientes.length;
    if (totalServicosEl) totalServicosEl.textContent = servicos.length;
    if (totalOrcamentosEl) totalOrcamentosEl.textContent = orcamentos.length;
    
    if (faturamentoTotalEl) {
        const faturamento = orcamentos
            .filter(o => o.status === 'Finalizado')
            .reduce((sum, o) => sum + parseFloat(o.valor_total), 0);
        faturamentoTotalEl.textContent = formatCurrency(faturamento);
    }
}

// ===== ATUALIZAR ATIVIDADES RECENTES =====
function updateRecentActivity() {
    const activityList = document.getElementById('activityList');
    if (!activityList) return;
    
    const recentOrcamentos = orcamentos.slice(0, 5);
    
    if (recentOrcamentos.length === 0) {
        activityList.innerHTML = `
            <div class="activity-item">
                <div class="activity-icon">
                    <i class="fas fa-info-circle"></i>
                </div>
                <div class="activity-content">
                    <h4>Nenhuma atividade recente</h4>
                    <p>Crie seu primeiro orçamento</p>
                </div>
            </div>
        `;
        return;
    }
    
    activityList.innerHTML = recentOrcamentos.map(orcamento => `
        <div class="activity-item">
            <div class="activity-icon">
                <i class="fas fa-file-invoice"></i>
            </div>
            <div class="activity-content">
                <h4>${orcamento.clientes?.nome || 'Cliente'}</h4>
                <p>Orçamento ${orcamento.status} - ${formatCurrency(orcamento.valor_total)}</p>
                <small>${formatDate(orcamento.created_at)}</small>
            </div>
        </div>
    `).join('');
}

// ===== NAVEGAÇÃO ENTRE ABAS =====
function switchTab(tabName) {
    console.log('🔄 Mudando para aba:', tabName);
    
    // Remover active de todos os elementos
    document.querySelectorAll('.nav-tab, .mobile-nav-item').forEach(el => {
        el.classList.remove('active');
    });
    
    document.querySelectorAll('.tab-content').forEach(el => {
        el.classList.remove('active');
    });
    
    // Ativar tab selecionada
    const activeTab = document.querySelector(`[data-tab="${tabName}"]`);
    if (activeTab) {
        activeTab.classList.add('active');
    }
    
    const activeContent = document.getElementById(tabName);
    if (activeContent) {
        activeContent.classList.add('active');
    }
    
    currentTab = tabName;
    
    // Atualizar conteúdo específico
    switch (tabName) {
        case 'dashboard':
            updateMetrics();
            updateRecentActivity();
            break;
        case 'clientes':
            renderClientes();
            break;
        case 'servicos':
            renderServicos();
            break;
        case 'orcamento':
            populateSelects();
            break;
        case 'historico':
            renderHistorico();
            break;
    }
}

// ===== RENDERIZAR CLIENTES =====
function renderClientes() {
    const container = document.getElementById('clientesGrid');
    if (!container) return;
    
    if (clientes.length === 0) {
        container.innerHTML = `
            <div class="cliente-card">
                <div class="cliente-card-header">
                    <div class="cliente-name">Nenhum cliente encontrado</div>
                    <div class="cliente-status">-</div>
                </div>
                <div class="cliente-info">
                    <div class="cliente-info-item">
                        <i class="fas fa-info-circle"></i>
                        <span>Adicione seu primeiro cliente</span>
                    </div>
                </div>
            </div>
        `;
        return;
    }
    
    container.innerHTML = clientes.map(cliente => `
        <div class="cliente-card" data-cliente-id="${cliente.id}">
            <div class="cliente-card-header">
                <div class="cliente-name">${cliente.nome}</div>
                <div class="cliente-status active">Ativo</div>
            </div>
            <div class="cliente-info">
                <div class="cliente-info-item">
                    <i class="fas fa-phone"></i>
                    <span>${cliente.telefone || 'Sem telefone'}</span>
                </div>
                <div class="cliente-info-item">
                    <i class="fas fa-car"></i>
                    <span>${cliente.carro || 'Sem veículo'}</span>
                </div>
                <div class="cliente-info-item">
                    <i class="fas fa-id-card"></i>
                    <span>${cliente.placa || 'Sem placa'}</span>
                </div>
            </div>
            <div class="cliente-card-actions">
                <button class="btn btn-primary" onclick="quickCall('${cliente.telefone}')">
                    <i class="fas fa-phone"></i>
                    Ligar
                </button>
                <button class="btn btn-success" onclick="quickWhatsApp('${cliente.telefone}', '${cliente.nome}')">
                    <i class="fab fa-whatsapp"></i>
                    WhatsApp
                </button>
                <button class="btn btn-secondary" onclick="editCliente('${cliente.id}')">
                    <i class="fas fa-edit"></i>
                    Editar
                </button>
                <button class="btn btn-danger" onclick="deleteCliente('${cliente.id}')">
                    <i class="fas fa-trash"></i>
                    Excluir
                </button>
            </div>
        </div>
    `).join('');
}

// ===== RENDERIZAR SERVIÇOS =====
function renderServicos() {
    const tbody = document.getElementById('servicosTableBody');
    if (!tbody) return;
    
    if (servicos.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td>Nenhum serviço encontrado</td>
                <td>R$ 0,00</td>
                <td>Adicione seu primeiro serviço</td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = servicos.map(servico => `
        <tr>
            <td>${servico.descricao}</td>
            <td>${formatCurrency(servico.valor)}</td>
            <td>
                <div class="table-actions">
                    <button class="btn btn-small btn-secondary" onclick="editServico('${servico.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-small btn-danger" onclick="deleteServico('${servico.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// ===== RENDERIZAR HISTÓRICO =====
function renderHistorico() {
    const container = document.getElementById('historicoList');
    if (!container) return;
    
    if (orcamentos.length === 0) {
        container.innerHTML = `
            <div class="historico-item">
                <h4>Nenhum orçamento encontrado</h4>
                <p>Crie seu primeiro orçamento para ver o histórico</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = orcamentos.map(orcamento => `
        <div class="historico-item" onclick="showOrcamentoDetails('${orcamento.id}')">
            <h4>${orcamento.clientes?.nome || 'Cliente não encontrado'}</h4>
            <p><strong>Veículo:</strong> ${orcamento.clientes?.carro || '-'}</p>
            <p><strong>Data:</strong> ${formatDate(orcamento.created_at)}</p>
            <p><strong>Status:</strong> <span class="status-badge ${orcamento.status.toLowerCase()}">${orcamento.status}</span></p>
            <p class="valor">${formatCurrency(orcamento.valor_total)}</p>
        </div>
    `).join('');
}

// ===== POPULAR SELECTS =====
function populateSelects() {
    // Select de clientes
    const clienteSelect = document.getElementById('orcamentoCliente');
    if (clienteSelect) {
        clienteSelect.innerHTML = '<option value="">Selecione um cliente</option>';
        
        clientes.forEach(cliente => {
            const option = document.createElement('option');
            option.value = cliente.id;
            option.textContent = `${cliente.nome} - ${cliente.carro || 'Sem veículo'}`;
            clienteSelect.appendChild(option);
        });
    }
    
    // Select de serviços
    const servicoSelect = document.getElementById('servicoSelect');
    if (servicoSelect) {
        servicoSelect.innerHTML = '<option value="">Selecione um serviço</option>';
        
        servicos.forEach(servico => {
            const option = document.createElement('option');
            option.value = servico.id;
            option.textContent = `${servico.descricao} - ${formatCurrency(servico.valor)}`;
            servicoSelect.appendChild(option);
        });
    }
}

// ===== FUNÇÕES DE FORMULÁRIO =====
function toggleClienteForm() {
    const form = document.getElementById('clienteForm');
    if (form) {
        form.classList.toggle('active');
        
        if (form.classList.contains('active')) {
            const nomeInput = document.getElementById('clienteNome');
            if (nomeInput) nomeInput.focus();
        }
    }
}

function cancelClienteForm() {
    const form = document.getElementById('clienteForm');
    if (form) {
        form.classList.remove('active');
        document.getElementById('clienteFormElement').reset();
        currentClienteId = null;
    }
}

function toggleServicoForm() {
    const form = document.getElementById('servicoForm');
    if (form) {
        form.classList.toggle('active');
        
        if (form.classList.contains('active')) {
            const descInput = document.getElementById('servicoDescricao');
            if (descInput) descInput.focus();
        }
    }
}

function cancelServicoForm() {
    const form = document.getElementById('servicoForm');
    if (form) {
        form.classList.remove('active');
        document.getElementById('servicoFormElement').reset();
        currentServicoId = null;
    }
}

// ===== HANDLERS DE FORMULÁRIO =====
async function handleClienteSubmit(e) {
    e.preventDefault();
    
    const nome = document.getElementById('clienteNome').value.trim();
    const telefone = document.getElementById('clienteTelefone').value.trim();
    const carro = document.getElementById('clienteCarro').value.trim();
    const placa = document.getElementById('clientePlaca').value.trim();
    
    if (!nome) {
        showNotification('Nome é obrigatório', 'error');
        return;
    }
    
    const clienteData = { nome, telefone, carro, placa };
    
    try {
        if (db) {
            // Salvar no Supabase
            let result;
            if (currentClienteId) {
                result = await db
                    .from('clientes')
                    .update(clienteData)
                    .eq('id', currentClienteId)
                    .select();
            } else {
                result = await db
                    .from('clientes')
                    .insert([clienteData])
                    .select();
            }
            
            if (result.error) throw result.error;
            
            // Atualizar lista local
            if (currentClienteId) {
                const index = clientes.findIndex(c => c.id === currentClienteId);
                if (index !== -1) {
                    clientes[index] = { ...clientes[index], ...clienteData };
                }
            } else {
                clientes.push(result.data[0]);
            }
        } else {
            // Modo offline
            if (currentClienteId) {
                const index = clientes.findIndex(c => c.id === currentClienteId);
                if (index !== -1) {
                    clientes[index] = { ...clientes[index], ...clienteData };
                }
            } else {
                clientes.push({
                    id: Date.now().toString(),
                    ...clienteData
                });
            }
        }
        
        showNotification(
            currentClienteId ? 'Cliente atualizado!' : 'Cliente salvo!',
            'success'
        );
        
        cancelClienteForm();
        renderClientes();
        populateSelects();
        updateMetrics();
        
    } catch (error) {
        console.error('Erro ao salvar cliente:', error);
        showNotification('Erro ao salvar cliente', 'error');
    }
}

async function handleServicoSubmit(e) {
    e.preventDefault();
    
    const descricao = document.getElementById('servicoDescricao').value.trim();
    const valor = parseFloat(document.getElementById('servicoValor').value);
    
    if (!descricao) {
        showNotification('Descrição é obrigatória', 'error');
        return;
    }
    
    if (!valor || valor <= 0) {
        showNotification('Valor deve ser maior que zero', 'error');
        return;
    }
    
    const servicoData = { descricao, valor };
    
    try {
        if (db) {
            // Salvar no Supabase
            let result;
            if (currentServicoId) {
                result = await db
                    .from('servicos')
                    .update(servicoData)
                    .eq('id', currentServicoId)
                    .select();
            } else {
                result = await db
                    .from('servicos')
                    .insert([servicoData])
                    .select();
            }
            
            if (result.error) throw result.error;
            
            // Atualizar lista local
            if (currentServicoId) {
                const index = servicos.findIndex(s => s.id === currentServicoId);
                if (index !== -1) {
                    servicos[index] = { ...servicos[index], ...servicoData };
                }
            } else {
                servicos.push(result.data[0]);
            }
        } else {
            // Modo offline
            if (currentServicoId) {
                const index = servicos.findIndex(s => s.id === currentServicoId);
                if (index !== -1) {
                    servicos[index] = { ...servicos[index], ...servicoData };
                }
            } else {
                servicos.push({
                    id: Date.now().toString(),
                    ...servicoData
                });
            }
        }
        
        showNotification(
            currentServicoId ? 'Serviço atualizado!' : 'Serviço salvo!',
            'success'
        );
        
        cancelServicoForm();
        renderServicos();
        populateSelects();
        updateMetrics();
        
    } catch (error) {
        console.error('Erro ao salvar serviço:', error);
        showNotification('Erro ao salvar serviço', 'error');
    }
}

async function handleOrcamentoSubmit(e) {
    e.preventDefault();
    
    const clienteId = document.getElementById('orcamentoCliente').value;
    const desconto = parseFloat(document.getElementById('orcamentoDesconto').value) || 0;
    
    if (!clienteId) {
        showNotification('Selecione um cliente', 'error');
        return;
    }
    
    if (servicosOrcamento.length === 0) {
        showNotification('Adicione pelo menos um serviço', 'error');
        return;
    }
    
    const subtotal = servicosOrcamento.reduce((sum, item) => {
        return sum + (item.valor_cobrado * item.quantidade);
    }, 0);
    
    const valorDesconto = subtotal * (desconto / 100);
    const valorTotal = subtotal - valorDesconto;
    
    const formasPagamento = Array.from(document.querySelectorAll('.payment-option input:checked'))
        .map(input => input.value);
    
    const orcamentoData = {
        cliente_id: clienteId,
        valor_total: valorTotal,
        desconto: desconto,
        status: 'Orçamento',
        formas_pagamento: formasPagamento.join(', '),
        created_at: new Date().toISOString()
    };
    
    try {
        if (db) {
            // Salvar no Supabase
            const result = await db
                .from('orcamentos')
                .insert([orcamentoData])
                .select();
            
            if (result.error) throw result.error;
            
            const orcamentoId = result.data[0].id;
            
            // Inserir itens do orçamento
            const itensData = servicosOrcamento.map(item => ({
                orcamento_id: orcamentoId,
                servico_id: item.servico_id,
                descricao_servico: item.descricao_servico,
                valor_cobrado: item.valor_cobrado,
                quantidade: item.quantidade
            }));
            
            const itensResult = await db
                .from('orcamento_itens')
                .insert(itensData);
            
            if (itensResult.error) throw itensResult.error;
            
            // Atualizar lista local
            const cliente = clientes.find(c => c.id === clienteId);
            orcamentos.unshift({
                ...result.data[0],
                clientes: cliente,
                orcamento_itens: servicosOrcamento
            });
        } else {
            // Modo offline
            const cliente = clientes.find(c => c.id === clienteId);
            const novoOrcamento = {
                id: Date.now().toString(),
                ...orcamentoData,
                clientes: cliente,
                orcamento_itens: servicosOrcamento
            };
            
            orcamentos.unshift(novoOrcamento);
        }
        
        showNotification('Orçamento salvo com sucesso!', 'success');
        
        limparOrcamento();
        renderHistorico();
        updateMetrics();
        updateRecentActivity();
        
    } catch (error) {
        console.error('Erro ao salvar orçamento:', error);
        showNotification('Erro ao salvar orçamento', 'error');
    }
}

// ===== FUNÇÕES DE ORÇAMENTO =====
function adicionarServico() {
    const servicoId = document.getElementById('servicoSelect').value;
    const quantidade = parseInt(document.getElementById('servicoQuantidade').value) || 1;
    
    if (!servicoId) {
        showNotification('Selecione um serviço', 'error');
        return;
    }
    
    const servico = servicos.find(s => s.id === servicoId);
    if (!servico) return;
    
    // Verificar se já existe
    const existingIndex = servicosOrcamento.findIndex(s => s.servico_id === servicoId);
    
    if (existingIndex !== -1) {
        servicosOrcamento[existingIndex].quantidade += quantidade;
    } else {
        servicosOrcamento.push({
            servico_id: servicoId,
            descricao_servico: servico.descricao,
            valor_cobrado: servico.valor,
            quantidade: quantidade
        });
    }
    
    renderServicosOrcamento();
    calculateTotal();
    
    // Limpar campos
    document.getElementById('servicoSelect').value = '';
    document.getElementById('servicoQuantidade').value = '1';
    
    showNotification('Serviço adicionado!', 'success');
}

function renderServicosOrcamento() {
    const container = document.getElementById('servicosList');
    if (!container) return;
    
    if (servicosOrcamento.length === 0) {
        container.innerHTML = '<p>Nenhum serviço adicionado</p>';
        return;
    }
    
    container.innerHTML = servicosOrcamento.map((item, index) => `
        <div class="servico-item">
            <div class="servico-item-info">
                <h5>${item.descricao_servico}</h5>
                <p>${formatCurrency(item.valor_cobrado)} x ${item.quantidade} = ${formatCurrency(item.valor_cobrado * item.quantidade)}</p>
            </div>
            <div class="servico-item-actions">
                <div class="quantity-controls">
                    <button type="button" onclick="changeQuantity(${index}, -1)">-</button>
                    <span>${item.quantidade}</span>
                    <button type="button" onclick="changeQuantity(${index}, 1)">+</button>
                </div>
                <button type="button" class="btn btn-small btn-danger" onclick="removeServicoOrcamento(${index})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
}

function changeQuantity(index, change) {
    const newQuantity = servicosOrcamento[index].quantidade + change;
    
    if (newQuantity > 0) {
        servicosOrcamento[index].quantidade = newQuantity;
        renderServicosOrcamento();
        calculateTotal();
    }
}

function removeServicoOrcamento(index) {
    servicosOrcamento.splice(index, 1);
    renderServicosOrcamento();
    calculateTotal();
    showNotification('Serviço removido!', 'info');
}

function calculateTotal() {
    const subtotal = servicosOrcamento.reduce((sum, item) => {
        return sum + (item.valor_cobrado * item.quantidade);
    }, 0);
    
    const desconto = parseFloat(document.getElementById('orcamentoDesconto').value) || 0;
    const valorDesconto = subtotal * (desconto / 100);
    const total = subtotal - valorDesconto;
    
    const totalElement = document.getElementById('valorTotal');
    if (totalElement) {
        totalElement.textContent = formatCurrency(total);
    }
}

function limparOrcamento() {
    document.getElementById('orcamentoForm').reset();
    servicosOrcamento = [];
    renderServicosOrcamento();
    calculateTotal();
    
    // Limpar payment options
    document.querySelectorAll('.payment-option').forEach(option => {
        option.classList.remove('selected');
        option.querySelector('input').checked = false;
    });
    
    showNotification('Orçamento limpo!', 'info');
}

// ===== FUNÇÕES DE EDIÇÃO =====
function editCliente(id) {
    const cliente = clientes.find(c => c.id === id);
    if (!cliente) return;
    
    currentClienteId = id;
    
    document.getElementById('clienteNome').value = cliente.nome || '';
    document.getElementById('clienteTelefone').value = cliente.telefone || '';
    document.getElementById('clienteCarro').value = cliente.carro || '';
    document.getElementById('clientePlaca').value = cliente.placa || '';
    
    toggleClienteForm();
}

function editServico(id) {
    const servico = servicos.find(s => s.id === id);
    if (!servico) return;
    
    currentServicoId = id;
    
    document.getElementById('servicoDescricao').value = servico.descricao || '';
    document.getElementById('servicoValor').value = servico.valor || '';
    
    toggleServicoForm();
}

// ===== FUNÇÕES DE EXCLUSÃO =====
function deleteCliente(id) {
    const cliente = clientes.find(c => c.id === id);
    if (!cliente) return;
    
    showConfirm(
        'Excluir Cliente',
        `Tem certeza que deseja excluir ${cliente.nome}?`,
        async () => {
            try {
                if (db) {
                    const { error } = await db.from('clientes').delete().eq('id', id);
                    if (error) throw error;
                }
                
                // Remover da lista local
                const index = clientes.findIndex(c => c.id === id);
                if (index !== -1) {
                    clientes.splice(index, 1);
                }
                
                showNotification('Cliente excluído!', 'success');
                renderClientes();
                populateSelects();
                updateMetrics();
                
            } catch (error) {
                console.error('Erro ao excluir cliente:', error);
                showNotification('Erro ao excluir cliente', 'error');
            }
        }
    );
}

function deleteServico(id) {
    const servico = servicos.find(s => s.id === id);
    if (!servico) return;
    
    showConfirm(
        'Excluir Serviço',
        `Tem certeza que deseja excluir ${servico.descricao}?`,
        async () => {
            try {
                if (db) {
                    const { error } = await db.from('servicos').delete().eq('id', id);
                    if (error) throw error;
                }
                
                // Remover da lista local
                const index = servicos.findIndex(s => s.id === id);
                if (index !== -1) {
                    servicos.splice(index, 1);
                }
                
                showNotification('Serviço excluído!', 'success');
                renderServicos();
                populateSelects();
                updateMetrics();
                
            } catch (error) {
                console.error('Erro ao excluir serviço:', error);
                showNotification('Erro ao excluir serviço', 'error');
            }
        }
    );
}

// ===== FUNÇÕES DE FILTRO =====
function filterClientes() {
    const searchTerm = document.getElementById('searchClientes').value.toLowerCase();
    
    const filteredClientes = clientes.filter(cliente => 
        cliente.nome.toLowerCase().includes(searchTerm) ||
        (cliente.telefone && cliente.telefone.toLowerCase().includes(searchTerm)) ||
        (cliente.carro && cliente.carro.toLowerCase().includes(searchTerm)) ||
        (cliente.placa && cliente.placa.toLowerCase().includes(searchTerm))
    );
    
    const container = document.getElementById('clientesGrid');
    if (!container) return;
    
    if (filteredClientes.length === 0) {
        container.innerHTML = `
            <div class="cliente-card">
                <div class="cliente-card-header">
                    <div class="cliente-name">Nenhum cliente encontrado</div>
                    <div class="cliente-status">-</div>
                </div>
                <div class="cliente-info">
                    <div class="cliente-info-item">
                        <i class="fas fa-search"></i>
                        <span>Nenhum resultado para "${searchTerm}"</span>
                    </div>
                </div>
            </div>
        `;
        return;
    }
    
    container.innerHTML = filteredClientes.map(cliente => `
        <div class="cliente-card">
            <div class="cliente-card-header">
                <div class="cliente-name">${cliente.nome}</div>
                <div class="cliente-status active">Ativo</div>
            </div>
            <div class="cliente-info">
                <div class="cliente-info-item">
                    <i class="fas fa-phone"></i>
                    <span>${cliente.telefone || 'Sem telefone'}</span>
                </div>
                <div class="cliente-info-item">
                    <i class="fas fa-car"></i>
                    <span>${cliente.carro || 'Sem veículo'}</span>
                </div>
                <div class="cliente-info-item">
                    <i class="fas fa-id-card"></i>
                    <span>${cliente.placa || 'Sem placa'}</span>
                </div>
            </div>
            <div class="cliente-card-actions">
                <button class="btn btn-primary" onclick="quickCall('${cliente.telefone}')">
                    <i class="fas fa-phone"></i>
                    Ligar
                </button>
                <button class="btn btn-success" onclick="quickWhatsApp('${cliente.telefone}', '${cliente.nome}')">
                    <i class="fab fa-whatsapp"></i>
                    WhatsApp
                </button>
                <button class="btn btn-secondary" onclick="editCliente('${cliente.id}')">
                    <i class="fas fa-edit"></i>
                    Editar
                </button>
                <button class="btn btn-danger" onclick="deleteCliente('${cliente.id}')">
                    <i class="fas fa-trash"></i>
                    Excluir
                </button>
            </div>
        </div>
    `).join('');
}

function filterHistorico() {
    const status = document.getElementById('filterStatus').value;
    
    let filteredOrcamentos = [...orcamentos];
    
    if (status) {
        filteredOrcamentos = filteredOrcamentos.filter(o => o.status === status);
    }
    
    const container = document.getElementById('historicoList');
    if (!container) return;
    
    if (filteredOrcamentos.length === 0) {
        container.innerHTML = `
            <div class="historico-item">
                <h4>Nenhum orçamento encontrado</h4>
                <p>Nenhum resultado para os filtros aplicados</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = filteredOrcamentos.map(orcamento => `
        <div class="historico-item">
            <h4>${orcamento.clientes?.nome || 'Cliente não encontrado'}</h4>
            <p><strong>Veículo:</strong> ${orcamento.clientes?.carro || '-'}</p>
            <p><strong>Data:</strong> ${formatDate(orcamento.created_at)}</p>
            <p><strong>Status:</strong> <span class="status-badge ${orcamento.status.toLowerCase()}">${orcamento.status}</span></p>
            <p class="valor">${formatCurrency(orcamento.valor_total)}</p>
        </div>
    `).join('');
}

function applyFilters() {
    filterHistorico();
    showNotification('Filtros aplicados!', 'info');
}

// ===== FUNÇÕES DE DETALHES =====
function showClienteDetails(clienteId) {
    const cliente = clientes.find(c => c.id === clienteId);
    if (!cliente) return;
    
    document.getElementById('clienteDetailsNome').textContent = cliente.nome;
    document.getElementById('clienteDetailsTelefone').textContent = cliente.telefone || '-';
    document.getElementById('clienteDetailsCarro').textContent = cliente.carro || '-';
    document.getElementById('clienteDetailsPlaca').textContent = cliente.placa || '-';
    
    document.getElementById('clienteDetails').classList.add('active');
}

function closeClienteDetails() {
    document.getElementById('clienteDetails').classList.remove('active');
}

function showOrcamentoDetails(orcamentoId) {
    const orcamento = orcamentos.find(o => o.id === orcamentoId);
    if (!orcamento) return;
    
    console.log('Mostrar detalhes do orçamento:', orcamento);
    // Implementar modal de detalhes se necessário
}

// ===== FUNÇÕES DE FORMATAÇÃO =====
function formatTelefone(e) {
    let value = e.target.value.replace(/\D/g, '');
    value = value.replace(/^(\d{2})(\d)/g, '($1) $2');
    value = value.replace(/(\d)(\d{4})$/, '$1-$2');
    e.target.value = value;
}

function formatPlaca(e) {
    let value = e.target.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    value = value.replace(/^([A-Z]{3})(\d)/, '$1-$2');
    e.target.value = value;
}

function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value);
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('pt-BR');
}

// ===== FUNÇÕES DE UTILIDADE =====
function showNotification(message, type = 'info') {
    const notification = document.getElementById('notification');
    if (!notification) return;
    
    const icon = notification.querySelector('.notification-icon');
    const messageEl = notification.querySelector('.notification-message');
    
    const icons = {
        success: 'fas fa-check-circle',
        error: 'fas fa-exclamation-circle',
        warning: 'fas fa-exclamation-triangle',
        info: 'fas fa-info-circle'
    };
    
    if (icon) icon.className = `notification-icon ${icons[type]}`;
    if (messageEl) messageEl.textContent = message;
    
    notification.className = `notification ${type}`;
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 4000);
}

function showConfirm(title, message, onConfirm) {
    const modal = document.getElementById('modalOverlay');
    const modalTitle = document.getElementById('modalTitle');
    const modalMessage = document.getElementById('modalMessage');
    const confirmBtn = document.getElementById('modalConfirmBtn');
    
    if (modalTitle) modalTitle.textContent = title;
    if (modalMessage) modalMessage.textContent = message;
    
    if (confirmBtn) {
        confirmBtn.onclick = () => {
            onConfirm();
            closeModal();
        };
    }
    
    if (modal) modal.classList.add('active');
}

function closeModal() {
    const modal = document.getElementById('modalOverlay');
    if (modal) modal.classList.remove('active');
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// ===== FUNÇÕES DE AÇÃO RÁPIDA =====
function quickCall(phone) {
    if (phone && phone !== 'Sem telefone') {
        window.location.href = `tel:${phone}`;
    } else {
        showNotification('Telefone não disponível', 'warning');
    }
}

function quickWhatsApp(phone, name) {
    if (phone && phone !== 'Sem telefone') {
        const cleanPhone = phone.replace(/\D/g, '');
        const message = `Olá ${name}, como posso ajudar você hoje?`;
        const url = `https://wa.me/55${cleanPhone}?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
    } else {
        showNotification('Telefone não disponível', 'warning');
    }
}

// ===== FUNÇÕES DE LOADING =====
function updateLoadingProgress(percentage) {
    const progress = document.getElementById('loadingProgress');
    if (progress) {
        progress.style.width = percentage + '%';
    }
}

function hideLoadingScreen() {
    const loading = document.getElementById('loadingScreen');
    if (loading) {
        loading.classList.add('hidden');
        setTimeout(() => {
            loading.style.display = 'none';
        }, 500);
    }
}

// ===== TRATAMENTO DE ERROS =====
function handleError(error) {
    console.error('❌ Erro do sistema:', error);
    
    updateLoadingProgress(100);
    
    setTimeout(() => {
        hideLoadingScreen();
        showNotification('Sistema iniciado em modo básico', 'warning');
        
        // Carregar dados de exemplo
        loadSampleData();
        updateInterface();
    }, 1000);
}

// ===== TORNAR FUNÇÕES GLOBAIS =====
window.switchTab = switchTab;
window.toggleClienteForm = toggleClienteForm;
window.cancelClienteForm = cancelClienteForm;
window.toggleServicoForm = toggleServicoForm;
window.cancelServicoForm = cancelServicoForm;
window.adicionarServico = adicionarServico;
window.changeQuantity = changeQuantity;
window.removeServicoOrcamento = removeServicoOrcamento;
window.limparOrcamento = limparOrcamento;
window.editCliente = editCliente;
window.editServico = editServico;
window.deleteCliente = deleteCliente;
window.deleteServico = deleteServico;
window.showClienteDetails = showClienteDetails;
window.closeClienteDetails = closeClienteDetails;
window.showOrcamentoDetails = showOrcamentoDetails;
window.quickCall = quickCall;
window.quickWhatsApp = quickWhatsApp;
window.showNotification = showNotification;
window.showConfirm = showConfirm;
window.closeModal = closeModal;
window.applyFilters = applyFilters;

// ===== LOG DE INICIALIZAÇÃO =====
console.log('📝 R.M. CRM Pro+ Script carregado - Versão 2.0.0');
console.log('🚀 Sistema inicializando...');
