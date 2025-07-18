// R.M. Estética PRO+ v2.0 - Main Application Script (Fixed)

// Initial data setup
const initialData = {
  empresa: {
    nome: "R.M. Estética Automotiva",
    cnpj: "12.345.678/0001-90",
    telefone: "(11) 99999-9999",
    email: "contato@rmestetica.com.br",
    endereco: "Rua das Flores, 123 - Centro - São Paulo/SP"
  },
  clientes: [
    {
      id: 1,
      nome: "João Silva",
      telefone: "(11) 98765-4321",
      email: "joao@email.com",
      carro: "Honda Civic",
      placa: "ABC-1234",
      endereco: "Rua A, 123",
      created_at: "2024-12-01",
      status: "ativo"
    },
    {
      id: 2,
      nome: "Maria Santos",
      telefone: "(11) 97654-3210",
      email: "maria@email.com",
      carro: "Toyota Corolla",
      placa: "DEF-5678",
      endereco: "Rua B, 456",
      created_at: "2024-11-15",
      status: "ativo"
    },
    {
      id: 3,
      nome: "Pedro Costa",
      telefone: "(11) 96543-2109",
      email: "pedro@email.com",
      carro: "Ford Focus",
      placa: "GHI-9012",
      endereco: "Rua C, 789",
      created_at: "2024-10-20",
      status: "inativo"
    },
    {
      id: 4,
      nome: "Ana Oliveira",
      telefone: "(11) 95432-1098",
      email: "ana@email.com",
      carro: "Volkswagen Polo",
      placa: "JKL-3456",
      endereco: "Rua D, 321",
      created_at: "2024-09-10",
      status: "inativo"
    }
  ],
  orcamentos: [
    {
      id: 1,
      cliente_id: 1,
      valor_total: 350.00,
      status: "Aprovado",
      desconto: 10,
      observacoes: "Carro com sujeira pesada",
      created_at: "2024-12-10",
      itens: [
        { id: 1, descricao: "Lavagem Completa", valor: 80.00, quantidade: 1 },
        { id: 2, descricao: "Enceramento", valor: 150.00, quantidade: 1 },
        { id: 3, descricao: "Limpeza de Banco", valor: 120.00, quantidade: 1 }
      ]
    },
    {
      id: 2,
      cliente_id: 2,
      valor_total: 200.00,
      status: "Orçamento",
      desconto: 0,
      observacoes: "Cliente aguardando aprovação",
      created_at: "2024-12-15",
      itens: [
        { id: 1, descricao: "Lavagem Simples", valor: 50.00, quantidade: 1 },
        { id: 2, descricao: "Cera Automotiva", valor: 150.00, quantidade: 1 }
      ]
    },
    {
      id: 3,
      cliente_id: 3,
      valor_total: 450.00,
      status: "Cancelado",
      desconto: 0,
      observacoes: "Cliente desistiu",
      created_at: "2024-12-05",
      itens: [
        { id: 1, descricao: "Lavagem Completa", valor: 80.00, quantidade: 1 },
        { id: 2, descricao: "Enceramento", valor: 150.00, quantidade: 1 },
        { id: 3, descricao: "Pintura Automotiva", valor: 220.00, quantidade: 1 }
      ]
    }
  ],
  agendamentos: [
    {
      id: 1,
      cliente_id: 1,
      data_hora: "2024-12-20T14:00:00",
      servico: "Lavagem Completa + Enceramento",
      status: "agendado",
      observacoes: "Cliente prefere horário da tarde"
    },
    {
      id: 2,
      cliente_id: 2,
      data_hora: "2024-12-21T09:00:00",
      servico: "Lavagem Simples",
      status: "confirmado",
      observacoes: "Primeira vez no estabelecimento"
    },
    {
      id: 3,
      cliente_id: 1,
      data_hora: "2024-12-18T16:00:00",
      servico: "Enceramento",
      status: "concluido",
      observacoes: "Serviço realizado com sucesso"
    }
  ],
  receitas: [
    { id: 1, descricao: "Serviço - João Silva", valor: 350.00, data: "2024-12-01", categoria: "Serviços" },
    { id: 2, descricao: "Serviço - Maria Santos", valor: 200.00, data: "2024-12-05", categoria: "Serviços" },
    { id: 3, descricao: "Serviço - Ana Oliveira", valor: 180.00, data: "2024-12-10", categoria: "Serviços" }
  ],
  despesas: [
    { id: 1, descricao: "Produtos de Limpeza", valor: 150.00, data: "2024-12-01", categoria: "Produtos", pago: true },
    { id: 2, descricao: "Energia Elétrica", valor: 200.00, data: "2024-12-05", categoria: "Utilities", pago: true },
    { id: 3, descricao: "Aluguel", valor: 800.00, data: "2024-12-01", categoria: "Fixos", pago: true }
  ],
  templates_whatsapp: [
    {
      id: 1,
      nome: "Lembrete de Agendamento",
      tipo: "lembrete",
      mensagem: "Olá {nome}! Lembramos que você tem um agendamento para {servico} amanhã às {horario}. Confirme sua presença respondendo esta mensagem."
    },
    {
      id: 2,
      nome: "Promoção Semanal",
      tipo: "promocao",
      mensagem: "🚗 PROMOÇÃO DA SEMANA! Lavagem completa + enceramento por apenas R$ 199,90. Válido até sexta-feira. Agende já: (11) 99999-9999"
    },
    {
      id: 3,
      nome: "Follow-up Pós-Serviço",
      tipo: "seguimento",
      mensagem: "Olá {nome}! Como ficou seu {carro} após nosso serviço? Sua opinião é muito importante para nós. Avalie-nos e ganhe 10% de desconto no próximo serviço!"
    }
  ]
};

// Application state
let currentModule = 'dashboard';
let currentTransactionType = 'receitas';
let currentCrmTab = 'follow-up';
let currentConfigTab = 'empresa';

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
  initializeData();
  initializeNavigation();
  initializeModules();
  initializeModals();
  setTimeout(() => {
    initializeCharts();
  }, 500);
  loadDashboard();
  showToast('Sistema carregado com sucesso!', 'success');
});

// Data Management
function initializeData() {
  try {
    const existingData = localStorage.getItem('rm_estetica_data');
    if (!existingData) {
      localStorage.setItem('rm_estetica_data', JSON.stringify(initialData));
    }
  } catch (error) {
    console.error('Error initializing data:', error);
    localStorage.setItem('rm_estetica_data', JSON.stringify(initialData));
  }
}

function getData() {
  try {
    const data = localStorage.getItem('rm_estetica_data');
    return data ? JSON.parse(data) : initialData;
  } catch (error) {
    console.error('Error getting data:', error);
    return initialData;
  }
}

function saveData(data) {
  try {
    localStorage.setItem('rm_estetica_data', JSON.stringify(data));
  } catch (error) {
    console.error('Error saving data:', error);
  }
}

