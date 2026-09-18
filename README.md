# Supermarket Management Platform V3

A Vercel-friendly Next.js + Prisma + PostgreSQL + Firebase foundation designed for editing on Android with SPCK Editor.

## Architecture

- Frontend: Next.js App Router
- API: Next.js Route Handlers under `app/api`
- Database: PostgreSQL + Prisma
- Authentication: Firebase Authentication (client) + server-side role records
- Storage: Firebase Storage (ready for product images)
- Hosting: Vercel
- Source control: GitHub
- Editing: SPCK Editor on Android

## Important

This V3 is a deployment-ready foundation, not a claim that every enterprise feature in the original specification is already implemented. It includes the core structure, authentication hooks, product catalog, inventory-aware order creation, role-aware dashboard shells, Prisma schema, seed data, and setup documentation. Build remaining modules incrementally after deployment.

## Demo database users

The seed creates role records for:
- admin@example.com
- cashier@example.com
- delivery@example.com
- customer@example.com

Demo passwords are only for local/test environments if you implement password auth separately. Firebase Authentication should be configured for real users.

## Environment

Copy `.env.example` to `.env.local` for local development.

Required:
- `DATABASE_URL`
- Firebase client variables
- Firebase Admin variables for server verification if enabled

Never commit `.env.local` or private Firebase service-account credentials.

## Local development

```bash
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run db:seed
npm run dev
```

## Vercel

1. Push this repository to GitHub.
2. Import the repository into Vercel.
3. Add the environment variables from `.env.example`.
4. Set the production database URL.
5. Build command: `npm run build`
6. Deploy.

For production migrations, use:
`npx prisma migrate deploy`

## SPCK workflow

Use SPCK for editing:
1. Open the extracted project folder.
2. Edit files.
3. Commit and push to GitHub.
4. Vercel automatically redeploys after a connected GitHub push.

Do not put database passwords, Firebase Admin private keys, or other secrets into source files.
