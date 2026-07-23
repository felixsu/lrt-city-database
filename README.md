# LRT City Tebet Customer — CMS

Customer database CMS for the LRT City Tebet Customer organization, built with
Next.js (App Router), Prisma/PostgreSQL, Auth.js (Google SSO), and Cloudinary.

## Pages

- **Home** (public) — About (markdown), How to Join (markdown, supports
  mermaid diagrams via a ` ```mermaid ` fenced code block), and a Timeline of
  events (title, picture, description).
- **Users** (public, read-only) — Customer records with sensitive fields
  masked: name shows only the last 3 characters, contact number shows only
  the first 4 and last 4 characters. Each user can have multiple PPJB
  accounts, each with photos, an assigned LRT City building, remarks, buy
  date, and join date.
- **Administrative** (protected) — Edit Home content, manage buildings, manage
  the Timeline, and full CRUD on Users/PPJB/photos.

## Admin access

Admins sign in with Google. There are no admin accounts by default — the
first person to sign in with **`felix.soewito@gmail.com`** is automatically
bootstrapped as the first admin (`SUPER_ADMIN`). From the **Administrative →
Admins** page, that admin can grant admin access to other Google accounts by
email. Anyone else who tries to sign in is denied.

## Photo handling

PPJB and timeline photos are uploaded to Cloudinary. On upload, the server
resizes to a max of 2000px on the longest side and iteratively lowers the
encoding quality until the stored asset is under 100KB (`src/lib/cloudinary.ts`).

## Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Copy `.env.example` to `.env` and fill in the values:

```bash
cp .env.example .env
```

- `DATABASE_URL` — PostgreSQL connection string.
- `AUTH_SECRET` — generate with `npx auth secret`.
- `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` — from a Google Cloud OAuth client.
  Add `<your-app-url>/api/auth/callback/google` as an authorized redirect URI
  (e.g. `http://localhost:3000/api/auth/callback/google` for local dev).
- `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` —
  from your Cloudinary dashboard.

### 3. Set up the database

```bash
npx prisma migrate deploy   # apply migrations
npx prisma generate         # generate the Prisma client (also runs on install)
```

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Sign in as an admin at
`/login` using the bootstrap email above, then visit `/admin`.

## Tech stack

- Next.js (App Router, TypeScript, Tailwind CSS v4)
- PostgreSQL + Prisma ORM
- Auth.js (NextAuth v5) with Google provider, JWT sessions
- Cloudinary for image storage/compression
- react-markdown + remark-gfm + mermaid for rich Home page content
