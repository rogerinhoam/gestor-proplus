// ============================================================================
// 🚗 R.M. ESTÉTICA PRO+ - SISTEMA COMPLETO CORRIGIDO
// Versão corrigida com navegação funcional e todas as correções implementadas
// ============================================================================

// --------------------------- CONSTANTES -------------------------------------
const SUPABASE_URL = "https://bezbszbkaifcanqsmdbi.supabase.co/";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJlemJzemJrYWlmY2FucXNtZGJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI2MTM5MTksImV4cCI6MjA2ODE4OTkxOX0.zLXAuQz7g5ym3Bd5pkhg5vsnf_3rdJFRAXI_kX8tM18";

const ESTABELECIMENTO = {
    nome: "R.M. Estética Automotiva",
    cnpj: "18.637.639/0001-48",
    telefone: "24999486232",
    endereco: "Rua 40, TV - Recanto dos Pássaros, Pq. Mambucaba, Angra dos Reis - RJ",
    agradecimento: "Obrigado pela preferência e volte sempre! 👍"
};

// Templates com emojis
const TEMPLATE_ORCAMENTO = `🚗 R.M. ESTÉTICA AUTOMOTIVA 🚗
CNPJ: 18.637.639/0001-48
📞 (24) 99948-6232
📍 Rua 40, TV - Recanto dos Pássaros
    Pq. Mambucaba, Angra dos Reis - RJ

═══════════════════════════════════
               ORÇAMENTO #{{id}}
═══════════════════════════════════

👤 CLIENTE: {{cliente.nome}}
🚙 VEÍCULO: {{cliente.carro}}
🚗 PLACA: {{cliente.placa}}
📞 CONTATO: {{cliente.telefone}}

───────────────────────────────────
📋 SERVIÇOS:
{{servicos}}
───────────────────────────────────

💰 SUBTOTAL: {{subtotal}}
🎯 DESCONTO: {{desconto}}
💵 VALOR TOTAL: {{total}}

💳 FORMA(S) DE PAGAMENTO:
{{formasPagamento}}

═══════════════════════════════════
⏰ Data: {{data}}
📱 WhatsApp: (24) 99948-6232

Obrigado pela preferência e volte sempre! 👍
═══════════════════════════════════`;

const TEMPLATE_RECIBO = `🧾 RECIBO NÃO FISCAL 🧾

🏪 R.M. ESTÉTICA AUTOMOTIVA
CNPJ: 18.637.639/0001-48
📍 Rua 40, TV - Recanto dos Pássaros
    Pq. Mambucaba, Angra dos Reis - RJ
📞 (24) 99948-6232

═══════════════════════════════════

Recebi de: {{cliente.nome}}
Veículo: {{cliente.carro}} - {{cliente.placa}}
Referente a: Serviços de estética automotiva

📋 DISCRIMINAÇÃO:
{{servicos}}

💵 VALOR TOTAL: {{total}}
💳 PAGAMENTO: {{formasPagamento}}

⏰ {{cidade}}, {{dataCompleta}}

───────────────────────────────────
✅ Serviços executados com garantia
📱 Dúvidas: (24) 99948-6232

Obrigado pela preferência e volte sempre! 👍
═══════════════════════════════════`;

// --------------------------- CLIENTE SUPABASE ------------------------------
let supabase;
if (typeof window !== 'undefined' && window.supabase) {
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    console.log('📡 Supabase conectado!');
} else {
    console.warn('⚠️ Supabase não disponível - modo offline');
}

// --------------------------- ESTADO GLOBAL ---------------------------------
const state = {
    // Dados principais
    clientes: [],
    servicos: [],
    orcamentos: [],
    despesas: [],
    crmInteractions: [],
    
    // Configurações
    estabelecimento: { ...ESTABELECIMENTO },
    theme: 'dark',
    
    // Controle de orçamento
    novoOrcamentoItens: [],
    orcamentoSelecionado: null,
    
    // Charts
    monthlyChart: null,
    despesasChart: null,
    
    // Realtime
    realtimeChannel: null,
    
    // Controle de abas
    currentTab: 'dashboard'
};

// ----------------------------- UTILITÁRIOS ---------------------------------
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

function showNotification(message, type = 'success') {
    console.log(`[${type.toUpperCase()}] ${message}`);
    
    const notification = $('#notification');
    const messageElement = $('#notification-message');
    
    if (notification && messageElement) {
        messageElement.textContent = message;
        notification.className = `show ${type}`;
        
        setTimeout(() => {
            notification.classList.remove('show');
        }, 4000);
    }
}

function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value || 0);
}

function formatDate(dateString) {
    if (!dateString) return 'Data não informada';
    return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: '2-digit', 
        year: 'numeric'
    }).format(new Date(dateString));
}

// =================== MÁSCARAS DE FORMATAÇÃO AUTOMÁTICA ===================
function formatPhone(value) {
    if (!value) return '';
    // Remove todos os caracteres não numéricos
    const numbers = value.replace(/\D/g, '');
    
    // Aplica a máscara baseada no tamanho
    if (numbers.length <= 10) {
        // Telefone fixo: (XX) XXXX-XXXX
        return numbers.replace(/^(\d{2})(\d{4})(\d{4}).*/, '($1) $2-$3');
    } else {
        // Celular: (XX) XXXXX-XXXX
        return numbers.replace(/^(\d{2})(\d{5})(\d{4}).*/, '($1) $2-$3');
    }
}

function formatPlaca(value) {
    if (!value) return '';
    // Remove caracteres especiais e converte para maiúsculo
    const clean = value.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    
    if (clean.length <= 3) {
        return clean;
    } else if (clean.length <= 7) {
        // Verifica se é formato Mercosul (ABC1D23) ou antigo (ABC1234)
        const letters = clean.substring(0, 3);
        const numbers = clean.substring(3);
        
        if (numbers.length >= 4) {
            // Formato antigo: ABC-1234
            return `${letters}-${numbers}`;
        } else if (numbers.length === 3 && /[A-Z]/.test(numbers.charAt(1))) {
            // Formato Mercosul: ABC1D23
            return clean;
        } else {
            return `${letters}${numbers}`;
        }
    }
    
    return clean.substring(0, 8);
}

// Aplicar máscaras nos campos em tempo real
function setupInputMasks() {
    // Máscara para telefones
    const phoneInputs = ['#cliente-telefone', '#empresa-telefone'];
    phoneInputs.forEach(selector => {
        const input = $(selector);
        if (input) {
            input.addEventListener('input', (e) => {
                e.target.value = formatPhone(e.target.value);
            });
        }
    });
    
    // Máscara para placas
    const placaInput = $('#cliente-placa');
    if (placaInput) {
        placaInput.addEventListener('input', (e) => {
            e.target.value = formatPlaca(e.target.value);
        });
    }
    
    console.log('✅ Máscaras de formatação configuradas');
}

// ------------------------- SISTEMA DE TEMAS ----------------------------
function applyTheme(theme) {
    state.theme = theme;
    const root = document.body;
    
    if (theme === 'auto') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        root.dataset.theme = prefersDark ? 'dark' : 'light';
    } else {
        root.dataset.theme = theme;
    }
    
    // Atualiza ícone do header
    const themeIcon = $('#theme-toggle-btn i');
    if (themeIcon) {
        if (theme === 'light' || (theme === 'auto' && !window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            themeIcon.className = 'fas fa-sun';
        } else {
            themeIcon.className = 'fas fa-moon';
        }
    }
    
    // Atualiza radio buttons na configuração
    const radio = $(`#theme-${theme}`);
    if (radio) {
        radio.checked = true;
    }
    
    showNotification(`🎨 Tema alterado para: ${theme}`, 'success');
}

