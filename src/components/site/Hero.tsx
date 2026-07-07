import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import type { ParliamentInfo } from "@/lib/parliament-types";
import MagdyBayoumi from "@/assets/image.jpg";

export function Hero({ info }: { info: ParliamentInfo }) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-bl from-navy-900 via-navy-800 to-navy-950 text-white">
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 20%, #c5a85c 0%, transparent 50%), radial-gradient(circle at 80% 80%, #1b3d6c 0%, transparent 50%)",
        }}
      />
      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 xl:px-12 py-20 lg:py-28">
        <div className="grid gap-10 items-center md:grid-cols-2">
          {/* Text Content */}
          <div className="text-center md:text-right order-2 md:order-1">
            <h1 className="text-3xl font-black leading-tight sm:text-4xl md:text-5xl lg:text-6xl text-white">
              {info.name}
            </h1>
            <p className="mt-3 text-base sm:text-lg md:text-xl font-bold text-gold-300">
              {info.title}
            </p>
            <p className="mt-5 mx-auto md:mx-0 max-w-xl text-sm sm:text-base leading-relaxed text-navy-100/90">
              {info.bio}
            </p>
            <div className="mt-8 flex flex-wrap justify-center md:justify-start gap-3.5">
              <Link
                to="/services"
                className="inline-flex items-center gap-2 rounded-xl bg-gold-500 px-6 py-3.5 text-sm font-bold text-navy-900 transition hover:bg-gold-400 active:scale-95 duration-150 shadow-lg shadow-gold-500/10"
              >
                تقديم معاملة
                <ArrowLeft className="h-4 w-4" />
              </Link>
              <Link
                to="/achievements"
                className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-white/10 hover:border-white/40 active:scale-95 duration-150"
              >
                استعرض الإنجازات
              </Link>
            </div>
          </div>

          {/* Profile Image */}
          <div className="flex justify-center md:justify-center lg:justify-end order-1 md:order-2">
            <div className="p-1 border border-gold-500/40 rounded-2xl bg-navy-950/30 backdrop-blur-sm shadow-2xl">
              <img
                src={info.social_media?.profile_image || MagdyBayoumi}
                alt="السيد مجدي بيومي"
                className="aspect-[3/4] w-60 sm:w-72 md:w-80 lg:w-96 rounded-2xl object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = MagdyBayoumi;
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
