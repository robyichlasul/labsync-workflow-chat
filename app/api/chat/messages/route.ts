import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { messages, conversationParticipants, users } from "@/db/schema/labsync";
import { eq, and, desc } from "drizzle-orm";

// GET - Fetch messages for a conversation
export async function GET(request: NextRequest) {
  try {
    const { userId } = auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get("conversationId");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    if (!conversationId) {
      return NextResponse.json(
        { error: "Conversation ID is required" },
        { status: 400 }
      );
    }

    // Check if user is participant in the conversation
    const participant = await db
      .select()
      .from(conversationParticipants)
      .where(
        and(
          eq(conversationParticipants.conversationId, conversationId),
          eq(conversationParticipants.userId, userId)
        )
      )
      .limit(1);

    if (participant.length === 0) {
      return NextResponse.json(
        { error: "Not authorized to view this conversation" },
        { status: 403 }
      );
    }

    // Fetch messages with sender details
    const conversationMessages = await db
      .select({
        id: messages.id,
        content: messages.content,
        type: messages.type,
        fileUrl: messages.fileUrl,
        fileName: messages.fileName,
        fileSize: messages.fileSize,
        replyToId: messages.replyToId,
        isEdited: messages.isEdited,
        createdAt: messages.createdAt,
        updatedAt: messages.updatedAt,
        senderId: messages.senderId,
        senderName: users.name,
        senderEmail: users.email,
        senderAvatar: users.avatar,
      })
      .from(messages)
      .leftJoin(users, eq(messages.senderId, users.id))
      .where(eq(messages.conversationId, conversationId))
      .orderBy(desc(messages.createdAt))
      .limit(limit)
      .offset(offset);

    // Reverse to get chronological order
    const formattedMessages = conversationMessages.reverse().map((msg) => ({
      ...msg,
      isOwn: msg.senderId === userId,
    }));

    return NextResponse.json({ messages: formattedMessages });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}

// POST - Send new message
export async function POST(request: NextRequest) {
  try {
    const { userId } = auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { conversationId, content, type = "text", fileUrl, fileName, fileSize, replyToId } =
      await request.json();

    if (!conversationId || !content?.trim()) {
      return NextResponse.json(
        { error: "Conversation ID and content are required" },
        { status: 400 }
      );
    }

    // Check if user is participant in the conversation
    const participant = await db
      .select()
      .from(conversationParticipants)
      .where(
        and(
          eq(conversationParticipants.conversationId, conversationId),
          eq(conversationParticipants.userId, userId)
        )
      )
      .limit(1);

    if (participant.length === 0) {
      return NextResponse.json(
        { error: "Not authorized to send messages in this conversation" },
        { status: 403 }
      );
    }

    // Create message
    const [newMessage] = await db
      .insert(messages)
      .values({
        conversationId,
        senderId: userId,
        content: content.trim(),
        type,
        fileUrl: fileUrl || null,
        fileName: fileName || null,
        fileSize: fileSize || null,
        replyToId: replyToId || null,
        isEdited: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    // Update conversation's updated timestamp
    await db
      .update(conversationParticipants)
      .set({ lastReadAt: new Date() })
      .where(
        and(
          eq(conversationParticipants.conversationId, conversationId),
          eq(conversationParticipants.userId, userId)
        )
      );

    return NextResponse.json({
      message: newMessage,
      success: true,
    });
  } catch (error) {
    console.error("Error sending message:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}