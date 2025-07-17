// src/features/orcamentos/advanced/SearchBar.tsx
import React, { useState, useEffect } from 'react';
import { Input } from '../../../components/ui/Input';
import { useDebounce } from '../../../hooks/useDebounce';

interface SearchBarProps {
  onSearch: (term: string) => void;
  placeholder?: string;
  className?: string;
}

/**
 * Barra de busca com debounce para orçamentos.
 * Suporta busca por: cliente, placa, serviço, status
 */
export const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  placeholder = "Buscar por cliente, placa, serviço ou status...",
  className = ""
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  useEffect(() => {
    onSearch(debouncedSearchTerm);
  }, [debouncedSearchTerm, onSearch]);

  const handleClear = () => {
    setSearchTerm('');
  };

  return (
    <div className={`relative ${className}`}>
      <Input
        type="text"
        placeholder={placeholder}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        icon="search"
        className="w-full"
      />
      
      {searchTerm && (
        <button
          onClick={handleClear}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          type="button"
        >
          <i className="fas fa-times"></i>
        </button>
      )}
      
      {/* Indicador de busca ativa */}
      {debouncedSearchTerm && (
        <div className="absolute top-full left-0 right-0 bg-blue-50 border border-blue-200 rounded-b-lg px-3 py-2 text-sm text-blue-700">
          <i className="fas fa-search mr-2"></i>
          Buscando por: "{debouncedSearchTerm}"
        </div>
      )}
    </div>
  );
};

// Hook para filtrar orçamentos baseado no termo de busca
export const useOrcamentosSearch = (orcamentos: any[], searchTerm: string) => {
  return React.useMemo(() => {
    if (!searchTerm.trim()) {
      return orcamentos;
    }

    const term = searchTerm.toLowerCase();
    
    return orcamentos.filter(orcamento => {
      // Busca no nome do cliente
      const clienteMatch = orcamento.clientes?.nome?.toLowerCase().includes(term);
      
      // Busca na placa do veículo
      const placaMatch = orcamento.clientes?.placa?.toLowerCase().includes(term);
      
      // Busca no modelo do carro
      const carroMatch = orcamento.clientes?.carro?.toLowerCase().includes(term);
      
      // Busca nos serviços
      const servicosMatch = orcamento.orcamento_itens?.some((item: any) => 
        item.descricao_servico?.toLowerCase().includes(term)
      );
      
      // Busca no status
      const statusMatch = orcamento.status?.toLowerCase().includes(term);
      
      // Busca no ID (últimos 8 caracteres)
      const idMatch = orcamento.id?.slice(-8).toLowerCase().includes(term);

      return clienteMatch || placaMatch || carroMatch || servicosMatch || statusMatch || idMatch;
    });
  }, [orcamentos, searchTerm]);
};
