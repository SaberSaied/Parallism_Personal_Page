export const MAX_BYTES = 5 * 1024 * 1024;

export const ALLOWED_MIME = new Set<string>([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);
export const ALLOWED_EXT = new Set<string>(["jpg", "jpeg", "png", "webp", "pdf", "doc", "docx"]);
export const ACCEPT_ATTR =
  ".jpg,.jpeg,.png,.webp,.pdf,.doc,.docx,image/jpeg,image/png,image/webp,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document";

export type UploadKind = "image" | "pdf" | "office";
export type UploadStatus = "pending" | "uploading" | "done" | "error";
export interface UploadItem {
  id: string;
  file: File;
  kind: UploadKind;
  previewUrl: string | null;
  progress: number;
  status: UploadStatus;
  error?: string;
  remotePath?: string;
}

export function validateFile(f: File): string | null {
  const ext = (f.name.split(".").pop() || "").toLowerCase();
  const mimeOk = f.type ? ALLOWED_MIME.has(f.type) : true;
  const extOk = ALLOWED_EXT.has(ext);
  if (!extOk || !mimeOk) {
    return `الملف "${f.name}" غير مسموح. الأنواع المسموحة: صور JPG/PNG/WebP وPDF وWord (doc/docx)`;
  }
  if (f.size > MAX_BYTES) {
    return `الملف "${f.name}" أكبر من الحد المسموح (5 ميجا). الحجم الحالي: ${(f.size / 1024 / 1024).toFixed(2)} م.ب`;
  }
  if (f.size === 0) {
    return `الملف "${f.name}" فارغ`;
  }
  return null;
}

export function fileKind(f: File): UploadKind {
  const t = f.type;
  if (t.startsWith("image/")) return "image";
  if (t === "application/pdf" || f.name.toLowerCase().endsWith(".pdf")) return "pdf";
  return "office";
}

import { supabase } from "@/integrations/supabase/client";

export function uploadWithProgress(file: File, onProgress: (pct: number) => void): Promise<string> {
  return new Promise(async (resolve, reject) => {
    try {
      const ext = file.name.includes(".") ? file.name.split(".").pop() : "";
      const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext ? `.${ext}` : ""}`;

      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.floor(Math.random() * 15) + 5;
        if (progress > 90) progress = 90;
        onProgress(progress);
      }, 150);

      const { data, error } = await supabase.storage
        .from("request-attachments")
        .upload(path, file, {
          cacheControl: "3600",
          upsert: false,
        });

      clearInterval(interval);

      if (error) throw error;

      onProgress(100);
      resolve(path);
    } catch (e) {
      reject(e);
    }
  });
}

export const CATEGORIES = ["شكوى", "طلب خدمة", "اقتراح بقانون", "استشارة"] as const;
