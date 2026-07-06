import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Hero } from "@/components/site/Hero";
import { StatsSection } from "@/components/site/StatsSection";
import { TimelineSection } from "@/components/site/TimelineSection";
import { AchievementCard } from "@/components/site/AchievementCard";
import { InitiativeCard } from "@/components/site/InitiativeCard";
import { DetailModal } from "@/components/site/DetailModal";
import { GalleryLightbox } from "@/components/site/GalleryLightbox";
import { useState } from "react";
import { Calendar, Tag, Heart, TrendingUp, ImageOff } from "lucide-react";
import {
  parliamentInfoQuery,
  statisticsQuery,
  timelineQuery,
  achievementsQuery,
  initiativesQuery,
  galleryQuery,
} from "@/lib/queries";
import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import type {
  ParliamentInfo,
  Statistic,
  TimelineEvent,
  Achievement,
  Initiative,
  GalleryItem,
} from "@/lib/parliament-types";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "النائب مجدي بيومي — عضو مجلس النواب عن جنوب سيناء وشرم الشيخ" },
      {
        name: "description",
        content:
          "الموقع الرسمي للنائب مجدي بيومي، عضو مجلس النواب عن دائرة جنوب سيناء وشرم الشيخ. تعرّف على الإنجازات والمبادرات، وشاهد اللقاءات، وقدّم معاملاتك مباشرة.",
      },
    ],
  }),
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(parliamentInfoQuery);
    context.queryClient.ensureQueryData(statisticsQuery);
    context.queryClient.ensureQueryData(timelineQuery);
    context.queryClient.ensureQueryData(achievementsQuery);
    context.queryClient.ensureQueryData(initiativesQuery);
    context.queryClient.ensureQueryData(galleryQuery);
  },
  component: HomePage,
});

function HomePage() {
  return (
    <SiteLayout>
      <HomeContent />
    </SiteLayout>
  );
}

