# Frontend Guideline Document for labsync-workflow-chat

This document outlines the frontend architecture, design principles, and technologies used in the **Labsync Chat Workflow** application. It’s written in everyday language so that anyone can understand how the frontend is set up and why.

## 1. Frontend Architecture

**Core Frameworks and Libraries**
- **Next.js (App Router)**: Handles routing, server-side rendering, and API routes in one framework.
- **Shadcn/ui + Tailwind CSS**: A set of ready-made, accessible UI components built on top of Tailwind’s utility classes.
- **Clerk**: Manages user sign-in, sign-up, session handling, and roles (owner, manager, staff).
- **Supabase**: Provides a managed PostgreSQL database, real-time subscriptions, and file storage.
- **Drizzle ORM**: Ensures type-safe database schema definitions and queries.
- **next-themes**: Adds dark mode support.
- **Vercel**: Hosts the production app with serverless functions and CDN.

**How It Supports Scalability, Maintainability, and Performance**
- **Scalability**: Next.js on Vercel scales automatically; Supabase handles database and real-time traffic.
- **Maintainability**: Component-based UI (Shadcn/ui) and TypeScript-driven ORM (Drizzle) keep code organized and type-safe.
- **Performance**: Server components reduce client bundle size; Vercel’s CDN and Next.js optimizations (image and font handling) speed up delivery.

## 2. Design Principles

**Usability**
- Simple, focused dashboard layout with clear navigation.
- Consistent patterns for chat, feeds, and file uploads.

**Accessibility**
- All Shadcn/ui components follow WCAG guidelines by default.
- Semantic HTML and ARIA attributes where needed.

**Responsiveness**
- Mobile-first approach using Tailwind’s responsive utilities.
- Flexible layouts and touch-friendly controls on smaller screens.

**Consistency & Feedback**
- Unified styling and spacing across components.
- Clear visual feedback (loading spinners, button states, error messages).

## 3. Styling and Theming

**Styling Approach**
- **Utility-First CSS** with **Tailwind CSS**. Tailwind classes are composed directly in JSX to style components.
- **No BEM/SMACSS** needed, since Tailwind covers naming and scoping.

**Theming**
- **Dark Mode** and **Light Mode** powered by `next-themes`.
- Theme switcher stored in local storage for persistence.

**Visual Style**
- **Overall Style**: Modern flat design with subtle glassmorphism accents (semi-transparent cards and modals).
- **Color Palette**:
  - Primary: #3B82F6 (blue)
  - Secondary: #10B981 (emerald)
  - Accent: #F59E0B (amber)
  - Neutral: #F3F4F6 (light), #1F2937 (dark)
  - Error: #EF4444 (red)
  - Success: #22C55E (green)
  - Background Light: #FFFFFF
  - Background Dark: #111827

**Typography**
- **Font Family**: Inter, system UI fallbacks.
- **Headings**: Bold, clear hierarchy (H1–H4).
- **Body Text**: Regular weight, 16px base size for readability.

## 4. Component Structure

**How Components Are Organized**
- `components/`
  - `shared/`: Buttons, inputs, modals used everywhere.
  - `chat/`: `ChatInterface.tsx`, `MessageBubble.tsx`, `UserList.tsx`.
  - `status/`: `StatusFeed.tsx`, `StatusUpdateForm.tsx`, `StatusCard.tsx`.
  - `chatbot/`: `ChatbotWindow.tsx`.
  - `file/`: `FileUpload.tsx`, `FilePreview.tsx`.
  - `layout/`: `AppSidebar.tsx`, `AppHeader.tsx`.

**Component-Based Architecture Benefits**
- **Reusability**: Shared UI building blocks reduce duplication.
- **Isolation**: Each component handles its own state and styles.
- **Easy Testing**: Smaller units make unit testing straightforward.
- **Faster Onboarding**: Clear folder structure helps new developers find code quickly.

## 5. State Management

**Approach**
- **Server Components**: Fetch static or SSR data on the server.
- **Client Components**: Handle real-time and interactive features.
- **Supabase’s Realtime**: Subscribes to database changes for chat messages and status updates.
- **React Context**:
  - **AuthContext** (via Clerk) provides user info and roles.
  - **ThemeContext** (via next-themes) supplies current theme.

**Data Flow**
1. Client component mounts and initializes Supabase subscription.
2. New messages/statuses push from database to UI.
3. Forms use Supabase client to insert data.
4. Clerk hooks (`useUser`, `useSession`) manage authentication state.

## 6. Routing and Navigation

**Next.js App Router**
- Pages and layouts defined under `app/`.
- Nested layouts for consistent sidebars and headers.

**Navigation Structure**
- **`/signin` & `/signup`**: Handled by Clerk’s pre-built pages or custom wrappers.
- **Protected Route**: Middleware enforces authentication for `/dashboard` and sub-routes.
- **Main Sections** in sidebar:
  - Chats (`/dashboard/chats`)
  - Status Feed (`/dashboard/status`)
  - AI Chatbot (`/dashboard/chatbot`)
  - Lab Updates (`/dashboard/labs`)

**Linking**
- Use Next.js `Link` component for client-side transitions.
- Active link styling via Tailwind and router hooks.

## 7. Performance Optimization

**Code Splitting & Lazy Loading**
- **Dynamic Imports** for heavy components (e.g., ChatbotWindow).
- **Server Components** by default, reducing client bundle size.

**Asset Optimization**
- **next/image** for automatic image resizing and lazy loading.
- Inline critical CSS; Tailwind’s `@apply` for shared utilities.

**Caching**
- **ISR** (Incremental Static Regeneration) for non-interactive pages.
- HTTP caching headers on Vercel.

**Minimizing Re-renders**
- Memoize components (`React.memo`) and handlers (`useCallback`).
- Subscribe only to relevant Supabase channels.

## 8. Testing and Quality Assurance

**Unit Tests**
- **Jest** + **React Testing Library** to test individual components and utility functions.
- Mock Supabase and Clerk contexts with test wrappers.

**Integration Tests**
- Combine multiple components in a test environment to verify interactions.

**End-to-End (E2E) Tests**
- **Playwright** or **Cypress** to simulate user flows:
  - Sign-in and role-based access.
  - Sending and receiving chat messages.
  - Posting status updates.
  - Uploading and downloading files.

**Linting & Formatting**
- **ESLint** with TypeScript rules and Next.js plugin.
- **Prettier** for consistent code style.

## 9. Conclusion and Overall Frontend Summary

This frontend setup balances modern technologies and everyday coding patterns to deliver a reliable, scalable, and user-friendly application. By leveraging:
- **Next.js** for routing and server logic,
- **Shadcn/ui + Tailwind** for consistent design,
- **Clerk** and **Supabase** for secure authentication and real-time data,
- **Drizzle ORM** for type safety,
- **next-themes** for theming,
- **Vercel** for deployment,

the Labsync Chat Workflow app achieves its goals of seamless communication, collaborative status sharing, AI-powered assistance, and cost-effective file management.

With these guidelines, any developer—novice or expert—can understand, extend, and maintain the frontend codebase confidently and consistently.