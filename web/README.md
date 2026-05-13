# AcquaVille Residencial — Site de vendas

Plataforma de vendas do primeiro condomínio fechado de Santana, BA.
Landing institucional + **planta interativa** + **simulador de compra**
com captação de leads + **painel admin** para gerenciar lotes e CRM.

Construído com as skills `frontend-design`, `motion-framer`,
`gsap-scrolltrigger` e `avinyc:web-design` instaladas globalmente.

## Stack

- **Next.js 16** (App Router, React 19, Turbopack)
- **TypeScript** estrito
- **Tailwind CSS v4** com design tokens
- **Motion 12** (Framer Motion) para reveal, hover, modais
- **Lenis** smooth scroll
- **JSON file store** (`data/leads.json`, `data/lots.json`) — substituir por Postgres+Prisma em produção
- Auth admin via cookie assinado HMAC

## Rodar local

```bash
cd web
npm install
npm run dev
# abra http://localhost:3000
```

### Variáveis de ambiente

Opcional, mas recomendado antes do deploy:

```bash
ADMIN_PASSWORD=sua-senha-forte
ADMIN_SECRET=alguma-string-aleatoria-longa
```

Sem essas, vale o padrão de dev: senha `acqua2025`.

## Rotas

| Rota              | Descrição                                                |
| ----------------- | -------------------------------------------------------- |
| `/`               | Landing institucional + planta interativa + simulador   |
| `/admin`          | Painel administrativo (login + CRM + gerenciar lotes)   |
| `POST /api/leads` | Captura lead do simulador ou formulário de contato      |
| `POST /api/admin/login`   | Login admin (cookie sessão 8h)                  |
| `DELETE /api/admin/login` | Logout                                          |
| `POST /api/admin/lots`    | Atualiza status de lote ou lead (autenticado)   |

## Arquitetura

```
web/
├── app/
│   ├── page.tsx              landing principal (server component)
│   ├── layout.tsx            fontes globais + metadados
│   ├── globals.css           design tokens AcquaVille
│   ├── admin/page.tsx        painel (auth-gated)
│   └── api/                  route handlers
├── components/
│   ├── Hero.tsx              hero + reveal por palavra
│   ├── SitePlan.tsx          SVG interativo dos 128 lotes
│   ├── LotDetail.tsx         modal com simulador 3 passos
│   ├── Features.tsx          scroll-driven feature list
│   ├── Location.tsx          minimapa SVG
│   ├── Contact.tsx           formulário de catálogo
│   ├── Footer.tsx
│   ├── SmoothScroll.tsx      wrapper Lenis
│   ├── AdminLogin.tsx
│   ├── AdminDashboard.tsx    tabs Leads | Lotes
│   └── Wordmark.tsx
├── lib/
│   ├── lots.ts               modelo: 11 quadras, 128 lotes, geometry
│   ├── store.ts              persistência JSON
│   └── auth.ts               cookie HMAC
└── data/                     (gerado em runtime, ignorado pelo git)
    ├── leads.json
    └── lots.json
```

## Próximos passos (não no MVP)

- [ ] Trocar JSON store por Postgres + Prisma
- [ ] Envio de e-mail/WhatsApp ao receber lead (Resend, Twilio)
- [ ] Galeria de imagens (renderings, masterplan)
- [ ] Tour 360° por lote
- [ ] Webhook para CRM externo (RD Station, Pipedrive)
- [ ] Painel de métricas (heatmap dos lotes mais clicados)
- [ ] Acesso multi-usuário com papéis (corretor, gerente, admin)
