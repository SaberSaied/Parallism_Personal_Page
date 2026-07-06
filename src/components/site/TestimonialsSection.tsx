import { Quote } from "lucide-react";
import type { Testimonial } from "@/lib/parliament-types";

export function TestimonialsSection({
  items,
  onOpen,
}: {
  items: Testimonial[];
  onOpen?: (t: Testimonial) => void;
}) {
  if (!items.length) return null;
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <h2 className="mb-2 text-3xl font-extrabold text-navy-800">شهادات وآراء</h2>
      <p className="mb-10 text-sm text-navy-500">آراء من المواطنين والمستفيدين.</p>
      <div className="grid gap-6 md:grid-cols-3">
        {items.map((t) => (
          <button
            type="button"
            key={t.id}
            onClick={() => onOpen?.(t)}
            className="group relative rounded-2xl cursor-pointer bg-white p-6 shadow-sm ring-1 ring-navy-100 text-right w-full transition hover:-translate-y-1 hover:shadow-lg cursor-pointer"
          >
            <Quote className="mb-3 h-6 w-6 text-gold-500" />
            <p className="text-sm leading-relaxed text-navy-700 line-clamp-5">{t.text}</p>
            {t.text.length > 150 && (
              <span className="mt-2 block text-xs font-semibold text-gold-700 group-hover:text-gold-900">
                اقرأ المزيد...
              </span>
            )}
            <div className="mt-5 flex items-center gap-3">
              <img src={t.avatar} alt={t.name} className="h-12 w-12 rounded-full object-cover" />
              <div className="text-right">
                <div className="text-sm font-bold text-navy-800">{t.name}</div>
                <div className="text-xs text-navy-500">{t.role}</div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
