// src/services/validationService.ts

export interface ValidationRule {
  required?: boolean
  minLength?: number
  maxLength?: number
  min?: number
  max?: number
  pattern?: RegExp
  email?: boolean
  phone?: boolean
  cnpj?: boolean
  cpf?: boolean
  url?: boolean
  date?: boolean
  custom?: (value: any) => string | null
  dependencies?: string[]
}

export interface ValidationSchema {
  [field: string]: ValidationRule
}

export interface ValidationResult {
  isValid: boolean
  errors: Record<string, string>
  warnings: Record<string, string>
}

export class ValidationService {
  private schemas: Map<string, ValidationSchema> = new Map()
  private customValidators: Map<string, (value: any) => string | null> = new Map()

  /**
   * Registra um schema de validação
   */
  registerSchema(name: string, schema: ValidationSchema): void {
    this.schemas.set(name, schema)
  }

  /**
   * Registra um validador customizado
   */
  registerCustomValidator(name: string, validator: (value: any) => string | null): void {
    this.customValidators.set(name, validator)
  }

  /**
   * Valida um objeto usando um schema registrado
   */
  validateWithSchema(schemaName: string, data: Record<string, any>): ValidationResult {
    const schema = this.schemas.get(schemaName)
    if (!schema) {
      throw new Error(`Schema '${schemaName}' não encontrado`)
    }

    return this.validate(data, schema)
  }

