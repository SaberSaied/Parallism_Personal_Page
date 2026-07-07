import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Calendar, Tag, ArrowRight } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { galleryItemByIdQuery } from "@/lib/queries";
import type { GalleryItem } from "@/lib/parliament-types";

export const Route = createFileRoute("/gallery_/$id")({
  head: ({ loaderData }: { loaderData?: any }) => ({
    meta: [
      { title: `${loaderData?.title || "المعرض"} - النائب مجدي بيومي` },
      { name: "description", content: loaderData?.title || "" },
    ],
  }),
  loader: async ({ context, params }: { context: any; params: { id: string } }) => {
    const data = await context.queryClient.ensureQueryData(galleryItemByIdQuery(params.id));
    return data as GalleryItem;
  },
  component: GalleryDetailPage,
});

function GalleryDetailPage() {
  const item = useSuspenseQuery(galleryItemByIdQuery(Route.useParams().id)).data as GalleryItem;

  if (!item) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-3xl px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-navy-800">الصورة غير موجودة</h1>
          <Link to="/gallery" className="mt-4 inline-flex items-center gap-2 text-gold-600 hover:text-gold-700 font-bold">
            <ArrowRight className="h-4 w-4" /> العودة للمعرض
          </Link>
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <Link
          to="/gallery"
          className="mb-6 inline-flex cursor-pointer items-center gap-2 text-sm font-bold text-navy-600 hover:text-navy-900 transition"
        >
          <ArrowRight className="h-4 w-4" /> العودة إلى المعرض الإعلامي
        </Link>

        <article className="overflow-hidden rounded-3xl border border-navy-100 bg-white shadow-lg p-5 sm:p-8">
          <div className="relative overflow-hidden rounded-2xl bg-navy-950 flex items-center justify-center">
            {item.image_url && (
              <img
                src={item.image_url}
                alt={item.title}
                className="max-h-[70vh] object-contain w-auto rounded-2xl"
              />
            )}
            <span className="absolute right-4 top-4 rounded-full bg-navy-900/80 px-3.5 py-1 text-xs font-bold text-gold-200 backdrop-blur">
              {item.category}
            </span>
          </div>

          <div className="mt-6">
            <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-navy-500">
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-navy-400" /> {item.date}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Tag className="h-4 w-4 text-navy-400" /> {item.category}
              </span>
            </div>

            <h1 className="mt-3 text-2xl font-extrabold text-navy-800 sm:text-3xl leading-tight">
              {item.title}
            </h1>
          </div>
        </article>
      </div>
    </SiteLayout>
  );
}
