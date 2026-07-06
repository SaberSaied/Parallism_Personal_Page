import { useMemo } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { Download, FileText, Clock, CheckCircle, Archive } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid as RCGrid,
} from "recharts";
import { listCitizenRequestsAdmin } from "@/lib/requests.functions";
import { achievementsQuery, initiativesQuery, galleryQuery } from "@/lib/queries";
import {
  REQUEST_STATUS_LABELS,
  type CitizenRequest,
  type RequestStatus,
  type Achievement,
  type Initiative,
  type GalleryItem,
} from "@/lib/parliament-types";
import { StatCard, ChartCard, csvEscape, downloadBlob } from "./admin-helpers";
import { AuditLogSection } from "./AuditLogSection";

export function ReportsAdmin() {
  const listReq = useServerFn(listCitizenRequestsAdmin);
  const reqs = useQuery({ queryKey: ["admin_requests"], queryFn: () => listReq() });
  const ach = useQuery(achievementsQuery);
  const ini = useQuery(initiativesQuery);
  const gal = useQuery(galleryQuery);

  const requests = (reqs.data ?? []) as CitizenRequest[];
  const achievements = (ach.data ?? []) as Achievement[];
  const initiatives = (ini.data ?? []) as Initiative[];
  const gallery = (gal.data ?? []) as GalleryItem[];

  const statusCounts = useMemo(() => {
    const acc: Record<RequestStatus, number> = {
      submitted: 0,
      under_review: 0,
      assigned: 0,
      in_progress: 0,
      resolved: 0,
      closed: 0,
    };
    requests.forEach((r) => {
      acc[r.status as RequestStatus] = (acc[r.status as RequestStatus] ?? 0) + 1;
    });
    return acc;
  }, [requests]);

  const categoryCounts = useMemo(() => {
    const m = new Map<string, number>();
    requests.forEach((r) => m.set(r.category, (m.get(r.category) ?? 0) + 1));
    return Array.from(m, ([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [requests]);

  const monthlyData = useMemo(() => {
    const map = new Map<string, number>();
    requests.forEach((r) => {
      const d = new Date(r.created_at);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      map.set(key, (map.get(key) ?? 0) + 1);
    });
    return Array.from(map, ([name, value]) => ({ name, value }))
      .sort((a, b) => a.name.localeCompare(b.name))
      .slice(-12);
  }, [requests]);

  const avgResolutionDays = useMemo(() => {
    const resolved = requests.filter((r) => r.status === "resolved" || r.status === "closed");
    if (resolved.length === 0) return 0;
    const total = resolved.reduce((sum, r) => {
      const start = new Date(r.created_at).getTime();
      const end = new Date(r.updated_at).getTime();
      return sum + Math.max(0, (end - start) / (1000 * 60 * 60 * 24));
    }, 0);
    return Math.round((total / resolved.length) * 10) / 10;
  }, [requests]);

  const recent = useMemo(
    () =>
      [...requests]
        .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
        .slice(0, 20),
    [requests],
  );

  const downloadCsv = () => {
    const headers = [
      "tracking_number",
      "title",
      "category",
      "status",
      "citizen_name",
      "citizen_civil_id",
      "citizen_phone",
      "citizen_email",
      "created_at",
      "updated_at",
      "attachments_count",
    ];
    const rows = requests.map((r) =>
      [
        r.tracking_number,
        r.title,
        r.category,
        REQUEST_STATUS_LABELS[r.status as RequestStatus],
        r.citizen_name,
        r.citizen_civil_id,
        r.citizen_phone,
        r.citizen_email ?? "",
        r.created_at,
        r.updated_at,
        r.attachments?.length ?? 0,
      ]
        .map(csvEscape)
        .join(","),
    );
    downloadBlob(
      [headers.join(","), ...rows].join("\n"),
      `requests-report-${new Date().toISOString().slice(0, 10)}.csv`,
      "text/csv;charset=utf-8",
    );
  };

  const downloadSummary = () => {
    const lines: string[] = [];
    lines.push("تقرير ملخّص — المكتب البرلماني");
    lines.push(`التاريخ: ${new Date().toLocaleString("ar")}`);
    lines.push("");
    lines.push("== المعاملات ==");
    lines.push(`الإجمالي: ${requests.length}`);
    (Object.keys(REQUEST_STATUS_LABELS) as RequestStatus[]).forEach((k) =>
      lines.push(`- ${REQUEST_STATUS_LABELS[k]}: ${statusCounts[k]}`),
    );
    lines.push(`متوسط زمن الحل (يوم): ${avgResolutionDays}`);
    lines.push("");
    lines.push("== الفئات ==");
    categoryCounts.forEach((c) => lines.push(`- ${c.name}: ${c.value}`));
    lines.push("");
    lines.push("== المحتوى ==");
    lines.push(`- الإنجازات: ${achievements.length}`);
    lines.push(
      `- المبادرات: ${initiatives.length} (نشطة: ${initiatives.filter((i) => i.status === "نشط").length}، مكتملة: ${initiatives.filter((i) => i.status === "مكتمل").length})`,
    );
    lines.push(`- المعرض: ${gallery.length}`);
    downloadBlob(
      lines.join("\n"),
      `summary-${new Date().toISOString().slice(0, 10)}.txt`,
      "text/plain;charset=utf-8",
    );
  };

  if (reqs.isLoading) return <div className="p-8 text-center text-navy-500">...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={downloadCsv}
          className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-navy-800 px-4 py-2 text-sm font-bold text-white hover:bg-navy-700"
        >
          <Download className="h-4 w-4" /> تصدير المعاملات CSV
        </button>
        <button
          onClick={downloadSummary}
          className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-gold-500 px-4 py-2 text-sm font-bold text-navy-900 hover:bg-gold-400"
        >
          <Download className="h-4 w-4" /> تصدير الملخّص
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard
          label="إجمالي المعاملات"
          value={requests.length}
          accent="bg-navy-900 text-gold-400"
          icon={FileText}
        />
        <StatCard
          label="متوسط زمن الحل (يوم)"
          value={avgResolutionDays}
          accent="bg-emerald-500 text-white"
          icon={Clock}
        />
        <StatCard
          label="معاملات تم حلها"
          value={statusCounts.resolved}
          accent="bg-sky-500 text-white"
          icon={CheckCircle}
        />
        <StatCard
          label="معاملات مغلقة"
          value={statusCounts.closed}
          accent="bg-zinc-500 text-white"
          icon={Archive}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title="المعاملات حسب الفئة">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={categoryCounts} margin={{ left: 0, right: 8, top: 8, bottom: 8 }}>
              <RCGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="value" fill="#1e3a8a" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="المعاملات خلال آخر 12 شهرًا">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={monthlyData} margin={{ left: 0, right: 8, top: 8, bottom: 8 }}>
              <RCGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="value" fill="#c5a85c" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-navy-100 bg-white p-4 shadow-sm">
          <h3 className="mb-3 text-sm font-bold text-navy-800">أعلى الفئات</h3>
          <table className="w-full text-right text-sm">
            <thead className="text-xs text-navy-500">
              <tr>
                <th className="p-2">الفئة</th>
                <th className="p-2">العدد</th>
              </tr>
            </thead>
            <tbody>
              {categoryCounts.length === 0 && (
                <tr>
                  <td colSpan={2} className="p-4 text-center text-navy-400">
                    لا توجد بيانات
                  </td>
                </tr>
              )}
              {categoryCounts.map((c) => (
                <tr key={c.name} className="border-t border-navy-100">
                  <td className="p-2">{c.name}</td>
                  <td className="p-2 font-bold">{c.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="rounded-2xl border border-navy-100 bg-white p-4 shadow-sm">
          <h3 className="mb-3 text-sm font-bold text-navy-800">النشاط الأخير</h3>
          <ul className="space-y-2 text-sm">
            {recent.length === 0 && (
              <li className="p-4 text-center text-navy-400">لا توجد بيانات</li>
            )}
            {recent.map((r) => (
              <li
                key={r.id}
                className="flex items-start justify-between gap-2 border-b border-navy-100 pb-2"
              >
                <div className="min-w-0">
                  <div className="truncate text-xs font-bold text-navy-800">{r.title}</div>
                  <div className="font-mono text-[10px] text-navy-500">{r.tracking_number}</div>
                </div>
                <div className="shrink-0 text-left">
                  <div className="rounded-full bg-navy-50 px-2 py-0.5 text-[10px] font-bold text-navy-700">
                    {REQUEST_STATUS_LABELS[r.status as RequestStatus]}
                  </div>
                  <div className="mt-1 text-[10px] text-navy-400">
                    {new Date(r.updated_at).toLocaleDateString("ar")}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <AuditLogSection />
    </div>
  );
}
