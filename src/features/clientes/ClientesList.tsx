// src/features/clientes/ClientesList.tsx
import React from 'react';
import { Table } from '../../components/ui/Table';
import { Button } from '../../components/ui/Button';
import { ClienteCard } from './ClienteCard';
import { Cliente } from '../../types';
import { formatTelefone } from '../../utils/formatting';

interface ClientesListProps {
  clientes: Cliente[];
  loading: boolean;
  onEdit: (cliente: Cliente) => void;
  onDelete: (id: string) => void;
  onViewDetails: (cliente: Cliente) => void;
}

export const ClientesList: React.FC<ClientesListProps> = ({
  clientes,
  loading,
  onEdit,
  onDelete,
  onViewDetails
}) => {
  const tableColumns = [
    {
      key: 'nome',
      label: 'Nome',
      sortable: true,
      render: (cliente: Cliente) => (
        <div className="flex items-center">
          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-semibold mr-3">
            {cliente.nome?.charAt(0)?.toUpperCase() || '?'}
          </div>
          <div>
            <div className="font-medium text-gray-900">{cliente.nome}</div>
            {cliente.telefone && (
              <div className="text-sm text-gray-500">
                {formatTelefone(cliente.telefone)}
              </div>
            )}
          </div>
        </div>
      )
    },
    {
      key: 'veiculo',
      label: 'Veículo',
      render: (cliente: Cliente) => (
        <div>
          {cliente.carro && (
            <div className="font-medium text-gray-900">{cliente.carro}</div>
          )}
          {cliente.placa && (
            <div className="text-sm text-gray-500 font-mono">{cliente.placa}</div>
          )}
        </div>
      )
    },
    {
      key: 'created_at',
      label: 'Cadastrado em',
      sortable: true,
      render: (cliente: Cliente) => (
        <div className="text-sm text-gray-500">
          {new Date(cliente.created_at).toLocaleDateString('pt-BR')}
        </div>
      )
    },
    {
      key: 'actions',
      label: 'Ações',
      render: (cliente: Cliente) => (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="small"
            onClick={() => onViewDetails(cliente)}
            icon="eye"
          >
            Detalhes
          </Button>
          <Button
            variant="secondary"
            size="small"
            onClick={() => onEdit(cliente)}
            icon="edit"
          >
            Editar
          </Button>
          <Button
            variant="error"
            size="small"
            onClick={() => onDelete(cliente.id)}
            icon="trash"
          >
            Excluir
          </Button>
        </div>
      )
    }
  ];

  // Versão mobile com cards
  const renderMobileView = () => (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {clientes.map(cliente => (
        <ClienteCard
          key={cliente.id}
          cliente={cliente}
          onEdit={onEdit}
          onDelete={onDelete}
          onViewDetails={onViewDetails}
        />
      ))}
    </div>
  );

  const renderDesktopView = () => (
    <Table
      columns={tableColumns}
      data={clientes}
      loading={loading}
      emptyMessage="Nenhum cliente encontrado"
      searchable={false} // Busca está na view principal
      sortable={true}
      pagination={true}
      pageSize={10}
    />
  );

  if (clientes.length === 0 && !loading) {
    return (
      <div className="text-center py-12">
        <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
          <i className="fas fa-users text-3xl text-gray-400"></i>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Nenhum cliente encontrado
        </h3>
        <p className="text-gray-500 mb-4">
          Comece cadastrando seu primeiro cliente
        </p>
        <Button variant="primary" icon="plus">
          Novo Cliente
        </Button>
      </div>
    );
  }

  return (
    <div>
      {/* Mobile View */}
      <div className="block md:hidden">
        {renderMobileView()}
      </div>

      {/* Desktop View */}
      <div className="hidden md:block">
        {renderDesktopView()}
      </div>
    </div>
  );
};
