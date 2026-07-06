import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  upsertAchievement,
  deleteAchievement,
  upsertInitiative,
  deleteInitiative,
  upsertGallery,
  deleteGallery,
} from "@/lib/content.functions";
import { achievementsQuery, initiativesQuery, galleryQuery } from "@/lib/queries";
import type { Achievement, Initiative, GalleryItem } from "@/lib/parliament-types";
import { Modal, FieldRow } from "./admin-helpers";
import { CrudList } from "./CrudList";

const ACH_FIELDS: Array<{ key: keyof Achievement; label: string; type?: string; rows?: number }> = [
  { key: "title", label: "العنوان" },
  { key: "description", label: "الوصف", rows: 2 },
  { key: "content", label: "المحتوى الكامل", rows: 5 },
  { key: "category", label: "التصنيف" },
  { key: "date", label: "التاريخ" },
  { key: "image", label: "رابط الصورة" },
  { key: "slug", label: "المعرف (slug)" },
  { key: "likes", label: "الإعجابات", type: "number" },
];

export function AchievementsAdmin() {
  const qc = useQueryClient();
  const q = useQuery(achievementsQuery);
  const upsert = useServerFn(upsertAchievement);
  const del = useServerFn(deleteAchievement);
  const [edit, setEdit] = useState<Partial<Achievement> | null>(null);

  const upsertMut = useMutation({
    mutationFn: (data: any) => upsert({ data }),
    onSuccess: () => {
      toast.success("تم الحفظ");
      setEdit(null);
      qc.invalidateQueries({ queryKey: ["achievements"] });
    },
    onError: (e: any) => toast.error(e.message),
  });
  const deleteMut = useMutation({
    mutationFn: (id: string) => del({ data: { id } }),
    onSuccess: () => {
      toast.success("تم الحذف");
      qc.invalidateQueries({ queryKey: ["achievements"] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  const items = (q.data ?? []) as Achievement[];
  return (
    <CrudList
      title="الإنجازات"
      columns={["العنوان", "التصنيف", "التاريخ"]}
      rows={items.map((i) => ({ id: i.id, image: i.image, cells: [i.title, i.category, i.date] }))}
      onNew={() => setEdit({ likes: 0 })}
      onEdit={(id) => setEdit(items.find((i) => i.id === id) || null)}
      onDelete={(id) => deleteMut.mutate(id)}
    >
      {edit && (
        <Modal onClose={() => setEdit(null)} title={edit.id ? "تعديل إنجاز" : "إضافة إنجاز"}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const f = new FormData(e.currentTarget);
              const data: any = { id: edit.id };
              ACH_FIELDS.forEach((field) => {
                const v = f.get(field.key as string);
                data[field.key] = field.type === "number" ? Number(v) : v;
              });
              upsertMut.mutate(data);
            }}
            className="space-y-3"
          >
            {ACH_FIELDS.map((field) => (
              <FieldRow
                key={field.key as string}
                field={field}
                defaultValue={(edit as any)[field.key]}
              />
            ))}
            <button
              disabled={upsertMut.isPending}
              className="w-full cursor-pointer rounded-lg bg-gold-500 px-4 py-2 font-bold text-navy-900 sm:w-auto"
            >
              حفظ
            </button>
          </form>
        </Modal>
      )}
    </CrudList>
  );
}

const INI_FIELDS: Array<{
  key: keyof Initiative;
  label: string;
  type?: string;
  rows?: number;
  options?: string[];
}> = [
  { key: "title", label: "العنوان" },
  { key: "description", label: "الوصف", rows: 2 },
  { key: "content", label: "المحتوى الكامل", rows: 5 },
  { key: "status", label: "الحالة", options: ["نشط", "مكتمل", "مخطط له"] },
  { key: "category", label: "التصنيف" },
  { key: "date", label: "التاريخ" },
  { key: "image", label: "رابط الصورة" },
  { key: "slug", label: "المعرف" },
  { key: "progress", label: "نسبة الإنجاز (٪)", type: "number" },
];

export function InitiativesAdmin() {
  const qc = useQueryClient();
  const q = useQuery(initiativesQuery);
  const upsert = useServerFn(upsertInitiative);
  const del = useServerFn(deleteInitiative);
  const [edit, setEdit] = useState<Partial<Initiative> | null>(null);

  const upsertMut = useMutation({
    mutationFn: (data: any) => upsert({ data }),
    onSuccess: () => {
      toast.success("تم الحفظ");
      setEdit(null);
      qc.invalidateQueries({ queryKey: ["initiatives"] });
    },
    onError: (e: any) => toast.error(e.message),
  });
  const deleteMut = useMutation({
    mutationFn: (id: string) => del({ data: { id } }),
    onSuccess: () => {
      toast.success("تم الحذف");
      qc.invalidateQueries({ queryKey: ["initiatives"] });
    },
    onError: (e: any) => toast.error(e.message),
  });
  const items = (q.data ?? []) as Initiative[];

  return (
    <CrudList
      title="المبادرات"
      columns={["العنوان", "الحالة", "نسبة الإنجاز"]}
      rows={items.map((i) => ({
        id: i.id,
        image: i.image,
        cells: [i.title, i.status, `${i.progress}٪`],
      }))}
      onNew={() => setEdit({ status: "نشط", progress: 0 })}
      onEdit={(id) => setEdit(items.find((i) => i.id === id) || null)}
      onDelete={(id) => deleteMut.mutate(id)}
    >
      {edit && (
        <Modal onClose={() => setEdit(null)} title={edit.id ? "تعديل مبادرة" : "إضافة مبادرة"}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const f = new FormData(e.currentTarget);
              const data: any = { id: edit.id };
              INI_FIELDS.forEach((field) => {
                const v = f.get(field.key as string);
                data[field.key] = field.type === "number" ? Number(v) : v;
              });
              upsertMut.mutate(data);
            }}
            className="space-y-3"
          >
            {INI_FIELDS.map((field) => (
              <FieldRow
                key={field.key as string}
                field={field}
                defaultValue={(edit as any)[field.key]}
              />
            ))}
            <button
              disabled={upsertMut.isPending}
              className="w-full cursor-pointer rounded-lg bg-gold-500 px-4 py-2 font-bold text-navy-900 sm:w-auto"
            >
              حفظ
            </button>
          </form>
        </Modal>
      )}
    </CrudList>
  );
}

const GAL_FIELDS = [
  { key: "title", label: "العنوان" },
  { key: "category", label: "التصنيف" },
  { key: "image_url", label: "رابط الصورة" },
  { key: "date", label: "التاريخ" },
] as const;

export function GalleryAdmin() {
  const qc = useQueryClient();
  const q = useQuery(galleryQuery);
  const upsert = useServerFn(upsertGallery);
  const del = useServerFn(deleteGallery);
  const [edit, setEdit] = useState<Partial<GalleryItem> | null>(null);

  const upsertMut = useMutation({
    mutationFn: (data: any) => upsert({ data }),
    onSuccess: () => {
      toast.success("تم الحفظ");
      setEdit(null);
      qc.invalidateQueries({ queryKey: ["gallery"] });
    },
    onError: (e: any) => toast.error(e.message),
  });
  const deleteMut = useMutation({
    mutationFn: (id: string) => del({ data: { id } }),
    onSuccess: () => {
      toast.success("تم الحذف");
      qc.invalidateQueries({ queryKey: ["gallery"] });
    },
    onError: (e: any) => toast.error(e.message),
  });
  const items = (q.data ?? []) as GalleryItem[];

  return (
    <CrudList
      title="المعرض"
      columns={["العنوان", "التصنيف", "التاريخ"]}
      rows={items.map((i) => ({
        id: i.id,
        image: i.image_url,
        cells: [i.title, i.category, i.date],
      }))}
      onNew={() => setEdit({})}
      onEdit={(id) => setEdit(items.find((i) => i.id === id) || null)}
      onDelete={(id) => deleteMut.mutate(id)}
    >
      {edit && (
        <Modal onClose={() => setEdit(null)} title={edit.id ? "تعديل صورة" : "إضافة صورة"}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const f = new FormData(e.currentTarget);
              const data: any = { id: edit.id };
              GAL_FIELDS.forEach((field) => {
                data[field.key] = f.get(field.key);
              });
              upsertMut.mutate(data);
            }}
            className="space-y-3"
          >
            {GAL_FIELDS.map((field) => (
              <FieldRow
                key={field.key}
                field={field as any}
                defaultValue={(edit as any)[field.key]}
              />
            ))}
            <button
              disabled={upsertMut.isPending}
              className="w-full cursor-pointer rounded-lg bg-gold-500 px-4 py-2 font-bold text-navy-900 sm:w-auto"
            >
              حفظ
            </button>
          </form>
        </Modal>
      )}
    </CrudList>
  );
}
