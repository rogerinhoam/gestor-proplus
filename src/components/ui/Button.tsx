import React from 'react';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'outline';
  size?: 'small' | 'medium' | 'large';
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  loading?: boolean;
  icon?: string;
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'medium',
  type = 'button',
  disabled = false,
  loading = false,
  icon,
  children,
  onClick,
  className = ''
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variantClasses = {
    primary: 'bg-primary text-white hover:bg-primary-dark focus:ring-primary shadow-lg hover:shadow-xl',
    secondary: 'bg-secondary text-gray-800 hover:bg-secondary-dark focus:ring-secondary',
    success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
    error: 'bg-error text-white hover:bg-red-700 focus:ring-error',
    warning: 'bg-yellow-600 text-white hover:bg-yellow-700 focus:ring-yellow-500',
    outline: 'border-2 border-primary text-primary hover:bg-primary hover:text-white focus:ring-primary'
  };
  
  const sizeClasses = {
    small: 'px-3 py-1.5 text-sm',
    medium: 'px-4 py-2 text-base',
    large: 'px-6 py-3 text-lg'
  };
  
  const disabledClasses = 'opacity-50 cursor-not-allowed';
  const loadingClasses = 'cursor-wait';
  
  const buttonClasses = `
    ${baseClasses}
    ${variantClasses[variant]}
    ${sizeClasses[size]}
    ${disabled ? disabledClasses : ''}
    ${loading ? loadingClasses : ''}
    ${className}
  `.trim();
  
  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={buttonClasses}
    >
      {loading && (
        <i className="fas fa-spinner fa-spin mr-2"></i>
      )}
      {!loading && icon && (
        <i className={`fas ${icon} mr-2`}></i>
      )}
      {children}
    </button>
  );
};