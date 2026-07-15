# Política de segurança

## Risco atual

O aplicativo executa operações de leitura, criação, atualização e exclusão diretamente do navegador. Uma chave Supabase `anon`/`publishable` é adequada para frontend somente quando todas as tabelas possuem políticas RLS corretas. A interface do navegador não é uma fronteira de segurança.

Tabelas observadas no aplicativo incluem:

- `clientes`
- `servicos`
- `orcamentos`
- `orcamento_itens`
- `despesas`
- `crm_interactions`
- `crm_tasks`
- `agendamentos`
- `configuracoes`

## Antes de produção

1. Implemente Supabase Auth e exija uma sessão válida antes de carregar dados administrativos.
2. Habilite RLS em todas as tabelas.
3. Negue acesso anônimo por padrão.
4. Crie políticas por usuário ou organização; não use uma política ampla baseada apenas em `anon`.
5. Restrinja tabelas com clientes, telefones, despesas e CRM a usuários autorizados.
6. Valide permissões no banco para `insert`, `update` e `delete`, não apenas nos botões da interface.
7. Confirme que a chave do frontend não é `service_role`.
8. Teste cada operação com sessão anônima, usuário comum e administrador.
9. Ative logs e monitore consultas ou alterações anormais.

## Credenciais publicadas

Se uma chave privada, senha ou `service_role` já entrou no histórico Git, revogue e rotacione a credencial. Remover o texto do commit atual não elimina o segredo do histórico.

## Relato responsável

Não publique dados pessoais, tokens ou detalhes de exploração em issues. Contate o mantenedor diretamente.
