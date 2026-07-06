import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import type { ParliamentInfo } from "@/lib/parliament-types";
import MagdyBayoumi from "@/assets/image.jpg";

export function Hero({ info }: { info: ParliamentInfo }) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-bl from-navy-900 via-navy-800 to-navy-950 text-white">
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 20%, #c5a85c 0%, transparent 50%), radial-gradient(circle at 80% 80%, #1b3d6c 0%, transparent 50%)",
        }}
      />
      <div className="relative mx-auto grid max-w-7xl gap-12 px-4 py-20 sm:px-6 md:grid-cols-2 md:py-28 lg:px-12">
        <div className="flex items-center justify-between">
          <div className="p-0.5 border border-gold-500 rounded-2xl">
            <img
              src={info.social_media?.profile_image || MagdyBayoumi}
              alt="السيد مجدي بيومي"
              className="aspect-[3/4] w-80 rounded-2xl object-cover shadow-2xl"
              onError={(e) => {
                (e.target as HTMLImageElement).src = MagdyBayoumi;
              }}
            />
          </div>
        </div>
        <div>
          <h1 className="mt-5 text-4xl font-extrabold leading-tight md:text-6xl">{info.name}</h1>
          <p className="mt-2 text-lg text-gold-300">{info.title}</p>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-navy-100/90">{info.bio}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/services"
              className="inline-flex items-center gap-2 rounded-lg bg-gold-500 px-5 py-3 text-sm font-bold text-navy-900 transition hover:bg-gold-400"
            >
              تقديم معاملة
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <Link
              to="/achievements"
              className="inline-flex items-center gap-2 rounded-lg border border-white/30 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              استعرض الإنجازات
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