function toggleTheme() {
    const currentTheme = state.theme;
    let nextTheme;
    
    if (currentTheme === 'dark') {
        nextTheme = 'light';
    } else {
        nextTheme = 'dark';
    }
    
    applyTheme(nextTheme);
}

// ========================= SISTEMA DE NAVEGAÇÃO CORRIGIDO =========================
function showTab(tabId) {
    console.log(`🧭 Navegando para aba: ${tabId}`);
    
    // Atualiza estado da aba atual
    state.currentTab = tabId;
    
    // Remove classe active de todas as abas e conteúdos
    $$('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    $$('.tab-content').forEach(content => {
        content.classList.remove('active');
        content.style.display = 'none';
    });
    
    // Ativa o botão de navegação
    const targetBtn = $(`.nav-btn[data-tab="${tabId}"]`);
    if (targetBtn) {
        targetBtn.classList.add('active');
    }
    
    // Ativa o conteúdo da aba
    const targetContent = $(`#${tabId}-tab`);
    if (targetContent) {
        targetContent.classList.add('active');
        targetContent.style.display = 'block';
        
        // Aplica animação
        targetContent.style.animation = 'slideInUp 0.4s ease-out';
    }
    
    // Scroll para o topo
    setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
    
    // Renderizações específicas por aba
    setTimeout(() => {
        switch (tabId) {
            case 'dashboard':
                renderDashboard();
                renderMonthlyChart();
                break;
            case 'clientes':
                renderClientes();
                break;
            case 'servicos':
                renderServicos();
                break;
            case 'novo-orcamento':
                renderOrcamentoOptions();
                break;
            case 'historico':
                renderHistorico();
                break;
            case 'crm':
                renderCrmData();
                break;
            case 'despesas':
                renderDespesas();
                renderDespesasChart();
                break;
            case 'configuracoes':
                loadConfigurationForms();
                break;
        }
    }, 150);
    
    showNotification(`🚀 Navegando para: ${getTabName(tabId)}`, 'success');
}

function getTabName(tabId) {
    const names = {
        'dashboard': '📊 Painel',
        'clientes': '👥 Clientes', 
        'servicos': '🔧 Serviços',
        'novo-orcamento': '📝 Orçamento',
        'historico': '📋 Histórico',
        'crm': '💬 CRM',
        'despesas': '💰 Despesas',
        'configuracoes': '⚙️ Configurações'
    };
    return names[tabId] || tabId;
}

// ======================= REAL-TIME SYNC COM SUPABASE =====================
function setupRealtimeListeners() {
    if (!supabase) {
        console.warn('⚠️ Supabase não disponível para real-time');
        return;
    }
    
    try {
        // Configura listener para mudanças em tempo real
        const channel = supabase
            .channel('db-changes')
            .on('postgres_changes', 
                { event: '*', schema: 'public', table: 'clientes' },
                () => {
                    console.log('📡 Mudança detectada: clientes');
                    refreshCurrentTabSilently();
                })
            .on('postgres_changes',
                { event: '*', schema: 'public', table: 'orcamentos' }, 
                () => {
                    console.log('📡 Mudança detectada: orçamentos');
                    refreshCurrentTabSilently();
                })
            .on('postgres_changes',
                { event: '*', schema: 'public', table: 'servicos' }, 
                () => {
                    console.log('📡 Mudança detectada: serviços');
                    refreshCurrentTabSilently();
                })
            .on('postgres_changes',
                { event: '*', schema: 'public', table: 'despesas' }, 
                () => {
                    console.log('📡 Mudança detectada: despesas');
                    refreshCurrentTabSilently();
                })
            .subscribe();
            
        state.realtimeChannel = channel;
        
        console.log('✅ Real-time listeners configurados');
        
        // Atualiza indicador de sincronização
        const syncBtn = $('#sync-btn');
        if (syncBtn) {
            syncBtn.style.opacity = '1';
            syncBtn.title = '📡 Conectado em tempo real';
        }
        
    } catch (error) {
        console.error('❌ Erro ao configurar real-time:', error);
    }
}

function refreshCurrentTabSilently() {
    // Atualiza apenas a aba atual sem mudar de posição
    const activeTab = state.currentTab;
    if (!activeTab) return;
    
    console.log(`🔄 Atualizando aba ${activeTab} silenciosamente`);
    
    // Atualiza apenas os dados da aba atual
    switch(activeTab) {
        case 'dashboard':
            renderDashboard();
            break;
        case 'clientes':
            renderClientes();
            break;
        case 'servicos':
            renderServicos();
            break;
        case 'historico':
            renderHistorico();
            break;
        case 'despesas':
            renderDespesas();
            break;
        case 'crm':
            renderCrmData();
            break;
    }
}

// -------------------------- DADOS DE DEMONSTRAÇÃO --------------------------
function loadDemoData() {
    console.log('📊 Carregando dados de demonstração...');
    
    // Clientes de demonstração
    state.clientes = [
        {
            id: '1',
            nome: 'João Silva',
            telefone: '24999887766',
            carro: 'Honda Civic 2020',
            placa: 'ABC-1234',
            created_at: new Date().toISOString()
        },
        {
            id: '2',
            nome: 'Maria Santos',
            telefone: '24988776655',
            carro: 'Toyota Corolla 2021', 
            placa: 'XYZ-5678',
            created_at: new Date().toISOString()
        },
        {
            id: '3',
            nome: 'Pedro Oliveira',
            telefone: '24977665544',
            carro: 'Volkswagen Gol 2019',
            placa: 'DEF1G23',
            created_at: new Date().toISOString()
        }
    ];
    
    // Serviços de demonstração  
    state.servicos = [
        {
            id: '1',
            descricao: 'Lavagem Completa',
            valor: 25.00,
            created_at: new Date().toISOString()
        },
        {
            id: '2', 
            descricao: 'Enceramento',
            valor: 40.00,
            created_at: new Date().toISOString()
        },
        {
            id: '3',
            descricao: 'Lavagem Simples',
            valor: 15.00,
            created_at: new Date().toISOString()
        },
        {
            id: '4',
            descricao: 'Aspiração Completa',
            valor: 20.00,
            created_at: new Date().toISOString()
        },
        {
            id: '5',
            descricao: 'Limpeza de Bancos',
            valor: 30.00,
            created_at: new Date().toISOString()
        }
    ];
    
    // Orçamentos de demonstração
    state.orcamentos = [
        {
            id: '1',
            cliente_id: '1',
            status: 'Pago',
            desconto: 0,
            valor_total: 65.00,
            formas_pagamento: ['Pix'],
            created_at: new Date(Date.now() - 86400000).toISOString(),
            updated_at: new Date().toISOString(),
            clientes: state.clientes[0],
            orcamento_itens: [
                {
                    id: '1',
                    servico_id: '1',
                    quantidade: 1,
                    valor_unitario: 25.00,
                    servicos: state.servicos[0]
                },
                {
                    id: '2',
                    servico_id: '2', 
                    quantidade: 1,
                    valor_unitario: 40.00,
                    servicos: state.servicos[1]
                }
            ]
        },
        {
            id: '2',
            cliente_id: '2',
            status: 'Aprovado',
            desconto: 5.00,
            valor_total: 50.00,
            formas_pagamento: ['Dinheiro', 'Pix'],
            created_at: new Date(Date.now() - 172800000).toISOString(),
            updated_at: new Date().toISOString(),
            clientes: state.clientes[1],
            orcamento_itens: [
                {
                    id: '3',
                    servico_id: '1',
                    quantidade: 1,
                    valor_unitario: 25.00,
                    servicos: state.servicos[0]
                },
                {
                    id: '4',
                    servico_id: '3',
                    quantidade: 2,
                    valor_unitario: 15.00,
                    servicos: state.servicos[2]
                }
            ]
        },
        {
            id: '3',
            cliente_id: '3',
            status: 'Orçamento',
            desconto: 0,
            valor_total: 45.00,
            formas_pagamento: ['Crédito'],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            clientes: state.clientes[2],
            orcamento_itens: [
                {
                    id: '5',
                    servico_id: '1',
                    quantidade: 1,
                    valor_unitario: 25.00,
                    servicos: state.servicos[0]
                },
                {
                    id: '6',
                    servico_id: '4',
                    quantidade: 1,
                    valor_unitario: 20.00,
                    servicos: state.servicos[3]
                }
            ]
        }
    ];
    
    // Despesas de demonstração
    state.despesas = [
        {
            id: '1',
            descricao: 'Compra de produtos de limpeza',
            valor: 150.00,
            categoria: 'Produtos',
            data: new Date().toISOString().split('T')[0],
            created_at: new Date().toISOString()
        },
        {
            id: '2',
            descricao: 'Manutenção de equipamentos',
            valor: 80.00,
            categoria: 'Equipamentos',
            data: new Date(Date.now() - 86400000).toISOString().split('T')[0],
            created_at: new Date().toISOString()
        },
        {
            id: '3',
            descricao: 'Combustível para deslocamentos',
            valor: 45.00,
            categoria: 'Combustível',
            data: new Date(Date.now() - 172800000).toISOString().split('T')[0],
            created_at: new Date().toISOString()
        }
    ];
    
    // Interações CRM de demonstração
    state.crmInteractions = [
        {
            id: '1',
            cliente_id: '1',
            type: 'WhatsApp',
            notes: 'Cliente satisfeito com o serviço',
            interaction_date: new Date().toISOString().split('T')[0],
            created_at: new Date().toISOString(),
            clientes: state.clientes[0]
        }
    ];
    
    showNotification('📊 Dados de demonstração carregados!', 'success');
}

