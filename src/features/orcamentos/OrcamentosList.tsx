// src/features/orcamentos/OrcamentosList.tsx
import React from 'react';
import { Table } from '../../components/ui/Table';
import { Button } from '../../components/ui/Button';
import { Orcamento } from '../../types';
import { formatCurrency } from '../../utils/formatting';

interface OrcamentosListProps {
  orcamentos: Orcamento[];
  loading: boolean;
  onEdit: (orcamento: Orcamento) => void;
  onDelete: (id: string) => void;
  onViewDetails: (orcamento: Orcamento) => void;
  onStatusChange: (id: string, data: { status: string }) => Promise<void>;
}

export const OrcamentosList: React.FC<OrcamentosListProps> = ({
  orcamentos,
  loading,
  onEdit,
  onDelete,
  onViewDetails,
  onStatusChange
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

  const getNextStatus = (currentStatus: string) => {
    switch (currentStatus) {
      case 'Orçamento':
        return 'Aprovado';
      case 'Aprovado':
        return 'Finalizado';
      default:
        return null;
    }
  };

  const handleStatusChange = async (orcamento: Orcamento, newStatus: string) => {
    try {
      await onStatusChange(orcamento.id, { status: newStatus });
    } catch (error) {
      console.error('Erro ao alterar status:', error);
    }
  };

  const tableColumns = [
    {
      key: 'id',
      label: 'ID',
      sortable: true,
      render: (orcamento: Orcamento) => (
        <div className="font-mono text-sm">
          #{orcamento.id.slice(-8)}
        </div>
      )
    },
    {
      key: 'cliente',
      label: 'Cliente',
      sortable: true,
      render: (orcamento: Orcamento) => (
        <div>
          <div className="font-medium text-gray-900">
            {orcamento.clientes?.nome || 'N/A'}
          </div>
          {orcamento.clientes?.carro && (
            <div className="text-sm text-gray-500">
              {orcamento.clientes.carro}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'valor_total',
      label: 'Valor',
      sortable: true,
      render: (orcamento: Orcamento) => (
        <div className="font-medium">
          {formatCurrency(orcamento.valor_total || 0)}
          {orcamento.desconto && orcamento.desconto > 0 && (
            <div className="text-sm text-green-600">
              {orcamento.desconto}% desc.
            </div>
          )}
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (orcamento: Orcamento) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(orcamento.status)}`}>
          {orcamento.status}
        </span>
      )
    },
    {
      key: 'created_at',
      label: 'Criado em',
      sortable: true,
      render: (orcamento: Orcamento) => (
        <div className="text-sm text-gray-500">
          {new Date(orcamento.created_at).toLocaleDateString('pt-BR')}
        </div>
      )
    },
    {
      key: 'actions',
      label: 'Ações',
      render: (orcamento: Orcamento) => {
        const nextStatus = getNextStatus(orcamento.status);
        
        return (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="small"
              onClick={() => onViewDetails(orcamento)}
              icon="eye"
            >
              Detalhes
            </Button>

            {nextStatus && (
              <Button
                variant="primary"
                size="small"
                onClick={() => handleStatusChange(orcamento, nextStatus)}
              >
                {nextStatus === 'Aprovado' ? 'Aprovar' : 'Finalizar'}
              </Button>
            )}

            <Button
              variant="secondary"
              size="small"
              onClick={() => onEdit(orcamento)}
              icon="edit"
            >
              Editar
            </Button>

            {orcamento.status === 'Orçamento' && (
              <Button
                variant="error"
                size="small"
                onClick={() => onDelete(orcamento.id)}
                icon="trash"
              >
                Excluir
              </Button>
            )}
          </div>
        );
      }
    }
  ];

  if (orcamentos.length === 0 && !loading) {
    return (
      <div className="text-center py-12">
        <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
          <i className="fas fa-file-invoice text-3xl text-gray-400"></i>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Nenhum orçamento encontrado
        </h3>
        <p className="text-gray-500 mb-4">
          Comece criando seu primeiro orçamento
        </p>
        <Button variant="primary" icon="plus">
          Novo Orçamento
        </Button>
      </div>
    );
  }

  return (
    <Table
      columns={tableColumns}
      data={orcamentos}
      loading={loading}
      emptyMessage="Nenhum orçamento encontrado"
      searchable={false}
      sortable={true}
      pagination={true}
      pageSize={10}
    />
  );
};
