import { supabase } from './supabase';

export interface FileUploadResult {
  url: string;
  path: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
}

// Client-side file compression for images
export async function compressImage(file: File): Promise<File> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Calculate new dimensions (max 1024x1024)
      let { width, height } = img;
      const maxSize = 1024;

      if (width > height && width > maxSize) {
        height = (height * maxSize) / width;
        width = maxSize;
      } else if (height > maxSize) {
        width = (width * maxSize) / height;
        height = maxSize;
      }

      canvas.width = width;
      canvas.height = height;

      // Draw and compress
      ctx?.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          } else {
            resolve(file); // Fallback to original if compression fails
          }
        },
        'image/jpeg',
        0.8 // Quality: 80%
      );
    };

    img.src = URL.createObjectURL(file);
  });
}

// Validate file type and size
export function validateFile(file: File): { isValid: boolean; error?: string } {
  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/pdf',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
  ];

  const maxSize = 10 * 1024 * 1024; // 10MB

  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: 'File type not supported. Please upload images, PDF, Excel, or text files.',
    };
  }

  if (file.size > maxSize) {
    return {
      isValid: false,
      error: 'File size too large. Maximum size is 10MB.',
    };
  }

  return { isValid: true };
}

// Upload file to Supabase Storage
export async function uploadFile(
  file: File,
  userId: string,
  conversationId: string
): Promise<FileUploadResult> {
  // Generate unique file name
  const timestamp = Date.now();
  const fileExt = file.name.split('.').pop();
  const fileName = `${timestamp}-${Math.random().toString(36).substring(2)}.${fileExt}`;
  const filePath = `chat/${conversationId}/${userId}/${fileName}`;

  // Upload to Supabase
  const { data, error } = await supabase.storage
    .from('chat-files')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    throw new Error(`Upload failed: ${error.message}`);
  }

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('chat-files')
    .getPublicUrl(filePath);

  return {
    url: publicUrl,
    path: filePath,
    fileName: file.name,
    fileSize: file.size,
    mimeType: file.type,
  };
}

// Delete file from Supabase Storage
export async function deleteFile(filePath: string): Promise<void> {
  const { error } = await supabase.storage
    .from('chat-files')
    .remove([filePath]);

  if (error) {
    throw new Error(`Delete failed: ${error.message}`);
  }
}