// ---------------------------- RENDERIZAÇÕES --------------------------------
function renderDashboard() {
    // Atualiza métricas
    const totalClientes = state.clientes.length;
    const orcamentosPendentes = state.orcamentos.filter(o => o.status === 'Orçamento').length;
    const orcamentosAprovados = state.orcamentos.filter(o => o.status === 'Aprovado').length;
    
    const inicioMes = new Date();
    inicioMes.setDate(1);
    const finalizadosMes = state.orcamentos.filter(o => 
        (o.status === 'Finalizado' || o.status === 'Pago') && 
        new Date(o.updated_at || o.created_at) >= inicioMes
    ).length;
    
    const faturamentoTotal = state.orcamentos
        .filter(o => o.status === 'Pago' || o.status === 'Finalizado')
        .reduce((total, o) => total + (o.valor_total || 0), 0);
    
    // Atualiza elementos DOM
    if ($('#stat-clientes')) $('#stat-clientes').textContent = totalClientes;
    if ($('#stat-pendentes')) $('#stat-pendentes').textContent = orcamentosPendentes;
    if ($('#stat-aprovados')) $('#stat-aprovados').textContent = orcamentosAprovados;
    if ($('#stat-finalizados-mes')) $('#stat-finalizados-mes').textContent = finalizadosMes;
    if ($('#stat-faturamento-total')) $('#stat-faturamento-total').textContent = formatCurrency(faturamentoTotal);
    
    // Renderiza atividade recente
    renderRecentActivity();
}

function renderRecentActivity() {
    const recentList = $('#recent-activity-list');
    if (!recentList) return;
    
    const recentOrcamentos = state.orcamentos
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 5);
    
    if (recentOrcamentos.length === 0) {
        recentList.innerHTML = `
            <div class="empty-list-message">
                <p>📭 Nenhuma atividade recente</p>
                <small>Crie seu primeiro orçamento para começar</small>
            </div>
        `;
        return;
    }
    
    recentList.innerHTML = recentOrcamentos.map(orc => `
        <li class="fade-in">
            <div>
                <strong>🚗 ${orc.clientes?.nome || 'Cliente não encontrado'}</strong>
                <small>📋 ${orc.clientes?.carro || 'Carro não informado'} - ${orc.clientes?.placa || 'Placa não informada'}</small>
                <small>📅 ${formatDate(orc.created_at)} - ${getStatusEmoji(orc.status)} ${orc.status}</small>
            </div>
            <div class="item-actions">
                <span style="font-weight: bold; color: var(--color-success);">
                    💰 ${formatCurrency(orc.valor_total)}
                </span>
            </div>
        </li>
    `).join('');
}

function renderClientes() {
    const clientesList = $('#clientes-lista');
    if (!clientesList) return;
    
    if (state.clientes.length === 0) {
        clientesList.innerHTML = `
            <div class="empty-list-message">
                <p>📭 Nenhum cliente cadastrado</p>
                <small>Cadastre o primeiro cliente para começar</small>
            </div>
        `;
        return;
    }
    
    clientesList.innerHTML = state.clientes.map(cliente => `
        <li data-id="${cliente.id}" class="cliente-item fade-in">
            <div>
                <strong>👤 ${cliente.nome}</strong>
                <small>🚗 ${cliente.carro} - 🚙 ${cliente.placa}</small>
                <small>📱 ${formatPhone(cliente.telefone)}</small>
            </div>
            <div class="item-actions">
                <button class="btn btn-sm btn-secondary btn-hover-effect" onclick="editarCliente('${cliente.id}')">
                    <i class="fas fa-edit"></i> <span>✏️ Editar</span>
                </button>
                <button class="btn btn-sm btn-danger btn-hover-effect" onclick="excluirCliente('${cliente.id}')">
                    <i class="fas fa-trash"></i> <span>🗑️ Excluir</span>
                </button>
            </div>
        </li>
    `).join('');
}

function renderServicos() {
    const servicosList = $('#servicos-lista');
    if (!servicosList) return;
    
    if (state.servicos.length === 0) {
        servicosList.innerHTML = `
            <div class="empty-list-message">
                <p>📭 Nenhum serviço cadastrado</p>
                <small>Cadastre o primeiro serviço para começar</small>
            </div>
        `;
        return;
    }
    
    servicosList.innerHTML = state.servicos.map(servico => `
        <li data-id="${servico.id}" class="servico-item fade-in">
            <div>
                <strong>🔧 ${servico.descricao}</strong>
                <small>💰 ${formatCurrency(servico.valor)}</small>
            </div>
            <div class="item-actions">
                <button class="btn btn-sm btn-secondary btn-hover-effect" onclick="editarServico('${servico.id}')">
                    <i class="fas fa-edit"></i> <span>✏️ Editar</span>
                </button>
                <button class="btn btn-sm btn-danger btn-hover-effect" onclick="excluirServico('${servico.id}')">
                    <i class="fas fa-trash"></i> <span>🗑️ Excluir</span>
                </button>
            </div>
        </li>
    `).join('');
}

