// Configuration
const SUPABASE_URL = 'https://bezbszbkaifcanqsmdbi.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJlemJzemJrYWlmY2FucXNtZGJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ3NjM5MDYsImV4cCI6MjA1MDMzOTkwNn0.PJNKdP7z2hKoSbON4HN8r4iNQOt8GmWmVvIrKJ0UzV8';

// Initialize Supabase client
let supabaseClient;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Initialize Supabase client
        supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
        
        // Initialize app
        window.app = new AppManager();
    } catch (error) {
        console.error('Failed to initialize app:', error);
        document.getElementById('loading-screen').innerHTML = `
            <div class="loading-spinner">
                <i class="fas fa-exclamation-triangle" style="color: #e74c3c;"></i>
                <p>Erro ao carregar aplicação. Tente novamente.</p>
                <button onclick="location.reload()" class="btn btn--primary">Recarregar</button>
            </div>
        `;
    }
});

// Domain Entities
class Cliente {
    constructor(data) {
        this.id = data.id || null;
        this.nome = data.nome || '';
        this.telefone = data.telefone || '';
        this.email = data.email || '';
        this.carro = data.carro || '';
        this.placa = data.placa || '';
        this.endereco = data.endereco || '';
        this.observacoes = data.observacoes || '';
        this.created_at = data.created_at || new Date().toISOString();
        this.updated_at = data.updated_at || new Date().toISOString();
    }
}

class Servico {
    constructor(data) {
        this.id = data.id || null;
        this.descricao = data.descricao || '';
        this.valor = data.valor || 0;
        this.categoria = data.categoria || '';
        this.tempo_estimado = data.tempo_estimado || '';
        this.ativo = data.ativo !== undefined ? data.ativo : true;
        this.created_at = data.created_at || new Date().toISOString();
        this.updated_at = data.updated_at || new Date().toISOString();
    }
}

class Orcamento {
    constructor(data) {
        this.id = data.id || null;
        this.cliente_id = data.cliente_id || null;
        this.status = data.status || 'pendente';
        this.valor_total = data.valor_total || 0;
        this.desconto = data.desconto || 0;
        this.observacoes = data.observacoes || '';
        this.servicos = data.servicos || [];
        this.created_at = data.created_at || new Date().toISOString();
        this.updated_at = data.updated_at || new Date().toISOString();
    }
}

// Database Manager
class DatabaseManager {
    constructor() {
        this.db = null;
        this.dbName = 'EsteticaAutomotiva';
        this.version = 1;
    }

    async initDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.version);
            
            request.onerror = () => {
                console.error('Database error:', request.error);
                reject(request.error);
            };
            
            request.onsuccess = () => {
                this.db = request.result;
                resolve(this.db);
            };
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                // Create stores
                if (!db.objectStoreNames.contains('clientes')) {
                    db.createObjectStore('clientes', { keyPath: 'id' });
                }
                if (!db.objectStoreNames.contains('servicos')) {
                    db.createObjectStore('servicos', { keyPath: 'id' });
                }
                if (!db.objectStoreNames.contains('orcamentos')) {
                    db.createObjectStore('orcamentos', { keyPath: 'id' });
                }
                if (!db.objectStoreNames.contains('sync_queue')) {
                    db.createObjectStore('sync_queue', { keyPath: 'id', autoIncrement: true });
                }
            };
        });
    }

    async save(store, data) {
        if (!this.db) await this.initDB();
        const transaction = this.db.transaction([store], 'readwrite');
        const objectStore = transaction.objectStore(store);
        return objectStore.put(data);
    }

    async get(store, id) {
        if (!this.db) await this.initDB();
        const transaction = this.db.transaction([store], 'readonly');
        const objectStore = transaction.objectStore(store);
        return new Promise((resolve) => {
            const request = objectStore.get(id);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => resolve(null);
        });
    }

    async getAll(store) {
        if (!this.db) await this.initDB();
        const transaction = this.db.transaction([store], 'readonly');
        const objectStore = transaction.objectStore(store);
        return new Promise((resolve) => {
            const request = objectStore.getAll();
            request.onsuccess = () => resolve(request.result || []);
            request.onerror = () => resolve([]);
        });
    }

    async delete(store, id) {
        if (!this.db) await this.initDB();
        const transaction = this.db.transaction([store], 'readwrite');
        const objectStore = transaction.objectStore(store);
        return objectStore.delete(id);
    }

    async addToSyncQueue(operation, table, data) {
        const item = {
            operation,
            table,
            data,
            timestamp: new Date().toISOString()
        };
        await this.save('sync_queue', item);
    }
}