  /**
   * Valida um objeto usando um schema inline
   */
  validate(data: Record<string, any>, schema: ValidationSchema): ValidationResult {
    const errors: Record<string, string> = {}
    const warnings: Record<string, string> = {}

    for (const [field, rule] of Object.entries(schema)) {
      const value = data[field]
      const error = this.validateField(field, value, rule, data)
      
      if (error) {
        errors[field] = error
      }

      // Verificar dependências
      if (rule.dependencies) {
        for (const dep of rule.dependencies) {
          if (!data[dep] && value) {
            warnings[field] = `Campo '${dep}' é recomendado quando '${field}' é preenchido`
          }
        }
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
      warnings
    }
  }

  /**
   * Valida um campo específico
   */
  validateField(field: string, value: any, rule: ValidationRule, context?: Record<string, any>): string | null {
    // Campo obrigatório
    if (rule.required && this.isEmpty(value)) {
      return `${field} é obrigatório`
    }

    // Se valor está vazio e não é obrigatório, não validar outras regras
    if (this.isEmpty(value) && !rule.required) {
      return null
    }

    // Comprimento mínimo
    if (rule.minLength && String(value).length < rule.minLength) {
      return `${field} deve ter pelo menos ${rule.minLength} caracteres`
    }

    // Comprimento máximo
    if (rule.maxLength && String(value).length > rule.maxLength) {
      return `${field} deve ter no máximo ${rule.maxLength} caracteres`
    }

    // Valor mínimo
    if (rule.min !== undefined && Number(value) < rule.min) {
      return `${field} deve ser maior ou igual a ${rule.min}`
    }

    // Valor máximo
    if (rule.max !== undefined && Number(value) > rule.max) {
      return `${field} deve ser menor ou igual a ${rule.max}`
    }

    // Padrão regex
    if (rule.pattern && !rule.pattern.test(String(value))) {
      return `${field} tem formato inválido`
    }

    // E-mail
    if (rule.email && !this.validateEmail(value)) {
      return `${field} deve ser um e-mail válido`
    }

    // Telefone
    if (rule.phone && !this.validatePhone(value)) {
      return `${field} deve ser um telefone válido`
    }

    // CNPJ
    if (rule.cnpj && !this.validateCNPJ(value)) {
      return `${field} deve ser um CNPJ válido`
    }

    // CPF
    if (rule.cpf && !this.validateCPF(value)) {
      return `${field} deve ser um CPF válido`
    }

    // URL
    if (rule.url && !this.validateURL(value)) {
      return `${field} deve ser uma URL válida`
    }

    // Data
    if (rule.date && !this.validateDate(value)) {
      return `${field} deve ser uma data válida`
    }

    // Validador customizado
    if (rule.custom) {
      return rule.custom(value)
    }

    return null
  }

  /**
   * Valida um único valor
   */
  validateValue(value: any, rule: ValidationRule): string | null {
    return this.validateField('valor', value, rule)
  }

  /**
   * Validações específicas para o domínio
   */

  validateCliente(cliente: any): ValidationResult {
    const schema: ValidationSchema = {
      nome: {
        required: true,
        minLength: 2,
        maxLength: 100,
        pattern: /^[a-zA-ZÀ-ÿ\s]+$/
      },
      telefone: {
        phone: true
      },
      carro: {
        maxLength: 50
      },
      placa: {
        pattern: /^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$|^[A-Z]{3}-?[0-9]{4}$/
      }
    }

    return this.validate(cliente, schema)
  }

  validateOrcamento(orcamento: any): ValidationResult {
    const schema: ValidationSchema = {
      cliente_id: {
        required: true
      },
      valor_total: {
        required: true,
        min: 0.01,
        max: 999999.99
      },
      status: {
        required: true,
        custom: (value) => {
          const validStatuses = ['Orçamento', 'Aprovado', 'Finalizado', 'Cancelado']
          return validStatuses.includes(value) ? null : 'Status inválido'
        }
      },
      desconto: {
        min: 0,
        max: 100
      }
    }

    return this.validate(orcamento, schema)
  }

  validateAgendamento(agendamento: any): ValidationResult {
    const schema: ValidationSchema = {
      cliente_id: {
        required: true
      },
      data_hora: {
        required: true,
        date: true,
        custom: (value) => {
          const date = new Date(value)
          const now = new Date()
          if (date < now) {
            return 'Data não pode ser no passado'
          }
          return null
        }
      },
      servico: {
        required: true,
        minLength: 3,
        maxLength: 200
      },
      status: {
        required: true,
        custom: (value) => {
          const validStatuses = ['agendado', 'confirmado', 'realizado', 'cancelado']
          return validStatuses.includes(value) ? null : 'Status inválido'
        }
      }
    }

    return this.validate(agendamento, schema)
  }

  validateDespesa(despesa: any): ValidationResult {
    const schema: ValidationSchema = {
      data: {
        required: true,
        date: true
      },
      descricao: {
        required: true,
        minLength: 3,
        maxLength: 200
      },
      valor: {
        required: true,
        min: 0.01,
        max: 999999.99
      },
      categoria: {
        required: true,
        custom: (value) => {
          const validCategories = [
            'Produtos', 'Equipamentos', 'Aluguel', 'Energia', 'Água',
            'Internet', 'Combustível', 'Manutenção', 'Marketing', 'Outros'
          ]
          return validCategories.includes(value) ? null : 'Categoria inválida'
        }
      }
    }

    return this.validate(despesa, schema)
  }

  validateEmpresaConfig(config: any): ValidationResult {
    const schema: ValidationSchema = {
      nome: {
        required: true,
        minLength: 2,
        maxLength: 100
      },
      cnpj: {
        required: true,
        cnpj: true
      },
      telefone: {
        required: true,
        phone: true
      },
      endereco: {
        required: true,
        minLength: 10,
        maxLength: 200
      },
      email: {
        email: true
      },
      website: {
        url: true
      }
    }

    return this.validate(config, schema)
  }

  // Métodos de validação específicos
  private isEmpty(value: any): boolean {
    if (value === null || value === undefined) return true
    if (typeof value === 'string') return value.trim() === ''
    if (Array.isArray(value)) return value.length === 0
    if (typeof value === 'object') return Object.keys(value).length === 0
    return false
  }

  private validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  private validatePhone(phone: string): boolean {
    const cleanPhone = phone.replace(/\D/g, '')
    return cleanPhone.length === 10 || cleanPhone.length === 11
  }

  private validateCNPJ(cnpj: string): boolean {
    const cleanCNPJ = cnpj.replace(/\D/g, '')
    
    if (cleanCNPJ.length !== 14) return false
    
    // Verificar se todos os dígitos são iguais
    if (/^(\d)\1+$/.test(cleanCNPJ)) return false
    
    // Validar dígitos verificadores
    const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
    const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
    
    const digits = cleanCNPJ.split('').map(Number)
    
    const sum1 = digits.slice(0, 12).reduce((acc, digit, index) => acc + digit * weights1[index], 0)
    const remainder1 = sum1 % 11
    const digit1 = remainder1 < 2 ? 0 : 11 - remainder1
    
    if (digit1 !== digits[12]) return false
    
    const sum2 = digits.slice(0, 13).reduce((acc, digit, index) => acc + digit * weights2[index], 0)
    const remainder2 = sum2 % 11
    const digit2 = remainder2 < 2 ? 0 : 11 - remainder2
    
    return digit2 === digits[13]
  }

  private validateCPF(cpf: string): boolean {
    const cleanCPF = cpf.replace(/\D/g, '')
    
    if (cleanCPF.length !== 11) return false
    
    // Verificar se todos os dígitos são iguais
    if (/^(\d)\1+$/.test(cleanCPF)) return false
    
    // Validar dígitos verificadores
    const digits = cleanCPF.split('').map(Number)
    
    // Primeiro dígito
    let sum = 0
    for (let i = 0; i < 9; i++) {
      sum += digits[i] * (10 - i)
    }
    let remainder = sum % 11
    const digit1 = remainder < 2 ? 0 : 11 - remainder
    
    if (digit1 !== digits[9]) return false
    
    // Segundo dígito
    sum = 0
    for (let i = 0; i < 10; i++) {
      sum += digits[i] * (11 - i)
    }
    remainder = sum % 11
    const digit2 = remainder < 2 ? 0 : 11 - remainder
    
    return digit2 === digits[10]
  }

  private validateURL(url: string): boolean {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  private validateDate(date: string): boolean {
    const parsedDate = new Date(date)
    return !isNaN(parsedDate.getTime())
  }

  /**
   * Validação em lote
   */
  validateBatch(items: any[], schema: ValidationSchema): {
    results: ValidationResult[]
    summary: {
      total: number
      valid: number
      invalid: number
      errorsByField: Record<string, number>
    }
  } {
    const results = items.map(item => this.validate(item, schema))
    
    const summary = {
      total: items.length,
      valid: results.filter(r => r.isValid).length,
      invalid: results.filter(r => !r.isValid).length,
      errorsByField: {} as Record<string, number>
    }

    // Contar erros por campo
    results.forEach(result => {
      Object.keys(result.errors).forEach(field => {
        summary.errorsByField[field] = (summary.errorsByField[field] || 0) + 1
      })
    })

    return { results, summary }
  }

  /**
   * Sanitização de dados
   */
  sanitize(data: Record<string, any>, schema: ValidationSchema): Record<string, any> {
    const sanitized: Record<string, any> = {}

    for (const [field, value] of Object.entries(data)) {
      const rule = schema[field]
      if (!rule) continue

      let sanitizedValue = value

      // Trim strings
      if (typeof value === 'string') {
        sanitizedValue = value.trim()
      }

      // Converter para número se necessário
      if ((rule.min !== undefined || rule.max !== undefined) && typeof sanitizedValue === 'string') {
        const num = Number(sanitizedValue)
        if (!isNaN(num)) {
          sanitizedValue = num
        }
      }

      // Limitar comprimento
      if (rule.maxLength && typeof sanitizedValue === 'string') {
        sanitizedValue = sanitizedValue.substring(0, rule.maxLength)
      }

      // Converter para maiúscula (útil para placas)
      if (field === 'placa' && typeof sanitizedValue === 'string') {
        sanitizedValue = sanitizedValue.toUpperCase()
      }

      sanitized[field] = sanitizedValue
    }

    return sanitized
  }
}

export const validationService = new ValidationService()

// Registrar schemas padrão
validationService.registerSchema('cliente', {
  nome: { required: true, minLength: 2, maxLength: 100 },
  telefone: { phone: true },
  carro: { maxLength: 50 },
  placa: { pattern: /^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$|^[A-Z]{3}-?[0-9]{4}$/ }
})

validationService.registerSchema('orcamento', {
  cliente_id: { required: true },
  valor_total: { required: true, min: 0.01, max: 999999.99 },
  status: { required: true }
})

validationService.registerSchema('agendamento', {
  cliente_id: { required: true },
  data_hora: { required: true, date: true },
  servico: { required: true, minLength: 3, maxLength: 200 },
  status: { required: true }
})

// Hook para validação reativa
export const useValidation = (schema: ValidationSchema) => {
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [warnings, setWarnings] = useState<Record<string, string>>({})

  const validateField = useCallback((field: string, value: any, context?: Record<string, any>) => {
    const rule = schema[field]
    if (!rule) return

    const error = validationService.validateField(field, value, rule, context)
    
    setErrors(prev => ({
      ...prev,
      [field]: error || ''
    }))
  }, [schema])

  const validateAll = useCallback((data: Record<string, any>) => {
    const result = validationService.validate(data, schema)
    setErrors(result.errors)
    setWarnings(result.warnings)
    return result.isValid
  }, [schema])

  const clearErrors = useCallback(() => {
    setErrors({})
    setWarnings({})
  }, [])

  const hasErrors = Object.values(errors).some(error => error)

  return {
    errors,
    warnings,
    hasErrors,
    validateField,
    validateAll,
    clearErrors
  }
}