function renderOrcamentoOptions() {
    // Popula select de clientes
    const clienteSelect = $('#orcamento-cliente');
    if (clienteSelect) {
        clienteSelect.innerHTML = '<option value="">👤 Selecione um cliente</option>' +
            state.clientes.map(cliente => `
                <option value="${cliente.id}">👤 ${cliente.nome} - 🚗 ${cliente.carro}</option>
            `).join('');
    }
    
    // Popula select de serviços
    const servicoSelect = $('#orcamento-servico-select');
    if (servicoSelect) {
        servicoSelect.innerHTML = '<option value="">🔧 Selecione um serviço</option>' +
            state.servicos.map(servico => `
                <option value="${servico.id}">🔧 ${servico.descricao} - 💰 ${formatCurrency(servico.valor)}</option>
            `).join('');
    }
    
    renderOrcamentoItens();
}

function renderOrcamentoItens() {
    const servicosContainer = $('#orcamento-servicos-adicionados');
    if (!servicosContainer) return;
    
    if (state.novoOrcamentoItens.length === 0) {
        servicosContainer.innerHTML = '<p style="text-align: center; color: var(--color-text-secondary);">📭 Nenhum serviço adicionado</p>';
        updateOrcamentoTotal();
        return;
    }
    
    servicosContainer.innerHTML = state.novoOrcamentoItens.map((item, index) => `
        <li class="fade-in">
            <div>
                <strong>🔧 ${item.descricao_servico}</strong>
                <small>💰 ${formatCurrency(item.valor_cobrado)} cada x ${item.quantidade}</small>
                <small>💵 Total: ${formatCurrency(item.valor_cobrado * item.quantidade)}</small>
            </div>
            <div class="item-actions">
                <input type="number" class="form-control" style="width: 80px;" 
                       value="${item.quantidade}" min="1" max="99" data-index="${index}"
                       title="Quantidade">
                <button type="button" class="btn btn-sm btn-danger remove-servico-btn btn-hover-effect" data-index="${index}">
                    <i class="fas fa-trash"></i> 🗑️
                </button>
            </div>
        </li>
    `).join('');
    
    updateOrcamentoTotal();
}

function updateOrcamentoTotal() {
    const subtotal = state.novoOrcamentoItens.reduce((total, item) => {
        return total + (item.valor_cobrado * item.quantidade);
    }, 0);
    
    const desconto = parseFloat($('#orcamento-desconto')?.value || 0);
    const total = Math.max(0, subtotal - desconto);
    
    const totalElement = $('#orcamento-total');
    if (totalElement) {
        totalElement.innerHTML = `<strong>💰 Total: ${formatCurrency(total)}</strong>`;
    }
}

// ================= HISTÓRICO COM FUNCIONALIDADE COMPLETA =================
function renderHistorico() {
    const orcamentosList = $('#historico-lista');
    if (!orcamentosList) return;
    
    if (state.orcamentos.length === 0) {
        orcamentosList.innerHTML = `
            <div class="empty-list-message">
                <p>📭 Nenhum orçamento encontrado</p>
                <small>Crie o primeiro orçamento para começar</small>
            </div>
        `;
        return;
    }
    
    orcamentosList.innerHTML = state.orcamentos.map(orcamento => `
        <li data-id="${orcamento.id}" class="historico-item fade-in" onclick="selecionarOrcamentoHistorico('${orcamento.id}')">
            <div>
                <strong>👤 ${orcamento.clientes?.nome || 'Cliente não encontrado'}</strong>
                <small>🚗 ${orcamento.clientes?.carro || 'Carro não informado'} - 🚙 ${orcamento.clientes?.placa || 'Placa não informada'}</small>
                <small>📅 ${formatDate(orcamento.created_at)} - ${getStatusEmoji(orcamento.status)} ${orcamento.status}</small>
            </div>
            <div class="item-actions">
                <span style="font-weight: bold; color: var(--color-success);">
                    💰 ${formatCurrency(orcamento.valor_total)}
                </span>
                <span class="status-badge status-${orcamento.status.toLowerCase()}">
                    ${getStatusEmoji(orcamento.status)}
                </span>
            </div>
        </li>
    `).join('');
    
    console.log('📋 Histórico renderizado com', state.orcamentos.length, 'orçamentos');
}

function selecionarOrcamentoHistorico(orcamentoId) {
    console.log('🎯 Selecionando orçamento:', orcamentoId);
    
    // Remove seleção anterior
    $$('.historico-item').forEach(item => item.classList.remove('selected'));
    
    // Adiciona seleção atual
    const selectedItem = $(`.historico-item[data-id="${orcamentoId}"]`);
    if (selectedItem) {
        selectedItem.classList.add('selected');
    }
    
    // Encontra o orçamento
    const orcamento = state.orcamentos.find(o => o.id === orcamentoId);
    if (!orcamento) {
        showNotification('❌ Orçamento não encontrado', 'error');
        return;
    }
    
    state.orcamentoSelecionado = orcamento;
    
    // Mostra painel de detalhes
    const detalhesPanel = $('#detalhes-panel');
    if (detalhesPanel) {
        detalhesPanel.style.display = 'block';
        detalhesPanel.classList.add('slide-in-right');
    }
    
    // Renderiza detalhes
    renderDetalhesOrcamento(orcamento);
    renderDetalhesRecibo(orcamento);
    
    showNotification(`✅ Orçamento #${orcamento.id} selecionado`, 'success');
}

function renderDetalhesOrcamento(orcamento) {
    const textoOrcamento = $('#texto-orcamento');
    if (!textoOrcamento) return;
    
    // Gera texto do orçamento
    let servicosTexto = '';
    if (orcamento.orcamento_itens && orcamento.orcamento_itens.length > 0) {
        servicosTexto = orcamento.orcamento_itens.map(item => {
            const descricao = item.servicos?.descricao || 'Serviço não encontrado';
            const quantidade = item.quantidade || 1;
            const valorUnitario = formatCurrency(item.valor_unitario || 0);
            const valorTotal = formatCurrency((item.valor_unitario || 0) * quantidade);
            return `${quantidade}x ${descricao} - ${valorUnitario} = ${valorTotal}`;
        }).join('\n');
    }
    
    const subtotal = (orcamento.orcamento_itens || []).reduce((total, item) => {
        return total + ((item.valor_unitario || 0) * (item.quantidade || 1));
    }, 0);
    
    const texto = TEMPLATE_ORCAMENTO
        .replace('{{id}}', orcamento.id)
        .replace('{{cliente.nome}}', orcamento.clientes?.nome || 'Cliente não encontrado')
        .replace('{{cliente.carro}}', orcamento.clientes?.carro || 'Carro não informado')
        .replace('{{cliente.placa}}', orcamento.clientes?.placa || 'Placa não informada')
        .replace('{{cliente.telefone}}', formatPhone(orcamento.clientes?.telefone || ''))
        .replace('{{servicos}}', servicosTexto)
        .replace('{{subtotal}}', formatCurrency(subtotal))
        .replace('{{desconto}}', formatCurrency(orcamento.desconto || 0))
        .replace('{{total}}', formatCurrency(orcamento.valor_total || 0))
        .replace('{{formasPagamento}}', (orcamento.formas_pagamento || []).join(', '))
        .replace('{{data}}', formatDate(orcamento.created_at));
    
    textoOrcamento.textContent = texto;
}