function generateId(array) {
  return array.length > 0 ? Math.max(...array.map(item => item.id)) + 1 : 1;
}

// Navigation
function initializeNavigation() {
  const menuItems = document.querySelectorAll('.menu-item');
  menuItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const module = item.dataset.module;
      if (module) {
        switchModule(module);
      }
    });
  });
}

function switchModule(module) {
  try {
    // Update active menu item
    document.querySelectorAll('.menu-item').forEach(item => {
      item.classList.remove('active');
    });
    const activeMenuItem = document.querySelector(`[data-module="${module}"]`);
    if (activeMenuItem) {
      activeMenuItem.classList.add('active');
    }
    
    // Update active module
    document.querySelectorAll('.module').forEach(mod => {
      mod.classList.remove('active');
    });
    const activeModule = document.getElementById(`${module}-module`);
    if (activeModule) {
      activeModule.classList.add('active');
    }
    
    // Update page title
    const titles = {
      dashboard: 'Dashboard',
      clientes: 'Clientes',
      orcamentos: 'Orçamentos',
      agenda: 'Agenda',
      financeiro: 'Financeiro',
      crm: 'CRM',
      configuracoes: 'Configurações'
    };
    const titleElement = document.getElementById('page-title');
    if (titleElement && titles[module]) {
      titleElement.textContent = titles[module];
    }
    
    currentModule = module;
    loadModuleData(module);
  } catch (error) {
    console.error('Error switching module:', error);
  }
}

function loadModuleData(module) {
  try {
    switch(module) {
      case 'dashboard':
        loadDashboard();
        break;
      case 'clientes':
        loadClients();
        break;
      case 'orcamentos':
        loadQuotes();
        break;
      case 'agenda':
        loadAppointments();
        break;
      case 'financeiro':
        loadFinancial();
        break;
      case 'crm':
        loadCRM();
        break;
      case 'configuracoes':
        loadConfigurations();
        break;
    }
  } catch (error) {
    console.error('Error loading module data:', error);
  }
}

// Module Initialization
function initializeModules() {
  try {
    // Client module
    const addClientBtn = document.getElementById('add-client-btn');
    if (addClientBtn) {
      addClientBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        openClientModal();
      });
    }
    
    const searchClients = document.getElementById('search-clients');
    if (searchClients) {
      searchClients.addEventListener('input', (e) => filterClients(e.target.value));
    }
    
    // Quote module
    const addQuoteBtn = document.getElementById('add-quote-btn');
    if (addQuoteBtn) {
      addQuoteBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        openQuoteModal();
      });
    }
    
    const quoteFilter = document.getElementById('quote-filter');
    if (quoteFilter) {
      quoteFilter.addEventListener('change', (e) => filterQuotes(e.target.value));
    }
    
    // Appointment module
    const addAppointmentBtn = document.getElementById('add-appointment-btn');
    if (addAppointmentBtn) {
      addAppointmentBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        openAppointmentModal();
      });
    }
    
    const appointmentFilter = document.getElementById('appointment-filter');
    if (appointmentFilter) {
      appointmentFilter.addEventListener('change', (e) => filterAppointments(e.target.value));
    }
    
    // Financial module
    const addTransactionBtn = document.getElementById('add-transaction-btn');
    if (addTransactionBtn) {
      addTransactionBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        openTransactionModal();
      });
    }
    
    document.querySelectorAll('.financial-tabs .tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        switchFinancialTab(e.target.dataset.tab);
      });
    });
    
    // CRM module
    const sendPromotionBtn = document.getElementById('send-promotion-btn');
    if (sendPromotionBtn) {
      sendPromotionBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        sendPromotionToAll();
      });
    }
    
    const addTemplateBtn = document.getElementById('add-template-btn');
    if (addTemplateBtn) {
      addTemplateBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        openTemplateModal();
      });
    }
    
    document.querySelectorAll('.crm-tabs .tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        switchCrmTab(e.target.dataset.tab);
      });
    });
    
    // Config module
    document.querySelectorAll('.config-tabs .tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        switchConfigTab(e.target.dataset.tab);
      });
    });
    
    const companyForm = document.getElementById('company-form');
    if (companyForm) {
      companyForm.addEventListener('submit', (e) => {
        e.preventDefault();
        saveCompanyData();
      });
    }
    
    const systemForm = document.getElementById('system-form');
    if (systemForm) {
      systemForm.addEventListener('submit', (e) => {
        e.preventDefault();
        saveSystemData();
      });
    }
    
    const backupBtn = document.getElementById('backup-btn');
    if (backupBtn) {
      backupBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        createBackup();
      });
    }
    
    const restoreBtn = document.getElementById('restore-btn');
    if (restoreBtn) {
      restoreBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        restoreBackup();
      });
    }
    
    const exportBtn = document.getElementById('export-btn');
    if (exportBtn) {
      exportBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        exportData();
      });
    }
  } catch (error) {
    console.error('Error initializing modules:', error);
  }
}

// Dashboard
function loadDashboard() {
  try {
    const data = getData();
    
    // Update stats
    const activeClients = data.clientes.filter(c => c.status === 'ativo').length;
    const pendingQuotes = data.orcamentos.filter(o => o.status === 'Orçamento').length;
    const monthlyRevenue = data.receitas.reduce((sum, r) => sum + r.valor, 0);
    const appointments = data.agendamentos.length;
    
    const statElements = document.querySelectorAll('.stat-card .stat-number');
    if (statElements.length >= 4) {
      statElements[0].textContent = activeClients;
      statElements[1].textContent = pendingQuotes;
      statElements[2].textContent = formatCurrency(monthlyRevenue);
      statElements[3].textContent = appointments;
    }
  } catch (error) {
    console.error('Error loading dashboard:', error);
  }
}

// Clients
function loadClients() {
  try {
    const data = getData();
    const tbody = document.getElementById('clients-table-body');
    if (tbody) {
      tbody.innerHTML = '';
      
      data.clientes.forEach(client => {
        const row = createClientRow(client);
        tbody.appendChild(row);
      });
    }
  } catch (error) {
    console.error('Error loading clients:', error);
  }
}

function createClientRow(client) {
  const row = document.createElement('tr');
  row.innerHTML = `
    <td>${client.nome}</td>
    <td>${client.telefone}</td>
    <td>${client.email}</td>
    <td>${client.carro} - ${client.placa}</td>
    <td><span class="status-badge ${client.status}">${client.status}</span></td>
    <td>
      <div class="action-buttons">
        <button class="btn-icon btn-edit" onclick="editClient(${client.id})">✏️</button>
        <button class="btn-icon btn-delete" onclick="deleteClient(${client.id})">🗑️</button>
        <button class="btn-icon btn-view" onclick="viewClient(${client.id})">👁️</button>
      </div>
    </td>
  `;
  return row;
}

