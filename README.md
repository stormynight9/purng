# Purng - Daily Pushup Challenge

Purng is a web application that helps you track your daily pushup goals. The challenge increases progressively throughout the year, making it an engaging way to build strength and consistency.

## How it Works

1. Each day has a unique pushup target that's the same for all users

    - Day 1 of the year: Random number between 0-1 pushups
    - Day 2 of the year: Random number between 0-2 pushups
    - And so on...

2. Log your pushups throughout the day to reach your daily target

## Getting Started

First, run the development server:

```
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Tech Stack

- Next.js 14 (App Router)
- DrizzleORM with Neon Database
- Tailwind CSS
- Shadcn/ui Components

## Environment Variables

Create a `.env.local` (and/or `.env`) in the root with the variables your app uses (e.g. `NEXT_PUBLIC_CONVEX_URL`, auth, Resend, etc.).

### Web Push (optional)

To enable push notifications:

1. Generate VAPID keys: `npx web-push generate-vapid-keys`
2. **Next.js** (`.env.local`): set `NEXT_PUBLIC_VAPID_PUBLIC_KEY` to the public key (so the client can subscribe).
3. **Convex** (Dashboard → Settings → Environment Variables): set `VAPID_PUBLIC_KEY` and `VAPID_PRIVATE_KEY` (so the daily reminder action can send).

Without these, the notification bell is hidden and the daily reminder cron does nothing.