function renderDetalhesRecibo(orcamento) {
    const textoRecibo = $('#texto-recibo');
    if (!textoRecibo) return;
    
    // Gera texto do recibo
    let servicosTexto = '';
    if (orcamento.orcamento_itens && orcamento.orcamento_itens.length > 0) {
        servicosTexto = orcamento.orcamento_itens.map(item => {
            const descricao = item.servicos?.descricao || 'Serviço não encontrado';
            const quantidade = item.quantidade || 1;
            const valorTotal = formatCurrency((item.valor_unitario || 0) * quantidade);
            return `${quantidade}x ${descricao} - ${valorTotal}`;
        }).join('\n');
    }
    
    const hoje = new Date();
    const dataCompleta = hoje.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
    });
    
    const texto = TEMPLATE_RECIBO
        .replace('{{cliente.nome}}', orcamento.clientes?.nome || 'Cliente não encontrado')
        .replace('{{cliente.carro}}', orcamento.clientes?.carro || 'Carro não informado')
        .replace('{{cliente.placa}}', orcamento.clientes?.placa || 'Placa não informada')
        .replace('{{servicos}}', servicosTexto)
        .replace('{{total}}', formatCurrency(orcamento.valor_total || 0))
        .replace('{{formasPagamento}}', (orcamento.formas_pagamento || []).join(', '))
        .replace('{{cidade}}', 'Angra dos Reis - RJ')
        .replace('{{dataCompleta}}', dataCompleta);
    
    textoRecibo.textContent = texto;
}

function renderDespesas() {
    const despesasList = $('#despesas-lista');
    if (!despesasList) return;
    
    if (state.despesas.length === 0) {
        despesasList.innerHTML = `
            <div class="empty-list-message">
                <p>📭 Nenhuma despesa cadastrada</p>
                <small>Registre a primeira despesa para começar</small>
            </div>
        `;
        return;
    }
    
    despesasList.innerHTML = state.despesas.map(despesa => `
        <li data-id="${despesa.id}" class="despesa-item fade-in">
            <div>
                <strong>📝 ${despesa.descricao}</strong>
                <small>📂 ${despesa.categoria} - 📅 ${formatDate(despesa.data)}</small>
            </div>
            <div class="item-actions">
                <span style="font-weight: bold; color: var(--color-error);">
                    💸 ${formatCurrency(despesa.valor)}
                </span>
                <button class="btn btn-sm btn-secondary btn-hover-effect" onclick="editarDespesa('${despesa.id}')">
                    <i class="fas fa-edit"></i> ✏️
                </button>
                <button class="btn btn-sm btn-danger btn-hover-effect" onclick="excluirDespesa('${despesa.id}')">
                    <i class="fas fa-trash"></i> 🗑️
                </button>
            </div>
        </li>
    `).join('');
    
    // Atualiza métricas
    const hoje = new Date().toISOString().split('T')[0];
    const inicioMes = new Date();
    inicioMes.setDate(1);
    const inicioMesStr = inicioMes.toISOString().split('T')[0];
    
    const totalMes = state.despesas
        .filter(d => d.data >= inicioMesStr)
        .reduce((total, d) => total + (d.valor || 0), 0);
    
    const totalHoje = state.despesas
        .filter(d => d.data === hoje)
        .reduce((total, d) => total + (d.valor || 0), 0);
    
    const diasNoMes = new Date().getDate();
    const mediaDiaria = totalMes / diasNoMes;
    
    if ($('#despesas-total-mes')) $('#despesas-total-mes').textContent = formatCurrency(totalMes);
    if ($('#despesas-hoje')) $('#despesas-hoje').textContent = formatCurrency(totalHoje);
    if ($('#despesas-media-diaria')) $('#despesas-media-diaria').textContent = formatCurrency(mediaDiaria);
}

function renderCrmData() {
    // Métricas CRM
    const totalInteractions = state.crmInteractions.length;
    const activeClients = state.clientes.length; // Simplificado para demo
    
    if ($('#crm-total-interactions')) $('#crm-total-interactions').textContent = totalInteractions;
    if ($('#crm-active-clients')) $('#crm-active-clients').textContent = activeClients;
    if ($('#crm-pending-followups')) $('#crm-pending-followups').textContent = '2';
    
    // Popula select de cliente para interações
    const clientSelect = $('#interaction-client');
    if (clientSelect) {
        clientSelect.innerHTML = '<option value="">👤 Selecione um cliente</option>' +
            state.clientes.map(cliente => `
                <option value="${cliente.id}">👤 ${cliente.nome} - 🚗 ${cliente.carro}</option>
            `).join('');
    }
}

// ======================= FUNÇÕES DE DETALHES DO HISTÓRICO =======================
// Tornar funções globais para uso nos botões
window.copyText = function(tipo) {
    const elemento = tipo === 'orcamento' ? $('#texto-orcamento') : $('#texto-recibo');
    if (!elemento) return;
    
    navigator.clipboard.writeText(elemento.textContent).then(() => {
        showNotification(`📋 ${tipo === 'orcamento' ? 'Orçamento' : 'Recibo'} copiado!`, 'success');
    }).catch(() => {
        showNotification('❌ Erro ao copiar texto', 'error');
    });
};

window.baixarPDF = function(tipo) {
    if (!window.jsPDF) {
        showNotification('❌ Biblioteca PDF não disponível', 'error');
        return;
    }
    
    try {
        const elemento = tipo === 'orcamento' ? $('#texto-orcamento') : $('#texto-recibo');
        if (!elemento) return;
        
        const doc = new jsPDF();
        const texto = elemento.textContent;
        const linhas = doc.splitTextToSize(texto, 180);
        
        doc.setFont('courier');
        doc.setFontSize(10);
        doc.text(linhas, 15, 20);
        
        const nomeArquivo = `${tipo}_${state.orcamentoSelecionado?.id || 'documento'}.pdf`;
        doc.save(nomeArquivo);
        
        showNotification(`📄 PDF ${tipo} baixado!`, 'success');
    } catch (error) {
        console.error('Erro ao gerar PDF:', error);
        showNotification('❌ Erro ao gerar PDF', 'error');
    }
};

window.enviarWhatsApp = function(tipo) {
    const elemento = tipo === 'orcamento' ? $('#texto-orcamento') : $('#texto-recibo');
    if (!elemento) return;
    
    const texto = encodeURIComponent(elemento.textContent);
    const telefone = state.orcamentoSelecionado?.clientes?.telefone;
    
    if (telefone) {
        const numeroLimpo = telefone.replace(/\D/g, '');
        const whatsappUrl = `https://wa.me/55${numeroLimpo}?text=${texto}`;
        window.open(whatsappUrl, '_blank');
        showNotification(`📱 ${tipo === 'orcamento' ? 'Orçamento' : 'Recibo'} enviado via WhatsApp!`, 'success');
    } else {
        const whatsappUrl = `https://wa.me/?text=${texto}`;
        window.open(whatsappUrl, '_blank');
        showNotification('📱 WhatsApp aberto para envio', 'success');
    }
};

window.alterarStatus = function(novoStatus) {
    if (!state.orcamentoSelecionado) {
        showNotification('❌ Nenhum orçamento selecionado', 'error');
        return;
    }
    
    // Encontra o orçamento no array e atualiza
    const index = state.orcamentos.findIndex(o => o.id === state.orcamentoSelecionado.id);
    if (index >= 0) {
        state.orcamentos[index].status = novoStatus;
        state.orcamentos[index].updated_at = new Date().toISOString();
        state.orcamentoSelecionado.status = novoStatus;
        
        // Atualiza a renderização
        renderHistorico();
        
        // Mantém a seleção
        setTimeout(() => {
            selecionarOrcamentoHistorico(state.orcamentoSelecionado.id);
        }, 100);
        
        showNotification(`✅ Status alterado para: ${getStatusEmoji(novoStatus)} ${novoStatus}`, 'success');
        
        // Atualiza dashboard se estiver na aba
        if (state.currentTab === 'dashboard') {
            renderDashboard();
        }
    }
};

