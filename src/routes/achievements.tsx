import { createFileRoute, Link, Outlet, useLocation } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { AchievementCard } from "@/components/site/AchievementCard";
import { DetailModal } from "@/components/site/DetailModal";
import { Heart, Calendar, Tag, ArrowLeft } from "lucide-react";
import { achievementsQuery } from "@/lib/queries";
import type { Achievement } from "@/lib/parliament-types";

export const Route = createFileRoute("/achievements")({
  head: () => ({
    meta: [
      { title: "الإنجازات - النائب مجدي بيومي" },
      {
        name: "description",
        content:
          "استعرض الإنجازات التشريعية والرقابية والميدانية للنائب مجدي بيومي لخدمة أهالي جنوب سيناء وشرم الشيخ.",
      },
    ],
  }),
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(achievementsQuery);
  },
  component: AchievementsPage,
});

function AchievementsPage() {
  const location = useLocation();
  const isDetailsPage = location.pathname !== "/achievements" && location.pathname !== "/achievements/";

  if (isDetailsPage) {
    return <Outlet />;
  }

  return (
    <SiteLayout>
      <Inner />
    </SiteLayout>
  );
}

function Inner() {
  const items = useSuspenseQuery(achievementsQuery).data as Achievement[];
  const categories = useMemo(
    () => ["الكل", ...Array.from(new Set(items.map((i) => i.category)))],
    [items],
  );
  const [cat, setCat] = useState("الكل");
  const [open, setOpen] = useState<Achievement | null>(null);
  const filtered = cat === "الكل" ? items : items.filter((i) => i.category === cat);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-extrabold text-navy-800 md:text-4xl">الإنجازات</h1>
      <p className="mt-2 text-navy-500">قائمة بالإنجازات التشريعية والرقابية والميدانية.</p>

      <div className="my-6 flex flex-wrap gap-2">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setCat(c)}
            className={`rounded-full cursor-pointer px-4 py-1.5 text-sm font-medium transition ${cat === c ? "bg-navy-800 text-white" : "bg-white text-navy-700 ring-1 ring-navy-200 hover:bg-navy-50"}`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((a) => (
          <div key={a.id} id={a.slug}>
            <AchievementCard ach={a} onOpen={setOpen} />
          </div>
        ))}
      </div>
      {filtered.length === 0 && (
        <div className="py-16 text-center text-navy-500">لا توجد إنجازات في هذا التصنيف.</div>
      )}

      <DetailModal open={!!open} onClose={() => setOpen(null)}>
        {open && (
          <article>
            <div className="relative aspect-[16/9] overflow-hidden sm:rounded-t-2xl">
              <img src={open.image} alt={open.title} className="h-full w-full object-cover" />
              <span className="absolute right-4 top-4 rounded-full bg-navy-900/80 px-3 py-1 text-xs font-bold text-gold-200 backdrop-blur">
                {open.category}
              </span>
            </div>
            <div className="p-6 sm:p-8">
              <div className="flex flex-wrap items-center gap-4 text-xs text-navy-500">
                <span className="inline-flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" /> {open.date}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Tag className="h-3.5 w-3.5" /> {open.category}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Heart className="h-3.5 w-3.5 text-rose-500" /> {open.likes}
                </span>
              </div>
              <h2 className="mt-3 text-2xl font-extrabold text-navy-800 sm:text-3xl">
                {open.title}
              </h2>
              <p className="mt-3 text-base text-navy-600">{open.description}</p>
              <div className="mt-5 whitespace-pre-line text-sm leading-7 text-navy-700">
                {open.content}
              </div>
              <div className="mt-8 pt-4 border-t border-navy-100 flex justify-end">
                <Link
                  to="/achievements/$id"
                  params={{ id: open.id }}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-gold-600 px-4 py-2 text-sm font-bold text-white hover:bg-gold-700 transition"
                >
                  عرض صفحة التفاصيل الكاملة <ArrowLeft className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </article>
        )}
      </DetailModal>
    </div>
  );
}
