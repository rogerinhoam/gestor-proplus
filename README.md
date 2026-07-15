# Gestor ProPlus

Painel web para gestão de serviços automotivos, com clientes, serviços, orçamentos, despesas, CRM, agenda, relatórios e exportação de documentos.

## Tecnologias

- HTML, CSS e JavaScript
- Supabase para dados em tempo real
- Chart.js para gráficos
- jsPDF e AutoTable para documentos
- Ace para edição de conteúdo

## Execução local

Sirva a pasta por HTTP:

```bash
python -m http.server 8000
```

Depois, acesse `http://localhost:8000`.

## Aviso de segurança

O frontend acessa diretamente tabelas do Supabase. Não foi identificado no código atual um fluxo de autenticação antes das operações administrativas. **Não use dados reais nem publique o sistema antes de configurar autenticação e Row Level Security (RLS).**

A URL do Supabase e uma chave `anon`/`publishable` são públicas em aplicações de navegador. Elas não devem ser tratadas como senha. O controle de leitura, criação, alteração e exclusão precisa existir nas políticas do banco.

Leia [SECURITY.md](SECURITY.md) e valide todos os controles antes de produção.

## Estrutura

- `index.html`: interface, regras do cliente, relatórios e integração com Supabase.

## Licença

Adicione uma licença explícita antes de aceitar contribuições externas.
