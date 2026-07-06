import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Paperclip, ExternalLink, Download } from "lucide-react";
import { getAttachmentUrl } from "@/lib/requests.functions";

export function AttachmentsList({ paths }: { paths: string[] }) {
  const getUrl = useServerFn(getAttachmentUrl);
  const openAttachment = async (path: string) => {
    try {
      const { url } = await getUrl({ data: { path } });
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (e: any) {
      toast.error(e.message || "تعذر فتح الملف");
    }
  };
  return (
    <div className="relative z-50">
      <div className="mb-1 flex items-center gap-1 text-xs font-bold text-navy-500">
        <Paperclip className="h-3 w-3" /> المرفقات ({paths.length})
      </div>
      <ul className="space-y-1">
        {paths.map((p) => (
          <li key={p}>
            <button
              onClick={() => openAttachment(p)}
              className="inline-flex cursor-pointer items-center gap-1 text-xs text-gold-700 hover:text-gold-900"
            >
              <ExternalLink className="h-3 w-3" /> <span className="truncate">{p}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function AttachmentsInline({ paths }: { paths: string[] }) {
  const getUrl = useServerFn(getAttachmentUrl);
  const [open, setOpenState] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);

  if (!paths || paths.length === 0) return null;
  const path = paths[0];

  const updateCoords = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setCoords({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX + rect.width / 2,
      });
    }
  };

  useEffect(() => {
    if (open) {
      updateCoords();
      window.addEventListener("resize", updateCoords);
      window.addEventListener("scroll", updateCoords, true);
    } else {
      setCoords(null);
    }
    return () => {
      window.removeEventListener("resize", updateCoords);
      window.removeEventListener("scroll", updateCoords, true);
    };
  }, [open]);

  const openAttachment = async (path: string) => {
    try {
      const { url } = await getUrl({ data: { path } });
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (e: any) {
      toast.error(e.message || "تعذر فتح الملف");
    }
  };

  const downloadAttachment = async (path: string) => {
    try {
      const { url } = await getUrl({ data: { path } });
      const filename = path.split("/").pop() || "attachment";
      const res = await fetch(url);
      if (!res.ok) throw new Error("تعذر تنزيل الملف");
      const blob = await res.blob();
      const objUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = objUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(objUrl);
    } catch (e: any) {
      toast.error(e.message || "تعذر تنزيل الملف");
    }
  };

  const shortName = (p: string) => {
    const base = p.split("/").pop() || p;
    return base.length > 20 ? base.slice(0, 8) + "…" + base.slice(-8) : base;
  };

  return (
    <div className="relative inline-block text-right">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpenState((v) => !v)}
        className="inline-flex cursor-pointer items-center gap-1 rounded-full bg-gold-50 px-2.5 py-1 text-[11px] font-bold text-gold-800 hover:bg-gold-100 transition-colors"
        aria-label="عرض المرفق"
      >
        <Paperclip className="h-3 w-3" /> المرفق
      </button>
      {open && coords && createPortal(
        <>
          <button
            aria-hidden="true"
            onClick={() => setOpenState(false)}
            className="fixed inset-0 z-40 cursor-pointer bg-transparent"
          />
          <div
            style={{
              position: "absolute",
              top: `${coords.top + 6}px`,
              left: `${coords.left}px`,
              transform: "translateX(-50%)",
            }}
            className="z-50 w-44 rounded-lg border border-navy-100 bg-white p-2.5 shadow-lg flex flex-col gap-1.5 text-right"
          >
            <div className="border-b border-navy-50 pb-1 text-center text-[10px] font-bold text-navy-400 truncate">
              {shortName(path)}
            </div>
            <button
              onClick={() => {
                setOpenState(false);
                openAttachment(path);
              }}
              className="flex w-full cursor-pointer items-center justify-center gap-1.5 rounded bg-navy-800 py-1.5 text-xs font-bold text-white hover:bg-navy-700 transition-colors"
            >
              <ExternalLink className="h-3.5 w-3.5" /> فتح
            </button>
            <button
              onClick={() => {
                setOpenState(false);
                downloadAttachment(path);
              }}
              className="flex w-full cursor-pointer items-center justify-center gap-1.5 rounded bg-gold-500 py-1.5 text-xs font-bold text-navy-950 hover:bg-gold-400 transition-colors"
            >
              <Download className="h-3.5 w-3.5" /> تنزيل
            </button>
          </div>
        </>,
        document.body
      )}
    </div>
  );
}