// Repository
class Repository {
    constructor(table, entityClass) {
        this.table = table;
        this.entityClass = entityClass;
        this.db = new DatabaseManager();
    }

    async create(data) {
        const entity = new this.entityClass(data);
        entity.id = this.generateId();
        
        try {
            if (navigator.onLine && supabaseClient) {
                // For demo purposes, we'll skip Supabase and work offline-first
                await this.db.addToSyncQueue('create', this.table, entity);
            }
            
            await this.db.save(this.table, entity);
            return entity;
        } catch (error) {
            console.error('Error creating entity:', error);
            throw error;
        }
    }

    async getAll() {
        try {
            // For demo purposes, work offline-first
            const data = await this.db.getAll(this.table);
            return data.map(item => new this.entityClass(item));
        } catch (error) {
            console.error('Error getting entities:', error);
            return [];
        }
    }

    async getById(id) {
        try {
            const data = await this.db.get(this.table, id);
            return data ? new this.entityClass(data) : null;
        } catch (error) {
            console.error('Error getting entity:', error);
            return null;
        }
    }

    async update(id, data) {
        try {
            const entity = { ...data, id, updated_at: new Date().toISOString() };
            
            if (navigator.onLine && supabaseClient) {
                await this.db.addToSyncQueue('update', this.table, entity);
            }
            
            await this.db.save(this.table, entity);
            return new this.entityClass(entity);
        } catch (error) {
            console.error('Error updating entity:', error);
            throw error;
        }
    }

    async delete(id) {
        try {
            if (navigator.onLine && supabaseClient) {
                await this.db.addToSyncQueue('delete', this.table, { id });
            }
            
            await this.db.delete(this.table, id);
            return true;
        } catch (error) {
            console.error('Error deleting entity:', error);
            throw error;
        }
    }

    generateId() {
        return 'offline_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
}

// Application Layer
class AppManager {
    constructor() {
        this.clienteRepository = new Repository('clientes', Cliente);
        this.servicoRepository = new Repository('servicos', Servico);
        this.orcamentoRepository = new Repository('orcamentos', Orcamento);
        this.currentUser = null;
        this.currentPage = 'dashboard';
        
        this.init();
    }

    async init() {
        try {
            // For demo purposes, skip auth and go directly to app
            this.currentUser = { email: 'demo@example.com' };
            
            await this.setupEventListeners();
            this.setupNetworkListener();
            this.registerServiceWorker();
            
            // Hide loading screen and show app
            document.getElementById('loading-screen').classList.add('hidden');
            document.getElementById('login-screen').classList.add('hidden');
            document.getElementById('main-app').classList.remove('hidden');
            
            // Set user name
            document.getElementById('user-name').textContent = this.currentUser.email;
            
            // Load initial data
            await this.loadSampleData();
            
            // Navigate to dashboard
            this.navigateTo('dashboard');
            
        } catch (error) {
            console.error('Error initializing app:', error);
            this.showError('Erro ao inicializar aplicação');
        }
    }

