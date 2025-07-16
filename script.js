// Configuração do Supabase
const supabaseUrl = 'https://bezbszbkaifcanqsmdbi.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJlemJzemJrYWlmY2FucXNtZGJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI2MTM5MTksImV4cCI6MjA2ODE4OTkxOX0.zLXAuQz7g5ym3Bd5pkhg5vsnf_3rdJFRAXI_kX8tM18';

const { createClient } = supabase;
const db = createClient(supabaseUrl, supabaseAnonKey);

// Variáveis globais
let currentTab = 'painel';
let clientes = [];
let servicos = [];
let orcamentos = [];
let currentOrcamento = null;
let currentClienteId = null;
let currentServicoId = null;
let servicosOrcamento = [];
let servicesChart = null;

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    loadInitialData();
});

// Configuração inicial
function initializeApp() {
    // Máscara de telefone
    const telefoneInput = document.getElementById('clienteTelefone');
    if (telefoneInput) {
        telefoneInput.addEventListener('input', formatTelefone);
    }
    
    // Máscara de placa
    const placaInput = document.getElementById('clientePlaca');
    if (placaInput) {
        placaInput.addEventListener('input', formatPlaca);
    }
    
    // Event listeners para navegação
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.addEventListener('click', function() {
            const tabName = this.dataset.tab;
            switchTab(tabName);
        });
    });
    
    // Event listeners para formulários
    document.getElementById('clienteFormElement').addEventListener('submit', handleClienteSubmit);
    document.getElementById('servicoFormElement').addEventListener('submit', handleServicoSubmit);
    document.getElementById('orcamentoForm').addEventListener('submit', handleOrcamentoSubmit);
    
    // Event listeners para desconto
    document.getElementById('orcamentoDesconto').addEventListener('input', calculateTotal);
    
    // Event listeners para pesquisa
    document.getElementById('searchClientes').addEventListener('input', debounce(filterClientes, 300));
    document.getElementById('searchServicos').addEventListener('input', debounce(filterServicos, 300));
    
    // Event listeners para ordenação
    document.getElementById('sortClientes').addEventListener('change', sortClientes);
    document.getElementById('sortServicos').addEventListener('change', sortServicos);
    
    // Event listeners para filtros
    document.getElementById('filterStatus').addEventListener('change', filterHistorico);
    document.getElementById('filterDataInicio').addEventListener('change', filterHistorico);
    document.getElementById('filterDataFim').addEventListener('change', filterHistorico);
}

// Event listeners
function setupEventListeners() {
    // Fechar modal ao clicar fora
    document.getElementById('modalOverlay').addEventListener('click', function(e) {
        if (e.target === this) {
            closeModal();
        }
    });
    
    // Escape key para fechar modal
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeModal();
            closeClienteDetails();
            closeHistoricoDetails();
        }
    });
    
    // Payment options
    document.querySelectorAll('.payment-option input').forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            this.parentElement.classList.toggle('selected', this.checked);
        });
    });
}

// Carregamento inicial de dados
async function loadInitialData() {
    showLoading();
    try {
        await Promise.all([
            loadClientes(),
            loadServicos(),
            loadOrcamentos()
        ]);
        
        populateSelects();
        updateDashboard();
        hideLoading();
    } catch (error) {
        console.error('Erro ao carregar dados:', error);
        showNotification('Erro ao carregar dados', 'error');
        hideLoading();
    }
}

// Navegação entre abas
function switchTab(tabName) {
    // Atualizar navegação
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    
    // Atualizar conteúdo
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(tabName).classList.add('active');
    
    currentTab = tabName;
    
    // Carregar dados específicos da aba
    switch (tabName) {
        case 'painel':
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
        showNotification('Erro ao carregar clientes', 'error');
    }
}

async function loadServicos() {
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
        showNotification('Erro ao carregar serviços', 'error');
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
        renderHistorico();
    } catch (error) {
        console.error('Erro ao carregar orçamentos:', error);
        showNotification('Erro ao carregar orçamentos', 'error');
    }
}

