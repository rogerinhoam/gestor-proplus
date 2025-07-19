// R.M. Estética Automotiva PRO+ - Sistema de Gerenciamento
// JavaScript Principal - Todas as funcionalidades integradas

// ============================================================================
// CONFIGURAÇÕES E CONSTANTES
// ============================================================================

// Dados do estabelecimento
const ESTABELECIMENTO = {
    nome: "R.M. Estética Automotiva",
    cnpj: "18.637.639/0001-48",
    telefone: "24999486232",
    endereco: "Rua 40, TV - Recanto dos Pássaros, Pq. Mambucaba, Angra dos Reis - RJ",
    agradecimento: "Obrigado pela preferência e volte sempre! 👍"
};

// Configurações do Supabase
const SUPABASE_URL = "https://bezbszbkaifcanqsmdbi.supabase.co/";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJlemJzemJrYWlmY2FucXNtZGJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI2MTM5MTksImV4cCI6MjA2ODE4OTkxOX0.zLXAuQz7g5ym3Bd5pkhg5vsnf_3rdJFRAXI_kX8tM18";

// Validação crítica das credenciais
if (!SUPABASE_URL || !SUPABASE_KEY || SUPABASE_URL.includes('YOUR_SUPABASE_URL') || SUPABASE_KEY.includes('YOUR_SUPABASE_KEY')) {
    alert('❌ Erro: Credenciais do Supabase não configuradas corretamente!');
}

// Inicialização do cliente Supabase
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ============================================================================
// ESTADO GLOBAL DA APLICAÇÃO
// ============================================================================

const state = {
    // Dados principais
    clientes: [],
    servicos: [],
    orcamentos: [],
    orcamentoItens: [],
    crmInteractions: [],
    despesas: [],
    
    // Variáveis de controle
    editandoClienteId: null,
    editandoServicoId: null,
    editandoDespesaId: null,
    orcamentoSelecionado: null,
    isSyncing: false,
    isOffline: false,
    
    // Listas temporárias
    novoOrcamentoItens: [],
    selectedDispatchClients: new Set(),
    selectedDispatchImage: null,
    
    // Listeners do Supabase
    supabaseListeners: [],
    
    // Charts
    monthlyChart: null,
    despesasChart: null
};

// ============================================================================
// UTILITÁRIOS E SELETORES DOM
// ============================================================================

// Seletores DOM simplificados
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

// Função para mostrar notificações
function showNotification(message, type = 'success') {
    const notification = $('#notification');
    const messageElement = $('#notification-message');
    
    messageElement.textContent = message;
    notification.className = `show ${type}`;
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 4000);
}

// Animação de confete para celebrar sucessos
function triggerConfetti(type = 'success') {
    const colors = ['#16a34a', '#2563eb', '#dc2626', '#ea580c', '#8b5cf6'];
    const container = document.body;
    
    for (let i = 0; i < 30; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.top = Math.random() * 100 + '%';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.setProperty('--x', (Math.random() - 0.5) * 200 + 'px');
        confetti.style.setProperty('--y', Math.random() * 100 + 100 + 'px');
        confetti.style.animationDelay = Math.random() * 0.5 + 's';
        
        container.appendChild(confetti);
        
        // Remove confetti após animação
        setTimeout(() => {
            if (confetti.parentNode) {
                confetti.parentNode.removeChild(confetti);
            }
        }, 2000);
    }
}

// Formatação de moeda brasileira
function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value || 0);
}

// Formatação de data e hora
function formatDateTime(dateString) {
    return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(new Date(dateString));
}

// Formatação de data
function formatDate(dateString) {
    return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    }).format(new Date(dateString));
}

// Formatação de telefone
function formatPhone(value) {
    const cleaned = value.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{2})(\d{4,5})(\d{4})$/);
    if (match) {
        return `(${match[1]}) ${match[2]}-${match[3]}`;
    }
    return value;
}

// Limpeza de telefone para WhatsApp
function cleanPhone(value) {
    const cleaned = value.replace(/\D/g, '');
    return cleaned.startsWith('55') ? cleaned : '55' + cleaned;
}

// Modal de confirmação
function showConfirmModal(title, message, callback) {
    const modal = $('#confirm-modal');
    const modalTitle = $('#modal-title');
    const modalMessage = $('#modal-message');
    const confirmBtn = $('#modal-confirm-btn');
    const cancelBtn = $('#modal-cancel-btn');
    
    modalTitle.textContent = title;
    modalMessage.textContent = message;
    modal.classList.add('active');
    
    // Remove listeners anteriores
    const newConfirmBtn = confirmBtn.cloneNode(true);
    const newCancelBtn = cancelBtn.cloneNode(true);
    confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
    cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);
    
    // Adiciona novos listeners
    newConfirmBtn.addEventListener('click', () => {
        modal.classList.remove('active');
        callback();
    });
    
    newCancelBtn.addEventListener('click', () => {
        modal.classList.remove('active');
    });
}

// Função para exibir estados vazios
function renderEmptyState(targetElement, message, suggestion) {
    targetElement.innerHTML = `
        <div class="empty-list-message">
            <p>${message}</p>
            <small>${suggestion}</small>
        </div>
    `;
}

// Função para mostrar skeletons de carregamento
function showSkeletons(targetElement, count = 5, type = 'list') {
    targetElement.innerHTML = '';
    
    for (let i = 0; i < count; i++) {
        const skeleton = document.createElement('div');
        skeleton.className = 'skeleton skeleton-item';
        
        if (type === 'list') {
            skeleton.innerHTML = `
                <div class="skeleton-text long"></div>
                <div class="skeleton-text medium"></div>
                <div class="skeleton-text short"></div>
            `;
        } else if (type === 'chart') {
            skeleton.style.height = '200px';
            skeleton.style.width = '100%';
        }
        
        targetElement.appendChild(skeleton);
    }
}

// Debounce para otimizar buscas
function debounce(func, delay) {
    let timeoutId;
    return function (...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
}

// Exportação para CSV
function exportToCsv(data, filename) {
    if (!data || data.length === 0) {
        showNotification('Nenhum dado para exportar', 'warning');
        return;
    }
    
    const headers = Object.keys(data[0]);
    const csvContent = [
        headers.join(';'),
        ...data.map(row => 
            headers.map(header => {
                const value = row[header];
                if (value === null || value === undefined) return '';
                return String(value).replace(/;/g, ',');
            }).join(';')
        )
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    
    showNotification('Arquivo exportado com sucesso!', 'success');
}

// Validação visual de formulários
function handleValidationIcon(inputElement) {
    const validationIcon = inputElement.parentElement.querySelector('.validation-icon');
    if (!validationIcon) return;
    
    if (inputElement.validity.valid && inputElement.value.trim() !== '') {
        validationIcon.className = 'validation-icon fas fa-check-circle';
        validationIcon.style.color = 'var(--accent-green)';
        validationIcon.style.display = 'block';
        inputElement.style.borderColor = 'var(--accent-green)';
    } else if (!inputElement.validity.valid && inputElement.value.trim() !== '') {
        validationIcon.className = 'validation-icon fas fa-times-circle';
        validationIcon.style.color = 'var(--accent-red-status)';
        validationIcon.style.display = 'block';
        inputElement.style.borderColor = 'var(--accent-red-status)';
    } else {
        validationIcon.style.display = 'none';
        inputElement.style.borderColor = 'var(--border-color)';
    }
}

// ============================================================================
// SINCRONIZAÇÃO E CONECTIVIDADE
// ============================================================================

// Configuração dos listeners do Supabase
async function setupSupabaseListeners() {
    // Remove listeners existentes
    state.supabaseListeners.forEach(listener => {
        supabase.removeChannel(listener);
    });
    state.supabaseListeners = [];
    
    // Listener para clientes
    const clientesListener = supabase
        .channel('clientes-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'clientes' }, () => {
            fetchAllData(false);
        })
        .subscribe();
    
    // Listener para serviços
    const servicosListener = supabase
        .channel('servicos-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'servicos' }, () => {
            fetchAllData(false);
        })
        .subscribe();
    
    // Listener para orçamentos
    const orcamentosListener = supabase
        .channel('orcamentos-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'orcamentos' }, () => {
            fetchAllData(false);
        })
        .subscribe();
    
    // Listener para itens de orçamento
    const orcamentoItensListener = supabase
        .channel('orcamento-itens-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'orcamento_itens' }, () => {
            fetchAllData(false);
        })
        .subscribe();
    
    // Listener para interações CRM
    const crmListener = supabase
        .channel('crm-interactions-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'crm_interactions' }, () => {
            fetchAllData(false);
        })
        .subscribe();
    
    // Listener para despesas
    const despesasListener = supabase
        .channel('despesas-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'despesas' }, () => {
            fetchAllData(false);
        })
        .subscribe();
    
    // Armazena listeners para limpeza posterior
    state.supabaseListeners = [
        clientesListener,
        servicosListener,
        orcamentosListener,
        orcamentoItensListener,
        crmListener,
        despesasListener
    ];
}

// Detecção de status da rede
function updateNetworkStatus() {
    window.addEventListener('online', () => {
        state.isOffline = false;
        $('#offline-indicator').classList.remove('show');
        showNotification('Conexão restaurada! Sincronizando dados...', 'success');
        fetchAllData(true);
    });
    
    window.addEventListener('offline', () => {
        state.isOffline = true;
        $('#offline-indicator').classList.add('show');
        showNotification('Conectividade perdida. Modo offline ativado.', 'warning');
    });
}

