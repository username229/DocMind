# DocMind

DocMind é uma app web para análise inteligente de documentos (resumo, explicação, sugestões e versão melhorada).

## Requisitos

- Node.js 20+
- npm 10+

## Configuração rápida

1. Clone o projeto
2. Crie `.env` baseado em `.env.example`
3. Instale dependências
4. Rode em dev

```bash
npm install --include=dev --no-audit --no-fund
npm run dev
```

## Variáveis obrigatórias

Sem estas variáveis, login/cadastro ficam desativados:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## Build

```bash
npm run build
```

## Notas de estabilidade (ambiente Elaine)

- Preferir executar projetos em `D:\openclaw\projects`
- Definir cache npm em `D:\openclaw\npm-cache`
- Se instalação quebrar por interrupção, reinstalar com:

```bash
npm install --include=dev --no-audit --no-fund
```
