// src/features/clientes/ClientesView.tsx
import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { useClientes } from './useClientes';
import { ClientesList } from './ClientesList';
import { ClienteForm } from './ClienteForm';
import { ClienteDetails } from './ClienteDetails';
import { Cliente } from '../../types';

export const ClientesView: React.FC = () => {
  const {
    clientes,
    loading,
    error,
    fetchClientes,
    createCliente,
    updateCliente,
    deleteCliente,
    searchClientes
  } = useClientes();

  const [showForm, setShowForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null);
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchClientes();
  }, []);

  const handleCreateNew = () => {
    setEditingCliente(null);
    setShowForm(true);
  };

  const handleEdit = (cliente: Cliente) => {
    setEditingCliente(cliente);
    setShowForm(true);
  };

  const handleViewDetails = (cliente: Cliente) => {
    setSelectedCliente(cliente);
    setShowDetails(true);
  };

  const handleSave = async (clienteData: Partial<Cliente>) => {
    try {
      if (editingCliente) {
        await updateCliente(editingCliente.id, clienteData);
      } else {
        await createCliente(clienteData);
      }
      setShowForm(false);
      setEditingCliente(null);
    } catch (error) {
      console.error('Erro ao salvar cliente:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este cliente?')) {
      try {
        await deleteCliente(id);
      } catch (error) {
        console.error('Erro ao excluir cliente:', error);
      }
    }
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    if (term.trim()) {
      searchClientes(term);
    } else {
      fetchClientes();
    }
  };

  if (loading && clientes.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
          <p className="text-gray-600">Gerencie seus clientes e histórico de serviços</p>
        </div>
        <Button
          variant="primary"
          onClick={handleCreateNew}
          icon="plus"
        >
          Novo Cliente
        </Button>
      </div>

      {/* Search Bar */}
      <div className="max-w-md">
        <Input
          type="text"
          placeholder="Buscar por nome, telefone, carro ou placa..."
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          icon="search"
          className="w-full"
        />
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Clientes List */}
      <ClientesList
        clientes={clientes}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onViewDetails={handleViewDetails}
      />

      {/* Modal Form */}
      <Modal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title={editingCliente ? 'Editar Cliente' : 'Novo Cliente'}
        size="medium"
      >
        <ClienteForm
          cliente={editingCliente}
          onSave={handleSave}
          onCancel={() => setShowForm(false)}
        />
      </Modal>

      {/* Modal Details */}
      <Modal
        isOpen={showDetails}
        onClose={() => setShowDetails(false)}
        title="Detalhes do Cliente"
        size="large"
      >
        {selectedCliente && (
          <ClienteDetails
            cliente={selectedCliente}
            onEdit={() => {
              setShowDetails(false);
              handleEdit(selectedCliente);
            }}
            onClose={() => setShowDetails(false)}
          />
        )}
      </Modal>
    </div>
  );
};