// Busca todos os dados do Supabase
async function fetchAllData(showLoadingOverlay = true) {
    if (state.isSyncing) return;
    state.isSyncing = true;
    
    const syncOverlay = $('#sync-overlay');
    const syncBtn = $('#sync-btn');
    
    if (showLoadingOverlay) {
        syncOverlay.classList.add('active');
    }
    syncBtn.classList.add('syncing');
    
    try {
        // Mostra skeletons enquanto carrega
        showSkeletons($('#clientes-lista'));
        showSkeletons($('#servicos-lista'));
        showSkeletons($('#historico-lista'));
        showSkeletons($('#recent-activity-list'));
        showSkeletons($('#crm-interaction-list'));
        showSkeletons($('#despesas-lista'));
        
        // Busca todos os dados em paralelo
        const [
            clientesResponse,
            servicosResponse,
            orcamentosResponse,
            crmInteractionsResponse,
            despesasResponse
        ] = await Promise.all([
            supabase.from('clientes').select('*').order('nome'),
            supabase.from('servicos').select('*').order('descricao'),
            supabase.from('orcamentos').select(`
                *,
                clientes (*),
                orcamento_itens (
                    id,
                    servico_id,
                    quantidade,
                    valor_unitario,
                    servicos (descricao, valor)
                )
            `).order('created_at', { ascending: false }),
            supabase.from('crm_interactions').select(`
                *,
                clientes (nome, carro)
            `).order('interaction_date', { ascending: false }),
            supabase.from('despesas').select('*').order('data', { ascending: false })
        ]);
        
        // Verifica erros
        if (clientesResponse.error) throw clientesResponse.error;
        if (servicosResponse.error) throw servicosResponse.error;
        if (orcamentosResponse.error) throw orcamentosResponse.error;
        if (crmInteractionsResponse.error) throw crmInteractionsResponse.error;
        if (despesasResponse.error) throw despesasResponse.error;
        
        // Atualiza estado
        state.clientes = clientesResponse.data || [];
        state.servicos = servicosResponse.data || [];
        state.orcamentos = orcamentosResponse.data || [];
        state.crmInteractions = crmInteractionsResponse.data || [];
        state.despesas = despesasResponse.data || [];
        
        // Extrai itens de orçamento
        state.orcamentoItens = [];
        state.orcamentos.forEach(orc => {
            if (orc.orcamento_itens) {
                state.orcamentoItens.push(...orc.orcamento_itens);
            }
        });
        
        // Renderiza todo o conteúdo
        renderAllContent();
        
        if (showLoadingOverlay) {
            showNotification('Dados sincronizados com sucesso!', 'success');
        }
        
    } catch (error) {
        console.error('Erro ao buscar dados:', error);
        showNotification('Erro ao sincronizar dados: ' + error.message, 'error');
    } finally {
        state.isSyncing = false;
        syncOverlay.classList.remove('active');
        syncBtn.classList.remove('syncing');
    }
}

// Renderiza todo o conteúdo da aplicação
function renderAllContent() {
    updateDashboard();
    renderClientes();
    renderServicos();
    renderOrcamentos();
    renderOrcamentoClienteOptions();
    renderOrcamentoServicoOptions();
    renderCrmInteractions();
    renderCrmMetrics();
    renderDespesas();
    renderDespesasMetrics();
    renderDespesasChart();
    renderInteractionClientOptions();
    renderSuggestedFollowups();
    renderInactiveClients();
}

// ============================================================================
// GERENCIAMENTO DE ABAS
// ============================================================================

function showTab(tabId, filterParams = {}) {
    // Remove classe active de todas as abas e botões
    $$('.tab-content').forEach(tab => tab.classList.remove('active'));
    $$('.nav-btn').forEach(btn => btn.classList.remove('active'));
    
    // Ativa a aba selecionada
    $(`#${tabId}-tab`).classList.add('active');
    $(`.nav-btn[data-tab="${tabId}"]`).classList.add('active');
    
    // Scroll para o topo
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Inicialização específica por aba
    switch(tabId) {
        case 'dashboard':
            updateDashboard();
            renderMonthlyStatsChart();
            break;
        case 'clientes':
            renderClientes();
            break;
        case 'servicos':
            renderServicos();
            break;
        case 'novo-orcamento':
            renderOrcamentoClienteOptions();
            renderOrcamentoServicoOptions();
            break;
        case 'historico':
            renderOrcamentos();
            // Aplica filtros se fornecidos
            if (filterParams.status) {
                $('#filter-status').value = filterParams.status;
                renderOrcamentos();
            }
            break;
        case 'crm':
            renderCrmInteractions();
            renderCrmMetrics();
            renderSuggestedFollowups();
            renderInactiveClients();
            break;
        case 'despesas':
            renderDespesas();
            renderDespesasMetrics();
            renderDespesasChart();
            break;
    }
}

// ============================================================================
// DASHBOARD - PAINEL PRINCIPAL
// ============================================================================

function updateDashboard() {
    // Calcula métricas
    const totalClientes = state.clientes.length;
    const orcamentosPendentes = state.orcamentos.filter(o => o.status === 'Orçamento').length;
    const orcamentosAprovados = state.orcamentos.filter(o => o.status === 'Aprovado').length;
    
    const inicioMes = new Date();
    inicioMes.setDate(1);
    const finalizadosMes = state.orcamentos.filter(o => 
        o.status === 'Finalizado' && 
        new Date(o.updated_at) >= inicioMes
    ).length;
    
    const faturamentoTotal = state.orcamentos
        .filter(o => o.status === 'Finalizado')
        .reduce((total, o) => total + (o.valor_total || 0), 0);
    
    // Atualiza elementos
    $('#stat-clientes').textContent = totalClientes;
    $('#stat-pendentes').textContent = orcamentosPendentes;
    $('#stat-aprovados').textContent = orcamentosAprovados;
    $('#stat-finalizados-mes').textContent = finalizadosMes;
    $('#stat-faturamento-total').textContent = formatCurrency(faturamentoTotal);
    
    // Renderiza atividade recente
    renderRecentActivity();
}

