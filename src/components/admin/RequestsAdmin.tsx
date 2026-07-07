import { useState, useTransition } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Search, ChevronRight, ChevronLeft } from "lucide-react";
import { listCitizenRequestsAdmin, updateCitizenRequest, deleteCitizenRequest } from "@/lib/requests.functions";
import {
  REQUEST_STATUS_LABELS,
  type CitizenRequest,
  type RequestStatus,
} from "@/lib/parliament-types";
import { Modal } from "./admin-helpers";
import { AttachmentsInline, AttachmentsList } from "./Attachments";

const statusColor: Record<RequestStatus, string> = {
  submitted: "bg-slate-100 text-slate-800 border-slate-200",
  under_review: "bg-amber-100 text-amber-900 border-amber-200",
  assigned: "bg-blue-100 text-blue-900 border-blue-200",
  in_progress: "bg-indigo-100 text-indigo-900 border-indigo-200",
  resolved: "bg-emerald-100 text-emerald-900 border-emerald-200",
  closed: "bg-zinc-200 text-zinc-700 border-zinc-300",
};

export function RequestsAdmin() {
  const fn = useServerFn(listCitizenRequestsAdmin);
  const update = useServerFn(updateCitizenRequest);
  const q = useQuery({ queryKey: ["admin_requests"], queryFn: () => fn() });
  const qc = useQueryClient();
  const [isPending, startTransition] = useTransition();
  const mut = useMutation({
    mutationFn: (data: any) => update({ data }),
    onSuccess: (_, variables) => {
      toast.success("تم التحديث");
      qc.invalidateQueries({ queryKey: ["admin_requests"] });

      try {
        const updatedId = variables.id;
        const newStatus = variables.status;
        const newNotes = variables.admin_notes;

        const targetReq = all.find((r) => r.id === updatedId);
        if (targetReq) {
          const saved = JSON.parse(localStorage.getItem("local_citizen_requests") || "[]");
          const updatedList = saved.map((req: any) => {
            if (req.tracking_number === targetReq.tracking_number) {
              return {
                ...req,
                status: newStatus,
                admin_notes: newNotes !== undefined ? newNotes : req.admin_notes,
                updated_at: new Date().toISOString(),
              };
            }
            return req;
          });
          localStorage.setItem("local_citizen_requests", JSON.stringify(updatedList));
        }
      } catch (err) {
        console.error("Failed to update local storage request:", err);
      }
    },
    onError: (e: any) => toast.error(e.message),
  });
  const [open, setOpen] = useState<CitizenRequest | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<RequestStatus | "all">("all");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  if (q.isLoading) return <div className="p-8 text-center text-navy-500">...</div>;
  const all = (q.data ?? []) as CitizenRequest[];

  const deleteFn = useServerFn(deleteCitizenRequest);
  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteFn({ data: { id } }),
    onSuccess: (_, deletedId) => {
      toast.success("تم حذف المعاملة بنجاح");
      qc.invalidateQueries({ queryKey: ["admin_requests"] });

      try {
        const saved = JSON.parse(localStorage.getItem("local_citizen_requests") || "[]");
        const targetReq = all.find((r) => r.id === deletedId);
        if (targetReq) {
          const filteredList = saved.filter((req: any) => req.tracking_number !== targetReq.tracking_number);
          localStorage.setItem("local_citizen_requests", JSON.stringify(filteredList));
        }
      } catch (err) {
        console.error("Failed to delete request from localStorage:", err);
      }
    },
    onError: (e: any) => toast.error(e.message || "تعذر حذف المعاملة"),
  });

  const handleDelete = (id: string, trackingNumber: string) => {
    if (window.confirm(`هل أنت متأكد من رغبتك في حذف المعاملة رقم ${trackingNumber}؟`)) {
      startTransition(async () => {
        await deleteMut.mutateAsync(id);
      });
    }
  };

  const term = search.trim().toLowerCase();
  const filtered = all.filter((r) => {
    if (statusFilter !== "all" && r.status !== statusFilter) return false;
    if (!term) return true;
    return (
      r.tracking_number.toLowerCase().includes(term) ||
      r.title.toLowerCase().includes(term) ||
      r.citizen_name.toLowerCase().includes(term) ||
      r.citizen_civil_id.toLowerCase().includes(term) ||
      r.category.toLowerCase().includes(term)
    );
  });
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const requests = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
        <div className="relative">
          <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-400" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="ابحث برقم التتبع، العنوان، المواطن، الرقم القومي، الفئة..."
            className="w-full rounded-lg border border-navy-200 bg-white py-2 pr-9 pl-3 text-sm outline-none focus:border-navy-400"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value as any);
            setPage(1);
          }}
          className="rounded-lg border border-navy-200 bg-white px-3 py-2 text-sm"
        >
          <option value="all">كل الحالات</option>
          {(Object.keys(REQUEST_STATUS_LABELS) as RequestStatus[]).map((k) => (
            <option key={k} value={k}>
              {REQUEST_STATUS_LABELS[k]}
            </option>
          ))}
        </select>
      </div>

      <div className="rounded-xl border border-navy-100 bg-white">
        <div className="hidden w-full overflow-x-auto lg:block">
          <table className="w-full min-w-[800px] text-right text-sm">
            <thead className="bg-navy-50 text-xs uppercase text-navy-600">
              <tr>
                <th className="whitespace-nowrap p-3">رقم التتبع</th>
                <th className="p-3">العنوان</th>
                <th className="whitespace-nowrap p-3">المواطن</th>
                <th className="whitespace-nowrap p-3">الرقم القومي</th>
                <th className="whitespace-nowrap p-3">الفئة</th>
                <th className="whitespace-nowrap p-3">الحالة</th>
                <th className="whitespace-nowrap p-3">المرفقات</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {requests.map((r) => (
                <tr key={r.id} className="border-t border-navy-100 hover:bg-navy-50/40">
                  <td className="whitespace-nowrap p-3 font-mono text-xs">{r.tracking_number}</td>
                  <td className="max-w-xs p-3">
                    <div className="truncate">{r.title}</div>
                  </td>
                  <td className="whitespace-nowrap p-3 text-xs">{r.citizen_name}</td>
                  <td className="whitespace-nowrap p-3 font-mono text-xs">{r.citizen_civil_id}</td>
                  <td className="whitespace-nowrap p-3 text-xs">{r.category}</td>
                  <td className="whitespace-nowrap p-3 text-xs">
                    <select
                      value={r.status}
                      disabled={isPending}
                      onChange={(e) => {
                        const newStatus = e.target.value as RequestStatus;
                        startTransition(async () => {
                          await mut.mutateAsync({ id: r.id, status: newStatus });
                        });
                      }}
                      className={`cursor-pointer rounded-full px-2.5 py-1 text-xs font-bold border outline-none transition-colors ${statusColor[r.status as RequestStatus] || "bg-navy-50 text-navy-700 border-navy-200"}`}
                    >
                      {(Object.keys(REQUEST_STATUS_LABELS) as RequestStatus[]).map((k) => (
                        <option key={k} value={k} className="bg-white text-navy-800">
                          {REQUEST_STATUS_LABELS[k]}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="whitespace-nowrap p-3 text-xs">
                    {r.attachments && r.attachments.length > 0 ? (
                      <AttachmentsInline paths={r.attachments} />
                    ) : (
                      <span className="text-navy-300 text-center">—</span>
                    )}
                  </td>
                  <td className="whitespace-nowrap p-3">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setOpen(r)}
                        className="rounded cursor-pointer bg-navy-800 px-3 py-1 text-xs text-white hover:bg-navy-700"
                      >
                        إدارة
                      </button>
                      <button
                        onClick={() => handleDelete(r.id, r.tracking_number)}
                        disabled={deleteMut.isPending}
                        className="rounded cursor-pointer bg-red-600 px-3 py-1 text-xs text-white hover:bg-red-700 disabled:opacity-50"
                      >
                        حذف
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="divide-y divide-navy-100 lg:hidden">
          {requests.map((r) => (
            <div key={r.id} className="grid gap-2 p-4 text-sm">
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-xs text-navy-500">{r.tracking_number}</span>
                <select
                  value={r.status}
                  disabled={isPending}
                  onChange={(e) => {
                    const newStatus = e.target.value as RequestStatus;
                    startTransition(async () => {
                      await mut.mutateAsync({ id: r.id, status: newStatus });
                    });
                  }}
                  className={`cursor-pointer rounded-full px-2 py-0.5 text-[11px] font-bold border outline-none transition-colors ${statusColor[r.status as RequestStatus] || "bg-navy-50 text-navy-700 border-navy-200"}`}
                >
                  {(Object.keys(REQUEST_STATUS_LABELS) as RequestStatus[]).map((k) => (
                    <option key={k} value={k} className="bg-white text-navy-800">
                      {REQUEST_STATUS_LABELS[k]}
                    </option>
                  ))}
                </select>
              </div>
              <div className="font-bold text-navy-800">{r.title}</div>
              <div className="text-xs text-navy-500">
                {r.citizen_name} · {r.category}
              </div>
              {r.attachments && r.attachments.length > 0 && (
                <div className="pt-1">
                  <AttachmentsInline paths={r.attachments} />
                </div>
              )}
              <div className="flex gap-2 mt-1 w-full sm:w-auto sm:self-start">
                <button
                  onClick={() => setOpen(r)}
                  className="cursor-pointer flex-1 rounded-lg bg-navy-800 py-2 px-4 text-xs font-bold text-white text-center hover:bg-navy-700"
                >
                  إدارة
                </button>
                <button
                  onClick={() => handleDelete(r.id, r.tracking_number)}
                  disabled={deleteMut.isPending}
                  className="cursor-pointer flex-1 rounded-lg bg-red-600 py-2 px-4 text-xs font-bold text-white text-center hover:bg-red-700 disabled:opacity-50"
                >
                  حذف
                </button>
              </div>
            </div>
          ))}
        </div>
        {filtered.length === 0 && (
          <div className="p-8 text-center text-navy-500">لا توجد معاملات مطابقة.</div>
        )}
      </div>

      {filtered.length > 0 && (
        <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
          <div className="text-xs text-navy-500">
            عرض {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, filtered.length)}{" "}
            من {filtered.length}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage <= 1}
              className="grid cursor-pointer h-9 w-9 place-items-center rounded-lg border border-navy-200 bg-white text-navy-700 hover:bg-navy-50 disabled:opacity-40"
              aria-label="السابق"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <div className="rounded-lg border border-navy-200 bg-white px-3 py-1.5 text-xs font-bold text-navy-700">
              {safePage} / {totalPages}
            </div>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage >= totalPages}
              className="grid h-9 w-9 place-items-center rounded-lg cursor-pointer border border-navy-200 bg-white text-navy-700 hover:bg-navy-50 disabled:opacity-40"
              aria-label="التالي"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {open && (
        <Modal onClose={() => setOpen(null)} title={`إدارة المعاملة - ${open.tracking_number}`}>
          <div className="space-y-3 text-sm">
            <div>
              <b>المواطن:</b> {open.citizen_name} ({open.citizen_civil_id})
            </div>
            <div>
              <b>هاتف:</b> <span dir="ltr">{open.citizen_phone}</span>
            </div>
            <div>
              <b>بريد:</b> <span dir="ltr">{open.citizen_email || "—"}</span>
            </div>
            <div>
              <b>التفاصيل:</b>
              <p className="mt-1 whitespace-pre-line text-navy-700">{open.description}</p>
            </div>
            {open.attachments?.length > 0 && <AttachmentsList paths={open.attachments} />}
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const f = new FormData(e.currentTarget);
              startTransition(async () => {
                await mut.mutateAsync({
                  id: open.id,
                  status: f.get("status"),
                  admin_notes: f.get("admin_notes"),
                  assigned_to: f.get("assigned_to"),
                });
              });
              setOpen(null);
            }}
            className="mt-4 space-y-3 border-t border-navy-100 pt-4"
          >
            <label className="block text-sm">
              <span className="mb-1 block font-bold text-navy-700">الحالة</span>
              <select
                name="status"
                defaultValue={open.status}
                className="w-full rounded-lg border border-navy-200 p-2"
              >
                {(Object.keys(REQUEST_STATUS_LABELS) as RequestStatus[]).map((k) => (
                  <option key={k} value={k}>
                    {REQUEST_STATUS_LABELS[k]}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm">
              <span className="mb-1 block font-bold text-navy-700">مسند إلى</span>
              <input
                name="assigned_to"
                defaultValue={open.assigned_to}
                className="w-full rounded-lg border border-navy-200 p-2"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block font-bold text-navy-700">ملاحظات الإدارة</span>
              <textarea
                name="admin_notes"
                defaultValue={open.admin_notes}
                rows={4}
                className="w-full rounded-lg border border-navy-200 p-2"
              />
            </label>
            <button
              disabled={isPending}
              className="w-full rounded-lg cursor-pointer bg-gold-500 px-4 py-2 font-bold text-navy-900 sm:w-auto disabled:opacity-60"
            >
              {isPending ? "..." : "حفظ"}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}
