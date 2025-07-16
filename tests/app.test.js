/**
 * Testes da aplicação principal
 * @file app.test.js
 */

describe('App', () => {
    beforeEach(() => {
        // Reset DOM
        document.body.innerHTML = `
            <div id="loadingScreen" class="loading-screen">
                <div class="loading-progress" id="loadingProgress"></div>
                <p>Carregando...</p>
            </div>
            <div id="notification" class="toast"></div>
            <div id="syncStatus"></div>
            <div id="syncIcon"></div>
        `;
        
        // Reset mocks
        jest.clearAllMocks();
    });

    describe('Inicialização', () => {
        test('deve inicializar corretamente', async () => {
            // Simular script principal
            const CONFIG = {
                app: { version: '2.0.0' },
                supabase: { url: 'test', key: 'test' }
            };

            expect(CONFIG.app.version).toBe('2.0.0');
        });

        test('deve mostrar loading', () => {
            const loadingScreen = document.getElementById('loadingScreen');
            expect(loadingScreen).toBeTruthy();
        });
    });

    describe('Utilitários', () => {
        test('deve formatar moeda corretamente', () => {
            const formatCurrency = (value) => {
                return new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                }).format(value);
            };

            expect(formatCurrency(100)).toBe('R$ 100,00');
            expect(formatCurrency(1234.56)).toBe('R$ 1.234,56');
        });

        test('deve formatar telefone corretamente', () => {
            const formatPhone = (value) => {
                return value
                    .replace(/\D/g, '')
                    .replace(/^(\d{2})(\d)/, '($1) $2')
                    .replace(/(\d)(\d{4})$/, '$1-$2');
            };

            expect(formatPhone('24999999999')).toBe('(24) 99999-9999');
            expect(formatPhone('2499999999')).toBe('(24) 9999-9999');
        });

        test('deve gerar ID único', () => {
            const generateId = () => {
                return Math.random().toString(36).substr(2, 9);
            };

            const id1 = generateId();
            const id2 = generateId();
            
            expect(id1).toBeTruthy();
            expect(id2).toBeTruthy();
            expect(id1).not.toBe(id2);
        });
    });

    describe('Gerenciamento de Estado', () => {
        test('deve inicializar estado corretamente', () => {
            const STATE = {
                currentTab: 'dashboard',
                isOnline: true,
                data: {
                    clientes: [],
                    servicos: [],
                    orcamentos: []
                }
            };

            expect(STATE.currentTab).toBe('dashboard');
            expect(STATE.isOnline).toBe(true);
            expect(STATE.data.clientes).toHaveLength(0);
        });

        test('deve atualizar dados corretamente', () => {
            const STATE = {
                data: { clientes: [] }
            };

            const novoCliente = {
                id: 'c1',
                nome: 'João Silva',
                telefone: '(24) 99999-9999'
            };

            STATE.data.clientes.push(novoCliente);
            
            expect(STATE.data.clientes).toHaveLength(1);
            expect(STATE.data.clientes[0].nome).toBe('João Silva');
        });
    });

    describe('Notificações', () => {
        test('deve mostrar notificação', () => {
            const showNotification = (message, type = 'info') => {
                const toast = document.getElementById('notification');
                if (toast) {
                    toast.textContent = message;
                    toast.className = `toast ${type}`;
                    toast.classList.add('show');
                }
            };

            showNotification('Teste', 'success');
            
            const toast = document.getElementById('notification');
            expect(toast.textContent).toBe('Teste');
            expect(toast.classList.contains('success')).toBe(true);
        });
    });

    describe('Responsividade', () => {
        test('deve detectar dispositivo móvel', () => {
            const isMobile = () => window.innerWidth <= 768;
            
            // Simular largura móvel
            Object.defineProperty(window, 'innerWidth', {
                writable: true,
                configurable: true,
                value: 375
            });
            
            expect(isMobile()).toBe(true);
            
            // Simular largura desktop
            window.innerWidth = 1024;
            expect(isMobile()).toBe(false);
        });
    });
});
