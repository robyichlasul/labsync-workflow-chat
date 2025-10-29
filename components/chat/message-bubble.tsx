"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  File,
  FileText,
  Image,
  Download,
  MoreHorizontal,
  Edit,
  Trash2,
  Reply,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  type: "text" | "file" | "image";
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  replyToId?: string;
  isEdited: boolean;
  createdAt: string;
  updatedAt: string;
  isOwn: boolean;
}

interface MessageBubbleProps {
  message: Message;
  onReply?: (message: Message) => void;
  onEdit?: (messageId: string, newContent: string) => void;
  onDelete?: (messageId: string) => void;
  showReplyTo?: boolean;
  repliedMessage?: Message;
}

export function MessageBubble({
  message,
  onReply,
  onEdit,
  onDelete,
  showReplyTo = false,
  repliedMessage,
}: MessageBubbleProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleSaveEdit = () => {
    if (editContent.trim() && editContent !== message.content) {
      onEdit?.(message.id, editContent.trim());
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditContent(message.content);
    setIsEditing(false);
  };

  const handleDelete = () => {
    onDelete?.(message.id);
    setShowDeleteDialog(false);
  };

  const getFileIcon = (mimeType?: string) => {
    if (!mimeType) return <File className="h-4 w-4" />;
    if (mimeType.startsWith("image/")) {
      return <Image className="h-4 w-4" />;
    } else if (mimeType.includes("pdf")) {
      return <FileText className="h-4 w-4" />;
    } else {
      return <File className="h-4 w-4" />;
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "";
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const handleFileDownload = () => {
    if (message.fileUrl) {
      const link = document.createElement("a");
      link.href = message.fileUrl;
      link.download = message.fileName || "download";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className={`flex gap-3 ${message.isOwn ? "justify-end" : "justify-start"}`}>
      {!message.isOwn && (
        <Avatar className="h-8 w-8 mt-1 flex-shrink-0">
          <AvatarImage src={message.senderAvatar} />
          <AvatarFallback>{message.senderName.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
      )}

      <div className={`max-w-xs lg:max-w-md ${message.isOwn ? "order-1" : ""}`}>
        {!message.isOwn && (
          <p className="text-xs text-muted-foreground mb-1">{message.senderName}</p>
        )}

        {/* Reply to message */}
        {showReplyTo && repliedMessage && (
          <div className="mb-2 p-2 bg-muted/50 rounded-lg border-l-2 border-primary">
            <p className="text-xs font-medium text-muted-foreground mb-1">
              Replying to {repliedMessage.senderName}
            </p>
            <p className="text-sm text-muted-foreground truncate">
              {repliedMessage.content}
            </p>
          </div>
        )}

        {/* Message content */}
        <div className="group relative">
          <Card
            className={`${
              message.isOwn
                ? "bg-primary text-primary-foreground"
                : "bg-muted"
            }`}
          >
            <CardContent className="p-3">
              {/* Text message */}
              {message.type === "text" && (
                <>
                  {isEditing ? (
                    <div className="space-y-2">
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="w-full p-2 text-sm bg-background border rounded resize-none"
                        rows={3}
                        autoFocus
                      />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={handleSaveEdit}>
                          Save
                        </Button>
                        <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  )}
                </>
              )}

              {/* File message */}
              {(message.type === "file" || message.type === "image") && (
                <div className="space-y-2">
                  {message.type === "image" && message.fileUrl ? (
                    <div className="relative">
                      <img
                        src={message.fileUrl}
                        alt={message.fileName}
                        className="max-w-full rounded-lg"
                        loading="lazy"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 p-2 bg-background/10 rounded">
                      {getFileIcon(message.type === "image" ? "image/jpeg" : undefined)}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {message.fileName}
                        </p>
                        {message.fileSize && (
                          <p className="text-xs opacity-70">
                            {formatFileSize(message.fileSize)}
                          </p>
                        )}
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleFileDownload}
                        className="flex-shrink-0"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                  {message.content && (
                    <p className="text-sm">{message.content}</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Message actions */}
          <div className={`flex items-center gap-2 mt-1 ${message.isOwn ? "justify-end" : "justify-start"}`}>
            <div className="flex items-center gap-2">
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(message.createdAt), {
                  addSuffix: true,
                  locale: id,
                })}
              </p>
              {message.isEdited && (
                <Badge variant="secondary" className="text-xs">
                  edited
                </Badge>
              )}
            </div>

            {/* Action menu */}
            {message.isOwn && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <MoreHorizontal className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align={message.isOwn ? "end" : "start"}>
                  <DropdownMenuItem onClick={() => onReply?.(message)}>
                    <Reply className="h-4 w-4 mr-2" />
                    Reply
                  </DropdownMenuItem>
                  {message.type === "text" && (
                    <DropdownMenuItem onClick={() => setIsEditing(true)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem
                    onClick={() => setShowDeleteDialog(true)}
                    className="text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Message</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this message? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}