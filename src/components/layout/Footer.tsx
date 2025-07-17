import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-gray-200 py-4 px-6">
      <div className="flex justify-between items-center">
        {/* Left Side - Company Info */}
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-600">
            <span className="font-medium">R.M. Estética Automotiva</span>
            <span className="mx-2">•</span>
            <span>CNPJ: 18.637.639/0001-48</span>
          </div>
        </div>
        
        {/* Center - Contact Info */}
        <div className="flex items-center space-x-6 text-sm text-gray-600">
          <div className="flex items-center space-x-2">
            <i className="fas fa-phone text-primary"></i>
            <span>(24) 99948-6232</span>
          </div>
          <div className="flex items-center space-x-2">
            <i className="fas fa-map-marker-alt text-primary"></i>
            <span>Angra dos Reis - RJ</span>
          </div>
        </div>
        
        {/* Right Side - System Info */}
        <div className="flex items-center space-x-4 text-sm text-gray-600">
          <div className="flex items-center space-x-2">
            <i className="fas fa-code text-primary"></i>
            <span>Versão 2.0.0</span>
          </div>
          <div className="flex items-center space-x-2">
            <i className="fas fa-calendar text-primary"></i>
            <span>© 2025</span>
          </div>
        </div>
      </div>
    </footer>
  );
};