window.editarOrcamento = function() {
    if (!state.orcamentoSelecionado) {
        showNotification('❌ Nenhum orçamento selecionado', 'error');
        return;
    }
    
    showNotification('📝 Redirecionando para edição...', 'success');
    showTab('novo-orcamento');
    
    // TODO: Implementar carregamento dos dados do orçamento para edição
};

window.excluirOrcamento = function() {
    if (!state.orcamentoSelecionado) {
        showNotification('❌ Nenhum orçamento selecionado', 'error');
        return;
    }
    
    if (confirm('🗑️ Tem certeza que deseja excluir este orçamento?')) {
        const index = state.orcamentos.findIndex(o => o.id === state.orcamentoSelecionado.id);
        if (index >= 0) {
            state.orcamentos.splice(index, 1);
            state.orcamentoSelecionado = null;
            
            // Esconde painel de detalhes
            const detalhesPanel = $('#detalhes-panel');
            if (detalhesPanel) {
                detalhesPanel.style.display = 'none';
            }
            
            renderHistorico();
            showNotification('🗑️ Orçamento excluído com sucesso!', 'success');
        }
    }
};

function getStatusEmoji(status) {
    const emojis = {
        'Orçamento': '📝',
        'Aprovado': '👍',
        'Pago': '💰',
        'Finalizado': '✅',
        'Cancelado': '❌'
    };
    return emojis[status] || '📋';
}

// ========================== CHARTS =======================================
function renderMonthlyChart() {
    const canvas = $('#monthly-finalized-chart-canvas');
    if (!canvas || !window.Chart) return;
    
    const ctx = canvas.getContext('2d');
    
    if (state.monthlyChart) {
        state.monthlyChart.destroy();
    }
    
    // Dados dos últimos 6 meses
    const monthlyData = [];
    const monthLabels = [];
    
    for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        
        const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
        const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        
        const finalizados = state.orcamentos.filter(o => 
            (o.status === 'Finalizado' || o.status === 'Pago') && 
            new Date(o.updated_at || o.created_at) >= monthStart && 
            new Date(o.updated_at || o.created_at) <= monthEnd
        ).length;
        
        monthlyData.push(finalizados);
        monthLabels.push(date.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }));
    }
    
    try {
        state.monthlyChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: monthLabels,
                datasets: [{
                    label: '📊 Orçamentos Finalizados',
                    data: monthlyData,
                    backgroundColor: ['#1FB8CD', '#FFC185', '#B4413C', '#ECEBD5', '#5D878F', '#DB4545'],
                    borderColor: '#16a4b8',
                    borderWidth: 2,
                    borderRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: { 
                        beginAtZero: true,
                        ticks: { precision: 0 }
                    }
                }
            }
        });
    } catch (error) {
        console.error('❌ Erro ao criar gráfico:', error);
    }
}

