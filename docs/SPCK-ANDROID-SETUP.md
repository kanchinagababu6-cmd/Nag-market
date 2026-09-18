# SPCK Editor: Android setup

## Step 1 — Extract the ZIP

Download `supermarket-platform-v3-spck-vercel.zip` to your Android device and extract it.

The project root must be:

`supermarket-platform-v3/`

Inside it you should see:
- `app/`
- `lib/`
- `prisma/`
- `package.json`
- `.env.example`
- `README.md`

## Step 2 — Open in SPCK

In SPCK Editor:
1. Open the project/workspace menu.
2. Choose the extracted `supermarket-platform-v3` folder.
3. Confirm the root contains `package.json`.

Do not move individual folders out of the project.

## Step 3 — GitHub

Create a new private GitHub repository.

In SPCK, connect the project to that repository using SPCK's Git features. If SPCK asks for authentication, use GitHub authentication/token according to the current SPCK UI.

Commit the project and push it.

## Step 4 — Vercel

Import the GitHub repository into Vercel. Vercel will build the Next.js application.

## Step 5 — PostgreSQL

Create a hosted PostgreSQL database and put its connection string into Vercel as `DATABASE_URL`.

## Step 6 — Firebase

Create a Firebase project and a Web App. Put the Firebase web configuration values into the `NEXT_PUBLIC_FIREBASE_*` variables in Vercel.

Enable:
- Authentication
- Storage

Use server-side Firebase Admin credentials only in Vercel environment variables. Never put a private key in GitHub.

## Step 7 — Database migration

For a production database, run:

`npx prisma migrate deploy`

If your hosting workflow cannot run that command directly, use a secure CI/CD migration step. Do not expose database credentials in the browser.

## Step 8 — Continue modules

After the foundation is deployed, add:
- Customer authentication/profile/addresses
- Cart and checkout UI
- Coupons/offers
- Full admin CRUD
- POS
- Returns/refunds
- Supplier/purchases
- Delivery slots/areas
- GST/HSN calculations
- Reports/CSV/PDF
- Notifications
- Loyalty
- Audit logs
- Payment gateway integration
- Firebase Storage product uploads
- Role-based route protection