function filterClients(searchTerm) {
  try {
    const data = getData();
    const filteredClients = data.clientes.filter(client => 
      client.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.telefone.includes(searchTerm)
    );
    
    const tbody = document.getElementById('clients-table-body');
    if (tbody) {
      tbody.innerHTML = '';
      
      filteredClients.forEach(client => {
        const row = createClientRow(client);
        tbody.appendChild(row);
      });
    }
  } catch (error) {
    console.error('Error filtering clients:', error);
  }
}

function openClientModal(clientId = null) {
  try {
    const data = getData();
    const client = clientId ? data.clientes.find(c => c.id === clientId) : null;
    
    const title = client ? 'Editar Cliente' : 'Novo Cliente';
    const form = `
      <form id="client-form">
        <div class="form-group">
          <label class="form-label">Nome</label>
          <input type="text" class="form-control" id="client-name" value="${client ? client.nome : ''}" required>
        </div>
        <div class="form-group">
          <label class="form-label">Telefone</label>
          <input type="text" class="form-control" id="client-phone" value="${client ? client.telefone : ''}" required>
        </div>
        <div class="form-group">
          <label class="form-label">Email</label>
          <input type="email" class="form-control" id="client-email" value="${client ? client.email : ''}" required>
        </div>
        <div class="form-group">
          <label class="form-label">Carro</label>
          <input type="text" class="form-control" id="client-car" value="${client ? client.carro : ''}" required>
        </div>
        <div class="form-group">
          <label class="form-label">Placa</label>
          <input type="text" class="form-control" id="client-plate" value="${client ? client.placa : ''}" required>
        </div>
        <div class="form-group">
          <label class="form-label">Endereço</label>
          <input type="text" class="form-control" id="client-address" value="${client ? client.endereco : ''}" required>
        </div>
        <div class="form-group">
          <label class="form-label">Status</label>
          <select class="form-control" id="client-status">
            <option value="ativo" ${client && client.status === 'ativo' ? 'selected' : ''}>Ativo</option>
            <option value="inativo" ${client && client.status === 'inativo' ? 'selected' : ''}>Inativo</option>
          </select>
        </div>
        <button type="submit" class="btn btn--primary">${client ? 'Salvar' : 'Criar'}</button>
      </form>
    `;
    
    openModal(title, form);
    
    // Add event listener after modal is opened
    setTimeout(() => {
      const clientForm = document.getElementById('client-form');
      if (clientForm) {
        clientForm.addEventListener('submit', (e) => {
          e.preventDefault();
          saveClient(clientId);
        });
      }
    }, 100);
  } catch (error) {
    console.error('Error opening client modal:', error);
  }
}

function saveClient(clientId) {
  try {
    const data = getData();
    const clientData = {
      nome: document.getElementById('client-name').value,
      telefone: document.getElementById('client-phone').value,
      email: document.getElementById('client-email').value,
      carro: document.getElementById('client-car').value,
      placa: document.getElementById('client-plate').value,
      endereco: document.getElementById('client-address').value,
      status: document.getElementById('client-status').value
    };
    
    if (clientId) {
      const index = data.clientes.findIndex(c => c.id === clientId);
      if (index !== -1) {
        data.clientes[index] = { ...data.clientes[index], ...clientData };
        showToast('Cliente atualizado com sucesso!', 'success');
      }
    } else {
      const newClient = {
        id: generateId(data.clientes),
        ...clientData,
        created_at: new Date().toISOString().split('T')[0]
      };
      data.clientes.push(newClient);
      showToast('Cliente criado com sucesso!', 'success');
    }
    
    saveData(data);
    closeModal();
    loadClients();
  } catch (error) {
    console.error('Error saving client:', error);
    showToast('Erro ao salvar cliente!', 'error');
  }
}

function editClient(clientId) {
  openClientModal(clientId);
}

function deleteClient(clientId) {
  if (confirm('Tem certeza que deseja excluir este cliente?')) {
    try {
      const data = getData();
      data.clientes = data.clientes.filter(c => c.id !== clientId);
      saveData(data);
      loadClients();
      showToast('Cliente excluído com sucesso!', 'success');
    } catch (error) {
      console.error('Error deleting client:', error);
      showToast('Erro ao excluir cliente!', 'error');
    }
  }
}

function viewClient(clientId) {
  try {
    const data = getData();
    const client = data.clientes.find(c => c.id === clientId);
    
    if (client) {
      const content = `
        <div class="client-details">
          <h3>${client.nome}</h3>
          <p><strong>Telefone:</strong> ${client.telefone}</p>
          <p><strong>Email:</strong> ${client.email}</p>
          <p><strong>Carro:</strong> ${client.carro}</p>
          <p><strong>Placa:</strong> ${client.placa}</p>
          <p><strong>Endereço:</strong> ${client.endereco}</p>
          <p><strong>Status:</strong> <span class="status-badge ${client.status}">${client.status}</span></p>
          <p><strong>Cadastrado em:</strong> ${formatDate(client.created_at)}</p>
        </div>
      `;
      
      openModal('Detalhes do Cliente', content);
    }
  } catch (error) {
    console.error('Error viewing client:', error);
  }
}

// Quotes
function loadQuotes() {
  try {
    const data = getData();
    const tbody = document.getElementById('quotes-table-body');
    if (tbody) {
      tbody.innerHTML = '';
      
      data.orcamentos.forEach(quote => {
        const row = createQuoteRow(quote, data.clientes);
        tbody.appendChild(row);
      });
    }
  } catch (error) {
    console.error('Error loading quotes:', error);
  }
}

function createQuoteRow(quote, clients) {
  const client = clients.find(c => c.id === quote.cliente_id);
  const row = document.createElement('tr');
  row.innerHTML = `
    <td>${client ? client.nome : 'Cliente não encontrado'}</td>
    <td>${formatCurrency(quote.valor_total)}</td>
    <td><span class="status-badge ${quote.status.toLowerCase()}">${quote.status}</span></td>
    <td>${formatDate(quote.created_at)}</td>
    <td>
      <div class="action-buttons">
        <button class="btn-icon btn-edit" onclick="editQuote(${quote.id})">✏️</button>
        <button class="btn-icon btn-delete" onclick="deleteQuote(${quote.id})">🗑️</button>
        <button class="btn-icon btn-pdf" onclick="generateQuotePDF(${quote.id})">📄</button>
      </div>
    </td>
  `;
  return row;
}

function filterQuotes(status) {
  try {
    const data = getData();
    const filteredQuotes = status ? data.orcamentos.filter(q => q.status === status) : data.orcamentos;
    
    const tbody = document.getElementById('quotes-table-body');
    if (tbody) {
      tbody.innerHTML = '';
      
      filteredQuotes.forEach(quote => {
        const row = createQuoteRow(quote, data.clientes);
        tbody.appendChild(row);
      });
    }
  } catch (error) {
    console.error('Error filtering quotes:', error);
  }
}

