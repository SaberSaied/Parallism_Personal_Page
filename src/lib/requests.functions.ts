import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

async function assertAdmin(ctx: { supabase: any; userId: string }) {
  const { data } = await ctx.supabase.rpc("has_role", { _user_id: ctx.userId, _role: "admin" });
  if (!data) throw new Error("Forbidden");
}

function genTracking() {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  const date = `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`;
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `REQ-${date}-${rand}`;
}

const submitInput = z.object({
  citizenName: z.string().min(3).max(120).regex(/^[a-zA-Z\u0600-\u06FF\s]+$/, {
    message: "الاسم يجب أن يحتوي على حروف فقط",
  }),
  citizenCivilId: z.string().regex(/^[23]\d{13}$/, {
    message: "الرقم القومي غير صالح، يجب أن يتكون من 14 رقمًا تبدأ بـ 2 أو 3",
  }),
  citizenPhone: z.string().regex(/^01[0125]\d{8}$/, {
    message: "رقم الهاتف غير صالح، يجب أن يكون رقم هاتف مصري مكون من 11 رقمًا ويبدأ بـ 010 أو 011 أو 012 أو 015",
  }),
  citizenEmail: z.string().email({ message: "البريد الإلكتروني غير صالح" }).optional().or(z.literal("")),
  title: z.string().min(4, { message: "عنوان الطلب قصير جداً" }).max(200, { message: "عنوان الطلب طويل جداً" }),
  category: z.enum(["شكوى", "طلب خدمة", "اقتراح بقانون", "استشارة"]),
  description: z.string().min(10, { message: "الوصف قصير جداً" }).max(5000, { message: "الوصف طويل جداً" }),
  attachments: z.array(z.string()).max(10).optional(),
});

export const submitCitizenRequest = createServerFn({ method: "POST" })
  .validator((d: unknown) => submitInput.parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const tracking = genTracking();
    const { error } = await supabaseAdmin
      .from("citizen_requests")
      .insert({
        tracking_number: tracking,
        citizen_name: data.citizenName,
        citizen_civil_id: data.citizenCivilId,
        citizen_phone: data.citizenPhone,
        citizen_email: data.citizenEmail || null,
        title: data.title,
        category: data.category,
        description: data.description,
        attachments: data.attachments ?? [],
      });
    if (error) throw error;
    return { tracking_number: tracking };
  });

// Track by tracking number OR national ID.
export const trackCitizenRequest = createServerFn({ method: "POST" })
  .validator((d: unknown) => z.object({ query: z.string().min(4).max(40) }).parse(d))
  .handler(async ({ data }) => {
    const { supabase } = await import("@/integrations/supabase/client");
    const q = data.query.trim();
    const { data: rows, error } = await supabase
      .from("citizen_requests")
      .select("tracking_number, title, category, status, admin_notes, created_at, updated_at")
      .or(`tracking_number.eq.${q},citizen_civil_id.eq.${q}`)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return rows ?? [];
  });

export const listCitizenRequestsAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { data, error } = await context.supabase
      .from("citizen_requests")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  });

const updateInput = z.object({
  id: z.string(),
  status: z
    .enum(["submitted", "under_review", "assigned", "in_progress", "resolved", "closed"])
    .optional(),
  admin_notes: z.string().max(5000).optional(),
  assigned_to: z.string().max(200).optional(),
});

export const updateCitizenRequest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: unknown) => updateInput.parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { id, ...rest } = data;

    // Snapshot before update for audit diff
    const { data: before } = await context.supabase
      .from("citizen_requests")
      .select("status, admin_notes, assigned_to, tracking_number, title")
      .eq("id", id)
      .single();

    const { data: row, error } = await context.supabase
      .from("citizen_requests")
      .update(rest)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;

    // Write audit row(s)
    try {
      const changes: Record<string, { from: any; to: any }> = {};
      (Object.keys(rest) as (keyof typeof rest)[]).forEach((k) => {
        if (before && before[k as keyof typeof before] !== rest[k]) {
          changes[k as string] = { from: before[k as keyof typeof before], to: rest[k] };
        }
      });
      const statusChanged = changes["status"];
      const ref = before?.tracking_number ?? id;
      let summary = `تحديث على المعاملة ${ref}`;
      if (statusChanged) {
        const labels: Record<string, string> = {
          submitted: "مُقدّمة",
          under_review: "قيد المراجعة",
          assigned: "تم الإسناد",
          in_progress: "قيد التنفيذ",
          resolved: "تم الحل",
          closed: "مغلقة",
        };
        summary = `تغيير حالة المعاملة ${ref} من «${labels[statusChanged.from] ?? statusChanged.from}» إلى «${labels[statusChanged.to] ?? statusChanged.to}»`;
      } else if (changes["admin_notes"]) {
        summary = `تحديث ملاحظات المعاملة ${ref}`;
      } else if (changes["assigned_to"]) {
        summary = `إسناد المعاملة ${ref} إلى ${changes["assigned_to"].to}`;
      }
      await context.supabase.from("admin_audit_log").insert({
        actor_id: context.userId,
        actor_email: (context.claims as any)?.email ?? null,
        entity_type: "citizen_request",
        entity_id: id,
        action: statusChanged ? "status_change" : "update",
        summary,
        diff: changes,
      });
    } catch {
      /* non-blocking */
    }

    return row;
  });

// Signed admin URL for an attachment
export const getAttachmentUrl = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: unknown) => z.object({ path: z.string() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: signed, error } = await supabaseAdmin.storage
      .from("request-attachments")
      .createSignedUrl(data.path, 60 * 10);
    if (error) throw error;
    return { url: signed.signedUrl };
  });

// List audit log entries (admin only)
export const listAdminAuditLog = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { data, error } = await context.supabase
      .from("admin_audit_log")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) throw error;
    return data ?? [];
  });

export const deleteCitizenRequest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: unknown) => z.object({ id: z.string() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { id } = data;

    // Snapshot before delete for audit log
    const { data: before } = await context.supabase
      .from("citizen_requests")
      .select("tracking_number, title")
      .eq("id", id)
      .single();

    const { error } = await context.supabase
      .from("citizen_requests")
      .delete()
      .eq("id", id);
    if (error) throw error;

    // Write audit log entry
    try {
      const ref = before?.tracking_number ?? id;
      await context.supabase.from("admin_audit_log").insert({
        actor_id: context.userId,
        actor_email: (context.claims as any)?.email ?? null,
        entity_type: "citizen_request",
        entity_id: id,
        action: "delete",
        summary: `حذف المعاملة رقم ${ref} - ${before?.title || ""}`,
        diff: before || {},
      });
    } catch {
      /* non-blocking */
    }

    return { success: true };
  });