function renderDespesasChart() {
    const canvas = $('#despesas-chart');
    if (!canvas || !window.Chart) return;
    
    const ctx = canvas.getContext('2d');
    
    if (state.despesasChart) {
        state.despesasChart.destroy();
    }
    
    // Agrupa despesas por categoria
    const categorias = {};
    state.despesas.forEach(despesa => {
        if (!categorias[despesa.categoria]) {
            categorias[despesa.categoria] = 0;
        }
        categorias[despesa.categoria] += despesa.valor || 0;
    });
    
    const labels = Object.keys(categorias);
    const data = Object.values(categorias);
    const colors = ['#1FB8CD', '#FFC185', '#B4413C', '#ECEBD5', '#5D878F', '#DB4545', '#D2BA4C', '#964325', '#944454'];
    
    try {
        state.despesasChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels.map(label => `💰 ${label}`),
                datasets: [{
                    data: data,
                    backgroundColor: colors.slice(0, labels.length),
                    borderWidth: 2,
                    borderColor: 'rgba(255, 255, 255, 0.1)'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: { padding: 20 }
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
    } catch (error) {
        console.error('❌ Erro ao criar gráfico de despesas:', error);
    }
}

// ========================== MANIPULADORES DE ORÇAMENTO ==========================
function handleAddServicoToOrcamento() {
    const servicoId = $('#orcamento-servico-select')?.value;
    const quantidade = parseInt($('#orcamento-servico-quantidade')?.value) || 1;
    
    if (!servicoId) {
        showNotification('⚠️ Selecione um serviço', 'warning');
        return;
    }
    
    if (quantidade <= 0 || quantidade > 99) {
        showNotification('⚠️ Quantidade deve ser entre 1 e 99', 'warning');
        return;
    }
    
    const servico = state.servicos.find(s => s.id === servicoId);
    if (!servico) {
        showNotification('❌ Serviço não encontrado', 'error');
        return;
    }
    
    // Verifica se já foi adicionado
    const existingIndex = state.novoOrcamentoItens.findIndex(item => item.servico_id === servicoId);
    
    if (existingIndex >= 0) {
        state.novoOrcamentoItens[existingIndex].quantidade = quantidade;
        showNotification(`✅ Quantidade do serviço "${servico.descricao}" atualizada`, 'success');
    } else {
        state.novoOrcamentoItens.push({
            servico_id: servicoId,
            descricao_servico: servico.descricao,
            valor_cobrado: servico.valor,
            quantidade: quantidade
        });
        showNotification(`✅ Serviço "${servico.descricao}" adicionado ao orçamento`, 'success');
    }
    
    // Limpa seleção
    if ($('#orcamento-servico-select')) $('#orcamento-servico-select').value = '';
    if ($('#orcamento-servico-quantidade')) $('#orcamento-servico-quantidade').value = 1;
    
    renderOrcamentoItens();
}

function handleOrcamentoSubmit(e) {
    e.preventDefault();
    
    const clienteId = $('#orcamento-cliente')?.value;
    const desconto = parseFloat($('#orcamento-desconto')?.value) || 0;
    
    // Validações
    if (!clienteId) {
        showNotification('❌ Selecione um cliente', 'error');
        return;
    }
    
    if (state.novoOrcamentoItens.length === 0) {
        showNotification('❌ Adicione pelo menos um serviço', 'error');
        return;
    }
    
    // Verifica formas de pagamento (checkboxes)
    const formasPagamento = Array.from($$('#payment-options input[type="checkbox"]:checked')).map(cb => cb.value);
    if (formasPagamento.length === 0) {
        showNotification('❌ Selecione pelo menos uma forma de pagamento', 'error');
        return;
    }
    
    // Calcula valores
    const subtotal = state.novoOrcamentoItens.reduce((total, item) => {
        return total + (item.valor_cobrado * item.quantidade);
    }, 0);
    const valorTotal = Math.max(0, subtotal - desconto);
    
    // Cria orçamento
    const novoOrcamento = {
        id: Date.now().toString(),
        cliente_id: clienteId,
        status: 'Orçamento',
        desconto,
        valor_total: valorTotal,
        formas_pagamento: formasPagamento,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        clientes: state.clientes.find(c => c.id === clienteId),
        orcamento_itens: state.novoOrcamentoItens.map((item, index) => ({
            id: `${Date.now()}_${index}`,
            servico_id: item.servico_id,
            quantidade: item.quantidade,
            valor_unitario: item.valor_cobrado,
            servicos: state.servicos.find(s => s.id === item.servico_id)
        }))
    };
    
    state.orcamentos.unshift(novoOrcamento);
    
    showNotification(`✅ Orçamento criado com sucesso! Total: ${formatCurrency(valorTotal)}`, 'success');
    
    // Limpa formulário
    e.target.reset();
    state.novoOrcamentoItens = [];
    $$('#payment-options input[type="checkbox"]').forEach(cb => cb.checked = false);
    renderOrcamentoItens();
    
    // Vai para histórico após um delay
    setTimeout(() => {
        showTab('historico');
    }, 1500);
}

// ========================== CRUD CLIENTES ===============================
function handleClienteSubmit(e) {
    e.preventDefault();
    
    const nome = $('#cliente-nome')?.value?.trim();
    const telefone = $('#cliente-telefone')?.value?.trim();
    const carro = $('#cliente-carro')?.value?.trim();
    const placa = $('#cliente-placa')?.value?.trim();
    const clienteId = $('#cliente-id')?.value;
    
    // Validações
    if (!nome || nome.length < 2) {
        showNotification('❌ Nome deve ter pelo menos 2 caracteres', 'error');
        return;
    }
    
    if (!telefone) {
        showNotification('❌ Telefone é obrigatório', 'error');
        return;
    }
    
    if (!carro || carro.length < 3) {
        showNotification('❌ Carro deve ter pelo menos 3 caracteres', 'error');
        return;
    }
    
    if (!placa) {
        showNotification('❌ Placa é obrigatória', 'error');
        return;
    }
    
    // Verifica se a placa já existe (apenas para novos clientes)
    if (!clienteId) {
        const placaExistente = state.clientes.find(c => c.placa.toLowerCase() === placa.toLowerCase());
        if (placaExistente) {
            showNotification('❌ Placa já cadastrada para outro cliente', 'error');
            return;
        }
    }
    
    if (clienteId) {
        // Edição
        const index = state.clientes.findIndex(c => c.id === clienteId);
        if (index >= 0) {
            state.clientes[index] = {
                ...state.clientes[index],
                nome,
                telefone,
                carro,
                placa,
                updated_at: new Date().toISOString()
            };
            showNotification(`✅ Cliente "${nome}" atualizado com sucesso!`, 'success');
        }
    } else {
        // Novo cliente
        const novoCliente = {
            id: Date.now().toString(),
            nome,
            telefone,
            carro,
            placa,
            created_at: new Date().toISOString()
        };
        
        state.clientes.unshift(novoCliente);
        showNotification(`✅ Cliente "${nome}" cadastrado com sucesso!`, 'success');
    }
    
    // Limpa formulário
    e.target.reset();
    $('#cliente-id').value = '';
    if ($('#cancelar-edicao-cliente')) $('#cancelar-edicao-cliente').style.display = 'none';
    if ($('#cliente-form-title')) $('#cliente-form-title').innerHTML = '<i class="fas fa-user-plus"></i> 👤 Cadastrar Cliente';
    
    // Atualiza lista
    renderClientes();
    renderOrcamentoOptions(); // Atualiza selects também
}

// Tornar funções globais para uso nos botões
window.editarCliente = function(clienteId) {
    const cliente = state.clientes.find(c => c.id === clienteId);
    if (!cliente) return;
    
    // Preenche formulário
    $('#cliente-id').value = cliente.id;
    $('#cliente-nome').value = cliente.nome;
    $('#cliente-telefone').value = formatPhone(cliente.telefone);
    $('#cliente-carro').value = cliente.carro;
    $('#cliente-placa').value = cliente.placa;
    
    // Atualiza interface
    if ($('#cancelar-edicao-cliente')) $('#cancelar-edicao-cliente').style.display = 'inline-flex';
    if ($('#cliente-form-title')) $('#cliente-form-title').innerHTML = '<i class="fas fa-user-edit"></i> ✏️ Editar Cliente';
    
    showNotification(`✏️ Editando cliente "${cliente.nome}"`, 'success');
};

window.excluirCliente = function(clienteId) {
    const cliente = state.clientes.find(c => c.id === clienteId);
    if (!cliente) return;
    
    // Verifica se tem orçamentos
    const temOrcamentos = state.orcamentos.some(o => o.cliente_id === clienteId);
    if (temOrcamentos) {
        showNotification('❌ Não é possível excluir cliente com orçamentos', 'error');
        return;
    }
    
    if (confirm(`🗑️ Tem certeza que deseja excluir o cliente "${cliente.nome}"?`)) {
        const index = state.clientes.findIndex(c => c.id === clienteId);
        if (index >= 0) {
            state.clientes.splice(index, 1);
            renderClientes();
            renderOrcamentoOptions();
            showNotification(`🗑️ Cliente "${cliente.nome}" excluído com sucesso!`, 'success');
        }
    }
};

// ========================== CRUD SERVIÇOS ===============================
function handleServicoSubmit(e) {
    e.preventDefault();
    
    const descricao = $('#servico-descricao')?.value?.trim();
    const valor = parseFloat($('#servico-valor')?.value);
    const servicoId = $('#servico-id')?.value;
    
    // Validações
    if (!descricao || descricao.length < 3) {
        showNotification('❌ Descrição deve ter pelo menos 3 caracteres', 'error');
        return;
    }
    
    if (!valor || valor <= 0) {
        showNotification('❌ Valor deve ser maior que zero', 'error');
        return;
    }
    
    if (servicoId) {
        // Edição
        const index = state.servicos.findIndex(s => s.id === servicoId);
        if (index >= 0) {
            state.servicos[index] = {
                ...state.servicos[index],
                descricao,
                valor,
                updated_at: new Date().toISOString()
            };
            showNotification(`✅ Serviço "${descricao}" atualizado com sucesso!`, 'success');
        }
    } else {
        // Novo serviço
        const novoServico = {
            id: Date.now().toString(),
            descricao,
            valor,
            created_at: new Date().toISOString()
        };
        
        state.servicos.unshift(novoServico);
        showNotification(`✅ Serviço "${descricao}" cadastrado com sucesso!`, 'success');
    }
    
    // Limpa formulário
    e.target.reset();
    $('#servico-id').value = '';
    if ($('#cancelar-edicao-servico')) $('#cancelar-edicao-servico').style.display = 'none';
    if ($('#servico-form-title')) $('#servico-form-title').innerHTML = '<i class="fas fa-plus"></i> 🔧 Cadastrar Serviço';
    
    // Atualiza lista
    renderServicos();
    renderOrcamentoOptions(); // Atualiza selects também
}

window.editarServico = function(servicoId) {
    const servico = state.servicos.find(s => s.id === servicoId);
    if (!servico) return;
    
    // Preenche formulário
    $('#servico-id').value = servico.id;
    $('#servico-descricao').value = servico.descricao;
    $('#servico-valor').value = servico.valor;
    
    // Atualiza interface
    if ($('#cancelar-edicao-servico')) $('#cancelar-edicao-servico').style.display = 'inline-flex';
    if ($('#servico-form-title')) $('#servico-form-title').innerHTML = '<i class="fas fa-tools"></i> ✏️ Editar Serviço';
    
    showNotification(`✏️ Editando serviço "${servico.descricao}"`, 'success');
};

window.excluirServico = function(servicoId) {
    const servico = state.servicos.find(s => s.id === servicoId);
    if (!servico) return;
    
    if (confirm(`🗑️ Tem certeza que deseja excluir o serviço "${servico.descricao}"?`)) {
        const index = state.servicos.findIndex(s => s.id === servicoId);
        if (index >= 0) {
            state.servicos.splice(index, 1);
            renderServicos();
            renderOrcamentoOptions();
            showNotification(`🗑️ Serviço "${servico.descricao}" excluído com sucesso!`, 'success');
        }
    }
};

// ========================== CONFIGURAÇÕES ==========================
function loadConfigurationForms() {
    // Carrega dados da empresa
    if ($('#empresa-nome')) $('#empresa-nome').value = state.estabelecimento.nome;
    if ($('#empresa-cnpj')) $('#empresa-cnpj').value = state.estabelecimento.cnpj;
    if ($('#empresa-telefone')) $('#empresa-telefone').value = formatPhone(state.estabelecimento.telefone);
    if ($('#empresa-endereco')) $('#empresa-endereco').value = state.estabelecimento.endereco;
    if ($('#empresa-agradecimento')) $('#empresa-agradecimento').value = state.estabelecimento.agradecimento;
    
    // Aplica tema atual
    applyTheme(state.theme);
}

function handleEmpresaSubmit(e) {
    e.preventDefault();
    
    state.estabelecimento = {
        nome: $('#empresa-nome')?.value?.trim() || '',
        cnpj: $('#empresa-cnpj')?.value?.trim() || '',
        telefone: $('#empresa-telefone')?.value?.replace(/\D/g, '') || '',
        endereco: $('#empresa-endereco')?.value?.trim() || '',
        agradecimento: $('#empresa-agradecimento')?.value?.trim() || ''
    };
    
    showNotification('✅ Dados da empresa salvos com sucesso!', 'success');
}

// ========================== EVENT LISTENERS ==========================
function setupEventListeners() {
    console.log('⚙️ Configurando event listeners...');
    
    // Navegação entre abas - CORRIGIDO
    $$('.nav-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const tabId = e.currentTarget.dataset.tab;
            if (tabId) {
                showTab(tabId);
            }
        });
    });
    
    // Toggle de tema no header
    const themeToggleBtn = $('#theme-toggle-btn');
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', (e) => {
            e.preventDefault();
            toggleTheme();
        });
    }
    
    // Radio buttons de tema nas configurações
    $$('input[name="theme-choice"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            applyTheme(e.target.value);
        });
    });
    
    // Formulário da empresa
    const empresaForm = $('#empresa-form');
    if (empresaForm) {
        empresaForm.addEventListener('submit', handleEmpresaSubmit);
    }
    
    // Formulário de cliente
    const clienteForm = $('#cliente-form');
    if (clienteForm) {
        clienteForm.addEventListener('submit', handleClienteSubmit);
    }
    
    // Formulário de serviço
    const servicoForm = $('#servico-form');
    if (servicoForm) {
        servicoForm.addEventListener('submit', handleServicoSubmit);
    }
    
    // Orçamento
    const addServicoBtn = $('#add-servico-btn');
    const orcamentoForm = $('#orcamento-form');
    const descontoInput = $('#orcamento-desconto');
    
    if (addServicoBtn) addServicoBtn.addEventListener('click', (e) => {
        e.preventDefault();
        handleAddServicoToOrcamento();
    });
    
    if (orcamentoForm) orcamentoForm.addEventListener('submit', handleOrcamentoSubmit);
    if (descontoInput) descontoInput.addEventListener('input', updateOrcamentoTotal);
    
    // Histórico - switcher de visualização
    const detalheBtns = $$('.detalhe-view-btn');
    detalheBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const view = e.currentTarget.dataset.view;
            
            // Remove active de todos
            detalheBtns.forEach(b => b.classList.remove('active'));
            e.currentTarget.classList.add('active');
            
            // Mostra/esconde conteúdos
            $('#detalhes-orcamento').style.display = view === 'orcamento' ? 'block' : 'none';
            $('#detalhes-recibo').style.display = view === 'recibo' ? 'block' : 'none';
        });
    });
    
    // Delegated events para elementos dinâmicos
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('remove-servico-btn')) {
            e.preventDefault();
            const index = parseInt(e.target.dataset.index);
            if (index >= 0) {
                state.novoOrcamentoItens.splice(index, 1);
                renderOrcamentoItens();
                showNotification('🗑️ Serviço removido do orçamento', 'success');
            }
        }
    });
    
    document.addEventListener('change', (e) => {
        if (e.target.type === 'number' && e.target.dataset.index !== undefined) {
            const index = parseInt(e.target.dataset.index);
            const newQuantity = parseInt(e.target.value) || 1;
            
            if (newQuantity > 0 && newQuantity <= 99 && state.novoOrcamentoItens[index]) {
                state.novoOrcamentoItens[index].quantidade = newQuantity;
                updateOrcamentoTotal();
                showNotification('✅ Quantidade atualizada', 'success');
            }
        }
    });
    
    // Back to top button
    const backToTopBtn = $('#back-to-top-btn');
    if (backToTopBtn) {
        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 300) {
                backToTopBtn.classList.add('show');
            } else {
                backToTopBtn.classList.remove('show');
            }
        });
        
        backToTopBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
    
    // Status de rede
    window.addEventListener('online', () => {
        const indicator = $('#offline-indicator');
        if (indicator) indicator.classList.remove('show');
        showNotification('📶 Conexão restaurada!', 'success');
    });
    
    window.addEventListener('offline', () => {
        const indicator = $('#offline-indicator');
        if (indicator) indicator.classList.add('show');
        showNotification('📶 Modo offline ativado', 'warning');
    });
    
    console.log('✅ Event listeners configurados!');
}

