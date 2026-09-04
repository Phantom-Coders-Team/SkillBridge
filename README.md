# Skill Bridge

A unified collaboration portal connecting students, faculty, industry partners, and institutions for skill development, capstone projects, mentorship, and placements.

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Database:** SQLite (local) / PostgreSQL (production via Vercel Postgres)
- **ORM:** Prisma
- **Auth:** JWT + bcrypt (httpOnly cookie)
- **Styling:** Tailwind CSS v4
- **Theme:** Dark / Light mode (next-themes)
- **Icons:** Lucide React
- **AI (optional):** Google Gemini 1.5 Flash for syllabus audit
- **Charts:** Recharts
- **QR Codes:** qrcode (SVG)

## Roles

| Role | Key Features |
|------|-------------|
| **Student** | Dashboard, projects, challenges, proof of work, skills, assessments, tokens, mentors, office hours, portfolio, internships, reverse placement |
| **Faculty** | Dashboard, projects, challenges, lab units, dual grading, syllabus audit, faculty portal, sabbaticals |
| **Industry** | Dashboard, challenges, dual grading, mentor slots, job pitches, internships, faculty programs, sabbaticals |
| **Institutions** | Dashboard, placements, skill heatmap, reverse placement, partners, analytics, assessments |

## Key Features

### Core Mechanics
- **Placement Readiness Index (PRI):** Composite 0-1000 score aggregating skills, projects, proofs of work, dual grading, tokens, and challenge completions. At 850+ points, reverse placement unlocks where recruiters pitch directly to students.
- **Verifiable Proof of Work:** Dual sign-off workflow (faculty + industry) with public QR verification badges.
- **Skill Decay Engine:** Skills tracked with temporal decay (ACTIVE > STALE > EXPIRED) encouraging re-certification.
- **Dual Grading:** Two-dimensional evaluation of lab unit work (academic marks + job readiness scores).
- **Token Economy:** Students earn and spend skill tokens for mentorship sessions, office hours, code clinics, and other services.

### Collaboration
- **Challenge Marketplace:** Industry partners post capstone, R&D, and micro-consultancy challenges for student teams.
- **Lab Units:** Faculty-led student teams formed around industry challenges with structured workflows.
- **Mentor Slots:** Industry professionals offer time-slotted mentorship sessions bookable by students.
- **Office Hours:** Token-based 15-minute booking system for student-mentor 1:1 sessions.

### Learning & Development
- **AI-Powered Syllabus Audit:** Pattern-matching engine detects outdated academic topics, augmented by Gemini LLM when configured.
- **Skill Assessments:** Student skill evaluations with decay tracking and verification status.
- **Internship Marketplace:** Industry posts learning programs (internships, apprenticeships, training, certifications, workshops) with skill-match scoring for students.
- **Faculty Development Programs:** Industry-hosted FDPs, consultancy, and research opportunities for faculty.

### Career & Placement
- **Reverse Placement:** High-PRI students (>850) are pitched to directly by recruiters instead of traditional campus placement.
- **Job Pitches:** Industry partners send tailored job offers with stipend and role details to specific students.
- **Skill Heatmap (Institutions):** Department-wise skill gap analysis comparing student scores against hiring benchmarks with bootcamp recommendations.
- **Placement Tracker:** Real-time status tracking of all job pitches (pitched > shortlisted > offered > accepted).
- **Digital Portfolio:** Students showcase verified skills, certifications, projects, proofs of work, and uploaded documents.

### Platform
- **Analytics Dashboard:** Aggregate platform stats -- user distribution, project status, pitch metrics, and average skill scores.
- **Partner Directory:** Browse registered industry partner companies by department and location.
- **Dark / Light Mode:** Full theme support via next-themes.

## Getting Started

```bash
npm install
npx prisma migrate dev
npm run db:seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Use the demo login buttons to sign in as any role (password: `Password@123`).

## Project Structure

```
src/
  app/
    (app)/          # Authenticated routes (25 pages)
    api/            # API routes (PRI computation, syllabus audit)
    login/          # Login page
    signup/         # Signup page
    verify/         # Email verification
  components/       # Shared UI components (Badge, Button, Card, Avatar, etc.)
  lib/              # Core logic (auth, PRI engine, QR codes, syllabus audit, Prisma client)
prisma/
  schema.prisma     # Database schema (20+ models)
  seed.ts           # Demo data seeder
```

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
