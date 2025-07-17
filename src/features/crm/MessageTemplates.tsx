// src/features/crm/MessageTemplates.tsx
import React, { useState } from 'react'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { useClientes } from '../clientes/useClientes'
import { Cliente } from '../../types'

interface MessageTemplatesProps {
  onSendMessage: (clienteId: string, templateType: string, customMessage?: string) => Promise<boolean>
}

// Templates do WhatsApp extraídos do projeto original
const whatsappTemplates = {
  inactive_friendly: {
    title: "Lembrete Amigável",
    icon: "fas fa-heart",
    color: "bg-blue-500",
    message: "Olá, {{nome}}! Tudo bem? Aqui é da R.M. Estética Automotiva. Notamos que já faz mais de {{tempo}} desde sua última visita. Só queríamos saber se está tudo certo com o seu carro e nos colocar à disposição! Precisando de algo, é só chamar. 👍"
  },
  inactive_offer: {
    title: "Oferta Especial",
    icon: "fas fa-gift",
    color: "bg-green-500", 
    message: "Olá, {{nome}}! Da R.M. Estética Automotiva. Como já se passaram mais de {{tempo}} da sua última visita, estamos com uma condição especial para você: 10% de desconto na cristalização dos vidros. Que tal dar um trato no carro? Aguardamos seu contato! ✨"
  },
  maintenance: {
    title: "Manutenção",
    icon: "fas fa-wrench",
    color: "bg-orange-500",
    message: "Olá {{nome}}, tudo joia? Aqui da R.M. Estética Automotiva. Passando para lembrar que, como já faz mais de {{tempo}} desde o último serviço, a manutenção da estética do seu carro é importante para manter o valor e a beleza dele. Quando pretende fazer a próxima? Estamos à disposição! 🚗"
  },
  general_contact: {
    title: "Contato Geral",
    icon: "fas fa-comment",
    color: "bg-purple-500",
    message: "Olá, {{nome}}! Tudo bem? Da R.M. Estética Automotiva. Estamos passando para lembrar que estamos à disposição para cuidar da estética do seu carro. Qualquer dúvida ou para agendar um serviço, é só chamar! 🚗✨"
  },
  weekly_promo: {
    title: "Promoção da Semana",
    icon: "fas fa-star",
    color: "bg-yellow-500",
    message: "Olá, {{nome}}! 📢 PROMOÇÃO DA SEMANA na R.M. Estética Automotiva! Lavagem detalhada + cera protetora por um preço imperdível. Deixe seu carro a brilhar! Vagas limitadas. Responda para agendar! 🤩"
  },
  seasonal_service: {
    title: "Serviço Sazonal",
    icon: "fas fa-cloud-rain",
    color: "bg-cyan-500",
    message: "Olá, {{nome}}! A chuva chegou e com ela a dificuldade de dirigir? A cristalização de vidros repele a água e aumenta muito a sua segurança. Garanta sua visibilidade na estrada. Fale connosco e agende seu horário! 🌧️➡️☀️"
  }
}