function openQuoteModal(quoteId = null) {
  try {
    const data = getData();
    const quote = quoteId ? data.orcamentos.find(q => q.id === quoteId) : null;
    
    const title = quote ? 'Editar Orçamento' : 'Novo Orçamento';
    const clientOptions = data.clientes.map(c => 
      `<option value="${c.id}" ${quote && quote.cliente_id === c.id ? 'selected' : ''}>${c.nome}</option>`
    ).join('');
    
    const form = `
      <form id="quote-form">
        <div class="form-group">
          <label class="form-label">Cliente</label>
          <select class="form-control" id="quote-client" required>
            <option value="">Selecione um cliente</option>
            ${clientOptions}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Status</label>
          <select class="form-control" id="quote-status">
            <option value="Orçamento" ${quote && quote.status === 'Orçamento' ? 'selected' : ''}>Orçamento</option>
            <option value="Aprovado" ${quote && quote.status === 'Aprovado' ? 'selected' : ''}>Aprovado</option>
            <option value="Cancelado" ${quote && quote.status === 'Cancelado' ? 'selected' : ''}>Cancelado</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Desconto (%)</label>
          <input type="number" class="form-control" id="quote-discount" value="${quote ? quote.desconto : 0}" min="0" max="100">
        </div>
        <div class="form-group">
          <label class="form-label">Observações</label>
          <textarea class="form-control" id="quote-notes" rows="3">${quote ? quote.observacoes : ''}</textarea>
        </div>
        <div class="form-group">
          <label class="form-label">Itens</label>
          <div id="quote-items">
            ${quote ? quote.itens.map(item => createQuoteItemHTML(item)).join('') : createQuoteItemHTML()}
          </div>
          <button type="button" class="btn btn--secondary" onclick="addQuoteItem()">+ Adicionar Item</button>
        </div>
        <div class="form-group">
          <label class="form-label">Valor Total</label>
          <input type="text" class="form-control" id="quote-total" readonly>
        </div>
        <button type="submit" class="btn btn--primary">${quote ? 'Salvar' : 'Criar'}</button>
      </form>
    `;
    
    openModal(title, form);
    
    setTimeout(() => {
      const quoteForm = document.getElementById('quote-form');
      if (quoteForm) {
        quoteForm.addEventListener('submit', (e) => {
          e.preventDefault();
          saveQuote(quoteId);
        });
      }
      calculateQuoteTotal();
    }, 100);
  } catch (error) {
    console.error('Error opening quote modal:', error);
  }
}

function createQuoteItemHTML(item = {}) {
  return `
    <div class="quote-item" style="display: flex; gap: 10px; margin-bottom: 10px; align-items: center;">
      <input type="text" class="form-control" placeholder="Descrição" value="${item.descricao || ''}" onchange="calculateQuoteTotal()" style="flex: 2;">
      <input type="number" class="form-control" placeholder="Valor" value="${item.valor || ''}" step="0.01" onchange="calculateQuoteTotal()" style="flex: 1;">
      <input type="number" class="form-control" placeholder="Qtd" value="${item.quantidade || 1}" min="1" onchange="calculateQuoteTotal()" style="flex: 1;">
      <button type="button" class="btn btn--secondary" onclick="removeQuoteItem(this)" style="flex: 0;">🗑️</button>
    </div>
  `;
}

function addQuoteItem() {
  const container = document.getElementById('quote-items');
  if (container) {
    const itemHTML = createQuoteItemHTML();
    container.insertAdjacentHTML('beforeend', itemHTML);
  }
}

function removeQuoteItem(button) {
  const item = button.closest('.quote-item');
  if (item) {
    item.remove();
    calculateQuoteTotal();
  }
}

function calculateQuoteTotal() {
  try {
    const items = document.querySelectorAll('.quote-item');
    let total = 0;
    
    items.forEach(item => {
      const valorInput = item.querySelector('input[placeholder="Valor"]');
      const quantidadeInput = item.querySelector('input[placeholder="Qtd"]');
      
      if (valorInput && quantidadeInput) {
        const valor = parseFloat(valorInput.value) || 0;
        const quantidade = parseInt(quantidadeInput.value) || 1;
        total += valor * quantidade;
      }
    });
    
    const descontoInput = document.getElementById('quote-discount');
    const totalInput = document.getElementById('quote-total');
    
    if (descontoInput && totalInput) {
      const desconto = parseFloat(descontoInput.value) || 0;
      const valorComDesconto = total * (1 - desconto / 100);
      totalInput.value = formatCurrency(valorComDesconto);
    }
  } catch (error) {
    console.error('Error calculating quote total:', error);
  }
}

function saveQuote(quoteId) {
  try {
    const data = getData();
    const items = [];
    
    document.querySelectorAll('.quote-item').forEach((item, index) => {
      const descricaoInput = item.querySelector('input[placeholder="Descrição"]');
      const valorInput = item.querySelector('input[placeholder="Valor"]');
      const quantidadeInput = item.querySelector('input[placeholder="Qtd"]');
      
      if (descricaoInput && valorInput && quantidadeInput) {
        const descricao = descricaoInput.value;
        const valor = parseFloat(valorInput.value) || 0;
        const quantidade = parseInt(quantidadeInput.value) || 1;
        
        if (descricao && valor > 0) {
          items.push({
            id: index + 1,
            descricao,
            valor,
            quantidade
          });
        }
      }
    });
    
    const total = items.reduce((sum, item) => sum + (item.valor * item.quantidade), 0);
    const desconto = parseFloat(document.getElementById('quote-discount').value) || 0;
    const valorTotal = total * (1 - desconto / 100);
    
    const quoteData = {
      cliente_id: parseInt(document.getElementById('quote-client').value),
      status: document.getElementById('quote-status').value,
      desconto,
      observacoes: document.getElementById('quote-notes').value,
      valor_total: valorTotal,
      itens: items
    };
    
    if (quoteId) {
      const index = data.orcamentos.findIndex(q => q.id === quoteId);
      if (index !== -1) {
        data.orcamentos[index] = { ...data.orcamentos[index], ...quoteData };
        showToast('Orçamento atualizado com sucesso!', 'success');
      }
    } else {
      const newQuote = {
        id: generateId(data.orcamentos),
        ...quoteData,
        created_at: new Date().toISOString().split('T')[0]
      };
      data.orcamentos.push(newQuote);
      showToast('Orçamento criado com sucesso!', 'success');
    }
    
    saveData(data);
    closeModal();
    loadQuotes();
  } catch (error) {
    console.error('Error saving quote:', error);
    showToast('Erro ao salvar orçamento!', 'error');
  }
}

function editQuote(quoteId) {
  openQuoteModal(quoteId);
}

function deleteQuote(quoteId) {
  if (confirm('Tem certeza que deseja excluir este orçamento?')) {
    try {
      const data = getData();
      data.orcamentos = data.orcamentos.filter(q => q.id !== quoteId);
      saveData(data);
      loadQuotes();
      showToast('Orçamento excluído com sucesso!', 'success');
    } catch (error) {
      console.error('Error deleting quote:', error);
      showToast('Erro ao excluir orçamento!', 'error');
    }
  }
}

