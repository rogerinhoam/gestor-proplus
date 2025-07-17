import React, { forwardRef } from 'react';

interface InputProps {
  label?: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search' | 'date' | 'time' | 'datetime-local';
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  success?: string;
  icon?: string;
  iconPosition?: 'left' | 'right';
  className?: string;
  size?: 'small' | 'medium' | 'large';
  variant?: 'default' | 'filled' | 'outlined';
  autoComplete?: string;
  maxLength?: number;
  min?: string | number;
  max?: string | number;
  step?: string | number;
  pattern?: string;
  name?: string;
  id?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  type = 'text',
  placeholder,
  value,
  defaultValue,
  onChange,
  onBlur,
  onFocus,
  disabled = false,
  required = false,
  error,
  success,
  icon,
  iconPosition = 'left',
  className = '',
  size = 'medium',
  variant = 'default',
  autoComplete,
  maxLength,
  min,
  max,
  step,
  pattern,
  name,
  id
}, ref) => {
  const baseClasses = 'w-full border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1';
  
  const sizeClasses = {
    small: 'px-3 py-1.5 text-sm',
    medium: 'px-4 py-2 text-base',
    large: 'px-5 py-3 text-lg'
  };
  
  const variantClasses = {
    default: 'bg-white border-gray-300 rounded-lg',
    filled: 'bg-gray-50 border-gray-200 rounded-lg',
    outlined: 'bg-transparent border-2 border-gray-300 rounded-lg'
  };
  
  const stateClasses = error 
    ? 'border-error focus:ring-error focus:border-error' 
    : success 
    ? 'border-green-500 focus:ring-green-500 focus:border-green-500'
    : 'focus:ring-primary focus:border-primary hover:border-gray-400';
  
  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed bg-gray-100' : '';
  
  const inputClasses = `
    ${baseClasses}
    ${sizeClasses[size]}
    ${variantClasses[variant]}
    ${stateClasses}
    ${disabledClasses}
    ${icon && iconPosition === 'left' ? 'pl-10' : ''}
    ${icon && iconPosition === 'right' ? 'pr-10' : ''}
    ${className}
  `.trim();
  
  return (
    <div className="relative">
      {label && (
        <label 
          htmlFor={id || name} 
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
          {required && <span className="text-error ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {icon && (
          <div className={`absolute inset-y-0 ${iconPosition === 'left' ? 'left-0' : 'right-0'} flex items-center ${iconPosition === 'left' ? 'pl-3' : 'pr-3'}`}>
            <i className={`fas ${icon} ${error ? 'text-error' : success ? 'text-green-500' : 'text-gray-400'}`}></i>
          </div>
        )}
        
        <input
          ref={ref}
          type={type}
          id={id || name}
          name={name}
          value={value}
          defaultValue={defaultValue}
          placeholder={placeholder}
          onChange={onChange}
          onBlur={onBlur}
          onFocus={onFocus}
          disabled={disabled}
          required={required}
          autoComplete={autoComplete}
          maxLength={maxLength}
          min={min}
          max={max}
          step={step}
          pattern={pattern}
          className={inputClasses}
        />
      </div>
      
      {error && (
        <p className="mt-1 text-sm text-error flex items-center">
          <i className="fas fa-exclamation-circle mr-1"></i>
          {error}
        </p>
      )}
      
      {success && (
        <p className="mt-1 text-sm text-green-600 flex items-center">
          <i className="fas fa-check-circle mr-1"></i>
          {success}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';