// Renderização de clientes
function renderClientes() {
    const tbody = document.getElementById('clientesTableBody');
    
    if (clientes.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center">Nenhum cliente encontrado</td></tr>';
        return;
    }
    
    tbody.innerHTML = clientes.map(cliente => `
        <tr onclick="showClienteDetails('${cliente.id}')">
            <td>${cliente.nome}</td>
            <td>${cliente.telefone || '-'}</td>
            <td>${cliente.carro || '-'}</td>
            <td>${cliente.placa || '-'}</td>
            <td onclick="event.stopPropagation()">
                <div class="table-actions">
                    <button class="btn btn-small btn-secondary" onclick="editCliente('${cliente.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-small btn-danger" onclick="deleteCliente('${cliente.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Renderização de serviços
function renderServicos() {
    const tbody = document.getElementById('servicosTableBody');
    
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
    updateChart();
    updateRecentActivity();
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
    
    document.getElementById('totalClientes').textContent = totalClientes;
    document.getElementById('totalPendentes').textContent = totalPendentes;
    document.getElementById('totalAprovados').textContent = totalAprovados;
    document.getElementById('finalizadosMes').textContent = finalizadosMes;
    document.getElementById('faturamentoTotal').textContent = formatCurrency(faturamentoTotal);
}

function updateChart() {
    const ctx = document.getElementById('servicesChart').getContext('2d');
    
    // Dados dos últimos 6 meses
    const months = [];
    const data = [];
    
    for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        
        months.push(date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }));
        
        const count = orcamentos.filter(o => {
            const oDate = new Date(o.created_at);
            return o.status === 'Finalizado' && 
                   oDate.getMonth() === date.getMonth() && 
                   oDate.getFullYear() === date.getFullYear();
        }).length;
        
        data.push(count);
    }
    
    if (servicesChart) {
        servicesChart.destroy();
    }
    
    servicesChart = new Chart(ctx, {
        type: 'bar',
         {
            labels: months,
            datasets: [{
                label: 'Serviços Finalizados',
                 data,
                backgroundColor: '#ef4444',
                borderColor: '#dc2626',
                borderWidth: 1
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
                        stepSize: 1
                    }
                }
            }
        }
    });
}

function updateRecentActivity() {
    const container = document.getElementById('activityList');
    const recent = orcamentos.slice(0, 8);
    
    if (recent.length === 0) {
        container.innerHTML = '<p class="text-center">Nenhuma atividade recente</p>';
        return;
    }
    
    container.innerHTML = recent.map(orcamento => `
        <div class="activity-item">
            <h4>${orcamento.clientes?.nome || 'Cliente não encontrado'}</h4>
            <p>${formatDateTime(orcamento.updated_at || orcamento.created_at)}</p>
            <p>
                ${formatCurrency(orcamento.valor_total)}
                <span class="activity-status ${orcamento.status.toLowerCase()}">${orcamento.status}</span>
            </p>
        </div>
    `).join('');
}

// Funções de formulário de cliente
function toggleClienteForm() {
    const form = document.getElementById('clienteForm');
    form.classList.toggle('active');
    
    if (form.classList.contains('active')) {
        document.getElementById('clienteNome').focus();
    }
}

function cancelarClienteForm() {
    document.getElementById('clienteForm').classList.remove('active');
    document.getElementById('clienteFormElement').reset();
    currentClienteId = null;
}

async function handleClienteSubmit(e) {
    e.preventDefault();
    
    const formData = {
        nome: document.getElementById('clienteNome').value.trim(),
        telefone: document.getElementById('clienteTelefone').value.trim(),
        carro: document.getElementById('clienteCarro').value.trim(),
        placa: document.getElementById('clientePlaca').value.trim()
    };
    
    try {
        showLoading();
        
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
        
        showNotification(
            currentClienteId ? 'Cliente atualizado com sucesso!' : 'Cliente salvo com sucesso!',
            'success'
        );
        
        cancelarClienteForm();
        await loadClientes();
        populateSelects();
        showConfetti();
        
    } catch (error) {
        console.error('Erro ao salvar cliente:', error);
        showNotification('Erro ao salvar cliente', 'error');
    } finally {
        hideLoading();
    }
}

async function editCliente(id) {
    const cliente = clientes.find(c => c.id === id);
    if (!cliente) return;
    
    currentClienteId = id;
    
    document.getElementById('clienteNome').value = cliente.nome || '';
    document.getElementById('clienteTelefone').value = cliente.telefone || '';
    document.getElementById('clienteCarro').value = cliente.carro || '';
    document.getElementById('clientePlaca').value = cliente.placa || '';
    
    toggleClienteForm();
}

async function deleteCliente(id) {
    const cliente = clientes.find(c => c.id === id);
    if (!cliente) return;
    
    showConfirm(
        'Excluir Cliente',
        `Tem certeza que deseja excluir o cliente "${cliente.nome}"? Esta ação não pode ser desfeita.`,
        async () => {
            try {
                showLoading();
                
                const { error } = await db
                    .from('clientes')
                    .delete()
                    .eq('id', id);
                
                if (error) throw error;
                
                showNotification('Cliente excluído com sucesso!', 'success');
                await loadClientes();
                populateSelects();
                
            } catch (error) {
                console.error('Erro ao excluir cliente:', error);
                showNotification('Erro ao excluir cliente', 'error');
            } finally {
                hideLoading();
            }
        }
    );
}

// Funções de formulário de serviço
function toggleServicoForm() {
    const form = document.getElementById('servicoForm');
    form.classList.toggle('active');
    
    if (form.classList.contains('active')) {
        document.getElementById('servicoDescricao').focus();
    }
}

function cancelarServicoForm() {
    document.getElementById('servicoForm').classList.remove('active');
    document.getElementById('servicoFormElement').reset();
    currentServicoId = null;
}

async function handleServicoSubmit(e) {
    e.preventDefault();
    
    const formData = {
        descricao: document.getElementById('servicoDescricao').value.trim(),
        valor: parseFloat(document.getElementById('servicoValor').value)
    };
    
    try {
        showLoading();
        
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
        
        showNotification(
            currentServicoId ? 'Serviço atualizado com sucesso!' : 'Serviço salvo com sucesso!',
            'success'
        );
        
        cancelarServicoForm();
        await loadServicos();
        populateSelects();
        showConfetti();
        
    } catch (error) {
        console.error('Erro ao salvar serviço:', error);
        showNotification('Erro ao salvar serviço', 'error');
    } finally {
        hideLoading();
    }
}

async function editServico(id) {
    const servico = servicos.find(s => s.id === id);
    if (!servico) return;
    
    currentServicoId = id;
    
    document.getElementById('servicoDescricao').value = servico.descricao || '';
    document.getElementById('servicoValor').value = servico.valor || '';
    
    toggleServicoForm();
}

async function deleteServico(id) {
    const servico = servicos.find(s => s.id === id);
    if (!servico) return;
    
    showConfirm(
        'Excluir Serviço',
        `Tem certeza que deseja excluir o serviço "${servico.descricao}"? Esta ação não pode ser desfeita.`,
        async () => {
            try {
                showLoading();
                
                const { error } = await db
                    .from('servicos')
                    .delete()
                    .eq('id', id);
                
                if (error) throw error;
                
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

// Funções de orçamento
function populateSelects() {
    // Popular select de clientes
    const clienteSelect = document.getElementById('orcamentoCliente');
    clienteSelect.innerHTML = '<option value="">Selecione um cliente</option>';
    
    clientes.forEach(cliente => {
        const option = document.createElement('option');
        option.value = cliente.id;
        option.textContent = `${cliente.nome} - ${cliente.carro || 'Veículo não informado'}`;
        clienteSelect.appendChild(option);
    });
    
    // Popular select de serviços
    const servicoSelect = document.getElementById('servicoSelect');
    servicoSelect.innerHTML = '<option value="">Selecione um serviço</option>';
    
    servicos.forEach(servico => {
        const option = document.createElement('option');
        option.value = servico.id;
        option.textContent = `${servico.descricao} - ${formatCurrency(servico.valor)}`;
        servicoSelect.appendChild(option);
    });
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
    
    document.getElementById('valorTotal').textContent = formatCurrency(total);
}

function limparOrcamento() {
    document.getElementById('orcamentoForm').reset();
    servicosOrcamento = [];
    currentOrcamento = null;
    renderServicosOrcamento();
    calculateTotal();
    
    // Limpar seleção de formas de pagamento
    document.querySelectorAll('.payment-option').forEach(option => {
        option.classList.remove('selected');
        option.querySelector('input').checked = false;
    });
    
    document.getElementById('orcamentoSubmitText').textContent = 'Salvar Orçamento';
}

async function handleOrcamentoSubmit(e) {
    e.preventDefault();
    
    const clienteId = document.getElementById('orcamentoCliente').value;
    const desconto = parseFloat(document.getElementById('orcamentoDesconto').value) || 0;
    
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
        formas_pagamento: formasPagamento.join(', ')
    };
    
    try {
        showLoading();
        
        let result;
        if (currentOrcamento) {
            // Atualizar orçamento existente
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
            // Criar novo orçamento
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
        
        showNotification(
            currentOrcamento ? 'Orçamento atualizado com sucesso!' : 'Orçamento salvo com sucesso!',
            'success'
        );
        
        limparOrcamento();
        await loadOrcamentos();
        updateDashboard();
        showConfetti();
        
    } catch (error) {
        console.error('Erro ao salvar orçamento:', error);
        showNotification('Erro ao salvar orçamento', 'error');
    } finally {
        hideLoading();
    }
}

// Funções de filtro e pesquisa
function filterClientes() {
    const search = document.getElementById('searchClientes').value.toLowerCase();
    const filteredClientes = clientes.filter(cliente => 
        cliente.nome.toLowerCase().includes(search) ||
        (cliente.placa && cliente.placa.toLowerCase().includes(search))
    );
    
    const tbody = document.getElementById('clientesTableBody');
    tbody.innerHTML = filteredClientes.map(cliente => `
        <tr onclick="showClienteDetails('${cliente.id}')">
            <td>${cliente.nome}</td>
            <td>${cliente.telefone || '-'}</td>
            <td>${cliente.carro || '-'}</td>
            <td>${cliente.placa || '-'}</td>
            <td onclick="event.stopPropagation()">
                <div class="table-actions">
                    <button class="btn btn-small btn-secondary" onclick="editCliente('${cliente.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-small btn-danger" onclick="deleteCliente('${cliente.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

function filterServicos() {
    const search = document.getElementById('searchServicos').value.toLowerCase();
    const filteredServicos = servicos.filter(servico => 
        servico.descricao.toLowerCase().includes(search)
    );
    
    const tbody = document.getElementById('servicosTableBody');
    tbody.innerHTML = filteredServicos.map(servico => `
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

function sortClientes() {
    const sortBy = document.getElementById('sortClientes').value;
    
    clientes.sort((a, b) => {
        switch (sortBy) {
            case 'nome-asc':
                return a.nome.localeCompare(b.nome);
            case 'nome-desc':
                return b.nome.localeCompare(a.nome);
            case 'carro':
                return (a.carro || '').localeCompare(b.carro || '');
            case 'placa':
                return (a.placa || '').localeCompare(b.placa || '');
            default:
                return 0;
        }
    });
    
    renderClientes();
}

function sortServicos() {
    const sortBy = document.getElementById('sortServicos').value;
    
    servicos.sort((a, b) => {
        switch (sortBy) {
            case 'descricao-asc':
                return a.descricao.localeCompare(b.descricao);
            case 'descricao-desc':
                return b.descricao.localeCompare(a.descricao);
            case 'valor-asc':
                return a.valor - b.valor;
            case 'valor-desc':
                return b.valor - a.valor;
            default:
                return 0;
        }
    });
    
    renderServicos();
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

// Funções de detalhes
function showClienteDetails(clienteId) {
    const cliente = clientes.find(c => c.id === clienteId);
    if (!cliente) return;
    
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
    
    document.getElementById('clienteDetails').classList.add('active');
}

function closeClienteDetails() {
    document.getElementById('clienteDetails').classList.remove('active');
}

function showHistoricoDetails(orcamentoId) {
    const orcamento = orcamentos.find(o => o.id === orcamentoId);
    if (!orcamento) return;
    
    // Remover seleção anterior
    document.querySelectorAll('.historico-item').forEach(item => {
        item.classList.remove('selected');
    });
    
    // Marcar item atual como selecionado
    event.target.closest('.historico-item').classList.add('selected');
    
    const cliente = orcamento.clientes;
    const itens = orcamento.orcamento_itens || [];
    
    const detailsContent = document.getElementById('historicoDetailsContent');
    
    detailsContent.innerHTML = `
        <div class="detail-section">
            <h4>Informações do Cliente</h4>
            <p><strong>Nome:</strong> ${cliente?.nome || 'Não informado'}</p>
            <p><strong>Telefone:</strong> ${cliente?.telefone || 'Não informado'}</p>
            <p><strong>Veículo:</strong> ${cliente?.carro || 'Não informado'}</p>
            <p><strong>Placa:</strong> ${cliente?.placa || 'Não informado'}</p>
        </div>
        
        <div class="detail-section">
            <h4>Detalhes do Orçamento</h4>
            <p><strong>Data:</strong> ${formatDateTime(orcamento.created_at)}</p>
            <p><strong>Status:</strong> <span class="activity-status ${orcamento.status.toLowerCase()}">${orcamento.status}</span></p>
            <p><strong>Desconto:</strong> ${orcamento.desconto}%</p>
            <p><strong>Valor Total:</strong> ${formatCurrency(orcamento.valor_total)}</p>
            <p><strong>Forma de Pagamento:</strong> ${orcamento.formas_pagamento || 'Não informado'}</p>
        </div>
        
        <div class="detail-section">
            <h4>Serviços</h4>
            <div class="servicos-detail">
                <ul>
                    ${itens.map(item => `
                        <li>
                            ${item.descricao_servico} (x${item.quantidade}) - ${formatCurrency(item.valor_cobrado * item.quantidade)}
                        </li>
                    `).join('')}
                </ul>
            </div>
        </div>
        
        <div class="status-actions">
            ${getStatusActions(orcamento)}
        </div>
        
        <div class="document-actions">
            <button class="btn btn-secondary" onclick="copyOrcamentoText('${orcamento.id}')">
                <i class="fas fa-copy"></i>
                Copiar Texto
            </button>
            <button class="btn btn-success" onclick="sendWhatsApp('${orcamento.id}')">
                <i class="fab fa-whatsapp"></i>
                WhatsApp
            </button>
            <button class="btn btn-primary" onclick="downloadPDF('${orcamento.id}')">
                <i class="fas fa-file-pdf"></i>
                Download PDF
            </button>
            <button class="btn btn-warning" onclick="editOrcamento('${orcamento.id}')">
                <i class="fas fa-edit"></i>
                Editar
            </button>
        </div>
    `;
    
    document.getElementById('historicoDetails').scrollTop = 0;
}

function getStatusActions(orcamento) {
    const actions = [];
    
    switch (orcamento.status) {
        case 'Orçamento':
            actions.push(`
                <button class="btn btn-success" onclick="updateStatus('${orcamento.id}', 'Aprovado')">
                    <i class="fas fa-check"></i>
                    Aprovar
                </button>
                <button class="btn btn-danger" onclick="updateStatus('${orcamento.id}', 'Cancelado')">
                    <i class="fas fa-times"></i>
                    Cancelar
                </button>
            `);
            break;
        case 'Aprovado':
            actions.push(`
                <button class="btn btn-success" onclick="updateStatus('${orcamento.id}', 'Finalizado')">
                    <i class="fas fa-check-circle"></i>
                    Finalizar
                </button>
                <button class="btn btn-danger" onclick="updateStatus('${orcamento.id}', 'Cancelado')">
                    <i class="fas fa-times"></i>
                    Cancelar
                </button>
            `);
            break;
        case 'Finalizado':
            actions.push(`
                <button class="btn btn-secondary" onclick="downloadRecibo('${orcamento.id}')">
                    <i class="fas fa-receipt"></i>
                    Recibo
                </button>
            `);
            break;
    }
    
    return actions.join('');
}

function closeHistoricoDetails() {
    document.querySelectorAll('.historico-item').forEach(item => {
        item.classList.remove('selected');
    });
    
    document.getElementById('historicoDetailsContent').innerHTML = '<p>Selecione um orçamento para ver os detalhes</p>';
}

async function updateStatus(orcamentoId, newStatus) {
    try {
        showLoading();
        
        const { error } = await db
            .from('orcamentos')
            .update({ status: newStatus })
            .eq('id', orcamentoId);
        
        if (error) throw error;
        
        showNotification(`Status atualizado para ${newStatus}!`, 'success');
        await loadOrcamentos();
        updateDashboard();
        showHistoricoDetails(orcamentoId);
        
    } catch (error) {
        console.error('Erro ao atualizar status:', error);
        showNotification('Erro ao atualizar status', 'error');
    } finally {
        hideLoading();
    }
}

async function editOrcamento(orcamentoId) {
    const orcamento = orcamentos.find(o => o.id === orcamentoId);
    if (!orcamento) return;
    
    // Carregar dados do orçamento no formulário
    currentOrcamento = orcamento;
    
    document.getElementById('orcamentoCliente').value = orcamento.cliente_id;
    document.getElementById('orcamentoDesconto').value = orcamento.desconto;
    
    // Carregar serviços
    servicosOrcamento = orcamento.orcamento_itens.map(item => ({
        servico_id: item.servico_id,
        descricao_servico: item.descricao_servico,
        valor_cobrado: item.valor_cobrado,
        quantidade: item.quantidade
    }));
    
    // Carregar formas de pagamento
    const formasPagamento = orcamento.formas_pagamento ? orcamento.formas_pagamento.split(', ') : [];
    document.querySelectorAll('.payment-option').forEach(option => {
        const checkbox = option.querySelector('input');
        const isSelected = formasPagamento.includes(checkbox.value);
        checkbox.checked = isSelected;
        option.classList.toggle('selected', isSelected);
    });
    
    renderServicosOrcamento();
    calculateTotal();
    
    document.getElementById('orcamentoSubmitText').textContent = 'Atualizar Orçamento';
    
    // Mudar para aba de orçamento
    switchTab('orcamento');
}

// Funções de geração de documentos
function generateOrcamentoText(orcamento) {
    const cliente = orcamento.clientes;
    const itens = orcamento.orcamento_itens || [];
    
    const subtotal = itens.reduce((sum, item) => sum + (item.valor_cobrado * item.quantidade), 0);
    
    return `*Orçamento - R.M. Estética Automotiva*
==================================
*Data:* ${formatDateTime(orcamento.created_at)}
*Cliente:* ${cliente?.nome || 'Não informado'}
*Veículo:* ${cliente?.carro || 'Não informado'}
*Placa:* ${cliente?.placa || 'Não informado'}

*SERVIÇOS:*
${itens.map(item => `- ${item.descricao_servico} (x${item.quantidade}) - ${formatCurrency(item.valor_cobrado * item.quantidade)}`).join('\n')}

*Subtotal:* ${formatCurrency(subtotal)}
*Desconto:* ${orcamento.desconto}%
*VALOR TOTAL:* ${formatCurrency(orcamento.valor_total)}

*Formas de Pagamento:* ${orcamento.formas_pagamento || 'Não informado'}

==================================
*VALIDADE DESTE ORÇAMENTO: 7 DIAS*
==================================
*R.M. Estética Automotiva*
CNPJ: 18.637.639/0001-48
📍 Rua 40, TV - Recanto dos Pássaros, Pq. Mambucaba, Angra dos Reis - RJ
*📞 Contato:* (24) 99948-6232

_Obrigado pela preferência e volte sempre! 👍_`;
}

function generateReciboText(orcamento) {
    const cliente = orcamento.clientes;
    const itens = orcamento.orcamento_itens || [];
    
    return `*Recibo de Serviço (Não Fiscal)*
==================================
*Data da Finalização:* ${formatDateTime(orcamento.updated_at || orcamento.created_at)}
*Cliente:* ${cliente?.nome || 'Não informado'}
*Veículo:* ${cliente?.carro || 'Não informado'}
*Placa:* ${cliente?.placa || 'Não informado'}

*Serviço(s) Realizado(s):*
${itens.map(item => `- ${item.descricao_servico} (x${item.quantidade})`).join('\n')}

*Valor Pago:* ${formatCurrency(orcamento.valor_total)}
*Forma de Pagamento:* ${orcamento.formas_pagamento || 'Não informado'}

==================================
*R.M. Estética Automotiva*
CNPJ: 18.637.639/0001-48
📍 Rua 40, TV - Recanto dos Pássaros, Pq. Mambucaba, Angra dos Reis - RJ
*📞 Contato:* (24) 99948-6232

_Obrigado pela preferência e volte sempre! 👍_`;
}

function copyOrcamentoText(orcamentoId) {
    const orcamento = orcamentos.find(o => o.id === orcamentoId);
    if (!orcamento) return;
    
    const text = generateOrcamentoText(orcamento);
    
    navigator.clipboard.writeText(text).then(() => {
        showNotification('Texto copiado para a área de transferência!', 'success');
    }).catch(() => {
        showNotification('Erro ao copiar texto', 'error');
    });
}

function sendWhatsApp(orcamentoId) {
    const orcamento = orcamentos.find(o => o.id === orcamentoId);
    if (!orcamento) return;
    
    const text = generateOrcamentoText(orcamento);
    const encoded = encodeURIComponent(text);
    
    let phone = '';
    if (orcamento.clientes?.telefone) {
        phone = orcamento.clientes.telefone.replace(/\D/g, '');
        if (phone.length === 11) {
            phone = `55${phone}`;
        }
    }
    
    const url = `https://wa.me/${phone}?text=${encoded}`;
    window.open(url, '_blank');
}

function downloadPDF(orcamentoId) {
    const orcamento = orcamentos.find(o => o.id === orcamentoId);
    if (!orcamento) return;
    
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Configurar fonte
    doc.setFont('helvetica');
    
    // Cabeçalho
    doc.setFontSize(16);
    doc.setTextColor(239, 68, 68);
    doc.text('R.M. Estética Automotiva', 20, 20);
    
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text('Orçamento', 20, 35);
    
    // Dados do cliente
    let y = 50;
    doc.setFontSize(10);
    doc.text(`Data: ${formatDateTime(orcamento.created_at)}`, 20, y);
    y += 10;
    doc.text(`Cliente: ${orcamento.clientes?.nome || 'Não informado'}`, 20, y);
    y += 10;
    doc.text(`Veículo: ${orcamento.clientes?.carro || 'Não informado'}`, 20, y);
    y += 10;
    doc.text(`Placa: ${orcamento.clientes?.placa || 'Não informado'}`, 20, y);
    y += 20;
    
    // Serviços
    doc.setFontSize(12);
    doc.text('SERVIÇOS:', 20, y);
    y += 10;
    
    doc.setFontSize(10);
    const itens = orcamento.orcamento_itens || [];
    itens.forEach(item => {
        const texto = `${item.descricao_servico} (x${item.quantidade}) - ${formatCurrency(item.valor_cobrado * item.quantidade)}`;
        doc.text(texto, 20, y);
        y += 10;
    });
    
    y += 10;
    
    // Totais
    const subtotal = itens.reduce((sum, item) => sum + (item.valor_cobrado * item.quantidade), 0);
    doc.text(`Subtotal: ${formatCurrency(subtotal)}`, 20, y);
    y += 10;
    doc.text(`Desconto: ${orcamento.desconto}%`, 20, y);
    y += 10;
    doc.setFontSize(12);
    doc.text(`VALOR TOTAL: ${formatCurrency(orcamento.valor_total)}`, 20, y);
    y += 15;
    
    // Forma de pagamento
    doc.setFontSize(10);
    doc.text(`Formas de Pagamento: ${orcamento.formas_pagamento || 'Não informado'}`, 20, y);
    y += 20;
    
    // Rodapé
    doc.text('VALIDADE DESTE ORÇAMENTO: 7 DIAS', 20, y);
    y += 15;
    
    doc.setFontSize(8);
    doc.text('R.M. Estética Automotiva', 20, y);
    y += 5;
    doc.text('CNPJ: 18.637.639/0001-48', 20, y);
    y += 5;
    doc.text('Rua 40, TV - Recanto dos Pássaros, Pq. Mambucaba, Angra dos Reis - RJ', 20, y);
    y += 5;
    doc.text('Contato: (24) 99948-6232', 20, y);
    y += 10;
    doc.text('Obrigado pela preferência e volte sempre!', 20, y);
    
    // Salvar PDF
    const filename = `Orcamento_${orcamento.clientes?.nome || 'Cliente'}_${formatDate(orcamento.created_at)}.pdf`;
    doc.save(filename);
}

function downloadRecibo(orcamentoId) {
    const orcamento = orcamentos.find(o => o.id === orcamentoId);
    if (!orcamento) return;
    
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Configurar fonte
    doc.setFont('helvetica');
    
    // Cabeçalho
    doc.setFontSize(16);
    doc.setTextColor(239, 68, 68);
    doc.text('R.M. Estética Automotiva', 20, 20);
    
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text('Recibo de Serviço (Não Fiscal)', 20, 35);
    
    // Dados do cliente
    let y = 50;
    doc.setFontSize(10);
    doc.text(`Data da Finalização: ${formatDateTime(orcamento.updated_at || orcamento.created_at)}`, 20, y);
    y += 10;
    doc.text(`Cliente: ${orcamento.clientes?.nome || 'Não informado'}`, 20, y);
    y += 10;
    doc.text(`Veículo: ${orcamento.clientes?.carro || 'Não informado'}`, 20, y);
    y += 10;
    doc.text(`Placa: ${orcamento.clientes?.placa || 'Não informado'}`, 20, y);
    y += 20;
    
    // Serviços realizados
    doc.setFontSize(12);
    doc.text('Serviço(s) Realizado(s):', 20, y);
    y += 10;
    
    doc.setFontSize(10);
    const itens = orcamento.orcamento_itens || [];
    itens.forEach(item => {
        const texto = `${item.descricao_servico} (x${item.quantidade})`;
        doc.text(texto, 20, y);
        y += 10;
    });
    
    y += 10;
    
    // Valor pago
    doc.setFontSize(12);
    doc.text(`Valor Pago: ${formatCurrency(orcamento.valor_total)}`, 20, y);
    y += 10;
    doc.text(`Forma de Pagamento: ${orcamento.formas_pagamento || 'Não informado'}`, 20, y);
    y += 20;
    
    // Rodapé
    doc.setFontSize(8);
    doc.text('R.M. Estética Automotiva', 20, y);
    y += 5;
    doc.text('CNPJ: 18.637.639/0001-48', 20, y);
    y += 5;
    doc.text('Rua 40, TV - Recanto dos Pássaros, Pq. Mambucaba, Angra dos Reis - RJ', 20, y);
    y += 5;
    doc.text('Contato: (24) 99948-6232', 20, y);
    y += 10;
    doc.text('Obrigado pela preferência e volte sempre!', 20, y);
    
    // Salvar PDF
    const filename = `Recibo_${orcamento.clientes?.nome || 'Cliente'}_${formatDate(orcamento.created_at)}.pdf`;
    doc.save(filename);
}

// Funções de UI
function showLoading() {
    const syncIcon = document.getElementById('syncIcon');
    const syncStatus = document.getElementById('syncStatus');
    
    syncIcon.classList.add('spin');
    syncStatus.textContent = 'Sincronizando...';
}

function hideLoading() {
    const syncIcon = document.getElementById('syncIcon');
    const syncStatus = document.getElementById('syncStatus');
    
    syncIcon.classList.remove('spin');
    syncStatus.textContent = 'Sincronizado';
}

function showNotification(message, type = 'info') {
    const notification = document.getElementById('notification');
    const icon = notification.querySelector('.notification-icon');
    const messageEl = notification.querySelector('.notification-message');
    
    // Definir ícone baseado no tipo
    const icons = {
        success: 'fas fa-check-circle',
        error: 'fas fa-exclamation-circle',
        warning: 'fas fa-exclamation-triangle',
        info: 'fas fa-info-circle'
    };
    
    icon.className = `notification-icon ${icons[type]}`;
    messageEl.textContent = message;
    
    // Remover classes anteriores e adicionar nova
    notification.className = `notification ${type}`;
    notification.classList.add('show');
    
    // Remover após 5 segundos
    setTimeout(() => {
        notification.classList.remove('show');
    }, 5000);
}

function showConfirm(title, message, onConfirm) {
    document.getElementById('confirmTitle').textContent = title;
    document.getElementById('confirmMessage').textContent = message;
    
    const confirmButton = document.getElementById('confirmButton');
    confirmButton.onclick = () => {
        onConfirm();
        closeModal();
    };
    
    document.getElementById('modalOverlay').classList.add('active');
}

function closeModal() {
    document.getElementById('modalOverlay').classList.remove('active');
}

function showConfetti() {
    const confettiContainer = document.createElement('div');
    confettiContainer.className = 'confetti';
    document.body.appendChild(confettiContainer);
    
    // Cores dos confetes
    const colors = ['#ef4444', '#22c55e', '#3b82f6', '#f97316', '#8b5cf6'];
    
    // Criar confetes
    for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti-piece';
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.animationDelay = Math.random() * 2 + 's';
        confetti.style.animationDuration = (Math.random() * 3 + 2) + 's';
        confettiContainer.appendChild(confetti);
    }
    
    // Remover após a animação
    setTimeout(() => {
        document.body.removeChild(confettiContainer);
    }, 5000);
}

// Funções de aplicação de filtros
function aplicarFiltros() {
    filterHistorico();
}

// Validação de dados
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function validatePhone(phone) {
    const phoneRegex = /^\(\d{2}\)\s\d{4,5}-\d{4}$/;
    return phoneRegex.test(phone);
}

function validatePlaca(placa) {
    const placaRegex = /^[A-Z]{3}-\d{4}$/;
    return placaRegex.test(placa);
}

// Função para debounce (otimização de performance)
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

// Função para throttle (otimização de performance)
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Função para detectar dispositivo móvel
function isMobile() {
    return window.innerWidth <= 768;
}

// Função para otimizar performance em dispositivos móveis
function optimizeForMobile() {
    if (isMobile()) {
        // Reduzir animações em dispositivos móveis
        document.body.classList.add('mobile-optimized');
        
        // Implementar lazy loading para tabelas grandes
        const tables = document.querySelectorAll('.data-table');
        tables.forEach(table => {
            if (table.rows.length > 50) {
                // Implementar paginação virtual
                console.log('Implementar paginação para tabela grande');
            }
        });
    }
}

// Event listener para mudanças de tamanho da tela
window.addEventListener('resize', throttle(optimizeForMobile, 250));

// Função para salvar estado local
function saveLocalState() {
    const state = {
        currentTab: currentTab,
        servicosOrcamento: servicosOrcamento,
        currentOrcamento: currentOrcamento
    };
    
    localStorage.setItem('rm_estetica_state', JSON.stringify(state));
}

// Função para restaurar estado local
function restoreLocalState() {
    const savedState = localStorage.getItem('rm_estetica_state');
    if (savedState) {
        try {
            const state = JSON.parse(savedState);
            currentTab = state.currentTab || 'painel';
            servicosOrcamento = state.servicosOrcamento || [];
            currentOrcamento = state.currentOrcamento || null;
            
            // Aplicar estado restaurado
            switchTab(currentTab);
            renderServicosOrcamento();
            calculateTotal();
            
        } catch (error) {
            console.error('Erro ao restaurar estado:', error);
        }
    }
}

// Salvar estado periodicamente
setInterval(saveLocalState, 30000); // A cada 30 segundos

// Função para logging de erros
function logError(error, context = '') {
    const errorLog = {
        timestamp: new Date().toISOString(),
        error: error.message,
        stack: error.stack,
        context: context,
        userAgent: navigator.userAgent,
        url: window.location.href
    };
    
    console.error('Error logged:', errorLog);
}

// Wrapper para funções assíncronas com tratamento de erro
function withErrorHandling(fn) {
    return async function(...args) {
        try {
            return await fn.apply(this, args);
        } catch (error) {
            logError(error, fn.name);
            showNotification('Ocorreu um erro inesperado', 'error');
            throw error;
        }
    };
}

// Aplicar tratamento de erro a funções críticas
const originalLoadClientes = loadClientes;
loadClientes = withErrorHandling(originalLoadClientes);

const originalLoadServicos = loadServicos;
loadServicos = withErrorHandling(originalLoadServicos);

const originalLoadOrcamentos = loadOrcamentos;
loadOrcamentos = withErrorHandling(originalLoadOrcamentos);

// Função para validação de formulário
function validateForm(formElement) {
    const inputs = formElement.querySelectorAll('input[required], select[required]');
    let isValid = true;
    
    inputs.forEach(input => {
        if (!input.value.trim()) {
            isValid = false;
            input.classList.add('error');
        } else {
            input.classList.remove('error');
        }
    });
    
    return isValid;
}

// Função para sanitizar entrada
function sanitizeInput(input) {
    if (typeof input !== 'string') return input;
    
    return input
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
}

// Função para verificar conectividade
function checkConnection() {
    if (!navigator.onLine) {
        showNotification('Sem conexão com a internet', 'warning');
        return false;
    }
    return true;
}

// Event listeners para conectividade
window.addEventListener('online', () => {
    showNotification('Conexão restaurada', 'success');
    loadInitialData();
});

window.addEventListener('offline', () => {
    showNotification('Sem conexão com a internet', 'warning');
});

// ✅ CORREÇÃO DOS ATALHOS DE TECLADO - PROBLEMA RESOLVIDO
document.addEventListener('keydown', function(e) {
    // Verificar se o usuário está digitando em um campo de input
    const isInputActive = document.activeElement.tagName === 'INPUT' || 
                         document.activeElement.tagName === 'TEXTAREA' || 
                         document.activeElement.tagName === 'SELECT' ||
                         document.activeElement.isContentEditable;
    
    // Se estiver em um campo de input, não processar atalhos de navegação
    if (isInputActive) {
        return;
    }
    
    // Ctrl + N para novo cliente
    if (e.ctrlKey && e.key === 'n') {
        e.preventDefault();
        if (currentTab === 'clientes') {
            toggleClienteForm();
        } else if (currentTab === 'servicos') {
            toggleServicoForm();
        } else if (currentTab === 'orcamento') {
            limparOrcamento();
        }
    }
    
    // Ctrl + S para salvar
    if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        const activeForm = document.querySelector('.cliente-form.active, .servico-form.active');
        if (activeForm) {
            activeForm.querySelector('form').dispatchEvent(new Event('submit'));
        }
    }
    
    // Ctrl + F para pesquisar
    if (e.ctrlKey && e.key === 'f') {
        e.preventDefault();
        const searchInput = document.querySelector(`#search${currentTab.charAt(0).toUpperCase() + currentTab.slice(1)}`);
        if (searchInput) {
            searchInput.focus();
        }
    }
    
    // Números 1-5 para navegar entre abas (APENAS quando não estiver em campos de input)
    if (e.key >= '1' && e.key <= '5' && !e.ctrlKey && !e.altKey) {
        const tabs = ['painel', 'clientes', 'servicos', 'orcamento', 'historico'];
        const tabIndex = parseInt(e.key) - 1;
        if (tabs[tabIndex]) {
            switchTab(tabs[tabIndex]);
        }
    }
});

// Função para setup inicial após carregamento
function setupInitialState() {
    // Restaurar estado local se existir
    restoreLocalState();
    
    // Otimizar para dispositivos móveis
    optimizeForMobile();
    
    // Configurar tooltips
    setupTooltips();
    
    // Configurar service worker para funcionalidade offline
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('Service Worker registrado:', registration);
            })
            .catch(error => {
                console.log('Erro ao registrar Service Worker:', error);
            });
    }
}

