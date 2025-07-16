/**
 * Sistema CRM - Gestor ProPlus
 * @file crm.js
 * @version 2.0.0
 */

// Módulo CRM
const CRM = {
    
    // Formulários
    forms: {
        // Criar formulário de cliente
        createClientForm() {
            return `
                <div class="modal-backdrop" id="clientModal">
                    <div class="modal">
                        <div class="modal-header">
                            <h3>Novo Cliente</h3>
                            <button type="button" class="modal-close" onclick="closeModal('clientModal')">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                        <div class="modal-body">
                            <form id="clientForm">
                                <div class="form-grid">
                                    <div class="form-group">
                                        <label for="clientNome">Nome *</label>
                                        <input type="text" id="clientNome" name="nome" required>
                                    </div>
                                    <div class="form-group">
                                        <label for="clientTelefone">Telefone *</label>
                                        <input type="tel" id="clientTelefone" name="telefone" required>
                                    </div>
                                    <div class="form-group">
                                        <label for="clientEmail">Email</label>
                                        <input type="email" id="clientEmail" name="email">
                                    </div>
                                    <div class="form-group">
                                        <label for="clientCarro">Carro</label>
                                        <input type="text" id="clientCarro" name="carro">
                                    </div>
                                    <div class="form-group">
                                        <label for="clientPlaca">Placa</label>
                                        <input type="text" id="clientPlaca" name="placa">
                                    </div>
                                    <div class="form-group full-width">
                                        <label for="clientEndereco">Endereço</label>
                                        <input type="text" id="clientEndereco" name="endereco">
                                    </div>
                                </div>
                                <div class="form-actions">
                                    <button type="button" class="btn btn-secondary" onclick="closeModal('clientModal')">
                                        Cancelar
                                    </button>
                                    <button type="submit" class="btn btn-primary">
                                        <i class="fas fa-save"></i>
                                        Salvar Cliente
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            `;
        },

        // Criar formulário de serviço
        createServiceForm() {
            return `
                <div class="modal-backdrop" id="serviceModal">
                    <div class="modal">
                        <div class="modal-header">
                            <h3>Novo Serviço</h3>
                            <button type="button" class="modal-close" onclick="closeModal('serviceModal')">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                        <div class="modal-body">
                            <form id="serviceForm">
                                <div class="form-grid">
                                    <div class="form-group full-width">
                                        <label for="serviceDescricao">Descrição *</label>
                                        <input type="text" id="serviceDescricao" name="descricao" required>
                                    </div>
                                    <div class="form-group">
                                        <label for="serviceValor">Valor *</label>
                                        <input type="number" id="serviceValor" name="valor" step="0.01" required>
                                    </div>
                                    <div class="form-group">
                                        <label for="serviceDuracao">Duração (min)</label>
                                        <input type="number" id="serviceDuracao" name="duracao" value="60">
                                    </div>
                                    <div class="form-group">
                                        <label for="serviceCategoria">Categoria</label>
                                        <select id="serviceCategoria" name="categoria">
                                            <option value="Lavagem">Lavagem</option>
                                            <option value="Proteção">Proteção</option>
                                            <option value="Limpeza">Limpeza</option>
                                            <option value="Detalhamento">Detalhamento</option>
                                            <option value="Outros">Outros</option>
                                        </select>
                                    </div>
                                    <div class="form-group">
                                        <label class="checkbox-label">
                                            <input type="checkbox" id="serviceAtivo" name="ativo" checked>
                                            <span>Serviço Ativo</span>
                                        </label>
                                    </div>
                                </div>
                                <div class="form-actions">
                                    <button type="button" class="btn btn-secondary" onclick="closeModal('serviceModal')">
                                        Cancelar
                                    </button>
                                    <button type="submit" class="btn btn-primary">
                                        <i class="fas fa-save"></i>
                                        Salvar Serviço
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            `;
        },

        // Criar formulário de orçamento
        createQuoteForm() {
            return `
                <div class="modal-backdrop" id="quoteModal">
                    <div class="modal">
                        <div class="modal-header">
                            <h3>Novo Orçamento</h3>
                            <button type="button" class="modal-close" onclick="closeModal('quoteModal')">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                        <div class="modal-body">
                            <form id="quoteForm">
                                <div class="form-grid">
                                    <div class="form-group">
                                        <label for="quoteCliente">Cliente *</label>
                                        <select id="quoteCliente" name="cliente_id" required>
                                            <option value="">Selecione um cliente</option>
                                            ${STATE.data.clientes.map(cliente => 
                                                `<option value="${cliente.id}">${cliente.nome}</option>`
                                            ).join('')}
                                        </select>
                                    </div>
                                    <div class="form-group">
                                        <label for="quoteStatus">Status</label>
                                        <select id="quoteStatus" name="status">
                                            <option value="Orçamento">Orçamento</option>
                                            <option value="Aprovado">Aprovado</option>
                                            <option value="Finalizado">Finalizado</option>
                                            <option value="Cancelado">Cancelado</option>
                                        </select>
                                    </div>
                                    <div class="form-group">
                                        <label for="quoteDesconto">Desconto (%)</label>
                                        <input type="number" id="quoteDesconto" name="desconto" value="0" min="0" max="100">
                                    </div>
                                    <div class="form-group full-width">
                                        <label for="quoteObservacoes">Observações</label>
                                        <textarea id="quoteObservacoes" name="observacoes" rows="3"></textarea>
                                    </div>
                                </div>
                                
                                <div class="quote-services">
                                    <h4>Serviços</h4>
                                    <div id="quoteServicesList">
                                        <!-- Serviços serão adicionados aqui -->
                                    </div>
                                    <button type="button" class="btn btn-secondary" onclick="CRM.quotes.addService()">
                                        <i class="fas fa-plus"></i>
                                        Adicionar Serviço
                                    </button>
                                </div>
                                
                                <div class="quote-total">
                                    <div class="total-row">
                                        <span>Subtotal:</span>
                                        <span id="quoteSubtotal">R$ 0,00</span>
                                    </div>
                                    <div class="total-row">
                                        <span>Desconto:</span>
                                        <span id="quoteDescontoValue">R$ 0,00</span>
                                    </div>
                                    <div class="total-row final">
                                        <span>Total:</span>
                                        <span id="quoteTotal">R$ 0,00</span>
                                    </div>
                                </div>
                                
                                <div class="form-actions">
                                    <button type="button" class="btn btn-secondary" onclick="closeModal('quoteModal')">
                                        Cancelar
                                    </button>
                                    <button type="submit" class="btn btn-primary">
                                        <i class="fas fa-save"></i>
                                        Salvar Orçamento
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            `;
        }
    },

    // Módulo de clientes
    clients: {
        // Mostrar formulário de cliente
        showForm() {
            document.body.insertAdjacentHTML('beforeend', CRM.forms.createClientForm());
            
            // Configurar máscaras
            const telefoneInput = document.getElementById('clientTelefone');
            const placaInput = document.getElementById('clientPlaca');
            
            telefoneInput.addEventListener('input', (e) => {
                e.target.value = formatPhone(e.target.value);
            });
            
            placaInput.addEventListener('input', (e) => {
                e.target.value = formatPlate(e.target.value);
            });
            
            // Configurar submit
            document.getElementById('clientForm').addEventListener('submit', (e) => {
                e.preventDefault();
                CRM.clients.save(e.target);
            });
        },

        // Salvar cliente
        save(form) {
            const formData = new FormData(form);
            const cliente = {
                nome: formData.get('nome'),
                telefone: formData.get('telefone'),
                email: formData.get('email'),
                carro: formData.get('carro'),
                placa: formData.get('placa'),
                endereco: formData.get('endereco')
            };

            // Validações
            if (!cliente.nome || !cliente.telefone) {
                showNotification('Nome e telefone são obrigatórios', 'error');
                return;
            }

            if (cliente.email && !validateEmail(cliente.email)) {
                showNotification('Email inválido', 'error');
                return;
            }

            try {
                DataManager.saveCliente(cliente);
                closeModal('clientModal');
                UIManager.renderClientes();
                showNotification('Cliente salvo com sucesso!', 'success');
            } catch (error) {
                showNotification('Erro ao salvar cliente', 'error');
            }
        }
    },

    // Módulo de serviços
    services: {
        // Mostrar formulário de serviço
        showForm() {
            document.body.insertAdjacentHTML('beforeend', CRM.forms.createServiceForm());
            
            // Configurar submit
            document.getElementById('serviceForm').addEventListener('submit', (e) => {
                e.preventDefault();
                CRM.services.save(e.target);
            });
        },

        // Salvar serviço
        save(form) {
            const formData = new FormData(form);
            const servico = {
                descricao: formData.get('descricao'),
                valor: parseFloat(formData.get('valor')),
                duracao: parseInt(formData.get('duracao')) || 60,
                categoria: formData.get('categoria'),
                ativo: formData.has('ativo')
            };

            // Validações
            if (!servico.descricao || !servico.valor) {
                showNotification('Descrição e valor são obrigatórios', 'error');
                return;
            }

            if (servico.valor <= 0) {
                showNotification('Valor deve ser maior que zero', 'error');
                return;
            }

            try {
                DataManager.saveServico(servico);
                closeModal('serviceModal');
                UIManager.renderServicos();
                showNotification('Serviço salvo com sucesso!', 'success');
            } catch (error) {
                showNotification('Erro ao salvar serviço', 'error');
            }
        }
    },

    // Módulo de orçamentos
    quotes: {
        selectedServices: [],

        // Mostrar formulário de orçamento
        showForm() {
            if (STATE.data.clientes.length === 0) {
                showNotification('Cadastre pelo menos um cliente primeiro', 'warning');
                return;
            }

            this.selectedServices = [];
            document.body.insertAdjacentHTML('beforeend', CRM.forms.createQuoteForm());
            
            // Configurar event listeners
            document.getElementById('quoteDesconto').addEventListener('input', () => {
                this.calculateTotal();
            });
            
            document.getElementById('quoteForm').addEventListener('submit', (e) => {
                e.preventDefault();
                this.save(e.target);
            });
        },

        // Adicionar serviço ao orçamento
        addService() {
            const servicesList = document.getElementById('quoteServicesList');
            const serviceIndex = this.selectedServices.length;
            
            const serviceItem = document.createElement('div');
            serviceItem.className = 'quote-service-item';
            serviceItem.dataset.index = serviceIndex;
            serviceItem.innerHTML = `
                <div class="service-row">
                    <select name="servico_id_${serviceIndex}" onchange="CRM.quotes.updateService(${serviceIndex})">
                        <option value="">Selecione um serviço</option>
                        ${STATE.data.servicos.filter(s => s.ativo).map(servico => 
                            `<option value="${servico.id}" data-valor="${servico.valor}">${servico.descricao} - ${formatCurrency(servico.valor)}</option>`
                        ).join('')}
                    </select>
                    <input type="number" name="quantidade_${serviceIndex}" value="1" min="1" onchange="CRM.quotes.updateService(${serviceIndex})">
                    <span class="service-total">R$ 0,00</span>
                    <button type="button" class="btn btn-sm btn-danger" onclick="CRM.quotes.removeService(${serviceIndex})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            
            servicesList.appendChild(serviceItem);
            this.selectedServices.push({ servico_id: '', quantidade: 1, valor: 0 });
        },

        // Atualizar serviço
        updateService(index) {
            const serviceSelect = document.querySelector(`[name="servico_id_${index}"]`);
            const quantityInput = document.querySelector(`[name="quantidade_${index}"]`);
            const totalSpan = document.querySelector(`[data-index="${index}"] .service-total`);
            
            const selectedOption = serviceSelect.selectedOptions[0];
            const valor = selectedOption ? parseFloat(selectedOption.dataset.valor) : 0;
            const quantidade = parseInt(quantityInput.value) || 1;
            const total = valor * quantidade;
            
            this.selectedServices[index] = {
                servico_id: serviceSelect.value,
                quantidade: quantidade,
                valor: valor
            };
            
            totalSpan.textContent = formatCurrency(total);
            this.calculateTotal();
        },

        // Remover serviço
        removeService(index) {
            const serviceItem = document.querySelector(`[data-index="${index}"]`);
            serviceItem.remove();
            this.selectedServices.splice(index, 1);
            this.calculateTotal();
        },

        // Calcular total
        calculateTotal() {
            const subtotal = this.selectedServices.reduce((sum, item) => 
                sum + (item.valor * item.quantidade), 0
            );
            
            const desconto = parseFloat(document.getElementById('quoteDesconto').value) || 0;
            const descontoValue = subtotal * (desconto / 100);
            const total = subtotal - descontoValue;
            
            document.getElementById('quoteSubtotal').textContent = formatCurrency(subtotal);
            document.getElementById('quoteDescontoValue').textContent = formatCurrency(descontoValue);
            document.getElementById('quoteTotal').textContent = formatCurrency(total);
        },

        // Salvar orçamento
        save(form) {
            const formData = new FormData(form);
            
            if (this.selectedServices.length === 0) {
                showNotification('Adicione pelo menos um serviço', 'error');
                return;
            }
            
            const validServices = this.selectedServices.filter(s => s.servico_id);
            if (validServices.length === 0) {
                showNotification('Selecione pelo menos um serviço válido', 'error');
                return;
            }
            
            const subtotal = validServices.reduce((sum, item) => 
                sum + (item.valor * item.quantidade), 0
            );
            
            const desconto = parseFloat(formData.get('desconto')) || 0;
            const descontoValue = subtotal * (desconto / 100);
            const total = subtotal - descontoValue;
            
            const orcamento = {
                cliente_id: formData.get('cliente_id'),
                status: formData.get('status'),
                desconto: desconto,
                observacoes: formData.get('observacoes'),
                valor_total: total,
                itens: validServices.map(item => ({
                    servico_id: item.servico_id,
                    quantidade: item.quantidade,
                    valor: item.valor
                }))
            };

            try {
                DataManager.saveOrcamento(orcamento);
                closeModal('quoteModal');
                UIManager.renderOrcamentos();
                UIManager.renderHistorico();
                showNotification('Orçamento salvo com sucesso!', 'success');
            } catch (error) {
                showNotification('Erro ao salvar orçamento', 'error');
            }
        }
    },

    // Relatórios
    reports: {
        // Gerar relatório de faturamento
        generateRevenueReport() {
            const orcamentosFinalizados = STATE.data.orcamentos.filter(o => o.status === 'Finalizado');
            const totalFaturamento = orcamentosFinalizados.reduce((sum, o) => sum + o.valor_total, 0);
            const ticketMedio = orcamentosFinalizados.length > 0 ? totalFaturamento / orcamentosFinalizados.length : 0;
            
            return {
                totalFaturamento,
                ticketMedio,
                totalOrcamentos: orcamentosFinalizados.length,
                servicosMaisVendidos: this.getTopServices()
            };
        },

        // Obter serviços mais vendidos
        getTopServices() {
            const servicosCount = {};
            
            STATE.data.orcamentos.forEach(orcamento => {
                if (orcamento.status === 'Finalizado' && orcamento.itens) {
                    orcamento.itens.forEach(item => {
                        if (servicosCount[item.servico_id]) {
                            servicosCount[item.servico_id] += item.quantidade;
                        } else {
                            servicosCount[item.servico_id] = item.quantidade;
                        }
                    });
                }
            });
            
            return Object.entries(servicosCount)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 5)
                .map(([servicoId, quantidade]) => {
                    const servico = STATE.data.servicos.find(s => s.id === servicoId);
                    return {
                        servico: servico ? servico.descricao : 'Serviço não encontrado',
                        quantidade
                    };
                });
        }
    }
};

// Estender funcionalidades da aplicação
App.showClientForm = function() {
    CRM.clients.showForm();
    /* --- CLIENTES --- */
clients:{showForm(){
  openModal('tplCliente');
  const f=document.getElementById('formCliente');
  const tel=f.tel||f.querySelector('[name=telefone]');
  tel.addEventListener('input',e=>e.target.value=formatPhone(e.target.value));
  f.addEventListener('submit',ev=>{
    ev.preventDefault();
    const data=Object.fromEntries(new FormData(f));
    if(!validateEmail(data.email||'')){showNotification('Email inválido','error');return;}
    DataManager.saveCliente(data);
    closeModal(f.closest('[data-modal]'));
    UIManager.renderClientes();
    showNotification('Cliente salvo','success');
  });
}},

/* --- SERVIÇOS --- */
services:{showForm(){
  openModal('tplServico');
  const f=document.getElementById('formServico');
  f.addEventListener('submit',ev=>{
    ev.preventDefault();
    const data=Object.fromEntries(new FormData(f));
    data.valor=parseFloat(data.valor);
    DataManager.saveServico(data);
    closeModal(f.closest('[data-modal]'));
    UIManager.renderServicos();
    showNotification('Serviço salvo','success');
  });
}},

/* --- ORÇAMENTOS --- */
quotes:{showForm(){
  openModal('tplOrcamento');
  this.itens=[];
  const f=document.getElementById('formOrcamento');
  const selCli=f.cliente_id;
  selCli.innerHTML=STATE.data.clientes.map(c=>`<option value="${c.id}">${c.nome}</option>`).join('');
  const list=f.querySelector('#itensOrcamento');
  const totalEl=f.querySelector('#orcTotal');
  const addItem=()=>{ /* cria linha */ };
  const calcTotal=()=>{ /* atualiza totalEl */ };
  addItem(); // primeira linha
  f.querySelector('#btnAddItem').onclick=addItem;
  f.addEventListener('submit',ev=>{
    ev.preventDefault();
    const data=Object.fromEntries(new FormData(f));
    data.itens=this.itens.filter(i=>i.servico_id);
    data.desconto=parseFloat(data.desconto||0);
    data.valor_total=this.itens.reduce((s,i)=>s+i.total,0)*(1-data.desconto/100);
    DataManager.saveOrcamento(data);
    UIManager.renderOrcamentos();UIManager.renderHistorico();
    closeModal(f.closest('[data-modal]'));
    showNotification('Orçamento salvo','success');
  });
}}

};

App.showServiceForm = function() {
    CRM.services.showForm();
};

App.showQuoteForm = function() {
    CRM.quotes.showForm();
};

// Exportar CRM para uso global
window.CRM = CRM;
