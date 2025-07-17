import React, { useState } from 'react';
import { Button } from './Button';
import { Input } from './Input';

interface Column {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  render?: (value: any, row: any) => React.ReactNode;
}

interface TableProps {
  data: any[];
  columns: Column[];
  loading?: boolean;
  emptyMessage?: string;
  searchable?: boolean;
  searchPlaceholder?: string;
  paginated?: boolean;
  pageSize?: number;
  className?: string;
  onRowClick?: (row: any) => void;
  actions?: (row: any) => React.ReactNode;
}

export const Table: React.FC<TableProps> = ({
  data,
  columns,
  loading = false,
  emptyMessage = 'Nenhum item encontrado',
  searchable = false,
  searchPlaceholder = 'Buscar...',
  paginated = false,
  pageSize = 10,
  className = '',
  onRowClick,
  actions
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  
  // Filter data based on search term
  const filteredData = searchable 
    ? data.filter(row =>
        Object.values(row).some(value =>
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    : data;
  
  // Sort data
  const sortedData = sortConfig
    ? [...filteredData].sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      })
    : filteredData;
  
  // Paginate data
  const paginatedData = paginated
    ? sortedData.slice((currentPage - 1) * pageSize, currentPage * pageSize)
    : sortedData;
  
  const totalPages = Math.ceil(sortedData.length / pageSize);
  
  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };
  
  const getSortIcon = (key: string) => {
    if (!sortConfig || sortConfig.key !== key) {
      return 'fas fa-sort text-gray-400';
    }
    return sortConfig.direction === 'asc' ? 'fas fa-sort-up text-primary' : 'fas fa-sort-down text-primary';
  };
  
  return (
    <div className={`bg-white rounded-lg shadow-lg ${className}`}>
      {/* Header with search */}
      {searchable && (
        <div className="p-4 border-b border-gray-200">
          <Input
            type="search"
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon="fa-search"
            className="max-w-md"
          />
        </div>
      )}
      
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200 ${
                    column.align === 'center' ? 'text-center' : column.align === 'right' ? 'text-right' : 'text-left'
                  }`}
                  style={{ width: column.width }}
                >
                  {column.sortable ? (
                    <button
                      className="flex items-center space-x-1 hover:text-gray-700"
                      onClick={() => handleSort(column.key)}
                    >
                      <span>{column.label}</span>
                      <i className={getSortIcon(column.key)}></i>
                    </button>
                  ) : (
                    column.label
                  )}
                </th>
              ))}
              {actions && (
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200 text-right">
                  Ações
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={columns.length + (actions ? 1 : 0)} className="px-6 py-12 text-center">
                  <div className="flex items-center justify-center">
                    <i className="fas fa-spinner fa-spin text-primary mr-2"></i>
                    Carregando...
                  </div>
                </td>
              </tr>
            ) : paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (actions ? 1 : 0)} className="px-6 py-12 text-center text-gray-500">
                  <div className="flex flex-col items-center">
                    <i className="fas fa-inbox text-4xl text-gray-300 mb-4"></i>
                    {emptyMessage}
                  </div>
                </td>
              </tr>
            ) : (
              paginatedData.map((row, index) => (
                <tr
                  key={index}
                  className={`hover:bg-gray-50 transition-colors ${onRowClick ? 'cursor-pointer' : ''}`}
                  onClick={() => onRowClick?.(row)}
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={`px-6 py-4 whitespace-nowrap text-sm text-gray-900 ${
                        column.align === 'center' ? 'text-center' : column.align === 'right' ? 'text-right' : 'text-left'
                      }`}
                    >
                      {column.render ? column.render(row[column.key], row) : row[column.key]}
                    </td>
                  ))}
                  {actions && (
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {actions(row)}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      {paginated && totalPages > 1 && (
        <div className="flex items-center justify-between px-6 py-3 border-t border-gray-200">
          <div className="text-sm text-gray-700">
            Mostrando {((currentPage - 1) * pageSize) + 1} a {Math.min(currentPage * pageSize, sortedData.length)} de {sortedData.length} resultados
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="small"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              <i className="fas fa-chevron-left"></i>
            </Button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? 'primary' : 'outline'}
                size="small"
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </Button>
            ))}
            
            <Button
              variant="outline"
              size="small"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              <i className="fas fa-chevron-right"></i>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};