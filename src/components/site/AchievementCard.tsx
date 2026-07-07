import { Heart, ArrowLeft, ImageOff } from "lucide-react";
import type { Achievement } from "@/lib/parliament-types";
import { Link } from "@tanstack/react-router";

export function AchievementCard({
  ach,
  onOpen,
}: {
  ach: Achievement;
  onOpen?: (a: Achievement) => void;
}) {
  const content = (
    <>
      <div className="relative aspect-[16/10] overflow-hidden">
        {ach.image && !ach.image.includes("/src/assets/") ? (
          <img
            src={ach.image}
            alt={ach.title}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="h-full w-full bg-navy-100 flex items-center justify-center text-navy-300">
            <ImageOff className="h-10 w-10" />
          </div>
        )}
        <span className="absolute right-3 top-3 rounded-full bg-navy-900/80 px-3 py-1 text-[11px] font-medium text-gold-200 backdrop-blur">
          {ach.category}
        </span>
      </div>
      <div className="p-5">
        <div className="text-xs text-navy-500">{ach.date}</div>
        <h3 className="mt-1 line-clamp-2 text-base font-bold text-navy-800">{ach.title}</h3>
        <p className="mt-2 line-clamp-3 text-sm text-navy-600">{ach.description}</p>
        <div className="mt-4 flex items-center justify-between text-xs text-navy-500">
          <span className="inline-flex items-center gap-1">
            <Heart className="h-4 w-4 text-rose-500" /> {ach.likes}
          </span>
          <span className="inline-flex items-center gap-1 font-semibold text-gold-700 group-hover:text-gold-900">
            التفاصيل <ArrowLeft className="h-3 w-3" />
          </span>
        </div>
      </div>
    </>
  );

  if (onOpen) {
    return (
      <button
        type="button"
        onClick={() => onOpen(ach)}
        className="group cursor-pointer block w-full overflow-hidden rounded-2xl bg-white text-right shadow-sm ring-1 ring-navy-100 transition hover:-translate-y-1 hover:shadow-lg"
      >
        {content}
      </button>
    );
  }

  return (
    <Link
      to="/achievements/$id"
      params={{ id: ach.id }}
      className="group cursor-pointer block w-full overflow-hidden rounded-2xl bg-white text-right shadow-sm ring-1 ring-navy-100 transition hover:-translate-y-1 hover:shadow-lg"
    >
      {content}
    </Link>
  );
}