function renderMonthlyStatsChart() {
    const canvas = $('#monthly-finalized-chart-canvas');
    const ctx = canvas.getContext('2d');
    
    // Destrói chart existente
    if (state.monthlyChart) {
        state.monthlyChart.destroy();
    }
    
    // Prepara dados dos últimos 6 meses
    const monthlyData = [];
    const monthLabels = [];
    
    for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        
        const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
        const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        
        const finalizados = state.orcamentos.filter(o => 
            o.status === 'Finalizado' && 
            new Date(o.updated_at) >= monthStart && 
            new Date(o.updated_at) <= monthEnd
        ).length;
        
        monthlyData.push(finalizados);
        monthLabels.push(date.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }));
    }
    
    // Cria novo chart
    state.monthlyChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: monthLabels,
            datasets: [{
                label: 'Orçamentos Finalizados',
                data: monthlyData,
                backgroundColor: '#1FB8CD',
                borderColor: '#16a34a',
                borderWidth: 2,
                borderRadius: 8,
                borderSkipped: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.parsed.y} orçamentos finalizados`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: '#a0aec0'
                    }
                },
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: '#a0aec0',
                        precision: 0
                    },
                    grid: {
                        color: '#4a5568'
                    }
                }
            }
        }
    });
}

function renderRecentActivity() {
    const recentList = $('#recent-activity-list');
    const recentOrcamentos = state.orcamentos.slice(0, 8);
    
    if (recentOrcamentos.length === 0) {
        renderEmptyState(recentList, 'Nenhuma atividade recente', 'Crie seu primeiro orçamento para começar');
        return;
    }
    
    recentList.innerHTML = recentOrcamentos.map(orc => `
        <li>
            <div>
                <strong>${orc.clientes?.nome || 'Cliente não encontrado'}</strong>
                <small>${orc.clientes?.carro || 'Carro não informado'}</small>
                <small>${formatDate(orc.created_at)}</small>
            </div>
            <div class="item-actions">
                <span class="status-indicator status-${orc.status.toLowerCase()}">${orc.status}</span>
                <span style="font-weight: bold; color: var(--accent-green);">${formatCurrency(orc.valor_total)}</span>
                <button class="btn btn-sm btn-primary view-historico-btn" data-id="${orc.id}">
                    <i class="fas fa-eye"></i> Ver
                </button>
            </div>
        </li>
    `).join('');
    
    // Adiciona event listeners
    recentList.addEventListener('click', (e) => {
        if (e.target.classList.contains('view-historico-btn') || e.target.parentElement.classList.contains('view-historico-btn')) {
            const orcamentoId = e.target.dataset.id || e.target.parentElement.dataset.id;
            showTab('historico');
            setTimeout(() => handleHistoricoClick(orcamentoId), 100);
        }
    });
}

// ============================================================================
// CLIENTES - GESTÃO DE CLIENTES
// ============================================================================

function renderClientes() {
    const searchTerm = $('#search-cliente').value.toLowerCase();
    const sortBy = $('#sort-clientes').value;
    
    // Filtra clientes
    let filteredClientes = state.clientes.filter(cliente => 
        cliente.nome.toLowerCase().includes(searchTerm) ||
        cliente.placa.toLowerCase().includes(searchTerm) ||
        formatPhone(cliente.telefone).includes(searchTerm)
    );
    
    // Ordena clientes
    filteredClientes.sort((a, b) => {
        const [field, direction] = sortBy.split('-');
        const aValue = a[field]?.toLowerCase() || '';
        const bValue = b[field]?.toLowerCase() || '';
        
        if (direction === 'asc') {
            return aValue.localeCompare(bValue);
        } else {
            return bValue.localeCompare(aValue);
        }
    });
    
    const clientesList = $('#clientes-lista');
    
    if (filteredClientes.length === 0) {
        renderEmptyState(clientesList, 'Nenhum cliente encontrado', 'Cadastre o primeiro cliente para começar');
        return;
    }
    
    clientesList.innerHTML = filteredClientes.map(cliente => `
        <li data-id="${cliente.id}" ${state.editandoClienteId === cliente.id ? 'class="editing"' : ''}>
            <div>
                <strong data-field="nome">${cliente.nome}</strong>
                <small>${cliente.carro} - ${cliente.placa}</small>
                <small>${formatPhone(cliente.telefone)}</small>
                <input type="text" class="inline-edit-input edit-mode-input" value="${cliente.nome}" data-field="nome">
                <input type="text" class="inline-edit-input edit-mode-input" value="${cliente.carro}" data-field="carro">
                <input type="text" class="inline-edit-input edit-mode-input" value="${cliente.placa}" data-field="placa">
                <input type="text" class="inline-edit-input edit-mode-input" value="${cliente.telefone}" data-field="telefone">
            </div>
            <div class="item-actions">
                <button class="btn btn-sm btn-secondary edit-cliente-btn" data-id="${cliente.id}">
                    <i class="fas fa-edit"></i> Editar
                </button>
                <button class="btn btn-sm btn-primary details-cliente-btn" data-id="${cliente.id}">
                    <i class="fas fa-eye"></i> Detalhes
                </button>
                <button class="btn btn-sm btn-danger delete-cliente-btn" data-id="${cliente.id}">
                    <i class="fas fa-trash"></i> Excluir
                </button>
            </div>
        </li>
    `).join('');
    
    // Adiciona event listeners
    clientesList.addEventListener('click', (e) => {
        const clienteId = e.target.dataset.id || e.target.parentElement.dataset.id;
        
        if (e.target.classList.contains('edit-cliente-btn') || e.target.parentElement.classList.contains('edit-cliente-btn')) {
            handleEditCliente(clienteId);
        } else if (e.target.classList.contains('details-cliente-btn') || e.target.parentElement.classList.contains('details-cliente-btn')) {
            displayClientDetails(clienteId);
        } else if (e.target.classList.contains('delete-cliente-btn') || e.target.parentElement.classList.contains('delete-cliente-btn')) {
            handleDeleteCliente(clienteId);
        }
    });
}

async function handleClienteSubmit(e) {
    e.preventDefault();
    
    const id = $('#cliente-id').value;
    const nome = $('#cliente-nome').value.trim();
    const telefone = $('#cliente-telefone').value.trim();
    const carro = $('#cliente-carro').value.trim();
    const placa = $('#cliente-placa').value.trim().toUpperCase();
    
    // Validações
    if (!nome) {
        showNotification('Nome é obrigatório', 'error');
        return;
    }
    
    if (!telefone) {
        showNotification('Telefone é obrigatório', 'error');
        return;
    }
    
    if (!carro) {
        showNotification('Carro é obrigatório', 'error');
        return;
    }
    
    if (!placa) {
        showNotification('Placa é obrigatória', 'error');
        return;
    }
    
    // Validação de placa
    const placaRegex = /^[A-Z]{3}[-]?\d{4}$|^[A-Z]{3}[-]?\d{1}[A-Z]{1}\d{2}$/;
    if (!placaRegex.test(placa)) {
        showNotification('Placa deve ter formato ABC-1234 ou ABC1D23', 'error');
        return;
    }
    
    // Validação de telefone
    const telefoneRegex = /^\(\d{2}\)\s\d{4,5}-\d{4}$/;
    if (!telefoneRegex.test(telefone)) {
        showNotification('Telefone deve ter formato (XX) XXXXX-XXXX', 'error');
        return;
    }
    
    try {
        const clienteData = { nome, telefone, carro, placa };
        
        if (id) {
            // Atualizar cliente existente
            const { error } = await supabase
                .from('clientes')
                .update(clienteData)
                .eq('id', id);
            
            if (error) throw error;
            
            showNotification('Cliente atualizado com sucesso!', 'success');
            triggerConfetti();
        } else {
            // Criar novo cliente
            const { error } = await supabase
                .from('clientes')
                .insert([clienteData]);
            
            if (error) throw error;
            
            showNotification('Cliente cadastrado com sucesso!', 'success');
            triggerConfetti();
        }
        
        resetClienteForm();
        
    } catch (error) {
        console.error('Erro ao salvar cliente:', error);
        showNotification('Erro ao salvar cliente: ' + error.message, 'error');
    }
}

function handleEditCliente(id) {
    const cliente = state.clientes.find(c => c.id === id);
    if (!cliente) return;
    
    $('#cliente-id').value = cliente.id;
    $('#cliente-nome').value = cliente.nome;
    $('#cliente-telefone').value = formatPhone(cliente.telefone);
    $('#cliente-carro').value = cliente.carro;
    $('#cliente-placa').value = cliente.placa;
    
    $('#cliente-form-title').innerHTML = '<i class="fas fa-edit"></i> Editar Cliente';
    $('#cancelar-edicao-cliente').style.display = 'inline-flex';
    
    state.editandoClienteId = id;
    renderClientes();
}

function handleDeleteCliente(id) {
    showConfirmModal(
        'Excluir Cliente',
        'Tem certeza que deseja excluir este cliente? Esta ação não pode ser desfeita.',
        async () => {
            try {
                const { error } = await supabase
                    .from('clientes')
                    .delete()
                    .eq('id', id);
                
                if (error) throw error;
                
                showNotification('Cliente excluído com sucesso!', 'success');
                triggerConfetti();
                resetClienteForm();
                
                // Esconde painel de detalhes se estiver mostrando este cliente
                if ($('#client-details-panel').style.display !== 'none') {
                    $('#client-details-panel').style.display = 'none';
                }
                
            } catch (error) {
                console.error('Erro ao excluir cliente:', error);
                showNotification('Erro ao excluir cliente: ' + error.message, 'error');
            }
        }
    );
}

function resetClienteForm() {
    $('#cliente-form').reset();
    $('#cliente-id').value = '';
    $('#cliente-form-title').innerHTML = '<i class="fas fa-user-plus"></i> Cadastrar Cliente';
    $('#cancelar-edicao-cliente').style.display = 'none';
    state.editandoClienteId = null;
    
    // Remove validações visuais
    $$('#cliente-form .validation-message').forEach(msg => msg.style.display = 'none');
    $$('#cliente-form .validation-icon').forEach(icon => icon.style.display = 'none');
    $$('#cliente-form input').forEach(input => input.style.borderColor = 'var(--border-color)');
    
    renderClientes();
}

function displayClientDetails(clientId) {
    const cliente = state.clientes.find(c => c.id === clientId);
    if (!cliente) return;
    
    // Preenche detalhes do cliente
    $('#client-detail-name').textContent = cliente.nome;
    $('#client-detail-phone').textContent = formatPhone(cliente.telefone);
    $('#client-detail-car').textContent = cliente.carro;
    $('#client-detail-plate').textContent = cliente.placa;
    
    // Busca orçamentos do cliente
    const clientOrcamentos = state.orcamentos.filter(o => o.cliente_id === clientId);
    const pastOrcamentosList = $('#client-past-orcamentos');
    
    if (clientOrcamentos.length === 0) {
        renderEmptyState(pastOrcamentosList, 'Nenhum orçamento encontrado', 'Este cliente ainda não possui orçamentos');
    } else {
        pastOrcamentosList.innerHTML = clientOrcamentos.map(orc => `
            <li>
                <div>
                    <strong>Orçamento #${orc.id}</strong>
                    <small>${formatDate(orc.created_at)}</small>
                    <small>Status: ${orc.status}</small>
                </div>
                <div class="item-actions">
                    <span style="font-weight: bold; color: var(--accent-green);">${formatCurrency(orc.valor_total)}</span>
                    <button class="btn btn-sm btn-primary view-orcamento-details-btn" data-id="${orc.id}">
                        <i class="fas fa-eye"></i> Ver Detalhes
                    </button>
                </div>
            </li>
        `).join('');
        
        // Adiciona event listeners
        pastOrcamentosList.addEventListener('click', (e) => {
            if (e.target.classList.contains('view-orcamento-details-btn') || e.target.parentElement.classList.contains('view-orcamento-details-btn')) {
                const orcamentoId = e.target.dataset.id || e.target.parentElement.dataset.id;
                showTab('historico');
                setTimeout(() => handleHistoricoClick(orcamentoId), 100);
            }
        });
    }
    
    // Mostra painel de detalhes
    $('#client-details-panel').style.display = 'block';
}

// ============================================================================
// SERVIÇOS - GESTÃO DE SERVIÇOS
// ============================================================================

function renderServicos() {
    const searchTerm = $('#search-servico').value.toLowerCase();
    const sortBy = $('#sort-servicos').value;
    
    // Filtra serviços
    let filteredServicos = state.servicos.filter(servico => 
        servico.descricao.toLowerCase().includes(searchTerm)
    );
    
    // Ordena serviços
    filteredServicos.sort((a, b) => {
        const [field, direction] = sortBy.split('-');
        
        if (field === 'valor') {
            const aValue = parseFloat(a.valor) || 0;
            const bValue = parseFloat(b.valor) || 0;
            return direction === 'asc' ? aValue - bValue : bValue - aValue;
        } else {
            const aValue = a[field]?.toLowerCase() || '';
            const bValue = b[field]?.toLowerCase() || '';
            return direction === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
        }
    });
    
    const servicosList = $('#servicos-lista');
    
    if (filteredServicos.length === 0) {
        renderEmptyState(servicosList, 'Nenhum serviço encontrado', 'Cadastre o primeiro serviço para começar');
        return;
    }
    
    servicosList.innerHTML = filteredServicos.map(servico => `
        <li data-id="${servico.id}" ${state.editandoServicoId === servico.id ? 'class="editing"' : ''}>
            <div>
                <strong data-field="descricao">${servico.descricao}</strong>
                <small>${formatCurrency(servico.valor)}</small>
                <input type="text" class="inline-edit-input edit-mode-input" value="${servico.descricao}" data-field="descricao">
                <input type="number" class="inline-edit-input edit-mode-input" value="${servico.valor}" data-field="valor" step="0.01">
            </div>
            <div class="item-actions">
                <button class="btn btn-sm btn-secondary edit-servico-btn" data-id="${servico.id}">
                    <i class="fas fa-edit"></i> Editar
                </button>
                <button class="btn btn-sm btn-danger delete-servico-btn" data-id="${servico.id}">
                    <i class="fas fa-trash"></i> Excluir
                </button>
            </div>
        </li>
    `).join('');
    
    // Adiciona event listeners
    servicosList.addEventListener('click', (e) => {
        const servicoId = e.target.dataset.id || e.target.parentElement.dataset.id;
        
        if (e.target.classList.contains('edit-servico-btn') || e.target.parentElement.classList.contains('edit-servico-btn')) {
            handleEditServico(servicoId);
        } else if (e.target.classList.contains('delete-servico-btn') || e.target.parentElement.classList.contains('delete-servico-btn')) {
            handleDeleteServico(servicoId);
        }
    });
}

async function handleServicoSubmit(e) {
    e.preventDefault();
    
    const id = $('#servico-id').value;
    const descricao = $('#servico-descricao').value.trim();
    const valor = parseFloat($('#servico-valor').value);
    
    // Validações
    if (!descricao) {
        showNotification('Descrição é obrigatória', 'error');
        return;
    }
    
    if (!valor || valor <= 0) {
        showNotification('Valor deve ser maior que zero', 'error');
        return;
    }
    
    try {
        const servicoData = { descricao, valor };
        
        if (id) {
            // Atualizar serviço existente
            const { error } = await supabase
                .from('servicos')
                .update(servicoData)
                .eq('id', id);
            
            if (error) throw error;
            
            showNotification('Serviço atualizado com sucesso!', 'success');
            triggerConfetti();
        } else {
            // Criar novo serviço
            const { error } = await supabase
                .from('servicos')
                .insert([servicoData]);
            
            if (error) throw error;
            
            showNotification('Serviço cadastrado com sucesso!', 'success');
            triggerConfetti();
        }
        
        resetServicoForm();
        
    } catch (error) {
        console.error('Erro ao salvar serviço:', error);
        showNotification('Erro ao salvar serviço: ' + error.message, 'error');
    }
}

function handleEditServico(id) {
    const servico = state.servicos.find(s => s.id === id);
    if (!servico) return;
    
    $('#servico-id').value = servico.id;
    $('#servico-descricao').value = servico.descricao;
    $('#servico-valor').value = servico.valor;
    
    $('#servico-form-title').innerHTML = '<i class="fas fa-edit"></i> Editar Serviço';
    $('#cancelar-edicao-servico').style.display = 'inline-flex';
    
    state.editandoServicoId = id;
    renderServicos();
}

function handleDeleteServico(id) {
    // Validação CRÍTICA: Verifica se o serviço está sendo usado em orçamentos
    const servicoEmUso = state.orcamentoItens.some(item => item.servico_id === id);
    
    if (servicoEmUso) {
        showNotification('Não é possível excluir este serviço pois ele está sendo usado em orçamentos existentes.', 'error');
        return;
    }
    
    showConfirmModal(
        'Excluir Serviço',
        'Tem certeza que deseja excluir este serviço? Esta ação não pode ser desfeita.',
        async () => {
            try {
                const { error } = await supabase
                    .from('servicos')
                    .delete()
                    .eq('id', id);
                
                if (error) throw error;
                
                showNotification('Serviço excluído com sucesso!', 'success');
                triggerConfetti();
                resetServicoForm();
                
            } catch (error) {
                console.error('Erro ao excluir serviço:', error);
                showNotification('Erro ao excluir serviço: ' + error.message, 'error');
            }
        }
    );
}

function resetServicoForm() {
    $('#servico-form').reset();
    $('#servico-id').value = '';
    $('#servico-form-title').innerHTML = '<i class="fas fa-plus"></i> Cadastrar Serviço';
    $('#cancelar-edicao-servico').style.display = 'none';
    state.editandoServicoId = null;
    
    // Remove validações visuais
    $$('#servico-form .validation-message').forEach(msg => msg.style.display = 'none');
    $$('#servico-form .validation-icon').forEach(icon => icon.style.display = 'none');
    $$('#servico-form input').forEach(input => input.style.borderColor = 'var(--border-color)');
    
    renderServicos();
}

// ============================================================================
// ORÇAMENTOS - CRIAÇÃO E GESTÃO
// ============================================================================

function renderOrcamentoClienteOptions() {
    const clienteSelect = $('#orcamento-cliente');
    clienteSelect.innerHTML = '<option value="">Selecione um cliente</option>';
    
    state.clientes.forEach(cliente => {
        const option = document.createElement('option');
        option.value = cliente.id;
        option.textContent = `${cliente.nome} - ${cliente.carro}`;
        clienteSelect.appendChild(option);
    });
}

function renderOrcamentoServicoOptions() {
    const servicoSelect = $('#orcamento-servico-select');
    servicoSelect.innerHTML = '<option value="">Selecione um serviço</option>';
    
    state.servicos.forEach(servico => {
        const option = document.createElement('option');
        option.value = servico.id;
        option.textContent = `${servico.descricao} - ${formatCurrency(servico.valor)}`;
        servicoSelect.appendChild(option);
    });
}

function handleAddServicoToOrcamento() {
    const servicoId = $('#orcamento-servico-select').value;
    const quantidade = parseInt($('#orcamento-servico-quantidade').value);
    
    if (!servicoId) {
        showNotification('Selecione um serviço', 'warning');
        return;
    }
    
    if (!quantidade || quantidade <= 0) {
        showNotification('Quantidade deve ser maior que zero', 'warning');
        return;
    }
    
    const servico = state.servicos.find(s => s.id === servicoId);
    if (!servico) return;
    
    // Verifica se o serviço já foi adicionado
    const existingIndex = state.novoOrcamentoItens.findIndex(item => item.servico_id === servicoId);
    
    if (existingIndex >= 0) {
        // Atualiza quantidade
        state.novoOrcamentoItens[existingIndex].quantidade = quantidade;
    } else {
        // Adiciona novo item
        state.novoOrcamentoItens.push({
            servico_id: servicoId,
            descricao_servico: servico.descricao,
            valor_cobrado: servico.valor,
            quantidade: quantidade
        });
    }
    
    // Limpa campos
    $('#orcamento-servico-select').value = '';
    $('#orcamento-servico-quantidade').value = 1;
    
    renderNovoOrcamentoItens();
    updateOrcamentoTotal();
}

function renderNovoOrcamentoItens() {
    const servicosContainer = $('#orcamento-servicos-adicionados');
    
    if (state.novoOrcamentoItens.length === 0) {
        servicosContainer.innerHTML = '<p style="text-align: center; color: var(--text-muted);">Nenhum serviço adicionado</p>';
        return;
    }
    
    servicosContainer.innerHTML = state.novoOrcamentoItens.map((item, index) => `
        <li>
            <div>
                <strong>${item.descricao_servico}</strong>
                <small>${formatCurrency(item.valor_cobrado)} cada</small>
            </div>
            <div class="item-actions">
                <input type="number" class="orcamento-item-quantity" value="${item.quantidade}" min="1" data-index="${index}">
                <button type="button" class="btn btn-sm btn-danger remove-servico-btn" data-index="${index}">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </li>
    `).join('');
    
    // Adiciona event listeners para quantidade
    servicosContainer.addEventListener('change', (e) => {
        if (e.target.classList.contains('orcamento-item-quantity')) {
            const index = parseInt(e.target.dataset.index);
            const newQuantity = parseInt(e.target.value);
            
            if (newQuantity > 0) {
                state.novoOrcamentoItens[index].quantidade = newQuantity;
                updateOrcamentoTotal();
            }
        }
    });
    
    // Adiciona event listeners para remoção
    servicosContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('remove-servico-btn') || e.target.parentElement.classList.contains('remove-servico-btn')) {
            const index = parseInt(e.target.dataset.index || e.target.parentElement.dataset.index);
            state.novoOrcamentoItens.splice(index, 1);
            renderNovoOrcamentoItens();
            updateOrcamentoTotal();
        }
    });
}

function updateOrcamentoTotal() {
    const subtotal = state.novoOrcamentoItens.reduce((total, item) => {
        return total + (item.valor_cobrado * item.quantidade);
    }, 0);
    
    const desconto = parseFloat($('#orcamento-desconto').value) || 0;
    const total = Math.max(0, subtotal - desconto);
    
    $('#orcamento-total').innerHTML = `<strong>Total: ${formatCurrency(total)}</strong>`;
}

async function handleOrcamentoSubmit(e) {
    e.preventDefault();
    
    const orcamentoId = $('#orcamento-id-to-edit').value;
    const clienteId = $('#orcamento-cliente').value;
    const desconto = parseFloat($('#orcamento-desconto').value) || 0;
    const formasPagamento = Array.from($$('#payment-options .payment-option.active')).map(btn => btn.dataset.value);
    
    // Validações
    if (!clienteId) {
        showNotification('Selecione um cliente', 'error');
        return;
    }
    
    if (state.novoOrcamentoItens.length === 0) {
        showNotification('Adicione pelo menos um serviço', 'error');
        return;
    }
    
    if (formasPagamento.length === 0) {
        showNotification('Selecione pelo menos uma forma de pagamento', 'error');
        $('#payment-options-validation').style.display = 'block';
        return;
    }
    
    $('#payment-options-validation').style.display = 'none';
    
    // Calcula valores
    const subtotal = state.novoOrcamentoItens.reduce((total, item) => {
        return total + (item.valor_cobrado * item.quantidade);
    }, 0);
    const valorTotal = Math.max(0, subtotal - desconto);
    
    try {
        const orcamentoData = {
            cliente_id: clienteId,
            desconto,
            valor_total: valorTotal,
            formas_pagamento: formasPagamento,
            updated_at: new Date().toISOString()
        };
        
        let finalOrcamentoId;
        
        if (orcamentoId) {
            // Atualizar orçamento existente
            const { error } = await supabase
                .from('orcamentos')
                .update(orcamentoData)
                .eq('id', orcamentoId);
            
            if (error) throw error;
            
            // Remove itens existentes
            await supabase
                .from('orcamento_itens')
                .delete()
                .eq('orcamento_id', orcamentoId);
            
            finalOrcamentoId = orcamentoId;
            showNotification('Orçamento atualizado com sucesso!', 'success');
        } else {
            // Criar novo orçamento
            orcamentoData.status = 'Orçamento';
            orcamentoData.created_at = new Date().toISOString();
            
            const { data, error } = await supabase
                .from('orcamentos')
                .insert([orcamentoData])
                .select();
            
            if (error) throw error;
            
            finalOrcamentoId = data[0].id;
            showNotification('Orçamento criado com sucesso!', 'success');
        }
        
        // Inserir itens do orçamento
        const itensData = state.novoOrcamentoItens.map(item => ({
            orcamento_id: finalOrcamentoId,
            servico_id: item.servico_id,
            quantidade: item.quantidade,
            valor_unitario: item.valor_cobrado
        }));
        
        const { error: itensError } = await supabase
            .from('orcamento_itens')
            .insert(itensData);
        
        if (itensError) throw itensError;
        
        triggerConfetti();
        resetOrcamentoForm();
        showTab('historico');
        
    } catch (error) {
        console.error('Erro ao salvar orçamento:', error);
        showNotification('Erro ao salvar orçamento: ' + error.message, 'error');
    }
}

function resetOrcamentoForm() {
    $('#orcamento-form').reset();
    $('#orcamento-id-to-edit').value = '';
    $('#orcamento-form-title').innerHTML = '<i class="fas fa-file-invoice"></i> Novo Orçamento';
    $('#cancelar-edicao-orcamento').style.display = 'none';
    
    state.novoOrcamentoItens = [];
    renderNovoOrcamentoItens();
    updateOrcamentoTotal();
    
    // Remove seleção de formas de pagamento
    $$('#payment-options .payment-option').forEach(btn => btn.classList.remove('active'));
    $('#payment-options-validation').style.display = 'none';
}

// ============================================================================
// HISTÓRICO - GESTÃO DE ORÇAMENTOS
// ============================================================================

function renderOrcamentos() {
    const searchTerm = $('#search-historico').value.toLowerCase();
    const statusFilter = $('#filter-status').value;
    const startDate = $('#filter-start-date').value;
    const endDate = $('#filter-end-date').value;
    
    // Filtra orçamentos
    let filteredOrcamentos = state.orcamentos.filter(orcamento => {
        const matchesSearch = 
            orcamento.clientes?.nome.toLowerCase().includes(searchTerm) ||
            orcamento.clientes?.placa.toLowerCase().includes(searchTerm) ||
            formatDate(orcamento.created_at).includes(searchTerm) ||
            orcamento.status.toLowerCase().includes(searchTerm) ||
            formatCurrency(orcamento.valor_total).includes(searchTerm);
        
        const matchesStatus = !statusFilter || orcamento.status === statusFilter;
        
        const matchesDateRange = (!startDate || orcamento.created_at >= startDate) &&
                                (!endDate || orcamento.created_at <= endDate);
        
        return matchesSearch && matchesStatus && matchesDateRange;
    });
    
    const orcamentosList = $('#historico-lista');
    
    if (filteredOrcamentos.length === 0) {
        renderEmptyState(orcamentosList, 'Nenhum orçamento encontrado', 'Crie o primeiro orçamento para começar');
        return;
    }
    
    orcamentosList.innerHTML = filteredOrcamentos.map(orcamento => `
        <li data-id="${orcamento.id}" ${state.orcamentoSelecionado?.id === orcamento.id ? 'class="selected"' : ''}>
            <div>
                <strong>${orcamento.clientes?.nome || 'Cliente não encontrado'}</strong>
                <small>${orcamento.clientes?.carro || 'Carro não informado'} - ${orcamento.clientes?.placa || 'Placa não informada'}</small>
                <small>${formatDate(orcamento.created_at)}</small>
            </div>
            <div class="item-actions">
                <span class="status-indicator status-${orcamento.status.toLowerCase()}">${orcamento.status}</span>
                <span style="font-weight: bold; color: var(--accent-green);">${formatCurrency(orcamento.valor_total)}</span>
            </div>
        </li>
    `).join('');
    
    // Adiciona event listeners
    orcamentosList.addEventListener('click', (e) => {
        const orcamentoId = e.currentTarget.dataset.id || e.target.closest('li').dataset.id;
        if (orcamentoId) {
            handleHistoricoClick(orcamentoId);
        }
    });
}

function handleHistoricoClick(id) {
    // Marca como selecionado
    const orcamento = state.orcamentos.find(o => o.id === id);
    if (!orcamento) return;
    
    state.orcamentoSelecionado = orcamento;
    renderOrcamentos();
    displayOrcamentoDetails();
}

function displayOrcamentoDetails() {
    const orcamento = state.orcamentoSelecionado;
    if (!orcamento) return;
    
    // Mostra container de detalhes
    $('#detalhes-orcamento-container').style.display = 'block';
    
    // Gera texto do orçamento
    const orcamentoTexto = generateOrcamentoText(orcamento);
    $('#detalhes-orcamento-texto').textContent = orcamentoTexto;
    
    // Gera texto do recibo
    const reciboTexto = generateReciboText(orcamento);
    $('#detalhes-recibo-texto').textContent = reciboTexto;
    
    // Gerencia visibilidade dos botões baseado no status
    const editBtn = $('#edit-orcamento-btn');
    const approveBtn = $('#approve-orcamento-btn');
    const finalizeBtn = $('#finalize-orcamento-btn');
    const cancelBtn = $('#cancel-orcamento-btn');
    
    // Mostra/esconde botões baseado no status
    switch(orcamento.status) {
        case 'Orçamento':
            editBtn.style.display = 'inline-flex';
            approveBtn.style.display = 'inline-flex';
            finalizeBtn.style.display = 'none';
            cancelBtn.style.display = 'inline-flex';
            break;
        case 'Aprovado':
            editBtn.style.display = 'inline-flex';
            approveBtn.style.display = 'none';
            finalizeBtn.style.display = 'inline-flex';
            cancelBtn.style.display = 'inline-flex';
            break;
        case 'Finalizado':
            editBtn.style.display = 'none';
            approveBtn.style.display = 'none';
            finalizeBtn.style.display = 'none';
            cancelBtn.style.display = 'none';
            break;
        case 'Cancelado':
            editBtn.style.display = 'none';
            approveBtn.style.display = 'none';
            finalizeBtn.style.display = 'none';
            cancelBtn.style.display = 'none';
            break;
    }
}

function switchDetailView(view) {
    const orcamentoBtn = $('#btn-view-orcamento');
    const reciboBtn = $('#btn-view-recibo');
    const orcamentoBloco = $('#detalhe-orcamento-bloco');
    const reciboBloco = $('#detalhe-recibo-bloco');
    
    if (view === 'orcamento') {
        orcamentoBtn.classList.add('active');
        reciboBtn.classList.remove('active');
        orcamentoBloco.style.display = 'block';
        reciboBloco.style.display = 'none';
    } else {
        orcamentoBtn.classList.remove('active');
        reciboBtn.classList.add('active');
        orcamentoBloco.style.display = 'none';
        reciboBloco.style.display = 'block';
    }
}

function generateOrcamentoText(orcamento) {
    const cliente = orcamento.clientes;
    const itens = orcamento.orcamento_itens || [];
    
    let texto = `
═══════════════════════════════════════════════════════════
                    ORÇAMENTO DETALHADO
═══════════════════════════════════════════════════════════

🏢 ESTABELECIMENTO:
${ESTABELECIMENTO.nome}
CNPJ: ${ESTABELECIMENTO.cnpj}
📍 ${ESTABELECIMENTO.endereco}
📞 ${formatPhone(ESTABELECIMENTO.telefone)}

─────────────────────────────────────────────────────────

👤 CLIENTE:
Nome: ${cliente?.nome || 'Não informado'}
Telefone: ${formatPhone(cliente?.telefone || '')}
Veículo: ${cliente?.carro || 'Não informado'}
Placa: ${cliente?.placa || 'Não informada'}

─────────────────────────────────────────────────────────

📋 SERVIÇOS SOLICITADOS:
`;

    itens.forEach((item, index) => {
        const subtotal = item.valor_unitario * item.quantidade;
        texto += `
${index + 1}. ${item.servicos?.descricao || 'Serviço não encontrado'}
   Quantidade: ${item.quantidade}
   Valor unitário: ${formatCurrency(item.valor_unitario)}
   Subtotal: ${formatCurrency(subtotal)}
`;
    });
    
    const subtotalGeral = itens.reduce((total, item) => total + (item.valor_unitario * item.quantidade), 0);
    const desconto = orcamento.desconto || 0;
    const total = subtotalGeral - desconto;
    
    texto += `
─────────────────────────────────────────────────────────

💰 VALORES:
Subtotal: ${formatCurrency(subtotalGeral)}
Desconto: ${formatCurrency(desconto)}
TOTAL: ${formatCurrency(total)}

─────────────────────────────────────────────────────────

💳 FORMAS DE PAGAMENTO ACEITAS:
${orcamento.formas_pagamento?.join(', ') || 'Não informado'}

─────────────────────────────────────────────────────────

📅 Data do Orçamento: ${formatDate(orcamento.created_at)}
Status: ${orcamento.status}

${ESTABELECIMENTO.agradecimento}

═══════════════════════════════════════════════════════════
`;
    
    return texto.trim();
}

function generateReciboText(orcamento) {
    const cliente = orcamento.clientes;
    const itens = orcamento.orcamento_itens || [];
    
    let texto = `
═══════════════════════════════════════════════════════════
                     RECIBO NÃO FISCAL
═══════════════════════════════════════════════════════════

🏢 PRESTADOR DE SERVIÇO:
${ESTABELECIMENTO.nome}
CNPJ: ${ESTABELECIMENTO.cnpj}
📍 ${ESTABELECIMENTO.endereco}
📞 ${formatPhone(ESTABELECIMENTO.telefone)}

─────────────────────────────────────────────────────────

👤 CLIENTE:
Nome: ${cliente?.nome || 'Não informado'}
Telefone: ${formatPhone(cliente?.telefone || '')}
Veículo: ${cliente?.carro || 'Não informado'}
Placa: ${cliente?.placa || 'Não informada'}

─────────────────────────────────────────────────────────

🔧 SERVIÇOS EXECUTADOS:
`;

    itens.forEach((item, index) => {
        const subtotal = item.valor_unitario * item.quantidade;
        texto += `
${index + 1}. ${item.servicos?.descricao || 'Serviço não encontrado'}
   Quantidade: ${item.quantidade}
   Valor unitário: ${formatCurrency(item.valor_unitario)}
   Subtotal: ${formatCurrency(subtotal)}
`;
    });
    
    const subtotalGeral = itens.reduce((total, item) => total + (item.valor_unitario * item.quantidade), 0);
    const desconto = orcamento.desconto || 0;
    const total = subtotalGeral - desconto;
    
    texto += `
─────────────────────────────────────────────────────────

💰 RESUMO FINANCEIRO:
Subtotal dos Serviços: ${formatCurrency(subtotalGeral)}
Desconto Aplicado: ${formatCurrency(desconto)}
VALOR TOTAL PAGO: ${formatCurrency(total)}

─────────────────────────────────────────────────────────

💳 FORMA DE PAGAMENTO:
${orcamento.formas_pagamento?.join(', ') || 'Não informado'}

─────────────────────────────────────────────────────────

📅 Data do Serviço: ${formatDate(orcamento.updated_at)}
Recibo #${orcamento.id}

${ESTABELECIMENTO.agradecimento}

═══════════════════════════════════════════════════════════
`;
    
    return texto.trim();
}

function populateOrcamentoFormForEdit(orcamento) {
    // Preenche dados básicos
    $('#orcamento-id-to-edit').value = orcamento.id;
    $('#orcamento-cliente').value = orcamento.cliente_id;
    $('#orcamento-desconto').value = orcamento.desconto || 0;
    
    // Preenche formas de pagamento
    $$('#payment-options .payment-option').forEach(btn => {
        btn.classList.remove('active');
        if (orcamento.formas_pagamento?.includes(btn.dataset.value)) {
            btn.classList.add('active');
        }
    });
    
    // Preenche itens
    state.novoOrcamentoItens = orcamento.orcamento_itens.map(item => ({
        servico_id: item.servico_id,
        descricao_servico: item.servicos.descricao,
        valor_cobrado: item.valor_unitario,
        quantidade: item.quantidade
    }));
    
    // Atualiza interface
    renderNovoOrcamentoItens();
    updateOrcamentoTotal();
    
    // Altera título
    $('#orcamento-form-title').innerHTML = '<i class="fas fa-edit"></i> Editar Orçamento';
    $('#cancelar-edicao-orcamento').style.display = 'inline-flex';
}

function handleEditOrcamento() {
    if (!state.orcamentoSelecionado) return;
    
    populateOrcamentoFormForEdit(state.orcamentoSelecionado);
    showTab('novo-orcamento');
}

async function updateStatusOrcamento(newStatus) {
    if (!state.orcamentoSelecionado) return;
    
    const statusMessages = {
        'Aprovado': 'Tem certeza que deseja aprovar este orçamento?',
        'Finalizado': 'Tem certeza que deseja finalizar este orçamento?',
        'Cancelado': 'Tem certeza que deseja cancelar este orçamento?'
    };
    
    showConfirmModal(
        `${newStatus} Orçamento`,
        statusMessages[newStatus],
        async () => {
            try {
                const { error } = await supabase
                    .from('orcamentos')
                    .update({ 
                        status: newStatus,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', state.orcamentoSelecionado.id);
                
                if (error) throw error;
                
                showNotification(`Orçamento ${newStatus.toLowerCase()} com sucesso!`, 'success');
                triggerConfetti();
                
                // Atualiza estado local
                state.orcamentoSelecionado.status = newStatus;
                displayOrcamentoDetails();
                
            } catch (error) {
                console.error('Erro ao atualizar status:', error);
                showNotification('Erro ao atualizar status: ' + error.message, 'error');
            }
        }
    );
}

async function handleDeleteOrcamento() {
    if (!state.orcamentoSelecionado) return;
    
    showConfirmModal(
        'Excluir Orçamento',
        'Tem certeza que deseja excluir este orçamento? Esta ação não pode ser desfeita.',
        async () => {
            try {
                const { error } = await supabase
                    .from('orcamentos')
                    .delete()
                    .eq('id', state.orcamentoSelecionado.id);
                
                if (error) throw error;
                
                showNotification('Orçamento excluído com sucesso!', 'success');
                triggerConfetti();
                
                // Esconde detalhes
                $('#detalhes-orcamento-container').style.display = 'none';
                state.orcamentoSelecionado = null;
                
            } catch (error) {
                console.error('Erro ao excluir orçamento:', error);
                showNotification('Erro ao excluir orçamento: ' + error.message, 'error');
            }
        }
    );
}

// Funções para copiar, WhatsApp e PDF
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showNotification('Texto copiado para a área de transferência!', 'success');
    }).catch(() => {
        showNotification('Erro ao copiar texto', 'error');
    });
}

function sendToWhatsApp(text, phone) {
    const cleanedPhone = cleanPhone(phone);
    const encodedText = encodeURIComponent(text);
    const url = `https://wa.me/${cleanedPhone}?text=${encodedText}`;
    window.open(url, '_blank');
}

