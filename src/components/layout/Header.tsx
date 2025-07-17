import React from 'react';
import { useAppStore } from '../../store';

export const Header: React.FC = () => {
  const { online, lastSync, notification } = useAppStore();
  
  const formatLastSync = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes === 0) return 'Agora mesmo';
    if (minutes === 1) return 'Há 1 minuto';
    if (minutes < 60) return `Há ${minutes} minutos`;
    
    const hours = Math.floor(minutes / 60);
    if (hours === 1) return 'Há 1 hora';
    if (hours < 24) return `Há ${hours} horas`;
    
    return date.toLocaleString('pt-BR');
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex justify-between items-center">
        {/* Left Side - Page Title */}
        <div className="flex items-center">
          <h2 className="text-2xl font-bold text-gray-800">
            R.M. Estética Automotiva
          </h2>
          <span className="ml-4 px-3 py-1 bg-primary text-white text-sm rounded-full">
            Gestor PRO+ v2.0
          </span>
        </div>
        
        {/* Right Side - Status and Actions */}
        <div className="flex items-center space-x-4">
          {/* Connection Status */}
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${online ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-sm text-gray-600">
              {online ? 'Online' : 'Offline'}
            </span>
          </div>
          
          {/* Last Sync */}
          {lastSync && (
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <i className="fas fa-sync-alt"></i>
              <span>Última sincronização: {formatLastSync(lastSync)}</span>
            </div>
          )}
          
          {/* Refresh Button */}
          <button
            onClick={() => useAppStore.getState().fetchAllData()}
            className="flex items-center space-x-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <i className="fas fa-refresh"></i>
            <span>Atualizar</span>
          </button>
          
          {/* Notification Bell */}
          <button className="relative p-2 text-gray-600 hover:text-primary transition-colors">
            <i className="fas fa-bell text-lg"></i>
            {notification && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-error rounded-full"></span>
            )}
          </button>
          
          {/* User Menu */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <i className="fas fa-user text-white text-sm"></i>
            </div>
            <div className="text-sm">
              <p className="font-medium text-gray-800">Usuário</p>
              <p className="text-gray-600">Proprietário</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};