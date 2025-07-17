// src/tests/services/validationService.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { validationService } from '../../services/validationService'
import { testUtils } from '../setup'

describe('ValidationService', () => {
  beforeEach(() => {
    // Reset service state
    validationService.registerSchema('test', {
      name: { required: true, minLength: 2 },
      email: { email: true },
      age: { min: 18, max: 100 }
    })
  })

  describe('validateField', () => {
    it('valida campo obrigatório', () => {
      const result = validationService.validateField('nome', '', { required: true })
      expect(result).toBe('nome é obrigatório')
    })

    it('valida campo obrigatório com valor válido', () => {
      const result = validationService.validateField('nome', 'João', { required: true })
      expect(result).toBeNull()
    })

    it('valida comprimento mínimo', () => {
      const result = validationService.validateField('nome', 'J', { minLength: 2 })
      expect(result).toBe('nome deve ter pelo menos 2 caracteres')
    })

    it('valida comprimento máximo', () => {
      const result = validationService.validateField('nome', 'João Silva Santos', { maxLength: 10 })
      expect(result).toBe('nome deve ter no máximo 10 caracteres')
    })

    it('valida valor mínimo', () => {
      const result = validationService.validateField('idade', 17, { min: 18 })
      expect(result).toBe('idade deve ser maior ou igual a 18')
    })

    it('valida valor máximo', () => {
      const result = validationService.validateField('idade', 101, { max: 100 })
      expect(result).toBe('idade deve ser menor ou igual a 100')
    })

    it('valida padrão regex', () => {
      const result = validationService.validateField('codigo', '123abc', { pattern: /^\d+$/ })
      expect(result).toBe('codigo tem formato inválido')
    })

    it('valida email válido', () => {
      const result = validationService.validateField('email', 'usuario@exemplo.com', { email: true })
      expect(result).toBeNull()
    })

    it('valida email inválido', () => {
      const result = validationService.validateField('email', 'email-invalido', { email: true })
      expect(result).toBe('email deve ser um e-mail válido')
    })

    it('valida telefone válido', () => {
      const result = validationService.validateField('telefone', '11999999999', { phone: true })
      expect(result).toBeNull()
    })

    it('valida telefone inválido', () => {
      const result = validationService.validateField('telefone', '123', { phone: true })
      expect(result).toBe('telefone deve ser um telefone válido')
    })

    it('valida CNPJ válido', () => {
      const result = validationService.validateField('cnpj', '11.222.333/0001-81', { cnpj: true })
      expect(result).toBeNull()
    })

    it('valida CNPJ inválido', () => {
      const result = validationService.validateField('cnpj', '123456789', { cnpj: true })
      expect(result).toBe('cnpj deve ser um CNPJ válido')
    })

    it('valida CPF válido', () => {
      const result = validationService.validateField('cpf', '123.456.789-09', { cpf: true })
      expect(result).toBeNull()
    })

    it('valida CPF inválido', () => {
      const result = validationService.validateField('cpf', '123456789', { cpf: true })
      expect(result).toBe('cpf deve ser um CPF válido')
    })

    it('valida URL válida', () => {
      const result = validationService.validateField('website', 'https://exemplo.com', { url: true })
      expect(result).toBeNull()
    })

    it('valida URL inválida', () => {
      const result = validationService.validateField('website', 'site-invalido', { url: true })
      expect(result).toBe('website deve ser uma URL válida')
    })

    it('valida data válida', () => {
      const result = validationService.validateField('data', '2024-01-15', { date: true })
      expect(result).toBeNull()
    })

    it('valida data inválida', () => {
      const result = validationService.validateField('data', 'data-invalida', { date: true })
      expect(result).toBe('data deve ser uma data válida')
    })

    it('executa validação customizada', () => {
      const customRule = {
        custom: (value: string) => value === 'admin' ? 'Nome não pode ser admin' : null
      }
      
      const result = validationService.validateField('nome', 'admin', customRule)
      expect(result).toBe('Nome não pode ser admin')
    })

    it('permite valores vazios para campos não obrigatórios', () => {
      const result = validationService.validateField('email', '', { email: true })
      expect(result).toBeNull()
    })

    it('valida com dependências', () => {
      const context = { senha: 'abc123' }
      const result = validationService.validateField('confirmarSenha', 'abc123', {
        dependencies: ['senha']
      }, context)
      expect(result).toBeNull()
    })
  })

  describe('validate', () => {
    it('valida objeto completo', () => {
      const schema = {
        nome: { required: true, minLength: 2 },
        email: { email: true },
        idade: { min: 18 }
      }
      
      const data = {
        nome: 'João',
        email: 'joao@exemplo.com',
        idade: 25
      }
      
      const result = validationService.validate(data, schema)
      
      expect(result.isValid).toBe(true)
      expect(result.errors).toEqual({})
    })

    it('retorna erros para dados inválidos', () => {
      const schema = {
        nome: { required: true, minLength: 2 },
        email: { email: true },
        idade: { min: 18 }
      }
      
      const data = {
        nome: 'J',
        email: 'email-invalido',
        idade: 17
      }
      
      const result = validationService.validate(data, schema)
      
      expect(result.isValid).toBe(false)
      expect(result.errors).toEqual({
        nome: 'nome deve ter pelo menos 2 caracteres',
        email: 'email deve ser um e-mail válido',
        idade: 'idade deve ser maior ou igual a 18'
      })
    })

    it('valida com warnings para dependências', () => {
      const schema = {
        nome: { required: true },
        sobrenome: { dependencies: ['nome'] }
      }
      
      const data = {
        nome: 'João',
        sobrenome: ''
      }
      
      const result = validationService.validate(data, schema)
      
      expect(result.isValid).toBe(true)
      expect(result.warnings).toEqual({
        sobrenome: "Campo 'nome' é recomendado quando 'sobrenome' é preenchido"
      })
    })
  })

  describe('validateWithSchema', () => {
    it('valida usando schema registrado', () => {
      const data = {
        name: 'João Silva',
        email: 'joao@exemplo.com',
        age: 25
      }
      
      const result = validationService.validateWithSchema('test', data)
      
      expect(result.isValid).toBe(true)
    })

    it('lança erro para schema não encontrado', () => {
      expect(() => {
        validationService.validateWithSchema('inexistente', {})
      }).toThrow("Schema 'inexistente' não encontrado")
    })
  })

  describe('validateValue', () => {
    it('valida valor único', () => {
      const result = validationService.validateValue('João', { required: true, minLength: 2 })
      expect(result).toBeNull()
    })

    it('retorna erro para valor inválido', () => {
      const result = validationService.validateValue('J', { required: true, minLength: 2 })
      expect(result).toBe('valor deve ter pelo menos 2 caracteres')
    })
  })

  describe('validateCliente', () => {
    it('valida cliente válido', () => {
      const cliente = testUtils.createMockCliente({
        nome: 'João Silva',
        telefone: '11999999999',
        carro: 'Honda Civic',
        placa: 'ABC1234'
      })
      
      const result = validationService.validateCliente(cliente)
      
      expect(result.isValid).toBe(true)
    })

    it('valida cliente com erros', () => {
      const cliente = {
        nome: 'J',
        telefone: '123',
        carro: 'Carro com nome muito longo que excede o limite de caracteres permitido',
        placa: 'PLACA-INVALIDA'
      }
      
      const result = validationService.validateCliente(cliente)
      
      expect(result.isValid).toBe(false)
      expect(result.errors.nome).toBeTruthy()
    })
  })

  describe('validateOrcamento', () => {
    it('valida orçamento válido', () => {
      const orcamento = testUtils.createMockOrcamento({
        cliente_id: '1',
        valor_total: 150.00,
        status: 'Orçamento',
        desconto: 10
      })
      
      const result = validationService.validateOrcamento(orcamento)
      
      expect(result.isValid).toBe(true)
    })

    it('valida orçamento com erros', () => {
      const orcamento = {
        cliente_id: '',
        valor_total: -10,
        status: 'Status Inválido',
        desconto: 150
      }
      
      const result = validationService.validateOrcamento(orcamento)
      
      expect(result.isValid).toBe(false)
      expect(result.errors.cliente_id).toBeTruthy()
      expect(result.errors.valor_total).toBeTruthy()
      expect(result.errors.status).toBeTruthy()
    })
  })

  describe('validateAgendamento', () => {
    it('valida agendamento válido', () => {
      const agendamento = testUtils.createMockAgendamento({
        cliente_id: '1',
        data_hora: '2024-12-31T10:00:00Z',
        servico: 'Lavagem Completa',
        status: 'agendado'
      })
      
      const result = validationService.validateAgendamento(agendamento)
      
      expect(result.isValid).toBe(true)
    })

    it('valida agendamento com data no passado', () => {
      const agendamento = {
        cliente_id: '1',
        data_hora: '2020-01-01T10:00:00Z',
        servico: 'Lavagem Completa',
        status: 'agendado'
      }
      
      const result = validationService.validateAgendamento(agendamento)
      
      expect(result.isValid).toBe(false)
      expect(result.errors.data_hora).toBe('Data não pode ser no passado')
    })
  })

  describe('validateDespesa', () => {
    it('valida despesa válida', () => {
      const despesa = testUtils.createMockDespesa({
        data: '2024-01-15',
        descricao: 'Produtos de limpeza',
        valor: 50.00,
        categoria: 'Produtos'
      })
      
      const result = validationService.validateDespesa(despesa)
      
      expect(result.isValid).toBe(true)
    })

    it('valida despesa com categoria inválida', () => {
      const despesa = {
        data: '2024-01-15',
        descricao: 'Produtos de limpeza',
        valor: 50.00,
        categoria: 'Categoria Inválida'
      }
      
      const result = validationService.validateDespesa(despesa)
      
      expect(result.isValid).toBe(false)
      expect(result.errors.categoria).toBe('Categoria inválida')
    })
  })

  describe('validateEmpresaConfig', () => {
    it('valida configuração de empresa válida', () => {
      const config = testUtils.createMockConfig({
        nome: 'R.M. Estética Automotiva',
        cnpj: '18.637.639/0001-48',
        telefone: '24999486232',
        endereco: 'Rua 40, TV - Recanto dos Pássaros',
        email: 'contato@rmestetica.com',
        website: 'https://rmestetica.com'
      })
      
      const result = validationService.validateEmpresaConfig(config)
      
      expect(result.isValid).toBe(true)
    })

    it('valida configuração com erros', () => {
      const config = {
        nome: 'R',
        cnpj: '123456789',
        telefone: '123',
        endereco: 'Rua',
        email: 'email-invalido',
        website: 'site-invalido'
      }
      
      const result = validationService.validateEmpresaConfig(config)
      
      expect(result.isValid).toBe(false)
      expect(Object.keys(result.errors).length).toBeGreaterThan(0)
    })
  })

  describe('validateBatch', () => {
    it('valida lote de dados', () => {
      const items = [
        { name: 'João', email: 'joao@exemplo.com' },
        { name: 'Maria', email: 'maria@exemplo.com' },
        { name: 'J', email: 'email-invalido' }
      ]
      
      const schema = {
        name: { required: true, minLength: 2 },
        email: { email: true }
      }
      
      const result = validationService.validateBatch(items, schema)
      
      expect(result.summary.total).toBe(3)
      expect(result.summary.valid).toBe(2)
      expect(result.summary.invalid).toBe(1)
      expect(result.summary.errorsByField.name).toBe(1)
      expect(result.summary.errorsByField.email).toBe(1)
    })
  })

  describe('sanitize', () => {
    it('sanitiza dados conforme schema', () => {
      const data = {
        nome: '  João Silva  ',
        idade: '25',
        descricao: 'Texto muito longo que precisa ser limitado para não exceder o máximo permitido',
        placa: 'abc1234'
      }
      
      const schema = {
        nome: { required: true },
        idade: { min: 18 },
        descricao: { maxLength: 50 },
        placa: { pattern: /^[A-Z]{3}[0-9]{4}$/ }
      }
      
      const result = validationService.sanitize(data, schema)
      
      expect(result.nome).toBe('João Silva') // Trimmed
      expect(result.idade).toBe(25) // Converted to number
      expect(result.descricao.length).toBe(50) // Truncated
      expect(result.placa).toBe('ABC1234') // Uppercase
    })
  })

  describe('Validações específicas', () => {
    it('valida CNPJ com máscara', () => {
      const cnpjs = [
        '18.637.639/0001-48',
        '18637639000148',
        '11.222.333/0001-81'
      ]
      
      cnpjs.forEach(cnpj => {
        const result = validationService.validateField('cnpj', cnpj, { cnpj: true })
        expect(result).toBeNull()
      })
    })

    it('rejeita CNPJ com dígitos repetidos', () => {
      const cnpjsInvalidos = [
        '11.111.111/1111-11',
        '22.222.222/2222-22',
        '00.000.000/0000-00'
      ]
      
      cnpjsInvalidos.forEach(cnpj => {
        const result = validationService.validateField('cnpj', cnpj, { cnpj: true })
        expect(result).toBe('cnpj deve ser um CNPJ válido')
      })
    })

    it('valida telefone com diferentes formatos', () => {
      const telefones = [
        '11999999999',
        '1199999999',
        '(11) 99999-9999',
        '(11) 9999-9999'
      ]
      
      telefones.forEach(telefone => {
        const result = validationService.validateField('telefone', telefone, { phone: true })
        expect(result).toBeNull()
      })
    })

    it('valida URLs com diferentes protocolos', () => {
      const urls = [
        'https://exemplo.com',
        'http://exemplo.com',
        'https://www.exemplo.com.br',
        'http://exemplo.com:8080/path'
      ]
      
      urls.forEach(url => {
        const result = validationService.validateField('website', url, { url: true })
        expect(result).toBeNull()
      })
    })

    it('valida datas em diferentes formatos', () => {
      const datas = [
        '2024-01-15',
        '2024-12-31T23:59:59Z',
        '2024-06-15T10:30:00-03:00'
      ]
      
      datas.forEach(data => {
        const result = validationService.validateField('data', data, { date: true })
        expect(result).toBeNull()
      })
    })
  })

  describe('Edge Cases', () => {
    it('lida com valores null e undefined', () => {
      const result1 = validationService.validateField('campo', null, { required: true })
      expect(result1).toBe('campo é obrigatório')
      
      const result2 = validationService.validateField('campo', undefined, { required: true })
      expect(result2).toBe('campo é obrigatório')
    })

    it('lida com strings vazias', () => {
      const result = validationService.validateField('campo', '', { required: true })
      expect(result).toBe('campo é obrigatório')
    })

    it('lida com arrays vazios', () => {
      const result = validationService.validateField('campo', [], { required: true })
      expect(result).toBe('campo é obrigatório')
    })

    it('lida com objetos vazios', () => {
      const result = validationService.validateField('campo', {}, { required: true })
      expect(result).toBe('campo é obrigatório')
    })

    it('lida com valores zero', () => {
      const result = validationService.validateField('campo', 0, { required: true })
      expect(result).toBeNull() // Zero é um valor válido
    })

    it('lida com strings só com espaços', () => {
      const result = validationService.validateField('campo', '   ', { required: true })
      expect(result).toBe('campo é obrigatório')
    })
  })

  describe('Performance', () => {
    it('valida muitos itens eficientemente', () => {
      const items = Array.from({ length: 1000 }, (_, i) => ({
        name: `Nome ${i}`,
        email: `usuario${i}@exemplo.com`,
        age: 20 + (i % 50)
      }))
      
      const schema = {
        name: { required: true, minLength: 2 },
        email: { email: true },
        age: { min: 18, max: 100 }
      }
      
      const start = performance.now()
      const result = validationService.validateBatch(items, schema)
      const end = performance.now()
      
      expect(result.summary.total).toBe(1000)
      expect(result.summary.valid).toBe(1000)
      expect(end - start).toBeLessThan(1000) // Menos de 1 segundo
    })
  })
})