    async loadSampleData() {
        try {
            // Check if we already have data
            const existingClientes = await this.clienteRepository.getAll();
            if (existingClientes.length > 0) return;
            
            // Create sample data
            const sampleClientes = [
                { nome: 'João Silva', telefone: '(11) 99999-9999', email: 'joao@email.com', carro: 'Honda Civic', placa: 'ABC-1234' },
                { nome: 'Maria Santos', telefone: '(11) 88888-8888', email: 'maria@email.com', carro: 'Toyota Corolla', placa: 'XYZ-5678' },
                { nome: 'Carlos Oliveira', telefone: '(11) 77777-7777', email: 'carlos@email.com', carro: 'Volkswagen Golf', placa: 'DEF-9012' }
            ];
            
            const sampleServicos = [
                { descricao: 'Lavagem Completa', categoria: 'Lavagem', valor: 25.00, tempo_estimado: '1 hora' },
                { descricao: 'Enceramento', categoria: 'Enceramento', valor: 50.00, tempo_estimado: '2 horas' },
                { descricao: 'Detalhamento Interno', categoria: 'Detalhamento', valor: 80.00, tempo_estimado: '3 horas' }
            ];
            
            // Create sample clients
            for (const cliente of sampleClientes) {
                await this.clienteRepository.create(cliente);
            }
            
            // Create sample services
            for (const servico of sampleServicos) {
                await this.servicoRepository.create(servico);
            }
            
            // Create sample budget
            const clientes = await this.clienteRepository.getAll();
            if (clientes.length > 0) {
                await this.orcamentoRepository.create({
                    cliente_id: clientes[0].id,
                    status: 'pendente',
                    valor_total: 75.00,
                    desconto: 0,
                    observacoes: 'Lavagem completa + enceramento'
                });
            }
            
        } catch (error) {
            console.error('Error loading sample data:', error);
        }
    }

    showError(message) {
        const loadingScreen = document.getElementById('loading-screen');
        loadingScreen.innerHTML = `
            <div class="loading-spinner">
                <i class="fas fa-exclamation-triangle" style="color: #e74c3c; font-size: 48px;"></i>
                <p style="color: #e74c3c; margin: 20px 0;">${message}</p>
                <button onclick="location.reload()" class="btn btn--primary">Recarregar</button>
            </div>
        `;
        loadingScreen.classList.remove('hidden');
    }