// Função para configurar tooltips
function setupTooltips() {
    const tooltipElements = document.querySelectorAll('[data-tooltip]');
    tooltipElements.forEach(element => {
        element.addEventListener('mouseenter', showTooltip);
        element.addEventListener('mouseleave', hideTooltip);
    });
}

function showTooltip(e) {
    const tooltip = document.createElement('div');
    tooltip.className = 'tooltip';
    tooltip.textContent = e.target.getAttribute('data-tooltip');
    document.body.appendChild(tooltip);
    
    const rect = e.target.getBoundingClientRect();
    tooltip.style.left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2) + 'px';
    tooltip.style.top = rect.top - tooltip.offsetHeight - 10 + 'px';
    
    setTimeout(() => tooltip.classList.add('show'), 100);
}

function hideTooltip() {
    const tooltip = document.querySelector('.tooltip');
    if (tooltip) {
        tooltip.remove();
    }
}

// Executar setup inicial
document.addEventListener('DOMContentLoaded', setupInitialState);

// Adicionar CSS para tooltips e validação
const tooltipStyles = `
    .tooltip {
        position: absolute;
        background-color: var(--bg-card);
        color: var(--text-light);
        padding: 8px 12px;
        border-radius: 4px;
        font-size: 12px;
        z-index: 10000;
        pointer-events: none;
        opacity: 0;
        transition: opacity 0.3s ease;
        max-width: 200px;
        box-shadow: var(--shadow-lg);
    }
    
    .tooltip.show {
        opacity: 1;
    }
    
    .tooltip::before {
        content: '';
        position: absolute;
        top: 100%;
        left: 50%;
        transform: translateX(-50%);
        border: 5px solid transparent;
        border-top-color: var(--bg-card);
    }
    
    .form-group input.error,
    .form-group select.error {
        border-color: #ef4444;
        box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
    }
    
    @media (max-width: 480px) {
        .tooltip {
            font-size: 11px;
            padding: 6px 8px;
            max-width: 150px;
        }
    }
`;

