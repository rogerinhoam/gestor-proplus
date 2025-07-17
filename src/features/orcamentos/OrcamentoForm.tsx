// src/features/orcamentos/OrcamentoForm.tsx
import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Form } from '../../components/ui/Form';
import { ServiceSelector } from './ServiceSelector';
import { useClientes } from '../clientes/useClientes';
import { Orcamento, Cliente, OrcamentoItem } from '../../types';
import { formatCurrency } from '../../utils/formatting';

interface OrcamentoFormProps {
  orcamento?: Orcamento | null;
  onSave: (data: Partial<Orcamento>) => Promise<void>;
  onCancel: () => void;
}

export const OrcamentoForm: React.FC<OrcamentoFormProps> = ({
  orcamento,
  onSave,
  onCancel
}) => {
  const { clientes, fetchClientes } = useClientes();
  
  const [formData, setFormData] = useState({
    cliente_id: '',
    desconto: 0,
    formas_pagamento: '',
    status: 'Orçamento' as const
  });

  const [itens, setItens] = useState<OrcamentoItem[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchClientes();
  }, []);

  useEffect(() => {
    if (orcamento) {
      setFormData({
        cliente_id: orcamento.cliente_id || '',
        desconto: orcamento.desconto || 0,
        formas_pagamento: orcamento.formas_pagamento || '',
        status: orcamento.status || 'Orçamento'
      });
      setItens(orcamento.orcamento_itens || []);
    }
  }, [orcamento]);

  const calculateTotal = () => {
    const subtotal = itens.reduce((sum, item) => 
      sum + (item.valor_cobrado * item.quantidade), 0
    );
    const desconto = (subtotal * formData.desconto) / 100;
    return subtotal - desconto;
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Limpar erro quando o usuário começar a digitar
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleAddItem = (item: OrcamentoItem) => {
    setItens(prev => [...prev, { ...item, id: Date.now().toString() }]);
  };

  const handleRemoveItem = (index: number) => {
    setItens(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpdateItem = (index: number, updatedItem: Partial<OrcamentoItem>) => {
    setItens(prev => prev.map((item, i) => 
      i === index ? { ...item, ...updatedItem } : item
    ));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.cliente_id) {
      newErrors.cliente_id = 'Selecione um cliente';
    }

    if (itens.length === 0) {
      newErrors.itens = 'Adicione pelo menos um serviço';
    }

    if (formData.desconto < 0 || formData.desconto > 100) {
      newErrors.desconto = 'Desconto deve estar entre 0 e 100%';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const valorTotal = calculateTotal();
      
      const orcamentoData = {
        ...formData,
        valor_total: valorTotal,
        orcamento_itens: itens
      };

      await onSave(orcamentoData);
    } catch (error) {
      console.error('Erro ao salvar orçamento:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      <div className="space-y-6">
        {/* Seleção de Cliente */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cliente *
          </label>
          <select
            value={formData.cliente_id}
            onChange={(e) => handleInputChange('cliente_id', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Selecione um cliente</option>
            {clientes.map(cliente => (
              <option key={cliente.id} value={cliente.id}>
                {cliente.nome} {cliente.carro && `- ${cliente.carro}`}
              </option>
            ))}
          </select>
          {errors.cliente_id && (
            <p className="mt-1 text-sm text-red-600">{errors.cliente_id}</p>
          )}
        </div>

        {/* Seleção de Serviços */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Serviços *
          </label>
          <ServiceSelector
            onAddItem={handleAddItem}
            existingItems={itens}
          />
          {errors.itens && (
            <p className="mt-1 text-sm text-red-600">{errors.itens}</p>
          )}
        </div>

        {/* Lista de Itens */}
        {itens.length > 0 && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium mb-3">Itens do Orçamento</h3>
            <div className="space-y-2">
              {itens.map((item, index) => (
                <div key={index} className="flex items-center justify-between bg-white p-3 rounded">
                  <div className="flex-1">
                    <div className="font-medium">{item.descricao_servico}</div>
                    <div className="text-sm text-gray-600">
                      {formatCurrency(item.valor_cobrado)} x {item.quantidade}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">
                      {formatCurrency(item.valor_cobrado * item.quantidade)}
                    </span>
                    <Button
                      type="button"
                      variant="error"
                      size="small"
                      onClick={() => handleRemoveItem(index)}
                      icon="trash"
                    >
                      Remover
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Configurações */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Desconto (%)"
            type="number"
            value={formData.desconto}
            onChange={(e) => handleInputChange('desconto', Number(e.target.value))}
            error={errors.desconto}
            min="0"
            max="100"
            step="0.1"
          />

          <Input
            label="Formas de Pagamento"
            type="text"
            value={formData.formas_pagamento}
            onChange={(e) => handleInputChange('formas_pagamento', e.target.value)}
            placeholder="PIX, Cartão, Dinheiro..."
          />
        </div>

        {/* Total */}
        <div className="bg-primary bg-opacity-10 p-4 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-lg font-medium">Total do Orçamento:</span>
            <span className="text-2xl font-bold text-primary">
              {formatCurrency(calculateTotal())}
            </span>
          </div>
          {formData.desconto > 0 && (
            <div className="text-sm text-green-600 mt-1">
              Desconto aplicado: {formData.desconto}%
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <Button
            type="submit"
            variant="primary"
            loading={loading}
            disabled={loading}
          >
            {orcamento ? 'Atualizar' : 'Salvar'} Orçamento
          </Button>

          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={loading}
          >
            Cancelar
          </Button>
        </div>
      </div>
    </Form>
  );
};
