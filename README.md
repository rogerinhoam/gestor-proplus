# R.M. Estética PRO+ v2.0

Sistema de gestão empresarial completo para estética automotiva desenvolvido em React + TypeScript + Supabase.

## 🚀 Características Principais

- **7 Módulos Funcionais** integrados
- **Arquitetura React** moderna e escalável
- **TypeScript** para type safety
- **Supabase** como backend
- **Sistema de i18n** com 3 idiomas
- **Testes automatizados** com Jest e Cypress
- **CI/CD** com GitHub Actions
- **Interface responsiva** mobile-first

## 📋 Módulos do Sistema

### 1. **Dashboard**
- Métricas em tempo real
- Gráficos de performance
- Alertas importantes
- Últimas atividades

### 2. **Clientes**
- Cadastro completo (CRUD)
- Histórico de serviços
- Cálculo de LTV
- Segmentação por inatividade

### 3. **Orçamentos**
- Criação e gestão
- Workflow de aprovação
- Geração de PDF
- Integração WhatsApp

### 4. **Agenda**
- Calendário semanal/mensal
- Agendamento de serviços
- Controle de disponibilidade
- Lembretes automáticos

### 5. **Financeiro**
- Contas a receber/pagar
- Fluxo de caixa
- Controle de despesas
- Relatórios financeiros

### 6. **CRM**
- Histórico de interações
- Templates WhatsApp (10 tipos)
- Campanhas promocionais
- Follow-up automático

### 7. **Configurações**
- Dados da empresa
- Parâmetros do sistema
- Backup de dados
- Preferências do usuário

## 🛠️ Stack Tecnológica

### Frontend
- **React 18** - Biblioteca principal
- **TypeScript** - Tipagem estática
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **React Router v6** - Navegação
- **Zustand** - Estado global
- **React Hook Form** - Formulários
- **Zod** - Validação

### Backend
- **Supabase** - Backend as a Service
- **PostgreSQL** - Banco de dados
- **Row Level Security** - Segurança

### Integrações
- **Chart.js** - Gráficos
- **jsPDF** - Geração de PDF
- **React i18next** - Internacionalização
- **React Hot Toast** - Notificações

### Testes
- **Jest** - Testes unitários
- **Cypress** - Testes E2E
- **Testing Library** - Utilitários de teste

### DevOps
- **GitHub Actions** - CI/CD
- **ESLint** - Linting
- **Prettier** - Formatação
- **Husky** - Git hooks

## 🔧 Pré-requisitos

- **Node.js** >= 18.0.0
- **npm** >= 8.0.0
- **Git** >= 2.0.0
- **Conta Supabase** ativa

## 📦 Instalação

### 1. Clonar o repositório
```bash
git clone https://github.com/seu-usuario/rm-estetica-pro-plus.git
cd rm-estetica-pro-plus
```

### 2. Instalar dependências
```bash
npm install
```

### 3. Configurar variáveis de ambiente
```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas credenciais:
```env
VITE_SUPABASE_URL=https://sua-url-supabase.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anonima
```

### 4. Configurar banco de dados
Execute o script SQL no Supabase:
```bash
# Acesse o SQL Editor no Supabase
# Cole o conteúdo do arquivo: scripts/supabase-setup.sql
# Execute o script
```

### 5. Inicializar Husky
```bash
npm run prepare
```

## 🚦 Comandos Disponíveis

### Desenvolvimento
```bash
npm run dev          # Iniciar servidor de desenvolvimento
npm run build        # Build para produção
npm run preview      # Preview do build
```

### Qualidade de Código
```bash
npm run lint         # Executar ESLint
npm run format       # Formatar código com Prettier
npm run validate     # Validação completa
```

### Testes
```bash
npm run test         # Testes unitários
npm run test:watch   # Testes em modo watch
npm run test:coverage # Cobertura de testes
npm run cypress:open # Abrir Cypress
npm run cypress:run  # Executar testes E2E
```

### Análise
```bash
npm run analyze      # Análise de bundle
```

## 📁 Estrutura do Projeto

```
rm-estetica-pro-plus/
├── .github/workflows/     # CI/CD workflows
├── .husky/               # Git hooks
├── cypress/              # Testes E2E
├── public/               # Arquivos estáticos
│   └── locales/         # Traduções i18n
├── src/
│   ├── components/      # Componentes reutilizáveis
│   │   ├── ui/         # Componentes base
│   │   ├── layout/     # Layout components
│   │   └── common/     # Componentes comuns
│   ├── features/        # Módulos funcionais
│   │   ├── dashboard/  # Dashboard
│   │   ├── clientes/   # Gestão de clientes
│   │   ├── orcamentos/ # Sistema de orçamentos
│   │   ├── agenda/     # Calendário
│   │   ├── financeiro/ # Controle financeiro
│   │   ├── crm/        # CRM
│   │   └── configuracoes/ # Configurações
│   ├── hooks/           # Hooks customizados
│   ├── services/        # APIs e serviços
│   ├── store/           # Estado global
│   ├── types/           # Tipos TypeScript
│   ├── utils/           # Utilitários
│   └── styles/          # Estilos globais
├── tests/               # Testes unitários
└── docs/               # Documentação
```

## 🌐 Internacionalização

O sistema suporta 3 idiomas:

- **Português (pt-BR)** - Padrão
- **Inglês (en-US)**
- **Espanhol (es-ES)**

### Arquivos de tradução:
```
public/locales/
├── pt-BR/
│   ├── common.json     # Textos gerais
│   ├── whatsapp.json   # Templates WhatsApp
│   └── pdf.json        # Templates PDF
├── en-US/
└── es-ES/
```

### Usar tradução no código:
```typescript
import { useTranslation } from 'react-i18next'

