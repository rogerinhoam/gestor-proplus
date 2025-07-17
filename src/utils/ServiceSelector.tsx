// src/features/orcamentos/ServiceSelector.tsx
import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { OrcamentoItem, Servico } from '../../types';
import { formatCurrency } from '../../utils/formatting';
import { supabase } from '../../services/supabaseClient';

interface ServiceSelectorProps {
  onAddItem: (item: OrcamentoItem) => void;
  existingItems: OrcamentoItem[];
}

export const ServiceSelector: React.FC<ServiceSelectorProps> = ({
  onAddItem,
  existingItems
}) => {
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [newItem, setNewItem] = useState({
    servico_id: '',
    descricao_servico: '',
    valor_cobrado: 0,
    quantidade: 1
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchServicos();
  }, []);

  const fetchServicos = async () => {
    try {
      const { data, error } = await supabase
        .from('servicos')
        .select('*')
        .order('descricao');

      if (error) throw error;
      setServicos(data || []);
    } catch (error) {
      console.error('Erro ao buscar serviços:', error);
    }
  };

  const handleServiceSelect = (servico: Servico) => {
    setNewItem(prev => ({
      ...prev,
      servico_id: servico.id,
      descricao_servico: servico.descricao,
      valor_cobrado: servico.valor
    }));
  };

  const handleAddItem = () => {
    if (!newItem.descricao_servico || newItem.valor_cobrado <= 0) {
      return;
    }

    const item: OrcamentoItem = {
      id: Date.now().toString(),
      orcamento_id: '', // Será definido ao salvar
      servico_id: newItem.servico_id || null,
      descricao_servico: newItem.descricao_servico,
      valor_cobrado: newItem.valor_cobrado,
      quantidade: newItem.quantidade
    };

    onAddItem(item);
    setNewItem({
      servico_id: '',
      descricao_servico: '',
      valor_cobrado: 0,
      quantidade: 1
    });
    setShowModal(false);
  };

  const handleCustomService = () => {
    setNewItem(prev => ({
      ...prev,
      servico_id: '',
      descricao_servico: '',
      valor_cobrado: 0
    }));
  };

  return (
    <div>
      <Button
        type="button"
        variant="outline"
        onClick={() => setShowModal(true)}
        icon="plus"
      >
        Adicionar Serviço
      </Button>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Adicionar Serviço"
        size="medium"
      >
        <div className="space-y-4">
          {/* Serviços Cadastrados */}
          <div>
            <h4 className="font-medium mb-3">Serviços Cadastrados</h4>
            <div className="grid gap-2 max-h-40 overflow-y-auto">
              {servicos.map(servico => (
                <div
                  key={servico.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    newItem.servico_id === servico.id
                      ? 'border-primary bg-primary bg-opacity-10'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleServiceSelect(servico)}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium">{servico.descricao}</div>
                      <div className="text-sm text-gray-500">
                        {formatCurrency(servico.valor)}
                      </div>
                    </div>
                    {newItem.servico_id === servico.id && (
                      <i className="fas fa-check text-primary"></i>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Serviço Personalizado */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium">Serviço Personalizado</h4>
              <Button
                type="button"
                variant="outline"
                size="small"
                onClick={handleCustomService}
              >
                Personalizar
              </Button>
            </div>
            
            <div className="space-y-3">
              <Input
                label="Descrição do Serviço"
                type="text"
                value={newItem.descricao_servico}
                onChange={(e) => setNewItem(prev => ({
                  ...prev,
                  descricao_servico: e.target.value
                }))}
                placeholder="Digite a descrição do serviço"
              />

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Valor Unitário"
                  type="number"
                  value={newItem.valor_cobrado}
                  onChange={(e) => setNewItem(prev => ({
                    ...prev,
                    valor_cobrado: Number(e.target.value)
                  }))}
                  placeholder="0,00"
                  step="0.01"
                  min="0"
                />

                <Input
                  label="Quantidade"
                  type="number"
                  value={newItem.quantidade}
                  onChange={(e) => setNewItem(prev => ({
                    ...prev,
                    quantidade: Number(e.target.value)
                  }))}
                  min="1"
                />
              </div>
            </div>
          </div>

          {/* Total */}
          {newItem.valor_cobrado > 0 && (
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-medium">Total:</span>
                <span className="text-lg font-bold text-primary">
                  {formatCurrency(newItem.valor_cobrado * newItem.quantidade)}
                </span>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="primary"
              onClick={handleAddItem}
              disabled={!newItem.descricao_servico || newItem.valor_cobrado <= 0}
            >
              Adicionar Item
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowModal(false)}
            >
              Cancelar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
