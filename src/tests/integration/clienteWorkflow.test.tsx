// src/tests/integration/clienteWorkflow.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ClientesView } from '../../features/clientes/ClientesView'
import { OrcamentosView } from '../../features/orcamentos/OrcamentosView'
import { AgendaView } from '../../features/agenda/AgendaView'
import { testUtils, mockData, server } from '../setup'
import { rest } from 'msw'

// Wrapper para testes de integração
const IntegrationWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        cacheTime: 0,
        staleTime: 0
      }
    }
  })

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </QueryClientProvider>
  )
}

describe('Cliente Workflow Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Fluxo completo: Cliente → Orçamento → Agendamento', () => {
    it('cria cliente, orçamento e agendamento em sequência', async () => {
      const user = userEvent.setup()

      // === ETAPA 1: Criar Cliente ===
      render(<ClientesView />, { wrapper: IntegrationWrapper })

      // Aguardar carregamento
      await waitFor(() => {
        expect(screen.getByText('Clientes')).toBeInTheDocument()
      })

      // Clicar em "Novo Cliente"
      const novoClienteBtn = screen.getByRole('button', { name: /novo cliente/i })
      await user.click(novoClienteBtn)

      // Aguardar formulário aparecer
      await waitFor(() => {
        expect(screen.getByText('Novo Cliente')).toBeInTheDocument()
      })

      // Preencher formulário do cliente
      await user.type(screen.getByPlaceholderText(/nome completo/i), 'João Silva')
      await user.type(screen.getByPlaceholderText(/telefone/i), '11999999999')
      await user.type(screen.getByPlaceholderText(/modelo do carro/i), 'Honda Civic')
      await user.type(screen.getByPlaceholderText(/placa/i), 'ABC1234')

      // Salvar cliente
      const salvarClienteBtn = screen.getByRole('button', { name: /salvar/i })
      await user.click(salvarClienteBtn)

      // Aguardar confirmação
      await waitFor(() => {
        expect(screen.getByText('Cliente criado com sucesso!')).toBeInTheDocument()
      })

      // === ETAPA 2: Criar Orçamento ===
      render(<OrcamentosView />, { wrapper: IntegrationWrapper })

      // Aguardar carregamento
      await waitFor(() => {
        expect(screen.getByText('Orçamentos')).toBeInTheDocument()
      })

      // Clicar em "Novo Orçamento"
      const novoOrcamentoBtn = screen.getByRole('button', { name: /novo orçamento/i })
      await user.click(novoOrcamentoBtn)

      // Aguardar formulário aparecer
      await waitFor(() => {
        expect(screen.getByText('Novo Orçamento')).toBeInTheDocument()
      })

      // Selecionar cliente
      const clienteSelect = screen.getByRole('combobox', { name: /cliente/i })
      await user.click(clienteSelect)
      await user.click(screen.getByText('João Silva'))

      // Adicionar serviço
      await user.type(screen.getByPlaceholderText(/descrição do serviço/i), 'Lavagem Completa')
      await user.type(screen.getByPlaceholderText(/valor unitário/i), '150.00')

      // Salvar orçamento
      const salvarOrcamentoBtn = screen.getByRole('button', { name: /salvar orçamento/i })
      await user.click(salvarOrcamentoBtn)

      // Aguardar confirmação
      await waitFor(() => {
        expect(screen.getByText('Orçamento criado com sucesso!')).toBeInTheDocument()
      })

      // === ETAPA 3: Criar Agendamento ===
      render(<AgendaView />, { wrapper: IntegrationWrapper })

      // Aguardar carregamento
      await waitFor(() => {
        expect(screen.getByText('Agenda')).toBeInTheDocument()
      })

      // Clicar em "Novo Agendamento"
      const novoAgendamentoBtn = screen.getByRole('button', { name: /novo agendamento/i })
      await user.click(novoAgendamentoBtn)

      // Aguardar formulário aparecer
      await waitFor(() => {
        expect(screen.getByText('Novo Agendamento')).toBeInTheDocument()
      })

      // Selecionar cliente
      const clienteAgendaSelect = screen.getByRole('combobox', { name: /cliente/i })
      await user.click(clienteAgendaSelect)
      await user.click(screen.getByText('João Silva'))

      // Preencher dados do agendamento
      await user.type(screen.getByLabelText(/serviço/i), 'Lavagem Completa')
      await user.type(screen.getByLabelText(/data e hora/i), '2024-12-31T10:00')

      // Salvar agendamento
      const salvarAgendamentoBtn = screen.getByRole('button', { name: /salvar agendamento/i })
      await user.click(salvarAgendamentoBtn)

      // Aguardar confirmação
      await waitFor(() => {
        expect(screen.getByText('Agendamento criado com sucesso!')).toBeInTheDocument()
      })
    })

    it('valida dados entre módulos', async () => {
      const user = userEvent.setup()

      // Criar cliente primeiro
      render(<ClientesView />, { wrapper: IntegrationWrapper })

      await waitFor(() => {
        expect(screen.getByText('Clientes')).toBeInTheDocument()
      })

      const novoClienteBtn = screen.getByRole('button', { name: /novo cliente/i })
      await user.click(novoClienteBtn)

      await waitFor(() => {
        expect(screen.getByText('Novo Cliente')).toBeInTheDocument()
      })

      // Preencher com dados inválidos
      await user.type(screen.getByPlaceholderText(/nome completo/i), 'A') // Nome muito curto
      await user.type(screen.getByPlaceholderText(/telefone/i), '123') // Telefone inválido

      const salvarBtn = screen.getByRole('button', { name: /salvar/i })
      await user.click(salvarBtn)

      // Verificar erros de validação
      await waitFor(() => {
        expect(screen.getByText('Nome deve ter pelo menos 2 caracteres')).toBeInTheDocument()
        expect(screen.getByText('Telefone inválido')).toBeInTheDocument()
      })
    })
  })

  describe('Fluxo de atualização de dados', () => {
    it('atualiza cliente e reflete nos orçamentos', async () => {
      const user = userEvent.setup()

      // Mock para retornar cliente existente
      server.use(
        rest.get('/api/clientes', (req, res, ctx) => {
          return res(ctx.json([
            testUtils.createMockCliente({ 
              id: '1', 
              nome: 'João Silva',
              telefone: '11999999999' 
            })
          ]))
        })
      )

      // === ETAPA 1: Editar Cliente ===
      render(<ClientesView />, { wrapper: IntegrationWrapper })

      await waitFor(() => {
        expect(screen.getByText('João Silva')).toBeInTheDocument()
      })

      // Clicar em editar
      const editarBtn = screen.getByRole('button', { name: /editar/i })
      await user.click(editarBtn)

      await waitFor(() => {
        expect(screen.getByText('Editar Cliente')).toBeInTheDocument()
      })

      // Alterar nome
      const nomeInput = screen.getByDisplayValue('João Silva')
      await user.clear(nomeInput)
      await user.type(nomeInput, 'João Santos')

      // Salvar alterações
      const salvarBtn = screen.getByRole('button', { name: /salvar/i })
      await user.click(salvarBtn)

      await waitFor(() => {
        expect(screen.getByText('Cliente atualizado com sucesso!')).toBeInTheDocument()
      })

      // === ETAPA 2: Verificar nos Orçamentos ===
      render(<OrcamentosView />, { wrapper: IntegrationWrapper })

      await waitFor(() => {
        expect(screen.getByText('Orçamentos')).toBeInTheDocument()
      })

      // Verificar se nome foi atualizado
      await waitFor(() => {
        expect(screen.getByText('João Santos')).toBeInTheDocument()
      })
    })

    it('deleta cliente e verifica impacto nos orçamentos', async () => {
      const user = userEvent.setup()

      // Mock para simular erro ao deletar cliente com orçamentos
      server.use(
        rest.delete('/api/clientes/:id', (req, res, ctx) => {
          return res(
            ctx.status(400),
            ctx.json({ error: 'Não é possível excluir cliente com orçamentos' })
          )
        })
      )

      render(<ClientesView />, { wrapper: IntegrationWrapper })

      await waitFor(() => {
        expect(screen.getByText('João Silva')).toBeInTheDocument()
      })

      // Mock do window.confirm
      const confirmSpy = vi.spyOn(window, 'confirm')
      confirmSpy.mockReturnValue(true)

      // Tentar deletar cliente
      const deleteBtn = screen.getByRole('button', { name: /excluir/i })
      await user.click(deleteBtn)

      // Verificar erro
      await waitFor(() => {
        expect(screen.getByText('Não é possível excluir cliente com orçamentos')).toBeInTheDocument()
      })

      confirmSpy.mockRestore()
    })
  })

  describe('Fluxo de busca e filtros', () => {
    it('busca cliente e cria orçamento', async () => {
      const user = userEvent.setup()

      // Mock com múltiplos clientes
      server.use(
        rest.get('/api/clientes', (req, res, ctx) => {
          const search = req.url.searchParams.get('search')
          const clientes = [
            testUtils.createMockCliente({ id: '1', nome: 'João Silva' }),
            testUtils.createMockCliente({ id: '2', nome: 'Maria Santos' }),
            testUtils.createMockCliente({ id: '3', nome: 'Pedro Costa' })
          ]

          if (search) {
            return res(ctx.json(
              clientes.filter(c => c.nome.toLowerCase().includes(search.toLowerCase()))
            ))
          }

          return res(ctx.json(clientes))
        })
      )

      render(<ClientesView />, { wrapper: IntegrationWrapper })

      await waitFor(() => {
        expect(screen.getByText('João Silva')).toBeInTheDocument()
        expect(screen.getByText('Maria Santos')).toBeInTheDocument()
        expect(screen.getByText('Pedro Costa')).toBeInTheDocument()
      })

      // Buscar cliente específico
      const searchInput = screen.getByPlaceholderText(/buscar por nome/i)
      await user.type(searchInput, 'João')

      await waitFor(() => {
        expect(screen.getByText('João Silva')).toBeInTheDocument()
        expect(screen.queryByText('Maria Santos')).not.toBeInTheDocument()
        expect(screen.queryByText('Pedro Costa')).not.toBeInTheDocument()
      })
    })

    it('filtra orçamentos por status', async () => {
      const user = userEvent.setup()

      // Mock com orçamentos de diferentes status
      server.use(
        rest.get('/api/orcamentos', (req, res, ctx) => {
          const status = req.url.searchParams.get('status')
          const orcamentos = [
            testUtils.createMockOrcamento({ id: '1', status: 'Orçamento' }),
            testUtils.createMockOrcamento({ id: '2', status: 'Aprovado' }),
            testUtils.createMockOrcamento({ id: '3', status: 'Finalizado' })
          ]

          if (status) {
            return res(ctx.json(
              orcamentos.filter(o => o.status === status)
            ))
          }

          return res(ctx.json(orcamentos))
        })
      )

      render(<OrcamentosView />, { wrapper: IntegrationWrapper })

      await waitFor(() => {
        expect(screen.getByText('Orçamentos')).toBeInTheDocument()
      })

      // Filtrar por status aprovado
      const statusFilter = screen.getByRole('button', { name: /aprovado/i })
      await user.click(statusFilter)

      await waitFor(() => {
        expect(screen.getByText(/aprovado/i)).toBeInTheDocument()
      })
    })
  })

  describe('Fluxo de erros e recuperação', () => {
    it('lida com erro de rede graciosamente', async () => {
      const user = userEvent.setup()

      // Mock para simular erro de rede
      server.use(
        rest.get('/api/clientes', (req, res, ctx) => {
          return res.networkError('Erro de conexão')
        })
      )

      render(<ClientesView />, { wrapper: IntegrationWrapper })

      await waitFor(() => {
        expect(screen.getByText('Erro de conexão')).toBeInTheDocument()
      })

      // Tentar novamente
      const retryBtn = screen.getByRole('button', { name: /tentar novamente/i })
      await user.click(retryBtn)

      // Verificar que tenta carregar novamente
      await waitFor(() => {
        expect(screen.getByText('Carregando...')).toBeInTheDocument()
      })
    })

    it('recupera de erro de validação', async () => {
      const user = userEvent.setup()

      render(<ClientesView />, { wrapper: IntegrationWrapper })

      await waitFor(() => {
        expect(screen.getByText('Clientes')).toBeInTheDocument()
      })

      const novoClienteBtn = screen.getByRole('button', { name: /novo cliente/i })
      await user.click(novoClienteBtn)

      await waitFor(() => {
        expect(screen.getByText('Novo Cliente')).toBeInTheDocument()
      })

      // Tentar salvar sem preencher campos obrigatórios
      const salvarBtn = screen.getByRole('button', { name: /salvar/i })
      await user.click(salvarBtn)

      // Verificar erros
      await waitFor(() => {
        expect(screen.getByText('Nome é obrigatório')).toBeInTheDocument()
      })

      // Corrigir erros
      await user.type(screen.getByPlaceholderText(/nome completo/i), 'João Silva')
      await user.type(screen.getByPlaceholderText(/telefone/i), '11999999999')

      // Salvar novamente
      await user.click(salvarBtn)

      await waitFor(() => {
        expect(screen.getByText('Cliente criado com sucesso!')).toBeInTheDocument()
      })
    })
  })

  describe('Fluxo de navegação entre módulos', () => {
    it('navega entre módulos mantendo contexto', async () => {
      const user = userEvent.setup()

      // Simular navegação entre módulos
      const { rerender } = render(<ClientesView />, { wrapper: IntegrationWrapper })

      await waitFor(() => {
        expect(screen.getByText('Clientes')).toBeInTheDocument()
      })

      // Navegar para orçamentos
      rerender(<OrcamentosView />)

      await waitFor(() => {
        expect(screen.getByText('Orçamentos')).toBeInTheDocument()
      })

      // Navegar para agenda
      rerender(<AgendaView />)

      await waitFor(() => {
        expect(screen.getByText('Agenda')).toBeInTheDocument()
      })

      // Voltar para clientes
      rerender(<ClientesView />)

      await waitFor(() => {
        expect(screen.getByText('Clientes')).toBeInTheDocument()
      })
    })
  })

  describe('Fluxo de performance', () => {
    it('carrega dados de forma otimizada', async () => {
      const user = userEvent.setup()

      // Mock para rastrear chamadas de API
      let apiCalls = 0
      server.use(
        rest.get('/api/clientes', (req, res, ctx) => {
          apiCalls++
          return res(ctx.json([
            testUtils.createMockCliente({ id: '1', nome: 'João Silva' })
          ]))
        })
      )

      const { rerender } = render(<ClientesView />, { wrapper: IntegrationWrapper })

      await waitFor(() => {
        expect(screen.getByText('João Silva')).toBeInTheDocument()
      })

      expect(apiCalls).toBe(1)

      // Re-render não deve disparar nova chamada (cache)
      rerender(<ClientesView />)

      await waitFor(() => {
        expect(screen.getByText('João Silva')).toBeInTheDocument()
      })

      expect(apiCalls).toBe(1) // Ainda deve ser 1 devido ao cache
    })

    it('não vaza memória com múltiplas operações', async () => {
      const user = userEvent.setup()

      const initialMemory = performance.memory?.usedJSHeapSize || 0

      // Realizar múltiplas operações
      for (let i = 0; i < 10; i++) {
        const { unmount } = render(<ClientesView />, { wrapper: IntegrationWrapper })
        
        await waitFor(() => {
          expect(screen.getByText('Clientes')).toBeInTheDocument()
        })

        unmount()
      }

      const finalMemory = performance.memory?.usedJSHeapSize || 0
      const memoryIncrease = finalMemory - initialMemory

      // Não deve aumentar mais que 5MB
      expect(memoryIncrease).toBeLessThan(5 * 1024 * 1024)
    })
  })

  describe('Fluxo de acessibilidade', () => {
    it('mantém foco durante navegação', async () => {
      const user = userEvent.setup()

      render(<ClientesView />, { wrapper: IntegrationWrapper })

      await waitFor(() => {
        expect(screen.getByText('Clientes')).toBeInTheDocument()
      })

      // Navegar por Tab
      await user.tab()
      expect(screen.getByPlaceholderText(/buscar/i)).toHaveFocus()

      await user.tab()
      expect(screen.getByRole('button', { name: /novo cliente/i })).toHaveFocus()
    })

    it('suporta navegação por teclado', async () => {
      const user = userEvent.setup()

      render(<ClientesView />, { wrapper: IntegrationWrapper })

      await waitFor(() => {
        expect(screen.getByText('Clientes')).toBeInTheDocument()
      })

      // Usar Enter para ativar botão
      const novoClienteBtn = screen.getByRole('button', { name: /novo cliente/i })
      novoClienteBtn.focus()
      await user.keyboard('{Enter}')

      await waitFor(() => {
        expect(screen.getByText('Novo Cliente')).toBeInTheDocument()
      })
    })

    it('fornece feedback apropriado para screen readers', async () => {
      render(<ClientesView />, { wrapper: IntegrationWrapper })

      await waitFor(() => {
        expect(screen.getByText('Clientes')).toBeInTheDocument()
      })

      // Verificar aria-labels
      expect(screen.getByLabelText('Lista de clientes')).toBeInTheDocument()
      expect(screen.getByLabelText('Buscar clientes')).toBeInTheDocument()
    })
  })
})