function MeuComponente() {
  const { t } = useTranslation()
  
  return <h1>{t('dashboard.title')}</h1>
}
```

## 📱 Templates WhatsApp

O sistema inclui 10 templates pré-configurados:

1. **Lembrete amigável** (clientes inativos)
2. **Oferta especial** (clientes inativos)
3. **Manutenção** (clientes inativos)
4. **Contato geral**
5. **Promoção da semana**
6. **Serviço sazonal**
7. **Confirmação de agendamento**
8. **Lembrete de agendamento**
9. **Cobrança de pagamento**
10. **Agradecimento pós-serviço**

### Exemplo de uso:
```typescript
import { useWhatsApp } from '@/hooks/useWhatsApp'

function EnviarMensagem() {
  const { sendTemplate } = useWhatsApp()
  
  const handleClick = () => {
    sendTemplate('lembrete_amigavel', {
      nome: 'João',
      tempo: '30 dias'
    })
  }
}
```

## 🗄️ Banco de Dados

### Tabelas principais:
- **clientes** - Dados dos clientes
- **servicos** - Catálogo de serviços
- **orcamentos** - Orçamentos e vendas
- **orcamento_itens** - Itens dos orçamentos
- **agendamentos** - Agenda de serviços
- **despesas** - Controle de gastos
- **contas_receber** - Contas a receber
- **crm_interactions** - Interações CRM
- **configuracoes_sistema** - Configurações

### Relacionamentos:
```sql
clientes (1:N) orcamentos
orcamentos (1:N) orcamento_itens
servicos (1:N) orcamento_itens
clientes (1:N) agendamentos
clientes (1:N) crm_interactions
```

## 🔐 Segurança

### Row Level Security (RLS)
```sql
-- Exemplo de política RLS
CREATE POLICY "Acesso público" ON clientes
  FOR ALL USING (true);
```

### Validação de dados
```typescript
import { z } from 'zod'

const clienteSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  telefone: z.string().regex(/^\(\d{2}\)\s\d{4,5}-\d{4}$/, 'Formato inválido'),
  placa: z.string().regex(/^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/, 'Placa inválida')
})
```

## 🧪 Testes

### Testes unitários (Jest)
```bash
npm run test
```

### Testes E2E (Cypress)
```bash
npm run cypress:open
```

### Cobertura de testes
```bash
npm run test:coverage
```

Target de cobertura: **80%+**

## 🚀 Deploy

### GitHub Pages (automático)
```bash
git push origin main
# Deploy automático via GitHub Actions
```

### Vercel
```bash
npm install -g vercel
vercel --prod
```

### Netlify
```bash
npm run build
# Upload pasta dist/ para Netlify
```

## 📊 Monitoramento

### Métricas de performance
- **Lighthouse Score**: 90+
- **Core Web Vitals**: Aprovado
- **Bundle Size**: < 1MB
- **Load Time**: < 2s

### Ferramentas de monitoramento
- **Sentry** - Error tracking
- **Google Analytics** - Análise de uso
- **Hotjar** - Heatmaps (opcional)

## 🔄 Versionamento

Usamos **Semantic Versioning** (SemVer):
- **MAJOR**: Mudanças incompatíveis
- **MINOR**: Novas funcionalidades
- **PATCH**: Correções de bugs

### Conventional Commits
```bash
feat(clientes): adiciona validação de telefone
fix(dashboard): corrige cálculo de métricas
docs: atualiza README
```

## 🤝 Contribuição

1. **Fork** do projeto
2. **Clone** do fork
3. **Branch** para feature: `git checkout -b feature/nova-funcionalidade`
4. **Commit**: `git commit -m 'feat: adiciona nova funcionalidade'`
5. **Push**: `git push origin feature/nova-funcionalidade`
6. **Pull Request**

### Padrões de código
- **ESLint** configurado
- **Prettier** para formatação
- **TypeScript** obrigatório
- **Testes** para novas funcionalidades

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 🆘 Suporte

### Documentação
- **Wiki**: [GitHub Wiki](https://github.com/seu-usuario/rm-estetica-pro-plus/wiki)
- **Issues**: [GitHub Issues](https://github.com/seu-usuario/rm-estetica-pro-plus/issues)

### Contato
- **Email**: suporte@rmestetica.com
- **WhatsApp**: (24) 99948-6232
- **Discord**: [Servidor da comunidade](https://discord.gg/rmestetica)

## 🏆 Créditos

### Desenvolvido por
- **R.M. Estética Automotiva**
- **Versão**: 2.0.0
- **Data**: Julho 2025

### Tecnologias utilizadas
- React Team
- Supabase Team
- Vercel Team
- Comunidade Open Source

---

## 🎯 Próximos Passos

### Roadmap v2.1
- [ ] Integração WhatsApp Business API
- [ ] Payment Gateway (PIX/Cartão)
- [ ] Relatórios avançados
- [ ] Dashboard executivo
- [ ] App mobile (React Native)

### Roadmap v2.2
- [ ] Integração com redes sociais
- [ ] Sistema de fidelidade
- [ ] Marketplace de serviços
- [ ] AI para recomendações
- [ ] Analytics avançados

---

**R.M. Estética PRO+ v2.0** - Sistema completo de gestão para estética automotiva