# Backend Structure Document

## Backend Architecture

We use a modern, serverless-friendly approach based on Next.js with the App Router. Key design patterns and frameworks:

- **Next.js App Router** for routing, server-side rendering, and API routes.  
- **API Routes** (serverless functions) to handle backend logic without managing separate servers.  
- **Component-driven UI** (shadcn/ui + Tailwind) ensures a clean separation between frontend and backend concerns.  
- **Drizzle ORM** for type-safe database interactions, reducing runtime errors and speeding up development.

How this supports our goals:

- **Scalability:** Serverless functions on Vercel auto-scale with user demand. Supabase’s managed Postgres scales vertically and distributes read replicas.  
- **Maintainability:** Clear separation between API routes, utility libraries, and UI components. Type safety from Drizzle makes refactoring safer.  
- **Performance:** Edge-hosted functions on Vercel, global CDN for static assets, and Supabase Realtime push updates to clients without polling.

## Database Management

We rely on Supabase, which offers a managed PostgreSQL database (SQL) plus storage and real-time features:

- **SQL Database (PostgreSQL)**  
  • Tables for users, roles, messages, statuses, comments, and lab schedules.  
  • Drizzle ORM schema definitions and migrations for type safety.  
- **Realtime Subscriptions**  
  • Built-in websockets let clients subscribe to table changes (new chat messages, status updates) in real time.  
- **Supabase Storage**  
  • Secure object storage for files (PDFs, images, spreadsheets).  
  • Row-Level Security (RLS) policies ensure only authorized users can upload or download.

Data is organized into logical tables, accessed via Drizzle or Supabase client libraries. We enforce RLS at the database level and use Clerk metadata for user roles.

## Database Schema

### Human-Readable Overview

- **users**: User profile synced from Clerk (id, email, name, avatar).  
- **roles**: Predefined roles (owner, manager, staff).  
- **user_roles**: Assigns one or more roles to each user.  
- **conversations**: Chat threads between users or groups.  
- **messages**: Individual chat messages linked to a conversation and sender.  
- **statuses**: Social feed posts (text, media URL, author, visibility).  
- **status_comments**: Comments on each status update.  
- **lab_schedules**: Records of lab events or shifts (title, date, participants).

### SQL Schema (PostgreSQL)

```sql
-- users table (synced from Clerk)
CREATE TABLE users (
  id           UUID PRIMARY KEY,
  email        TEXT UNIQUE NOT NULL,
  full_name    TEXT,
  avatar_url   TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE roles (
  id   SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL
);

CREATE TABLE user_roles (
  user_id UUID REFERENCES users(id),
  role_id INTEGER REFERENCES roles(id),
  PRIMARY KEY (user_id, role_id)
);

CREATE TABLE conversations (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT,
  is_group    BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE messages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id),
  sender_id       UUID REFERENCES users(id),
  content         TEXT,
  media_url       TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE statuses (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id  UUID REFERENCES users(id),
  text       TEXT,
  media_url  TEXT,
  visibility TEXT CHECK (visibility IN ('public','private','role-based')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE status_comments (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  status_id  UUID REFERENCES statuses(id),
  author_id  UUID REFERENCES users(id),
  text       TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE lab_schedules (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title       TEXT,
  description TEXT,
  start_time  TIMESTAMPTZ,
  end_time    TIMESTAMPTZ,
  created_by  UUID REFERENCES users(id)
);
```

## API Design and Endpoints

We use Next.js API Routes to create RESTful endpoints. Major routes include:

- **/api/auth/** – Handled by Clerk middleware for sign-in, sign-up, session checks.  
- **/api/chat/conversations**  
  • GET: List user’s conversations.  
  • POST: Create a new conversation.  
- **/api/chat/messages**  
  • GET: Fetch messages for a conversation.  
  • POST: Send a new message.  
- **/api/status**  
  • GET: Fetch status feed (with real-time subscriptions).  
  • POST: Create a new status update.  
- **/api/status/comments**  
  • POST: Add a comment to a status.  
- **/api/chatbot**  
  • POST: Receive user query, lookup context data, forward to OpenAI, and return response.  
- **/api/files/upload**  
  • POST: Generate signed URL or direct-upload token for Supabase Storage.  
- **/api/files/download**  
  • GET: Generate secure download link for a stored file.

All APIs validate the Clerk-authenticated user and enforce role-based checks before database access.

## Hosting Solutions

- **Vercel**  
  • Hosts Next.js app with built-in support for serverless API routes.  
  • Global CDN for static assets ensures low latency.  
  • Seamless GitHub integration for continuous deployment.  
- **Supabase**  
  • Managed PostgreSQL database with automated backups and updates.  
  • Realtime server for websockets and pub/sub.  
  • Object storage for files.  

Benefits:

- **Reliability:** Vercel’s serverless functions and Supabase’s SLA-backed services.  
- **Scalability:** Auto-scaling serverless functions and horizontally scalable database architecture.  
- **Cost-Effectiveness:** Generous free tiers and pay-as-you-go pricing.

## Infrastructure Components

- **Load Balancing & CDN**  
  • Vercel’s edge network balances requests across regions.  
- **Caching**  
  • Edge caching for static assets.  
  • Client-side caching with libraries like SWR or React Query.  
- **Realtime Messaging**  
  • Supabase Realtime (Postgres publications over websockets).  
- **Serverless Functions**  
  • Next.js API routes auto-deployed as lambdas on Vercel.  
- **Storage**  
  • Supabase Storage for file uploads, with RLS policies.

Together, these components ensure high performance, low latency, and a responsive user experience.

## Security Measures

- **Authentication & Authorization**  
  • Clerk-managed user sign-in/up and session tokens.  
  • Role-based access control via Clerk metadata and middleware.  
- **Database Security**  
  • Row-Level Security (RLS) policies in Postgres to enforce per-row permissions.  
  • Least-privilege service role for Supabase client.  
- **Data Encryption**  
  • HTTPS/TLS in transit for all traffic.  
  • Encryption at rest for Postgres data and storage objects.  
- **Input Validation & File Sanitization**  
  • Server-side checks on file type and size.  
  • Sanitization of user-generated content to prevent XSS.

These measures protect user data and help meet compliance standards.

## Monitoring and Maintenance

- **Logging & Error Tracking**  
  • Vercel’s built-in logs for serverless functions.  
  • Supabase Metrics and Logs in the dashboard.  
  • Optional integration with Sentry for application error tracking.  
- **Performance Monitoring**  
  • Real-time metrics from Vercel (cold starts, latency).  
  • Database performance insights from Supabase.  
- **Backups & Updates**  
  • Automated daily backups of the Postgres database.  
  • Managed updates and security patches by Supabase.  
- **CI/CD**  
  • GitHub Actions (or Vercel’s built-in pipeline) for linting, testing, and deployment.

Routine reviews of logs and metrics ensure reliability and quick issue resolution.

## Conclusion and Overall Backend Summary

The backend is built on a flexible, serverless-first architecture using Next.js, Clerk, Supabase, and Vercel. It provides:

- **Robust Authentication** via Clerk with role-based access control.  
- **Real-Time Communication** through Supabase Realtime for chat and feeds.  
- **Scalable Data Storage** with managed Postgres and Storage.  
- **Secure, Compliant Infrastructure** with TLS, RLS, and encryption.  
- **Developer-Friendly Tooling** with Drizzle ORM, TypeScript, and serverless API routes.

This setup aligns with the Labsync Chat Workflow’s goals: streamlined collaboration for lab teams, instant updates, AI-assisted information, and cost-effective file sharing—delivered reliably and securely at scale.