function generateQuotePDF(quoteId) {
  try {
    const data = getData();
    const quote = data.orcamentos.find(q => q.id === quoteId);
    const client = data.clientes.find(c => c.id === quote.cliente_id);
    
    if (quote && client && window.jspdf) {
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();
      
      // Header
      doc.setFontSize(20);
      doc.text('R.M. Estética Automotiva', 20, 20);
      doc.setFontSize(12);
      doc.text('CNPJ: 12.345.678/0001-90', 20, 30);
      doc.text('Telefone: (11) 99999-9999', 20, 40);
      
      // Quote info
      doc.setFontSize(16);
      doc.text(`Orçamento #${quote.id}`, 20, 60);
      doc.setFontSize(12);
      doc.text(`Cliente: ${client.nome}`, 20, 75);
      doc.text(`Data: ${formatDate(quote.created_at)}`, 20, 85);
      doc.text(`Status: ${quote.status}`, 20, 95);
      
      // Items
      doc.text('Itens:', 20, 115);
      let y = 125;
      quote.itens.forEach(item => {
        doc.text(`${item.descricao} - Qtd: ${item.quantidade} - Valor: ${formatCurrency(item.valor)}`, 25, y);
        y += 10;
      });
      
      // Total
      doc.text(`Desconto: ${quote.desconto}%`, 20, y + 10);
      doc.text(`Valor Total: ${formatCurrency(quote.valor_total)}`, 20, y + 20);
      
      if (quote.observacoes) {
        doc.text('Observações:', 20, y + 35);
        doc.text(quote.observacoes, 20, y + 45);
      }
      
      doc.save(`orcamento_${quote.id}.pdf`);
      showToast('PDF gerado com sucesso!', 'success');
    }
  } catch (error) {
    console.error('Error generating PDF:', error);
    showToast('Erro ao gerar PDF!', 'error');
  }
}

// Appointments
function loadAppointments() {
  try {
    const data = getData();
    const container = document.getElementById('appointments-list');
    if (container) {
      container.innerHTML = '';
      
      data.agendamentos.forEach(appointment => {
        const appointmentCard = createAppointmentCard(appointment, data.clientes);
        container.appendChild(appointmentCard);
      });
    }
  } catch (error) {
    console.error('Error loading appointments:', error);
  }
}

function createAppointmentCard(appointment, clients) {
  const client = clients.find(c => c.id === appointment.cliente_id);
  const card = document.createElement('div');
  card.className = 'appointment-card';
  
  card.innerHTML = `
    <div class="appointment-info">
      <h4>${client ? client.nome : 'Cliente não encontrado'}</h4>
      <p><strong>Serviço:</strong> ${appointment.servico}</p>
      <p><strong>Data/Hora:</strong> ${formatDateTime(appointment.data_hora)}</p>
      <p><strong>Observações:</strong> ${appointment.observacoes}</p>
    </div>
    <div class="appointment-actions">
      <span class="appointment-status ${appointment.status}">${appointment.status}</span>
      <div class="action-buttons">
        <button class="btn-icon btn-edit" onclick="editAppointment(${appointment.id})">✏️</button>
        <button class="btn-icon btn-delete" onclick="deleteAppointment(${appointment.id})">🗑️</button>
      </div>
    </div>
  `;
  
  return card;
}

function filterAppointments(status) {
  try {
    const data = getData();
    const filteredAppointments = status ? data.agendamentos.filter(a => a.status === status) : data.agendamentos;
    
    const container = document.getElementById('appointments-list');
    if (container) {
      container.innerHTML = '';
      
      filteredAppointments.forEach(appointment => {
        const appointmentCard = createAppointmentCard(appointment, data.clientes);
        container.appendChild(appointmentCard);
      });
    }
  } catch (error) {
    console.error('Error filtering appointments:', error);
  }
}

function openAppointmentModal(appointmentId = null) {
  try {
    const data = getData();
    const appointment = appointmentId ? data.agendamentos.find(a => a.id === appointmentId) : null;
    
    const title = appointment ? 'Editar Agendamento' : 'Novo Agendamento';
    const clientOptions = data.clientes.map(c => 
      `<option value="${c.id}" ${appointment && appointment.cliente_id === c.id ? 'selected' : ''}>${c.nome}</option>`
    ).join('');
    
    const form = `
      <form id="appointment-form">
        <div class="form-group">
          <label class="form-label">Cliente</label>
          <select class="form-control" id="appointment-client" required>
            <option value="">Selecione um cliente</option>
            ${clientOptions}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Data e Hora</label>
          <input type="datetime-local" class="form-control" id="appointment-datetime" value="${appointment ? appointment.data_hora : ''}" required>
        </div>
        <div class="form-group">
          <label class="form-label">Serviço</label>
          <input type="text" class="form-control" id="appointment-service" value="${appointment ? appointment.servico : ''}" required>
        </div>
        <div class="form-group">
          <label class="form-label">Status</label>
          <select class="form-control" id="appointment-status">
            <option value="agendado" ${appointment && appointment.status === 'agendado' ? 'selected' : ''}>Agendado</option>
            <option value="confirmado" ${appointment && appointment.status === 'confirmado' ? 'selected' : ''}>Confirmado</option>
            <option value="concluido" ${appointment && appointment.status === 'concluido' ? 'selected' : ''}>Concluído</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Observações</label>
          <textarea class="form-control" id="appointment-notes" rows="3">${appointment ? appointment.observacoes : ''}</textarea>
        </div>
        <button type="submit" class="btn btn--primary">${appointment ? 'Salvar' : 'Criar'}</button>
      </form>
    `;
    
    openModal(title, form);
    
    setTimeout(() => {
      const appointmentForm = document.getElementById('appointment-form');
      if (appointmentForm) {
        appointmentForm.addEventListener('submit', (e) => {
          e.preventDefault();
          saveAppointment(appointmentId);
        });
      }
    }, 100);
  } catch (error) {
    console.error('Error opening appointment modal:', error);
  }
}

function saveAppointment(appointmentId) {
  try {
    const data = getData();
    const appointmentData = {
      cliente_id: parseInt(document.getElementById('appointment-client').value),
      data_hora: document.getElementById('appointment-datetime').value,
      servico: document.getElementById('appointment-service').value,
      status: document.getElementById('appointment-status').value,
      observacoes: document.getElementById('appointment-notes').value
    };
    
    if (appointmentId) {
      const index = data.agendamentos.findIndex(a => a.id === appointmentId);
      if (index !== -1) {
        data.agendamentos[index] = { ...data.agendamentos[index], ...appointmentData };
        showToast('Agendamento atualizado com sucesso!', 'success');
      }
    } else {
      const newAppointment = {
        id: generateId(data.agendamentos),
        ...appointmentData
      };
      data.agendamentos.push(newAppointment);
      showToast('Agendamento criado com sucesso!', 'success');
    }
    
    saveData(data);
    closeModal();
    loadAppointments();
  } catch (error) {
    console.error('Error saving appointment:', error);
    showToast('Erro ao salvar agendamento!', 'error');
  }
}

