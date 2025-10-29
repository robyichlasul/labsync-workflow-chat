"use client";

import { useEffect, useRef, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { RealtimeChannel } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  type: "text" | "file" | "image";
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  replyToId?: string;
  isEdited: boolean;
  createdAt: string;
  updatedAt: string;
  senderName?: string;
  senderEmail?: string;
  senderAvatar?: string;
  isOwn?: boolean;
}

interface UseRealtimeChatOptions {
  conversationId?: string;
  onNewMessage?: (message: Message) => void;
  onMessageUpdate?: (message: Message) => void;
  onTypingStart?: (userId: string) => void;
  onTypingStop?: (userId: string) => void;
}

export function useRealtimeChat({
  conversationId,
  onNewMessage,
  onMessageUpdate,
  onTypingStart,
  onTypingStop,
}: UseRealtimeChatOptions) {
  const { user } = useUser();
  const [isConnected, setIsConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const channelRef = useRef<RealtimeChannel | null>(null);

  // Connect to Supabase Realtime
  useEffect(() => {
    if (!conversationId || !user?.id) return;

    const channel = supabase
      .channel(`chat:${conversationId}`)
      .on("presence", { event: "sync" }, () => {
        setIsConnected(true);
      })
      .on("presence", { event: "join" }, ({ key, newPresences }) => {
        console.log("User joined:", key, newPresences);
      })
      .on("presence", { event: "leave" }, ({ key, leftPresences }) => {
        console.log("User left:", key, leftPresences);
      })
      .on(
        "broadcast",
        { event: "new_message" },
        (payload) => {
          const message = payload.payload as Message;
          onNewMessage?.(message);
        }
      )
      .on(
        "broadcast",
        { event: "message_update" },
        (payload) => {
          const message = payload.payload as Message;
          onMessageUpdate?.(message);
        }
      )
      .on(
        "broadcast",
        { event: "typing_start" },
        (payload) => {
          const { userId: typingUserId } = payload.payload as { userId: string };
          if (typingUserId !== user?.id) {
            onTypingStart?.(typingUserId);
          }
        }
      )
      .on(
        "broadcast",
        { event: "typing_stop" },
        (payload) => {
          const { userId: typingUserId } = payload.payload as { userId: string };
          if (typingUserId !== user?.id) {
            onTypingStop?.(typingUserId);
          }
        }
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          setIsConnected(true);

          // Set user presence
          channel.track({
            user_id: user.id,
            user_name: `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.emailAddresses[0]?.emailAddress,
            online_at: new Date().toISOString(),
          });
        } else if (status === "CHANNEL_ERROR") {
          setIsConnected(false);
        }
      });

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
      setIsConnected(false);
    };
  }, [conversationId, user?.id, onNewMessage, onMessageUpdate, onTypingStart, onTypingStop]);

  // Send typing indicator
  const sendTypingStart = () => {
    if (!conversationId || !user?.id || !isConnected) return;

    setIsTyping(true);
    channelRef.current?.send({
      type: "broadcast",
      event: "typing_start",
      payload: { userId: user.id },
    });

    // Auto-stop typing after 3 seconds
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    typingTimeoutRef.current = setTimeout(() => {
      sendTypingStop();
    }, 3000);
  };

  const sendTypingStop = () => {
    if (!conversationId || !user?.id || !isConnected) return;

    setIsTyping(false);
    channelRef.current?.send({
      type: "broadcast",
      event: "typing_stop",
      payload: { userId: user.id },
    });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  };

  // Send new message
  const sendMessage = async (
    content: string,
    type: "text" | "file" | "image" = "text",
    fileData?: {
      fileUrl: string;
      fileName: string;
      fileSize: number;
    }
  ) => {
    if (!conversationId || !user?.id) {
      throw new Error("Not authenticated or no conversation selected");
    }

    const messageData = {
      conversationId,
      senderId: user.id,
      content,
      type,
      fileUrl: fileData?.fileUrl,
      fileName: fileData?.fileName,
      fileSize: fileData?.fileSize,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isEdited: false,
    };

    try {
      // Send via API
      const response = await fetch("/api/chat/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(messageData),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      const { message } = await response.json();

      // Broadcast to real-time channel
      channelRef.current?.send({
        type: "broadcast",
        event: "new_message",
        payload: {
          ...message,
          senderName: `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.emailAddresses[0]?.emailAddress,
          senderEmail: user.emailAddresses[0]?.emailAddress,
          senderAvatar: user.imageUrl,
          isOwn: false,
        },
      });

      return message;
    } catch (error) {
      console.error("Error sending message:", error);
      throw error;
    }
  };

  // Update message (edit)
  const updateMessage = async (messageId: string, newContent: string) => {
    try {
      const response = await fetch(`/api/chat/messages/${messageId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: newContent,
          isEdited: true,
          updatedAt: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update message");
      }

      const { message } = await response.json();

      // Broadcast update
      channelRef.current?.send({
        type: "broadcast",
        event: "message_update",
        payload: message,
      });

      return message;
    } catch (error) {
      console.error("Error updating message:", error);
      throw error;
    }
  };

  // Delete message
  const deleteMessage = async (messageId: string) => {
    try {
      const response = await fetch(`/api/chat/messages/${messageId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete message");
      }

      return true;
    } catch (error) {
      console.error("Error deleting message:", error);
      throw error;
    }
  };

  return {
    isConnected,
    isTyping,
    sendMessage,
    updateMessage,
    deleteMessage,
    sendTypingStart,
    sendTypingStop,
  };
}