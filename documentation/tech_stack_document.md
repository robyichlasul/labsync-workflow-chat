# Tech Stack Document

This document outlines the key technologies chosen for the **Labsync Chat Workflow** application. The goal is to explain each part in everyday language so that non-technical stakeholders can understand why we picked them and how they work together.

## 1. Frontend Technologies

These are the tools and libraries we use to build everything the user sees and interacts with in their browser.

- **Next.js (App Router)**
  - A React-based framework that handles page routing, server-side rendering, and static site generation. It gives us a fast, SEO-friendly site and makes it easy to write both frontend and backend code in one place.
- **Shadcn/ui components**
  - A set of pre-styled React components (buttons, forms, modals, etc.) that look sharp and work well together. They help us build a professional interface quickly without designing every element from scratch.
- **Tailwind CSS**
  - A utility-first styling framework. Instead of writing custom CSS files, we use small, descriptive class names directly in our components to control colors, spacing, fonts, and layouts. This keeps our styling consistent and easy to maintain.
- **next-themes**
  - A simple theme manager for Next.js. It lets end users switch between light mode and dark mode. The switch happens instantly without a full page reload, improving the look and feel.
- **Clerk React SDK**
  - Provides out-of-the-box login, sign-up, and user profile components. We plug these into our pages to get a secure, polished authentication flow without custom building forms or session logic.

How these choices enhance user experience:
- Consistency: Shadcn/ui + Tailwind ensures a unified look across the app.
- Responsiveness: Next.js’s hybrid rendering gives snappy page loads and instant interactions.
- Accessibility & Theming: Pre-built components and theme support mean the app is comfortable to use for all users, day or night.

## 2. Backend Technologies

These tools handle data storage, user authentication, and server-side logic.

- **Next.js API Routes**
  - Let us write server-side code in the same project as our frontend. We use these routes to handle chat messages, status posts, file uploads, and the AI chatbot logic.
- **Clerk Node SDK**
  - Manages user sessions and roles on the server. Every incoming request can be checked to see who the user is and what they’re allowed to access.
- **Supabase**
  - A managed service built on PostgreSQL. We use it for:
    - **Database**: Storing users, roles, messages, statuses, and lab schedules.
    - **Realtime**: Pushing new chat messages and status updates instantly to all connected clients.
    - **Storage**: Handling file uploads (PDFs, images, spreadsheets) with secure access controls.
- **Drizzle ORM**
  - A TypeScript-friendly library for defining database tables and running queries. It ensures our code matches the database structure and reduces the chance of runtime errors.

How they work together:
1. A user sends a chat message in the UI.
2. The Next.js API route receives it and verifies the user via Clerk.
3. The route uses Drizzle to write the message into Supabase.
4. Supabase Realtime notifies all clients to display the new message immediately.

## 3. Infrastructure and Deployment

This section covers where the code lives, how we deploy it, and how we keep everything running smoothly.

- **Version Control: Git & GitHub**
  - All code is stored in a Git repository on GitHub. This lets multiple developers collaborate, track changes, and review each other’s work.
- **Continuous Deployment: Vercel**
  - When code is pushed to the main branch on GitHub, Vercel automatically builds and deploys the app. This gives us instant updates in production and a global Content Delivery Network (CDN) for fast page delivery.
- **Local Development: Docker (optional)**
  - Developers can spin up a local PostgreSQL instance with Docker to work offline. This mirrors the production database setup and ensures compatibility before deploying.

How these choices contribute to reliability and scalability:
- Automatic builds and deploys reduce human error.
- Vercel’s serverless functions scale up or down based on traffic.
- GitHub collaboration features enforce code quality through pull requests and reviews.

## 4. Third-Party Integrations

These external services add specialized features so we don’t have to build everything from scratch.

- **Clerk** (Authentication & Role Management)
  - Handles user sign-up, login, password reset, and multi-factor authentication. Also manages user roles (owner, manager, staff) for access control.
- **Supabase** (Database, Realtime, Storage)
  - Provides a single platform for data storage, live updates, and file hosting. We benefit from built-in security rules and a generous free tier.
- **OpenAI API** (AI Chatbot)
  - Powers the AI assistant. Our application sends user questions and relevant lab data to OpenAI, which returns clear, context-aware answers.

Benefits:
- Faster development by using battle-tested services.
- Lower ongoing maintenance since updates and scaling are handled by the providers.

## 5. Security and Performance Considerations

We’ve built in multiple layers of protection and speed optimizations to ensure a smooth, safe user experience.

Security Measures:
- **Authentication & Authorization**: Clerk verifies every request. Role data is enforced both in our API routes and at the database level using Supabase Row Level Security (RLS).
- **Data Protection**: All traffic is encrypted via HTTPS. File uploads are scoped by user and conversation to prevent unauthorized access.
- **Environment Variables**: Secrets (API keys, database URLs) are stored securely and never exposed in the frontend code.

Performance Optimizations:
- **Server-Side Rendering & Static Pages**: Next.js renders public pages ahead of time for faster load.
- **Realtime Updates**: Supabase Realtime pushes only the changed data, avoiding full-page refreshes or heavy polling.
- **CDN Caching**: Vercel’s CDN caches static assets (JavaScript, CSS, images) close to the user for quick downloads.
- **Code Splitting**: Next.js automatically splits code by page, sending only the JavaScript needed for the current view.

## 6. Conclusion and Overall Tech Stack Summary

We’ve chosen a modern, cohesive set of tools to build the Labsync Chat Workflow application:

- **Frontend**: Next.js + React, shadcn/ui, Tailwind CSS, next-themes, Clerk React SDK
- **Backend**: Next.js API routes, Clerk Node SDK, Supabase (Postgres, Realtime, Storage), Drizzle ORM
- **Infrastructure**: GitHub & Git, Vercel for CI/CD and hosting, Docker for local development
- **Integrations**: Clerk for authentication, Supabase for data and file storage, OpenAI for AI-powered assistance
- **Security & Performance**: RLS policies, HTTPS, CDN caching, serverless scaling, real-time subscriptions, environment variable safety

This stack aligns perfectly with our goals:
- **Collaboration**: Real-time chat and status feeds keep teams in sync.
- **Security**: Role-based access at every layer protects sensitive data.
- **Scalability**: Serverless infrastructure and managed services handle growing usage.
- **User Experience**: A polished, responsive interface with dark mode and instant updates.

By combining these technologies, we deliver a robust, maintainable, and user-friendly platform that can evolve as Labsync’s needs grow.