function editAppointment(appointmentId) {
  openAppointmentModal(appointmentId);
}

function deleteAppointment(appointmentId) {
  if (confirm('Tem certeza que deseja excluir este agendamento?')) {
    try {
      const data = getData();
      data.agendamentos = data.agendamentos.filter(a => a.id !== appointmentId);
      saveData(data);
      loadAppointments();
      showToast('Agendamento excluído com sucesso!', 'success');
    } catch (error) {
      console.error('Error deleting appointment:', error);
      showToast('Erro ao excluir agendamento!', 'error');
    }
  }
}

// Financial
function loadFinancial() {
  try {
    const data = getData();
    updateFinancialSummary(data);
    loadTransactions(currentTransactionType);
  } catch (error) {
    console.error('Error loading financial:', error);
  }
}

function updateFinancialSummary(data) {
  try {
    const totalReceitas = data.receitas.reduce((sum, r) => sum + r.valor, 0);
    const totalDespesas = data.despesas.reduce((sum, d) => sum + d.valor, 0);
    const lucro = totalReceitas - totalDespesas;
    
    const revenueAmount = document.querySelector('.summary-card.revenue .amount');
    const expensesAmount = document.querySelector('.summary-card.expenses .amount');
    const profitAmount = document.querySelector('.summary-card.profit .amount');
    
    if (revenueAmount) revenueAmount.textContent = formatCurrency(totalReceitas);
    if (expensesAmount) expensesAmount.textContent = formatCurrency(totalDespesas);
    if (profitAmount) profitAmount.textContent = formatCurrency(lucro);
  } catch (error) {
    console.error('Error updating financial summary:', error);
  }
}

function switchFinancialTab(tab) {
  try {
    document.querySelectorAll('.financial-tabs .tab-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    const activeBtn = document.querySelector(`[data-tab="${tab}"]`);
    if (activeBtn) {
      activeBtn.classList.add('active');
    }
    
    currentTransactionType = tab;
    loadTransactions(tab);
  } catch (error) {
    console.error('Error switching financial tab:', error);
  }
}

function loadTransactions(type) {
  try {
    const data = getData();
    const transactions = data[type] || [];
    const tbody = document.getElementById('transactions-table-body');
    if (tbody) {
      tbody.innerHTML = '';
      
      transactions.forEach(transaction => {
        const row = createTransactionRow(transaction, type);
        tbody.appendChild(row);
      });
    }
  } catch (error) {
    console.error('Error loading transactions:', error);
  }
}

function createTransactionRow(transaction, type) {
  const row = document.createElement('tr');
  const statusCol = type === 'despesas' ? 
    `<td><span class="status-badge ${transaction.pago ? 'ativo' : 'inativo'}">${transaction.pago ? 'Pago' : 'Pendente'}</span></td>` :
    '<td><span class="status-badge ativo">Recebido</span></td>';
  
  row.innerHTML = `
    <td>${transaction.descricao}</td>
    <td>${formatCurrency(transaction.valor)}</td>
    <td>${formatDate(transaction.data)}</td>
    <td>${transaction.categoria}</td>
    ${statusCol}
  `;
  return row;
}

function openTransactionModal(transactionId = null) {
  try {
    const data = getData();
    const transaction = transactionId ? data[currentTransactionType].find(t => t.id === transactionId) : null;
    
    const title = transaction ? `Editar ${currentTransactionType === 'receitas' ? 'Receita' : 'Despesa'}` : 
                                `Nova ${currentTransactionType === 'receitas' ? 'Receita' : 'Despesa'}`;
    
    const form = `
      <form id="transaction-form">
        <div class="form-group">
          <label class="form-label">Descrição</label>
          <input type="text" class="form-control" id="transaction-description" value="${transaction ? transaction.descricao : ''}" required>
        </div>
        <div class="form-group">
          <label class="form-label">Valor</label>
          <input type="number" class="form-control" id="transaction-value" value="${transaction ? transaction.valor : ''}" step="0.01" required>
        </div>
        <div class="form-group">
          <label class="form-label">Data</label>
          <input type="date" class="form-control" id="transaction-date" value="${transaction ? transaction.data : ''}" required>
        </div>
        <div class="form-group">
          <label class="form-label">Categoria</label>
          <input type="text" class="form-control" id="transaction-category" value="${transaction ? transaction.categoria : ''}" required>
        </div>
        ${currentTransactionType === 'despesas' ? `
          <div class="form-group">
            <label class="form-label">Status</label>
            <select class="form-control" id="transaction-status">
              <option value="true" ${transaction && transaction.pago ? 'selected' : ''}>Pago</option>
              <option value="false" ${transaction && !transaction.pago ? 'selected' : ''}>Pendente</option>
            </select>
          </div>
        ` : ''}
        <button type="submit" class="btn btn--primary">${transaction ? 'Salvar' : 'Criar'}</button>
      </form>
    `;
    
    openModal(title, form);
    
    setTimeout(() => {
      const transactionForm = document.getElementById('transaction-form');
      if (transactionForm) {
        transactionForm.addEventListener('submit', (e) => {
          e.preventDefault();
          saveTransaction(transactionId);
        });
      }
    }, 100);
  } catch (error) {
    console.error('Error opening transaction modal:', error);
  }
}

function saveTransaction(transactionId) {
  try {
    const data = getData();
    const transactionData = {
      descricao: document.getElementById('transaction-description').value,
      valor: parseFloat(document.getElementById('transaction-value').value),
      data: document.getElementById('transaction-date').value,
      categoria: document.getElementById('transaction-category').value
    };
    
    if (currentTransactionType === 'despesas') {
      transactionData.pago = document.getElementById('transaction-status').value === 'true';
    }
    
    if (transactionId) {
      const index = data[currentTransactionType].findIndex(t => t.id === transactionId);
      if (index !== -1) {
        data[currentTransactionType][index] = { ...data[currentTransactionType][index], ...transactionData };
        showToast(`${currentTransactionType === 'receitas' ? 'Receita' : 'Despesa'} atualizada com sucesso!`, 'success');
      }
    } else {
      const newTransaction = {
        id: generateId(data[currentTransactionType]),
        ...transactionData
      };
      data[currentTransactionType].push(newTransaction);
      showToast(`${currentTransactionType === 'receitas' ? 'Receita' : 'Despesa'} criada com sucesso!`, 'success');
    }
    
    saveData(data);
    closeModal();
    loadFinancial();
  } catch (error) {
    console.error('Error saving transaction:', error);
    showToast('Erro ao salvar transação!', 'error');
  }
}

// CRM
function loadCRM() {
  try {
    switchCrmTab(currentCrmTab);
  } catch (error) {
    console.error('Error loading CRM:', error);
  }
}

function switchCrmTab(tab) {
  try {
    document.querySelectorAll('.crm-tabs .tab-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    const activeBtn = document.querySelector(`[data-tab="${tab}"]`);
    if (activeBtn) {
      activeBtn.classList.add('active');
    }
    
    document.querySelectorAll('.crm-content .tab-content').forEach(content => {
      content.classList.remove('active');
    });
    const activeContent = document.getElementById(`${tab}-content`);
    if (activeContent) {
      activeContent.classList.add('active');
    }
    
    currentCrmTab = tab;
    
    if (tab === 'follow-up') {
      loadInactiveClients();
    } else if (tab === 'templates') {
      loadTemplates();
    }
  } catch (error) {
    console.error('Error switching CRM tab:', error);
  }
}

function loadInactiveClients() {
  try {
    const data = getData();
    const inactiveClients = data.clientes.filter(c => c.status === 'inativo');
    const container = document.getElementById('inactive-clients-list');
    if (container) {
      container.innerHTML = '';
      
      inactiveClients.forEach(client => {
        const clientCard = createInactiveClientCard(client);
        container.appendChild(clientCard);
      });
    }
  } catch (error) {
    console.error('Error loading inactive clients:', error);
  }
}

function createInactiveClientCard(client) {
  const card = document.createElement('div');
  card.className = 'inactive-client-card';
  
  card.innerHTML = `
    <div class="client-info">
      <h4>${client.nome}</h4>
      <p>Último contato: ${formatDate(client.created_at)}</p>
      <p>Telefone: ${client.telefone}</p>
    </div>
    <div class="client-actions">
      <button class="btn btn--primary btn--sm" onclick="sendFollowUpMessage(${client.id})">Enviar Mensagem</button>
    </div>
  `;
  
  return card;
}

function sendFollowUpMessage(clientId) {
  try {
    const data = getData();
    const client = data.clientes.find(c => c.id === clientId);
    const template = data.templates_whatsapp.find(t => t.tipo === 'seguimento');
    
    if (template && client) {
      const message = template.mensagem
        .replace('{nome}', client.nome)
        .replace('{carro}', client.carro);
      
      const whatsappUrl = `https://wa.me/55${client.telefone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
      
      showToast(`Mensagem enviada para ${client.nome}!`, 'success');
    }
  } catch (error) {
    console.error('Error sending follow-up message:', error);
  }
}

function sendPromotionToAll() {
  try {
    const data = getData();
    const inactiveClients = data.clientes.filter(c => c.status === 'inativo');
    const template = data.templates_whatsapp.find(t => t.tipo === 'promocao');
    
    if (template && inactiveClients.length > 0) {
      inactiveClients.forEach((client, index) => {
        const message = template.mensagem;
        const whatsappUrl = `https://wa.me/55${client.telefone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
        setTimeout(() => window.open(whatsappUrl, '_blank'), index * 100);
      });
      
      showToast(`Promoção enviada para ${inactiveClients.length} clientes!`, 'success');
    }
  } catch (error) {
    console.error('Error sending promotion to all:', error);
  }
}

