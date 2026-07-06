import { useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { Search, Download } from "lucide-react";
import { listAdminAuditLog } from "@/lib/requests.functions";
import { csvEscape, downloadBlob } from "./admin-helpers";

interface AuditEntry {
  id: string;
  actor_email: string | null;
  entity_type: string;
  entity_id: string;
  action: string;
  summary: string;
  created_at: string;
}

const ACTION_BADGE: Record<string, string> = {
  create: "bg-emerald-100 text-emerald-800",
  update: "bg-blue-100 text-blue-800",
  delete: "bg-rose-100 text-rose-800",
  status_change: "bg-amber-100 text-amber-800",
};
const ACTION_LABEL: Record<string, string> = {
  create: "إنشاء",
  update: "تحديث",
  delete: "حذف",
  status_change: "تغيير حالة",
};
const TYPE_LABEL: Record<string, string> = {
  citizen_request: "معاملة",
  initiative: "مبادرة",
  achievement: "إنجاز",
  gallery_item: "معرض",
};

export function AuditLogSection() {
  const list = useServerFn(listAdminAuditLog);
  const q = useQuery({ queryKey: ["admin_audit_log"], queryFn: () => list() });
  const [entityFilter, setEntityFilter] = useState<"all" | "citizen_request" | "initiative">("all");
  const [actionFilter, setActionFilter] = useState<
    "all" | "create" | "update" | "delete" | "status_change"
  >("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sortDir, setSortDir] = useState<"desc" | "asc">("desc");
  const [search, setSearch] = useState("");

  const entries: AuditEntry[] = (q.data as AuditEntry[] | undefined) ?? [];
  const filtered = useMemo(() => {
    const fromTs = dateFrom ? new Date(dateFrom + "T00:00:00").getTime() : null;
    const toTs = dateTo ? new Date(dateTo + "T23:59:59").getTime() : null;
    const s = search.trim().toLowerCase();
    const arr = entries.filter((e) => {
      if (entityFilter !== "all" && e.entity_type !== entityFilter) return false;
      if (actionFilter !== "all" && e.action !== actionFilter) return false;
      const ts = new Date(e.created_at).getTime();
      if (fromTs !== null && ts < fromTs) return false;
      if (toTs !== null && ts > toTs) return false;
      if (s) {
        return (
          e.summary.toLowerCase().includes(s) ||
          (e.actor_email ?? "").toLowerCase().includes(s) ||
          e.action.includes(s)
        );
      }
      return true;
    });
    arr.sort((a, b) => {
      const da = new Date(a.created_at).getTime();
      const db = new Date(b.created_at).getTime();
      return sortDir === "desc" ? db - da : da - db;
    });
    return arr;
  }, [entries, entityFilter, actionFilter, dateFrom, dateTo, sortDir, search]);

  const resetFilters = () => {
    setEntityFilter("all");
    setActionFilter("all");
    setDateFrom("");
    setDateTo("");
    setSearch("");
    setSortDir("desc");
  };

  const exportCsv = () => {
    const headers = ["created_at", "actor_email", "entity_type", "entity_id", "action", "summary"];
    const rows = filtered.map((e) =>
      [e.created_at, e.actor_email ?? "", e.entity_type, e.entity_id, e.action, e.summary]
        .map(csvEscape)
        .join(","),
    );
    downloadBlob(
      [headers.join(","), ...rows].join("\n"),
      `audit-log-${new Date().toISOString().slice(0, 10)}.csv`,
      "text/csv;charset=utf-8",
    );
  };

  const inputCls = "rounded-lg border border-navy-200 bg-white px-2 py-1 text-xs";

  return (
    <div className="rounded-2xl border border-navy-100 bg-white p-4 shadow-sm">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-bold text-navy-800">سجل تدقيق عمليات الأدمن</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={resetFilters}
            className="rounded-lg cursor-pointer border border-navy-200 bg-white px-3 py-1.5 text-[11px] font-bold text-navy-700 hover:bg-navy-50"
          >
            إعادة تعيين
          </button>
          <button
            onClick={exportCsv}
            className="inline-flex cursor-pointer items-center gap-1 rounded-lg bg-navy-800 px-3 py-1.5 text-[11px] font-bold text-white hover:bg-navy-700"
          >
            <Download className="h-3 w-3" /> تصدير CSV
          </button>
        </div>
      </div>
      <div className="mb-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-6">
        <select
          value={entityFilter}
          onChange={(e) => setEntityFilter(e.target.value as any)}
          className={inputCls}
          aria-label="النوع"
        >
          <option value="all">كل الأنواع</option>
          <option value="citizen_request">المعاملات</option>
          <option value="initiative">المبادرات</option>
        </select>
        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value as any)}
          className={inputCls}
          aria-label="الإجراء"
        >
          <option value="all">كل الإجراءات</option>
          <option value="create">إنشاء</option>
          <option value="update">تحديث</option>
          <option value="delete">حذف</option>
          <option value="status_change">تغيير حالة</option>
        </select>
        <input
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          className={inputCls}
          aria-label="من تاريخ"
        />
        <input
          type="date"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          className={inputCls}
          aria-label="إلى تاريخ"
        />
        <select
          value={sortDir}
          onChange={(e) => setSortDir(e.target.value as any)}
          className={inputCls}
          aria-label="الترتيب"
        >
          <option value="desc">الأحدث أولًا</option>
          <option value="asc">الأقدم أولًا</option>
        </select>
        <div className="relative">
          <Search className="absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2 text-navy-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="بحث..."
            className={`${inputCls} w-full py-1 pr-7 pl-2`}
          />
        </div>
      </div>
      <div className="mb-2 text-[11px] text-navy-500">النتائج: {filtered.length}</div>
      {q.isLoading ? (
        <div className="p-4 text-center text-xs text-navy-400">...جارٍ التحميل</div>
      ) : filtered.length === 0 ? (
        <div className="p-4 text-center text-xs text-navy-400">لا توجد عمليات مطابقة</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-right text-xs">
            <thead className="text-[10px] uppercase text-navy-500">
              <tr>
                <th className="p-2">التاريخ</th>
                <th className="p-2">الأدمن</th>
                <th className="p-2">النوع</th>
                <th className="p-2">الإجراء</th>
                <th className="p-2">الملخّص</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((e) => (
                <tr key={e.id} className="border-t border-navy-100">
                  <td className="p-2 whitespace-nowrap text-[10px] text-navy-500">
                    {new Date(e.created_at).toLocaleString("ar")}
                  </td>
                  <td className="p-2 text-navy-700">{e.actor_email ?? "—"}</td>
                  <td className="p-2">
                    <span className="rounded-full bg-navy-50 px-2 py-0.5 text-[10px] font-bold text-navy-700">
                      {TYPE_LABEL[e.entity_type] ?? e.entity_type}
                    </span>
                  </td>
                  <td className="p-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${ACTION_BADGE[e.action] ?? "bg-navy-100 text-navy-700"}`}
                    >
                      {ACTION_LABEL[e.action] ?? e.action}
                    </span>
                  </td>
                  <td className="p-2 text-navy-800">{e.summary}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