function generatePDF(content, filename) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Configura fonte
    doc.setFont('helvetica');
    doc.setFontSize(8);
    
    // Adiciona conteúdo
    const lines = content.split('\n');
    let y = 20;
    
    lines.forEach(line => {
        if (y > 280) {
            doc.addPage();
            y = 20;
        }
        doc.text(line, 10, y);
        y += 4;
    });
    
    // Salva PDF
    doc.save(`${filename}.pdf`);
    showNotification('PDF gerado com sucesso!', 'success');
}

// ============================================================================
// CRM - GESTÃO DE RELACIONAMENTO
// ============================================================================

function renderCrmMetrics() {
    const totalInteractions = state.crmInteractions.length;
    const activeClients = state.clientes.filter(cliente => {
        const ultimoOrcamento = state.orcamentos
            .filter(o => o.cliente_id === cliente.id)
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];
        
        if (!ultimoOrcamento) return false;
        
        const diasSemOrcamento = Math.floor((new Date() - new Date(ultimoOrcamento.created_at)) / (1000 * 60 * 60 * 24));
        return diasSemOrcamento <= 30;
    }).length;
    
    const pendingFollowups = state.clientes.filter(cliente => {
        const ultimoOrcamento = state.orcamentos
            .filter(o => o.cliente_id === cliente.id && o.status === 'Finalizado')
            .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))[0];
        
        if (!ultimoOrcamento) return false;
        
        const diasSemContato = Math.floor((new Date() - new Date(ultimoOrcamento.updated_at)) / (1000 * 60 * 60 * 24));
        return diasSemContato >= 7 && diasSemContato <= 30;
    }).length;
    
    $('#crm-total-interactions').textContent = totalInteractions;
    $('#crm-active-clients').textContent = activeClients;
    $('#crm-pending-followups').textContent = pendingFollowups;
}

