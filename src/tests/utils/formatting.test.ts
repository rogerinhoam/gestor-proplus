// src/tests/utils/formatting.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { 
  formatCurrency, 
  formatDate, 
  formatDateTime, 
  formatPhone, 
  formatCNPJ, 
  formatCPF,
  formatPlaca,
  formatPercentage,
  formatFileSize,
  formatDuration,
  formatAddress,
  parsePhone,
  parseCNPJ,
  parseCPF,
  validateAndFormat
} from '../../utils/formatting'

describe('Formatting Utils', () => {
  // Mock do Intl para testes consistentes
  beforeEach(() => {
    vi.mock('Intl', () => ({
      NumberFormat: vi.fn().mockImplementation((locale, options) => ({
        format: (value: number) => {
          if (options?.style === 'currency') {
            return `R$ ${value.toFixed(2).replace('.', ',')}`
          }
          if (options?.style === 'percent') {
            return `${(value * 100).toFixed(0)}%`
          }
          return value.toLocaleString('pt-BR')
        }
      })),
      DateTimeFormat: vi.fn().mockImplementation((locale, options) => ({
        format: (date: Date) => {
          if (options?.timeStyle) {
            return date.toLocaleTimeString('pt-BR')
          }
          return date.toLocaleDateString('pt-BR')
        }
      }))
    }))
  })

  describe('formatCurrency', () => {
    it('formata valores monetários corretamente', () => {
      expect(formatCurrency(1234.56)).toBe('R$ 1.234,56')
      expect(formatCurrency(0)).toBe('R$ 0,00')
      expect(formatCurrency(1000)).toBe('R$ 1.000,00')
    })

    it('lida com valores negativos', () => {
      expect(formatCurrency(-123.45)).toBe('R$ -123,45')
    })

    it('lida com valores muito grandes', () => {
      expect(formatCurrency(1000000)).toBe('R$ 1.000.000,00')
    })

    it('lida com valores decimais pequenos', () => {
      expect(formatCurrency(0.01)).toBe('R$ 0,01')
      expect(formatCurrency(0.001)).toBe('R$ 0,00')
    })

    it('lida com valores inválidos', () => {
      expect(formatCurrency(NaN)).toBe('R$ 0,00')
      expect(formatCurrency(Infinity)).toBe('R$ 0,00')
      expect(formatCurrency(-Infinity)).toBe('R$ 0,00')
    })

    it('permite customizar moeda', () => {
      expect(formatCurrency(100, 'USD')).toBe('$100.00')
      expect(formatCurrency(100, 'EUR')).toBe('€100,00')
    })
  })

  describe('formatDate', () => {
    it('formata datas corretamente', () => {
      const date = new Date('2024-01-15T10:30:00Z')
      expect(formatDate(date)).toBe('15/01/2024')
    })

    it('formata strings de data', () => {
      expect(formatDate('2024-01-15')).toBe('15/01/2024')
      expect(formatDate('2024-12-31T23:59:59Z')).toBe('31/12/2024')
    })

    it('lida com datas inválidas', () => {
      expect(formatDate('data-invalida')).toBe('Data inválida')
      expect(formatDate('')).toBe('Data inválida')
      expect(formatDate(null as any)).toBe('Data inválida')
    })

    it('permite customizar formato', () => {
      const date = new Date('2024-01-15T10:30:00Z')
      expect(formatDate(date, 'dd/MM/yyyy')).toBe('15/01/2024')
      expect(formatDate(date, 'MM/dd/yyyy')).toBe('01/15/2024')
      expect(formatDate(date, 'yyyy-MM-dd')).toBe('2024-01-15')
    })
  })

  describe('formatDateTime', () => {
    it('formata data e hora corretamente', () => {
      const date = new Date('2024-01-15T10:30:00Z')
      expect(formatDateTime(date)).toBe('15/01/2024 10:30')
    })

    it('formata strings de data e hora', () => {
      expect(formatDateTime('2024-01-15T10:30:00Z')).toBe('15/01/2024 10:30')
    })

    it('lida com datas inválidas', () => {
      expect(formatDateTime('data-invalida')).toBe('Data inválida')
    })

    it('permite customizar formato', () => {
      const date = new Date('2024-01-15T10:30:00Z')
      expect(formatDateTime(date, 'dd/MM/yyyy HH:mm:ss')).toBe('15/01/2024 10:30:00')
    })
  })

  describe('formatPhone', () => {
    it('formata telefone celular', () => {
      expect(formatPhone('11999999999')).toBe('(11) 99999-9999')
      expect(formatPhone('21987654321')).toBe('(21) 98765-4321')
    })

    it('formata telefone fixo', () => {
      expect(formatPhone('1133334444')).toBe('(11) 3333-4444')
      expect(formatPhone('2177778888')).toBe('(21) 7777-8888')
    })

    it('formata telefone com máscara existente', () => {
      expect(formatPhone('(11) 99999-9999')).toBe('(11) 99999-9999')
      expect(formatPhone('11 99999-9999')).toBe('(11) 99999-9999')
    })

    it('lida com números incompletos', () => {
      expect(formatPhone('119999')).toBe('119999')
      expect(formatPhone('11')).toBe('11')
    })

    it('lida com valores inválidos', () => {
      expect(formatPhone('')).toBe('')
      expect(formatPhone(null as any)).toBe('')
      expect(formatPhone(undefined as any)).toBe('')
    })

    it('remove caracteres não numéricos', () => {
      expect(formatPhone('11abc99999def9999')).toBe('(11) 99999-9999')
    })
  })

  describe('formatCNPJ', () => {
    it('formata CNPJ corretamente', () => {
      expect(formatCNPJ('18637639000148')).toBe('18.637.639/0001-48')
      expect(formatCNPJ('11222333000181')).toBe('11.222.333/0001-81')
    })

    it('mantém formatação existente', () => {
      expect(formatCNPJ('18.637.639/0001-48')).toBe('18.637.639/0001-48')
    })

    it('lida com números incompletos', () => {
      expect(formatCNPJ('1863763900')).toBe('18.637.639/00')
      expect(formatCNPJ('186376')).toBe('18.637.6')
    })

    it('lida com valores inválidos', () => {
      expect(formatCNPJ('')).toBe('')
      expect(formatCNPJ(null as any)).toBe('')
    })

    it('remove caracteres não numéricos', () => {
      expect(formatCNPJ('186abc376def39000148')).toBe('18.637.639/0001-48')
    })
  })

  describe('formatCPF', () => {
    it('formata CPF corretamente', () => {
      expect(formatCPF('12345678909')).toBe('123.456.789-09')
      expect(formatCPF('98765432100')).toBe('987.654.321-00')
    })

    it('mantém formatação existente', () => {
      expect(formatCPF('123.456.789-09')).toBe('123.456.789-09')
    })

    it('lida com números incompletos', () => {
      expect(formatCPF('1234567')).toBe('123.456.7')
      expect(formatCPF('123')).toBe('123')
    })

    it('lida com valores inválidos', () => {
      expect(formatCPF('')).toBe('')
      expect(formatCPF(null as any)).toBe('')
    })
  })

  describe('formatPlaca', () => {
    it('formata placa padrão antigo', () => {
      expect(formatPlaca('ABC1234')).toBe('ABC-1234')
      expect(formatPlaca('DEF5678')).toBe('DEF-5678')
    })

    it('formata placa Mercosul', () => {
      expect(formatPlaca('ABC1D23')).toBe('ABC1D23')
      expect(formatPlaca('DEF2E45')).toBe('DEF2E45')
    })

    it('mantém formatação existente', () => {
      expect(formatPlaca('ABC-1234')).toBe('ABC-1234')
    })

    it('converte para maiúsculas', () => {
      expect(formatPlaca('abc1234')).toBe('ABC-1234')
      expect(formatPlaca('def1a23')).toBe('DEF1A23')
    })

    it('lida com valores inválidos', () => {
      expect(formatPlaca('')).toBe('')
      expect(formatPlaca('ABC')).toBe('ABC')
      expect(formatPlaca('123')).toBe('123')
    })
  })

  describe('formatPercentage', () => {
    it('formata porcentagem corretamente', () => {
      expect(formatPercentage(0.25)).toBe('25%')
      expect(formatPercentage(0.5)).toBe('50%')
      expect(formatPercentage(1)).toBe('100%')
    })

    it('formata com decimais', () => {
      expect(formatPercentage(0.255, 1)).toBe('25,5%')
      expect(formatPercentage(0.2555, 2)).toBe('25,55%')
    })

    it('lida com valores já em porcentagem', () => {
      expect(formatPercentage(25, 0, true)).toBe('25%')
      expect(formatPercentage(50.5, 1, true)).toBe('50,5%')
    })

    it('lida com valores inválidos', () => {
      expect(formatPercentage(NaN)).toBe('0%')
      expect(formatPercentage(Infinity)).toBe('0%')
    })
  })

  describe('formatFileSize', () => {
    it('formata tamanhos de arquivo', () => {
      expect(formatFileSize(1024)).toBe('1,0 KB')
      expect(formatFileSize(1024 * 1024)).toBe('1,0 MB')
      expect(formatFileSize(1024 * 1024 * 1024)).toBe('1,0 GB')
    })

    it('formata bytes', () => {
      expect(formatFileSize(500)).toBe('500 bytes')
      expect(formatFileSize(1023)).toBe('1023 bytes')
    })

    it('lida com valores zero', () => {
      expect(formatFileSize(0)).toBe('0 bytes')
    })

    it('lida com valores negativos', () => {
      expect(formatFileSize(-1024)).toBe('0 bytes')
    })

    it('permite customizar decimais', () => {
      expect(formatFileSize(1536, 2)).toBe('1,50 KB')
      expect(formatFileSize(1536, 0)).toBe('2 KB')
    })
  })

  describe('formatDuration', () => {
    it('formata duração em segundos', () => {
      expect(formatDuration(60)).toBe('1:00')
      expect(formatDuration(90)).toBe('1:30')
      expect(formatDuration(3661)).toBe('1:01:01')
    })

    it('formata duração menor que 1 minuto', () => {
      expect(formatDuration(30)).toBe('0:30')
      expect(formatDuration(5)).toBe('0:05')
    })

    it('lida com valores zero', () => {
      expect(formatDuration(0)).toBe('0:00')
    })

    it('lida com valores negativos', () => {
      expect(formatDuration(-60)).toBe('0:00')
    })

    it('permite formato customizado', () => {
      expect(formatDuration(3661, 'hh:mm:ss')).toBe('01:01:01')
      expect(formatDuration(90, 'mm:ss')).toBe('01:30')
    })
  })

  describe('formatAddress', () => {
    it('formata endereço completo', () => {
      const address = {
        street: 'Rua das Flores',
        number: '123',
        complement: 'Apt 45',
        neighborhood: 'Centro',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01234567'
      }
      
      const formatted = formatAddress(address)
      expect(formatted).toBe('Rua das Flores, 123, Apt 45 - Centro, São Paulo - SP, 01234-567')
    })

    it('formata endereço sem complemento', () => {
      const address = {
        street: 'Rua das Flores',
        number: '123',
        neighborhood: 'Centro',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01234567'
      }
      
      const formatted = formatAddress(address)
      expect(formatted).toBe('Rua das Flores, 123 - Centro, São Paulo - SP, 01234-567')
    })

    it('lida com endereço incompleto', () => {
      const address = {
        street: 'Rua das Flores',
        city: 'São Paulo',
        state: 'SP'
      }
      
      const formatted = formatAddress(address)
      expect(formatted).toBe('Rua das Flores - São Paulo - SP')
    })
  })

  describe('parsePhone', () => {
    it('extrai números do telefone', () => {
      expect(parsePhone('(11) 99999-9999')).toBe('11999999999')
      expect(parsePhone('11 99999-9999')).toBe('11999999999')
      expect(parsePhone('11.99999.9999')).toBe('11999999999')
    })

    it('lida com valores sem formatação', () => {
      expect(parsePhone('11999999999')).toBe('11999999999')
    })

    it('lida com valores inválidos', () => {
      expect(parsePhone('')).toBe('')
      expect(parsePhone(null as any)).toBe('')
    })
  })

  describe('parseCNPJ', () => {
    it('extrai números do CNPJ', () => {
      expect(parseCNPJ('18.637.639/0001-48')).toBe('18637639000148')
      expect(parseCNPJ('18 637 639 0001 48')).toBe('18637639000148')
    })

    it('lida com valores sem formatação', () => {
      expect(parseCNPJ('18637639000148')).toBe('18637639000148')
    })

    it('lida com valores inválidos', () => {
      expect(parseCNPJ('')).toBe('')
      expect(parseCNPJ(null as any)).toBe('')
    })
  })

  describe('parseCPF', () => {
    it('extrai números do CPF', () => {
      expect(parseCPF('123.456.789-09')).toBe('12345678909')
      expect(parseCPF('123 456 789 09')).toBe('12345678909')
    })

    it('lida com valores sem formatação', () => {
      expect(parseCPF('12345678909')).toBe('12345678909')
    })

    it('lida com valores inválidos', () => {
      expect(parseCPF('')).toBe('')
      expect(parseCPF(null as any)).toBe('')
    })
  })

  describe('validateAndFormat', () => {
    it('valida e formata telefone', () => {
      const result = validateAndFormat('11999999999', 'phone')
      expect(result.isValid).toBe(true)
      expect(result.formatted).toBe('(11) 99999-9999')
    })

    it('valida e formata CNPJ', () => {
      const result = validateAndFormat('18637639000148', 'cnpj')
      expect(result.isValid).toBe(true)
      expect(result.formatted).toBe('18.637.639/0001-48')
    })

    it('valida e formata CPF', () => {
      const result = validateAndFormat('12345678909', 'cpf')
      expect(result.isValid).toBe(true)
      expect(result.formatted).toBe('123.456.789-09')
    })

    it('retorna erro para valores inválidos', () => {
      const result = validateAndFormat('123', 'phone')
      expect(result.isValid).toBe(false)
      expect(result.error).toBe('Telefone inválido')
    })

    it('lida com tipos não suportados', () => {
      const result = validateAndFormat('test', 'unknown' as any)
      expect(result.isValid).toBe(false)
      expect(result.error).toBe('Tipo de validação não suportado')
    })
  })

  describe('Edge Cases', () => {
    it('lida com null e undefined', () => {
      expect(formatCurrency(null as any)).toBe('R$ 0,00')
      expect(formatDate(null as any)).toBe('Data inválida')
      expect(formatPhone(null as any)).toBe('')
      expect(formatCNPJ(null as any)).toBe('')
    })

    it('lida com strings vazias', () => {
      expect(formatCurrency('')).toBe('R$ 0,00')
      expect(formatDate('')).toBe('Data inválida')
      expect(formatPhone('')).toBe('')
      expect(formatCNPJ('')).toBe('')
    })

    it('lida com valores extremos', () => {
      expect(formatCurrency(Number.MAX_VALUE)).toBe('R$ 0,00')
      expect(formatCurrency(Number.MIN_VALUE)).toBe('R$ 0,00')
    })

    it('lida com caracteres especiais', () => {
      expect(formatPhone('11@99999#9999')).toBe('(11) 99999-9999')
      expect(formatCNPJ('18.637.639/0001-48')).toBe('18.637.639/0001-48')
    })
  })

  describe('Performance', () => {
    it('formata muitos valores eficientemente', () => {
      const values = Array.from({ length: 1000 }, (_, i) => i * 10)
      
      const start = performance.now()
      values.forEach(value => formatCurrency(value))
      const end = performance.now()
      
      expect(end - start).toBeLessThan(100) // Menos de 100ms
    })

    it('não vaza memória com muitas formatações', () => {
      // Teste básico de vazamento de memória
      const initialMemory = performance.memory?.usedJSHeapSize || 0
      
      for (let i = 0; i < 10000; i++) {
        formatCurrency(i)
        formatDate(new Date())
        formatPhone(`11999999999`)
      }
      
      const finalMemory = performance.memory?.usedJSHeapSize || 0
      const memoryIncrease = finalMemory - initialMemory
      
      // Não deve aumentar mais que 10MB
      expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024)
    })
  })

  describe('Internacionalização', () => {
    it('formata com diferentes locales', () => {
      expect(formatCurrency(1234.56, 'BRL', 'pt-BR')).toBe('R$ 1.234,56')
      expect(formatCurrency(1234.56, 'USD', 'en-US')).toBe('$1,234.56')
      expect(formatCurrency(1234.56, 'EUR', 'de-DE')).toBe('1.234,56 €')
    })

    it('formata datas com diferentes locales', () => {
      const date = new Date('2024-01-15')
      expect(formatDate(date, 'pt-BR')).toBe('15/01/2024')
      expect(formatDate(date, 'en-US')).toBe('01/15/2024')
      expect(formatDate(date, 'de-DE')).toBe('15.01.2024')
    })

    it('adapta formatação de telefone por região', () => {
      expect(formatPhone('11999999999', 'BR')).toBe('(11) 99999-9999')
      expect(formatPhone('5511999999999', 'BR')).toBe('+55 (11) 99999-9999')
      expect(formatPhone('12345678901', 'US')).toBe('(234) 567-8901')
    })
  })
})
