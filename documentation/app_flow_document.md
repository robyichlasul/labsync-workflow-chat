# Labsync Chat Workflow Application Flow Document

## Onboarding and Sign-In/Sign-Up

When a new user arrives at the Labsync application, they land on a welcoming page that briefly describes the platform’s purpose and invites them to get started. From this landing page, users can choose to sign up or sign in. The sign-up process is powered by Clerk and offers options to register with an email address or through a social login provider such as Google. In the email path, the user enters their address, receives a magic link or verification code, and clicks the link to confirm their account. In the social login path, the user consents to share basic information and is immediately authenticated. After signing up, the user is automatically routed to complete their profile by choosing a display name and, if they have the right permissions, selecting a role of owner, manager, or staff.

For returning users, the sign-in page prompts for an email or social provider login and uses Clerk’s secure session handling to authenticate. If the user forgets their password, they click a “Forgot Password” link, enter their email, and receive a reset link. The link takes them back to the app where they can set a new password. Signing out is as simple as opening the profile menu in the header and clicking “Sign Out,” which clears the session and returns them to the landing page.

## Main Dashboard or Home Page

Once authenticated, every user lands on the main dashboard, which serves as the central hub. The page features a persistent sidebar on the left, providing navigation to Chats, Status Feed, AI Chatbot, and Lab Updates. At the top sits the header bar with the application logo, a notification icon, and the user’s profile avatar. The content area fills the rest of the screen and updates based on the selected module. The sidebar highlights the active section so users always know where they are. From here, users can click any link to move to a different part of the app without losing context or having to reload the entire page.

## Detailed Feature Flows and Page Transitions

When a user clicks on Chats, the main content area switches to a chat overview. They see a list of their conversations on the left side and the chat window on the right. Selecting a conversation loads past messages in real time, powered by Supabase Realtime subscriptions. The message input at the bottom lets them type or drag and drop files, which are uploaded to Supabase Storage and appear instantly in the thread. Sending a message sends a request to a Next.js API route that writes the message to the database and triggers real-time updates.

Switching to the Status Feed shows a scrollable timeline of posts from team members. Each status card displays text, images, or file attachments. Clicking on a card expands it to show comments, which also update in real time. To create a new status, the user clicks a “New Status” button in the header. A modal appears with a form where they can type a message, attach media, and choose whether the post is public or directed to specific team members. Submitting the form inserts the status into the database via an API route and updates the feed immediately.

In the AI Chatbot section, the user sees a simple chat interface labeled “Ask about lab schedules or protocols.” When the user enters a question, the front end calls a dedicated API route. This route retrieves relevant schedule data from Supabase, sends it along with the user’s query to the OpenAI API, and returns a coherent, context-rich response. The chatbot window displays the answer as soon as it arrives.

The Lab Updates page presents a data table of scheduled experiments, bookings, or maintenance tasks. Users can sort by date, filter by lab space, or search by keyword. Administrators see additional action buttons to approve or modify schedule entries. All table data is fetched through Drizzle ORM queries to the Supabase database, ensuring type-safe interactions and consistent data structure.

## Settings and Account Management

In the profile area, reached by clicking the avatar in the header, users can view and update their personal information. They can change their display name, upload a new profile photo, and adjust notification preferences such as email alerts for new messages or status posts. If the user is an owner, they also see a tab for role management, where they can assign or revoke manager and staff roles via a simple form powered by Clerk metadata. All changes sync instantly with Clerk and reflect in any access control checks throughout the app.

After saving settings, users click a “Return to Dashboard” button or use the sidebar to navigate back to their previous view without losing their place. The settings area maintains a consistent layout with the rest of the application, ensuring a cohesive experience.

## Error States and Alternate Paths

If a user enters invalid data during sign-up or in a form, the app highlights the incorrect field in red and displays a brief message explaining what to fix. During chat and status updates, if a message fails to send or a file upload is interrupted, an error toast appears and the input remains populated so the user can retry. If the network connection drops, a banner appears across the top of the screen reading “You are offline,” and the app retries subscriptions automatically when connectivity returns. Attempting to access a page without permission, such as a staff member opening the role management tab, presents a friendly “Access Denied” page with a button to return to the dashboard.

For any unexpected server error, a generic error page appears with a brief apology and a “Try Again” button that reloads the current view, ensuring users can recover without losing their work.

## Conclusion and Overall App Journey

From the moment a user discovers Labsync and signs up through Clerk, they are guided into a secure and intuitive dashboard. They seamlessly move between real-time chat conversations, collaborative status updates, AI-powered assistance, and lab schedule management. Their account settings stay within reach, offering easy profile updates and role control for administrators. Robust error handling keeps interruptions minimal, and a consistent design ties every page together. By following this flow, lab teams can sign in, share important updates, consult the AI bot, and manage schedules—all within a single, cohesive application.