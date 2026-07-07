import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Calendar, Tag, Heart, ArrowRight } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { achievementByIdQuery } from "@/lib/queries";
import type { Achievement } from "@/lib/parliament-types";

export const Route = createFileRoute("/achievements_/$id")({
  head: ({ loaderData }: { loaderData?: any }) => ({
    meta: [
      { title: `${loaderData?.title || "الإنجاز"} - النائب مجدي بيومي` },
      { name: "description", content: loaderData?.description || "" },
    ],
  }),
  loader: async ({ context, params }: { context: any; params: { id: string } }) => {
    const data = await context.queryClient.ensureQueryData(achievementByIdQuery(params.id));
    return data as Achievement;
  },
  component: AchievementDetailPage,
});

function AchievementDetailPage() {
  const item = useSuspenseQuery(achievementByIdQuery(Route.useParams().id)).data as Achievement;

  if (!item) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-3xl px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-navy-800">الإنجاز غير موجود</h1>
          <Link to="/achievements" className="mt-4 inline-flex items-center gap-2 text-gold-600 hover:text-gold-700 font-bold">
            <ArrowRight className="h-4 w-4" /> العودة للإنجازات
          </Link>
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <Link
          to="/achievements"
          className="mb-6 inline-flex cursor-pointer items-center gap-2 text-sm font-bold text-navy-600 hover:text-navy-900 transition"
        >
          <ArrowRight className="h-4 w-4" /> العودة إلى كل الإنجازات
        </Link>

        <article className="overflow-hidden rounded-3xl border border-navy-100 bg-white shadow-lg">
          <div className="relative aspect-[21/9] w-full overflow-hidden bg-navy-900">
            {item.image && (
              <img
                src={item.image}
                alt={item.title}
                className="h-full w-full object-cover opacity-90"
              />
            )}
            <span className="absolute right-6 top-6 rounded-full bg-navy-900/80 px-4 py-1.5 text-xs font-bold text-gold-200 backdrop-blur">
              {item.category}
            </span>
          </div>

          <div className="p-6 sm:p-10">
            <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-navy-500">
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-navy-400" /> {item.date}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Tag className="h-4 w-4 text-navy-400" /> {item.category}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Heart className="h-4 w-4 text-rose-500" /> {item.likes} إعجاب
              </span>
            </div>

            <h1 className="mt-4 text-3xl font-black text-navy-800 sm:text-4xl leading-tight">
              {item.title}
            </h1>

            <p className="mt-4 text-lg font-medium leading-relaxed text-navy-600 border-r-4 border-gold-500 pr-4">
              {item.description}
            </p>

            <div className="mt-8 whitespace-pre-line text-base leading-8 text-navy-700">
              {item.content}
            </div>
          </div>
        </article>
      </div>
    </SiteLayout>
  );
}
