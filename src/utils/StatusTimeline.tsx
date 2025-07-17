// src/features/orcamentos/advanced/StatusTimeline.tsx
import React from 'react';

interface StatusTimelineProps {
  currentStatus: 'Orçamento' | 'Aprovado' | 'Finalizado' | 'Cancelado';
  onStatusChange?: (newStatus: string) => void;
  readOnly?: boolean;
  showLabels?: boolean;
  size?: 'small' | 'medium' | 'large';
}

const statusSteps = [
  { key: 'Orçamento', label: 'Orçamento', icon: 'fas fa-file-alt' },
  { key: 'Aprovado', label: 'Aprovado', icon: 'fas fa-check-circle' },
  { key: 'Finalizado', label: 'Finalizado', icon: 'fas fa-check-double' }
];

/**
 * Timeline visual do status do orçamento com transições animadas.
 */
export const StatusTimeline: React.FC<StatusTimelineProps> = ({
  currentStatus,
  onStatusChange,
  readOnly = false,
  showLabels = true,
  size = 'medium'
}) => {
  const currentIndex = statusSteps.findIndex(step => step.key === currentStatus);
  const isCanceled = currentStatus === 'Cancelado';

  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return {
          container: 'space-x-2',
          step: 'w-6 h-6 text-xs',
          line: 'h-0.5',
          label: 'text-xs'
        };
      case 'large':
        return {
          container: 'space-x-6',
          step: 'w-10 h-10 text-lg',
          line: 'h-1',
          label: 'text-base'
        };
      default:
        return {
          container: 'space-x-4',
          step: 'w-8 h-8 text-sm',
          line: 'h-0.5',
          label: 'text-sm'
        };
    }
  };

  const sizeClasses = getSizeClasses();

  const getStepClasses = (stepIndex: number) => {
    if (isCanceled) {
      return 'bg-red-500 text-white border-red-500';
    }
    
    if (stepIndex <= currentIndex) {
      return 'bg-primary text-white border-primary shadow-md';
    }
    
    return 'bg-gray-200 text-gray-500 border-gray-300';
  };

  const getLineClasses = (stepIndex: number) => {
    if (isCanceled) {
      return 'bg-red-200';
    }
    
    if (stepIndex < currentIndex) {
      return 'bg-primary';
    }
    
    return 'bg-gray-200';
  };

  const handleStepClick = (stepKey: string, stepIndex: number) => {
    if (readOnly || !onStatusChange) return;
    
    // Só permite avançar ou voltar um passo
    if (Math.abs(stepIndex - currentIndex) === 1 || stepIndex < currentIndex) {
      onStatusChange(stepKey);
    }
  };

  if (isCanceled) {
    return (
      <div className="flex items-center justify-center">
        <div className={`
          ${sizeClasses.step} rounded-full border-2 bg-red-500 text-white border-red-500
          flex items-center justify-center font-semibold shadow-md
        `}>
          <i className="fas fa-times"></i>
        </div>
        {showLabels && (
          <span className={`ml-2 font-medium text-red-600 ${sizeClasses.label}`}>
            Cancelado
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className={`flex items-center ${sizeClasses.container}`}>
        {statusSteps.map((step, index) => (
          <React.Fragment key={step.key}>
            {/* Step Circle */}
            <div className="flex flex-col items-center">
              <button
                className={`
                  ${sizeClasses.step} rounded-full border-2 flex items-center justify-center
                  font-semibold transition-all duration-300 transform
                  ${getStepClasses(index)}
                  ${!readOnly && onStatusChange ? 'hover:scale-110 cursor-pointer' : 'cursor-default'}
                  ${index <= currentIndex ? 'animate-pulse' : ''}
                `}
                onClick={() => handleStepClick(step.key, index)}
                disabled={readOnly || !onStatusChange}
                type="button"
              >
                <i className={step.icon}></i>
              </button>
              
              {showLabels && (
                <span className={`
                  mt-2 font-medium transition-colors duration-300 ${sizeClasses.label}
                  ${index <= currentIndex ? 'text-primary' : 'text-gray-500'}
                `}>
                  {step.label}
                </span>
              )}
            </div>

            {/* Connecting Line */}
            {index < statusSteps.length - 1 && (
              <div className={`
                flex-1 ${sizeClasses.line} transition-colors duration-500
                ${getLineClasses(index)}
              `} />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Status Actions */}
      {!readOnly && onStatusChange && !isCanceled && (
        <div className="mt-4 flex gap-2 justify-center">
          {currentIndex < statusSteps.length - 1 && (
            <button
              onClick={() => onStatusChange(statusSteps[currentIndex + 1].key)}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors text-sm font-medium"
            >
              Avançar para {statusSteps[currentIndex + 1].label}
            </button>
          )}
          
          {currentStatus !== 'Finalizado' && (
            <button
              onClick={() => onStatusChange('Cancelado')}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
            >
              Cancelar
            </button>
          )}
        </div>
      )}
    </div>
  );
};

// Hook para obter informações sobre possíveis transições de status
export const useStatusTransitions = (currentStatus: string) => {
  const getAvailableTransitions = () => {
    switch (currentStatus) {
      case 'Orçamento':
        return [
          { status: 'Aprovado', label: 'Aprovar', icon: 'fas fa-check', color: 'primary' },
          { status: 'Cancelado', label: 'Cancelar', icon: 'fas fa-times', color: 'red' }
        ];
      case 'Aprovado':
        return [
          { status: 'Finalizado', label: 'Finalizar', icon: 'fas fa-check-double', color: 'green' },
          { status: 'Orçamento', label: 'Voltar', icon: 'fas fa-arrow-left', color: 'gray' },
          { status: 'Cancelado', label: 'Cancelar', icon: 'fas fa-times', color: 'red' }
        ];
      case 'Finalizado':
        return [
          { status: 'Aprovado', label: 'Reabrir', icon: 'fas fa-undo', color: 'blue' }
        ];
      default:
        return [];
    }
  };

  const canTransitionTo = (targetStatus: string) => {
    const transitions = getAvailableTransitions();
    return transitions.some(t => t.status === targetStatus);
  };

  return {
    availableTransitions: getAvailableTransitions(),
    canTransitionTo
  };
};
