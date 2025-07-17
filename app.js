// Supabase Configuration
const SUPABASE_URL = 'https://bezbszbkaifcanqsmdbi.supabase.co/';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV5bXVuc2F2bnBmY3N1em5ydWdpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3ODU3ODgsImV4cCI6MjA2NjM2MTc4OH0.Kz__-jB9SsD-w7SuwlYCWPuEOcOX9epRE9CB5jd4eFY';

// Mock Data for fallback
const mockData = {
  clientes: [
    {"id": "1", "nome": "João Silva", "telefone": "(11) 99999-9999", "carro": "Honda Civic", "placa": "ABC-1234"},
    {"id": "2", "nome": "Maria Santos", "telefone": "(11) 88888-8888", "carro": "Toyota Corolla", "placa": "DEF-5678"},
    {"id": "3", "nome": "Carlos Oliveira", "telefone": "(11) 77777-7777", "carro": "Ford Ka", "placa": "GHI-9012"},
    {"id": "4", "nome": "Ana Costa", "telefone": "(11) 66666-6666", "carro": "Volkswagen Gol", "placa": "JKL-3456"},
    {"id": "5", "nome": "Pedro Lima", "telefone": "(11) 55555-5555", "carro": "Chevrolet Onix", "placa": "MNO-7890"}
  ],
  servicos: [
    {"id": "1", "descricao": "Enceramento Completo", "valor": 80.00},
    {"id": "2", "descricao": "Lavagem Simples", "valor": 25.00},
    {"id": "3", "descricao": "Lavagem Completa", "valor": 45.00},
    {"id": "4", "descricao": "Cera Dupla", "valor": 120.00},
    {"id": "5", "descricao": "Limpeza Interna", "valor": 60.00}
  ],
  orcamentos: [
    {
      "id": "1", "cliente_id": "1", "valor_total": 80.00, "status": "Finalizado", "desconto": 0,
      "formas_pagamento": "Dinheiro", "created_at": "2025-07-15T10:00:00Z", "updated_at": "2025-07-15T10:00:00Z"
    },
    {
      "id": "2", "cliente_id": "2", "valor_total": 45.00, "status": "Aprovado", "desconto": 0,
      "formas_pagamento": "PIX", "created_at": "2025-07-16T14:30:00Z", "updated_at": "2025-07-16T14:30:00Z"
    },
    {
      "id": "3", "cliente_id": "3", "valor_total": 120.00, "status": "Orçamento", "desconto": 10,
      "formas_pagamento": "Cartão de Crédito", "created_at": "2025-07-17T09:15:00Z", "updated_at": "2025-07-17T09:15:00Z"
    },
    {
      "id": "4", "cliente_id": "4", "valor_total": 60.00, "status": "Finalizado", "desconto": 0,
      "formas_pagamento": "Dinheiro", "created_at": "2025-06-20T11:30:00Z", "updated_at": "2025-06-20T11:30:00Z"
    },
    {
      "id": "5", "cliente_id": "5", "valor_total": 25.00, "status": "Finalizado", "desconto": 0,
      "formas_pagamento": "PIX", "created_at": "2025-05-10T16:45:00Z", "updated_at": "2025-05-10T16:45:00Z"
    },
    {
      "id": "6", "cliente_id": "1", "valor_total": 120.00, "status": "Finalizado", "desconto": 0,
      "formas_pagamento": "Cartão de Débito", "created_at": "2025-04-25T14:20:00Z", "updated_at": "2025-04-25T14:20:00Z"
    },
    {
      "id": "7", "cliente_id": "2", "valor_total": 45.00, "status": "Cancelado", "desconto": 0,
      "formas_pagamento": "Dinheiro", "created_at": "2025-03-15T10:10:00Z", "updated_at": "2025-03-15T10:10:00Z"
    }
  ],
  despesas: [
    {"id": "1", "data": "2025-07-15", "descricao": "Produtos de Limpeza", "valor": 150.00, "categoria": "Produtos"},
    {"id": "2", "data": "2025-07-14", "descricao": "Energia Elétrica", "valor": 280.00, "categoria": "Utilidades"},
    {"id": "3", "data": "2025-07-13", "descricao": "Manutenção Equipamentos", "valor": 350.00, "categoria": "Manutenção"},
    {"id": "4", "data": "2025-07-12", "descricao": "Material de Marketing", "valor": 120.00, "categoria": "Marketing"},
    {"id": "5", "data": "2025-07-11", "descricao": "Água", "valor": 80.00, "categoria": "Utilidades"},
    {"id": "6", "data": "2025-07-10", "descricao": "Cera Automotiva", "valor": 200.00, "categoria": "Produtos"}
  ],
  crm_interactions: [
    {
      "id": "1", "cliente_id": "1", "interaction_type": "WhatsApp", "notes": "Cliente interessado em serviço de enceramento",
      "follow_up_date": "2025-07-20", "created_at": "2025-07-17T08:00:00Z"
    },
    {
      "id": "2", "cliente_id": "3", "interaction_type": "Ligação", "notes": "Reagendar serviço para próxima semana",
      "follow_up_date": "2025-07-22", "created_at": "2025-07-16T15:30:00Z"
    }
  ]
};

