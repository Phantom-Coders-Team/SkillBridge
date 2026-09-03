# Skill Bridge

A unified collaboration portal connecting students, faculty, industry partners, and Training & Placement Officers (TPOs) for skill development, capstone projects, mentorship, and placements.

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Database:** SQLite (local) / PostgreSQL (production via Vercel Postgres)
- **ORM:** Prisma
- **Auth:** JWT + bcrypt (httpOnly cookie)
- **Styling:** Tailwind CSS v4
- **AI (optional):** Google Gemini 1.5 Flash for syllabus audit
- **Charts:** Recharts
- **QR Codes:** qrcode (SVG)

## Roles

| Role | Key Features |
|------|-------------|
| **Student** | Dashboard, projects, challenges, proof of work, skills, tokens, mentors, reverse placement |
| **Faculty** | Dashboard, projects, challenges, R&D lab units, dual grading, syllabus audit, sabbaticals |
| **Industry** | Dashboard, challenges, dual grading, mentor slots, job pitches, reverse placement, sabbaticals |
| **TPO** | Dashboard, placements, skill heatmap, reverse placement, partners, analytics |

## Key Features

- **Placement Readiness Index (PRI):** Composite 0-1000 score aggregating skills, projects, proofs of work, dual grading, tokens, and challenge completions. At 850+ points, reverse placement unlocks where recruiters pitch directly to students.
- **Verifiable Proof of Work:** Dual sign-off workflow (faculty + industry) with public QR verification badges.
- **Skill Decay Engine:** Skills tracked with temporal decay (ACTIVE > STALE > EXPIRED) encouraging re-certification.
- **AI-Powered Syllabus Audit:** Pattern-matching engine detects outdated academic topics, augmented by Gemini LLM when configured.
- **Dual Grading:** Two-dimensional evaluation of lab unit work (academic marks + job readiness scores).
- **Token Economy:** Students earn and spend skill tokens for mentorship sessions, code clinics, and other services.
- **Challenge Marketplace:** Industry partners post capstone, R&D, and micro-consultancy challenges for student teams.

## Getting Started

```bash
npm install
npx prisma migrate dev
npm run db:seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Use the demo login buttons to sign in as any role (password: `Password@123`).

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | Prisma database URL |
| `JWT_SECRET` | Yes | Secret for JWT token signing |
| `NEXT_PUBLIC_BASE_URL` | Yes | App base URL (e.g. `https://your-app.vercel.app`) |
| `GEMINI_API_KEY` | No | Google Gemini API key for AI syllabus audit |

## Deploy on Vercel

1. Import the project into Vercel.
2. Add environment variables in the Vercel dashboard (`POSTGRES_PRISMA_URL`, `POSTGRES_URL_NON_POOLING`, `JWT_SECRET`, `NEXT_PUBLIC_BASE_URL`).
3. In Vercel Postgres, create a database and copy the Prisma URL values.
4. Trigger a deployment.

See the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