export const MessageTemplates: React.FC<MessageTemplatesProps> = ({
  onSendMessage
}) => {
  const { clientes } = useClientes()
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [selectedCliente, setSelectedCliente] = useState<string>('')
  const [customMessage, setCustomMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [showCustomForm, setShowCustomForm] = useState(false)

  const processTemplate = (template: string, clienteNome: string) => {
    return template
      .replace(/{{nome}}/g, clienteNome)
      .replace(/{{tempo}}/g, "30 dias") // Placeholder, pode ser calculado dinamicamente
  }

  const handleSendTemplate = async (templateKey: string) => {
    if (!selectedCliente) {
      alert('Selecione um cliente primeiro')
      return
    }

    const cliente = clientes.find(c => c.id === selectedCliente)
    if (!cliente || !cliente.telefone) {
      alert('Cliente não possui telefone cadastrado')
      return
    }

    setSending(true)
    try {
      await onSendMessage(selectedCliente, templateKey)
      alert('Mensagem enviada com sucesso!')
      setSelectedTemplate(null)
      setSelectedCliente('')
    } catch (error) {
      alert('Erro ao enviar mensagem')
    } finally {
      setSending(false)
    }
  }

  const handleSendCustom = async () => {
    if (!selectedCliente || !customMessage.trim()) {
      alert('Selecione um cliente e digite uma mensagem')
      return
    }

    const cliente = clientes.find(c => c.id === selectedCliente)
    if (!cliente || !cliente.telefone) {
      alert('Cliente não possui telefone cadastrado')
      return
    }

    setSending(true)
    try {
      await onSendMessage(selectedCliente, 'custom', customMessage)
      alert('Mensagem personalizada enviada!')
      setCustomMessage('')
      setSelectedCliente('')
      setShowCustomForm(false)
    } catch (error) {
      alert('Erro ao enviar mensagem')
    } finally {
      setSending(false)
    }
  }

  const handleWhatsAppDirect = (cliente: Cliente, message: string) => {
    if (!cliente.telefone) {
      alert('Cliente não possui telefone')
      return
    }

    const processedMessage = processTemplate(message, cliente.nome)
    const phoneNumber = cliente.telefone.replace(/\D/g, '')
    const whatsappUrl = `https://wa.me/55${phoneNumber}?text=${encodeURIComponent(processedMessage)}`
    window.open(whatsappUrl, '_blank')
  }

  return (
    <Card>
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Templates de Mensagem</h2>
          <Button
            size="small"
            variant="outline"
            onClick={() => setShowCustomForm(!showCustomForm)}
          >
            Mensagem Personalizada
          </Button>
        </div>

        {/* Seleção de Cliente */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Selecionar Cliente
          </label>
          <select
            value={selectedCliente}
            onChange={(e) => setSelectedCliente(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Escolha um cliente...</option>
            {clientes.map(cliente => (
              <option key={cliente.id} value={cliente.id}>
                {cliente.nome} {cliente.telefone && `- ${cliente.telefone}`}
              </option>
            ))}
          </select>
        </div>

        {/* Formulário de Mensagem Personalizada */}
        {showCustomForm && (
          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <h3 className="font-medium mb-3">Mensagem Personalizada</h3>
            <textarea
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              placeholder="Digite sua mensagem personalizada..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md h-24 resize-none focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <div className="flex gap-2 mt-3">
              <Button
                size="small"
                variant="primary"
                onClick={handleSendCustom}
                disabled={!selectedCliente || !customMessage.trim() || sending}
                loading={sending}
              >
                Enviar Personalizada
              </Button>
              <Button
                size="small"
                variant="secondary"
                onClick={() => setShowCustomForm(false)}
              >
                Cancelar
              </Button>
            </div>
          </div>
        )}

        {/* Templates Predefinidos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(whatsappTemplates).map(([key, template]) => {
            const cliente = clientes.find(c => c.id === selectedCliente)
            const processedMessage = cliente ? processTemplate(template.message, cliente.nome) : template.message

            return (
              <div key={key} className="border rounded-lg p-4 bg-white hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 ${template.color} rounded-full flex items-center justify-center text-white`}>
                    <i className={template.icon}></i>
                  </div>
                  <h3 className="font-medium">{template.title}</h3>
                </div>

                <div className="bg-gray-50 p-3 rounded mb-3 text-sm">
                  {processedMessage}
                </div>

                <div className="flex gap-2">
                  {selectedCliente && cliente ? (
                    <>
                      <Button
                        size="small"
                        variant="success"
                        onClick={() => handleSendTemplate(key)}
                        disabled={sending}
                        loading={sending}
                      >
                        <i className="fab fa-whatsapp mr-1"></i>
                        Enviar
                      </Button>
                      <Button
                        size="small"
                        variant="outline"
                        onClick={() => handleWhatsAppDirect(cliente, template.message)}
                      >
                        <i className="fas fa-external-link-alt mr-1"></i>
                        Abrir
                      </Button>
                    </>
                  ) : (
                    <Button
                      size="small"
                      variant="outline"
                      disabled
                    >
                      Selecione um cliente
                    </Button>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Dicas de Uso */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-medium text-blue-800 mb-2">
            <i className="fas fa-lightbulb mr-2"></i>
            Dicas de Uso
          </h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Use "Lembrete Amigável" para clientes inativos há 15-30 dias</li>
            <li>• "Oferta Especial" é ideal para clientes inativos há mais de 30 dias</li>
            <li>• "Promoção da Semana" funciona bem para campanhas sazonais</li>
            <li>• Sempre personalize a mensagem com o nome do cliente</li>
            <li>• Evite enviar muitas mensagens para o mesmo cliente</li>
          </ul>
        </div>
      </div>
    </Card>
  )
}