// Global State Management
let state = {
  clientes: [],
  servicos: [],
  orcamentos: [],
  despesas: [],
  crm_interactions: [],
  currentTab: 'dashboard',
  editandoClienteId: null,
  orcamentoSelecionado: null,
  filtros: {
    status: '',
    searchClientes: '',
    searchOrcamentos: '',
    periodoCrm: 15,
    mesDespesas: new Date().toISOString().substr(0, 7)
  },
  loading: false,
  online: navigator.onLine,
  usingMockData: true
};

// Utility Functions
function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
}

function formatDate(date) {
  return new Date(date).toLocaleDateString('pt-BR');
}

function formatPhone(phone) {
  return phone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
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

// Notification System
function showNotification(message, type = 'info', duration = 5000) {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  const typeIcons = {
    success: 'fas fa-check-circle',
    error: 'fas fa-exclamation-circle',
    warning: 'fas fa-exclamation-triangle',
    info: 'fas fa-info-circle'
  };

  const typeTitles = {
    success: 'Sucesso',
    error: 'Erro',
    warning: 'Aviso',
    info: 'Informação'
  };

  toast.innerHTML = `
    <div class="toast-header">
      <div class="toast-title">
        <i class="${typeIcons[type]}"></i>
        ${typeTitles[type]}
      </div>
      <button class="toast-close" onclick="closeToast(this)">
        <i class="fas fa-times"></i>
      </button>
    </div>
    <div class="toast-message">${message}</div>
  `;

  container.appendChild(toast);
  
  // Animate in
  requestAnimationFrame(() => {
    toast.classList.add('show');
  });

  // Auto remove
  setTimeout(() => {
    if (toast.parentNode) {
      closeToast(toast.querySelector('.toast-close'));
    }
  }, duration);
}

function closeToast(button) {
  const toast = button.closest('.toast');
  if (toast) {
    toast.classList.remove('show');
    setTimeout(() => {
      if (toast.parentNode) {
        toast.remove();
      }
    }, 300);
  }
}

// Loading Management
function showLoading() {
  state.loading = true;
  const overlay = document.getElementById('loadingOverlay');
  if (overlay) {
    overlay.classList.add('visible');
  }
}

function hideLoading() {
  state.loading = false;
  const overlay = document.getElementById('loadingOverlay');
  if (overlay) {
    overlay.classList.remove('visible');
  }
}

// Confetti Animation
function showConfetti() {
  if (typeof confetti !== 'undefined') {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  }
}

// Network Status
function updateNetworkStatus() {
  const statusElement = document.getElementById('networkStatus');
  if (!statusElement) return;
  
  const isOnline = navigator.onLine;
  
  if (isOnline !== state.online) {
    state.online = isOnline;
    
    if (isOnline) {
      statusElement.className = 'status-indicator online';
      statusElement.innerHTML = '<i class="fas fa-wifi"></i><span>Online</span>';
      showNotification('Conexão restabelecida', 'success');
    } else {
      statusElement.className = 'status-indicator offline';
      statusElement.innerHTML = '<i class="fas fa-wifi-slash"></i><span>Offline</span>';
      showNotification('Você está offline', 'error');
    }
  }
}

// Data Loading
function loadMockData() {
  state.clientes = [...mockData.clientes];
  state.servicos = [...mockData.servicos];
  state.orcamentos = [...mockData.orcamentos];
  state.despesas = [...mockData.despesas];
  state.crm_interactions = [...mockData.crm_interactions];
  state.usingMockData = true;
}

function initializeApp() {
  showLoading();
  
  // Load mock data
  loadMockData();
  
  // Set current date for forms
  const today = new Date().toISOString().substr(0, 10);
  const despesaDataEl = document.getElementById('despesaData');
  if (despesaDataEl) {
    despesaDataEl.value = today;
  }
  
  const monthFilterEl = document.getElementById('monthFilter');
  if (monthFilterEl) {
    monthFilterEl.value = state.filtros.mesDespesas;
  }
  
  // Initialize the dashboard
  setTimeout(() => {
    renderCurrentTab();
    hideLoading();
    showNotification('Sistema iniciado com dados de exemplo', 'info');
  }, 1000);
}

// Tab Management
function switchTab(tabName) {
  console.log('Switching to tab:', tabName);
  
  // Hide all tabs
  document.querySelectorAll('.tab-content').forEach(tab => {
    tab.classList.remove('active');
  });
  
  // Remove active class from all nav tabs
  document.querySelectorAll('.nav-tab').forEach(tab => {
    tab.classList.remove('active');
  });
  
  // Show selected tab
  const selectedTab = document.getElementById(tabName);
  if (selectedTab) {
    selectedTab.classList.add('active');
  }
  
  // Add active class to nav tab
  const navTab = document.querySelector(`[data-tab="${tabName}"]`);
  if (navTab) {
    navTab.classList.add('active');
  }
  
  state.currentTab = tabName;
  renderCurrentTab();
}

function renderCurrentTab() {
  console.log('Rendering tab:', state.currentTab);
  
  switch (state.currentTab) {
    case 'dashboard':
      renderDashboard();
      break;
    case 'crm':
      renderCRM();
      break;
    case 'despesas':
      renderDespesas();
      break;
  }
}

// Dashboard Functions
function renderDashboard() {
  console.log('Rendering dashboard');
  renderMetrics();
  renderServicesChart();
  renderRecentOrders();
  renderClientsList();
  renderOrdersList();
}

function renderMetrics() {
  const totalClientes = state.clientes.length;
  const orcamentosPendentes = state.orcamentos.filter(o => o.status === 'Orçamento').length;
  const orcamentosAprovados = state.orcamentos.filter(o => o.status === 'Aprovado').length;
  
  const currentMonth = new Date().toISOString().substr(0, 7);
  const orcamentosFinalizados = state.orcamentos.filter(o => 
    o.status === 'Finalizado' && o.created_at.startsWith(currentMonth)
  ).length;
  
  const receitaTotal = state.orcamentos
    .filter(o => o.status === 'Finalizado')
    .reduce((sum, o) => sum + (o.valor_total || 0), 0);

  const totalClientesEl = document.getElementById('totalClientes');
  const orcamentosPendentesEl = document.getElementById('orcamentosPendentes');
  const orcamentosAprovadosEl = document.getElementById('orcamentosAprovados');
  const orcamentosFinalizadosEl = document.getElementById('orcamentosFinalizados');
  const receitaTotalEl = document.getElementById('receitaTotal');

  if (totalClientesEl) totalClientesEl.textContent = totalClientes;
  if (orcamentosPendentesEl) orcamentosPendentesEl.textContent = orcamentosPendentes;
  if (orcamentosAprovadosEl) orcamentosAprovadosEl.textContent = orcamentosAprovados;
  if (orcamentosFinalizadosEl) orcamentosFinalizadosEl.textContent = orcamentosFinalizados;
  if (receitaTotalEl) receitaTotalEl.textContent = formatCurrency(receitaTotal);
}

function renderServicesChart() {
  const ctx = document.getElementById('servicesChart');
  if (!ctx) return;
  
  const context = ctx.getContext('2d');
  
  // Get last 6 months data
  const months = [];
  const data = [];
  
  for (let i = 5; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const monthStr = date.toISOString().substr(0, 7);
    
    months.push(date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }));
    
    const count = state.orcamentos.filter(o => 
      o.status === 'Finalizado' && o.created_at.startsWith(monthStr)
    ).length;
    
    data.push(count);
  }

  // Destroy existing chart if it exists
  if (window.servicesChart) {
    window.servicesChart.destroy();
  }

  // Create new chart
  window.servicesChart = new Chart(context, {
    type: 'bar',
    data: {
      labels: months,
      datasets: [{
        label: 'Serviços Finalizados',
        data: data,
        backgroundColor: '#1FB8CD',
        borderColor: '#1FB8CD',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
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

function renderRecentOrders() {
  const recentOrders = state.orcamentos.slice(0, 8);
  const container = document.getElementById('recentOrcamentos');
  
  if (!container) return;
  
  container.innerHTML = recentOrders.map(order => {
    const cliente = state.clientes.find(c => c.id === order.cliente_id);
    return `
      <div class="activity-item">
        <div class="activity-header">
          <div class="activity-client">${cliente ? cliente.nome : 'Cliente não encontrado'}</div>
          <div class="activity-status ${order.status.toLowerCase()}">${order.status}</div>
        </div>
        <div class="activity-details">
          <span>${formatDate(order.created_at)}</span>
          <span class="activity-value">${formatCurrency(order.valor_total || 0)}</span>
        </div>
      </div>
    `;
  }).join('');
}

function renderClientsList() {
  const searchTerm = state.filtros.searchClientes.toLowerCase();
  const filteredClients = state.clientes.filter(client =>
    client.nome.toLowerCase().includes(searchTerm) ||
    (client.telefone && client.telefone.includes(searchTerm)) ||
    (client.carro && client.carro.toLowerCase().includes(searchTerm)) ||
    (client.placa && client.placa.toLowerCase().includes(searchTerm))
  );

  const container = document.getElementById('clientsList');
  
  if (!container) return;
  
  container.innerHTML = filteredClients.map(client => `
    <div class="client-item">
      <div class="client-header">
        <div class="client-name">${client.nome}</div>
        <div class="client-actions">
          <button class="btn btn-sm btn-warning" onclick="editClient('${client.id}')">
            <i class="fas fa-edit"></i>
          </button>
          <button class="btn btn-sm btn-error" onclick="deleteClient('${client.id}')">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
      <div class="client-details">
        <div class="detail-item">
          <div class="detail-label">Telefone:</div>
          <div class="detail-value">${client.telefone || 'N/A'}</div>
        </div>
        <div class="detail-item">
          <div class="detail-label">Carro:</div>
          <div class="detail-value">${client.carro || 'N/A'}</div>
        </div>
        <div class="detail-item">
          <div class="detail-label">Placa:</div>
          <div class="detail-value">${client.placa || 'N/A'}</div>
        </div>
      </div>
    </div>
  `).join('');
}

function renderOrdersList() {
  let filteredOrders = [...state.orcamentos];
  
  if (state.filtros.status) {
    filteredOrders = filteredOrders.filter(order => order.status === state.filtros.status);
  }
  
  if (state.filtros.searchOrcamentos) {
    const searchTerm = state.filtros.searchOrcamentos.toLowerCase();
    filteredOrders = filteredOrders.filter(order => {
      const client = state.clientes.find(c => c.id === order.cliente_id);
      return client && client.nome.toLowerCase().includes(searchTerm);
    });
  }

  const container = document.getElementById('ordersList');
  
  if (!container) return;
  
  container.innerHTML = filteredOrders.map(order => {
    const client = state.clientes.find(c => c.id === order.cliente_id);
    return `
      <div class="order-item">
        <div class="order-header">
          <div class="order-client">${client ? client.nome : 'Cliente não encontrado'}</div>
          <div class="order-actions">
            <button class="btn btn-sm btn-success" onclick="openPdfModal('${order.id}')">
              <i class="fas fa-file-pdf"></i>
            </button>
            <button class="btn btn-sm btn-warning" onclick="editOrder('${order.id}')">
              <i class="fas fa-edit"></i>
            </button>
          </div>
        </div>
        <div class="order-details">
          <div class="detail-item">
            <div class="detail-label">Data:</div>
            <div class="detail-value">${formatDate(order.created_at)}</div>
          </div>
          <div class="detail-item">
            <div class="detail-label">Status:</div>
            <div class="detail-value">
              <span class="status ${order.status.toLowerCase()}">${order.status}</span>
            </div>
          </div>
          <div class="detail-item">
            <div class="detail-label">Valor:</div>
            <div class="detail-value">${formatCurrency(order.valor_total || 0)}</div>
          </div>
          <div class="detail-item">
            <div class="detail-label">Pagamento:</div>
            <div class="detail-value">${order.formas_pagamento || 'N/A'}</div>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// Client Management
function saveClient(event) {
  event.preventDefault();
  
  const formData = new FormData(event.target);
  const clientData = {
    nome: formData.get('nome'),
    telefone: formData.get('telefone'),
    carro: formData.get('carro') || null,
    placa: formData.get('placa') || null
  };

  console.log('Saving client:', clientData);

  // Validation
  if (!clientData.nome.trim()) {
    showNotification('Nome é obrigatório', 'error');
    return;
  }

  if (!clientData.telefone.trim()) {
    showNotification('Telefone é obrigatório', 'error');
    return;
  }

  try {
    showLoading();
    
    if (state.editandoClienteId) {
      // Update existing client
      const index = state.clientes.findIndex(c => c.id === state.editandoClienteId);
      if (index !== -1) {
        state.clientes[index] = { ...state.clientes[index], ...clientData };
      }
      showNotification('Cliente atualizado com sucesso!', 'success');
      state.editandoClienteId = null;
    } else {
      // Add new client
      const newClient = { ...clientData, id: Date.now().toString() };
      state.clientes.push(newClient);
      showNotification('Cliente cadastrado com sucesso!', 'success');
      showConfetti();
    }
    
    document.getElementById('clientForm').reset();
    document.getElementById('cancelEditClient').style.display = 'none';
    document.querySelector('#clientForm button[type="submit"]').innerHTML = 
      '<i class="fas fa-save"></i> Salvar Cliente';
    
    renderClientsList();
    renderMetrics();
    
  } catch (error) {
    showNotification(`Erro ao salvar cliente: ${error.message}`, 'error');
  } finally {
    hideLoading();
  }
}

function editClient(clientId) {
  const client = state.clientes.find(c => c.id === clientId);
  if (!client) return;

  state.editandoClienteId = clientId;
  
  document.getElementById('clientName').value = client.nome;
  document.getElementById('clientPhone').value = client.telefone || '';
  document.getElementById('clientCar').value = client.carro || '';
  document.getElementById('clientPlate').value = client.placa || '';
  
  document.getElementById('cancelEditClient').style.display = 'inline-flex';
  document.querySelector('#clientForm button[type="submit"]').innerHTML = 
    '<i class="fas fa-save"></i> Atualizar Cliente';
}

function cancelEditClient() {
  state.editandoClienteId = null;
  document.getElementById('clientForm').reset();
  document.getElementById('cancelEditClient').style.display = 'none';
  document.querySelector('#clientForm button[type="submit"]').innerHTML = 
    '<i class="fas fa-save"></i> Salvar Cliente';
}

function deleteClient(clientId) {
  if (!confirm('Tem certeza que deseja excluir este cliente?')) return;

  try {
    showLoading();
    
    state.clientes = state.clientes.filter(c => c.id !== clientId);
    showNotification('Cliente excluído com sucesso!', 'success');
    
    renderClientsList();
    renderMetrics();
    
  } catch (error) {
    showNotification(`Erro ao excluir cliente: ${error.message}`, 'error');
  } finally {
    hideLoading();
  }
}

// PDF Generation
function openPdfModal(orderId) {
  state.orcamentoSelecionado = state.orcamentos.find(o => o.id === orderId);
  const modal = document.getElementById('pdfModal');
  if (modal) {
    modal.classList.add('visible');
  }
}

function closePdfModal() {
  const modal = document.getElementById('pdfModal');
  if (modal) {
    modal.classList.remove('visible');
  }
  state.orcamentoSelecionado = null;
}

function generatePdf(type) {
  if (!state.orcamentoSelecionado) return;

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  
  const order = state.orcamentoSelecionado;
  const client = state.clientes.find(c => c.id === order.cliente_id);
  
  if (!client) {
    showNotification('Cliente não encontrado', 'error');
    return;
  }

  // Header
  doc.setFontSize(20);
  doc.setTextColor(239, 68, 68);
  doc.text('R.M. Estética Automotiva', 20, 30);
  
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text('Rua das Flores, 123 - Centro', 20, 40);
  doc.text('São Paulo - SP - CEP: 01234-567', 20, 47);
  doc.text('Tel: (11) 3333-4444', 20, 54);
  doc.text('Email: contato@rmestetica.com.br', 20, 61);

  // Title
  doc.setFontSize(16);
  doc.setTextColor(239, 68, 68);
  const title = type === 'orcamento' ? 'ORÇAMENTO' : 'RECIBO';
  doc.text(title, 20, 80);

  // Client info
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text(`Cliente: ${client.nome}`, 20, 95);
  doc.text(`Telefone: ${client.telefone || 'N/A'}`, 20, 102);
  doc.text(`Veículo: ${client.carro || 'N/A'}`, 20, 109);
  doc.text(`Placa: ${client.placa || 'N/A'}`, 20, 116);
  doc.text(`Data: ${formatDate(order.created_at)}`, 20, 123);

  // Services table
  const tableColumns = ['Descrição', 'Quantidade', 'Valor Unit.', 'Total'];
  const tableData = [];
  
  tableData.push(['Serviço de Estética', '1', formatCurrency(order.valor_total || 0), formatCurrency(order.valor_total || 0)]);
  
  doc.autoTable({
    head: [tableColumns],
    body: tableData,
    startY: 140,
    theme: 'striped',
    headStyles: { fillColor: [239, 68, 68] },
    margin: { left: 20, right: 20 }
  });

  // Totals
  const finalY = doc.lastAutoTable.finalY + 20;
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  
  if (order.desconto > 0) {
    doc.text(`Desconto: ${formatCurrency(order.desconto)}`, 120, finalY);
  }
  
  doc.setFontSize(14);
  doc.setTextColor(239, 68, 68);
  doc.text(`Total: ${formatCurrency(order.valor_total || 0)}`, 120, finalY + 10);
  
  if (order.formas_pagamento) {
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Forma de Pagamento: ${order.formas_pagamento}`, 20, finalY + 20);
  }

  // Footer
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text('Obrigado pela preferência!', 20, 280);
  doc.text(`Documento gerado em ${new Date().toLocaleDateString('pt-BR')}`, 20, 287);

  // Save
  const filename = `${type}_${client.nome.replace(/\s/g, '_')}_${order.id}.pdf`;
  doc.save(filename);
  
  closePdfModal();
  showNotification(`${title} gerado com sucesso!`, 'success');
}

function editOrder(orderId) {
  showNotification('Funcionalidade em desenvolvimento', 'info');
}

// CRM Functions
function renderCRM() {
  console.log('Rendering CRM');
  renderInactiveClients();
  renderInteractionForm();
  renderInteractionsList();
}

function renderInactiveClients() {
  const period = state.filtros.periodoCrm;
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - period);

  const inactiveClients = state.clientes.filter(client => {
    const lastOrder = state.orcamentos
      .filter(o => o.cliente_id === client.id && o.status === 'Finalizado')
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];

    if (!lastOrder) return true;
    
    return new Date(lastOrder.created_at) < cutoffDate;
  });

  const container = document.getElementById('inactiveClientsList');
  
  if (!container) return;
  
  container.innerHTML = inactiveClients.map(client => {
    const ltv = state.orcamentos
      .filter(o => o.cliente_id === client.id && o.status === 'Finalizado')
      .reduce((sum, o) => sum + (o.valor_total || 0), 0);

    const lastOrder = state.orcamentos
      .filter(o => o.cliente_id === client.id && o.status === 'Finalizado')
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];

    return `
      <div class="inactive-client-item">
        <div class="inactive-client-header">
          <div class="inactive-client-name">${client.nome}</div>
          <div class="client-ltv">LTV: ${formatCurrency(ltv)}</div>
        </div>
        <div class="inactive-client-details">
          <div class="detail-item">
            <div class="detail-label">Telefone:</div>
            <div class="detail-value">${client.telefone || 'N/A'}</div>
          </div>
          <div class="detail-item">
            <div class="detail-label">Último Serviço:</div>
            <div class="detail-value last-service-date">
              ${lastOrder ? formatDate(lastOrder.created_at) : 'Nunca'}
            </div>
          </div>
          <div class="detail-item">
            <div class="detail-label">Carro:</div>
            <div class="detail-value">${client.carro || 'N/A'}</div>
          </div>
          <div class="detail-item">
            <div class="detail-label">Ações:</div>
            <div class="detail-value">
              <button class="btn btn-sm btn-primary" onclick="selectClientForInteraction('${client.id}')">
                <i class="fas fa-phone"></i> Contatar
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function renderInteractionForm() {
  const clientsOptions = state.clientes.map(client => 
    `<option value="${client.id}">${client.nome}</option>`
  ).join('');
  
  const select = document.getElementById('interactionClient');
  if (select) {
    select.innerHTML = '<option value="">Selecione um cliente</option>' + clientsOptions;
  }
}

function selectClientForInteraction(clientId) {
  const select = document.getElementById('interactionClient');
  if (select) {
    select.value = clientId;
    select.focus();
  }
}

function saveInteraction(event) {
  event.preventDefault();
  
  const formData = new FormData(event.target);
  const interactionData = {
    cliente_id: formData.get('cliente_id'),
    interaction_type: formData.get('interaction_type'),
    notes: formData.get('notes'),
    follow_up_date: formData.get('follow_up_date') || null,
    created_at: new Date().toISOString()
  };

  if (!interactionData.cliente_id || !interactionData.interaction_type || !interactionData.notes.trim()) {
    showNotification('Todos os campos obrigatórios devem ser preenchidos', 'error');
    return;
  }

  try {
    showLoading();
    
    const newInteraction = { ...interactionData, id: Date.now().toString() };
    state.crm_interactions.unshift(newInteraction);
    showNotification('Interação registrada com sucesso!', 'success');
    
    document.getElementById('interactionForm').reset();
    renderInteractionsList();
    
  } catch (error) {
    showNotification(`Erro ao registrar interação: ${error.message}`, 'error');
  } finally {
    hideLoading();
  }
}

function renderInteractionsList() {
  const container = document.getElementById('interactionsList');
  
  if (!container) return;
  
  container.innerHTML = state.crm_interactions.map(interaction => {
    const client = state.clientes.find(c => c.id === interaction.cliente_id);
    return `
      <div class="interaction-item">
        <div class="interaction-header">
          <div class="interaction-client">${client ? client.nome : 'Cliente não encontrado'}</div>
          <div class="interaction-date">${formatDate(interaction.created_at)}</div>
        </div>
        <div class="interaction-details">
          <div class="detail-item">
            <div class="detail-label">Tipo:</div>
            <div class="detail-value">${interaction.interaction_type}</div>
          </div>
          <div class="detail-item">
            <div class="detail-label">Observações:</div>
            <div class="detail-value">${interaction.notes}</div>
          </div>
          ${interaction.follow_up_date ? `
            <div class="detail-item">
              <div class="detail-label">Follow-up:</div>
              <div class="detail-value">${formatDate(interaction.follow_up_date)}</div>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }).join('');
}

// Despesas Functions
function renderDespesas() {
  console.log('Rendering despesas');
  renderFinancialAnalysis();
  renderDespesasList();
}

function saveDespesa(event) {
  event.preventDefault();
  
  const formData = new FormData(event.target);
  const despesaData = {
    data: formData.get('data'),
    categoria: formData.get('categoria'),
    descricao: formData.get('descricao'),
    valor: parseFloat(formData.get('valor'))
  };

  if (!despesaData.data || !despesaData.categoria || !despesaData.descricao.trim() || !despesaData.valor) {
    showNotification('Todos os campos são obrigatórios', 'error');
    return;
  }

  if (despesaData.valor <= 0) {
    showNotification('Valor deve ser maior que zero', 'error');
    return;
  }

  try {
    showLoading();
    
    const newDespesa = { ...despesaData, id: Date.now().toString() };
    state.despesas.unshift(newDespesa);
    showNotification('Despesa cadastrada com sucesso!', 'success');
    
    document.getElementById('despesaForm').reset();
    document.getElementById('despesaData').value = new Date().toISOString().substr(0, 10);
    
    renderDespesas();
    
  } catch (error) {
    showNotification(`Erro ao cadastrar despesa: ${error.message}`, 'error');
  } finally {
    hideLoading();
  }
}

function renderFinancialAnalysis() {
  const selectedMonth = state.filtros.mesDespesas;
  const monthlyExpenses = state.despesas.filter(d => 
    d.data.startsWith(selectedMonth)
  );

  const totalGasto = monthlyExpenses.reduce((sum, d) => sum + d.valor, 0);
  const daysInMonth = new Date(selectedMonth.split('-')[0], selectedMonth.split('-')[1], 0).getDate();
  const mediaDiaria = totalGasto / daysInMonth;

  // Category with highest spending
  const categoryTotals = {};
  monthlyExpenses.forEach(d => {
    categoryTotals[d.categoria] = (categoryTotals[d.categoria] || 0) + d.valor;
  });
  
  const categoriaMaior = Object.keys(categoryTotals).reduce((a, b) => 
    categoryTotals[a] > categoryTotals[b] ? a : b, '-'
  );

  const totalGastoEl = document.getElementById('totalGasto');
  const mediaDiariaEl = document.getElementById('mediaDiaria');
  const categoriaMaiorEl = document.getElementById('categoriaMaior');

  if (totalGastoEl) totalGastoEl.textContent = formatCurrency(totalGasto);
  if (mediaDiariaEl) mediaDiariaEl.textContent = formatCurrency(mediaDiaria);
  if (categoriaMaiorEl) categoriaMaiorEl.textContent = categoriaMaior;

  // Render chart
  renderExpensesChart(categoryTotals);
}

function renderExpensesChart(categoryTotals) {
  const ctx = document.getElementById('expensesChart');
  if (!ctx) return;
  
  const context = ctx.getContext('2d');
  
  const labels = Object.keys(categoryTotals);
  const data = Object.values(categoryTotals);
  const colors = ['#1FB8CD', '#FFC185', '#B4413C', '#ECEBD5', '#5D878F'];

  if (window.expensesChart) {
    window.expensesChart.destroy();
  }

  window.expensesChart = new Chart(context, {
    type: 'pie',
    data: {
      labels: labels,
      datasets: [{
        data: data,
        backgroundColor: colors.slice(0, labels.length),
        borderWidth: 2,
        borderColor: '#fff'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            padding: 20,
            usePointStyle: true
          }
        }
      }
    }
  });
}

function renderDespesasList() {
  const container = document.getElementById('despesasList');
  
  if (!container) return;
  
  container.innerHTML = state.despesas.map(despesa => `
    <div class="despesa-item">
      <div class="despesa-header">
        <div class="despesa-desc">${despesa.descricao}</div>
        <div class="despesa-valor">${formatCurrency(despesa.valor)}</div>
      </div>
      <div class="despesa-details">
        <div class="detail-item">
          <div class="detail-label">Data:</div>
          <div class="detail-value">${formatDate(despesa.data)}</div>
        </div>
        <div class="detail-item">
          <div class="detail-label">Categoria:</div>
          <div class="detail-value">${despesa.categoria}</div>
        </div>
        <div class="detail-item">
          <div class="detail-label">Ações:</div>
          <div class="detail-value">
            <button class="btn btn-sm btn-error" onclick="deleteDespesa('${despesa.id}')">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  `).join('');
}

function deleteDespesa(despesaId) {
  if (!confirm('Tem certeza que deseja excluir esta despesa?')) return;

  try {
    showLoading();
    
    state.despesas = state.despesas.filter(d => d.id !== despesaId);
    showNotification('Despesa excluída com sucesso!', 'success');
    
    renderDespesas();
    
  } catch (error) {
    showNotification(`Erro ao excluir despesa: ${error.message}`, 'error');
  } finally {
    hideLoading();
  }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM Content Loaded');
  
  // Network status
  window.addEventListener('online', updateNetworkStatus);
  window.addEventListener('offline', updateNetworkStatus);

  // Navigation
  document.querySelectorAll('.nav-tab').forEach(tab => {
    tab.addEventListener('click', function() {
      const tabName = this.dataset.tab;
      console.log('Tab clicked:', tabName);
      switchTab(tabName);
    });
  });

  // Metric cards click
  document.querySelectorAll('.metric-card.clickable').forEach(card => {
    card.addEventListener('click', function() {
      const filter = this.dataset.filter;
      state.filtros.status = filter;
      const statusFilter = document.getElementById('statusFilter');
      if (statusFilter) statusFilter.value = filter;
      renderOrdersList();
      showNotification(`Filtro aplicado: ${filter}`, 'info');
    });
  });

  // Forms
  const clientForm = document.getElementById('clientForm');
  const interactionForm = document.getElementById('interactionForm');
  const despesaForm = document.getElementById('despesaForm');

  if (clientForm) {
    clientForm.addEventListener('submit', saveClient);
  }
  if (interactionForm) {
    interactionForm.addEventListener('submit', saveInteraction);
  }
  if (despesaForm) {
    despesaForm.addEventListener('submit', saveDespesa);
  }

  // Search inputs with debounce
  const searchClients = document.getElementById('searchClients');
  const searchOrcamentos = document.getElementById('searchOrcamentos');
  
  if (searchClients) {
    searchClients.addEventListener('input', debounce(function() {
      state.filtros.searchClientes = this.value;
      renderClientsList();
    }, 300));
  }
  
  if (searchOrcamentos) {
    searchOrcamentos.addEventListener('input', debounce(function() {
      state.filtros.searchOrcamentos = this.value;
      renderOrdersList();
    }, 300));
  }

  // Filters
  const statusFilter = document.getElementById('statusFilter');
  const monthFilter = document.getElementById('monthFilter');

  if (statusFilter) {
    statusFilter.addEventListener('change', function() {
      state.filtros.status = this.value;
      renderOrdersList();
    });
  }

  if (monthFilter) {
    monthFilter.addEventListener('change', function() {
      state.filtros.mesDespesas = this.value;
      renderFinancialAnalysis();
    });
  }

  // Period buttons
  document.querySelectorAll('.period-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      document.querySelectorAll('.period-btn').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      state.filtros.periodoCrm = parseInt(this.dataset.period);
      renderInactiveClients();
    });
  });

  // Cancel edit client
  const cancelBtn = document.getElementById('cancelEditClient');
  if (cancelBtn) {
    cancelBtn.addEventListener('click', cancelEditClient);
  }

  // Modal close
  const closePdfBtn = document.getElementById('closePdfModal');
  if (closePdfBtn) {
    closePdfBtn.addEventListener('click', closePdfModal);
  }

  // Initialize the application
  initializeApp();
});

// Global functions for HTML onclick events
window.editClient = editClient;
window.deleteClient = deleteClient;
window.openPdfModal = openPdfModal;
window.closePdfModal = closePdfModal;
window.generatePdf = generatePdf;
window.editOrder = editOrder;
window.selectClientForInteraction = selectClientForInteraction;
window.deleteDespesa = deleteDespesa;
window.closeToast = closeToast;
