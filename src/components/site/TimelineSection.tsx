import type { TimelineEvent } from "@/lib/parliament-types";

export function TimelineSection({ events }: { events: TimelineEvent[] }) {
  return (
    <section className="bg-white py-16">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <h2 className="mb-2 text-3xl font-extrabold text-navy-800">المسيرة المهنية</h2>
        <p className="mb-10 text-sm text-navy-500">محطات بارزة في مسيرة الخدمة العامة.</p>
        <ol className="relative space-y-8 border-r-2 border-gold-200 pr-6">
          {events.map((e) => (
            <li key={e.id} className="relative">
              <span className="absolute -right-[31px] top-1 grid h-6 w-6 place-items-center rounded-full bg-gold-500 text-[10px] font-bold text-white shadow">
                ●
              </span>
              <div className="text-sm font-bold text-gold-700">{e.year}</div>
              <h3 className="mt-1 text-lg font-bold text-navy-800">{e.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-navy-600">{e.description}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
