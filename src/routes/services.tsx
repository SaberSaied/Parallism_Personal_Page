import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useEffect, useTransition } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Send,
  Search,
  FileText,
  CheckCircle2,
  Clock,
  AlertCircle,
  Upload,
  X,
  User,
  ClipboardList,
  FileType,
  RotateCw,
  CircleQuestionMark,
} from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";

import { submitCitizenRequest, trackCitizenRequest } from "@/lib/requests.functions";
import { supabase } from "@/integrations/supabase/client";
import {
  REQUEST_STATUS_LABELS,
  type CitizenRequestPublic,
  type RequestStatus,
} from "@/lib/parliament-types";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "خدمات المواطنين - النائب مجدي بيومي" },
      {
        name: "description",
        content:
          "قدّم معاملتك للمكتب البرلماني للنائب مجدي بيومي أو تابع حالتها برقم التتبع أو الرقم القومي.",
      },
    ],
  }),
  component: () => (
    <SiteLayout>
      <ServicesPage />
    </SiteLayout>
  ),
});

const categories = ["شكوى", "طلب خدمة", "اقتراح بقانون", "استشارة"] as const;
const MAX_BYTES = 5 * 1024 * 1024;

const ALLOWED_MIME = new Set<string>([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);
const ALLOWED_EXT = new Set<string>(["jpg", "jpeg", "png", "webp", "pdf", "doc", "docx"]);
const ACCEPT_ATTR =
  ".jpg,.jpeg,.png,.webp,.pdf,.doc,.docx,image/jpeg,image/png,image/webp,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document";

function validateFile(f: File): string | null {
  const ext = (f.name.split(".").pop() || "").toLowerCase();
  const mimeOk = f.type ? ALLOWED_MIME.has(f.type) : true; // some browsers send empty type
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

type UploadKind = "image" | "pdf" | "office";
type UploadStatus = "pending" | "uploading" | "done" | "error";
interface UploadItem {
  id: string;
  file: File;
  kind: UploadKind;
  previewUrl: string | null;
  progress: number;
  status: UploadStatus;
  error?: string;
  remotePath?: string;
}
function fileKind(f: File): UploadKind {
  const t = f.type;
  if (t.startsWith("image/")) return "image";
  if (t === "application/pdf" || f.name.toLowerCase().endsWith(".pdf")) return "pdf";
  return "office";
}

function ServicesPage() {
  const [tab, setTab] = useState<"create" | "track">("create");
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-extrabold text-navy-800 md:text-4xl">خدمات المواطنين</h1>
      <p className="mt-2 text-navy-500">قدّم معاملتك أو تابع حالتها برقم التتبع أو الرقم القومي.</p>

      <div className="mt-6 inline-flex rounded-xl bg-navy-100 p-1">
        <button
          onClick={() => setTab("create")}
          className={`rounded-lg px-5 cursor-pointer py-2 text-sm font-bold transition ${tab === "create" ? "bg-white text-navy-800 shadow" : "text-navy-600"}`}
        >
          <Send className="mr-2 inline h-4 w-4" /> تقديم معاملة
        </button>
        <button
          onClick={() => setTab("track")}
          className={`rounded-lg cursor-pointer px-5 py-2 text-sm font-bold transition ${tab === "track" ? "bg-white text-navy-800 shadow" : "text-navy-600"}`}
        >
          <Search className="mr-2 inline h-4 w-4" /> تتبع معاملة
        </button>
      </div>

      <div className="mt-6">{tab === "create" ? <CreateForm /> : <TrackForm />}</div>
    </div>
  );
}

function CreateForm() {
  const submit = useServerFn(submitCitizenRequest);
  const [result, setResult] = useState<string | null>(null);
  const [item, setItem] = useState<UploadItem | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [phone, setPhone] = useState("");
  const [civilId, setCivilId] = useState("");
  const [showUpload, setShowUpload] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(
    () => () => {
      if (item?.previewUrl) URL.revokeObjectURL(item.previewUrl);
    },
    [],
  ); // eslint-disable-line react-hooks/exhaustive-deps

  const m = useMutation({
    mutationFn: (data: any) => submit({ data }),
    onSuccess: (r, variables) => {
      setResult(r.tracking_number);
      toast.success("تم استلام معاملتك بنجاح");

      try {
        console.log("[CreateForm] onSuccess response:", r, "variables:", variables);
        const saved = JSON.parse(localStorage.getItem("local_citizen_requests") || "[]");
        const newRequest = {
          tracking_number: r.tracking_number,
          citizen_name: String(variables?.citizenName || ""),
          citizen_civil_id: String(variables?.citizenCivilId || ""),
          citizen_phone: String(variables?.citizenPhone || ""),
          citizen_email: variables?.citizenEmail ? String(variables.citizenEmail) : null,
          title: String(variables?.title || ""),
          category: String(variables?.category || ""),
          description: String(variables?.description || ""),
          attachments: variables?.attachments || [],
          status: "submitted" as const,
          admin_notes: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        console.log("[CreateForm] Saving request locally:", newRequest);
        saved.push(newRequest);
        localStorage.setItem("local_citizen_requests", JSON.stringify(saved));
        console.log("[CreateForm] Saved list:", saved);
      } catch (err) {
        console.error("[CreateForm] Failed to save request locally:", err);
      }
    },
    onError: (e: any) => toast.error(e.message || "تعذر إرسال المعاملة"),
  });

  const acceptFile = (f: File) => {
    const err = validateFile(f);
    if (err) {
      toast.error(err);
      return;
    }
    setItem((prev) => {
      if (prev?.previewUrl) URL.revokeObjectURL(prev.previewUrl);
      return null;
    });
    const kind = fileKind(f);
    const previewUrl = kind === "image" || kind === "pdf" ? URL.createObjectURL(f) : null;
    const newItem: UploadItem = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      file: f,
      kind,
      previewUrl,
      progress: 0,
      status: "pending",
    };
    setItem(newItem);
    uploadOne(newItem).catch((e) => console.error("Upload error on file accept:", e));
  };

  const onFilesPicked = (list: FileList | null) => {
    if (!list || list.length === 0) return;
    if (list.length > 1) toast("الرفع يقبل ملفًا واحدًا فقط — تم اختيار أول ملف");
    acceptFile(list[0]);
    if (inputRef.current) inputRef.current.value = "";
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    onFilesPicked(e.dataTransfer.files);
  };

  const removeItem = () => {
    setItem((prev) => {
      if (prev?.previewUrl) URL.revokeObjectURL(prev.previewUrl);
      return null;
    });
    setShowUpload(false);
  };

  const uploadOne = async (it: UploadItem): Promise<string> => {
    try {
      setItem((prev) =>
        prev && prev.id === it.id
          ? { ...prev, progress: 0, status: "uploading", error: undefined }
          : prev,
      );
      const ext = it.file.name.includes(".") ? it.file.name.split(".").pop() : "";
      const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext ? `.${ext}` : ""}`;

      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.floor(Math.random() * 15) + 5;
        if (progress > 90) progress = 90;
        setItem((prev) =>
          prev && prev.id === it.id ? { ...prev, progress, status: "uploading" } : prev,
        );
      }, 150);

      const { data, error } = await supabase.storage
        .from("request-attachments")
        .upload(path, it.file, {
          cacheControl: "3600",
          upsert: false,
        });

      clearInterval(interval);

      if (error) throw error;

      setItem((prev) =>
        prev && prev.id === it.id
          ? { ...prev, progress: 100, status: "done", remotePath: path }
          : prev,
      );

      return path;
    } catch (e: any) {
      setItem((prev) =>
        prev && prev.id === it.id ? { ...prev, status: "error", error: e.message } : prev,
      );
      throw e;
    }
  };

  const retryUpload = async () => {
    if (!item) return;
    setUploading(true);
    try {
      await uploadOne(item);
      toast.success("تم رفع الملف");
    } catch (e: any) {
      toast.error(e.message || "فشل الرفع");
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    startTransition(async () => {
      setUploading(true);
      try {
        const attachments: string[] = [];
        if (item) {
          if (item.status === "done" && item.remotePath) {
            attachments.push(item.remotePath);
          } else {
            const p = await uploadOne(item);
            attachments.push(p);
          }
        }
        await m.mutateAsync({
          citizenName: f.get("citizenName"),
          citizenCivilId: f.get("citizenCivilId"),
          citizenPhone: f.get("citizenPhone"),
          citizenEmail: f.get("citizenEmail") || "",
          title: f.get("title"),
          category: f.get("category"),
          description: f.get("description"),
          attachments,
        });
      } catch (err: any) {
        toast.error(err.message || "تعذر رفع الملف");
      } finally {
        setUploading(false);
      }
    });
  };

  const hasError = item?.status === "error";
  const submitLabel = uploading
    ? `جارٍ الرفع... ${item?.progress ?? 0}%`
    : hasError
      ? "إعادة محاولة الرفع والإرسال"
      : isPending
        ? "جارٍ الإرسال..."
        : "إرسال المعاملة";

  if (result) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-8 text-center">
        <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600" />
        <h3 className="mt-3 text-xl font-bold text-emerald-900">تم استلام معاملتك</h3>
        <p className="mt-2 text-sm text-emerald-800">
          احتفظ برقم التتبع التالي للاستعلام عن حالة معاملتك:
        </p>
        <div className="mt-4 inline-block rounded-lg bg-white px-6 py-3 font-mono text-lg font-bold text-emerald-700 ring-2 ring-emerald-300">
          {result}
        </div>
        <div className="mt-6">
          <button
            onClick={() => {
              setResult(null);
              if (item?.previewUrl) URL.revokeObjectURL(item.previewUrl);
              setItem(null);
              setPhone("");
              setCivilId("");
            }}
            className="rounded-lg cursor-pointer bg-navy-800 px-5 py-2 text-sm font-bold text-white hover:bg-navy-700"
          >
            تقديم معاملة أخرى
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <section className="rounded-2xl border border-navy-100 bg-white p-6 shadow-sm">
        <SectionHeader
          icon={<User className="h-4 w-4" />}
          title="بيانات المستخدم"
          subtitle="معلومات التواصل الشخصية"
        />
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="الاسم بالكامل">
            <input
              required
              name="citizenName"
              className="input"
              placeholder="مثال: محمد أحمد إبراهيم"
              minLength={3}
              maxLength={120}
              pattern="^[a-zA-Z\u0600-\u06FF\s]+$"
              title="الاسم يجب أن يحتوي على حروف فقط (العربية أو الإنجليزية)"
            />
          </Field>
          <Field label="رقم الموبايل">
            <input
              required
              name="citizenPhone"
              className="input"
              dir="ltr"
              placeholder="01xxxxxxxxx"
              inputMode="tel"
              minLength={11}
              maxLength={11}
              pattern="^01[0125]\d{8}$"
              title="رقم الهاتف يجب أن يكون رقم هاتف مصري مكون من 11 رقماً ويبدأ بـ 010 أو 011 أو 012 أو 015"
              value={phone}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, "");
                if (val.length <= 11) {
                  setPhone(val);
                }
              }}
            />
          </Field>
          <Field label="الرقم القومي">
            <input
              required
              name="citizenCivilId"
              className="input"
              dir="ltr"
              placeholder="14 رقمًا"
              inputMode="numeric"
              minLength={14}
              maxLength={14}
              pattern="^[23]\d{13}$"
              title="الرقم القومي يجب أن يتكون من 14 رقماً ويبدأ بـ 2 أو 3"
              value={civilId}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, "");
                if (val.length <= 14) {
                  setCivilId(val);
                }
              }}
            />
          </Field>
          <Field
            label={
              <>
                البريد الإلكتروني{" "}
                <span className="text-xs font-normal text-navy-400">(اختياري)</span>
              </>
            }
          >
            <input
              type="email"
              name="citizenEmail"
              className="input"
              dir="ltr"
              placeholder="name@example.com"
            />
          </Field>
        </div>
      </section>

      <section className="rounded-2xl border border-navy-100 bg-white p-6 shadow-sm">
        <SectionHeader
          icon={<ClipboardList className="h-4 w-4" />}
          title="بيانات المعاملة"
          subtitle="تفاصيل الطلب أو الشكوى"
        />
        <div className="grid gap-4">
          <Field label="اسم الطلب">
            <input
              required
              name="title"
              className="input"
              placeholder="عنوان مختصر للمعاملة"
              minLength={4}
              maxLength={200}
            />
          </Field>
          <Field label="نوع الطلب">
            <select required name="category" className="input" defaultValue="">
              <option value="" disabled>
                اختر نوع الطلب
              </option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </Field>
          <Field label="تفاصيل عن المعاملة">
            <textarea
              required
              name="description"
              rows={6}
              className="input"
              placeholder="اشرح تفاصيل معاملتك بوضوح..."
              minLength={10}
              maxLength={5000}
            />
          </Field>
          <Field
            label={
              <>
                المرفق{" "}
                <span className="text-xs font-normal text-navy-400">(اختياري — ملف واحد)</span>
              </>
            }
          >
            <input
              ref={inputRef}
              type="file"
              accept={ACCEPT_ATTR}
              onChange={(e) => onFilesPicked(e.target.files)}
              className="hidden"
            />
            {!showUpload ? (
              <div className="flex justify-start py-1">
                <button
                  type="button"
                  onClick={() => setShowUpload(true)}
                  className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-gold-500/10 border border-gold-500/25 px-5 py-2.5 text-xs font-bold text-gold-700 hover:bg-gold-500/25 transition duration-300"
                >
                  <CircleQuestionMark className="h-4 w-4" />
                  هل تريد إضافة ملف أو مستند للمعاملة؟

                </button>
              </div>
            ) : !item ? (
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
                onDrop={onDrop}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    inputRef.current?.click();
                  }
                }}
                className={`flex w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-4 py-8 text-sm font-bold transition ${dragActive ? "border-gold-500 bg-gold-50 text-navy-900" : "border-navy-200 bg-navy-50/40 text-navy-700 hover:border-gold-400 hover:bg-gold-50"}`}
              >
                <Upload className="h-5 w-5" />
                <span>اسحب وأفلت الملف هنا أو اضغط للاختيار</span>
                <span className="text-[11px] font-normal text-navy-500">
                  JPG, PNG, WebP, PDF, DOC, DOCX — حتى 5 ميجا
                </span>
              </div>
            ) : (
              <div className="flex gap-3 rounded-lg border border-navy-100 bg-white p-3">
                <div className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded bg-navy-50">
                  {item.kind === "image" && item.previewUrl ? (
                    <img
                      src={item.previewUrl}
                      alt={item.file.name}
                      className="h-full w-full object-cover"
                    />
                  ) : item.kind === "pdf" ? (
                    <FileType className="h-7 w-7 text-rose-600" />
                  ) : (
                    <FileText className="h-7 w-7 text-blue-600" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="truncate text-xs font-bold text-navy-800">
                        {item.file.name}
                      </div>
                      <div className="text-[10px] text-navy-500">
                        {(item.file.size / 1024 / 1024).toFixed(2)} م.ب
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {item.status === "error" && (
                        <button
                          type="button"
                          onClick={retryUpload}
                          disabled={uploading}
                          aria-label="إعادة المحاولة"
                          className="inline-flex cursor-pointer items-center gap-1 rounded bg-amber-500 px-2 py-1 text-[10px] font-bold text-white hover:bg-amber-600 disabled:opacity-60"
                        >
                          <RotateCw className="h-3 w-3" /> إعادة
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={removeItem}
                        aria-label="حذف"
                        className="cursor-pointer text-rose-500 hover:text-rose-700"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <div className="mt-2">
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-navy-100">
                      <div
                        className={`h-full transition-all ${item.status === "error" ? "bg-rose-500" : item.status === "done" ? "bg-emerald-500" : "bg-gold-500"}`}
                        style={{ width: `${item.progress}%` }}
                      />
                    </div>
                    <div className="mt-1 flex items-center justify-between text-[10px]">
                      <span
                        className={
                          item.status === "error"
                            ? "text-rose-600 font-bold"
                            : item.status === "done"
                              ? "text-emerald-700 font-bold"
                              : item.status === "uploading"
                                ? "text-navy-700"
                                : "text-navy-400"
                        }
                      >
                        {item.status === "pending" && "بانتظار الرفع"}
                        {item.status === "uploading" && "جارٍ الرفع..."}
                        {item.status === "done" && "تم الرفع"}
                        {item.status === "error" && (item.error || "فشل الرفع")}
                      </span>
                      <span className="text-navy-500">{item.progress}%</span>
                    </div>
                    {item.kind !== "office" && item.previewUrl && (
                      <a
                        href={item.previewUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1 inline-block text-[10px] font-bold text-gold-700 hover:underline"
                      >
                        معاينة
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )}
          </Field>
        </div>
      </section>

      <button
        disabled={isPending || uploading}
        className="w-full rounded-lg cursor-pointer bg-gold-500 px-5 py-3 font-bold text-navy-900 hover:bg-gold-400 disabled:opacity-60"
      >
        {submitLabel}
      </button>
      <style>{`.input{width:100%;border-radius:.5rem;border:1px solid #e5e7eb;background:#fff;padding:.6rem .8rem;font-size:.9rem;outline:none;transition:border-color .15s;}.input:focus{border-color:#c5a85c;box-shadow:0 0 0 3px rgba(197,168,92,.15)}`}</style>
    </form>
  );
}

function SectionHeader({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="mb-5 flex items-center gap-3 border-b border-navy-100 pb-3">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-navy-900 text-gold-400">
        {icon}
      </span>
      <div className="min-w-0">
        <h3 className="truncate text-base font-bold text-navy-800">{title}</h3>
        <p className="truncate text-xs text-navy-500">{subtitle}</p>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: React.ReactNode; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-bold text-navy-700">{label}</span>
      {children}
    </label>
  );
}

function TrackForm() {
  const track = useServerFn(trackCitizenRequest);
  const [results, setResults] = useState<CitizenRequestPublic[] | null>(null);
  const [isPending, startTransition] = useTransition();

  const m = useMutation({
    mutationFn: (query: string) => track({ data: { query } }),
    onSuccess: (r) => {
      const serverResults = (r as CitizenRequestPublic[]) ?? [];
      setResults(serverResults);
    },
    onError: () => toast.error("تعذر البحث عن المعاملة"),
  });
  return (
    <div className="space-y-6">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const f = new FormData(e.currentTarget);
          startTransition(async () => {
            await m.mutateAsync(String(f.get("q") || "").trim());
          });
        }}
        className="rounded-2xl border border-navy-100 bg-white p-6 shadow-sm"
      >
        <Field label="رقم التتبع أو الرقم القومي">
          <input
            required
            name="q"
            placeholder="REQ-YYYYMMDD-XXXX أو الرقم القومي"
            className="input"
            dir="ltr"
            minLength={4}
            maxLength={40}
          />
        </Field>
        <div className="mt-3">
          <button
            disabled={isPending}
            className="rounded-lg cursor-pointer bg-navy-800 px-5 py-2 font-bold text-white hover:bg-navy-700 disabled:opacity-60"
          >
            {isPending ? "جارٍ البحث..." : "بحث"}
          </button>
        </div>
        <style>{`.input{width:100%;border-radius:.5rem;border:1px solid #e5e7eb;background:#fff;padding:.6rem .8rem;font-size:.9rem}.input:focus{border-color:#c5a85c;box-shadow:0 0 0 3px rgba(197,168,92,.15)}`}</style>
      </form>

      {results && results.length === 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-900">
          <AlertCircle className="ml-1 inline h-4 w-4" /> لم نعثر على معاملات. تأكد من صحة الرقم.
        </div>
      )}
      {results && results.length > 0 && (
        <div className="space-y-4">
          {results.length > 1 && (
            <div className="text-sm text-navy-500">تم العثور على {results.length} معاملة</div>
          )}
          {results.map((r) => (
            <RequestResult key={r.tracking_number} r={r} />
          ))}
        </div>
      )}
    </div>
  );
}

