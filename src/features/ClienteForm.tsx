// src/features/clientes/ClienteForm.tsx
import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Form } from '../../components/ui/Form';
import { Cliente } from '../../types';
import { formatTelefone, formatPlaca, validateTelefone, validatePlaca } from '../../utils/formatting';

interface ClienteFormProps {
  cliente?: Cliente | null;
  onSave: (data: Partial<Cliente>) => Promise<void>;
  onCancel: () => void;
}

export const ClienteForm: React.FC<ClienteFormProps> = ({
  cliente,
  onSave,
  onCancel
}) => {
  const [formData, setFormData] = useState({
    nome: '',
    telefone: '',
    carro: '',
    placa: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (cliente) {
      setFormData({
        nome: cliente.nome || '',
        telefone: cliente.telefone || '',
        carro: cliente.carro || '',
        placa: cliente.placa || ''
      });
    }
  }, [cliente]);

  const handleInputChange = (field: string, value: string) => {
    let formattedValue = value;

    // Formatação automática
    if (field === 'telefone') {
      formattedValue = formatTelefone(value);
    } else if (field === 'placa') {
      formattedValue = formatPlaca(value);
    } else if (field === 'nome') {
      // Capitalização automática
      formattedValue = value.toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
    }

    setFormData(prev => ({
      ...prev,
      [field]: formattedValue
    }));

    // Limpar erro quando o usuário começar a digitar
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Nome obrigatório
    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome é obrigatório';
    }

    // Validação de telefone
    if (formData.telefone && !validateTelefone(formData.telefone)) {
      newErrors.telefone = 'Formato de telefone inválido';
    }

    // Validação de placa
    if (formData.placa && !validatePlaca(formData.placa)) {
      newErrors.placa = 'Formato de placa inválido';
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
      const cleanData = {
        nome: formData.nome.trim(),
        telefone: formData.telefone || null,
        carro: formData.carro.trim() || null,
        placa: formData.placa.toUpperCase() || null
      };

      await onSave(cleanData);
    } catch (error) {
      console.error('Erro ao salvar cliente:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      <div className="space-y-4">
        <Input
          label="Nome Completo"
          type="text"
          value={formData.nome}
          onChange={(e) => handleInputChange('nome', e.target.value)}
          error={errors.nome}
          placeholder="Digite o nome completo"
          required
          maxLength={100}
        />

        <Input
          label="Telefone"
          type="tel"
          value={formData.telefone}
          onChange={(e) => handleInputChange('telefone', e.target.value)}
          error={errors.telefone}
          placeholder="(11) 99999-9999"
          icon="phone"
          maxLength={15}
        />

        <Input
          label="Modelo do Carro"
          type="text"
          value={formData.carro}
          onChange={(e) => handleInputChange('carro', e.target.value)}
          placeholder="Ex: Honda Civic, Ford Focus..."
          icon="car"
          maxLength={50}
        />

        <Input
          label="Placa do Veículo"
          type="text"
          value={formData.placa}
          onChange={(e) => handleInputChange('placa', e.target.value)}
          error={errors.placa}
          placeholder="ABC-1234 ou ABC1D23"
          icon="id-card"
          maxLength={8}
        />

        <div className="flex gap-3 pt-4">
          <Button
            type="submit"
            variant="primary"
            loading={loading}
            disabled={loading}
          >
            {cliente ? 'Atualizar' : 'Salvar'} Cliente
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
