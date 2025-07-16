// Configuração do Supabase
const supabaseUrl = 'https://bezbszbkaifcanqsmdbi.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJlemJzemJrYWlmY2FucXNtZGJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI2MTM5MTksImV4cCI6MjA2ODE4OTkxOX0.zLXAuQz7g5ym3Bd5pkhg5vsnf_3rdJFRAXI_kX8tM18';

// Variáveis globais
let db = null;
let currentTab = 'dashboard';
let clientes = [];
let servicos = [];
let orcamentos = [];
let currentOrcamento = null;
let currentClienteId = null;
let currentServicoId = null;
let servicosOrcamento = [];
let servicesChart = null;
let isSystemInitialized = false;

// Inicialização principal
document.addEventListener('DOMContentLoaded', function() {
    updateLoadingMessage('Inicializando sistema...');
    updateLoadingProgress(10);
    
    // Aguardar um pouco antes de começar
    setTimeout(() => {
        initializeSystem();
    }, 500);
});

// Inicialização do sistema
async function initializeSystem() {
    try {
        updateLoadingMessage('Verificando dependências...');
        updateLoadingProgress(20);
        
        // Verificar se as dependências foram carregadas
        await waitForDependencies();
        
        updateLoadingMessage('Configurando Supabase...');
        updateLoadingProgress(30);
        
        // Inicializar Supabase
        await initializeSupabase();
        
        updateLoadingMessage('Configurando interface...');
        updateLoadingProgress(50);
        
        // Configurar interface
        setupInterface();
        
        updateLoadingMessage('Carregando dados...');
        updateLoadingProgress(70);
        
        // Carregar dados
        await loadInitialData();
        
        updateLoadingMessage('Finalizando...');
        updateLoadingProgress(90);
        
        // Finalizar
        finalizeInitialization();
        
    } catch (error) {
        console.error('Erro na inicialização:', error);
        handleInitializationError(error);
    }
}

// Aguardar dependências
async function waitForDependencies() {
    return new Promise((resolve) => {
        let attempts = 0;
        const maxAttempts = 30; // 15 segundos
        
        const checkDependencies = () => {
            attempts++;
            
            if (window.supabase && window.Chart) {
                console.log('Dependências carregadas com sucesso');
                resolve();
            } else if (attempts >= maxAttempts) {
                console.warn('Algumas dependências não carregaram, continuando...');
                resolve();
            } else {
                setTimeout(checkDependencies, 500);
            }
        };
        
        checkDependencies();
    });
}

// Inicializar Supabase
async function initializeSupabase() {
    try {
        if (!window.supabase) {
            throw new Error('Supabase não carregado');
        }
        
        const { createClient } = supabase;
        db = createClient(supabaseUrl, supabaseAnonKey);
        
        // Testar conexão
        const { data, error } = await db.from('system_settings').select('*').limit(1);
        if (error && error.code !== 'PGRST116') { // PGRST116 = tabela não existe
            throw error;
        }
        
        console.log('Supabase inicializado com sucesso');
        
    } catch (error) {
        console.error('Erro ao inicializar Supabase:', error);
        // Continuar sem Supabase - modo offline
        showNotification('Modo offline - algumas funcionalidades limitadas', 'warning');
    }
}

// Configurar interface
function setupInterface() {
    try {
        // Event listeners para navegação
        setupNavigation();
        
        // Event listeners para formulários
        setupForms();
        
        // Event listeners para pesquisa
        setupSearch();
        
        // Event listeners para filtros
        setupFilters();
        
        // Máscaras de input
        setupInputMasks();
        
        // Atalhos de teclado corrigidos
        setupKeyboardShortcuts();
        
        console.log('Interface configurada com sucesso');
        
    } catch (error) {
        console.error('Erro ao configurar interface:', error);
        showNotification('Erro na configuração da interface', 'warning');
    }
}

// Configurar navegação
function setupNavigation() {
    // Navegação desktop
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.addEventListener('click', function() {
            const tabName = this.dataset.tab;
            switchTab(tabName);
        });
    });
    
    // Navegação mobile
    document.querySelectorAll('.mobile-nav-item').forEach(item => {
        item.addEventListener('click', function() {
            const tab = this.dataset.tab;
            
            // Remover classe active de todos
            document.querySelectorAll('.mobile-nav-item').forEach(navItem => {
                navItem.classList.remove('active');
            });
            
            // Adicionar classe active ao clicado
            this.classList.add('active');
            
            // Mudar aba
            switchTab(tab);
        });
    });
}

// Configurar formulários
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
    
    // Event listener para desconto
    const descontoInput = document.getElementById('orcamentoDesconto');
    if (descontoInput) {
        descontoInput.addEventListener('input', calculateTotal);
    }
    
    // Event listeners para formas de pagamento
    document.querySelectorAll('.payment-option input').forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            this.parentElement.classList.toggle('selected', this.checked);
        });
    });
}

// Configurar pesquisa
function setupSearch() {
    const searchClientes = document.getElementById('searchClientes');
    if (searchClientes) {
        searchClientes.addEventListener('input', debounce(filterClientes, 300));
    }
}

// Configurar filtros
function setupFilters() {
    const filterStatus = document.getElementById('filterStatus');
    if (filterStatus) {
        filterStatus.addEventListener('change', filterHistorico);
    }
    
    const filterDataInicio = document.getElementById('filterDataInicio');
    if (filterDataInicio) {
        filterDataInicio.addEventListener('change', filterHistorico);
    }
    
    const filterDataFim = document.getElementById('filterDataFim');
    if (filterDataFim) {
        filterDataFim.addEventListener('change', filterHistorico);
    }
}

