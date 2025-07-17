import React from 'react';

interface CardProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'small' | 'medium' | 'large';
  shadow?: 'none' | 'small' | 'medium' | 'large';
  border?: boolean;
  hoverable?: boolean;
  onClick?: () => void;
  icon?: string;
  actions?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  children,
  className = '',
  padding = 'medium',
  shadow = 'medium',
  border = true,
  hoverable = false,
  onClick,
  icon,
  actions
}) => {
  const baseClasses = 'bg-white rounded-lg transition-all duration-200';
  
  const paddingClasses = {
    none: '',
    small: 'p-4',
    medium: 'p-6',
    large: 'p-8'
  };
  
  const shadowClasses = {
    none: '',
    small: 'shadow-sm',
    medium: 'shadow-lg',
    large: 'shadow-xl'
  };
  
  const borderClasses = border ? 'border border-gray-200' : '';
  const hoverClasses = hoverable ? 'hover:shadow-xl hover:scale-105 cursor-pointer' : '';
  const clickableClasses = onClick ? 'cursor-pointer' : '';
  
  const cardClasses = `
    ${baseClasses}
    ${paddingClasses[padding]}
    ${shadowClasses[shadow]}
    ${borderClasses}
    ${hoverClasses}
    ${clickableClasses}
    ${className}
  `.trim();
  
  return (
    <div className={cardClasses} onClick={onClick}>
      {/* Header */}
      {(title || subtitle || icon || actions) && (
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            {icon && (
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center mr-3">
                <i className={`fas ${icon} text-white`}></i>
              </div>
            )}
            <div>
              {title && (
                <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
              )}
              {subtitle && (
                <p className="text-sm text-gray-600">{subtitle}</p>
              )}
            </div>
          </div>
          {actions && (
            <div className="flex items-center space-x-2">
              {actions}
            </div>
          )}
        </div>
      )}
      
      {/* Content */}
      <div>{children}</div>
    </div>
  );
};

// Specialized Card Components
export const StatCard: React.FC<{
  title: string;
  value: string | number;
  change?: number;
  icon: string;
  color?: 'primary' | 'success' | 'warning' | 'error';
  onClick?: () => void;
}> = ({ title, value, change, icon, color = 'primary', onClick }) => {
  const colorClasses = {
    primary: 'bg-primary text-white',
    success: 'bg-green-600 text-white',
    warning: 'bg-yellow-600 text-white',
    error: 'bg-error text-white'
  };
  
  const changeColor = change && change > 0 ? 'text-green-600' : change && change < 0 ? 'text-red-600' : 'text-gray-600';
  
  return (
    <Card hoverable={!!onClick} onClick={onClick} className="relative overflow-hidden">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {change !== undefined && (
            <p className={`text-sm ${changeColor} flex items-center`}>
              <i className={`fas ${change > 0 ? 'fa-arrow-up' : change < 0 ? 'fa-arrow-down' : 'fa-minus'} mr-1`}></i>
              {Math.abs(change)}%
            </p>
          )}
        </div>
        <div className={`w-12 h-12 rounded-lg ${colorClasses[color]} flex items-center justify-center`}>
          <i className={`fas ${icon} text-xl`}></i>
        </div>
      </div>
    </Card>
  );
};

export const ActionCard: React.FC<{
  title: string;
  description: string;
  icon: string;
  color?: 'primary' | 'success' | 'warning' | 'error';
  onClick: () => void;
}> = ({ title, description, icon, color = 'primary', onClick }) => {
  const colorClasses = {
    primary: 'bg-primary text-white',
    success: 'bg-green-600 text-white',
    warning: 'bg-yellow-600 text-white',
    error: 'bg-error text-white'
  };
  
  return (
    <Card hoverable onClick={onClick} className="text-center">
      <div className={`w-16 h-16 rounded-full ${colorClasses[color]} flex items-center justify-center mx-auto mb-4`}>
        <i className={`fas ${icon} text-2xl`}></i>
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </Card>
  );
};

export const InfoCard: React.FC<{
  label: string;
  value: string;
  icon?: string;
  color?: 'primary' | 'success' | 'warning' | 'error' | 'gray';
}> = ({ label, value, icon, color = 'gray' }) => {
  const colorClasses = {
    primary: 'text-primary',
    success: 'text-green-600',
    warning: 'text-yellow-600',
    error: 'text-error',
    gray: 'text-gray-600'
  };
  
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-200 last:border-b-0">
      <div className="flex items-center">
        {icon && (
          <i className={`fas ${icon} ${colorClasses[color]} mr-3`}></i>
        )}
        <span className="text-sm font-medium text-gray-600">{label}</span>
      </div>
      <span className="text-sm font-semibold text-gray-900">{value}</span>
    </div>
  );
};