function renderCrmInteractions() {
    const searchTerm = $('#search-crm-interactions').value.toLowerCase();
    
    let filteredInteractions = state.crmInteractions.filter(interaction => 
        interaction.clientes?.nome.toLowerCase().includes(searchTerm) ||
        interaction.type.toLowerCase().includes(searchTerm) ||
        interaction.notes.toLowerCase().includes(searchTerm)
    );
    
    const interactionsList = $('#crm-interaction-list');
    
    if (filteredInteractions.length === 0) {
        renderEmptyState(interactionsList, 'Nenhuma interação encontrada', 'Registre a primeira interação para começar');
        return;
    }
    
    interactionsList.innerHTML = filteredInteractions.map(interaction => `
        <li>
            <div>
                <strong>${interaction.clientes?.nome || 'Cliente não encontrado'}</strong>
                <small>${interaction.type} - ${formatDate(interaction.interaction_date)}</small>
                <small>${interaction.notes || 'Sem observações'}</small>
            </div>
            <div class="item-actions">
                <span class="status-indicator status-info">${interaction.type}</span>
            </div>
        </li>
    `).join('');
}

function renderInteractionClientOptions() {
    const clientSelect = $('#interaction-client');
    clientSelect.innerHTML = '<option value="">Selecione um cliente</option>';
    
    state.clientes.forEach(cliente => {
        const option = document.createElement('option');
        option.value = cliente.id;
        option.textContent = `${cliente.nome} - ${cliente.carro}`;
        clientSelect.appendChild(option);
    });
}

