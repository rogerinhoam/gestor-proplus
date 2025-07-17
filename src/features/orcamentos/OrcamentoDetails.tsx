// src/features/orcamentos/OrcamentoDetails.tsx
import React from 'react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Orcamento } from '../../types';
import { formatCurrency } from '../../utils/formatting';

interface OrcamentoDetailsProps {
  orcamento: Orcamento;
  onEdit: () => void;
  onStatusChange: (id: string, data: { status: string }) => Promise<void>;
  onClose: () => void;
}

export const OrcamentoDetails: React.FC<OrcamentoDetailsProps> = ({
  orcamento,
  onEdit,
  onStatusChange,
  onClose
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Finalizado':
        return 'text-green-600 bg-green-100';
      case 'Aprovado':
        return 'text-blue-600 bg-blue-100';
      case 'Orçamento':
        return 'text-yellow-600 bg-yellow-100';
      case 'Cancelado':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    try {
      await onStatusChange(orcamento.id, { status: newStatus });
    } catch (error) {
      console.error('Erro ao alterar status:', error);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const subtotal = orcamento.orcamento_itens?.reduce((sum, item) => 
    sum + (item.valor_cobrado * item.quantidade), 0
  ) || 0;

  const desconto = (subtotal * (orcamento.desconto || 0)) / 100;
  const total = subtotal - desconto;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Orçamento #{orcamento.id.slice(-8)}
          </h2>
          <p className="text-gray-500">
            Criado em {new Date(orcamento.created_at).toLocaleDateString('pt-BR')}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(orcamento.status)}`}>
            {orcamento.status}
          </span>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handlePrint} icon="print">
              Imprimir
            </Button>
            <Button variant="secondary" onClick={onEdit} icon="edit">
              Editar
            </Button>
            <Button variant="outline" onClick={onClose}>
              Fechar
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Informações do Cliente */}
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Cliente</h3>
            <div className="space-y-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nome</label>
                <p className="text-gray-900">{orcamento.clientes?.nome || 'N/A'}</p>
              </div>
              {orcamento.clientes?.telefone && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Telefone</label>
                  <p className="text-gray-900">{orcamento.clientes.telefone}</p>
                </div>
              )}
              {orcamento.clientes?.carro && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Veículo</label>
                  <p className="text-gray-900">{orcamento.clientes.carro}</p>
                </div>
              )}
              {orcamento.clientes?.placa && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Placa</label>
                  <p className="text-gray-900 font-mono">{orcamento.clientes.placa}</p>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Informações do Orçamento */}
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Informações</h3>
            <div className="space-y-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <p className="text-gray-900">{orcamento.status}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Valor Total</label>
                <p className="text-gray-900 font-semibold text-lg">
                  {formatCurrency(orcamento.valor_total || 0)}
                </p>
              </div>
              {orcamento.desconto && orcamento.desconto > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Desconto</label>
                  <p className="text-green-600">{orcamento.desconto}%</p>
                </div>
              )}
              {orcamento.formas_pagamento && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Formas de Pagamento</label>
                  <p className="text-gray-900">{orcamento.formas_pagamento}</p>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* Itens do Orçamento */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Itens do Orçamento</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Descrição</th>
                  <th className="text-right py-2">Qtd</th>
                  <th className="text-right py-2">Valor Unit.</th>
                  <th className="text-right py-2">Total</th>
                </tr>
              </thead>
              <tbody>
                {orcamento.orcamento_itens?.map((item, index) => (
                  <tr key={index} className="border-b">
                    <td className="py-2">{item.descricao_servico}</td>
                    <td className="text-right py-2">{item.quantidade}</td>
                    <td className="text-right py-2">{formatCurrency(item.valor_cobrado)}</td>
                    <td className="text-right py-2 font-medium">
                      {formatCurrency(item.valor_cobrado * item.quantidade)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t font-medium">
                  <td colSpan={3} className="text-right py-2">Subtotal:</td>
                  <td className="text-right py-2">{formatCurrency(subtotal)}</td>
                </tr>
                {desconto > 0 && (
                  <tr className="text-green-600">
                    <td colSpan={3} className="text-right py-2">
                      Desconto ({orcamento.desconto}%):
                    </td>
                    <td className="text-right py-2">-{formatCurrency(desconto)}</td>
                  </tr>
                )}
                <tr className="border-t font-bold text-lg">
                  <td colSpan={3} className="text-right py-2">Total:</td>
                  <td className="text-right py-2">{formatCurrency(total)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </Card>

      {/* Ações de Status */}
      {orcamento.status !== 'Finalizado' && orcamento.status !== 'Cancelado' && (
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Ações</h3>
            <div className="flex gap-3">
              {orcamento.status === 'Orçamento' && (
                <Button
                  variant="primary"
                  onClick={() => handleStatusChange('Aprovado')}
                  icon="check"
                >
                  Aprovar Orçamento
                </Button>
              )}
              {orcamento.status === 'Aprovado' && (
                <Button
                  variant="success"
                  onClick={() => handleStatusChange('Finalizado')}
                  icon="check-circle"
                >
                  Finalizar Serviço
                </Button>
              )}
              <Button
                variant="error"
                onClick={() => handleStatusChange('Cancelado')}
                icon="times"
              >
                Cancelar Orçamento
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};
