// src/features/orcamentos/OrcamentosView.tsx
import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { useOrcamentos } from './useOrcamentos';
import { OrcamentosList } from './OrcamentosList';
import { OrcamentoForm } from './OrcamentoForm';
import { OrcamentoDetails } from './OrcamentoDetails';
import { Orcamento } from '../../types';

export const OrcamentosView: React.FC = () => {
  const {
    orcamentos,
    loading,
    error,
    fetchOrcamentos,
    createOrcamento,
    updateOrcamento,
    deleteOrcamento
  } = useOrcamentos();

  const [showForm, setShowForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [editingOrcamento, setEditingOrcamento] = useState<Orcamento | null>(null);
  const [selectedOrcamento, setSelectedOrcamento] = useState<Orcamento | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    fetchOrcamentos();
  }, []);

  const handleCreateNew = () => {
    setEditingOrcamento(null);
    setShowForm(true);
  };

  const handleEdit = (orcamento: Orcamento) => {
    setEditingOrcamento(orcamento);
    setShowForm(true);
  };

  const handleViewDetails = (orcamento: Orcamento) => {
    setSelectedOrcamento(orcamento);
    setShowDetails(true);
  };

  const handleSave = async (orcamentoData: Partial<Orcamento>) => {
    try {
      if (editingOrcamento) {
        await updateOrcamento(editingOrcamento.id, orcamentoData);
      } else {
        await createOrcamento(orcamentoData);
      }
      setShowForm(false);
      setEditingOrcamento(null);
    } catch (error) {
      console.error('Erro ao salvar orçamento:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este orçamento?')) {
      try {
        await deleteOrcamento(id);
      } catch (error) {
        console.error('Erro ao excluir orçamento:', error);
      }
    }
  };

  const filteredOrcamentos = statusFilter === 'all' 
    ? orcamentos
    : orcamentos.filter(orc => orc.status === statusFilter);

  if (loading && orcamentos.length === 0) {
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
          <h1 className="text-2xl font-bold text-gray-900">Orçamentos</h1>
          <p className="text-gray-600">Gerencie seus orçamentos e vendas</p>
        </div>
        <Button
          variant="primary"
          onClick={handleCreateNew}
          icon="plus"
        >
          Novo Orçamento
        </Button>
      </div>

      {/* Filtros */}
      <div className="flex gap-4 items-center">
        <div className="flex gap-2">
          <Button
            variant={statusFilter === 'all' ? 'primary' : 'outline'}
            size="small"
            onClick={() => setStatusFilter('all')}
          >
            Todos
          </Button>
          <Button
            variant={statusFilter === 'Orçamento' ? 'primary' : 'outline'}
            size="small"
            onClick={() => setStatusFilter('Orçamento')}
          >
            Orçamentos
          </Button>
          <Button
            variant={statusFilter === 'Aprovado' ? 'primary' : 'outline'}
            size="small"
            onClick={() => setStatusFilter('Aprovado')}
          >
            Aprovados
          </Button>
          <Button
            variant={statusFilter === 'Finalizado' ? 'primary' : 'outline'}
            size="small"
            onClick={() => setStatusFilter('Finalizado')}
          >
            Finalizados
          </Button>
          <Button
            variant={statusFilter === 'Cancelado' ? 'primary' : 'outline'}
            size="small"
            onClick={() => setStatusFilter('Cancelado')}
          >
            Cancelados
          </Button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Orçamentos List */}
      <OrcamentosList
        orcamentos={filteredOrcamentos}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onViewDetails={handleViewDetails}
        onStatusChange={updateOrcamento}
      />

      {/* Modal Form */}
      <Modal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title={editingOrcamento ? 'Editar Orçamento' : 'Novo Orçamento'}
        size="large"
      >
        <OrcamentoForm
          orcamento={editingOrcamento}
          onSave={handleSave}
          onCancel={() => setShowForm(false)}
        />
      </Modal>

      {/* Modal Details */}
      <Modal
        isOpen={showDetails}
        onClose={() => setShowDetails(false)}
        title="Detalhes do Orçamento"
        size="large"
      >
        {selectedOrcamento && (
          <OrcamentoDetails
            orcamento={selectedOrcamento}
            onEdit={() => {
              setShowDetails(false);
              handleEdit(selectedOrcamento);
            }}
            onStatusChange={updateOrcamento}
            onClose={() => setShowDetails(false)}
          />
        )}
      </Modal>
    </div>
  );
};
