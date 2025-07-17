// src/tests/setup.ts
import { expect, afterEach, beforeAll, afterAll } from 'vitest'
import { cleanup } from '@testing-library/react'
import matchers from '@testing-library/jest-dom/matchers'
import { server } from './mocks/server'

// Estender matchers do Vitest com jest-dom
expect.extend(matchers)

// Configurar MSW (Mock Service Worker)
beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' })
})

afterEach(() => {
  server.resetHandlers()
  cleanup() // Limpar DOM após cada teste
})

afterAll(() => {
  server.close()
})

// Mock do localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn()
}

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

// Mock do sessionStorage
const sessionStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn()
}

Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock
})

// Mock do IntersectionObserver
const mockIntersectionObserver = vi.fn()
mockIntersectionObserver.mockReturnValue({
  observe: () => null,
  unobserve: () => null,
  disconnect: () => null
})

window.IntersectionObserver = mockIntersectionObserver

// Mock do ResizeObserver
const mockResizeObserver = vi.fn()
mockResizeObserver.mockReturnValue({
  observe: () => null,
  unobserve: () => null,
  disconnect: () => null
})

window.ResizeObserver = mockResizeObserver

// Mock do matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }))
})

// Mock do navigator.clipboard
Object.defineProperty(navigator, 'clipboard', {
  value: {
    writeText: vi.fn().mockImplementation(() => Promise.resolve()),
    readText: vi.fn().mockImplementation(() => Promise.resolve(''))
  }
})

// Mock do window.open
Object.defineProperty(window, 'open', {
  value: vi.fn().mockImplementation(() => ({
    location: { href: '' },
    close: vi.fn()
  }))
})

// Mock do URL.createObjectURL
Object.defineProperty(URL, 'createObjectURL', {
  value: vi.fn().mockImplementation(() => 'mocked-object-url')
})

Object.defineProperty(URL, 'revokeObjectURL', {
  value: vi.fn()
})

// Mock do console para testes silenciosos quando necessário
const originalConsole = { ...console }

export const mockConsole = {
  silence: () => {
    console.log = vi.fn()
    console.warn = vi.fn()
    console.error = vi.fn()
    console.info = vi.fn()
  },
  restore: () => {
    console.log = originalConsole.log
    console.warn = originalConsole.warn
    console.error = originalConsole.error
    console.info = originalConsole.info
  }
}

// Utilitários de teste personalizados
export const testUtils = {
  // Aguardar próximo tick
  waitForNextTick: () => new Promise(resolve => setTimeout(resolve, 0)),
  
  // Simular delay
  delay: (ms: number) => new Promise(resolve => setTimeout(resolve, ms)),
  
  // Criar evento customizado
  createEvent: (type: string, data?: any) => {
    const event = new CustomEvent(type, { detail: data })
    return event
  },
  
  // Mock de função async que falha
  createAsyncError: (message: string) => {
    return vi.fn().mockRejectedValue(new Error(message))
  },
  
  // Mock de função async que sucede
  createAsyncSuccess: (data: any) => {
    return vi.fn().mockResolvedValue(data)
  },
  
  // Simular mudança de data
  mockDate: (date: string | Date) => {
    const mockDate = new Date(date)
    vi.useFakeTimers()
    vi.setSystemTime(mockDate)
    return () => vi.useRealTimers()
  },
  
  // Criar dados de teste para Cliente
  createMockCliente: (overrides = {}) => ({
    id: '1',
    nome: 'João Silva',
    telefone: '(11) 99999-9999',
    carro: 'Honda Civic',
    placa: 'ABC-1234',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    ...overrides
  }),
  
  // Criar dados de teste para Orçamento
  createMockOrcamento: (overrides = {}) => ({
    id: '1',
    cliente_id: '1',
    valor_total: 150.00,
    status: 'Orçamento' as const,
    desconto: 0,
    formas_pagamento: 'PIX',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    clientes: testUtils.createMockCliente(),
    orcamento_itens: [
      {
        id: '1',
        orcamento_id: '1',
        servico_id: '1',
        descricao_servico: 'Lavagem Completa',
        valor_cobrado: 150.00,
        quantidade: 1
      }
    ],
    ...overrides
  }),
  
  // Criar dados de teste para Agendamento
  createMockAgendamento: (overrides = {}) => ({
    id: '1',
    cliente_id: '1',
    data_hora: '2024-01-15T10:00:00Z',
    servico: 'Lavagem Completa',
    status: 'agendado' as const,
    observacoes: '',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    clientes: testUtils.createMockCliente(),
    ...overrides
  }),
  
  // Criar dados de teste para Despesa
  createMockDespesa: (overrides = {}) => ({
    id: '1',
    data: '2024-01-01',
    descricao: 'Produtos de limpeza',
    valor: 50.00,
    categoria: 'Produtos',
    ...overrides
  }),
  
  // Criar configuração mock para testes
  createMockConfig: (overrides = {}) => ({
    empresa_nome: 'R.M. Estética Automotiva',
    empresa_cnpj: '18.637.639/0001-48',
    empresa_telefone: '(24) 99948-6232',
    empresa_endereco: 'Rua 40, TV - Recanto dos Pássaros',
    system_language: 'pt-BR',
    system_currency: 'BRL',
    ...overrides
  })
}

// Configurações globais para testes
export const testConfig = {
  timeout: 5000,
  retries: 2,
  mockApiDelay: 100,
  
  // URLs de API para mock
  apiUrls: {
    clientes: '/api/clientes',
    orcamentos: '/api/orcamentos',
    agendamentos: '/api/agendamentos',
    despesas: '/api/despesas',
    configuracoes: '/api/configuracoes'
  }
}

// Custom render para React Testing Library com providers
import { render, RenderOptions } from '@testing-library/react'
import { ReactElement } from 'react'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Providers wrapper para testes
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        cacheTime: 0
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

// Custom render function
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options })

export * from '@testing-library/react'
export { customRender as render }

// Matchers customizados
expect.extend({
  toBeValidDate(received) {
    const pass = received instanceof Date && !isNaN(received.getTime())
    
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid date`,
        pass: true
      }
    } else {
      return {
        message: () => `expected ${received} to be a valid date`,
        pass: false
      }
    }
  },
  
  toBeValidCurrency(received) {
    const pass = typeof received === 'number' && received >= 0 && 
                 Number.isFinite(received) && 
                 Number(received.toFixed(2)) === received
    
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid currency value`,
        pass: true
      }
    } else {
      return {
        message: () => `expected ${received} to be a valid currency value`,
        pass: false
      }
    }
  },
  
  toBeValidCNPJ(received) {
    const cleanCNPJ = String(received).replace(/\D/g, '')
    const pass = cleanCNPJ.length === 14 && !/^(\d)\1+$/.test(cleanCNPJ)
    
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid CNPJ`,
        pass: true
      }
    } else {
      return {
        message: () => `expected ${received} to be a valid CNPJ`,
        pass: false
      }
    }
  }
})

// Declarações de tipos para matchers customizados
declare global {
  namespace Vi {
    interface AsymmetricMatchersContaining {
      toBeValidDate(): any
      toBeValidCurrency(): any
      toBeValidCNPJ(): any
    }
  }
}
