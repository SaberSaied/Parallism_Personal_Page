import type { ReactNode } from "react";
import { useEffect } from "react";
import { cn } from "@/lib/utils";
import type { RequestStatus } from "@/lib/parliament-types";

export const STATUS_COLORS: Record<RequestStatus, string> = {
  submitted: "#94a3b8",
  under_review: "#f59e0b",
  assigned: "#3b82f6",
  in_progress: "#6366f1",
  resolved: "#10b981",
  closed: "#52525b",
};

import type { ComponentType } from "react";

export function StatCard({
  label,
  value,
  accent,
  icon: Icon,
}: {
  label: string;
  value: number;
  accent: string;
  icon?: ComponentType<{ className?: string }>;
}) {
  return (
    <div className="rounded-2xl border border-navy-100 bg-white p-4 shadow-sm">
      <div
        className={cn(
          "mb-2 inline-flex h-9 w-9 items-center justify-center rounded-lg text-sm font-bold",
          accent,
        )}
      >
        {Icon ? <Icon className="h-5 w-5" /> : "●"}
      </div>
      <div className="text-2xl font-extrabold text-navy-800 sm:text-3xl">
        {value.toLocaleString("ar-EG")}
      </div>
      <div className="mt-1 text-xs text-navy-500">{label}</div>
    </div>
  );
}

export function ChartCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-navy-100 bg-white p-4 shadow-sm">
      <h3 className="mb-3 text-sm font-bold text-navy-800">{title}</h3>
      {children}
    </div>
  );
}

export function Modal({
  children,
  onClose,
  title,
}: {
  children: ReactNode;
  onClose: () => void;
  title: string;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-2xl bg-white p-5 shadow-xl sm:rounded-2xl sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="truncate text-lg font-bold text-navy-800">{title}</h3>
          <button
            onClick={onClose}
            aria-label="إغلاق"
            className="text-2xl cursor-pointer leading-none text-navy-500 hover:text-navy-800"
          >
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function FieldRow({
  field,
  defaultValue,
}: {
  field: { key: any; label: string; type?: string; rows?: number; options?: string[] };
  defaultValue?: any;
}) {
  const common = "w-full rounded-lg border border-navy-200 p-2 text-sm";
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-bold text-navy-700">{field.label}</span>
      {field.options ? (
        <select name={field.key} defaultValue={defaultValue ?? field.options[0]} className={common}>
          {field.options.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      ) : field.rows ? (
        <textarea
          name={field.key}
          defaultValue={defaultValue ?? ""}
          rows={field.rows}
          className={common}
          required
        />
      ) : (
        <input
          name={field.key}
          type={field.type ?? "text"}
          defaultValue={defaultValue ?? ""}
          className={common}
          required
          dir={
            field.type === "number" ||
            field.key === "image" ||
            field.key === "image_url" ||
            field.key === "slug"
              ? "ltr"
              : "auto"
          }
        />
      )}
    </label>
  );
}

export function csvEscape(v: any): string {
  const s = v == null ? "" : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function downloadBlob(content: string, filename: string, mime: string) {
  const blob = new Blob(["\uFEFF" + content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

import { useState, useRef } from "react";
import { Upload, X } from "lucide-react";

interface AdminImageUploadProps {
  label: string;
  preview: string | null;
  onFileSelect: (file: File | null) => void;
  onClear: () => void;
  onLinkChange: (url: string) => void;
}

export function AdminImageUpload({ label, preview, onFileSelect, onClear, onLinkChange }: AdminImageUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [linkInput, setLinkInput] = useState("");

  return (
    <div className="space-y-2">
      <span className="block text-sm font-bold text-navy-700">{label}</span>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0] || null;
          onFileSelect(file);
        }}
        className="hidden"
      />
      {!preview ? (
        <div className="space-y-2">
          <div
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setDragActive(true);
            }}
            onDragEnter={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setDragActive(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setDragActive(false);
            }}
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setDragActive(false);
              const file = e.dataTransfer.files?.[0] || null;
              onFileSelect(file);
            }}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                inputRef.current?.click();
              }
            }}
            className={`flex w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-4 py-8 text-sm font-bold transition ${
              dragActive
                ? "border-gold-500 bg-gold-50 text-navy-900"
                : "border-navy-200 bg-navy-50/40 text-navy-700 hover:border-gold-400 hover:bg-gold-50"
            }`}
          >
            <Upload className="h-5 w-5 text-navy-500" />
            <span>اسحب وأفلت الصورة هنا أو اضغط للاختيار</span>
            <span className="text-[11px] font-normal text-navy-500">
              أو اختر ملف صورة JPG, PNG, WebP
            </span>
          </div>
          <div className="flex gap-2">
            <input
              type="url"
              placeholder="أو ألصق رابط الصورة مباشرة هنا..."
              value={linkInput}
              onChange={(e) => setLinkInput(e.target.value)}
              className="flex-1 rounded-lg border border-navy-200 px-3 py-2 text-xs focus:border-gold-500 focus:outline-none ltr"
              dir="ltr"
            />
            <button
              type="button"
              onClick={() => {
                if (linkInput.trim()) {
                  onLinkChange(linkInput.trim());
                  setLinkInput("");
                }
              }}
              className="rounded-lg bg-navy-800 px-4 py-2 text-xs font-bold text-white hover:bg-navy-700 transition shrink-0"
            >
              إضافة الرابط
            </button>
          </div>
        </div>
      ) : (
        <div className="flex gap-3 rounded-lg border border-navy-100 bg-white p-3">
          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded bg-navy-50">
            <img src={preview} alt="Preview" className="h-full w-full object-cover" />
          </div>
          <div className="min-w-0 flex-1 flex items-center justify-between gap-2">
            <div className="truncate text-xs font-bold text-navy-800">
              {preview.startsWith("blob:") ? "الصورة المختارة" : "رابط الصورة المضاف"}
            </div>
            <button
              type="button"
              onClick={() => {
                onClear();
                if (inputRef.current) inputRef.current.value = "";
              }}
              aria-label="حذف"
              className="cursor-pointer text-rose-500 hover:text-rose-700 animate-pulse"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