// Configurar máscaras de input
function setupInputMasks() {
    const telefoneInput = document.getElementById('clienteTelefone');
    if (telefoneInput) {
        telefoneInput.addEventListener('input', formatTelefone);
    }
    
    const placaInput = document.getElementById('clientePlaca');
    if (placaInput) {
        placaInput.addEventListener('input', formatPlaca);
    }
}

// Configurar atalhos de teclado (corrigido)
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', function(e) {
        // Verificar se o usuário está digitando em um campo
        const isInputActive = document.activeElement.tagName === 'INPUT' || 
                             document.activeElement.tagName === 'TEXTAREA' || 
                             document.activeElement.tagName === 'SELECT' ||
                             document.activeElement.isContentEditable;
        
        // Se estiver em um campo, não processar atalhos de navegação
        if (isInputActive) {
            return;
        }
        
        // Atalhos apenas quando não estiver em campos
        if (e.key >= '1' && e.key <= '5' && !e.ctrlKey && !e.altKey) {
            const tabs = ['dashboard', 'clientes', 'servicos', 'orcamento', 'historico'];
            const tabIndex = parseInt(e.key) - 1;
            if (tabs[tabIndex]) {
                switchTab(tabs[tabIndex]);
            }
        }
    });
}

// Carregar dados iniciais
async function loadInitialData() {
    if (!db) {
        console.warn('Banco de dados não disponível, carregando dados de exemplo');
        loadSampleData();
        return;
    }
    
    try {
        updateLoadingDetails('Carregando clientes...');
        await loadClientes();
        
        updateLoadingDetails('Carregando serviços...');
        await loadServicos();
        
        updateLoadingDetails('Carregando orçamentos...');
        await loadOrcamentos();
        
        updateLoadingDetails('Configurando interface...');
        populateSelects();
        updateDashboard();
        
    } catch (error) {
        console.error('Erro ao carregar dados:', error);
        showNotification('Erro ao carregar dados do servidor', 'error');
        loadSampleData();
    }
}

// Carregar dados de exemplo (fallback)
function loadSampleData() {
    clientes = [
        { id: '1', nome: 'João Silva', telefone: '(24) 99999-9999', carro: 'Honda Civic', placa: 'ABC-1234' },
        { id: '2', nome: 'Maria Santos', telefone: '(24) 88888-8888', carro: 'Toyota Corolla', placa: 'DEF-5678' }
    ];
    
    servicos = [
        { id: '1', descricao: 'Lavagem Completa', valor: 35.00 },
        { id: '2', descricao: 'Enceramento', valor: 40.00 },
        { id: '3', descricao: 'Lavagem + Cera', valor: 60.00 }
    ];
    
    orcamentos = [];
    
    populateSelects();
    updateDashboard();
    renderClientes();
    renderServicos();
    renderHistorico();
}

// Finalizar inicialização
function finalizeInitialization() {
    updateLoadingProgress(100);
    
    setTimeout(() => {
        hideLoadingScreen();
        isSystemInitialized = true;
        showNotification('Sistema carregado com sucesso!', 'success');
    }, 500);
}

// Lidar com erro de inicialização
function handleInitializationError(error) {
    console.error('Erro crítico na inicialização:', error);
    
    updateLoadingMessage('Erro na inicialização - tentando modo básico...');
    updateLoadingProgress(100);
    
    setTimeout(() => {
        hideLoadingScreen();
        showNotification('Sistema iniciado em modo limitado', 'warning');
        
        // Carregar dados de exemplo
        loadSampleData();
        setupInterface();
    }, 1000);
}

// Funções de loading
function updateLoadingMessage(message) {
    const loadingMessage = document.getElementById('loadingMessage');
    if (loadingMessage) {
        loadingMessage.textContent = message;
    }
}

function updateLoadingDetails(details) {
    const loadingDetails = document.getElementById('loadingDetails');
    if (loadingDetails) {
        loadingDetails.textContent = details;
    }
}

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

// Função para sistema básico (emergência)
function initializeBasicSystem() {
    console.log('Inicializando sistema básico...');
    
    setupInterface();
    loadSampleData();
    
    showNotification('Sistema básico inicializado', 'info');
}

