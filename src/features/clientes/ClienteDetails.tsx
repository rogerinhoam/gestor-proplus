// src/features/clientes/ClienteDetails.tsx
import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { Cliente, Orcamento } from '../../types';
import { formatTelefone, formatCurrency } from '../../utils/formatting';
import { orcamentosService } from '../orcamentos/orcamentosService';

interface ClienteDetailsProps {
  cliente: Cliente;
  onEdit: () => void;
  onClose: () => void;
}

export const ClienteDetails: React.FC<ClienteDetailsProps> = ({
  cliente,
  onEdit,
  onClose
}) => {
  const [orcamentos, setOrcamentos] = useState<Orcamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalOrcamentos: 0,
    totalGasto: 0,
    servicosFinalizados: 0,
    ultimoServico: null as Date | null
  });

  useEffect(() => {
    fetchClienteStats();
  }, [cliente.id]);

  const fetchClienteStats = async () => {
    try {
      setLoading(true);
      const clienteOrcamentos = await orcamentosService.getByClienteId(cliente.id);
      
      const totalOrcamentos = clienteOrcamentos.length;
      const servicosFinalizados = clienteOrcamentos.filter(o => o.status === 'Finalizado').length;
      const totalGasto = clienteOrcamentos
        .filter(o => o.status === 'Finalizado')
        .reduce((sum, o) => sum + (o.valor_total || 0), 0);

      const orcamentosFinalizados = clienteOrcamentos
        .filter(o => o.status === 'Finalizado')
        .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());

      const ultimoServico = orcamentosFinalizados.length > 0 
        ? new Date(orcamentosFinalizados[0].updated_at)
        : null;

      setStats({
        totalOrcamentos,
        totalGasto,
        servicosFinalizados,
        ultimoServico
      });

      setOrcamentos(clienteOrcamentos);
    } catch (error) {
      console.error('Erro ao carregar estatísticas do cliente:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsApp = () => {
    if (cliente.telefone) {
      const phoneNumber = cliente.telefone.replace(/\D/g, '');
      const message = `Olá ${cliente.nome}, tudo bem?`;
      window.open(`https://wa.me/55${phoneNumber}?text=${encodeURIComponent(message)}`, '_blank');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Finalizado':
        return 'text-green-600 bg-green-100';
      case 'Aprovado':
        return 'text-blue-600 bg-blue-100';
      case 'Orçamento':
        return 'text-yellow-600 bg-yellow-100';
      case 'Cancelado':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white font-bold text-2xl mr-4">
            {cliente.nome?.charAt(0)?.toUpperCase() || '?'}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{cliente.nome}</h2>
            <p className="text-gray-500">
              Cliente desde {new Date(cliente.created_at).toLocaleDateString('pt-BR')}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={onEdit} icon="edit">
            Editar
          </Button>
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
        </div>
      </div>

      {/* Informações Pessoais */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Informações Pessoais</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome Completo
              </label>
              <p className="text-gray-900">{cliente.nome}</p>
            </div>

            {cliente.telefone && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telefone
                </label>
                <div className="flex items-center gap-2">
                  <p className="text-gray-900">{formatTelefone(cliente.telefone)}</p>
                  <Button
                    variant="success"
                    size="small"
                    onClick={handleWhatsApp}
                    icon="whatsapp"
                  >
                    WhatsApp
                  </Button>
                </div>
              </div>
            )}

            {cliente.carro && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Veículo
                </label>
                <p className="text-gray-900">{cliente.carro}</p>
              </div>
            )}

            {cliente.placa && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Placa
                </label>
                <p className="text-gray-900 font-mono">{cliente.placa}</p>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <div className="p-4 text-center">
            <div className="text-3xl font-bold text-primary mb-2">
              {stats.totalOrcamentos}
            </div>
            <div className="text-sm text-gray-600">
              Total de Orçamentos
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-4 text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {stats.servicosFinalizados}
            </div>
            <div className="text-sm text-gray-600">
              Serviços Finalizados
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-4 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {formatCurrency(stats.totalGasto)}
            </div>
            <div className="text-sm text-gray-600">
              Total Gasto (LTV)
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-4 text-center">
            <div className="text-lg font-bold text-gray-900 mb-2">
              {stats.ultimoServico 
                ? stats.ultimoServico.toLocaleDateString('pt-BR')
                : 'Nunca'
              }
            </div>
            <div className="text-sm text-gray-600">
              Último Serviço
            </div>
          </div>
        </Card>
      </div>

      {/* Histórico de Orçamentos */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Histórico de Orçamentos</h3>
          
          {loading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : orcamentos.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Nenhum orçamento encontrado
            </div>
          ) : (
            <div className="space-y-3">
              {orcamentos.map(orcamento => (
                <div key={orcamento.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(orcamento.status)}`}>
                        {orcamento.status}
                      </span>
                      <span className="text-sm text-gray-500">
                        {new Date(orcamento.created_at).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {orcamento.orcamento_itens?.length || 0} itens
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      {formatCurrency(orcamento.valor_total || 0)}
                    </p>
                    {orcamento.desconto && (
                      <p className="text-sm text-green-600">
                        {orcamento.desconto}% desconto
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};
