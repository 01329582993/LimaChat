# Tech Decisions

## Stack
- **Frontend**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Auth**: Clerk (fastest for MVP)
- **Database**: Postgres (hosted on Supabase or Neon)
- **ORM**: Prisma
- **Validation**: Zod
- **Icons**: Lucide React

## Environment Variables
```env
DATABASE_URL=
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
```

## Architecture Summary
The application follows a standard Next.js App Router architecture. 
- `/app` contains routes and pages.
- `/components` contains reusable UI components (shadcn/ui).
- `/lib` contains shared utilities (Prisma client, validation schemas).
- `/api` contains backend endpoints for form management and response handling.
- Public respondent routes (/f/:slug) are optimized for chat-based interaction.
