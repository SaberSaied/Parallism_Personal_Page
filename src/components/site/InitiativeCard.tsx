import { Calendar, TrendingUp, ImageOff } from "lucide-react";
import type { Initiative } from "@/lib/parliament-types";
import { cn } from "@/lib/utils";

const statusStyles: Record<string, string> = {
  نشط: "bg-emerald-100 text-emerald-800 ring-emerald-200",
  مكتمل: "bg-sky-100 text-sky-800 ring-sky-200",
  "مخطط له": "bg-amber-100 text-amber-800 ring-amber-200",
};

import { Link } from "@tanstack/react-router";

export function InitiativeCard({
  item,
  onOpen,
}: {
  item: Initiative;
  onOpen?: (i: Initiative) => void;
}) {
  const content = (
    <>
      <div className="relative aspect-[16/9] overflow-hidden">
        {item.image && !item.image.includes("/src/assets/") ? (
          <img src={item.image} alt={item.title} className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full bg-navy-100 flex items-center justify-center text-navy-300">
            <ImageOff className="h-10 w-10" />
          </div>
        )}
        <span
          className={cn(
            "absolute right-3 top-3 rounded-full px-3 py-1 text-[11px] font-bold ring-1",
            statusStyles[item.status],
          )}
        >
          {item.status}
        </span>
      </div>
      <div className="p-5">
        <div className="flex items-center gap-3 text-xs text-navy-500">
          <span className="inline-flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" /> {item.date}
          </span>
          <span>{item.category}</span>
        </div>
        <h3 className="mt-2 text-base font-bold text-navy-800">{item.title}</h3>
        <p className="mt-1 line-clamp-3 text-sm text-navy-600">{item.description}</p>
        <div className="mt-4">
          <div className="mb-1 flex items-center justify-between text-xs">
            <span className="inline-flex items-center gap-1 text-navy-700">
              <TrendingUp className="h-3.5 w-3.5" /> نسبة الإنجاز
            </span>
            <span className="font-bold text-gold-700">{item.progress}٪</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-navy-100">
            <div
              className="h-full rounded-full bg-gradient-to-l from-gold-500 to-gold-700"
              style={{ width: `${item.progress}%` }}
            />
          </div>
        </div>
      </div>
    </>
  );

  if (onOpen) {
    return (
      <button
        type="button"
        onClick={() => onOpen(item)}
        className="block w-full overflow-hidden rounded-2xl cursor-pointer bg-white text-right shadow-sm ring-1 ring-navy-100 transition hover:-translate-y-1 hover:shadow-lg w-full text-right"
      >
        {content}
      </button>
    );
  }

  return (
    <Link
      to="/initiatives/$id"
      params={{ id: item.id }}
      className="block w-full overflow-hidden rounded-2xl cursor-pointer bg-white text-right shadow-sm ring-1 ring-navy-100 transition hover:-translate-y-1 hover:shadow-lg"
    >
      {content}
    </Link>
  );
}
