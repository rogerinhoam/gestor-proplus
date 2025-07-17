import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';

interface NotificationProps {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  onClose: () => void;
  duration?: number;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
  title?: string;
  actions?: React.ReactNode;
}

export const Notification: React.FC<NotificationProps> = ({
  type,
  message,
  onClose,
  duration = 5000,
  position = 'top-right',
  title,
  actions
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isLeaving, setIsLeaving] = useState(false);
  
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [duration]);
  
  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => {
      setIsVisible(false);
      onClose();
    }, 300);
  };
  
  if (!isVisible) return null;
  
  const typeConfig = {
    success: {
      icon: 'fa-check-circle',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      textColor: 'text-green-800',
      iconColor: 'text-green-500'
    },
    error: {
      icon: 'fa-times-circle',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      textColor: 'text-red-800',
      iconColor: 'text-red-500'
    },
    warning: {
      icon: 'fa-exclamation-triangle',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      textColor: 'text-yellow-800',
      iconColor: 'text-yellow-500'
    },
    info: {
      icon: 'fa-info-circle',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-800',
      iconColor: 'text-blue-500'
    }
  };
  
  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
    'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2'
  };
  
  const config = typeConfig[type];
  
  const notificationContent = (
    <div className={`fixed ${positionClasses[position]} z-50 max-w-md w-full`}>
      <div className={`
        ${config.bgColor} ${config.borderColor} ${config.textColor}
        border rounded-lg shadow-lg p-4 transition-all duration-300
        ${isLeaving ? 'opacity-0 transform translate-x-full' : 'opacity-100 transform translate-x-0'}
      `}>
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <i className={`fas ${config.icon} ${config.iconColor} text-lg`}></i>
          </div>
          
          <div className="ml-3 w-0 flex-1">
            {title && (
              <p className="font-medium text-sm mb-1">{title}</p>
            )}
            <p className="text-sm">{message}</p>
            
            {actions && (
              <div className="mt-3 flex space-x-2">
                {actions}
              </div>
            )}
          </div>
          
          <div className="ml-4 flex-shrink-0 flex">
            <button
              onClick={handleClose}
              className={`inline-flex ${config.textColor} hover:opacity-75 focus:outline-none transition-opacity`}
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
  
  return ReactDOM.createPortal(
    notificationContent,
    document.body
  );
};

// Notification Manager Hook
export const useNotification = () => {
  const [notifications, setNotifications] = useState<Array<{
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
    title?: string;
    duration?: number;
  }>>([]);
  
  const addNotification = (notification: Omit<typeof notifications[0], 'id'>) => {
    const id = Date.now().toString();
    setNotifications(prev => [...prev, { ...notification, id }]);
  };
  
  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };
  
  const clearAll = () => {
    setNotifications([]);
  };
  
  const success = (message: string, title?: string, duration?: number) => {
    addNotification({ type: 'success', message, title, duration });
  };
  
  const error = (message: string, title?: string, duration?: number) => {
    addNotification({ type: 'error', message, title, duration });
  };
  
  const warning = (message: string, title?: string, duration?: number) => {
    addNotification({ type: 'warning', message, title, duration });
  };
  
  const info = (message: string, title?: string, duration?: number) => {
    addNotification({ type: 'info', message, title, duration });
  };
  
  return {
    notifications,
    addNotification,
    removeNotification,
    clearAll,
    success,
    error,
    warning,
    info
  };
};

// Notification Container Component
export const NotificationContainer: React.FC = () => {
  const { notifications, removeNotification } = useNotification();
  
  return (
    <>
      {notifications.map(notification => (
        <Notification
          key={notification.id}
          type={notification.type}
          message={notification.message}
          title={notification.title}
          duration={notification.duration}
          onClose={() => removeNotification(notification.id)}
        />
      ))}
    </>
  );
};