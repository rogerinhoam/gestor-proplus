import React from 'react';
import { Button } from './Button';

interface FormProps {
  onSubmit: (e: React.FormEvent) => void;
  children: React.ReactNode;
  className?: string;
  loading?: boolean;
  title?: string;
  subtitle?: string;
  submitText?: string;
  cancelText?: string;
  onCancel?: () => void;
  showCancel?: boolean;
  submitVariant?: 'primary' | 'secondary' | 'success' | 'error' | 'warning';
  disabled?: boolean;
}

export const Form: React.FC<FormProps> = ({
  onSubmit,
  children,
  className = '',
  loading = false,
  title,
  subtitle,
  submitText = 'Salvar',
  cancelText = 'Cancelar',
  onCancel,
  showCancel = true,
  submitVariant = 'primary',
  disabled = false
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loading && !disabled) {
      onSubmit(e);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className={`space-y-6 ${className}`}>
      {/* Header */}
      {(title || subtitle) && (
        <div className="mb-6">
          {title && (
            <h2 className="text-xl font-semibold text-gray-900 mb-2">{title}</h2>
          )}
          {subtitle && (
            <p className="text-gray-600">{subtitle}</p>
          )}
        </div>
      )}
      
      {/* Form Fields */}
      <div className="space-y-4">
        {children}
      </div>
      
      {/* Actions */}
      <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
        {showCancel && onCancel && (
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={loading}
          >
            {cancelText}
          </Button>
        )}
        <Button
          type="submit"
          variant={submitVariant}
          loading={loading}
          disabled={disabled}
        >
          {submitText}
        </Button>
      </div>
    </form>
  );
};

// Form Field Group Component
export const FormGroup: React.FC<{
  label?: string;
  children: React.ReactNode;
  className?: string;
  required?: boolean;
  error?: string;
  help?: string;
}> = ({ label, children, className = '', required = false, error, help }) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-error ml-1">*</span>}
        </label>
      )}
      {children}
      {error && (
        <p className="text-sm text-error flex items-center">
          <i className="fas fa-exclamation-circle mr-1"></i>
          {error}
        </p>
      )}
      {help && !error && (
        <p className="text-sm text-gray-500">{help}</p>
      )}
    </div>
  );
};

// Form Row Component (for side-by-side fields)
export const FormRow: React.FC<{
  children: React.ReactNode;
  className?: string;
  gap?: 'small' | 'medium' | 'large';
}> = ({ children, className = '', gap = 'medium' }) => {
  const gapClasses = {
    small: 'gap-2',
    medium: 'gap-4',
    large: 'gap-6'
  };
  
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 ${gapClasses[gap]} ${className}`}>
      {children}
    </div>
  );
};

// Form Section Component
export const FormSection: React.FC<{
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  collapsible?: boolean;
  defaultExpanded?: boolean;
}> = ({ title, subtitle, children, className = '', collapsible = false, defaultExpanded = true }) => {
  const [expanded, setExpanded] = React.useState(defaultExpanded);
  
  return (
    <div className={`border border-gray-200 rounded-lg p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-medium text-gray-900">{title}</h3>
          {subtitle && (
            <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
          )}
        </div>
        {collapsible && (
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <i className={`fas ${expanded ? 'fa-chevron-up' : 'fa-chevron-down'}`}></i>
          </button>
        )}
      </div>
      {expanded && (
        <div className="space-y-4">
          {children}
        </div>
      )}
    </div>
  );
};