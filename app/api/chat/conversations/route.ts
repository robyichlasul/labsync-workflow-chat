import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { conversations, conversationParticipants, users } from "@/db/schema/labsync";
import { eq, and, desc, or } from "drizzle-orm";

// GET - Fetch all conversations for current user
export async function GET() {
  try {
    const { userId } = auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get conversations where user is a participant
    const userConversations = await db
      .select({
        id: conversations.id,
        name: conversations.name,
        isGroup: conversations.isGroup,
        createdAt: conversations.createdAt,
        updatedAt: conversations.updatedAt,
      })
      .from(conversationParticipants)
      .leftJoin(conversations, eq(conversationParticipants.conversationId, conversations.id))
      .where(eq(conversationParticipants.userId, userId))
      .orderBy(desc(conversations.updatedAt));

    return NextResponse.json({ conversations: userConversations });
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return NextResponse.json(
      { error: "Failed to fetch conversations" },
      { status: 500 }
    );
  }
}

// POST - Create new conversation
export async function POST(request: NextRequest) {
  try {
    const { userId } = auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, isGroup = false, participantIds } = await request.json();

    if (!participantIds || !Array.isArray(participantIds)) {
      return NextResponse.json(
        { error: "Participant IDs are required" },
        { status: 400 }
      );
    }

    // Add current user to participants if not already included
    const allParticipantIds = Array.from(new Set([userId, ...participantIds]));

    // Start transaction
    const newConversation = await db.transaction(async (tx) => {
      // Create conversation
      const [conversation] = await tx
        .insert(conversations)
        .values({
          name: isGroup ? name : null,
          isGroup,
          createdBy: userId,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();

      // Add all participants
      await tx.insert(conversationParticipants).values(
        allParticipantIds.map((participantId) => ({
          conversationId: conversation.id,
          userId: participantId,
          joinedAt: new Date(),
          lastReadAt: new Date(),
          isAdmin: participantId === userId, // Creator is admin
        }))
      );

      return conversation;
    });

    return NextResponse.json({
      conversation: newConversation,
      message: "Conversation created successfully",
    });
  } catch (error) {
    console.error("Error creating conversation:", error);
    return NextResponse.json(
      { error: "Failed to create conversation" },
      { status: 500 }
    );
  }
}