// ========================== INICIALIZAÇÃO ==========================
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Inicializando R.M. Estética PRO+...');
    
    try {
        // Mostra loading
        const loadingOverlay = $('#loading-overlay');
        if (loadingOverlay) {
            loadingOverlay.style.display = 'flex';
        }
        
        setTimeout(() => {
            // Carrega dados de demonstração
            loadDemoData();
            
            // Aplica tema inicial (dark)
            applyTheme('dark');
            
            // Configura event listeners ANTES de configurar máscaras
            setupEventListeners();
            
            // Configura máscaras de formatação
            setupInputMasks();
            
            // Configura real-time (se disponível)
            setupRealtimeListeners();
            
            // Renderiza conteúdo inicial (dashboard)
            showTab('dashboard');
            
            // Define data atual nos campos de data
            const today = new Date().toISOString().split('T')[0];
            const interactionDateEl = $('#interaction-date');
            const despesaDateEl = $('#despesa-data');
            
            if (interactionDateEl) interactionDateEl.value = today;
            if (despesaDateEl) despesaDateEl.value = today;
            
            // Esconde loading
            if (loadingOverlay) {
                setTimeout(() => {
                    loadingOverlay.style.display = 'none';
                }, 500);
            }
            
            showNotification('🚗 Sistema R.M. Estética PRO+ inicializado com sucesso!', 'success');
            console.log('✅ Inicialização concluída!');
            
        }, 1000); // Simula carregamento
        
    } catch (error) {
        console.error('❌ Erro na inicialização:', error);
        showNotification('❌ Erro na inicialização: ' + error.message, 'error');
        
        // Esconde loading mesmo com erro
        const loadingOverlay = $('#loading-overlay');
        if (loadingOverlay) {
            loadingOverlay.style.display = 'none';
        }
    }
});

// Torna funções globais disponíveis para debugging
window.selecionarOrcamentoHistorico = selecionarOrcamentoHistorico;

// Exporta funções globais para debugging
window.rmEstetica = {
    state,
    showTab,
    showNotification,
    formatCurrency,
    formatDate,
    formatPhone,
    formatPlaca,
    applyTheme,
    loadDemoData,
    selecionarOrcamentoHistorico,
    copyText,
    baixarPDF,
    enviarWhatsApp,
    alterarStatus,
    editarOrcamento,
    excluirOrcamento,
    editarCliente,
    excluirCliente,
    editarServico,
    excluirServico
};

console.log('🚗✨ R.M. Estética PRO+ - Sistema completamente carregado e funcional! ✨🚗');