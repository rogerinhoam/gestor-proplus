// src/tests/features/clientes/ClientesView.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ClientesView } from '../../../features/clientes/ClientesView'
import { testUtils, resetMockData } from '../../setup'

// Mock do hook useClientes
const mockUseClientes = vi.fn()
vi.mock('../../../features/clientes/useClientes', () => ({
  useClientes: () => mockUseClientes()
}))

// Mock do componente ClienteForm
vi.mock('../../../features/clientes/ClienteForm', () => ({
  ClienteForm: ({ onSave, onClose, cliente }: any) => (
    <div data-testid="cliente-form">
      <h2>{cliente ? 'Editar Cliente' : 'Novo Cliente'}</h2>
      <button onClick={() => onSave(testUtils.createMockCliente())}>
        Salvar
      </button>
      <button onClick={onClose}>Cancelar</button>
    </div>
  )
}))

describe('ClientesView', () => {
  const defaultMockReturn = {
    clientes: [],
    loading: false,
    error: null,
    fetchClientes: vi.fn(),
    createCliente: vi.fn(),
    updateCliente: vi.fn(),
    deleteCliente: vi.fn(),
    searchTerm: '',
    setSearchTerm: vi.fn(),
    currentCliente: null,
    openForm: vi.fn(),
    closeForm: vi.fn(),
    filteredClientes: []
  }

  beforeEach(() => {
    resetMockData()
    mockUseClientes.mockReturnValue(defaultMockReturn)
  })

  it('renderiza título e subtítulo corretamente', () => {
    render(<ClientesView />)
    
    expect(screen.getByText('Clientes')).toBeInTheDocument()
    expect(screen.getByText('Gerencie seus clientes e histórico de serviços')).toBeInTheDocument()
  })

  it('renderiza botão de novo cliente', () => {
    render(<ClientesView />)
    
    const novoClienteButton = screen.getByRole('button', { name: /novo cliente/i })
    expect(novoClienteButton).toBeInTheDocument()
  })

  it('renderiza campo de busca', () => {
    render(<ClientesView />)
    
    const searchInput = screen.getByPlaceholderText(/buscar por nome, telefone, carro ou placa/i)
    expect(searchInput).toBeInTheDocument()
  })

  it('chama openForm quando botão novo cliente é clicado', async () => {
    const openForm = vi.fn()
    mockUseClientes.mockReturnValue({
      ...defaultMockReturn,
      openForm
    })

    const user = userEvent.setup()
    render(<ClientesView />)
    
    const novoClienteButton = screen.getByRole('button', { name: /novo cliente/i })
    await user.click(novoClienteButton)
    
    expect(openForm).toHaveBeenCalledWith(null)
  })

  it('exibe loading spinner quando loading é true', () => {
    mockUseClientes.mockReturnValue({
      ...defaultMockReturn,
      loading: true
    })

    render(<ClientesView />)
    
    expect(screen.getByText('Carregando...')).toBeInTheDocument()
  })

  it('exibe mensagem de erro quando há erro', () => {
    mockUseClientes.mockReturnValue({
      ...defaultMockReturn,
      error: 'Erro ao carregar clientes'
    })

    render(<ClientesView />)
    
    expect(screen.getByText('Erro ao carregar clientes')).toBeInTheDocument()
  })

  it('exibe lista de clientes', () => {
    const clientes = [
      testUtils.createMockCliente({ id: '1', nome: 'João Silva' }),
      testUtils.createMockCliente({ id: '2', nome: 'Maria Santos' })
    ]

    mockUseClientes.mockReturnValue({
      ...defaultMockReturn,
      clientes,
      filteredClientes: clientes
    })

    render(<ClientesView />)
    
    expect(screen.getByText('João Silva')).toBeInTheDocument()
    expect(screen.getByText('Maria Santos')).toBeInTheDocument()
  })

  it('exibe mensagem quando não há clientes', () => {
    mockUseClientes.mockReturnValue({
      ...defaultMockReturn,
      clientes: [],
      filteredClientes: []
    })

    render(<ClientesView />)
    
    expect(screen.getByText('Nenhum cliente encontrado')).toBeInTheDocument()
  })

  it('filtra clientes conforme termo de busca', async () => {
    const setSearchTerm = vi.fn()
    const clientes = [
      testUtils.createMockCliente({ id: '1', nome: 'João Silva' }),
      testUtils.createMockCliente({ id: '2', nome: 'Maria Santos' })
    ]

    mockUseClientes.mockReturnValue({
      ...defaultMockReturn,
      clientes,
      filteredClientes: [clientes[0]], // Apenas João Silva
      setSearchTerm
    })

    const user = userEvent.setup()
    render(<ClientesView />)
    
    const searchInput = screen.getByPlaceholderText(/buscar por nome, telefone, carro ou placa/i)
    await user.type(searchInput, 'João')
    
    expect(setSearchTerm).toHaveBeenCalledWith('João')
  })

  it('exibe formulário quando currentCliente não é null', () => {
    mockUseClientes.mockReturnValue({
      ...defaultMockReturn,
      currentCliente: testUtils.createMockCliente()
    })

    render(<ClientesView />)
    
    expect(screen.getByTestId('cliente-form')).toBeInTheDocument()
  })

  it('exibe formulário de edição com dados do cliente', () => {
    const cliente = testUtils.createMockCliente({ nome: 'João Silva' })
    mockUseClientes.mockReturnValue({
      ...defaultMockReturn,
      currentCliente: cliente
    })

    render(<ClientesView />)
    
    expect(screen.getByText('Editar Cliente')).toBeInTheDocument()
  })

  it('exibe formulário de novo cliente', () => {
    mockUseClientes.mockReturnValue({
      ...defaultMockReturn,
      currentCliente: {} // Objeto vazio indica novo cliente
    })

    render(<ClientesView />)
    
    expect(screen.getByText('Novo Cliente')).toBeInTheDocument()
  })

  it('chama createCliente quando salva novo cliente', async () => {
    const createCliente = vi.fn()
    mockUseClientes.mockReturnValue({
      ...defaultMockReturn,
      currentCliente: {},
      createCliente
    })

    const user = userEvent.setup()
    render(<ClientesView />)
    
    const salvarButton = screen.getByRole('button', { name: /salvar/i })
    await user.click(salvarButton)
    
    expect(createCliente).toHaveBeenCalled()
  })

  it('chama updateCliente quando salva cliente existente', async () => {
    const updateCliente = vi.fn()
    const cliente = testUtils.createMockCliente({ id: '1' })
    
    mockUseClientes.mockReturnValue({
      ...defaultMockReturn,
      currentCliente: cliente,
      updateCliente
    })

    const user = userEvent.setup()
    render(<ClientesView />)
    
    const salvarButton = screen.getByRole('button', { name: /salvar/i })
    await user.click(salvarButton)
    
    expect(updateCliente).toHaveBeenCalled()
  })

  it('chama closeForm quando cancela formulário', async () => {
    const closeForm = vi.fn()
    mockUseClientes.mockReturnValue({
      ...defaultMockReturn,
      currentCliente: {},
      closeForm
    })

    const user = userEvent.setup()
    render(<ClientesView />)
    
    const cancelarButton = screen.getByRole('button', { name: /cancelar/i })
    await user.click(cancelarButton)
    
    expect(closeForm).toHaveBeenCalled()
  })

  it('exibe estatísticas dos clientes', () => {
    const clientes = [
      testUtils.createMockCliente({ id: '1', nome: 'João Silva' }),
      testUtils.createMockCliente({ id: '2', nome: 'Maria Santos' })
    ]

    mockUseClientes.mockReturnValue({
      ...defaultMockReturn,
      clientes,
      filteredClientes: clientes
    })

    render(<ClientesView />)
    
    expect(screen.getByText('2')).toBeInTheDocument() // Total de clientes
  })

  it('chama deleteCliente quando confirma exclusão', async () => {
    const deleteCliente = vi.fn()
    const clientes = [
      testUtils.createMockCliente({ id: '1', nome: 'João Silva' })
    ]

    mockUseClientes.mockReturnValue({
      ...defaultMockReturn,
      clientes,
      filteredClientes: clientes,
      deleteCliente
    })

    // Mock do window.confirm
    const confirmSpy = vi.spyOn(window, 'confirm')
    confirmSpy.mockReturnValue(true)

    const user = userEvent.setup()
    render(<ClientesView />)
    
    const deleteButton = screen.getByRole('button', { name: /excluir/i })
    await user.click(deleteButton)
    
    expect(confirmSpy).toHaveBeenCalledWith('Tem certeza que deseja excluir este cliente?')
    expect(deleteCliente).toHaveBeenCalledWith('1')
    
    confirmSpy.mockRestore()
  })

  it('não chama deleteCliente quando cancela exclusão', async () => {
    const deleteCliente = vi.fn()
    const clientes = [
      testUtils.createMockCliente({ id: '1', nome: 'João Silva' })
    ]

    mockUseClientes.mockReturnValue({
      ...defaultMockReturn,
      clientes,
      filteredClientes: clientes,
      deleteCliente
    })

    // Mock do window.confirm
    const confirmSpy = vi.spyOn(window, 'confirm')
    confirmSpy.mockReturnValue(false)

    const user = userEvent.setup()
    render(<ClientesView />)
    
    const deleteButton = screen.getByRole('button', { name: /excluir/i })
    await user.click(deleteButton)
    
    expect(deleteCliente).not.toHaveBeenCalled()
    
    confirmSpy.mockRestore()
  })

  it('exibe informações do cliente no card', () => {
    const cliente = testUtils.createMockCliente({
      id: '1',
      nome: 'João Silva',
      telefone: '(11) 99999-9999',
      carro: 'Honda Civic',
      placa: 'ABC-1234'
    })

    mockUseClientes.mockReturnValue({
      ...defaultMockReturn,
      clientes: [cliente],
      filteredClientes: [cliente]
    })

    render(<ClientesView />)
    
    expect(screen.getByText('João Silva')).toBeInTheDocument()
    expect(screen.getByText('(11) 99999-9999')).toBeInTheDocument()
    expect(screen.getByText('Honda Civic')).toBeInTheDocument()
    expect(screen.getByText('ABC-1234')).toBeInTheDocument()
  })

  it('chama openForm com cliente ao clicar em editar', async () => {
    const openForm = vi.fn()
    const cliente = testUtils.createMockCliente({ id: '1', nome: 'João Silva' })

    mockUseClientes.mockReturnValue({
      ...defaultMockReturn,
      clientes: [cliente],
      filteredClientes: [cliente],
      openForm
    })

    const user = userEvent.setup()
    render(<ClientesView />)
    
    const editButton = screen.getByRole('button', { name: /editar/i })
    await user.click(editButton)
    
    expect(openForm).toHaveBeenCalledWith(cliente)
  })

  it('chama fetchClientes no mount', () => {
    const fetchClientes = vi.fn()
    mockUseClientes.mockReturnValue({
      ...defaultMockReturn,
      fetchClientes
    })

    render(<ClientesView />)
    
    expect(fetchClientes).toHaveBeenCalled()
  })

  it('lida com erro de busca graciosamente', async () => {
    const setSearchTerm = vi.fn().mockImplementation(() => {
      throw new Error('Erro de busca')
    })

    mockUseClientes.mockReturnValue({
      ...defaultMockReturn,
      setSearchTerm
    })

    const user = userEvent.setup()
    render(<ClientesView />)
    
    const searchInput = screen.getByPlaceholderText(/buscar por nome, telefone, carro ou placa/i)
    
    // Não deve quebrar a aplicação
    await user.type(searchInput, 'teste')
    
    expect(screen.getByText('Clientes')).toBeInTheDocument()
  })

  it('exibe placeholder quando lista está vazia', () => {
    mockUseClientes.mockReturnValue({
      ...defaultMockReturn,
      clientes: [],
      filteredClientes: []
    })

    render(<ClientesView />)
    
    expect(screen.getByText('Nenhum cliente encontrado')).toBeInTheDocument()
    expect(screen.getByText('Comece cadastrando seu primeiro cliente')).toBeInTheDocument()
  })

  it('preserva busca durante reload', () => {
    mockUseClientes.mockReturnValue({
      ...defaultMockReturn,
      searchTerm: 'João'
    })

    render(<ClientesView />)
    
    const searchInput = screen.getByPlaceholderText(/buscar por nome, telefone, carro ou placa/i)
    expect(searchInput).toHaveValue('João')
  })

  it('exibe contador de clientes filtrados', () => {
    const clientes = [
      testUtils.createMockCliente({ id: '1', nome: 'João Silva' }),
      testUtils.createMockCliente({ id: '2', nome: 'Maria Santos' })
    ]

    mockUseClientes.mockReturnValue({
      ...defaultMockReturn,
      clientes,
      filteredClientes: [clientes[0]], // Apenas um filtrado
      searchTerm: 'João'
    })

    render(<ClientesView />)
    
    expect(screen.getByText('1 cliente(s) encontrado(s)')).toBeInTheDocument()
  })

  it('reseta busca ao limpar campo', async () => {
    const setSearchTerm = vi.fn()
    mockUseClientes.mockReturnValue({
      ...defaultMockReturn,
      searchTerm: 'João',
      setSearchTerm
    })

    const user = userEvent.setup()
    render(<ClientesView />)
    
    const searchInput = screen.getByPlaceholderText(/buscar por nome, telefone, carro ou placa/i)
    await user.clear(searchInput)
    
    expect(setSearchTerm).toHaveBeenCalledWith('')
  })

  it('exibe data formatada corretamente', () => {
    const cliente = testUtils.createMockCliente({
      id: '1',
      nome: 'João Silva',
      created_at: '2024-01-15T10:30:00Z'
    })

    mockUseClientes.mockReturnValue({
      ...defaultMockReturn,
      clientes: [cliente],
      filteredClientes: [cliente]
    })

    render(<ClientesView />)
    
    expect(screen.getByText('15/01/2024')).toBeInTheDocument()
  })

  it('suporta navegação por teclado', async () => {
    const clientes = [
      testUtils.createMockCliente({ id: '1', nome: 'João Silva' })
    ]

    mockUseClientes.mockReturnValue({
      ...defaultMockReturn,
      clientes,
      filteredClientes: clientes
    })

    const user = userEvent.setup()
    render(<ClientesView />)
    
    // Navegar por Tab
    await user.tab()
    expect(screen.getByPlaceholderText(/buscar por nome, telefone, carro ou placa/i)).toHaveFocus()
    
    await user.tab()
    expect(screen.getByRole('button', { name: /novo cliente/i })).toHaveFocus()
  })

  it('mantém acessibilidade com aria-labels', () => {
    const cliente = testUtils.createMockCliente({ id: '1', nome: 'João Silva' })

    mockUseClientes.mockReturnValue({
      ...defaultMockReturn,
      clientes: [cliente],
      filteredClientes: [cliente]
    })

    render(<ClientesView />)
    
    expect(screen.getByLabelText('Lista de clientes')).toBeInTheDocument()
    expect(screen.getByLabelText('Buscar clientes')).toBeInTheDocument()
  })
})
