import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navigation } from './Navigation';
import { Header } from './Header';
import { Footer } from './Footer';
import { Notification } from '../ui/Notification';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { useAppStore } from '../../store';

export const MainLayout: React.FC = () => {
  const { loading, notification } = useAppStore();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <Header />
      
      {/* Main Content */}
      <div className="flex flex-1">
        {/* Navigation Sidebar */}
        <Navigation />
        
        {/* Content Area */}
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto px-4 py-6">
            {loading && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <LoadingSpinner size="large" />
              </div>
            )}
            
            <Outlet />
          </div>
        </main>
      </div>
      
      {/* Footer */}
      <Footer />
      
      {/* Notification System */}
      {notification && (
        <Notification
          type={notification.type}
          message={notification.message}
          onClose={() => useAppStore.getState().clearNotification()}
        />
      )}
    </div>
  );
};