async function handleCrmInteractionSubmit(e) {
    e.preventDefault();
    
    const clienteId = $('#interaction-client').value;
    const type = $('#interaction-type').value;
    const notes = $('#interaction-notes').value.trim();
    const interactionDate = $('#interaction-date').value;
    
    if (!clienteId) {
        showNotification('Selecione um cliente', 'error');
        return;
    }
    
    if (!type) {
        showNotification('Selecione o tipo de interação', 'error');
        return;
    }
    
    if (!interactionDate) {
        showNotification('Selecione a data', 'error');
        return;
    }
    
    try {
        const { error } = await supabase
            .from('crm_interactions')
            .insert([{
                cliente_id: clienteId,
                type,
                notes,
                interaction_date: interactionDate,
                created_at: new Date().toISOString()
            }]);
        
        if (error) throw error;
        
        showNotification('Interação registrada com sucesso!', 'success');
        triggerConfetti();
        
        // Limpa formulário
        $('#crm-interaction-form').reset();
        $('#interaction-date').value = new Date().toISOString().split('T')[0];
        
    } catch (error) {
        console.error('Erro ao registrar interação:', error);
        showNotification('Erro ao registrar interação: ' + error.message, 'error');
    }
}

function renderSuggestedFollowups() {
    const followupsList = $('#suggested-followups-list');
    
    // Busca clientes que finalizaram orçamentos há 7-30 dias
    const followupClients = state.clientes.filter(cliente => {
        const ultimoOrcamento = state.orcamentos
            .filter(o => o.cliente_id === cliente.id && o.status === 'Finalizado')
            .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))[0];
        
        if (!ultimoOrcamento) return false;
        
        const diasSemContato = Math.floor((new Date() - new Date(ultimoOrcamento.updated_at)) / (1000 * 60 * 60 * 24));
        return diasSemContato >= 7 && diasSemContato <= 30;
    });
    
    if (followupClients.length === 0) {
        renderEmptyState(followupsList, 'Nenhum follow-up pendente', 'Ótimo! Todos os clientes foram contactados recentemente');
        return;
    }
    
    followupsList.innerHTML = followupClients.map(cliente => {
        const ultimoOrcamento = state.orcamentos
            .filter(o => o.cliente_id === cliente.id && o.status === 'Finalizado')
            .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))[0];
        
        const diasSemContato = Math.floor((new Date() - new Date(ultimoOrcamento.updated_at)) / (1000 * 60 * 60 * 24));
        
        return `
            <li>
                <div>
                    <strong>${cliente.nome}</strong>
                    <small>${cliente.carro} - ${cliente.placa}</small>
                    <small>Último serviço: ${formatDate(ultimoOrcamento.updated_at)} (${diasSemContato} dias atrás)</small>
                </div>
                <div class="item-actions">
                    <button class="btn btn-sm btn-success contact-followup-btn" data-id="${cliente.id}">
                        <i class="fas fa-phone"></i> Contatar
                    </button>
                </div>
            </li>
        `;
    }).join('');
    
    // Adiciona event listeners
    followupsList.addEventListener('click', (e) => {
        if (e.target.classList.contains('contact-followup-btn') || e.target.parentElement.classList.contains('contact-followup-btn')) {
            const clienteId = e.target.dataset.id || e.target.parentElement.dataset.id;
            handleContactFollowup(clienteId);
        }
    });
}

