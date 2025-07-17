// src/features/configuracoes/EmpresaConfig.tsx
import React, { useState, useEffect } from 'react'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { ConfiguracaoSistema } from '../../types'

interface EmpresaConfigProps {
  configuracoes: ConfiguracaoSistema[]
  onUpdate: (chave: string, valor: string) => Promise<void>
  onHasChanges: (hasChanges: boolean) => void
}

export const EmpresaConfig: React.FC<EmpresaConfigProps> = ({
  configuracoes,
  onUpdate,
  onHasChanges
}) => {
  const [form, setForm] = useState({
    nome: '',
    cnpj: '',
    telefone: '',
    endereco: '',
    email: '',
    website: '',
    logo: ''
  })

  const [originalForm, setOriginalForm] = useState(form)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    const getConfig = (chave: string) => {
      const config = configuracoes.find(c => c.chave === chave)
      return config?.valor || ''
    }

    const newForm = {
      nome: getConfig('empresa_nome') || 'R.M. Estética Automotiva',
      cnpj: getConfig('empresa_cnpj') || '18.637.639/0001-48',
      telefone: getConfig('empresa_telefone') || '(24) 99948-6232',
      endereco: getConfig('empresa_endereco') || 'Rua 40, TV - Recanto dos Pássaros, Pq. Mambucaba, Angra dos Reis - RJ',
      email: getConfig('empresa_email') || '',
      website: getConfig('empresa_website') || '',
      logo: getConfig('empresa_logo') || ''
    }

    setForm(newForm)
    setOriginalForm(newForm)
  }, [configuracoes])

  useEffect(() => {
    const hasChanges = JSON.stringify(form) !== JSON.stringify(originalForm)
    onHasChanges(hasChanges)
  }, [form, originalForm, onHasChanges])

  const validateCNPJ = (cnpj: string): boolean => {
    const cleanCNPJ = cnpj.replace(/\D/g, '')
    if (cleanCNPJ.length !== 14) return false
    
    // Validação básica de CNPJ
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

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validateWebsite = (website: string): boolean => {
    if (!website) return true // Website é opcional
    const websiteRegex = /^https?:\/\/.+\..+/
    return websiteRegex.test(website)
  }

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}

    if (!form.nome.trim()) {
      errors.nome = 'Nome da empresa é obrigatório'
    }

    if (!form.cnpj.trim()) {
      errors.cnpj = 'CNPJ é obrigatório'
    } else if (!validateCNPJ(form.cnpj)) {
      errors.cnpj = 'CNPJ inválido'
    }

    if (!form.telefone.trim()) {
      errors.telefone = 'Telefone é obrigatório'
    }

    if (!form.endereco.trim()) {
      errors.endereco = 'Endereço é obrigatório'
    }

    if (form.email && !validateEmail(form.email)) {
      errors.email = 'E-mail inválido'
    }

    if (form.website && !validateWebsite(form.website)) {
      errors.website = 'Website deve começar com http:// ou https://'
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }))
    
    // Limpar erro quando o usuário começar a digitar
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleSave = async () => {
    if (!validateForm()) return

    try {
      await Promise.all([
        onUpdate('empresa_nome', form.nome),
        onUpdate('empresa_cnpj', form.cnpj),
        onUpdate('empresa_telefone', form.telefone),
        onUpdate('empresa_endereco', form.endereco),
        onUpdate('empresa_email', form.email),
        onUpdate('empresa_website', form.website),
        onUpdate('empresa_logo', form.logo)
      ])

      setOriginalForm(form)
      alert('Configurações da empresa salvas com sucesso!')
    } catch (error) {
      alert('Erro ao salvar configurações da empresa')
    }
  }

  const handleReset = () => {
    setForm(originalForm)
    setValidationErrors({})
  }

  const formatCNPJ = (cnpj: string) => {
    const numbers = cnpj.replace(/\D/g, '')
    return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
  }

  const formatTelefone = (telefone: string) => {
    const numbers = telefone.replace(/\D/g, '')
    if (numbers.length === 11) {
      return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
    }
    return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
  }

  return (
    <div className="space-y-6">
      <Card>
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">Dados da Empresa</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Input
                label="Nome da Empresa"
                type="text"
                value={form.nome}
                onChange={(e) => handleChange('nome', e.target.value)}
                error={validationErrors.nome}
                placeholder="Nome da sua empresa"
                required
              />
            </div>

            <Input
              label="CNPJ"
              type="text"
              value={form.cnpj}
              onChange={(e) => handleChange('cnpj', formatCNPJ(e.target.value))}
              error={validationErrors.cnpj}
              placeholder="00.000.000/0000-00"
              maxLength={18}
              required
            />

            <Input
              label="Telefone"
              type="tel"
              value={form.telefone}
              onChange={(e) => handleChange('telefone', formatTelefone(e.target.value))}
              error={validationErrors.telefone}
              placeholder="(11) 99999-9999"
              maxLength={15}
              required
            />

            <div className="md:col-span-2">
              <Input
                label="Endereço Completo"
                type="text"
                value={form.endereco}
                onChange={(e) => handleChange('endereco', e.target.value)}
                error={validationErrors.endereco}
                placeholder="Rua, número, bairro, cidade - UF"
                required
              />
            </div>

            <Input
              label="E-mail"
              type="email"
              value={form.email}
              onChange={(e) => handleChange('email', e.target.value)}
              error={validationErrors.email}
              placeholder="contato@empresa.com"
            />

            <Input
              label="Website"
              type="url"
              value={form.website}
              onChange={(e) => handleChange('website', e.target.value)}
              error={validationErrors.website}
              placeholder="https://www.empresa.com"
            />

            <div className="md:col-span-2">
              <Input
                label="Logo da Empresa (URL)"
                type="url"
                value={form.logo}
                onChange={(e) => handleChange('logo', e.target.value)}
                placeholder="https://exemplo.com/logo.png"
              />
              <p className="text-xs text-gray-500 mt-1">
                URL da imagem do logo que será exibida nos PDFs e documentos
              </p>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <Button
              variant="primary"
              onClick={handleSave}
              disabled={JSON.stringify(form) === JSON.stringify(originalForm)}
            >
              Salvar Configurações
            </Button>
            <Button
              variant="secondary"
              onClick={handleReset}
              disabled={JSON.stringify(form) === JSON.stringify(originalForm)}
            >
              Cancelar
            </Button>
          </div>
        </div>
      </Card>

      {/* Preview */}
      <Card>
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">Preview</h2>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-start gap-4">
              {form.logo && (
                <img 
                  src={form.logo} 
                  alt="Logo" 
                  className="w-16 h-16 object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                  }}
                />
              )}
              <div>
                <h3 className="font-bold text-lg">{form.nome}</h3>
                <p className="text-sm text-gray-600">CNPJ: {form.cnpj}</p>
                <p className="text-sm text-gray-600">Tel: {form.telefone}</p>
                <p className="text-sm text-gray-600">{form.endereco}</p>
                {form.email && <p className="text-sm text-gray-600">E-mail: {form.email}</p>}
                {form.website && <p className="text-sm text-gray-600">Site: {form.website}</p>}
              </div>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Esta é uma prévia de como as informações da empresa aparecerão nos documentos
          </p>
        </div>
      </Card>

      {/* Informações Adicionais */}
      <Card>
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">Informações Importantes</h2>
          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex items-start gap-2">
              <i className="fas fa-info-circle text-blue-500 mt-0.5"></i>
              <p>Estas informações serão utilizadas nos PDFs de orçamentos e recibos</p>
            </div>
            <div className="flex items-start gap-2">
              <i className="fas fa-shield-alt text-green-500 mt-0.5"></i>
              <p>Todos os dados são armazenados de forma segura e não são compartilhados</p>
            </div>
            <div className="flex items-start gap-2">
              <i className="fas fa-sync text-purple-500 mt-0.5"></i>
              <p>As alterações são aplicadas imediatamente após salvar</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
