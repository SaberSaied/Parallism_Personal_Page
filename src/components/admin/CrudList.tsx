import { type ReactNode } from "react";
import { Plus, Pencil, Trash2, ImageOff } from "lucide-react";
import { cn } from "@/lib/utils";

export function CrudList({
  title,
  columns,
  rows,
  onNew,
  onEdit,
  onDelete,
  children,
}: {
  title: string;
  columns: string[];
  rows: Array<{ id: string; image?: string; cells: string[] }>;
  onNew: () => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  children?: ReactNode;
}) {
  return (
    <div>
      <div className="mb-4 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
        <h2 className="truncate text-lg font-bold text-navy-800">{title}</h2>
        <button
          onClick={onNew}
          className="inline-flex cursor-pointer shrink-0 items-center gap-1 rounded-lg bg-navy-800 px-3 py-2 text-xs font-bold text-white hover:bg-navy-700 sm:px-4 sm:text-sm"
        >
          <Plus className="h-4 w-4" /> إضافة
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-navy-100 bg-white">
        <div className="hidden w-full overflow-x-auto lg:block">
          <table className="w-full min-w-[700px] text-right text-sm">
            <thead className="bg-navy-50 text-xs uppercase text-navy-600">
              <tr>
                <th className="w-20 p-3"></th>
                {columns.map((c) => (
                  <th key={c} className="whitespace-nowrap p-3">
                    {c}
                  </th>
                ))}
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t border-navy-100 hover:bg-navy-50/40">
                  <td className="p-3">
                    {r.image && !r.image.includes("/src/assets/") ? (
                      <img
                        src={r.image}
                        alt=""
                        className="h-12 w-12 rounded-lg object-cover"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).style.display = "none";
                          (e.currentTarget.nextSibling as HTMLElement | null)?.style.setProperty("display", "flex");
                        }}
                      />
                    ) : null}
                    <div
                      className="h-12 w-12 rounded-lg bg-navy-100 items-center justify-center text-navy-400"
                      style={{ display: r.image && !r.image.includes("/src/assets/") ? "none" : "flex" }}
                    >
                      <ImageOff className="h-5 w-5" />
                    </div>
                  </td>
                  {r.cells.map((c, i) => (
                    <td
                      key={i}
                      className={cn("p-3", i === 0 ? "max-w-xs" : "whitespace-nowrap text-xs")}
                    >
                      <div className={i === 0 ? "truncate font-bold text-navy-800" : ""}>{c}</div>
                    </td>
                  ))}
                  <td className="whitespace-nowrap p-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => onEdit(r.id)}
                        aria-label="تعديل"
                        className="rounded-lg cursor-pointer border border-navy-200 p-2 text-navy-700 hover:bg-navy-50"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm("هل تريد الحذف؟")) onDelete(r.id);
                        }}
                        aria-label="حذف"
                        className="rounded-lg cursor-pointer border border-rose-200 p-2 text-rose-600 hover:bg-rose-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="divide-y divide-navy-100 lg:hidden">
          {rows.map((r) => (
            <div key={r.id} className="flex items-center gap-3 p-3">
              {r.image && !r.image.includes("/src/assets/") ? (
                <img
                  src={r.image}
                  alt=""
                  className="h-14 w-14 shrink-0 rounded-lg object-cover"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.display = "none";
                    (e.currentTarget.nextSibling as HTMLElement | null)?.style.setProperty("display", "flex");
                  }}
                />
              ) : null}
              <div
                className="h-14 w-14 shrink-0 rounded-lg bg-navy-100 items-center justify-center text-navy-400"
                style={{ display: r.image && !r.image.includes("/src/assets/") ? "none" : "flex" }}
              >
                <ImageOff className="h-6 w-6" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate font-bold text-navy-800">{r.cells[0]}</div>
                <div className="truncate text-xs text-navy-500">{r.cells.slice(1).join(" · ")}</div>
              </div>
              <button
                onClick={() => onEdit(r.id)}
                aria-label="تعديل"
                className="shrink-0 cursor-pointer rounded-lg border border-navy-200 p-2 text-navy-700 hover:bg-navy-50"
              >
                <Pencil className="h-4 w-4" />
              </button>
              <button
                onClick={() => {
                  if (confirm("هل تريد الحذف؟")) onDelete(r.id);
                }}
                aria-label="حذف"
                className="shrink-0 cursor-pointer rounded-lg border border-rose-200 p-2 text-rose-600 hover:bg-rose-50"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>

        {rows.length === 0 && (
          <div className="p-8 text-center text-navy-500">لا توجد عناصر بعد.</div>
        )}
      </div>
      {children}
    </div>
  );
}
