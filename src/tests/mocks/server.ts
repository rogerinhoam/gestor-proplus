// src/tests/mocks/server.ts
import { setupServer } from 'msw/node'
import { rest } from 'msw'
import { testUtils, testConfig } from '../setup'

// Dados mock para os testes
const mockData = {
  clientes: [
    testUtils.createMockCliente({ id: '1', nome: 'João Silva' }),
    testUtils.createMockCliente({ id: '2', nome: 'Maria Santos', telefone: '(11) 88888-8888' }),
    testUtils.createMockCliente({ id: '3', nome: 'Pedro Costa', carro: 'Toyota Corolla', placa: 'XYZ-5678' })
  ],
  
  orcamentos: [
    testUtils.createMockOrcamento({ id: '1', cliente_id: '1', status: 'Orçamento' }),
    testUtils.createMockOrcamento({ id: '2', cliente_id: '2', status: 'Aprovado', valor_total: 200.00 }),
    testUtils.createMockOrcamento({ id: '3', cliente_id: '3', status: 'Finalizado', valor_total: 120.00 })
  ],
  
  agendamentos: [
    testUtils.createMockAgendamento({ id: '1', cliente_id: '1', data_hora: '2024-01-15T10:00:00Z' }),
    testUtils.createMockAgendamento({ id: '2', cliente_id: '2', data_hora: '2024-01-16T14:00:00Z', status: 'confirmado' })
  ],
  
  despesas: [
    testUtils.createMockDespesa({ id: '1', descricao: 'Produtos de limpeza', valor: 50.00 }),
    testUtils.createMockDespesa({ id: '2', descricao: 'Combustível', valor: 100.00, categoria: 'Combustível' })
  ],
  
  configuracoes: [
    { id: '1', chave: 'empresa_nome', valor: 'R.M. Estética Automotiva', updated_at: '2024-01-01T00:00:00Z' },
    { id: '2', chave: 'empresa_cnpj', valor: '18.637.639/0001-48', updated_at: '2024-01-01T00:00:00Z' },
    { id: '3', chave: 'empresa_telefone', valor: '(24) 99948-6232', updated_at: '2024-01-01T00:00:00Z' }
  ]
}

// Utilitário para simular delay de rede
const networkDelay = () => new Promise(resolve => 
  setTimeout(resolve, testConfig.mockApiDelay)
)