function loadTemplates() {
  try {
    const data = getData();
    const container = document.getElementById('templates-list');
    if (container) {
      container.innerHTML = '';
      
      data.templates_whatsapp.forEach(template => {
        const templateCard = createTemplateCard(template);
        container.appendChild(templateCard);
      });
    }
  } catch (error) {
    console.error('Error loading templates:', error);
  }
}

function createTemplateCard(template) {
  const card = document.createElement('div');
  card.className = 'template-card';
  
  card.innerHTML = `
    <div class="template-header">
      <div class="template-name">${template.nome}</div>
      <div class="template-type">${template.tipo}</div>
    </div>
    <div class="template-message">${template.mensagem}</div>
    <div class="template-actions" style="margin-top: 12px;">
      <button class="btn btn--sm btn--outline" onclick="editTemplate(${template.id})">Editar</button>
      <button class="btn btn--sm btn--secondary" onclick="deleteTemplate(${template.id})">Excluir</button>
    </div>
  `;
  
  return card;
}

function openTemplateModal(templateId = null) {
  try {
    const data = getData();
    const template = templateId ? data.templates_whatsapp.find(t => t.id === templateId) : null;
    
    const title = template ? 'Editar Template' : 'Novo Template';
    const form = `
      <form id="template-form">
        <div class="form-group">
          <label class="form-label">Nome</label>
          <input type="text" class="form-control" id="template-name" value="${template ? template.nome : ''}" required>
        </div>
        <div class="form-group">
          <label class="form-label">Tipo</label>
          <select class="form-control" id="template-type">
            <option value="lembrete" ${template && template.tipo === 'lembrete' ? 'selected' : ''}>Lembrete</option>
            <option value="promocao" ${template && template.tipo === 'promocao' ? 'selected' : ''}>Promoção</option>
            <option value="seguimento" ${template && template.tipo === 'seguimento' ? 'selected' : ''}>Seguimento</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Mensagem</label>
          <textarea class="form-control" id="template-message" rows="5" required>${template ? template.mensagem : ''}</textarea>
          <small>Use {nome}, {carro}, {servico}, {horario} para personalizar</small>
        </div>
        <button type="submit" class="btn btn--primary">${template ? 'Salvar' : 'Criar'}</button>
      </form>
    `;
    
    openModal(title, form);
    
    setTimeout(() => {
      const templateForm = document.getElementById('template-form');
      if (templateForm) {
        templateForm.addEventListener('submit', (e) => {
          e.preventDefault();
          saveTemplate(templateId);
        });
      }
    }, 100);
  } catch (error) {
    console.error('Error opening template modal:', error);
  }
}

function saveTemplate(templateId) {
  try {
    const data = getData();
    const templateData = {
      nome: document.getElementById('template-name').value,
      tipo: document.getElementById('template-type').value,
      mensagem: document.getElementById('template-message').value
    };
    
    if (templateId) {
      const index = data.templates_whatsapp.findIndex(t => t.id === templateId);
      if (index !== -1) {
        data.templates_whatsapp[index] = { ...data.templates_whatsapp[index], ...templateData };
        showToast('Template atualizado com sucesso!', 'success');
      }
    } else {
      const newTemplate = {
        id: generateId(data.templates_whatsapp),
        ...templateData
      };
      data.templates_whatsapp.push(newTemplate);
      showToast('Template criado com sucesso!', 'success');
    }
    
    saveData(data);
    closeModal();
    loadTemplates();
  } catch (error) {
    console.error('Error saving template:', error);
    showToast('Erro ao salvar template!', 'error');
  }
}

function editTemplate(templateId) {
  openTemplateModal(templateId);
}

function deleteTemplate(templateId) {
  if (confirm('Tem certeza que deseja excluir este template?')) {
    try {
      const data = getData();
      data.templates_whatsapp = data.templates_whatsapp.filter(t => t.id !== templateId);
      saveData(data);
      loadTemplates();
      showToast('Template excluído com sucesso!', 'success');
    } catch (error) {
      console.error('Error deleting template:', error);
      showToast('Erro ao excluir template!', 'error');
    }
  }
}