function handleContactFollowup(clienteId) {
    const cliente = state.clientes.find(c => c.id === clienteId);
    if (!cliente) return;
    
    // Preenche formulário de nova interação
    $('#interaction-client').value = clienteId;
    $('#interaction-type').value = 'WhatsApp';
    $('#interaction-date').value = new Date().toISOString().split('T')[0];
    
    // Gera mensagem de follow-up
    const template = $('#template-followup').value;
    const mensagem = template
        .replace(/\[NOME\]/g, cliente.nome)
        .replace(/\[CARRO\]/g, cliente.carro);
    
    $('#interaction-notes').value = mensagem;
    
    // Envia para WhatsApp
    sendToWhatsApp(mensagem, cliente.telefone);
    
    showNotification('Follow-up iniciado! Registre a interação após o contato.', 'success');
}

function renderInactiveClients() {
    const inactivityDays = parseInt($('#inactivity-filter').value);
    const inactiveClientsList = $('#inactive-clients-list');
    
    // Busca clientes inativos
    const inactiveClients = state.clientes.filter(cliente => {
        const ultimoOrcamento = state.orcamentos
            .filter(o => o.cliente_id === cliente.id)
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];
        
        if (!ultimoOrcamento) return true; // Cliente sem orçamentos
        
        const diasSemOrcamento = Math.floor((new Date() - new Date(ultimoOrcamento.created_at)) / (1000 * 60 * 60 * 24));
        return diasSemOrcamento >= inactivityDays;
    });
    
    if (inactiveClients.length === 0) {
        renderEmptyState(inactiveClientsList, 'Nenhum cliente inativo', 'Todos os clientes estão ativos!');
        return;
    }
    
    inactiveClientsList.innerHTML = inactiveClients.map(cliente => {
        const ultimoOrcamento = state.orcamentos
            .filter(o => o.cliente_id === cliente.id)
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];
        
        const diasSemOrcamento = ultimoOrcamento ? 
            Math.floor((new Date() - new Date(ultimoOrcamento.created_at)) / (1000 * 60 * 60 * 24)) : 
            'Nunca';
        
        return `
            <li>
                <div>
                    <strong>${cliente.nome}</strong>
                    <small>${cliente.carro} - ${cliente.placa}</small>
                    <small>${ultimoOrcamento ? `Último orçamento: ${diasSemOrcamento} dias atrás` : 'Nunca fez orçamento'}</small>
                </div>
                <div class="item-actions">
                    <input type="checkbox" class="inactive-client-checkbox" data-id="${cliente.id}">
                    <label>Selecionar</label>
                </div>
            </li>
        `;
    }).join('');
}

function handleBulkContact() {
    const selectedClients = Array.from($$('.inactive-client-checkbox:checked')).map(cb => cb.dataset.id);
    
    if (selectedClients.length === 0) {
        showNotification('Selecione pelo menos um cliente', 'warning');
        return;
    }
    
    // Preenche modal de disparo
    state.selectedDispatchClients = new Set(selectedClients);
    renderDispatchClientList();
    $('#dispatch-view-modal').classList.add('active');
}

function renderDispatchClientList() {
    const clientList = $('#dispatch-client-list');
    
    clientList.innerHTML = state.clientes
        .filter(cliente => state.selectedDispatchClients.has(cliente.id))
        .map(cliente => `
            <li data-id="${cliente.id}" class="active">
                <strong>${cliente.nome}</strong>
                <small>${cliente.carro} - ${formatPhone(cliente.telefone)}</small>
            </li>
        `).join('');
    
    // Mostra compositor
    $('#composer-placeholder').classList.add('hidden');
    $('#composer-content').classList.remove('hidden');
}

function handleTemplateSelect() {
    const templateType = $('#composer-template-select').value;
    if (!templateType) return;
    
    const template = $(`#template-${templateType}`).value;
    $('#composer-message').value = template;
}

function handleSendWhatsApp() {
    const message = $('#composer-message').value.trim();
    if (!message) {
        showNotification('Digite uma mensagem', 'error');
        return;
    }
    
    state.selectedDispatchClients.forEach(clienteId => {
        const cliente = state.clientes.find(c => c.id === clienteId);
        if (cliente) {
            const personalizedMessage = message
                .replace(/\[NOME\]/g, cliente.nome)
                .replace(/\[CARRO\]/g, cliente.carro);
            
            sendToWhatsApp(personalizedMessage, cliente.telefone);
        }
    });
    
    showNotification(`Mensagem enviada para ${state.selectedDispatchClients.size} cliente(s)!`, 'success');
    triggerConfetti();
    
    // Fecha modal
    $('#dispatch-view-modal').classList.remove('active');
    state.selectedDispatchClients.clear();
}

// ============================================================================
// DESPESAS - GESTÃO DE DESPESAS
// ============================================================================

function renderDespesas() {
    const monthFilter = $('#filter-despesas-mes').value;
    
    let filteredDespesas = state.despesas;
    
    if (monthFilter) {
        filteredDespesas = state.despesas.filter(despesa => {
            const despesaMonth = despesa.data.substring(0, 7); // YYYY-MM
            return despesaMonth === monthFilter;
        });
    }
    
    const despesasList = $('#despesas-lista');
    
    if (filteredDespesas.length === 0) {
        renderEmptyState(despesasList, 'Nenhuma despesa encontrada', 'Registre a primeira despesa para começar');
        return;
    }
    
    despesasList.innerHTML = filteredDespesas.map(despesa => `
        <li data-id="${despesa.id}" ${state.editandoDespesaId === despesa.id ? 'class="editing"' : ''}>
            <div>
                <strong data-field="descricao">${despesa.descricao}</strong>
                <small>${despesa.categoria} - ${formatDate(despesa.data)}</small>
                <small>${formatCurrency(despesa.valor)}</small>
                <input type="text" class="inline-edit-input edit-mode-input" value="${despesa.descricao}" data-field="descricao">
                <input type="number" class="inline-edit-input edit-mode-input" value="${despesa.valor}" data-field="valor" step="0.01">
            </div>
            <div class="item-actions">
                <button class="btn btn-sm btn-secondary edit-despesa-btn" data-id="${despesa.id}">
                    <i class="fas fa-edit"></i> Editar
                </button>
                <button class="btn btn-sm btn-danger delete-despesa-btn" data-id="${despesa.id}">
                    <i class="fas fa-trash"></i> Excluir
                </button>
            </div>
        </li>
    `).join('');
    
    // Adiciona event listeners
    despesasList.addEventListener('click', (e) => {
        const despesaId = e.target.dataset.id || e.target.parentElement.dataset.id;
        
        if (e.target.classList.contains('edit-despesa-btn') || e.target.parentElement.classList.contains('edit-despesa-btn')) {
            handleEditDespesa(despesaId);
        } else if (e.target.classList.contains('delete-despesa-btn') || e.target.parentElement.classList.contains('delete-despesa-btn')) {
            handleDeleteDespesa(despesaId);
        }
    });
}

function renderDespesasMetrics() {
    const hoje = new Date().toISOString().split('T')[0];
    const inicioMes = new Date();
    inicioMes.setDate(1);
    const inicioMesStr = inicioMes.toISOString().split('T')[0];
    
    const totalMes = state.despesas
        .filter(d => d.data >= inicioMesStr)
        .reduce((total, d) => total + d.valor, 0);
    
    const totalHoje = state.despesas
        .filter(d => d.data === hoje)
        .reduce((total, d) => total + d.valor, 0);
    
    const diasNoMes = new Date().getDate();
    const mediaDiaria = totalMes / diasNoMes;
    
    $('#despesas-total-mes').textContent = formatCurrency(totalMes);
    $('#despesas-hoje').textContent = formatCurrency(totalHoje);
    $('#despesas-media-diaria').textContent = formatCurrency(mediaDiaria);
}

