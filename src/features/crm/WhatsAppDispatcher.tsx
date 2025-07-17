// src/features/crm/WhatsAppDispatcher.tsx
import React, { useState } from 'react'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { useClientes } from '../clientes/useClientes'
import { Cliente } from '../../types'
import { formatTelefone } from '../../utils/formatting'

interface WhatsAppDispatcherProps {
  onSendMessage: (clienteId: string, templateType: string, customMessage?: string) => Promise<boolean>
}

export const WhatsAppDispatcher: React.FC<WhatsAppDispatcherProps> = ({
  onSendMessage
}) => {
  const { clientes } = useClientes()
  const [message, setMessage] = useState('')
  const [selectedClientes, setSelectedClientes] = useState<string[]>([])
  const [filtro, setFiltro] = useState('')
  const [sending, setSending] = useState(false)
  const [sendingProgress, setSendingProgress] = useState(0)

  const clientesFiltrados = clientes.filter(cliente => {
    if (!filtro) return true
    const termo = filtro.toLowerCase()
    return (
      cliente.nome.toLowerCase().includes(termo) ||
      cliente.telefone?.includes(termo) ||
      cliente.carro?.toLowerCase().includes(termo)
    )
  }).filter(cliente => cliente.telefone) // Apenas clientes com telefone

  const handleSelectAll = () => {
    if (selectedClientes.length === clientesFiltrados.length) {
      setSelectedClientes([])
    } else {
      setSelectedClientes(clientesFiltrados.map(c => c.id))
    }
  }

  const handleToggleCliente = (clienteId: string) => {
    setSelectedClientes(prev => 
      prev.includes(clienteId) 
        ? prev.filter(id => id !== clienteId)
        : [...prev, clienteId]
    )
  }

  const handleSendBulk = async () => {
    if (!message.trim() || selectedClientes.length === 0) {
      alert('Digite uma mensagem e selecione pelo menos um cliente')
      return
    }

    if (!window.confirm(`Enviar mensagem para ${selectedClientes.length} cliente(s)?`)) {
      return
    }

    setSending(true)
    setSendingProgress(0)

    try {
      const total = selectedClientes.length
      let enviados = 0

      for (const clienteId of selectedClientes) {
        try {
          await onSendMessage(clienteId, 'custom', message)
          enviados++
          setSendingProgress(Math.round((enviados / total) * 100))
          
          // Delay entre mensagens para evitar spam
          if (enviados < total) {
            await new Promise(resolve => setTimeout(resolve, 2000))
          }
        } catch (error) {
          console.error(`Erro ao enviar para cliente ${clienteId}:`, error)
        }
      }

      alert(`Mensagens enviadas para ${enviados} de ${total} clientes`)
      setMessage('')
      setSelectedClientes([])
      setSendingProgress(0)
    } catch (error) {
      alert('Erro no envio em lote')
    } finally {
      setSending(false)
    }
  }

  const handleWhatsAppDirect = (cliente: Cliente) => {
    if (!cliente.telefone) return
    
    const phoneNumber = cliente.telefone.replace(/\D/g, '')
    const processedMessage = message.replace(/{{nome}}/g, cliente.nome)
    const whatsappUrl = `https://wa.me/55${phoneNumber}?text=${encodeURIComponent(processedMessage)}`
    window.open(whatsappUrl, '_blank')
  }

  const getSelectedClientesInfo = () => {
    const selected = clientes.filter(c => selectedClientes.includes(c.id))
    return selected
  }

  return (
    <Card>
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Disparo em Lote</h2>
          <div className="text-sm text-gray-500">
            {selectedClientes.length} selecionado(s)
          </div>
        </div>

        {/* Mensagem */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Mensagem
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Digite sua mensagem... Use {{nome}} para personalizar"
            className="w-full px-3 py-2 border border-gray-300 rounded-md h-24 resize-none focus:outline-none focus:ring-2 focus:ring-primary"
            disabled={sending}
          />
          <div className="text-xs text-gray-500 mt-1">
            {message.length}/1000 caracteres
          </div>
        </div>

        {/* Filtro de Clientes */}
        <div className="mb-4">
          <Input
            type="text"
            placeholder="Filtrar clientes por nome, telefone ou carro..."
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            icon="search"
            disabled={sending}
          />
        </div>

        {/* Controles de Seleção */}
        <div className="flex justify-between items-center mb-3">
          <Button
            size="small"
            variant="outline"
            onClick={handleSelectAll}
            disabled={sending}
          >
            {selectedClientes.length === clientesFiltrados.length ? 'Desmarcar' : 'Marcar'} Todos
          </Button>
          <div className="text-sm text-gray-500">
            {clientesFiltrados.length} cliente(s) com telefone
          </div>
        </div>

        {/* Lista de Clientes */}
        <div className="max-h-64 overflow-y-auto border rounded-lg">
          {clientesFiltrados.map(cliente => (
            <div key={cliente.id} className="flex items-center justify-between p-3 border-b last:border-b-0 hover:bg-gray-50">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={selectedClientes.includes(cliente.id)}
                  onChange={() => handleToggleCliente(cliente.id)}
                  className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                  disabled={sending}
                />
                <div className="flex-1">
                  <div className="font-medium">{cliente.nome}</div>
                  <div className="text-sm text-gray-500">
                    {formatTelefone(cliente.telefone!)}
                    {cliente.carro && ` • ${cliente.carro}`}
                  </div>
                </div>
              </div>
              <Button
                size="small"
                variant="outline"
                onClick={() => handleWhatsAppDirect(cliente)}
                disabled={!message.trim() || sending}
              >
                <i className="fab fa-whatsapp mr-1"></i>
                Abrir
              </Button>
            </div>
          ))}

          {clientesFiltrados.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <i className="fas fa-search text-2xl mb-2"></i>
              <p>Nenhum cliente encontrado</p>
              <p className="text-sm">Verifique o filtro ou cadastre clientes com telefone</p>
            </div>
          )}
        </div>

        {/* Progresso do Envio */}
        {sending && (
          <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <i className="fas fa-spinner fa-spin text-blue-600"></i>
              <span className="text-sm font-medium text-blue-800">
                Enviando mensagens... {sendingProgress}%
              </span>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${sendingProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Visualização da Mensagem */}
        {message && selectedClientes.length > 0 && (
          <div className="mt-4 bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium mb-2">Prévia da Mensagem:</h4>
            <div className="text-sm text-gray-700 mb-3">
              {message.replace(/{{nome}}/g, getSelectedClientesInfo()[0]?.nome || '[Nome do Cliente]')}
            </div>
            <div className="text-xs text-gray-500">
              Será enviada para: {getSelectedClientesInfo().slice(0, 3).map(c => c.nome).join(', ')}
              {selectedClientes.length > 3 && ` e mais ${selectedClientes.length - 3} cliente(s)`}
            </div>
          </div>
        )}

        {/* Botão de Envio */}
        <div className="mt-4 flex gap-2">
          <Button
            variant="success"
            onClick={handleSendBulk}
            disabled={!message.trim() || selectedClientes.length === 0 || sending}
            loading={sending}
          >
            <i className="fab fa-whatsapp mr-2"></i>
            Enviar para {selectedClientes.length} cliente(s)
          </Button>
          
          {selectedClientes.length > 0 && (
            <Button
              variant="outline"
              onClick={() => setSelectedClientes([])}
              disabled={sending}
            >
              Limpar Seleção
            </Button>
          )}
        </div>

        {/* Avisos */}
        <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <h4 className="font-medium text-yellow-800 mb-1">
            <i className="fas fa-exclamation-triangle mr-2"></i>
            Importante
          </h4>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• Evite enviar muitas mensagens seguidas para não ser bloqueado</li>
            <li>• Use {{nome}} para personalizar a mensagem com o nome do cliente</li>
            <li>• Teste sempre com um cliente antes de enviar em lote</li>
            <li>• Respeite os horários comerciais (8h às 18h)</li>
          </ul>
        </div>
      </div>
    </Card>
  )
}
