# Rewrites & Redirects — AWS Amplify (React SPA)

Se sua aplicação é uma SPA (React Router) hospedada no AWS Amplify, configure uma regra de rewrite para que todas as rotas públicas sejam servidas pelo `index.html` em vez de retornarem 404.

Passos (Console AWS Amplify):

1. Abra o Console da AWS e selecione o App no Amplify.
2. No menu lateral, vá em "Hosting" → "Rewrites and redirects" (Redirecionamentos e regravações).
3. Clique em "Edit" e adicione a seguinte regra padrão para SPAs:

- Source address (Endereço de origem): </^[^.]+$|\.(?!(css|gif|ico|jpg|js|png|txt|svg|woff|woff2|ttf|map|json)$)([^.]+$)/>
- Target address (Endereço de destino): `/index.html`
- Type (Tipo): `200 (Rewrite)`
- Priority: `1` (ou o menor número disponível)

4. Salve as alterações.

Observações:
- Essa regra garante que requisições diretas a rotas do React não resultem em 404 no S3/CloudFront.
- Se você também hospeda APIs no mesmo domínio, não use o mesmo caminho `/auth` para frontend — prefira colocar APIs em um subdomínio ou em um endpoint externo (ex: `api.example.com`) e aponte `VITE_API_BASE_URL` para esse backend.

Exemplo de problema comum:
- Errado: `VITE_API_BASE_URL=https://meu-app-amplify.amplifyapp.com` → chamadas `POST /auth/login` baterão no frontend e darão 404.
- Certo: `VITE_API_BASE_URL=https://api.minhaempresa.com/ms-usuario` → chamadas irão para o backend real.

Se preferir, eu posso gerar um `amplify-backend-instructions.txt` pronto para colar no console, ou aplicar mudanças no código-fonte para usar variáveis (já atualizei `src/config/api.config.js`).