function renderDespesasChart() {
    const canvas = $('#despesas-chart');
    const ctx = canvas.getContext('2d');
    
    // Destrói chart existente
    if (state.despesasChart) {
        state.despesasChart.destroy();
    }
    
    // Agrupa despesas por categoria
    const categorias = {};
    state.despesas.forEach(despesa => {
        if (!categorias[despesa.categoria]) {
            categorias[despesa.categoria] = 0;
        }
        categorias[despesa.categoria] += despesa.valor;
    });
    
    const labels = Object.keys(categorias);
    const data = Object.values(categorias);
    const colors = ['#1FB8CD', '#FFC185', '#B4413C', '#ECEBD5', '#5D878F'];
    
    // Cria novo chart
    state.despesasChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: colors.slice(0, labels.length),
                borderWidth: 2,
                borderColor: '#2d3748'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: '#a0aec0',
                        padding: 20
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.label}: ${formatCurrency(context.parsed)}`;
                        }
                    }
                }
            }
        }
    });
}

async function handleDespesaSubmit(e) {
    e.preventDefault();
    
    const id = $('#despesa-id').value;
    const descricao = $('#despesa-descricao').value.trim();
    const valor = parseFloat($('#despesa-valor').value);
    const categoria = $('#despesa-categoria').value;
    const data = $('#despesa-data').value;
    
    // Validações
    if (!descricao) {
        showNotification('Descrição é obrigatória', 'error');
        return;
    }
    
    if (!valor || valor <= 0) {
        showNotification('Valor deve ser maior que zero', 'error');
        return;
    }
    
    if (!categoria) {
        showNotification('Selecione uma categoria', 'error');
        return;
    }
    
    if (!data) {
        showNotification('Data é obrigatória', 'error');
        return;
    }
    
    try {
        const despesaData = { descricao, valor, categoria, data };
        
        if (id) {
            // Atualizar despesa existente
            const { error } = await supabase
                .from('despesas')
                .update(despesaData)
                .eq('id', id);
            
            if (error) throw error;
            
            showNotification('Despesa atualizada com sucesso!', 'success');
            triggerConfetti();
        } else {
            // Criar nova despesa
            const { error } = await supabase
                .from('despesas')
                .insert([despesaData]);
            
            if (error) throw error;
            
            showNotification('Despesa registrada com sucesso!', 'success');
            triggerConfetti();
        }
        
        resetDespesaForm();
        
    } catch (error) {
        console.error('Erro ao salvar despesa:', error);
        showNotification('Erro ao salvar despesa: ' + error.message, 'error');
    }
}

function handleEditDespesa(id) {
    const despesa = state.despesas.find(d => d.id === id);
    if (!despesa) return;
    
    $('#despesa-id').value = despesa.id;
    $('#despesa-descricao').value = despesa.descricao;
    $('#despesa-valor').value = despesa.valor;
    $('#despesa-categoria').value = despesa.categoria;
    $('#despesa-data').value = despesa.data;
    
    $('#despesa-form-title').innerHTML = '<i class="fas fa-edit"></i> Editar Despesa';
    $('#cancelar-edicao-despesa').style.display = 'inline-flex';
    
    state.editandoDespesaId = id;
    renderDespesas();
}

function handleDeleteDespesa(id) {
    showConfirmModal(
        'Excluir Despesa',
        'Tem certeza que deseja excluir esta despesa? Esta ação não pode ser desfeita.',
        async () => {
            try {
                const { error } = await supabase
                    .from('despesas')
                    .delete()
                    .eq('id', id);
                
                if (error) throw error;
                
                showNotification('Despesa excluída com sucesso!', 'success');
                triggerConfetti();
                resetDespesaForm();
                
            } catch (error) {
                console.error('Erro ao excluir despesa:', error);
                showNotification('Erro ao excluir despesa: ' + error.message, 'error');
            }
        }
    );
}

function resetDespesaForm() {
    $('#despesa-form').reset();
    $('#despesa-id').value = '';
    $('#despesa-form-title').innerHTML = '<i class="fas fa-plus"></i> Nova Despesa';
    $('#cancelar-edicao-despesa').style.display = 'none';
    $('#despesa-data').value = new Date().toISOString().split('T')[0];
    state.editandoDespesaId = null;
    renderDespesas();
}

// ============================================================================
// INICIALIZAÇÃO DA APLICAÇÃO
// ============================================================================

document.addEventListener('DOMContentLoaded', async () => {
    // Configurações iniciais
    updateNetworkStatus();
    
    // Define data atual nos campos de data
    $('#interaction-date').value = new Date().toISOString().split('T')[0];
    $('#despesa-data').value = new Date().toISOString().split('T')[0];
    
    // Event listeners para navegação
    $$('.nav-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const tabId = e.target.dataset.tab;
            showTab(tabId);
        });
    });
    
    // Event listeners para dashboard
    $$('.stat-card').forEach(card => {
        card.addEventListener('click', (e) => {
            const filter = e.currentTarget.dataset.filter;
            if (filter === 'clientes') {
                showTab('clientes');
            } else if (filter === 'pendentes') {
                showTab('historico', { status: 'Orçamento' });
            } else if (filter === 'aprovados') {
                showTab('historico', { status: 'Aprovado' });
            } else if (filter === 'finalizados') {
                showTab('historico', { status: 'Finalizado' });
            }
        });
    });
    
    // Event listeners para formulários
    $('#cliente-form').addEventListener('submit', handleClienteSubmit);
    $('#servico-form').addEventListener('submit', handleServicoSubmit);
    $('#orcamento-form').addEventListener('submit', handleOrcamentoSubmit);
    $('#crm-interaction-form').addEventListener('submit', handleCrmInteractionSubmit);
    $('#despesa-form').addEventListener('submit', handleDespesaSubmit);
    
    // Event listeners para botões de cancelar edição
    $('#cancelar-edicao-cliente').addEventListener('click', resetClienteForm);
    $('#cancelar-edicao-servico').addEventListener('click', resetServicoForm);
    $('#cancelar-edicao-orcamento').addEventListener('click', resetOrcamentoForm);
    $('#cancelar-edicao-despesa').addEventListener('click', resetDespesaForm);
    
    // Event listeners para buscas
    $('#search-cliente').addEventListener('input', debounce(renderClientes, 300));
    $('#search-servico').addEventListener('input', debounce(renderServicos, 300));
    $('#search-historico').addEventListener('input', debounce(renderOrcamentos, 300));
    $('#search-crm-interactions').addEventListener('input', debounce(renderCrmInteractions, 300));
    
    // Event listeners para ordenação
    $('#sort-clientes').addEventListener('change', renderClientes);
    $('#sort-servicos').addEventListener('change', renderServicos);
    
    // Event listeners para filtros
    $('#filter-status').addEventListener('change', renderOrcamentos);
    $('#filter-start-date').addEventListener('change', renderOrcamentos);
    $('#filter-end-date').addEventListener('change', renderOrcamentos);
    $('#filter-despesas-mes').addEventListener('change', renderDespesas);
    $('#inactivity-filter').addEventListener('change', renderInactiveClients);
    
    // Event listeners para botões de limpar filtros
    $('#clear-filters-btn').addEventListener('click', () => {
        $('#filter-status').value = '';
        $('#filter-start-date').value = '';
        $('#filter-end-date').value = '';
        renderOrcamentos();
    });
    
    // Event listeners para orçamento
    $('#add-servico-btn').addEventListener('click', handleAddServicoToOrcamento);
    $('#orcamento-desconto').addEventListener('input', updateOrcamentoTotal);
    
    // Event listeners para formas de pagamento
    $('#payment-options').addEventListener('click', (e) => {
        if (e.target.classList.contains('payment-option')) {
            e.target.classList.toggle('active');
        }
    });
    
    // Event listeners para detalhes do orçamento
    $('#btn-view-orcamento').addEventListener('click', () => switchDetailView('orcamento'));
    $('#btn-view-recibo').addEventListener('click', () => switchDetailView('recibo'));
    
    // Event listeners para ações dos detalhes
    $('#copy-orcamento-btn').addEventListener('click', () => {
        const texto = $('#detalhes-orcamento-texto').textContent;
        copyToClipboard(texto);
    });
    
    $('#copy-recibo-btn').addEventListener('click', () => {
        const texto = $('#detalhes-recibo-texto').textContent;
        copyToClipboard(texto);
    });
    
    $('#whatsapp-orcamento-btn').addEventListener('click', () => {
        const texto = $('#detalhes-orcamento-texto').textContent;
        const phone = state.orcamentoSelecionado?.clientes?.telefone;
        if (phone) {
            sendToWhatsApp(texto, phone);
        }
    });
    
    $('#whatsapp-recibo-btn').addEventListener('click', () => {
        const texto = $('#detalhes-recibo-texto').textContent;
        const phone = state.orcamentoSelecionado?.clientes?.telefone;
        if (phone) {
            sendToWhatsApp(texto, phone);
        }
    });
    
    $('#pdf-orcamento-btn').addEventListener('click', () => {
        const texto = $('#detalhes-orcamento-texto').textContent;
        generatePDF(texto, `orcamento_${state.orcamentoSelecionado?.id}`);
    });
    
    $('#pdf-recibo-btn').addEventListener('click', () => {
        const texto = $('#detalhes-recibo-texto').textContent;
        generatePDF(texto, `recibo_${state.orcamentoSelecionado?.id}`);
    });
    
    // Event listeners para ações de status
    $('#edit-orcamento-btn').addEventListener('click', handleEditOrcamento);
    $('#approve-orcamento-btn').addEventListener('click', () => updateStatusOrcamento('Aprovado'));
    $('#finalize-orcamento-btn').addEventListener('click', () => updateStatusOrcamento('Finalizado'));
    $('#cancel-orcamento-btn').addEventListener('click', () => updateStatusOrcamento('Cancelado'));
    $('#delete-orcamento-btn').addEventListener('click', handleDeleteOrcamento);
    
    // Event listeners para detalhes do cliente
    $('#close-details-btn').addEventListener('click', () => {
        $('#client-details-panel').style.display = 'none';
    });
    
    // Event listeners para CRM
    $('#bulk-contact-btn').addEventListener('click', handleBulkContact);
    $('#composer-template-select').addEventListener('change', handleTemplateSelect);
    $('#send-whatsapp-btn').addEventListener('click', handleSendWhatsApp);
    
    // Event listeners para modal de disparo
    $('#close-dispatch-modal').addEventListener('click', () => {
        $('#dispatch-view-modal').classList.remove('active');
    });
    
    // Event listeners para exportação CSV
    $('#export-clientes-csv').addEventListener('click', () => {
        const data = state.clientes.map(c => ({
            Nome: c.nome,
            Telefone: c.telefone,
            Carro: c.carro,
            Placa: c.placa
        }));
        exportToCsv(data, 'clientes');
    });
    
    $('#export-servicos-csv').addEventListener('click', () => {
        const data = state.servicos.map(s => ({
            Descrição: s.descricao,
            Valor: s.valor
        }));
        exportToCsv(data, 'servicos');
    });
    
    $('#export-despesas-csv').addEventListener('click', () => {
        const data = state.despesas.map(d => ({
            Descrição: d.descricao,
            Valor: d.valor,
            Categoria: d.categoria,
            Data: d.data
        }));
        exportToCsv(data, 'despesas');
    });
    
    // Event listeners para validação de formulários
    $$('input[required]').forEach(input => {
        input.addEventListener('input', () => handleValidationIcon(input));
        input.addEventListener('blur', () => handleValidationIcon(input));
    });
    
    // Event listener para sincronização
    $('#sync-btn').addEventListener('click', () => fetchAllData(true));
    
    // Event listener para voltar ao topo
    const backToTopBtn = $('#back-to-top-btn');
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            backToTopBtn.classList.add('show');
        } else {
            backToTopBtn.classList.remove('show');
        }
    });
    
    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    
    // Inicialização
    try {
        showNotification('Inicializando aplicação...', 'info');
        await setupSupabaseListeners();
        await fetchAllData(true);
        showNotification('Aplicação inicializada com sucesso!', 'success');
    } catch (error) {
        console.error('Erro na inicialização:', error);
        showNotification('Erro ao inicializar aplicação: ' + error.message, 'error');
    }
});

// ============================================================================
// FUNÇÕES GLOBAIS PARA ACESSO EXTERNO
// ============================================================================

window.rmEstetica = {
    state,
    showTab,
    fetchAllData,
    showNotification,
    triggerConfetti,
    formatCurrency,
    formatDate,
    formatPhone
};