// Configurations
function loadConfigurations() {
  try {
    switchConfigTab(currentConfigTab);
  } catch (error) {
    console.error('Error loading configurations:', error);
  }
}

function switchConfigTab(tab) {
  try {
    document.querySelectorAll('.config-tabs .tab-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    const activeBtn = document.querySelector(`[data-tab="${tab}"]`);
    if (activeBtn) {
      activeBtn.classList.add('active');
    }
    
    document.querySelectorAll('.config-content .tab-content').forEach(content => {
      content.classList.remove('active');
    });
    const activeContent = document.getElementById(`${tab}-content`);
    if (activeContent) {
      activeContent.classList.add('active');
    }
    
    currentConfigTab = tab;
  } catch (error) {
    console.error('Error switching config tab:', error);
  }
}

function saveCompanyData() {
  try {
    const data = getData();
    data.empresa = {
      nome: document.getElementById('company-name').value,
      cnpj: document.getElementById('company-cnpj').value,
      telefone: document.getElementById('company-phone').value,
      email: document.getElementById('company-email').value,
      endereco: document.getElementById('company-address').value
    };
    
    saveData(data);
    showToast('Dados da empresa salvos com sucesso!', 'success');
  } catch (error) {
    console.error('Error saving company data:', error);
    showToast('Erro ao salvar dados da empresa!', 'error');
  }
}

function saveSystemData() {
  try {
    const data = getData();
    if (!data.configuracoes) {
      data.configuracoes = {};
    }
    data.configuracoes.sistema = {
      tema: document.getElementById('theme-select').value,
      idioma: document.getElementById('language-select').value,
      moeda: document.getElementById('currency-select').value
    };
    
    saveData(data);
    showToast('Configurações do sistema salvas com sucesso!', 'success');
  } catch (error) {
    console.error('Error saving system data:', error);
    showToast('Erro ao salvar configurações do sistema!', 'error');
  }
}

function createBackup() {
  try {
    const data = getData();
    const backup = {
      timestamp: new Date().toISOString(),
      data: data
    };
    
    const dataStr = JSON.stringify(backup, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `backup_rmestetica_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
    showToast('Backup criado com sucesso!', 'success');
  } catch (error) {
    console.error('Error creating backup:', error);
    showToast('Erro ao criar backup!', 'error');
  }
}

function restoreBackup() {
  try {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = function(e) {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
          try {
            const backup = JSON.parse(e.target.result);
            if (backup.data) {
              localStorage.setItem('rm_estetica_data', JSON.stringify(backup.data));
              showToast('Backup restaurado com sucesso!', 'success');
              setTimeout(() => location.reload(), 1000);
            }
          } catch (error) {
            console.error('Error restoring backup:', error);
            showToast('Erro ao restaurar backup!', 'error');
          }
        };
        reader.readAsText(file);
      }
    };
    
    input.click();
  } catch (error) {
    console.error('Error restoring backup:', error);
    showToast('Erro ao restaurar backup!', 'error');
  }
}

function exportData() {
  try {
    const data = getData();
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `dados_rmestetica_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
    showToast('Dados exportados com sucesso!', 'success');
  } catch (error) {
    console.error('Error exporting data:', error);
    showToast('Erro ao exportar dados!', 'error');
  }
}

// Charts
function initializeCharts() {
  try {
    if (window.Chart) {
      createRevenueChart();
      createAppointmentChart();
    }
  } catch (error) {
    console.error('Error initializing charts:', error);
  }
}

function createRevenueChart() {
  try {
    const canvas = document.getElementById('revenueChart');
    if (canvas && window.Chart) {
      const ctx = canvas.getContext('2d');
      new Chart(ctx, {
        type: 'bar',
        data: {
          labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
          datasets: [{
            label: 'Receitas',
            data: [2800, 3200, 2900, 3500, 3100, 3400],
            backgroundColor: '#1FB8CD',
            borderColor: '#1FB8CD',
            borderWidth: 1
          }, {
            label: 'Despesas',
            data: [1200, 1400, 1300, 1500, 1350, 1450],
            backgroundColor: '#B4413C',
            borderColor: '#B4413C',
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'top',
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
  } catch (error) {
    console.error('Error creating revenue chart:', error);
  }
}

function createAppointmentChart() {
  try {
    const canvas = document.getElementById('appointmentChart');
    if (canvas && window.Chart) {
      const ctx = canvas.getContext('2d');
      new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: ['Agendados', 'Confirmados', 'Concluídos'],
          datasets: [{
            data: [5, 3, 4],
            backgroundColor: ['#FFC185', '#1FB8CD', '#5D878F'],
            borderColor: ['#FFC185', '#1FB8CD', '#5D878F'],
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
            }
          }
        }
      });
    }
  } catch (error) {
    console.error('Error creating appointment chart:', error);
  }
}

// Modal Management
function initializeModals() {
  try {
    const closeBtn = document.getElementById('modal-close-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        closeModal();
      });
    }
    
    const overlay = document.getElementById('modal-overlay');
    if (overlay) {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          closeModal();
        }
      });
    }
  } catch (error) {
    console.error('Error initializing modals:', error);
  }
}

function openModal(title, content) {
  try {
    const titleEl = document.getElementById('modal-title');
    const bodyEl = document.getElementById('modal-body');
    const overlayEl = document.getElementById('modal-overlay');
    
    if (titleEl) titleEl.textContent = title;
    if (bodyEl) bodyEl.innerHTML = content;
    if (overlayEl) overlayEl.classList.add('show');
  } catch (error) {
    console.error('Error opening modal:', error);
  }
}

function closeModal() {
  try {
    const overlayEl = document.getElementById('modal-overlay');
    if (overlayEl) {
      overlayEl.classList.remove('show');
    }
  } catch (error) {
    console.error('Error closing modal:', error);
  }
}

// Utility Functions
function formatCurrency(value) {
  try {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  } catch (error) {
    return `R$ ${value.toFixed(2)}`;
  }
}

function formatDate(dateString) {
  try {
    return new Date(dateString).toLocaleDateString('pt-BR');
  } catch (error) {
    return dateString;
  }
}

function formatDateTime(dateTimeString) {
  try {
    return new Date(dateTimeString).toLocaleString('pt-BR');
  } catch (error) {
    return dateTimeString;
  }
}

function showToast(message, type = 'info') {
  try {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    
    const container = document.getElementById('toast-container');
    if (container) {
      container.appendChild(toast);
      
      setTimeout(() => {
        toast.classList.add('show');
      }, 100);
      
      setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
          if (toast.parentNode) {
            toast.remove();
          }
        }, 300);
      }, 3000);
    }
  } catch (error) {
    console.error('Error showing toast:', error);
  }
}