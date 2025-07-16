/**
 * Testes do sistema CRM
 * @file crm.test.js
 */

describe('CRM System', () => {
    let mockData;

    beforeEach(() => {
        mockData = {
            clientes: [
                {
                    id: 'c1',
                    nome: 'João Silva',
                    telefone: '(24) 99999-9999',
                    email: 'joao@email.com'
                }
            ],
            servicos: [
                {
                    id: 's1',
                    descricao: 'Lavagem Completa',
                    valor: 35.00,
                    categoria: 'Lavagem'
                }
            ],
            orcamentos: [
                {
                    id: 'o1',
                    cliente_id: 'c1',
                    valor_total: 35.00,
                    status: 'Finalizado'
                }
            ]
        };
    });

    describe('Gerenciamento de Clientes', () => {
        test('deve adicionar cliente corretamente', () => {
            const novoCliente = {
                id: 'c2',
                nome: 'Maria Santos',
                telefone: '(24) 88888-8888',
                email: 'maria@email.com'
            };

            mockData.clientes.push(novoCliente);
            
            expect(mockData.clientes).toHaveLength(2);
            expect(mockData.clientes[1].nome).toBe('Maria Santos');
        });

        test('deve encontrar cliente por ID', () => {
            const cliente = mockData.clientes.find(c => c.id === 'c1');
            
            expect(cliente).toBeTruthy();
            expect(cliente.nome).toBe('João Silva');
        });

        test('deve validar dados do cliente', () => {
            const validateCliente = (cliente) => {
                return cliente.nome && cliente.nome.trim().length > 0;
            };

            expect(validateCliente({ nome: 'João Silva' })).toBe(true);
            expect(validateCliente({ nome: '' })).toBe(false);
            expect(validateCliente({})).toBe(false);
        });
    });

    describe('Gerenciamento de Serviços', () => {
        test('deve adicionar serviço corretamente', () => {
            const novoServico = {
                id: 's2',
                descricao: 'Enceramento',
                valor: 45.00,
                categoria: 'Proteção'
            };

            mockData.servicos.push(novoServico);
            
            expect(mockData.servicos).toHaveLength(2);
            expect(mockData.servicos[1].descricao).toBe('Enceramento');
        });

        test('deve filtrar serviços por categoria', () => {
            const servicosLavagem = mockData.servicos.filter(s => s.categoria === 'Lavagem');
            
            expect(servicosLavagem).toHaveLength(1);
            expect(servicosLavagem[0].descricao).toBe('Lavagem Completa');
        });
    });

    describe('Gerenciamento de Orçamentos', () => {
        test('deve calcular valor total corretamente', () => {
            const calcularTotal = (itens) => {
                return itens.reduce((total, item) => total + item.valor, 0);
            };

            const itens = [
                { valor: 35.00 },
                { valor: 45.00 }
            ];

            expect(calcularTotal(itens)).toBe(80.00);
        });

        test('deve aplicar desconto corretamente', () => {
            const aplicarDesconto = (valor, desconto) => {
                return valor * (1 - desconto / 100);
            };

            expect(aplicarDesconto(100, 10)).toBe(90);
            expect(aplicarDesconto(50, 5)).toBe(47.5);
        });

        test('deve filtrar orçamentos por status', () => {
            const orcamentosFinalizados = mockData.orcamentos.filter(o => o.status === 'Finalizado');
            
            expect(orcamentosFinalizados).toHaveLength(1);
            expect(orcamentosFinalizados[0].id).toBe('o1');
        });
    });

    describe('Analytics', () => {
        test('deve calcular faturamento total', () => {
            const calcularFaturamento = (orcamentos) => {
                return orcamentos
                    .filter(o => o.status === 'Finalizado')
                    .reduce((total, o) => total + o.valor_total, 0);
            };

            expect(calcularFaturamento(mockData.orcamentos)).toBe(35.00);
        });

        test('deve calcular ticket médio', () => {
            const calcularTicketMedio = (orcamentos) => {
                const finalizados = orcamentos.filter(o => o.status === 'Finalizado');
                const total = finalizados.reduce((sum, o) => sum + o.valor_total, 0);
                return finalizados.length > 0 ? total / finalizados.length : 0;
            };

            expect(calcularTicketMedio(mockData.orcamentos)).toBe(35.00);
        });
    });
});