// Adicionar estilos ao head
const styleElement = document.createElement('style');
styleElement.textContent = tooltipStyles;
document.head.appendChild(styleElement);

// Log de inicialização
console.log('R.M. Estética Automotiva - Gestor PRO+ inicializado com sucesso!');
console.log('Versão: 1.0.0 - Correção de Atalhos Aplicada');
console.log('Problema dos números resolvido: Agora é possível digitar números em campos sem mudar de aba');
// === INTEGRAÇÕES MOBILE E CRM ===

// Geolocalização
function getCurrentLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            position => {
                const { latitude, longitude } = position.coords;
                updateLocationDisplay(latitude, longitude);
                updateLocationInput(latitude, longitude);
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

async function updateLocationDisplay(lat, lon) {
    try {
        const response = await fetch(`https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lon}&key=YOUR_API_KEY&language=pt&pretty=1`);
        const data = await response.json();
        
        if (data.results && data.results.length > 0) {
            const address = data.results[0].formatted;
            document.getElementById('currentLocation').textContent = address;
        }
    } catch (error) {
        console.error('Erro ao buscar endereço:', error);
        document.getElementById('currentLocation').textContent = `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
    }
}

function updateLocationInput(lat, lon) {
    const locationInput = document.getElementById('orcamentoLocal');
    if (locationInput) {
        locationInput.value = `${lat.toFixed(6)}, ${lon.toFixed(6)}`;
    }
}

// Camera Integration
function openCamera() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment';
    
    input.onchange = function(event) {
        const file = event.target.files[0];
        if (file) {
            handleCameraImage(file);
        }
    };
    
    input.click();
}

function handleCameraImage(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        const imageData = e.target.result;
        saveImageToClient(imageData);
    };
    reader.readAsDataURL(file);
}

function saveImageToClient(imageData) {
    // Save image to localStorage or IndexedDB
    const images = JSON.parse(localStorage.getItem('client_images') || '[]');
    images.push({
        id: Date.now(),
         imageData,
        timestamp: new Date().toISOString()
    });
    localStorage.setItem('client_images', JSON.stringify(images));
    
    showNotification('Imagem salva com sucesso', 'success');
}

// Enhanced Mobile Functions
function toggleClienteFilters() {
    const filters = document.getElementById('clienteFilters');
    if (filters) {
        filters.classList.toggle('active');
    }
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

function loadDraft() {
    const draft = localStorage.getItem('orcamento_draft');
    if (draft) {
        const data = JSON.parse(draft);
        
        document.getElementById('orcamentoCliente').value = data.cliente || '';
        document.getElementById('orcamentoDesconto').value = data.desconto || '0';
        document.getElementById('orcamentoLocal').value = data.local || '';
        
        servicosOrcamento = data.servicos || [];
        renderServicosOrcamento();
        calculateTotal();
        
        showNotification('Rascunho carregado', 'success');
    }
}

// Quick Actions
function quickCall() {
    const phone = prompt('Digite o número de telefone:');
    if (phone) {
        window.location.href = `tel:${phone}`;
    }
}

function quickEmail() {
    const email = prompt('Digite o email:');
    if (email) {
        window.location.href = `mailto:${email}`;
    }
}

function quickVisit() {
    const address = prompt('Digite o endereço:');
    if (address) {
        window.open(`https://maps.google.com/maps?q=${encodeURIComponent(address)}`, '_blank');
    }
}

// Advanced Analytics
function exportAnalytics() {
    const analytics = {
        conversions: crmSystem?.analytics?.conversionRate || 0,
        pipeline: crmSystem?.analytics?.pipelineValue || 0,
        avgTicket: crmSystem?.analytics?.averageTicket || 0,
        responseTime: crmSystem?.analytics?.responseTime || 0,
        exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(analytics, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics_${formatDate(new Date()).replace(/\//g, '-')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showNotification('Analytics exportado com sucesso', 'success');
}

function exportAllData() {
    const allData = {
        clientes: clientes,
        servicos: servicos,
        orcamentos: orcamentos,
        analytics: crmSystem?.analytics || {},
        exportDate: new Date().toISOString(),
        version: '1.0.1'
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
    
    showNotification('Backup completo exportado', 'success');
}

// Settings Functions
function toggleNotifications() {
    const checkbox = document.getElementById('notificationCheckbox');
    const enabled = checkbox.checked;
    
    localStorage.setItem('notifications_enabled', enabled);
    
    if (enabled && pwaManager) {
        pwaManager.requestNotificationPermission();
    }
    
    showNotification(enabled ? 'Notificações ativadas' : 'Notificações desativadas', 'info');
}

function toggleDarkMode() {
    const checkbox = document.getElementById('darkModeCheckbox');
    const enabled = checkbox.checked;
    
    document.body.setAttribute('data-theme', enabled ? 'dark' : 'light');
    localStorage.setItem('theme', enabled ? 'dark' : 'light');
    
    showNotification(enabled ? 'Modo escuro ativado' : 'Modo claro ativado', 'info');
}

// Tutorial System
function showTutorial() {
    const tutorial = document.createElement('div');
    tutorial.className = 'tutorial-overlay';
    tutorial.innerHTML = `
        <div class="tutorial-content">
            <h2>Bem-vindo ao R.M. CRM Pro+</h2>
            <div class="tutorial-steps">
                <div class="tutorial-step active">
                    <h3>Dashboard</h3>
                    <p>Veja todas as métricas importantes do seu negócio</p>
                </div>
                <div class="tutorial-step">
                    <h3>Pipeline</h3>
                    <p>Gerencie seus clientes através do funil de vendas</p>
                </div>
                <div class="tutorial-step">
                    <h3>Follow-ups</h3>
                    <p>Nunca perca uma oportunidade com lembretes automáticos</p>
                </div>
            </div>
            <div class="tutorial-actions">
                <button class="btn btn-secondary" onclick="closeTutorial()">Pular</button>
                <button class="btn btn-primary" onclick="nextTutorialStep()">Próximo</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(tutorial);
}

function closeTutorial() {
    const tutorial = document.querySelector('.tutorial-overlay');
    if (tutorial) {
        tutorial.remove();
    }
}

function nextTutorialStep() {
    // Implementar navegação do tutorial
    console.log('Próximo passo do tutorial');
}

// Loading Progress
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
            loading.remove();
        }, 500);
    }
}

// Initialize loading sequence
document.addEventListener('DOMContentLoaded', function() {
    let progress = 0;
    const loadingInterval = setInterval(() => {
        progress += Math.random() * 30;
        if (progress >= 100) {
            progress = 100;
            clearInterval(loadingInterval);
            setTimeout(() => {
                hideLoadingScreen();
            }, 500);
        }
        updateLoadingProgress(progress);
    }, 200);
});

// Enhanced Mobile Navigation
function handleMobileNavigation() {
    const mobileNavItems = document.querySelectorAll('.mobile-nav-item');
    
    mobileNavItems.forEach(item => {
        item.addEventListener('click', function() {
            const tab = this.dataset.tab;
            
            // Remove active class from all items
            mobileNavItems.forEach(navItem => {
                navItem.classList.remove('active');
            });
            
            // Add active class to clicked item
            this.classList.add('active');
            
            // Switch to selected tab
            switchTab(tab);
        });
    });
}

// Initialize mobile navigation
document.addEventListener('DOMContentLoaded', function() {
    handleMobileNavigation();
});

// Export global functions
window.getCurrentLocation = getCurrentLocation;
window.openCamera = openCamera;
window.saveAsDraft = saveAsDraft;
window.loadDraft = loadDraft;
window.exportAnalytics = exportAnalytics;
window.exportAllData = exportAllData;
window.toggleNotifications = toggleNotifications;
window.toggleDarkMode = toggleDarkMode;
window.showTutorial = showTutorial;
window.closeTutorial = closeTutorial;
window.nextTutorialStep = nextTutorialStep;
window.quickCall = quickCall;
window.quickEmail = quickEmail;
window.quickVisit = quickVisit;
