// src/features/clientes/ClienteCard.tsx
import React from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Cliente } from '../../types';
import { formatTelefone } from '../../utils/formatting';

interface ClienteCardProps {
  cliente: Cliente;
  onEdit: (cliente: Cliente) => void;
  onDelete: (id: string) => void;
  onViewDetails: (cliente: Cliente) => void;
}

export const ClienteCard: React.FC<ClienteCardProps> = ({
  cliente,
  onEdit,
  onDelete,
  onViewDetails
}) => {
  const handleWhatsApp = () => {
    if (cliente.telefone) {
      const phoneNumber = cliente.telefone.replace(/\D/g, '');
      const message = `Olá ${cliente.nome}, tudo bem?`;
      window.open(`https://wa.me/55${phoneNumber}?text=${encodeURIComponent(message)}`, '_blank');
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-semibold text-lg mr-3">
              {cliente.nome?.charAt(0)?.toUpperCase() || '?'}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-lg">
                {cliente.nome}
              </h3>
              <p className="text-sm text-gray-500">
                Cliente desde {new Date(cliente.created_at).toLocaleDateString('pt-BR')}
              </p>
            </div>
          </div>
        </div>

        {/* Informações */}
        <div className="space-y-2 mb-4">
          {cliente.telefone && (
            <div className="flex items-center text-sm text-gray-600">
              <i className="fas fa-phone w-4 mr-2"></i>
              {formatTelefone(cliente.telefone)}
            </div>
          )}

          {cliente.carro && (
            <div className="flex items-center text-sm text-gray-600">
              <i className="fas fa-car w-4 mr-2"></i>
              {cliente.carro}
            </div>
          )}

          {cliente.placa && (
            <div className="flex items-center text-sm text-gray-600">
              <i className="fas fa-id-card w-4 mr-2"></i>
              <span className="font-mono">{cliente.placa}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-3 border-t">
          <Button
            variant="outline"
            size="small"
            onClick={() => onViewDetails(cliente)}
            icon="eye"
            className="flex-1"
          >
            Detalhes
          </Button>

          {cliente.telefone && (
            <Button
              variant="success"
              size="small"
              onClick={handleWhatsApp}
              icon="whatsapp"
              className="flex-1"
            >
              WhatsApp
            </Button>
          )}

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
      </div>
    </Card>
  );
};
