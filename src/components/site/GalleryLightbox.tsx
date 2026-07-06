import { useEffect } from "react";
import { ArrowLeft, ArrowRight, X } from "lucide-react";
import type { GalleryItem } from "@/lib/parliament-types";

export function GalleryLightbox({
  item,
  onClose,
  onNext,
  onPrev,
}: {
  item: GalleryItem | null;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
}) {
  useEffect(() => {
    if (!item) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowLeft")
        onNext(); // RTL: left = next
      else if (e.key === "ArrowRight") onPrev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [item, onClose, onNext, onPrev]);

  if (!item) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      onClick={onClose}
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          onPrev();
        }}
        className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full cursor-pointer bg-white/10 p-2 text-white hover:bg-white/20"
        aria-label="السابق"
      >
        <ArrowRight className="h-6 w-6" />
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onNext();
        }}
        className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full cursor-pointer bg-white/10 p-2 text-white hover:bg-white/20"
        aria-label="التالي"
      >
        <ArrowLeft className="h-6 w-6" />
      </button>
      <button
        onClick={onClose}
        className="absolute left-4 top-4 rounded-full cursor-pointer bg-white/10 p-2 text-white hover:bg-white/20"
        aria-label="إغلاق"
      >
        <X className="h-6 w-6" />
      </button>
      <figure className="max-h-full max-w-5xl text-center" onClick={(e) => e.stopPropagation()}>
        <img
          src={item.image_url}
          alt={item.title}
          className="mx-auto max-h-[80vh] rounded-lg object-contain"
        />
        <figcaption className="mt-3 text-sm text-white/90">{item.title}</figcaption>
        <div className="text-xs text-white/60">
          {item.category} · {item.date}
        </div>
      </figure>
    </div>
  );
}
