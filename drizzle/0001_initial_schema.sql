-- Labsync Chat Workflow Database Schema
-- Generated for PostgreSQL

-- Create enums
CREATE TYPE "user_role" AS ENUM('owner', 'manager', 'staff');
CREATE TYPE "message_type" AS ENUM('text', 'file', 'image');
CREATE TYPE "status_visibility" AS ENUM('public', 'private');
CREATE TYPE "schedule_type" AS ENUM('mcu', 'reagent', 'result_delay', 'general');

-- Create tables
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"name" text NOT NULL,
	"avatar" text,
	"role" "user_role" DEFAULT 'staff' NOT NULL,
	"department" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "conversations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text,
	"is_group" boolean DEFAULT false NOT NULL,
	"created_by" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "conversation_participants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"conversation_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"joined_at" timestamp DEFAULT now() NOT NULL,
	"last_read_at" timestamp DEFAULT now() NOT NULL,
	"is_admin" boolean DEFAULT false NOT NULL,
	CONSTRAINT "conversation_participants_conversation_id_user_id_pk" PRIMARY KEY("conversation_id","user_id")
);

CREATE TABLE "messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"conversation_id" uuid NOT NULL,
	"sender_id" text NOT NULL,
	"content" text NOT NULL,
	"type" "message_type" DEFAULT 'text' NOT NULL,
	"file_url" text,
	"file_name" text,
	"file_size" integer,
	"reply_to_id" uuid,
	"is_edited" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "message_reactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"message_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"emoji" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "message_reactions_message_id_user_id_emoji_pk" PRIMARY KEY("message_id","user_id","emoji")
);

CREATE TABLE "statuses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"content" text NOT NULL,
	"visibility" "status_visibility" DEFAULT 'public' NOT NULL,
	"tagged_users" text[],
	"attachments" jsonb,
	"likes" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "status_comments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"status_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"content" text NOT NULL,
	"reply_to_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "status_likes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"status_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "status_likes_status_id_user_id_pk" PRIMARY KEY("status_id","user_id")
);

CREATE TABLE "lab_schedules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"type" "schedule_type" NOT NULL,
	"scheduled_date" timestamp NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_by" text NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "ai_conversations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"messages" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"title" text NOT NULL,
	"message" text NOT NULL,
	"type" text NOT NULL,
	"is_read" boolean DEFAULT false NOT NULL,
	"related_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "file_uploads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"file_name" text NOT NULL,
	"file_url" text NOT NULL,
	"file_size" integer NOT NULL,
	"mime_type" text NOT NULL,
	"bucket" text NOT NULL,
	"path" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);

-- Create indexes
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE INDEX "conversations_created_by_idx" ON "conversations"("created_by");
CREATE INDEX "conversation_participants_conversation_id_idx" ON "conversation_participants"("conversation_id");
CREATE INDEX "conversation_participants_user_id_idx" ON "conversation_participants"("user_id");
CREATE INDEX "messages_conversation_id_idx" ON "messages"("conversation_id");
CREATE INDEX "messages_sender_id_idx" ON "messages"("sender_id");
CREATE INDEX "messages_created_at_idx" ON "messages"("created_at");
CREATE INDEX "message_reactions_message_id_idx" ON "message_reactions"("message_id");
CREATE INDEX "message_reactions_user_id_idx" ON "message_reactions"("user_id");
CREATE INDEX "statuses_user_id_idx" ON "statuses"("user_id");
CREATE INDEX "statuses_created_at_idx" ON "statuses"("created_at");
CREATE INDEX "status_comments_status_id_idx" ON "status_comments"("status_id");
CREATE INDEX "status_comments_user_id_idx" ON "status_comments"("user_id");
CREATE INDEX "status_likes_status_id_idx" ON "status_likes"("status_id");
CREATE INDEX "status_likes_user_id_idx" ON "status_likes"("user_id");
CREATE INDEX "lab_schedules_type_idx" ON "lab_schedules"("type");
CREATE INDEX "lab_schedules_scheduled_date_idx" ON "lab_schedules"("scheduled_date");
CREATE INDEX "lab_schedules_created_by_idx" ON "lab_schedules"("created_by");
CREATE INDEX "ai_conversations_user_id_idx" ON "ai_conversations"("user_id");
CREATE INDEX "notifications_user_id_idx" ON "notifications"("user_id");
CREATE INDEX "notifications_is_read_idx" ON "notifications"("is_read");
CREATE INDEX "file_uploads_user_id_idx" ON "file_uploads"("user_id");

-- Add foreign key constraints
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_created_by_users_id_fk" FOREIGN KEY("created_by") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;

ALTER TABLE "conversation_participants" ADD CONSTRAINT "conversation_participants_conversation_id_conversations_id_fk" FOREIGN KEY("conversation_id") REFERENCES "conversations"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "conversation_participants" ADD CONSTRAINT "conversation_participants_user_id_users_id_fk" FOREIGN KEY("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;

ALTER TABLE "messages" ADD CONSTRAINT "messages_conversation_id_conversations_id_fk" FOREIGN KEY("conversation_id") REFERENCES "conversations"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "messages" ADD CONSTRAINT "messages_sender_id_users_id_fk" FOREIGN KEY("sender_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "messages" ADD CONSTRAINT "messages_reply_to_id_messages_id_fk" FOREIGN KEY("reply_to_id") REFERENCES "messages"("id") ON DELETE set null ON UPDATE no action;

ALTER TABLE "message_reactions" ADD CONSTRAINT "message_reactions_message_id_messages_id_fk" FOREIGN KEY("message_id") REFERENCES "messages"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "message_reactions" ADD CONSTRAINT "message_reactions_user_id_users_id_fk" FOREIGN KEY("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;

ALTER TABLE "statuses" ADD CONSTRAINT "statuses_user_id_users_id_fk" FOREIGN KEY("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;

ALTER TABLE "status_comments" ADD CONSTRAINT "status_comments_status_id_statuses_id_fk" FOREIGN KEY("status_id") REFERENCES "statuses"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "status_comments" ADD CONSTRAINT "status_comments_user_id_users_id_fk" FOREIGN KEY("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "status_comments" ADD CONSTRAINT "status_comments_reply_to_id_status_comments_id_fk" FOREIGN KEY("reply_to_id") REFERENCES "status_comments"("id") ON DELETE set null ON UPDATE no action;

ALTER TABLE "status_likes" ADD CONSTRAINT "status_likes_status_id_statuses_id_fk" FOREIGN KEY("status_id") REFERENCES "statuses"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "status_likes" ADD CONSTRAINT "status_likes_user_id_users_id_fk" FOREIGN KEY("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;

ALTER TABLE "lab_schedules" ADD CONSTRAINT "lab_schedules_created_by_users_id_fk" FOREIGN KEY("created_by") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;

ALTER TABLE "ai_conversations" ADD CONSTRAINT "ai_conversations_user_id_users_id_fk" FOREIGN KEY("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;

ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;

ALTER TABLE "file_uploads" ADD CONSTRAINT "file_uploads_user_id_users_id_fk" FOREIGN KEY("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;