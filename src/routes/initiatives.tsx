import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { Calendar, Tag, TrendingUp } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { InitiativeCard } from "@/components/site/InitiativeCard";
import { DetailModal } from "@/components/site/DetailModal";
import { initiativesQuery } from "@/lib/queries";
import type { Initiative } from "@/lib/parliament-types";

export const Route = createFileRoute("/initiatives")({
  head: () => ({
    meta: [
      { title: "المبادرات - النائب مجدي بيومي" },
      {
        name: "description",
        content:
          "المبادرات المجتمعية والتنموية التي يقودها النائب مجدي بيومي لخدمة أهالي جنوب سيناء وشرم الشيخ.",
      },
    ],
  }),
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(initiativesQuery);
  },
  component: () => (
    <SiteLayout>
      <Inner />
    </SiteLayout>
  ),
});

function Inner() {
  const items = useSuspenseQuery(initiativesQuery).data as Initiative[];
  const statuses = useMemo(() => ["الكل", "نشط", "مكتمل", "مخطط له"], []);
  const [st, setSt] = useState("الكل");
  const [open, setOpen] = useState<Initiative | null>(null);
  const filtered = st === "الكل" ? items : items.filter((i) => i.status === st);
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-extrabold text-navy-800 md:text-4xl">المبادرات</h1>
      <p className="mt-2 text-navy-500">المبادرات الجارية والمكتملة والمستقبلية.</p>
      <div className="my-6 flex flex-wrap gap-2">
        {statuses.map((c) => (
          <button
            key={c}
            onClick={() => setSt(c)}
            className={`rounded-full px-4 py-1.5 cursor-pointer text-sm font-medium transition ${st === c ? "bg-navy-800 text-white" : "bg-white text-navy-700 ring-1 ring-navy-200 hover:bg-navy-50"}`}
          >
            {c}
          </button>
        ))}
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((i) => (
          <InitiativeCard key={i.id} item={i} onOpen={setOpen} />
        ))}
      </div>

      <DetailModal open={!!open} onClose={() => setOpen(null)}>
        {open && (
          <article>
            <div className="relative aspect-[16/9] overflow-hidden sm:rounded-t-2xl">
              <img src={open.image} alt={open.title} className="h-full w-full object-cover" />
              <span className="absolute right-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-navy-800 backdrop-blur">
                {open.status}
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
              </div>
              <h2 className="mt-3 text-2xl font-extrabold text-navy-800 sm:text-3xl">
                {open.title}
              </h2>
              <p className="mt-3 text-base text-navy-600">{open.description}</p>

              <div className="mt-5 rounded-xl bg-navy-50 p-4">
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="inline-flex items-center gap-1 font-bold text-navy-700">
                    <TrendingUp className="h-4 w-4" /> نسبة الإنجاز
                  </span>
                  <span className="font-extrabold text-gold-700">{open.progress}٪</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-white">
                  <div
                    className="h-full rounded-full bg-gradient-to-l from-gold-500 to-gold-700"
                    style={{ width: `${open.progress}%` }}
                  />
                </div>
              </div>

              <div className="mt-5 whitespace-pre-line text-sm leading-7 text-navy-700">
                {open.content}
              </div>
            </div>
          </article>
        )}
      </DetailModal>
    </div>
  );
}
