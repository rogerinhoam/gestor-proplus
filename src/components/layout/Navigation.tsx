import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAppStore } from '../../store';

interface NavItem {
  path: string;
  label: string;
  icon: string;
  count?: number;
}

export const Navigation: React.FC = () => {
  const location = useLocation();
  const { clientes, orcamentos, agendamentos } = useAppStore();
  
  const pendingOrcamentos = orcamentos.filter(o => o.status === 'Orçamento').length;
  const todayAgendamentos = agendamentos.filter(a => {
    const today = new Date().toISOString().split('T')[0];
    return a.data_hora.split('T')[0] === today;
  }).length;

  const navItems: NavItem[] = [
    { path: '/', label: 'Dashboard', icon: 'fa-chart-line' },
    { path: '/clientes', label: 'Clientes', icon: 'fa-users', count: clientes.length },
    { path: '/orcamentos', label: 'Orçamentos', icon: 'fa-file-invoice', count: pendingOrcamentos },
    { path: '/agenda', label: 'Agenda', icon: 'fa-calendar', count: todayAgendamentos },
    { path: '/financeiro', label: 'Financeiro', icon: 'fa-dollar-sign' },
    { path: '/crm', label: 'CRM', icon: 'fa-phone' },
    { path: '/configuracoes', label: 'Configurações', icon: 'fa-cog' }
  ];

  return (
    <nav className="bg-white shadow-lg w-64 flex-shrink-0">
      <div className="p-4">
        <div className="flex items-center mb-8">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <i className="fas fa-car text-white"></i>
          </div>
          <div className="ml-3">
            <h1 className="text-lg font-bold text-gray-800">R.M. Estética</h1>
            <p className="text-sm text-gray-600">Gestor PRO+ v2.0</p>
          </div>
        </div>
        
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center px-4 py-3 rounded-lg transition-all duration-200 group ${
                    isActive
                      ? 'bg-primary text-white shadow-lg'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-primary'
                  }`
                }
              >
                <i className={`fas ${item.icon} w-5 text-center`}></i>
                <span className="ml-3 font-medium">{item.label}</span>
                {item.count !== undefined && item.count > 0 && (
                  <span className="ml-auto bg-error text-white text-xs font-bold px-2 py-1 rounded-full">
                    {item.count}
                  </span>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
      
      {/* User Section */}
      <div className="absolute bottom-0 w-full p-4 border-t bg-gray-50">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
            <i className="fas fa-user text-white text-sm"></i>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-800">Usuário</p>
            <p className="text-xs text-gray-600">Proprietário</p>
          </div>
        </div>
      </div>
    </nav>
  );
};