import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { messages, conversationParticipants } from "@/db/schema/labsync";
import { eq, and } from "drizzle-orm";

// PATCH - Update message (edit)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const messageId = params.id;
    const { content, isEdited, updatedAt } = await request.json();

    if (!content?.trim()) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      );
    }

    // Check if message exists and belongs to user
    const [existingMessage] = await db
      .select({
        id: messages.id,
        senderId: messages.senderId,
        conversationId: messages.conversationId,
      })
      .from(messages)
      .where(eq(messages.id, messageId))
      .limit(1);

    if (!existingMessage) {
      return NextResponse.json(
        { error: "Message not found" },
        { status: 404 }
      );
    }

    if (existingMessage.senderId !== userId) {
      return NextResponse.json(
        { error: "Not authorized to edit this message" },
        { status: 403 }
      );
    }

    // Check if user is participant in the conversation
    const participant = await db
      .select()
      .from(conversationParticipants)
      .where(
        and(
          eq(conversationParticipants.conversationId, existingMessage.conversationId),
          eq(conversationParticipants.userId, userId)
        )
      )
      .limit(1);

    if (participant.length === 0) {
      return NextResponse.json(
        { error: "Not authorized to access this conversation" },
        { status: 403 }
      );
    }

    // Update message
    const [updatedMessage] = await db
      .update(messages)
      .set({
        content: content.trim(),
        isEdited: isEdited || true,
        updatedAt: updatedAt ? new Date(updatedAt) : new Date(),
      })
      .where(eq(messages.id, messageId))
      .returning();

    return NextResponse.json({
      message: updatedMessage,
      success: true,
    });
  } catch (error) {
    console.error("Error updating message:", error);
    return NextResponse.json(
      { error: "Failed to update message" },
      { status: 500 }
    );
  }
}

// DELETE - Delete message
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const messageId = params.id;

    // Check if message exists and belongs to user
    const [existingMessage] = await db
      .select({
        id: messages.id,
        senderId: messages.senderId,
        conversationId: messages.conversationId,
      })
      .from(messages)
      .where(eq(messages.id, messageId))
      .limit(1);

    if (!existingMessage) {
      return NextResponse.json(
        { error: "Message not found" },
        { status: 404 }
      );
    }

    if (existingMessage.senderId !== userId) {
      return NextResponse.json(
        { error: "Not authorized to delete this message" },
        { status: 403 }
      );
    }

    // Check if user is participant in the conversation
    const participant = await db
      .select()
      .from(conversationParticipants)
      .where(
        and(
          eq(conversationParticipants.conversationId, existingMessage.conversationId),
          eq(conversationParticipants.userId, userId)
        )
      )
      .limit(1);

    if (participant.length === 0) {
      return NextResponse.json(
        { error: "Not authorized to access this conversation" },
        { status: 403 }
      );
    }

    // Delete message (soft delete by updating content)
    await db
      .update(messages)
      .set({
        content: "This message has been deleted",
        isEdited: true,
        updatedAt: new Date(),
      })
      .where(eq(messages.id, messageId));

    return NextResponse.json({
      success: true,
      message: "Message deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting message:", error);
    return NextResponse.json(
      { error: "Failed to delete message" },
      { status: 500 }
    );
  }
}