// Navegação entre abas
function switchTab(tabName) {
    // Atualizar navegação desktop
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    const desktopTab = document.querySelector(`.nav-tab[data-tab="${tabName}"]`);
    if (desktopTab) {
        desktopTab.classList.add('active');
    }
    
    // Atualizar navegação mobile
    document.querySelectorAll('.mobile-nav-item').forEach(item => {
        item.classList.remove('active');
    });
    const mobileTab = document.querySelector(`.mobile-nav-item[data-tab="${tabName}"]`);
    if (mobileTab) {
        mobileTab.classList.add('active');
    }
    
    // Atualizar conteúdo
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    const tabContent = document.getElementById(tabName);
    if (tabContent) {
        tabContent.classList.add('active');
    }
    
    currentTab = tabName;
    
    // Carregar dados específicos da aba
    switch (tabName) {
        case 'dashboard':
            updateDashboard();
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

// Funções de formatação
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

function formatDate(date) {
    return new Date(date).toLocaleDateString('pt-BR');
}

function formatDateTime(date) {
    return new Date(date).toLocaleString('pt-BR');
}

// Funções de carregamento de dados
async function loadClientes() {
    if (!db) return;
    
    try {
        const { data, error } = await db
            .from('clientes')
            .select('*')
            .order('nome');
        
        if (error) throw error;
        
        clientes = data || [];
        renderClientes();
    } catch (error) {
        console.error('Erro ao carregar clientes:', error);
        throw error;
    }
}

async function loadServicos() {
    if (!db) return;
    
    try {
        const { data, error } = await db
            .from('servicos')
            .select('*')
            .order('descricao');
        
        if (error) throw error;
        
        servicos = data || [];
        renderServicos();
    } catch (error) {
        console.error('Erro ao carregar serviços:', error);
        throw error;
    }
}

async function loadOrcamentos() {
    if (!db) return;
    
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
        renderHistorico();
    } catch (error) {
        console.error('Erro ao carregar orçamentos:', error);
        throw error;
    }
}

// Renderização de clientes
function renderClientes() {
    const container = document.getElementById('clientesGrid');
    if (!container) return;
    
    if (clientes.length === 0) {
        container.innerHTML = `
            <div class="cliente-card">
                <div class="cliente-card-header">
                    <div class="cliente-name">Nenhum cliente encontrado</div>
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
        <div class="cliente-card" onclick="showClienteDetails('${cliente.id}')">
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
                <button class="btn btn-primary" onclick="event.stopPropagation(); quickCall('${cliente.telefone}')">
                    <i class="fas fa-phone"></i>
                    Ligar
                </button>
                <button class="btn btn-success" onclick="event.stopPropagation(); quickWhatsApp('${cliente.telefone}', '${cliente.nome}')">
                    <i class="fab fa-whatsapp"></i>
                    WhatsApp
                </button>
                <button class="btn btn-secondary" onclick="event.stopPropagation(); editCliente('${cliente.id}')">
                    <i class="fas fa-edit"></i>
                    Editar
                </button>
            </div>
        </div>
    `).join('');
}

// Renderização de serviços
function renderServicos() {
    const tbody = document.getElementById('servicosTableBody');
    if (!tbody) return;
    
    if (servicos.length === 0) {
        tbody.innerHTML = '<tr><td colspan="3" class="text-center">Nenhum serviço encontrado</td></tr>';
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

// Renderização do histórico
function renderHistorico() {
    const container = document.getElementById('historicoList');
    if (!container) return;
    
    if (orcamentos.length === 0) {
        container.innerHTML = '<p class="text-center">Nenhum orçamento encontrado</p>';
        return;
    }
    
    container.innerHTML = orcamentos.map(orcamento => `
        <div class="historico-item" onclick="showHistoricoDetails('${orcamento.id}')">
            <h4>${orcamento.clientes?.nome || 'Cliente não encontrado'}</h4>
            <p><strong>Veículo:</strong> ${orcamento.clientes?.carro || '-'}</p>
            <p><strong>Data:</strong> ${formatDate(orcamento.created_at)}</p>
            <p><strong>Status:</strong> <span class="activity-status ${orcamento.status.toLowerCase()}">${orcamento.status}</span></p>
            <p class="valor">${formatCurrency(orcamento.valor_total)}</p>
        </div>
    `).join('');
}

// Funções do dashboard
function updateDashboard() {
    updateStats();
    updateCharts();
    updateFollowUps();
}

function updateStats() {
    const totalClientes = clientes.length;
    const totalPendentes = orcamentos.filter(o => o.status === 'Orçamento').length;
    const totalAprovados = orcamentos.filter(o => o.status === 'Aprovado').length;
    
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const finalizadosMes = orcamentos.filter(o => {
        const date = new Date(o.created_at);
        return o.status === 'Finalizado' && 
               date.getMonth() === currentMonth && 
               date.getFullYear() === currentYear;
    }).length;
    
    const faturamentoTotal = orcamentos
        .filter(o => o.status === 'Finalizado')
        .reduce((sum, o) => sum + parseFloat(o.valor_total), 0);
    
    // Atualizar elementos se existirem
    const elements = {
        conversionRate: document.getElementById('conversionRate'),
        pipelineValue: document.getElementById('pipelineValue'),
        avgTicket: document.getElementById('avgTicket'),
        responseTime: document.getElementById('responseTime')
    };
    
    if (elements.conversionRate) {
        const conversionRate = totalClientes > 0 ? (finalizadosMes / totalClientes * 100).toFixed(1) : 0;
        elements.conversionRate.textContent = `${conversionRate}%`;
    }
    
    if (elements.pipelineValue) {
        elements.pipelineValue.textContent = formatCurrency(faturamentoTotal);
    }
    
    if (elements.avgTicket) {
        const avgTicket = finalizadosMes > 0 ? faturamentoTotal / finalizadosMes : 0;
        elements.avgTicket.textContent = formatCurrency(avgTicket);
    }
}

function updateCharts() {
    updateSalesFunnelChart();
    updateRevenueChart();
}

function updateSalesFunnelChart() {
    const ctx = document.getElementById('salesFunnelChart');
    if (!ctx || !window.Chart) return;
    
    const data = {
        labels: ['Leads', 'Contato', 'Orçamento', 'Aprovado', 'Finalizado'],
        datasets: [{
            label: 'Funil de Vendas',
            data: [
                clientes.length,
                Math.floor(clientes.length * 0.8),
                orcamentos.filter(o => o.status === 'Orçamento').length,
                orcamentos.filter(o => o.status === 'Aprovado').length,
                orcamentos.filter(o => o.status === 'Finalizado').length
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
        data: data,
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

function updateRevenueChart() {
    const ctx = document.getElementById('revenueChart');
    if (!ctx || !window.Chart) return;
    
    // Dados dos últimos 6 meses
    const months = [];
    const revenues = [];
    
    for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        
        months.push(date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }));
        
        const monthRevenue = orcamentos
            .filter(o => {
                const oDate = new Date(o.created_at);
                return o.status === 'Finalizado' && 
                       oDate.getMonth() === date.getMonth() && 
                       oDate.getFullYear() === date.getFullYear();
            })
            .reduce((sum, o) => sum + parseFloat(o.valor_total), 0);
        
        revenues.push(monthRevenue);
    }
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: months,
            datasets: [{
                label: 'Receita Mensal',
                data: revenues,
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

function updateFollowUps() {
    const container = document.getElementById('followupList');
    if (!container) return;
    
    // Simular follow-ups baseados em orçamentos antigos
    const followUps = orcamentos
        .filter(o => o.status === 'Orçamento')
        .map(o => {
            const daysSince = Math.floor((new Date() - new Date(o.created_at)) / (1000 * 60 * 60 * 24));
            return {
                cliente: o.clientes?.nome || 'Cliente',
                dias: daysSince,
                urgente: daysSince > 7
            };
        })
        .slice(0, 5);
    
    if (followUps.length === 0) {
        container.innerHTML = '<p class="text-center">Nenhum follow-up pendente 🎉</p>';
        return;
    }
    
    container.innerHTML = followUps.map(followup => `
        <div class="followup-item ${followup.urgente ? 'urgent' : ''}">
            <div class="followup-icon">
                <i class="fas fa-${followup.urgente ? 'exclamation' : 'clock'}"></i>
            </div>
            <div class="followup-content">
                <h4>${followup.cliente}</h4>
                <p>${followup.dias} dias sem contato</p>
            </div>
            <div class="followup-actions">
                <button class="btn btn-small btn-primary">
                    <i class="fas fa-phone"></i>
                </button>
                <button class="btn btn-small btn-success">
                    <i class="fab fa-whatsapp"></i>
                </button>
            </div>
        </div>
    `).join('');
}

// Funções de formulário
function toggleClienteForm() {
    const form = document.getElementById('clienteForm');
    if (form) {
        form.classList.toggle('active');
        
        if (form.classList.contains('active')) {
            document.getElementById('clienteNome').focus();
        }
    }
}

function cancelarClienteForm() {
    const form = document.getElementById('clienteForm');
    if (form) {
        form.classList.remove('active');
        document.getElementById('clienteFormElement').reset();
        currentClienteId = null;
    }
}

async function handleClienteSubmit(e) {
    e.preventDefault();
    
    const formData = {
        nome: document.getElementById('clienteNome').value.trim(),
        telefone: document.getElementById('clienteTelefone').value.trim(),
        carro: document.getElementById('clienteCarro').value.trim(),
        placa: document.getElementById('clientePlaca').value.trim(),
        segmento: document.getElementById('clienteSegmento').value,
        origem: document.getElementById('clienteOrigem').value
    };
    
    try {
        showLoading();
        
        if (db) {
            let result;
            if (currentClienteId) {
                result = await db
                    .from('clientes')
                    .update(formData)
                    .eq('id', currentClienteId)
                    .select();
            } else {
                result = await db
                    .from('clientes')
                    .insert([formData])
                    .select();
            }
            
            if (result.error) throw result.error;
        } else {
            // Modo offline
            if (currentClienteId) {
                const index = clientes.findIndex(c => c.id === currentClienteId);
                if (index !== -1) {
                    clientes[index] = { ...clientes[index], ...formData };
                }
            } else {
                clientes.push({ id: Date.now().toString(), ...formData });
            }
        }
        
        showNotification(
            currentClienteId ? 'Cliente atualizado com sucesso!' : 'Cliente salvo com sucesso!',
            'success'
        );
        
        cancelarClienteForm();
        await loadClientes();
        populateSelects();
        
    } catch (error) {
        console.error('Erro ao salvar cliente:', error);
        showNotification('Erro ao salvar cliente', 'error');
    } finally {
        hideLoading();
    }
}

function toggleServicoForm() {
    const form = document.getElementById('servicoForm');
    if (form) {
        form.classList.toggle('active');
        
        if (form.classList.contains('active')) {
            document.getElementById('servicoDescricao').focus();
        }
    }
}

function cancelarServicoForm() {
    const form = document.getElementById('servicoForm');
    if (form) {
        form.classList.remove('active');
        document.getElementById('servicoFormElement').reset();
        currentServicoId = null;
    }
}

async function handleServicoSubmit(e) {
    e.preventDefault();
    
    const formData = {
        descricao: document.getElementById('servicoDescricao').value.trim(),
        valor: parseFloat(document.getElementById('servicoValor').value)
    };
    
    try {
        showLoading();
        
        if (db) {
            let result;
            if (currentServicoId) {
                result = await db
                    .from('servicos')
                    .update(formData)
                    .eq('id', currentServicoId)
                    .select();
            } else {
                result = await db
                    .from('servicos')
                    .insert([formData])
                    .select();
            }
            
            if (result.error) throw result.error;
        } else {
            // Modo offline
            if (currentServicoId) {
                const index = servicos.findIndex(s => s.id === currentServicoId);
                if (index !== -1) {
                    servicos[index] = { ...servicos[index], ...formData };
                }
            } else {
                servicos.push({ id: Date.now().toString(), ...formData });
            }
        }
        
        showNotification(
            currentServicoId ? 'Serviço atualizado com sucesso!' : 'Serviço salvo com sucesso!',
            'success'
        );
        
        cancelarServicoForm();
        await loadServicos();
        populateSelects();
        
    } catch (error) {
        console.error('Erro ao salvar serviço:', error);
        showNotification('Erro ao salvar serviço', 'error');
    } finally {
        hideLoading();
    }
}

// Funções de orçamento
function populateSelects() {
    // Popular select de clientes
    const clienteSelect = document.getElementById('orcamentoCliente');
    if (clienteSelect) {
        clienteSelect.innerHTML = '<option value="">Selecione um cliente</option>';
        
        clientes.forEach(cliente => {
            const option = document.createElement('option');
            option.value = cliente.id;
            option.textContent = `${cliente.nome} - ${cliente.carro || 'Veículo não informado'}`;
            clienteSelect.appendChild(option);
        });
    }
    
    // Popular select de serviços
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

function adicionarServico() {
    const servicoId = document.getElementById('servicoSelect').value;
    const quantidade = parseInt(document.getElementById('servicoQuantidade').value) || 1;
    
    if (!servicoId) {
        showNotification('Selecione um serviço', 'warning');
        return;
    }
    
    const servico = servicos.find(s => s.id === servicoId);
    if (!servico) return;
    
    // Verificar se o serviço já foi adicionado
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
    
    // Limpar seleção
    document.getElementById('servicoSelect').value = '';
    document.getElementById('servicoQuantidade').value = '1';
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
                <button type="button" class="btn btn-small btn-danger" onclick="removeServico(${index})">
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

function removeServico(index) {
    servicosOrcamento.splice(index, 1);
    renderServicosOrcamento();
    calculateTotal();
}

function calculateTotal() {
    const subtotal = servicosOrcamento.reduce((sum, item) => {
        return sum + (item.valor_cobrado * item.quantidade);
    }, 0);
    
    const desconto = parseFloat(document.getElementById('orcamentoDesconto').value) || 0;
    const valorDesconto = subtotal * (desconto / 100);
    const total = subtotal - valorDesconto;
    
    // Atualizar elementos se existirem
    const subtotalEl = document.getElementById('valorSubtotal');
    if (subtotalEl) subtotalEl.textContent = formatCurrency(subtotal);
    
    const descontoEl = document.getElementById('valorDesconto');
    if (descontoEl) descontoEl.textContent = formatCurrency(valorDesconto);
    
    const totalEl = document.getElementById('valorTotal');
    if (totalEl) totalEl.textContent = formatCurrency(total);
}

function limparOrcamento() {
    const form = document.getElementById('orcamentoForm');
    if (form) {
        form.reset();
    }
    
    servicosOrcamento = [];
    currentOrcamento = null;
    renderServicosOrcamento();
    calculateTotal();
    
    // Limpar seleção de formas de pagamento
    document.querySelectorAll('.payment-option').forEach(option => {
        option.classList.remove('selected');
        option.querySelector('input').checked = false;
    });
    
    const submitText = document.getElementById('orcamentoSubmitText');
    if (submitText) {
        submitText.textContent = 'Salvar Orçamento';
    }
}

async function handleOrcamentoSubmit(e) {
    e.preventDefault();
    
    const clienteId = document.getElementById('orcamentoCliente').value;
    const desconto = parseFloat(document.getElementById('orcamentoDesconto').value) || 0;
    const localServico = document.getElementById('orcamentoLocal').value;
    
    if (!clienteId) {
        showNotification('Selecione um cliente', 'warning');
        return;
    }
    
    if (servicosOrcamento.length === 0) {
        showNotification('Adicione pelo menos um serviço', 'warning');
        return;
    }
    
    // Obter formas de pagamento selecionadas
    const formasPagamento = Array.from(document.querySelectorAll('.payment-option input:checked'))
        .map(input => input.value);
    
    const subtotal = servicosOrcamento.reduce((sum, item) => {
        return sum + (item.valor_cobrado * item.quantidade);
    }, 0);
    
    const valorDesconto = subtotal * (desconto / 100);
    const valorTotal = subtotal - valorDesconto;
    
    const orcamentoData = {
        cliente_id: clienteId,
        valor_total: valorTotal,
        desconto: desconto,
        status: 'Orçamento',
        formas_pagamento: formasPagamento.join(', '),
        local_servico: localServico
    };
    
    try {
        showLoading();
        
        if (db) {
            let result;
            if (currentOrcamento) {
                result = await db
                    .from('orcamentos')
                    .update(orcamentoData)
                    .eq('id', currentOrcamento.id)
                    .select();
                
                if (result.error) throw result.error;
                
                // Deletar itens antigos
                await db
                    .from('orcamento_itens')
                    .delete()
                    .eq('orcamento_id', currentOrcamento.id);
                
            } else {
                result = await db
                    .from('orcamentos')
                    .insert([orcamentoData])
                    .select();
                
                if (result.error) throw result.error;
            }
            
            const orcamentoId = result.data[0].id;
            
            // Inserir itens do orçamento
            const itensData = servicosOrcamento.map(item => ({
                orcamento_id: orcamentoId,
                servico_id: item.servico_id,
                descricao_servico: item.descricao_servico,
                valor_cobrado: item.valor_cobrado,
                quantidade: item.quantidade
            }));
            
            const { error: itensError } = await db
                .from('orcamento_itens')
                .insert(itensData);
            
            if (itensError) throw itensError;
        } else {
            // Modo offline
            const novoOrcamento = {
                id: Date.now().toString(),
                ...orcamentoData,
                created_at: new Date().toISOString(),
                clientes: clientes.find(c => c.id === clienteId),
                orcamento_itens: servicosOrcamento
            };
            
            if (currentOrcamento) {
                const index = orcamentos.findIndex(o => o.id === currentOrcamento.id);
                if (index !== -1) {
                    orcamentos[index] = { ...orcamentos[index], ...novoOrcamento };
                }
            } else {
                orcamentos.push(novoOrcamento);
            }
        }
        
        showNotification(
            currentOrcamento ? 'Orçamento atualizado com sucesso!' : 'Orçamento salvo com sucesso!',
            'success'
        );
        
        limparOrcamento();
        await loadOrcamentos();
        updateDashboard();
        
    } catch (error) {
        console.error('Erro ao salvar orçamento:', error);
        showNotification('Erro ao salvar orçamento', 'error');
    } finally {
        hideLoading();
    }
}

// Funções de filtro
function filterClientes() {
    const search = document.getElementById('searchClientes').value.toLowerCase();
    const filteredClientes = clientes.filter(cliente => 
        cliente.nome.toLowerCase().includes(search) ||
        (cliente.placa && cliente.placa.toLowerCase().includes(search))
    );
    
    // Re-renderizar com dados filtrados
    const container = document.getElementById('clientesGrid');
    if (container) {
        container.innerHTML = filteredClientes.map(cliente => `
            <div class="cliente-card" onclick="showClienteDetails('${cliente.id}')">
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
                </div>
                <div class="cliente-card-actions">
                    <button class="btn btn-primary" onclick="event.stopPropagation(); quickCall('${cliente.telefone}')">
                        <i class="fas fa-phone"></i>
                        Ligar
                    </button>
                    <button class="btn btn-success" onclick="event.stopPropagation(); quickWhatsApp('${cliente.telefone}', '${cliente.nome}')">
                        <i class="fab fa-whatsapp"></i>
                        WhatsApp
                    </button>
                </div>
            </div>
        `).join('');
    }
}

function filterHistorico() {
    const status = document.getElementById('filterStatus').value;
    const dataInicio = document.getElementById('filterDataInicio').value;
    const dataFim = document.getElementById('filterDataFim').value;
    
    let filteredOrcamentos = [...orcamentos];
    
    if (status) {
        filteredOrcamentos = filteredOrcamentos.filter(o => o.status === status);
    }
    
    if (dataInicio) {
        filteredOrcamentos = filteredOrcamentos.filter(o => 
            new Date(o.created_at) >= new Date(dataInicio)
        );
    }
    
    if (dataFim) {
        filteredOrcamentos = filteredOrcamentos.filter(o => 
            new Date(o.created_at) <= new Date(dataFim)
        );
    }
    
    const container = document.getElementById('historicoList');
    if (container) {
        container.innerHTML = filteredOrcamentos.map(orcamento => `
            <div class="historico-item" onclick="showHistoricoDetails('${orcamento.id}')">
                <h4>${orcamento.clientes?.nome || 'Cliente não encontrado'}</h4>
                <p><strong>Veículo:</strong> ${orcamento.clientes?.carro || '-'}</p>
                <p><strong>Data:</strong> ${formatDate(orcamento.created_at)}</p>
                <p><strong>Status:</strong> <span class="activity-status ${orcamento.status.toLowerCase()}">${orcamento.status}</span></p>
                <p class="valor">${formatCurrency(orcamento.valor_total)}</p>
            </div>
        `).join('');
    }
}

// Funções de UI
function showLoading() {
    const syncIcon = document.getElementById('syncIcon');
    const syncStatus = document.getElementById('syncStatus');
    
    if (syncIcon) syncIcon.classList.add('spin');
    if (syncStatus) syncStatus.textContent = 'Sincronizando...';
}

function hideLoading() {
    const syncIcon = document.getElementById('syncIcon');
    const syncStatus = document.getElementById('syncStatus');
    
    if (syncIcon) syncIcon.classList.remove('spin');
    if (syncStatus) syncStatus.textContent = 'Online';
}

function showNotification(message, type = 'info') {
    const notification = document.getElementById('notification');
    if (!notification) return;
    
    const icon = notification.querySelector('.notification-icon');
    const messageEl = notification.querySelector('.notification-message');
    
    // Definir ícone baseado no tipo
    const icons = {
        success: 'fas fa-check-circle',
        error: 'fas fa-exclamation-circle',
        warning: 'fas fa-exclamation-triangle',
        info: 'fas fa-info-circle'
    };
    
    if (icon) icon.className = `notification-icon ${icons[type]}`;
    if (messageEl) messageEl.textContent = message;
    
    // Remover classes anteriores e adicionar nova
    notification.className = `notification ${type}`;
    notification.classList.add('show');
    
    // Remover após 5 segundos
    setTimeout(() => {
        notification.classList.remove('show');
    }, 5000);
}

function showConfirm(title, message, onConfirm) {
    const modal = document.getElementById('modalOverlay');
    const confirmTitle = document.getElementById('confirmTitle');
    const confirmMessage = document.getElementById('confirmMessage');
    const confirmButton = document.getElementById('confirmButton');
    
    if (confirmTitle) confirmTitle.textContent = title;
    if (confirmMessage) confirmMessage.textContent = message;
    
    if (confirmButton) {
        confirmButton.onclick = () => {
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

// Funções de detalhes
function showClienteDetails(clienteId) {
    const cliente = clientes.find(c => c.id === clienteId);
    if (!cliente) return;
    
    const detailsPanel = document.getElementById('clienteDetails');
    if (!detailsPanel) return;
    
    document.getElementById('clienteDetailsNome').textContent = cliente.nome;
    document.getElementById('clienteDetailsTelefone').textContent = cliente.telefone || '-';
    document.getElementById('clienteDetailsCarro').textContent = cliente.carro || '-';
    document.getElementById('clienteDetailsPlaca').textContent = cliente.placa || '-';
    
    // Carregar histórico do cliente
    const clienteOrcamentos = orcamentos.filter(o => o.cliente_id === clienteId);
    const historicoContainer = document.getElementById('clienteHistorico');
    
    if (clienteOrcamentos.length === 0) {
        historicoContainer.innerHTML = '<p>Nenhum orçamento encontrado</p>';
    } else {
        historicoContainer.innerHTML = clienteOrcamentos.map(orcamento => `
            <div class="history-item">
                <p><strong>Data:</strong> ${formatDate(orcamento.created_at)}</p>
                <p><strong>Status:</strong> <span class="activity-status ${orcamento.status.toLowerCase()}">${orcamento.status}</span></p>
                <p><strong>Valor:</strong> ${formatCurrency(orcamento.valor_total)}</p>
            </div>
        `).join('');
    }
    
    detailsPanel.classList.add('active');
}

function closeClienteDetails() {
    const detailsPanel = document.getElementById('clienteDetails');
    if (detailsPanel) {
        detailsPanel.classList.remove('active');
    }
}

function showHistoricoDetails(orcamentoId) {
    const orcamento = orcamentos.find(o => o.id === orcamentoId);
    if (!orcamento) return;
    
    // Implementar detalhes do histórico
    console.log('Mostrar detalhes do orçamento:', orcamento);
}

function closeHistoricoDetails() {
    // Implementar fechamento dos detalhes
    console.log('Fechar detalhes do histórico');
}

// Funções de ações rápidas
function quickCall(phone) {
    if (phone) {
        window.location.href = `tel:${phone}`;
    }
}

function quickWhatsApp(phone, name) {
    if (phone) {
        const cleanPhone = phone.replace(/\D/g, '');
        const message = `Olá ${name}, como posso ajudar você hoje?`;
        window.open(`https://wa.me/55${cleanPhone}?text=${encodeURIComponent(message)}`, '_blank');
    }
}

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

// Funções de edição
function editCliente(id) {
    const cliente = clientes.find(c => c.id === id);
    if (!cliente) return;
    
    currentClienteId = id;
    
    document.getElementById('clienteNome').value = cliente.nome || '';
    document.getElementById('clienteTelefone').value = cliente.telefone || '';
    document.getElementById('clienteCarro').value = cliente.carro || '';
    document.getElementById('clientePlaca').value = cliente.placa || '';
    
    const segmentoSelect = document.getElementById('clienteSegmento');
    if (segmentoSelect) segmentoSelect.value = cliente.segmento || '';
    
    const origemSelect = document.getElementById('clienteOrigem');
    if (origemSelect) origemSelect.value = cliente.origem || '';
    
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

function deleteServico(id) {
    const servico = servicos.find(s => s.id === id);
    if (!servico) return;
    
    showConfirm(
        'Excluir Serviço',
        `Tem certeza que deseja excluir o serviço "${servico.descricao}"?`,
        async () => {
            try {
                showLoading();
                
                if (db) {
                    const { error } = await db
                        .from('servicos')
                        .delete()
                        .eq('id', id);
                    
                    if (error) throw error;
                } else {
                    // Modo offline
                    const index = servicos.findIndex(s => s.id === id);
                    if (index !== -1) {
                        servicos.splice(index, 1);
                    }
                }
                
                showNotification('Serviço excluído com sucesso!', 'success');
                await loadServicos();
                populateSelects();
                
            } catch (error) {
                console.error('Erro ao excluir serviço:', error);
                showNotification('Erro ao excluir serviço', 'error');
            } finally {
                hideLoading();
            }
        }
    );
}

// Funções de configuração
function toggleNotifications() {
    const checkbox = document.getElementById('notificationCheckbox');
    const enabled = checkbox.checked;
    
    localStorage.setItem('notifications_enabled', enabled);
    showNotification(enabled ? 'Notificações ativadas' : 'Notificações desativadas', 'info');
}

function toggleDarkMode() {
    const checkbox = document.getElementById('darkModeCheckbox');
    const enabled = checkbox.checked;
    
    document.body.setAttribute('data-theme', enabled ? 'dark' : 'light');
    localStorage.setItem('theme', enabled ? 'dark' : 'light');
    
    showNotification(enabled ? 'Modo escuro ativado' : 'Modo claro ativado', 'info');
}

function toggleClienteFilters() {
    // Implementar filtros de cliente
    console.log('Alternar filtros de cliente');
}

function exportAllData() {
    const allData = {
        clientes: clientes,
        servicos: servicos,
        orcamentos: orcamentos,
        exportDate: new Date().toISOString(),
        version: '1.0.2'
    };
    
    const blob = new Blob([JSON.stringify(allData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `rm_crm_backup_${formatDate(new Date()).replace(/\//g, '-')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showNotification('Backup exportado com sucesso', 'success');
}

function saveAsDraft() {
    const orcamentoData = {
        cliente: document.getElementById('orcamentoCliente').value,
        servicos: servicosOrcamento,
        desconto: document.getElementById('orcamentoDesconto').value,
        local: document.getElementById('orcamentoLocal').value,
        timestamp: new Date().toISOString()
    };
    
    localStorage.setItem('orcamento_draft', JSON.stringify(orcamentoData));
    showNotification('Rascunho salvo com sucesso', 'success');
}

function getCurrentLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            position => {
                const { latitude, longitude } = position.coords;
                const locationInput = document.getElementById('orcamentoLocal');
                if (locationInput) {
                    locationInput.value = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
                }
                showNotification('Localização obtida com sucesso', 'success');
            },
            error => {
                console.error('Erro ao obter localização:', error);
                showNotification('Erro ao obter localização', 'error');
            }
        );
    } else {
        showNotification('Geolocalização não suportada', 'error');
    }
}

function aplicarFiltros() {
    filterHistorico();
}

// Função debounce para otimização
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

// Restaurar configurações salvas
function restoreSettings() {
    // Restaurar tema
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        document.body.setAttribute('data-theme', savedTheme);
        const checkbox = document.getElementById('darkModeCheckbox');
        if (checkbox) {
            checkbox.checked = savedTheme === 'dark';
        }
    }
    
    // Restaurar notificações
    const notificationsEnabled = localStorage.getItem('notifications_enabled');
    if (notificationsEnabled) {
        const checkbox = document.getElementById('notificationCheckbox');
        if (checkbox) {
            checkbox.checked = notificationsEnabled === 'true';
        }
    }
}

// Inicializar configurações quando DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    restoreSettings();
});

// Adicionar CSS para elementos faltando
const additionalStyles = `
    .spin {
        animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
    
    .loading-details {
        margin-top: 1rem;
        font-size: 0.75rem;
        color: var(--text-muted);
    }
    
    .notification.show {
        transform: translateX(0);
    }
    
    .modal-overlay.active {
        display: flex;
    }
    
    .cliente-details.active {
        right: 0;
    }
    
    .text-center {
        text-align: center;
    }
    
    .activity-status {
        padding: 0.25rem 0.5rem;
        border-radius: 0.25rem;
        font-size: 0.75rem;
        font-weight: 500;
    }
    
    .activity-status.orçamento {
        background: var(--accent-blue);
        color: white;
    }
    
    .activity-status.aprovado {
        background: var(--accent-orange);
        color: white;
    }
    
    .activity-status.finalizado {
        background: var(--accent-green);
        color: white;
    }
    
    .activity-status.cancelado {
        background: var(--primary-red);
        color: white;
    }
    
    .hidden {
        opacity: 0;
        pointer-events: none;
    }
`;

// Adicionar estilos adicionais
const styleElement = document.createElement('style');
styleElement.textContent = additionalStyles;
document.head.appendChild(styleElement);

// Log de inicialização
console.log('R.M. CRM Pro+ Script carregado - Versão 1.0.2 // ===== CORREÇÃO DE EVENT LISTENERS =====

// Função para reconfigurar todos os event listeners
function reconfigureEventListeners() {
    console.log('Reconfigurando event listeners...');
    
    // Remover event listeners antigos para evitar duplicação
    document.querySelectorAll('*').forEach(el => {
        el.onclick = null;
    });
    
    // Reconfigurar navegação
    document.querySelectorAll('.nav-tab, .mobile-nav-item').forEach(tab => {
        tab.addEventListener('click', function(e) {
            e.preventDefault();
            const tabName = this.dataset.tab;
            if (tabName) {
                switchTab(tabName);
            }
        });
    });
    
    // Reconfigurar botões principais
    const mainButtons = [
        { id: 'clienteFormElement', handler: handleClienteSubmit },
        { id: 'servicoFormElement', handler: handleServicoSubmit },
        { id: 'orcamentoForm', handler: handleOrcamentoSubmit }
    ];
    
    mainButtons.forEach(({ id, handler }) => {
        const form = document.getElementById(id);
        if (form) {
            form.addEventListener('submit', handler);
        }
    });
    
    // Reconfigurar botões de ação
    setupActionButtons();
    
    console.log('Event listeners reconfigurados com sucesso!');
}

// Configurar botões de ação
function setupActionButtons() {
    // Botão novo cliente
    const newClientBtn = document.querySelector('button[onclick="toggleClienteForm()"]');
    if (newClientBtn) {
        newClientBtn.onclick = toggleClienteForm;
    }
    
    // Botão novo serviço
    const newServiceBtn = document.querySelector('button[onclick="toggleServicoForm()"]');
    if (newServiceBtn) {
        newServiceBtn.onclick = toggleServicoForm;
    }
    
    // Botão adicionar serviço
    const addServiceBtn = document.querySelector('button[onclick="adicionarServico()"]');
    if (addServiceBtn) {
        addServiceBtn.onclick = adicionarServico;
    }
    
    // Botão limpar orçamento
    const clearBtn = document.querySelector('button[onclick="limparOrcamento()"]');
    if (clearBtn) {
        clearBtn.onclick = limparOrcamento;
    }
    
    // Botões de ação rápida
    const quickBtns = document.querySelectorAll('.quick-actions button');
    quickBtns.forEach(btn => {
        if (btn.onclick) return; // Já configurado
        
        if (btn.textContent.includes('Cliente')) {
            btn.onclick = quickAddClient;
        } else if (btn.textContent.includes('Orçamento')) {
            btn.onclick = quickOrcamento;
        }
    });
}

// Executar reconfiguração após carregamento
document.addEventListener('DOMContentLoaded', function() {
    // Aguardar um pouco para garantir que tudo carregou
    setTimeout(() => {
        reconfigureEventListeners();
    }, 2000);
});

// Também executar quando o sistema for inicializado
setTimeout(() => {
    reconfigureEventListeners();
}, 3000);

