import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  uuid,
  jsonb,
  pgEnum,
  primaryKey
} from "drizzle-orm/pg-core";

// Enums for role management
export const userRoleEnum = pgEnum('user_role', ['owner', 'manager', 'staff']);
export const messageTypeEnum = pgEnum('message_type', ['text', 'file', 'image']);
export const statusVisibilityEnum = pgEnum('status_visibility', ['public', 'private']);
export const scheduleTypeEnum = pgEnum('schedule_type', ['mcu', 'reagent', 'result_delay', 'general']);

// Users table - sync with Clerk
export const users = pgTable("users", {
  id: text("id").primaryKey(), // Clerk user ID
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  avatar: text("avatar"),
  role: userRoleEnum("role").default("staff").notNull(),
  department: text("department"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Conversations table
export const conversations = pgTable("conversations", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name"), // For group chats, null for direct messages
  isGroup: boolean("is_group").default(false).notNull(),
  createdBy: text("created_by").references(() => users.id, { onDelete: "cascade" }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Conversation participants
export const conversationParticipants = pgTable("conversation_participants", {
  id: uuid("id").defaultRandom().primaryKey(),
  conversationId: uuid("conversation_id").references(() => conversations.id, { onDelete: "cascade" }).notNull(),
  userId: text("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
  lastReadAt: timestamp("last_read_at").defaultNow().notNull(),
  isAdmin: boolean("is_admin").default(false).notNull(),
}, (table) => ({
  pk: primaryKey({ columns: [table.conversationId, table.userId] }),
}));

// Messages table
export const messages = pgTable("messages", {
  id: uuid("id").defaultRandom().primaryKey(),
  conversationId: uuid("conversation_id").references(() => conversations.id, { onDelete: "cascade" }).notNull(),
  senderId: text("sender_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  content: text("content").notNull(),
  type: messageTypeEnum("type").default("text").notNull(),
  fileUrl: text("file_url"),
  fileName: text("file_name"),
  fileSize: integer("file_size"),
  replyToId: uuid("reply_to_id").references(() => messages.id, { onDelete: "set null" }),
  isEdited: boolean("is_edited").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Message reactions
export const messageReactions = pgTable("message_reactions", {
  id: uuid("id").defaultRandom().primaryKey(),
  messageId: uuid("message_id").references(() => messages.id, { onDelete: "cascade" }).notNull(),
  userId: text("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  emoji: text("emoji").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  pk: primaryKey({ columns: [table.messageId, table.userId, table.emoji] }),
}));

// Status updates table
export const statuses = pgTable("statuses", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  content: text("content").notNull(),
  visibility: statusVisibilityEnum("visibility").default("public").notNull(),
  taggedUsers: text("tagged_users").array(), // Array of user IDs for private posts
  attachments: jsonb("attachments"), // Array of file objects
  likes: integer("likes").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Status comments
export const statusComments = pgTable("status_comments", {
  id: uuid("id").defaultRandom().primaryKey(),
  statusId: uuid("status_id").references(() => statuses.id, { onDelete: "cascade" }).notNull(),
  userId: text("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  content: text("content").notNull(),
  replyToId: uuid("reply_to_id").references(() => statusComments.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Status likes
export const statusLikes = pgTable("status_likes", {
  id: uuid("id").defaultRandom().primaryKey(),
  statusId: uuid("status_id").references(() => statuses.id, { onDelete: "cascade" }).notNull(),
  userId: text("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  pk: primaryKey({ columns: [table.statusId, table.userId] }),
}));

// Lab schedules table
export const labSchedules = pgTable("lab_schedules", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  type: scheduleTypeEnum("type").notNull(),
  scheduledDate: timestamp("scheduled_date").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdBy: text("created_by").references(() => users.id, { onDelete: "cascade" }).notNull(),
  metadata: jsonb("metadata"), // Additional info like reagent details, MCU info, etc.
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// AI Chatbot conversations
export const aiConversations = pgTable("ai_conversations", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  messages: jsonb("messages").notNull(), // Array of conversation messages
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Notifications table
export const notifications = pgTable("notifications", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: text("type").notNull(), // 'message', 'status_like', 'status_comment', 'schedule_update'
  isRead: boolean("is_read").default(false).notNull(),
  relatedId: text("related_id"), // ID of related item (message, status, etc.)
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// File uploads tracking
export const fileUploads = pgTable("file_uploads", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  fileName: text("file_name").notNull(),
  fileUrl: text("file_url").notNull(),
  fileSize: integer("file_size").notNull(),
  mimeType: text("mime_type").notNull(),
  bucket: text("bucket").notNull(),
  path: text("path").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});