// Handlers para as APIs
export const handlers = [
  // === CLIENTES ===
  
  // GET /clientes - Listar clientes
  rest.get(`${testConfig.apiUrls.clientes}`, async (req, res, ctx) => {
    await networkDelay()
    
    const searchParam = req.url.searchParams.get('search')
    let clientes = [...mockData.clientes]
    
    if (searchParam) {
      clientes = clientes.filter(cliente =>
        cliente.nome.toLowerCase().includes(searchParam.toLowerCase()) ||
        cliente.telefone?.includes(searchParam) ||
        cliente.carro?.toLowerCase().includes(searchParam.toLowerCase()) ||
        cliente.placa?.toLowerCase().includes(searchParam.toLowerCase())
      )
    }
    
    return res(ctx.status(200), ctx.json(clientes))
  }),
  
  // GET /clientes/:id - Buscar cliente por ID
  rest.get(`${testConfig.apiUrls.clientes}/:id`, async (req, res, ctx) => {
    await networkDelay()
    
    const { id } = req.params
    const cliente = mockData.clientes.find(c => c.id === id)
    
    if (!cliente) {
      return res(ctx.status(404), ctx.json({ error: 'Cliente não encontrado' }))
    }
    
    return res(ctx.status(200), ctx.json(cliente))
  }),
  
  // POST /clientes - Criar cliente
  rest.post(`${testConfig.apiUrls.clientes}`, async (req, res, ctx) => {
    await networkDelay()
    
    const clienteData = await req.json()
    
    // Validações básicas
    if (!clienteData.nome) {
      return res(ctx.status(400), ctx.json({ error: 'Nome é obrigatório' }))
    }
    
    // Verificar telefone duplicado
    if (clienteData.telefone && 
        mockData.clientes.some(c => c.telefone === clienteData.telefone)) {
      return res(ctx.status(400), ctx.json({ error: 'Telefone já cadastrado' }))
    }
    
    const novoCliente = {
      id: String(mockData.clientes.length + 1),
      ...clienteData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    mockData.clientes.push(novoCliente)
    
    return res(ctx.status(201), ctx.json(novoCliente))
  }),
  
  // PUT /clientes/:id - Atualizar cliente
  rest.put(`${testConfig.apiUrls.clientes}/:id`, async (req, res, ctx) => {
    await networkDelay()
    
    const { id } = req.params
    const updateData = await req.json()
    
    const clienteIndex = mockData.clientes.findIndex(c => c.id === id)
    
    if (clienteIndex === -1) {
      return res(ctx.status(404), ctx.json({ error: 'Cliente não encontrado' }))
    }
    
    mockData.clientes[clienteIndex] = {
      ...mockData.clientes[clienteIndex],
      ...updateData,
      updated_at: new Date().toISOString()
    }
    
    return res(ctx.status(200), ctx.json(mockData.clientes[clienteIndex]))
  }),
  
  // DELETE /clientes/:id - Excluir cliente
  rest.delete(`${testConfig.apiUrls.clientes}/:id`, async (req, res, ctx) => {
    await networkDelay()
    
    const { id } = req.params
    
    // Verificar se cliente tem orçamentos
    const temOrcamentos = mockData.orcamentos.some(o => o.cliente_id === id)
    
    if (temOrcamentos) {
      return res(ctx.status(400), ctx.json({ 
        error: 'Não é possível excluir cliente com orçamentos' 
      }))
    }
    
    const clienteIndex = mockData.clientes.findIndex(c => c.id === id)
    
    if (clienteIndex === -1) {
      return res(ctx.status(404), ctx.json({ error: 'Cliente não encontrado' }))
    }
    
    mockData.clientes.splice(clienteIndex, 1)
    
    return res(ctx.status(204))
  }),
  
  // === ORÇAMENTOS ===
  
  // GET /orcamentos - Listar orçamentos
  rest.get(`${testConfig.apiUrls.orcamentos}`, async (req, res, ctx) => {
    await networkDelay()
    
    const status = req.url.searchParams.get('status')
    let orcamentos = [...mockData.orcamentos]
    
    if (status) {
      orcamentos = orcamentos.filter(o => o.status === status)
    }
    
    // Incluir dados do cliente
    orcamentos = orcamentos.map(orcamento => ({
      ...orcamento,
      clientes: mockData.clientes.find(c => c.id === orcamento.cliente_id)
    }))
    
    return res(ctx.status(200), ctx.json(orcamentos))
  }),
  
  // POST /orcamentos - Criar orçamento
  rest.post(`${testConfig.apiUrls.orcamentos}`, async (req, res, ctx) => {
    await networkDelay()
    
    const orcamentoData = await req.json()
    
    // Validações básicas
    if (!orcamentoData.cliente_id) {
      return res(ctx.status(400), ctx.json({ error: 'Cliente é obrigatório' }))
    }
    
    if (!orcamentoData.valor_total || orcamentoData.valor_total <= 0) {
      return res(ctx.status(400), ctx.json({ error: 'Valor total inválido' }))
    }
    
    const novoOrcamento = {
      id: String(mockData.orcamentos.length + 1),
      ...orcamentoData,
      status: orcamentoData.status || 'Orçamento',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    mockData.orcamentos.push(novoOrcamento)
    
    return res(ctx.status(201), ctx.json(novoOrcamento))
  }),
  
  // PUT /orcamentos/:id - Atualizar orçamento
  rest.put(`${testConfig.apiUrls.orcamentos}/:id`, async (req, res, ctx) => {
    await networkDelay()
    
    const { id } = req.params
    const updateData = await req.json()
    
    const orcamentoIndex = mockData.orcamentos.findIndex(o => o.id === id)
    
    if (orcamentoIndex === -1) {
      return res(ctx.status(404), ctx.json({ error: 'Orçamento não encontrado' }))
    }
    
    mockData.orcamentos[orcamentoIndex] = {
      ...mockData.orcamentos[orcamentoIndex],
      ...updateData,
      updated_at: new Date().toISOString()
    }
    
    return res(ctx.status(200), ctx.json(mockData.orcamentos[orcamentoIndex]))
  }),
  
  // === AGENDAMENTOS ===
  
  // GET /agendamentos - Listar agendamentos
  rest.get(`${testConfig.apiUrls.agendamentos}`, async (req, res, ctx) => {
    await networkDelay()
    
    let agendamentos = [...mockData.agendamentos]
    
    // Incluir dados do cliente
    agendamentos = agendamentos.map(agendamento => ({
      ...agendamento,
      clientes: mockData.clientes.find(c => c.id === agendamento.cliente_id)
    }))
    
    return res(ctx.status(200), ctx.json(agendamentos))
  }),
  
  // POST /agendamentos - Criar agendamento
  rest.post(`${testConfig.apiUrls.agendamentos}`, async (req, res, ctx) => {
    await networkDelay()
    
    const agendamentoData = await req.json()
    
    // Validações básicas
    if (!agendamentoData.cliente_id) {
      return res(ctx.status(400), ctx.json({ error: 'Cliente é obrigatório' }))
    }
    
    if (!agendamentoData.data_hora) {
      return res(ctx.status(400), ctx.json({ error: 'Data e hora são obrigatórios' }))
    }
    
    // Verificar conflito de horário
    const dataHora = new Date(agendamentoData.data_hora)
    const conflito = mockData.agendamentos.some(a => {
      const dataExistente = new Date(a.data_hora)
      const diff = Math.abs(dataExistente.getTime() - dataHora.getTime())
      return diff < 60 * 60 * 1000 // 1 hora de diferença
    })
    
    if (conflito) {
      return res(ctx.status(400), ctx.json({ error: 'Conflito de horário' }))
    }
    
    const novoAgendamento = {
      id: String(mockData.agendamentos.length + 1),
      ...agendamentoData,
      status: agendamentoData.status || 'agendado',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    mockData.agendamentos.push(novoAgendamento)
    
    return res(ctx.status(201), ctx.json(novoAgendamento))
  }),
  
  // === DESPESAS ===
  
  // GET /despesas - Listar despesas
  rest.get(`${testConfig.apiUrls.despesas}`, async (req, res, ctx) => {
    await networkDelay()
    
    const categoria = req.url.searchParams.get('categoria')
    let despesas = [...mockData.despesas]
    
    if (categoria) {
      despesas = despesas.filter(d => d.categoria === categoria)
    }
    
    return res(ctx.status(200), ctx.json(despesas))
  }),
  
  // POST /despesas - Criar despesa
  rest.post(`${testConfig.apiUrls.despesas}`, async (req, res, ctx) => {
    await networkDelay()
    
    const despesaData = await req.json()
    
    // Validações básicas
    if (!despesaData.descricao) {
      return res(ctx.status(400), ctx.json({ error: 'Descrição é obrigatória' }))
    }
    
    if (!despesaData.valor || despesaData.valor <= 0) {
      return res(ctx.status(400), ctx.json({ error: 'Valor inválido' }))
    }
    
    const novaDespesa = {
      id: String(mockData.despesas.length + 1),
      ...despesaData,
      categoria: despesaData.categoria || 'Outros'
    }
    
    mockData.despesas.push(novaDespesa)
    
    return res(ctx.status(201), ctx.json(novaDespesa))
  }),
  
  // === CONFIGURAÇÕES ===
  
  // GET /configuracoes - Listar configurações
  rest.get(`${testConfig.apiUrls.configuracoes}`, async (req, res, ctx) => {
    await networkDelay()
    return res(ctx.status(200), ctx.json(mockData.configuracoes))
  }),
  
  // PUT /configuracoes/:chave - Atualizar configuração
  rest.put(`${testConfig.apiUrls.configuracoes}/:chave`, async (req, res, ctx) => {
    await networkDelay()
    
    const { chave } = req.params
    const { valor } = await req.json()
    
    const configIndex = mockData.configuracoes.findIndex(c => c.chave === chave)
    
    if (configIndex === -1) {
      // Criar nova configuração
      const novaConfig = {
        id: String(mockData.configuracoes.length + 1),
        chave: String(chave),
        valor,
        updated_at: new Date().toISOString()
      }
      mockData.configuracoes.push(novaConfig)
      return res(ctx.status(201), ctx.json(novaConfig))
    } else {
      // Atualizar existente
      mockData.configuracoes[configIndex] = {
        ...mockData.configuracoes[configIndex],
        valor,
        updated_at: new Date().toISOString()
      }
      return res(ctx.status(200), ctx.json(mockData.configuracoes[configIndex]))
    }
  }),
  
  // === HANDLERS DE ERRO PARA TESTES ===
  
  // Simular erro de servidor
  rest.get('/api/error/500', (req, res, ctx) => {
    return res(ctx.status(500), ctx.json({ error: 'Erro interno do servidor' }))
  }),
  
  // Simular timeout
  rest.get('/api/timeout', (req, res, ctx) => {
    return res(ctx.delay('infinite'))
  }),
  
  // Simular erro de rede
  rest.get('/api/network-error', (req, res, ctx) => {
    return res.networkError('Erro de conexão')
  })
]

// Criar servidor MSW
export const server = setupServer(...handlers)

// Utilitários para resetar dados mock
export const resetMockData = () => {
  mockData.clientes = [
    testUtils.createMockCliente({ id: '1', nome: 'João Silva' }),
    testUtils.createMockCliente({ id: '2', nome: 'Maria Santos', telefone: '(11) 88888-8888' }),
    testUtils.createMockCliente({ id: '3', nome: 'Pedro Costa', carro: 'Toyota Corolla', placa: 'XYZ-5678' })
  ]
  
  mockData.orcamentos = [
    testUtils.createMockOrcamento({ id: '1', cliente_id: '1', status: 'Orçamento' }),
    testUtils.createMockOrcamento({ id: '2', cliente_id: '2', status: 'Aprovado', valor_total: 200.00 }),
    testUtils.createMockOrcamento({ id: '3', cliente_id: '3', status: 'Finalizado', valor_total: 120.00 })
  ]
  
  mockData.agendamentos = [
    testUtils.createMockAgendamento({ id: '1', cliente_id: '1', data_hora: '2024-01-15T10:00:00Z' }),
    testUtils.createMockAgendamento({ id: '2', cliente_id: '2', data_hora: '2024-01-16T14:00:00Z', status: 'confirmado' })
  ]
  
  mockData.despesas = [
    testUtils.createMockDespesa({ id: '1', descricao: 'Produtos de limpeza', valor: 50.00 }),
    testUtils.createMockDespesa({ id: '2', descricao: 'Combustível', valor: 100.00, categoria: 'Combustível' })
  ]
}

// Exportar dados mock para uso em testes
export { mockData }
