# Labsync Chat Workflow - Project Requirements Document (PRD)

## 1. Project Overview

Labsync Chat Workflow is a full-stack web application built on a Next.js starter template. It transforms an existing generic dashboard into a collaborative platform where lab users, managers, and stakeholders can communicate in real time, share files securely, post status updates, and get AI-powered information on lab schedules or protocols. By unifying these capabilities into one interface, the application solves the problem of fragmented communication across divisions and reduces overhead from emails, spreadsheets, and manual inquiries.

This project is being built to streamline daily lab operations, improve cross-team transparency, and speed up information retrieval. Key objectives for Version 1 include: real-time one-to-one and group chat, an AI-driven chatbot for lab inquiries, a social feed for posting text or media statuses, role-based access control (owner, manager, staff), and cost-effective file sharing. Success will be measured by low chat latency (<500 ms), high user adoption in pilot labs, secure handling of sensitive data, and simple deployment to Vercel on a free-tier budget.

## 2. In-Scope vs. Out-of-Scope

### In-Scope (Version 1)
- User authentication and role-based access control using Clerk (owner, manager, staff).
- Protected dashboard layout with a sidebar linking to Chats, Status Feed, and AI Chatbot.
- Real-time user-to-user and group chat using Supabase Realtime.
- Status Feed: post text or media updates, comment on posts, and react (like).
- AI Chatbot interface that fetches lab schedules from the database and queries the OpenAI API for contextual answers.
- File sharing in chat and statuses via Supabase Storage (PDF, XLSX, images) with size limits and RLS policies.
- Dark mode toggle (next-themes) and consistent UI built with shadcn/ui + Tailwind CSS.
- Type-safe database models using Drizzle ORM pointing to a Supabase PostgreSQL instance.
- Deployment and hosting on Vercel, local development with Docker optional.

### Out-of-Scope (Phase 2+)
- Audio/video calling or screen sharing capabilities.
- Push notifications via mobile OS (iOS/Android) or browser native push.
- Native iOS/Android applications (React Native or SwiftUI).
- Rich-text editing or markdown support in chat and status posts.
- Multilingual UI or extensive theming beyond light/dark.
- Advanced analytics dashboards, custom reporting, or BI integrations.
- Third-party integrations beyond Clerk, Supabase, and OpenAI.

## 3. User Flow

A new user arrives at the landing page and signs up using Clerk’s pre-built email/password or SSO flows. After verifying their email, they log in and land on the protected dashboard. A left sidebar lists navigation items: **Chats**, **Status Feed**, **AI Chatbot**, and **Settings** (visible to owners/managers). The main content area defaults to the chat overview, showing existing conversations and a search bar to start new ones.

When the user clicks **Chats**, they see a list of contacts or groups. Selecting a conversation opens a real-time message window where they can type text, attach files, or use emoji reactions. Visiting **Status Feed** displays a chronological list of posts; the user can scroll, comment, or create a new post via a modal. In **AI Chatbot**, the user types a question about lab schedules or procedures, submits it, and sees an AI-generated response enriched with database data. Owners and managers can also invite or manage team members in **Settings**.

## 4. Core Features

- **Authentication & RBAC**: Clerk-powered sign-up/sign-in, session handling, user metadata for roles (owner, manager, staff).
- **Real-Time Chat**: One-to-one and group messaging powered by Supabase Realtime, with attachments and typing indicators.
- **Status Feed**: Post text and media updates, comment threads, like/react, with optional privacy tags.
- **AI Chatbot**: Next.js API route aggregates data from Supabase and queries OpenAI for context-aware answers.
- **File Upload & Storage**: Supabase Storage integration for dragging/dropping files in chat and statuses, with client-side size/type validation.
- **Role Management**: Owners and managers can assign roles; RLS policies enforce data access at the database level.
- **Theming & Layout**: Dark/light mode toggle, responsive design using shadcn/ui and Tailwind CSS.
- **Data Models & API**: Drizzle ORM schemas for users, conversations, messages, statuses, comments, and lab_schedules; RESTful Next.js API routes.

## 5. Tech Stack & Tools

- **Frontend**:
  - Next.js (App Router) with React
  - Tailwind CSS & shadcn/ui component library
  - next-themes for dark/light mode
- **Authentication**:
  - Clerk for managed auth, sessions, and user roles
- **Backend & Database**:
  - Supabase (PostgreSQL, Realtime, Storage)
  - Drizzle ORM for type-safe schema and queries
  - Next.js API Routes for custom endpoints
- **AI Service**:
  - OpenAI API (GPT-4 or GPT-3.5) for chatbot responses
- **Deployment**:
  - Vercel for hosting frontend and serverless functions
  - Docker (optional local Postgres emulation)
- **IDE & Plugins** (optional): Cursor AI, Windsurf for pairing and context

## 6. Non-Functional Requirements

- **Performance**: Initial page load under 2 seconds on 4G; chat message delivery latency under 500 ms.
- **Scalability**: Support at least 100 concurrent users with real-time messaging.
- **Security**: HTTPS/TLS in transit, encryption at rest for database and storage, Supabase RLS policies, Clerk session security.
- **Usability & Accessibility**: WCAG 2.1 AA compliance, keyboard navigation, responsive on desktop/tablet.
- **Reliability**: 99.9% uptime on production; retry logic for API failures.
- **Compliance**: GDPR-compatible data policies; user data deletion on request.

## 7. Constraints & Assumptions

- **Constraints**:
  - Must stay within free tiers of Supabase and Vercel to control costs.
  - Supabase Realtime rate limits may apply (limit subscription channels).
  - Clerk pricing tiers may affect advanced role usage.
- **Assumptions**:
  - Users have modern browsers with WebSocket support.
  - Stable Internet connection is available for real-time features.
  - AI model costs will be monitored and capped per month.
  - Lab users will not require offline access.

## 8. Known Issues & Potential Pitfalls

- **Supabase Realtime Limits**: Hitting channel/subscription limits can degrade chat. Mitigation: batch channels or multiplex events.
- **RLS Complexity**: Misconfigured policies can lock out users or expose data. Mitigation: write thorough policy tests and use Drizzle migrations for version control.
- **File Storage Growth**: Free tier storage may fill up. Mitigation: implement auto-cleanup of attachments older than X days, or compress images before upload.
- **AI Latency & Costs**: Multiple back-and-forth can increase response times and costs. Mitigation: cache frequent queries, set token limits, or use a smaller model for basic inquiries.
- **Auth Migration Risks**: Swapping `better-auth` to Clerk could introduce breaking changes. Mitigation: build auth integration first, test all routes, and migrate incrementally.

---
This document provides a clear, unambiguous blueprint for the Labsync Chat Workflow application so that subsequent technical specifications—Tech Stack Document, Frontend Guidelines, Backend Structure—can be derived without guesswork.