const statusColor: Record<RequestStatus, string> = {
  submitted: "bg-slate-100 text-slate-800",
  under_review: "bg-amber-100 text-amber-900",
  assigned: "bg-blue-100 text-blue-900",
  in_progress: "bg-indigo-100 text-indigo-900",
  resolved: "bg-emerald-100 text-emerald-900",
  closed: "bg-zinc-200 text-zinc-700",
};

function RequestResult({ r }: { r: CitizenRequestPublic }) {
  const stages: { status: RequestStatus; label: string }[] = [
    { status: "submitted", label: "مُقدّمة" },
    { status: "under_review", label: "قيد المراجعة" },
    { status: "assigned", label: "تم الإسناد" },
    { status: "in_progress", label: "قيد التنفيذ" },
    { status: "resolved", label: "تم الحل" },
  ];

  let currentIndex = stages.findIndex((s) => s.status === r.status);
  if (r.status === "closed") {
    currentIndex = stages.length - 1;
  }

  return (
    <article className="rounded-2xl border border-navy-100 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="font-mono text-xs text-navy-500">{r.tracking_number}</div>
          <h3 className="mt-1 truncate text-lg font-bold text-navy-800">{r.title}</h3>
          <div className="mt-1 text-xs text-navy-500">الفئة: {r.category}</div>
        </div>
        <span
          className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${statusColor[r.status]}`}
        >
          {REQUEST_STATUS_LABELS[r.status]}
        </span>
      </div>

      {/* Progress Timeline */}
      <div className="mt-6 border-t border-navy-100 pt-6">
        <div className="relative flex flex-col md:flex-row items-stretch md:items-center justify-between gap-6 md:gap-4">
          {/* Connector Line (Desktop) */}
          <div className="absolute right-0 top-1/2 hidden h-0.5 w-full -translate-y-1/2 bg-navy-100 md:block z-0" />
          {/* Connector Line Fill (Desktop) */}
          {currentIndex >= 0 && (
            <div
              className="absolute right-0 top-1/2 hidden h-0.5 bg-gold-500 -translate-y-1/2 md:block z-0 transition-all duration-500"
              style={{
                width: `${(currentIndex / (stages.length - 1)) * 100}%`,
              }}
            />
          )}

          {/* Connector Line (Mobile) */}
          <div className="absolute right-[13px] top-4 bottom-4 w-0.5 bg-navy-100 md:hidden z-0" />
          {currentIndex >= 0 && (
            <div
              className="absolute right-[13px] top-4 bg-gold-500 md:hidden z-0 transition-all duration-500"
              style={{
                height: `${(currentIndex / (stages.length - 1)) * 85}%`,
              }}
            />
          )}

          {stages.map((stage, idx) => {
            const isCompleted = idx <= currentIndex;
            const isActive = idx === currentIndex;
            const isClosed = r.status === "closed" && stage.status === "resolved";

            return (
              <div
                key={stage.status}
                className="relative flex md:flex-col items-center md:justify-center gap-3 md:gap-2 z-10 flex-1"
              >
                {/* Step Circle */}
                <div
                  className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-bold transition-all duration-300 ${isCompleted
                    ? isClosed
                      ? "bg-zinc-500 text-white ring-4 ring-zinc-100"
                      : isActive
                        ? "bg-gold-500 text-navy-950 ring-4 ring-gold-100 scale-110"
                        : "bg-gold-500 text-navy-950"
                    : "bg-white text-navy-400 border-2 border-navy-200"
                    }`}
                >
                  {isCompleted ? "✓" : idx + 1}
                </div>
                {/* Step Label */}
                <div className="text-right md:text-center">
                  <span
                    className={`block text-xs font-bold transition-colors ${isActive
                      ? isClosed
                        ? "text-zinc-600"
                        : "text-gold-700 font-extrabold"
                      : isCompleted
                        ? "text-navy-800"
                        : "text-navy-400"
                      }`}
                  >
                    {isClosed ? "مغلقة" : stage.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {r.admin_notes && (
        <div className="mt-6 rounded-lg bg-navy-50 p-3 text-sm text-navy-700">
          <div className="mb-1 flex items-center gap-1 text-xs font-bold text-navy-500">
            <FileText className="h-3 w-3" /> ملاحظات المكتب
          </div>
          {r.admin_notes}
        </div>
      )}
      <div className="mt-4 flex items-center gap-4 text-xs text-navy-500">
        <span className="inline-flex items-center gap-1">
          <Clock className="h-3 w-3" /> آخر تحديث: {new Date(r.updated_at).toLocaleString("ar")}
        </span>
      </div>
    </article>
  );
}
