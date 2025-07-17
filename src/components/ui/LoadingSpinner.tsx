import React from 'react';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: 'primary' | 'secondary' | 'white' | 'gray';
  text?: string;
  className?: string;
  overlay?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'medium',
  color = 'primary',
  text,
  className = '',
  overlay = false
}) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12'
  };
  
  const colorClasses = {
    primary: 'text-primary',
    secondary: 'text-secondary',
    white: 'text-white',
    gray: 'text-gray-600'
  };
  
  const textSizeClasses = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-lg'
  };
  
  const spinner = (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="flex flex-col items-center space-y-2">
        <div className={`animate-spin ${sizeClasses[size]} ${colorClasses[color]}`}>
          <i className="fas fa-spinner"></i>
        </div>
        {text && (
          <p className={`font-medium ${colorClasses[color]} ${textSizeClasses[size]}`}>
            {text}
          </p>
        )}
      </div>
    </div>
  );
  
  if (overlay) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 shadow-xl">
          {spinner}
        </div>
      </div>
    );
  }
  
  return spinner;
};

// Skeleton loader for content placeholders
export const SkeletonLoader: React.FC<{
  lines?: number;
  className?: string;
  avatar?: boolean;
  width?: string;
  height?: string;
}> = ({ lines = 3, className = '', avatar = false, width = 'w-full', height = 'h-4' }) => {
  return (
    <div className={`animate-pulse ${className}`}>
      {avatar && (
        <div className="flex items-center space-x-4 mb-4">
          <div className="rounded-full bg-gray-200 h-10 w-10"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      )}
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className={`bg-gray-200 rounded ${height} ${
              index === lines - 1 ? 'w-2/3' : width
            }`}
          ></div>
        ))}
      </div>
    </div>
  );
};

// Card skeleton loader
export const CardSkeleton: React.FC<{
  count?: number;
  className?: string;
}> = ({ count = 3, className = '' }) => {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="bg-white rounded-lg shadow-lg p-6">
          <SkeletonLoader lines={4} avatar />
        </div>
      ))}
    </div>
  );
};

// Table skeleton loader
export const TableSkeleton: React.FC<{
  rows?: number;
  cols?: number;
  className?: string;
}> = ({ rows = 5, cols = 4, className = '' }) => {
  return (
    <div className={`bg-white rounded-lg shadow-lg overflow-hidden ${className}`}>
      <div className="animate-pulse">
        {/* Header */}
        <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
          <div className="grid grid-cols-4 gap-4">
            {Array.from({ length: cols }).map((_, index) => (
              <div key={index} className="h-4 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
        
        {/* Rows */}
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="px-6 py-4 border-b border-gray-200">
            <div className="grid grid-cols-4 gap-4">
              {Array.from({ length: cols }).map((_, colIndex) => (
                <div key={colIndex} className="h-4 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Inline loader for buttons and small spaces
export const InlineLoader: React.FC<{
  size?: 'small' | 'medium';
  color?: 'primary' | 'white' | 'gray';
}> = ({ size = 'small', color = 'primary' }) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-5 h-5'
  };
  
  const colorClasses = {
    primary: 'text-primary',
    white: 'text-white',
    gray: 'text-gray-600'
  };
  
  return (
    <div className={`animate-spin ${sizeClasses[size]} ${colorClasses[color]}`}>
      <i className="fas fa-spinner"></i>
    </div>
  );
};