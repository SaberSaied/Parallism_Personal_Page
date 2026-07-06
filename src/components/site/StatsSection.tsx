import { Users, FileText, Compass, CheckCircle2, Award } from "lucide-react";
import type { Statistic } from "@/lib/parliament-types";

const iconMap: Record<string, any> = { Users, FileText, Compass, CheckCircle2, Award };

export function StatsSection({ stats }: { stats: Statistic[] }) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {stats.map((s) => {
          const Icon = iconMap[s.icon] ?? Award;
          return (
            <div
              key={s.id}
              className="rounded-2xl border border-navy-100 bg-white p-6 text-center shadow-sm"
            >
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-gold-100 text-gold-700">
                <Icon className="h-6 w-6" />
              </div>
              <div className="mt-3 text-2xl font-extrabold text-navy-800">{s.value}</div>
              <div className="mt-1 text-xs text-navy-500">{s.label}</div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
