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

Create a `.env` file in the root directory with the following variables:

```
DATABASE_URL=your-neon-database-url
RANDOM_SEED=your-secret-string-here
```
