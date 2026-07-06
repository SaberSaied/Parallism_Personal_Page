import { useMemo } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  CartesianGrid,
} from "recharts";
import {
  FileText,
  Activity,
  CheckCircle,
  Play,
  Trophy,
  Award,
  Lightbulb,
  Image,
} from "lucide-react";
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
import { StatCard, ChartCard, STATUS_COLORS } from "./admin-helpers";

export function DashboardAdmin() {
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

  const statusData = (Object.keys(REQUEST_STATUS_LABELS) as RequestStatus[]).map((k) => ({
    name: REQUEST_STATUS_LABELS[k],
    value: statusCounts[k],
    color: STATUS_COLORS[k],
  }));

  const categoryData = useMemo(() => {
    const map = new Map<string, number>();
    requests.forEach((r) => map.set(r.category, (map.get(r.category) ?? 0) + 1));
    return Array.from(map, ([name, value]) => ({ name, value }));
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
      .slice(-6);
  }, [requests]);

  const activeIni = initiatives.filter((i) => i.status === "نشط").length;
  const completedIni = initiatives.filter((i) => i.status === "مكتمل").length;
  const resolvedReq = statusCounts.resolved;
  const openReq = requests.length - statusCounts.resolved - statusCounts.closed;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard
          label="إجمالي المعاملات"
          value={requests.length}
          accent="bg-navy-900 text-gold-400"
          icon={FileText}
        />
        <StatCard
          label="معاملات قيد التنفيذ"
          value={openReq}
          accent="bg-amber-500 text-white"
          icon={Activity}
        />
        <StatCard
          label="معاملات تم حلها"
          value={resolvedReq}
          accent="bg-emerald-500 text-white"
          icon={CheckCircle}
        />
        <StatCard
          label="مبادرات نشطة"
          value={activeIni}
          accent="bg-indigo-500 text-white"
          icon={Play}
        />
        <StatCard
          label="مبادرات مكتملة"
          value={completedIni}
          accent="bg-sky-500 text-white"
          icon={Trophy}
        />
        <StatCard
          label="إجمالي الإنجازات"
          value={achievements.length}
          accent="bg-gold-500 text-navy-900"
          icon={Award}
        />
        <StatCard
          label="إجمالي المبادرات"
          value={initiatives.length}
          accent="bg-rose-500 text-white"
          icon={Lightbulb}
        />
        <StatCard
          label="عناصر المعرض"
          value={gallery.length}
          accent="bg-teal-500 text-white"
          icon={Image}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title="توزيع المعاملات حسب الحالة">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={statusData}
                dataKey="value"
                nameKey="name"
                outerRadius={90}
                label={(e: any) => (e.value > 0 ? e.value : "")}
              >
                {statusData.map((s, i) => (
                  <Cell key={i} fill={s.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="المعاملات حسب الفئة">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={categoryData} margin={{ left: 0, right: 8, top: 8, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="value" fill="#c5a85c" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <ChartCard title="المعاملات خلال آخر 6 أشهر">
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={monthlyData} margin={{ left: 0, right: 8, top: 8, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
            <Tooltip />
            <Bar dataKey="value" fill="#1e3a8a" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}