function HomeContent() {
  const info = useSuspenseQuery(parliamentInfoQuery).data as ParliamentInfo | null;
  const stats = useSuspenseQuery(statisticsQuery).data as Statistic[];
  const timeline = useSuspenseQuery(timelineQuery).data as TimelineEvent[];
  const achievements = useSuspenseQuery(achievementsQuery).data as Achievement[];
  const initiatives = useSuspenseQuery(initiativesQuery).data as Initiative[];
  const gallery = useSuspenseQuery(galleryQuery).data as GalleryItem[];

  const [activeAchievement, setActiveAchievement] = useState<Achievement | null>(null);
  const [activeInitiative, setActiveInitiative] = useState<Initiative | null>(null);
  const [activeGallery, setActiveGallery] = useState<GalleryItem | null>(null);

  const slicedGallery = gallery.slice(0, 8);
  const galleryIdx = activeGallery ? slicedGallery.findIndex((i) => i.id === activeGallery.id) : -1;
  const nextGallery = () =>
    galleryIdx >= 0 && setActiveGallery(slicedGallery[(galleryIdx + 1) % slicedGallery.length]);
  const prevGallery = () =>
    galleryIdx >= 0 &&
    setActiveGallery(slicedGallery[(galleryIdx - 1 + slicedGallery.length) % slicedGallery.length]);

  if (!info) return <div className="p-12 text-center">جارٍ تحميل البيانات...</div>;

  const speechVideoUrl = info.social_media?.speech_video;
  const embedUrl = speechVideoUrl ? getYouTubeEmbedUrl(speechVideoUrl) : null;

  return (
    <>
      <Hero info={info} />

      {embedUrl && (
        <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-extrabold text-navy-800 md:text-3xl">كلمة النائب في مجلس الشعب</h2>
            <p className="mt-2 text-sm text-navy-500">جانب من المشاركة الفعالة والكلمات البرلمانية للنائب تحت قبة المجلس</p>
          </div>
          <div className="relative aspect-video w-full overflow-hidden rounded-2xl border-4 border-white bg-navy-950 shadow-xl ring-1 ring-navy-100">
            <iframe
              src={embedUrl}
              title="كلمة النائب مجدي بيومي في مجلس النواب"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="h-full w-full"
            />
          </div>
        </section>
      )}

      <StatsSection stats={stats} />

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <SectionHeader
          title="أبرز الإنجازات"
          subtitle="إنجازات تشريعية ورقابية تخدم أبناء الدائرة."
          link="/achievements"
          linkLabel="جميع الإنجازات"
        />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {achievements.slice(0, 4).map((a) => (
            <AchievementCard key={a.id} ach={a} onOpen={setActiveAchievement} />
          ))}
        </div>
      </section>

      <section className="bg-navy-50/60 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            title="المبادرات الجارية"
            subtitle="مبادرات نقودها لخدمة المجتمع."
            link="/initiatives"
            linkLabel="جميع المبادرات"
          />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {initiatives.slice(0, 4).map((i) => (
              <InitiativeCard key={i.id} item={i} onOpen={setActiveInitiative} />
            ))}
          </div>
        </div>
      </section>

      <TimelineSection events={timeline} />

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <SectionHeader
          title="معرض الصور"
          subtitle="من الفعاليات والجولات الميدانية."
          link="/gallery"
          linkLabel="جميع الصور"
        />
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {slicedGallery.map((g) => (
            <button
              key={g.id}
              onClick={() => setActiveGallery(g)}
              className="group block overflow-hidden cursor-pointer rounded-xl cursor-pointer text-right w-full"
            >
              {g.image_url && !g.image_url.includes("/src/assets/") ? (
                <img
                  src={g.image_url}
                  alt={g.title}
                  className="aspect-square w-full object-cover transition duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="aspect-square w-full bg-navy-100 flex items-center justify-center text-navy-300 group-hover:bg-navy-200 transition duration-300">
                  <ImageOff className="h-10 w-10" />
                </div>
              )}
            </button>
          ))}
        </div>
      </section>

      {/* Detail Modals / Lightboxes */}
      <DetailModal open={!!activeAchievement} onClose={() => setActiveAchievement(null)}>
        {activeAchievement && (
          <article>
            <div className="relative aspect-[16/9] overflow-hidden sm:rounded-t-2xl">
              {activeAchievement.image && !activeAchievement.image.includes("/src/assets/") ? (
                <img
                  src={activeAchievement.image}
                  alt={activeAchievement.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full bg-navy-100 flex items-center justify-center text-navy-300">
                  <ImageOff className="h-16 w-16" />
                </div>
              )}
              <span className="absolute right-4 top-4 rounded-full bg-navy-900/80 px-3 py-1 text-xs font-bold text-gold-200 backdrop-blur">
                {activeAchievement.category}
              </span>
            </div>
            <div className="p-6 sm:p-8">
              <div className="flex flex-wrap items-center gap-4 text-xs text-navy-500">
                <span className="inline-flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" /> {activeAchievement.date}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Tag className="h-3.5 w-3.5" /> {activeAchievement.category}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Heart className="h-3.5 w-3.5 text-rose-500" /> {activeAchievement.likes}
                </span>
              </div>
              <h2 className="mt-3 text-2xl font-extrabold text-navy-800 sm:text-3xl">
                {activeAchievement.title}
              </h2>
              <p className="mt-3 text-base text-navy-600">{activeAchievement.description}</p>
              <div className="mt-5 whitespace-pre-line text-sm leading-7 text-navy-700">
                {activeAchievement.content}
              </div>
            </div>
          </article>
        )}
      </DetailModal>

      <DetailModal open={!!activeInitiative} onClose={() => setActiveInitiative(null)}>
        {activeInitiative && (
          <article>
            <div className="relative aspect-[16/9] overflow-hidden sm:rounded-t-2xl">
              {activeInitiative.image && !activeInitiative.image.includes("/src/assets/") ? (
                <img
                  src={activeInitiative.image}
                  alt={activeInitiative.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full bg-navy-100 flex items-center justify-center text-navy-300">
                  <ImageOff className="h-16 w-16" />
                </div>
              )}
              <span className="absolute right-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-navy-800 backdrop-blur">
                {activeInitiative.status}
              </span>
            </div>
            <div className="p-6 sm:p-8">
              <div className="flex flex-wrap items-center gap-4 text-xs text-navy-500">
                <span className="inline-flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" /> {activeInitiative.date}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Tag className="h-3.5 w-3.5" /> {activeInitiative.category}
                </span>
              </div>
              <h2 className="mt-3 text-2xl font-extrabold text-navy-800 sm:text-3xl">
                {activeInitiative.title}
              </h2>
              <p className="mt-3 text-base text-navy-600">{activeInitiative.description}</p>

              <div className="mt-5 rounded-xl bg-navy-50 p-4">
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="inline-flex items-center gap-1 font-bold text-navy-700">
                    <TrendingUp className="h-4 w-4" /> نسبة الإنجاز
                  </span>
                  <span className="font-extrabold text-gold-700">{activeInitiative.progress}٪</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-white">
                  <div
                    className="h-full rounded-full bg-gradient-to-l from-gold-500 to-gold-700"
                    style={{ width: `${activeInitiative.progress}%` }}
                  />
                </div>
              </div>

              <div className="mt-5 whitespace-pre-line text-sm leading-7 text-navy-700">
                {activeInitiative.content}
              </div>
            </div>
          </article>
        )}
      </DetailModal>

      <GalleryLightbox
        item={activeGallery}
        onClose={() => setActiveGallery(null)}
        onNext={nextGallery}
        onPrev={prevGallery}
      />
    </>
  );
}

function SectionHeader({
  title,
  subtitle,
  link,
  linkLabel,
}: {
  title: string;
  subtitle: string;
  link: string;
  linkLabel: string;
}) {
  return (
    <div className="mb-8 flex items-end justify-between gap-4">
      <div>
        <h2 className="text-2xl font-extrabold text-navy-800 md:text-3xl">{title}</h2>
        <p className="mt-1 text-sm text-navy-500">{subtitle}</p>
      </div>
      <Link
        to={link as never}
        className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-gold-700 hover:text-gold-900"
      >
        {linkLabel} <ArrowLeft className="h-4 w-4" />
      </Link>
    </div>
  );
}

function getYouTubeEmbedUrl(url: string) {
  if (!url) return null;
  let videoId = "";
  if (url.includes("embed/")) {
    return url;
  } else if (url.includes("watch?v=")) {
    videoId = url.split("watch?v=")[1]?.split("&")[0];
  } else if (url.includes("youtu.be/")) {
    videoId = url.split("youtu.be/")[1]?.split("?")[0];
  }
  return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
}
