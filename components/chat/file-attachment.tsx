"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Paperclip, X, File, Image, FileText } from "lucide-react";
import { validateFile, compressImage, uploadFile } from "@/lib/file-upload";
import { useUser } from "@clerk/nextjs";

interface FileAttachmentProps {
  conversationId: string;
  onFileUploaded: (fileData: {
    fileUrl: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
  }) => void;
}

interface UploadingFile {
  id: string;
  file: File;
  progress: number;
  status: "uploading" | "success" | "error";
  error?: string;
}

export function FileAttachment({ conversationId, onFileUploaded }: FileAttachmentProps) {
  const { user } = useUser();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);

    if (!user?.id || files.length === 0) return;

    // Validate each file
    const validFiles: File[] = [];
    for (const file of files) {
      const validation = validateFile(file);
      if (!validation.isValid) {
        console.error("Invalid file:", validation.error);
        continue;
      }
      validFiles.push(file);
    }

    if (validFiles.length === 0) return;

    setIsUploading(true);

    // Initialize uploading files
    const initialFiles: UploadingFile[] = validFiles.map(file => ({
      id: `${Date.now()}-${Math.random().toString(36).substring(2)}`,
      file,
      progress: 0,
      status: "uploading",
    }));

    setUploadingFiles(prev => [...prev, ...initialFiles]);

    // Upload each file
    for (const uploadingFile of initialFiles) {
      try {
        let fileToUpload = uploadingFile.file;

        // Compress images
        if (fileToUpload.type.startsWith("image/")) {
          fileToUpload = await compressImage(fileToUpload);
        }

        // Simulate progress
        const progressInterval = setInterval(() => {
          setUploadingFiles(prev =>
            prev.map(f =>
              f.id === uploadingFile.id
                ? { ...f, progress: Math.min(f.progress + 10, 90) }
                : f
            )
          );
        }, 100);

        // Upload to Supabase
        const uploadResult = await uploadFile(fileToUpload, user.id, conversationId);

        clearInterval(progressInterval);

        // Mark as success
        setUploadingFiles(prev =>
          prev.map(f =>
            f.id === uploadingFile.id
              ? { ...f, progress: 100, status: "success" }
              : f
          )
        );

        // Notify parent
        onFileUploaded({
          fileUrl: uploadResult.url,
          fileName: uploadResult.fileName,
          fileSize: uploadResult.fileSize,
          mimeType: uploadResult.mimeType,
        });

        // Remove from uploading list after delay
        setTimeout(() => {
          setUploadingFiles(prev => prev.filter(f => f.id !== uploadingFile.id));
        }, 2000);

      } catch (error) {
        console.error("Upload failed:", error);

        // Mark as error
        setUploadingFiles(prev =>
          prev.map(f =>
            f.id === uploadingFile.id
              ? { ...f, status: "error", error: error instanceof Error ? error.message : "Upload failed" }
              : f
          )
        );

        // Remove from uploading list after delay
        setTimeout(() => {
          setUploadingFiles(prev => prev.filter(f => f.id !== uploadingFile.id));
        }, 3000);
      }
    }

    setIsUploading(false);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeUploadingFile = (fileId: string) => {
    setUploadingFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith("image/")) {
      return <Image className="h-4 w-4" />;
    } else if (mimeType.includes("pdf")) {
      return <FileText className="h-4 w-4" />;
    } else {
      return <File className="h-4 w-4" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  return (
    <div className="space-y-2">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,.pdf,.xlsx,.xls,.doc,.docx,.txt"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Upload button */}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
      >
        <Paperclip className="h-4 w-4" />
        {isUploading ? "Uploading..." : "Attach File"}
      </Button>

      {/* Uploading files */}
      {uploadingFiles.length > 0 && (
        <div className="space-y-2">
          {uploadingFiles.map((uploadingFile) => (
            <Card key={uploadingFile.id} className="p-2">
              <CardContent className="p-0">
                <div className="flex items-center gap-2">
                  {getFileIcon(uploadingFile.file.type)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {uploadingFile.file.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(uploadingFile.file.size)}
                    </p>
                  </div>
                  {uploadingFile.status === "uploading" && (
                    <div className="w-16">
                      <Progress value={uploadingFile.progress} className="h-1" />
                    </div>
                  )}
                  {uploadingFile.status === "success" && (
                    <div className="text-green-600 text-xs">✓</div>
                  )}
                  {uploadingFile.status === "error" && (
                    <div className="flex items-center gap-1">
                      <div className="text-red-600 text-xs">✗</div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeUploadingFile(uploadingFile.id)}
                        className="h-6 w-6 p-0"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>
                {uploadingFile.status === "error" && (
                  <p className="text-xs text-red-600 mt-1">
                    {uploadingFile.error}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}