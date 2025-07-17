import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Button } from './Button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'small' | 'medium' | 'large' | 'full';
  children: React.ReactNode;
  showCloseButton?: boolean;
  closeable?: boolean;
  footer?: React.ReactNode;
  className?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  size = 'medium',
  children,
  showCloseButton = true,
  closeable = true,
  footer,
  className = ''
}) => {
  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && closeable) {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, closeable, onClose]);
  
  if (!isOpen) return null;
  
  const sizeClasses = {
    small: 'max-w-md',
    medium: 'max-w-lg',
    large: 'max-w-2xl',
    full: 'max-w-full mx-4'
  };
  
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && closeable) {
      onClose();
    }
  };
  
  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={handleBackdropClick}
      />
      
      {/* Modal Content */}
      <div className={`
        relative bg-white rounded-lg shadow-xl transform transition-all
        ${sizeClasses[size]}
        ${className}
        max-h-[90vh] overflow-hidden
      `}>
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            {title && (
              <h3 className="text-lg font-semibold text-gray-900">
                {title}
              </h3>
            )}
            {showCloseButton && closeable && (
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <i className="fas fa-times text-xl"></i>
              </button>
            )}
          </div>
        )}
        
        {/* Body */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {children}
        </div>
        
        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
  
  return ReactDOM.createPortal(
    modalContent,
    document.body
  );
};

// Convenience components for common modal patterns
export const ConfirmModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'error' | 'warning' | 'info';
}> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'info'
}) => {
  const iconClasses = {
    error: 'fas fa-exclamation-triangle text-error',
    warning: 'fas fa-exclamation-triangle text-yellow-500',
    info: 'fas fa-info-circle text-primary'
  };
  
  const buttonVariants = {
    error: 'error' as const,
    warning: 'warning' as const,
    info: 'primary' as const
  };
  
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="small"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            {cancelText}
          </Button>
          <Button variant={buttonVariants[variant]} onClick={onConfirm}>
            {confirmText}
          </Button>
        </>
      }
    >
      <div className="flex items-center space-x-3">
        <i className={`${iconClasses[variant]} text-2xl`}></i>
        <p className="text-gray-700">{message}</p>
      </div>
    </Modal>
  );
};