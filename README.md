# Dashboard de Treinamentos

Dashboard interativo para acompanhamento de treinamentos operacionais.

## Base central online

O painel usa uma base central no **Vercel Blob**. Quando alguém publica uma nova planilha pelo botão do dashboard, ela substitui a versão anterior. Qualquer pessoa que abrir o mesmo link passa a visualizar a última base publicada.

Para ativar a base central no projeto Vercel:

1. Abra o projeto na Vercel.
2. Vá em **Storage > Create > Blob**.
3. Crie um Blob com acesso **Private**.
4. Conecte esse Blob ao projeto do dashboard.
5. Aguarde/republique o deployment mais recente.

O projeto usa a autenticação fornecida pela própria Vercel ao Blob conectado.

## Recursos

- Filtros por situação, responsável e local
- Gráficos clicáveis
- Detalhamento das ações
- Importação de Excel/CSV
- Base única compartilhada entre todos os usuários do link
