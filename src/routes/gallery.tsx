import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { ImageOff } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { GalleryLightbox } from "@/components/site/GalleryLightbox";
import { galleryQuery } from "@/lib/queries";
import type { GalleryItem } from "@/lib/parliament-types";

export const Route = createFileRoute("/gallery")({
  head: () => ({
    meta: [
      { title: "المعرض الإعلامي - النائب مجدي بيومي" },
      {
        name: "description",
        content: "تغطية مصورة للفعاليات والمؤتمرات والجولات الميدانية للنائب مجدي بيومي.",
      },
    ],
  }),
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(galleryQuery);
  },
  component: () => (
    <SiteLayout>
      <Inner />
    </SiteLayout>
  ),
});

function Inner() {
  const items = useSuspenseQuery(galleryQuery).data as GalleryItem[];
  const categories = useMemo(
    () => ["الكل", ...Array.from(new Set(items.map((i) => i.category)))],
    [items],
  );
  const [cat, setCat] = useState("الكل");
  const filtered = cat === "الكل" ? items : items.filter((i) => i.category === cat);
  const [active, setActive] = useState<GalleryItem | null>(null);

  const idx = active ? filtered.findIndex((i) => i.id === active.id) : -1;
  const next = () => idx >= 0 && setActive(filtered[(idx + 1) % filtered.length]);
  const prev = () => idx >= 0 && setActive(filtered[(idx - 1 + filtered.length) % filtered.length]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-extrabold text-navy-800 md:text-4xl">المعرض الإعلامي</h1>
      <p className="mt-2 text-navy-500">لمحات من الفعاليات والجولات الميدانية.</p>
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
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
        {filtered.map((g) => (
          <button
            key={g.id}
            onClick={() => setActive(g)}
            className="group overflow-hidden cursor-pointer rounded-xl text-right"
          >
            {g.image_url && !g.image_url.includes("/src/assets/") ? (
              <img
                src={g.image_url}
                alt={g.title}
                className="aspect-[4/3] w-full object-cover transition duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="aspect-[4/3] w-full bg-navy-100 flex items-center justify-center text-navy-300 group-hover:bg-navy-200 transition duration-300">
                <ImageOff className="h-10 w-10" />
              </div>
            )}
            <div className="mt-2 px-1 text-xs text-navy-600 line-clamp-2">{g.title}</div>
          </button>
        ))}
      </div>
      <GalleryLightbox item={active} onClose={() => setActive(null)} onNext={next} onPrev={prev} />
    </div>
  );
}
