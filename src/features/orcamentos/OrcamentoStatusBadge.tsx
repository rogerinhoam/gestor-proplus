// src/features/orcamentos/OrcamentoStatusBadge.tsx
import React from 'react';

interface OrcamentoStatusBadgeProps {
  status: 'Orçamento' | 'Aprovado' | 'Finalizado' | 'Cancelado';
  size?: 'small' | 'medium' | 'large';
  showIcon?: boolean;
}

export const OrcamentoStatusBadge: React.FC<OrcamentoStatusBadgeProps> = ({
  status,
  size = 'medium',
  showIcon = true
}) => {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'Orçamento':
        return {
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          icon: 'fas fa-file-alt',
          label: 'Orçamento'
        };
      case 'Aprovado':
        return {
          color: 'bg-blue-100 text-blue-800 border-blue-200',
          icon: 'fas fa-check-circle',
          label: 'Aprovado'
        };
      case 'Finalizado':
        return {
          color: 'bg-green-100 text-green-800 border-green-200',
          icon: 'fas fa-check-double',
          label: 'Finalizado'
        };
      case 'Cancelado':
        return {
          color: 'bg-red-100 text-red-800 border-red-200',
          icon: 'fas fa-times-circle',
          label: 'Cancelado'
        };
      default:
        return {
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: 'fas fa-question-circle',
          label: status
        };
    }
  };

  const getSizeClasses = (size: string) => {
    switch (size) {
      case 'small':
        return 'px-2 py-1 text-xs';
      case 'large':
        return 'px-4 py-2 text-base';
      default:
        return 'px-3 py-1 text-sm';
    }
  };

  const config = getStatusConfig(status);
  const sizeClasses = getSizeClasses(size);

  return (
    <span
      className={`
        inline-flex items-center font-medium rounded-full border
        ${config.color} ${sizeClasses}
      `}
    >
      {showIcon && (
        <i className={`${config.icon} mr-1`}></i>
      )}
      {config.label}
    </span>
  );
};

// Hook para obter próximo status válido
export const useNextStatus = (currentStatus: string) => {
  const getNextStatus = (status: string) => {
    switch (status) {
      case 'Orçamento':
        return 'Aprovado';
      case 'Aprovado':
        return 'Finalizado';
      default:
        return null;
    }
  };

  const getStatusAction = (status: string) => {
    switch (status) {
      case 'Orçamento':
        return {
          action: 'Aprovar',
          nextStatus: 'Aprovado',
          icon: 'fas fa-check'
        };
      case 'Aprovado':
        return {
          action: 'Finalizar',
          nextStatus: 'Finalizado',
          icon: 'fas fa-check-double'
        };
      default:
        return null;
    }
  };

  return {
    nextStatus: getNextStatus(currentStatus),
    statusAction: getStatusAction(currentStatus)
  };
};