    async setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const page = item.dataset.page;
                this.navigateTo(page);
            });
        });

        // Login (for demo, skip actual auth)
        document.getElementById('login-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        // Logout
        document.getElementById('logout-btn').addEventListener('click', () => {
            this.handleLogout();
        });

        // Sidebar toggle
        document.getElementById('sidebar-toggle').addEventListener('click', () => {
            document.querySelector('.sidebar').classList.toggle('open');
        });

        // Modal close
        document.getElementById('modal-close').addEventListener('click', () => {
            this.hideModal();
        });

        // Add buttons
        document.getElementById('add-cliente-btn').addEventListener('click', () => {
            this.showClienteModal();
        });

        document.getElementById('add-servico-btn').addEventListener('click', () => {
            this.showServicoModal();
        });

        document.getElementById('add-orcamento-btn').addEventListener('click', () => {
            this.showOrcamentoModal();
        });

        // Search
        document.getElementById('search-clientes').addEventListener('input', (e) => {
            this.filterTable('clientes', e.target.value);
        });

        document.getElementById('search-servicos').addEventListener('input', (e) => {
            this.filterTable('servicos', e.target.value);
        });

        document.getElementById('search-orcamentos').addEventListener('input', (e) => {
            this.filterTable('orcamentos', e.target.value);
        });
    }

    setupNetworkListener() {
        window.addEventListener('online', () => {
            this.updateSyncStatus();
        });

        window.addEventListener('offline', () => {
            this.updateSyncStatus();
        });

        this.updateSyncStatus();
    }

    updateSyncStatus() {
        const syncIcon = document.getElementById('sync-icon');
        const syncText = document.getElementById('sync-text');
        const syncStatus = document.querySelector('.sync-status');
        
        if (navigator.onLine) {
            syncIcon.className = 'fas fa-wifi';
            syncText.textContent = 'Online';
            syncStatus.classList.remove('offline', 'syncing');
        } else {
            syncIcon.className = 'fas fa-wifi-slash';
            syncText.textContent = 'Offline';
            syncStatus.classList.add('offline');
        }
    }

    async registerServiceWorker() {
        // Skip service worker for demo
        return;
    }

    async handleLogin() {
        // Demo login - always succeed
        const email = document.getElementById('email').value;
        
        if (email) {
            this.currentUser = { email };
            document.getElementById('user-name').textContent = email;
            this.showApp();
            this.navigateTo('dashboard');
            this.showNotification('Login realizado com sucesso', 'success');
        }
    }

    async handleLogout() {
        this.currentUser = null;
        this.showLogin();
        this.showNotification('Logout realizado com sucesso', 'success');
    }

    showLogin() {
        document.getElementById('loading-screen').classList.add('hidden');
        document.getElementById('login-screen').classList.remove('hidden');
        document.getElementById('main-app').classList.add('hidden');
    }

    showApp() {
        document.getElementById('loading-screen').classList.add('hidden');
        document.getElementById('login-screen').classList.add('hidden');
        document.getElementById('main-app').classList.remove('hidden');
    }

    navigateTo(page) {
        // Update navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-page="${page}"]`).classList.add('active');
        
        // Update page
        document.querySelectorAll('.page').forEach(p => {
            p.classList.remove('active');
        });
        document.getElementById(`${page}-page`).classList.add('active');
        
        // Update title
        const titles = {
            dashboard: 'Dashboard',
            clientes: 'Clientes',
            servicos: 'Serviços',
            orcamentos: 'Orçamentos'
        };
        document.getElementById('page-title').textContent = titles[page];
        
        this.currentPage = page;
        this.loadPageData(page);
    }

    async loadPageData(page) {
        try {
            switch (page) {
                case 'dashboard':
                    await this.loadDashboard();
                    break;
                case 'clientes':
                    await this.loadClientes();
                    break;
                case 'servicos':
                    await this.loadServicos();
                    break;
                case 'orcamentos':
                    await this.loadOrcamentos();
                    break;
            }
        } catch (error) {
            console.error('Error loading page data:', error);
            this.showNotification('Erro ao carregar dados da página', 'error');
        }
    }

    async loadDashboard() {
        try {
            const [clientes, servicos, orcamentos] = await Promise.all([
                this.clienteRepository.getAll(),
                this.servicoRepository.getAll(),
                this.orcamentoRepository.getAll()
            ]);

            document.getElementById('total-clientes').textContent = clientes.length;
            document.getElementById('total-servicos').textContent = servicos.length;
            document.getElementById('total-orcamentos').textContent = orcamentos.length;

            const totalReceita = orcamentos.reduce((sum, orc) => sum + (orc.valor_total || 0), 0);
            document.getElementById('total-receita').textContent = this.formatCurrency(totalReceita);

            // Recent orders
            const recentOrcamentos = orcamentos.slice(0, 5);
            const recentList = document.getElementById('recent-orcamentos');
            recentList.innerHTML = recentOrcamentos.map(orc => {
                const cliente = clientes.find(c => c.id === orc.cliente_id);
                return `
                    <div class="recent-item">
                        <div>
                            <strong>${cliente ? cliente.nome : 'Cliente não encontrado'}</strong>
                            <div class="status status--${orc.status === 'aprovado' ? 'success' : 'warning'}" style="margin-top: 4px;">
                                ${orc.status}
                            </div>
                        </div>
                        <div>${this.formatCurrency(orc.valor_total)}</div>
                    </div>
                `;
            }).join('');

            if (recentOrcamentos.length === 0) {
                recentList.innerHTML = '<p style="text-align: center; color: #666; padding: 20px;">Nenhum orçamento encontrado</p>';
            }

        } catch (error) {
            console.error('Error loading dashboard:', error);
        }
    }

    async loadClientes() {
        try {
            const clientes = await this.clienteRepository.getAll();
            const tbody = document.querySelector('#clientes-table tbody');
            
            tbody.innerHTML = clientes.map(cliente => `
                <tr>
                    <td>${cliente.nome}</td>
                    <td>${cliente.telefone}</td>
                    <td>${cliente.email}</td>
                    <td>${cliente.carro}</td>
                    <td>${cliente.placa}</td>
                    <td>
                        <div class="table-actions">
                            <button class="btn btn--sm btn--secondary" onclick="app.editCliente('${cliente.id}')">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn--sm btn--secondary" onclick="app.deleteCliente('${cliente.id}')">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `).join('');

            if (clientes.length === 0) {
                tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 20px;">Nenhum cliente encontrado</td></tr>';
            }
        } catch (error) {
            console.error('Error loading clientes:', error);
        }
    }

    async loadServicos() {
        try {
            const servicos = await this.servicoRepository.getAll();
            const tbody = document.querySelector('#servicos-table tbody');
            
            tbody.innerHTML = servicos.map(servico => `
                <tr>
                    <td>${servico.descricao}</td>
                    <td>${servico.categoria}</td>
                    <td>${this.formatCurrency(servico.valor)}</td>
                    <td>${servico.tempo_estimado}</td>
                    <td>
                        <div class="status status--${servico.ativo ? 'success' : 'error'}">
                            ${servico.ativo ? 'Ativo' : 'Inativo'}
                        </div>
                    </td>
                    <td>
                        <div class="table-actions">
                            <button class="btn btn--sm btn--secondary" onclick="app.editServico('${servico.id}')">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn--sm btn--secondary" onclick="app.deleteServico('${servico.id}')">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `).join('');

            if (servicos.length === 0) {
                tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 20px;">Nenhum serviço encontrado</td></tr>';
            }
        } catch (error) {
            console.error('Error loading servicos:', error);
        }
    }

    async loadOrcamentos() {
        try {
            const [orcamentos, clientes] = await Promise.all([
                this.orcamentoRepository.getAll(),
                this.clienteRepository.getAll()
            ]);
            
            const tbody = document.querySelector('#orcamentos-table tbody');
            
            tbody.innerHTML = orcamentos.map(orcamento => {
                const cliente = clientes.find(c => c.id === orcamento.cliente_id);
                return `
                    <tr>
                        <td>${cliente ? cliente.nome : 'Cliente não encontrado'}</td>
                        <td>
                            <div class="status status--${orcamento.status === 'aprovado' ? 'success' : 'warning'}">
                                ${orcamento.status}
                            </div>
                        </td>
                        <td>${this.formatCurrency(orcamento.valor_total)}</td>
                        <td>${this.formatCurrency(orcamento.desconto)}</td>
                        <td>${this.formatDate(orcamento.created_at)}</td>
                        <td>
                            <div class="table-actions">
                                <button class="btn btn--sm btn--secondary" onclick="app.editOrcamento('${orcamento.id}')">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="btn btn--sm btn--secondary" onclick="app.deleteOrcamento('${orcamento.id}')">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                `;
            }).join('');

            if (orcamentos.length === 0) {
                tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 20px;">Nenhum orçamento encontrado</td></tr>';
            }
        } catch (error) {
            console.error('Error loading orcamentos:', error);
        }
    }

    showClienteModal(cliente = null) {
        const title = cliente ? 'Editar Cliente' : 'Novo Cliente';
        const form = `
            <form id="cliente-form">
                <div class="form-group">
                    <label class="form-label">Nome *</label>
                    <input type="text" class="form-control" name="nome" value="${cliente ? cliente.nome : ''}" required>
                </div>
                <div class="form-group">
                    <label class="form-label">Telefone</label>
                    <input type="tel" class="form-control" name="telefone" value="${cliente ? cliente.telefone : ''}">
                </div>
                <div class="form-group">
                    <label class="form-label">Email</label>
                    <input type="email" class="form-control" name="email" value="${cliente ? cliente.email : ''}">
                </div>
                <div class="form-group">
                    <label class="form-label">Carro</label>
                    <input type="text" class="form-control" name="carro" value="${cliente ? cliente.carro : ''}">
                </div>
                <div class="form-group">
                    <label class="form-label">Placa</label>
                    <input type="text" class="form-control" name="placa" value="${cliente ? cliente.placa : ''}">
                </div>
                <div class="form-group">
                    <label class="form-label">Endereço</label>
                    <textarea class="form-control" name="endereco" rows="3">${cliente ? cliente.endereco : ''}</textarea>
                </div>
                <div class="form-group">
                    <label class="form-label">Observações</label>
                    <textarea class="form-control" name="observacoes" rows="3">${cliente ? cliente.observacoes : ''}</textarea>
                </div>
                <div class="flex gap-8">
                    <button type="submit" class="btn btn--primary">
                        ${cliente ? 'Atualizar' : 'Criar'} Cliente
                    </button>
                    <button type="button" class="btn btn--secondary" onclick="app.hideModal()">
                        Cancelar
                    </button>
                </div>
            </form>
        `;
        
        this.showModal(title, form);
        
        document.getElementById('cliente-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const data = Object.fromEntries(formData);
            
            try {
                if (cliente) {
                    await this.clienteRepository.update(cliente.id, data);
                    this.showNotification('Cliente atualizado com sucesso', 'success');
                } else {
                    await this.clienteRepository.create(data);
                    this.showNotification('Cliente criado com sucesso', 'success');
                }
                
                this.hideModal();
                this.loadClientes();
            } catch (error) {
                console.error('Error saving cliente:', error);
                this.showNotification('Erro ao salvar cliente', 'error');
            }
        });
    }

    showServicoModal(servico = null) {
        const title = servico ? 'Editar Serviço' : 'Novo Serviço';
        const form = `
            <form id="servico-form">
                <div class="form-group">
                    <label class="form-label">Descrição *</label>
                    <input type="text" class="form-control" name="descricao" value="${servico ? servico.descricao : ''}" required>
                </div>
                <div class="form-group">
                    <label class="form-label">Categoria</label>
                    <select class="form-control" name="categoria">
                        <option value="">Selecione uma categoria</option>
                        <option value="Lavagem" ${servico && servico.categoria === 'Lavagem' ? 'selected' : ''}>Lavagem</option>
                        <option value="Enceramento" ${servico && servico.categoria === 'Enceramento' ? 'selected' : ''}>Enceramento</option>
                        <option value="Detalhamento" ${servico && servico.categoria === 'Detalhamento' ? 'selected' : ''}>Detalhamento</option>
                        <option value="Pintura" ${servico && servico.categoria === 'Pintura' ? 'selected' : ''}>Pintura</option>
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">Valor *</label>
                    <input type="number" class="form-control" name="valor" step="0.01" value="${servico ? servico.valor : ''}" required>
                </div>
                <div class="form-group">
                    <label class="form-label">Tempo Estimado</label>
                    <input type="text" class="form-control" name="tempo_estimado" value="${servico ? servico.tempo_estimado : ''}" placeholder="Ex: 2 horas">
                </div>
                <div class="form-group">
                    <label class="form-label">
                        <input type="checkbox" name="ativo" ${servico && servico.ativo ? 'checked' : (!servico ? 'checked' : '')}>
                        Serviço Ativo
                    </label>
                </div>
                <div class="flex gap-8">
                    <button type="submit" class="btn btn--primary">
                        ${servico ? 'Atualizar' : 'Criar'} Serviço
                    </button>
                    <button type="button" class="btn btn--secondary" onclick="app.hideModal()">
                        Cancelar
                    </button>
                </div>
            </form>
        `;
        
        this.showModal(title, form);
        
        document.getElementById('servico-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const data = Object.fromEntries(formData);
            data.ativo = formData.has('ativo');
            data.valor = parseFloat(data.valor) || 0;
            
            try {
                if (servico) {
                    await this.servicoRepository.update(servico.id, data);
                    this.showNotification('Serviço atualizado com sucesso', 'success');
                } else {
                    await this.servicoRepository.create(data);
                    this.showNotification('Serviço criado com sucesso', 'success');
                }
                
                this.hideModal();
                this.loadServicos();
            } catch (error) {
                console.error('Error saving servico:', error);
                this.showNotification('Erro ao salvar serviço', 'error');
            }
        });
    }

    async showOrcamentoModal(orcamento = null) {
        const clientes = await this.clienteRepository.getAll();
        const servicos = await this.servicoRepository.getAll();
        
        const title = orcamento ? 'Editar Orçamento' : 'Novo Orçamento';
        const form = `
            <form id="orcamento-form">
                <div class="form-group">
                    <label class="form-label">Cliente *</label>
                    <select class="form-control" name="cliente_id" required>
                        <option value="">Selecione um cliente</option>
                        ${clientes.map(cliente => `
                            <option value="${cliente.id}" ${orcamento && orcamento.cliente_id === cliente.id ? 'selected' : ''}>
                                ${cliente.nome}
                            </option>
                        `).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">Status</label>
                    <select class="form-control" name="status">
                        <option value="pendente" ${orcamento && orcamento.status === 'pendente' ? 'selected' : ''}>Pendente</option>
                        <option value="aprovado" ${orcamento && orcamento.status === 'aprovado' ? 'selected' : ''}>Aprovado</option>
                        <option value="rejeitado" ${orcamento && orcamento.status === 'rejeitado' ? 'selected' : ''}>Rejeitado</option>
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">Valor Total</label>
                    <input type="number" class="form-control" name="valor_total" step="0.01" value="${orcamento ? orcamento.valor_total : ''}">
                </div>
                <div class="form-group">
                    <label class="form-label">Desconto</label>
                    <input type="number" class="form-control" name="desconto" step="0.01" value="${orcamento ? orcamento.desconto : ''}">
                </div>
                <div class="form-group">
                    <label class="form-label">Observações</label>
                    <textarea class="form-control" name="observacoes" rows="3">${orcamento ? orcamento.observacoes : ''}</textarea>
                </div>
                <div class="flex gap-8">
                    <button type="submit" class="btn btn--primary">
                        ${orcamento ? 'Atualizar' : 'Criar'} Orçamento
                    </button>
                    <button type="button" class="btn btn--secondary" onclick="app.hideModal()">
                        Cancelar
                    </button>
                </div>
            </form>
        `;
        
        this.showModal(title, form);
        
        document.getElementById('orcamento-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const data = Object.fromEntries(formData);
            data.valor_total = parseFloat(data.valor_total) || 0;
            data.desconto = parseFloat(data.desconto) || 0;
            
            try {
                if (orcamento) {
                    await this.orcamentoRepository.update(orcamento.id, data);
                    this.showNotification('Orçamento atualizado com sucesso', 'success');
                } else {
                    await this.orcamentoRepository.create(data);
                    this.showNotification('Orçamento criado com sucesso', 'success');
                }
                
                this.hideModal();
                this.loadOrcamentos();
            } catch (error) {
                console.error('Error saving orcamento:', error);
                this.showNotification('Erro ao salvar orçamento', 'error');
            }
        });
    }

    async editCliente(id) {
        const cliente = await this.clienteRepository.getById(id);
        if (cliente) {
            this.showClienteModal(cliente);
        }
    }

    async editServico(id) {
        const servico = await this.servicoRepository.getById(id);
        if (servico) {
            this.showServicoModal(servico);
        }
    }

    async editOrcamento(id) {
        const orcamento = await this.orcamentoRepository.getById(id);
        if (orcamento) {
            this.showOrcamentoModal(orcamento);
        }
    }

    async deleteCliente(id) {
        if (confirm('Tem certeza que deseja excluir este cliente?')) {
            try {
                await this.clienteRepository.delete(id);
                this.showNotification('Cliente excluído com sucesso', 'success');
                this.loadClientes();
            } catch (error) {
                console.error('Error deleting cliente:', error);
                this.showNotification('Erro ao excluir cliente', 'error');
            }
        }
    }

    async deleteServico(id) {
        if (confirm('Tem certeza que deseja excluir este serviço?')) {
            try {
                await this.servicoRepository.delete(id);
                this.showNotification('Serviço excluído com sucesso', 'success');
                this.loadServicos();
            } catch (error) {
                console.error('Error deleting servico:', error);
                this.showNotification('Erro ao excluir serviço', 'error');
            }
        }
    }

    async deleteOrcamento(id) {
        if (confirm('Tem certeza que deseja excluir este orçamento?')) {
            try {
                await this.orcamentoRepository.delete(id);
                this.showNotification('Orçamento excluído com sucesso', 'success');
                this.loadOrcamentos();
            } catch (error) {
                console.error('Error deleting orcamento:', error);
                this.showNotification('Erro ao excluir orçamento', 'error');
            }
        }
    }

    filterTable(table, query) {
        const tableBody = document.querySelector(`#${table}-table tbody`);
        const rows = tableBody.querySelectorAll('tr');
        
        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            const show = text.includes(query.toLowerCase());
            row.style.display = show ? '' : 'none';
        });
    }

    showModal(title, body) {
        document.getElementById('modal-title').textContent = title;
        document.getElementById('modal-body').innerHTML = body;
        document.getElementById('modal').classList.add('show');
    }

    hideModal() {
        document.getElementById('modal').classList.remove('show');
    }

    showNotification(message, type = 'info') {
        const notification = document.getElementById('notification');
        const icon = notification.querySelector('.notification-icon');
        const text = notification.querySelector('.notification-text');
        
        notification.className = `notification ${type}`;
        text.textContent = message;
        
        switch (type) {
            case 'success':
                icon.className = 'fas fa-check-circle notification-icon';
                break;
            case 'error':
                icon.className = 'fas fa-exclamation-circle notification-icon';
                break;
            case 'warning':
                icon.className = 'fas fa-exclamation-triangle notification-icon';
                break;
            default:
                icon.className = 'fas fa-info-circle notification-icon';
        }
        
        notification.classList.add('show');
        
        setTimeout(() => {
            notification.classList.remove('show');
        }, 5000);
    }

    formatCurrency(value) {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value || 0);
    }

    formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('pt-BR');
    }
}

// PWA Install prompt
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    
    // Show install button
    const installBtn = document.createElement('button');
    installBtn.className = 'btn btn--primary';
    installBtn.innerHTML = '<i class="fas fa-download"></i> Instalar App';
    installBtn.style.marginLeft = '10px';
    installBtn.onclick = () => {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((result) => {
            if (result.outcome === 'accepted') {
                console.log('User accepted the A2HS prompt');
            }
            deferredPrompt = null;
            installBtn.remove();
        });
    };
    
    const headerRight = document.querySelector('.header-right');
    if (headerRight) {
        headerRight.appendChild(installBtn);
    }
});

// Handle app install
window.addEventListener('appinstalled', () => {
    console.log('App installed');
    if (window.app) {
        window.app.showNotification('App instalado com sucesso!', 'success');
    }
});

// Global error handler
window.addEventListener('error', (error) => {
    console.error('Global error:', error);
    if (window.app) {
        window.app.showNotification('Ocorreu um erro inesperado', 'error');
    }
});

// Unhandled promise rejection
window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    if (window.app) {
        window.app.showNotification('Erro de conexão', 'error');
    }
});