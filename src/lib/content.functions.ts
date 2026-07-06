import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/types";
import { z } from "zod";

function publicClient() {
  return createClient<Database>(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
  });
}

async function assertAdmin(ctx: { supabase: any; userId: string }) {
  const { data, error } = await ctx.supabase.rpc("has_role", {
    _user_id: ctx.userId,
    _role: "admin",
  });
  if (error || !data) throw new Error("Forbidden");
}

// ============ PUBLIC READS ============

export const getParliamentInfo = createServerFn({ method: "GET" }).handler(async () => {
  const s = publicClient();
  const { data, error } = await s.from("parliament_info").select("*").limit(1).maybeSingle();
  if (error) throw error;
  return data;
});

export const getStatistics = createServerFn({ method: "GET" }).handler(async () => {
  const s = publicClient();
  const { data, error } = await s.from("statistics").select("*").order("sort_order");
  if (error) throw error;
  return data ?? [];
});

export const getTimeline = createServerFn({ method: "GET" }).handler(async () => {
  const s = publicClient();
  const { data, error } = await s.from("timeline_events").select("*").order("sort_order");
  if (error) throw error;
  return data ?? [];
});

export const getTestimonials = createServerFn({ method: "GET" }).handler(async () => {
  const s = publicClient();
  const { data, error } = await s.from("testimonials").select("*").order("created_at");
  if (error) throw error;
  return data ?? [];
});

export const getAchievements = createServerFn({ method: "GET" }).handler(async () => {
  const s = publicClient();
  const { data, error } = await s
    .from("achievements")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
});

export const getInitiatives = createServerFn({ method: "GET" }).handler(async () => {
  const s = publicClient();
  const { data, error } = await s
    .from("initiatives")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
});

export const getGallery = createServerFn({ method: "GET" }).handler(async () => {
  const s = publicClient();
  const { data, error } = await s
    .from("gallery_items")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
});

// ============ ADMIN WRITES ============

const achievementInput = z.object({
  id: z.string().optional(),
  title: z.string().min(1),
  description: z.string().min(1),
  content: z.string().min(1),
  category: z.string().min(1),
  date: z.string().min(1),
  image: z.string().url(),
  slug: z.string().min(1),
  likes: z.number().int().nonnegative().default(0),
  status: z.string().nullish(),
  progress: z.number().int().min(0).max(100).nullish(),
  link: z.string().nullish(),
});

export const upsertAchievement = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: unknown) => achievementInput.parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { id, ...rest } = data;
    const q = id
      ? context.supabase.from("achievements").update(rest).eq("id", id).select().single()
      : context.supabase.from("achievements").insert(rest).select().single();
    const { data: row, error } = await q;
    if (error) throw error;
    return row;
  });

export const deleteAchievement = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: unknown) => z.object({ id: z.string() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { error } = await context.supabase.from("achievements").delete().eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });

const initiativeInput = z.object({
  id: z.string().optional(),
  title: z.string().min(1),
  description: z.string().min(1),
  content: z.string().min(1),
  status: z.enum(["نشط", "مكتمل", "مخطط له"]),
  category: z.string().min(1),
  date: z.string().min(1),
  image: z.string().url(),
  slug: z.string().min(1),
  progress: z.number().int().min(0).max(100),
});

export const upsertInitiative = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: unknown) => initiativeInput.parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { id, ...rest } = data;
    const q = id
      ? context.supabase.from("initiatives").update(rest).eq("id", id).select().single()
      : context.supabase.from("initiatives").insert(rest).select().single();
    const { data: row, error } = await q;
    if (error) throw error;
    try {
      await context.supabase.from("admin_audit_log").insert({
        actor_id: context.userId,
        actor_email: (context.claims as any)?.email ?? null,
        entity_type: "initiative",
        entity_id: row.id,
        action: id ? "update" : "create",
        summary: id ? `تحديث المبادرة «${rest.title}»` : `إضافة مبادرة جديدة «${rest.title}»`,
        diff: rest,
      });
    } catch {
      /* non-blocking */
    }
    return row;
  });

export const deleteInitiative = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: unknown) => z.object({ id: z.string() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { data: before } = await context.supabase
      .from("initiatives")
      .select("title")
      .eq("id", data.id)
      .single();
    const { error } = await context.supabase.from("initiatives").delete().eq("id", data.id);
    if (error) throw error;
    try {
      await context.supabase.from("admin_audit_log").insert({
        actor_id: context.userId,
        actor_email: (context.claims as any)?.email ?? null,
        entity_type: "initiative",
        entity_id: data.id,
        action: "delete",
        summary: `حذف المبادرة «${before?.title ?? data.id}»`,
        diff: before,
      });
    } catch {
      /* non-blocking */
    }
    return { ok: true };
  });

const galleryInput = z.object({
  id: z.string().optional(),
  title: z.string().min(1),
  category: z.string().min(1),
  image_url: z.string().url(),
  date: z.string().min(1),
});

export const upsertGallery = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: unknown) => galleryInput.parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { id, ...rest } = data;
    const q = id
      ? context.supabase.from("gallery_items").update(rest).eq("id", id).select().single()
      : context.supabase.from("gallery_items").insert(rest).select().single();
    const { data: row, error } = await q;
    if (error) throw error;
    return row;
  });

export const deleteGallery = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: unknown) => z.object({ id: z.string() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { error } = await context.supabase.from("gallery_items").delete().eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });

const parliamentInfoInput = z.object({
  id: z.string(),
  name: z.string().min(3).max(120).regex(/^[a-zA-Z\u0600-\u06FF\s]+$/, {
    message: "الاسم يجب أن يحتوي على حروف فقط",
  }),
  title: z.string().min(3).max(100),
  bio: z.string().min(1),
  office_address: z.string().min(5).max(200),
  phone: z.string().regex(/^\+?\d{8,15}$/, {
    message: "رقم الهاتف غير صالح، يجب أن يتكون من 8 إلى 15 رقمًا",
  }),
  email: z.string().email({ message: "البريد الإلكتروني غير صالح" }),
  working_hours: z.string().min(3).max(100),
  social_media: z.record(z.string(), z.string()),
});

export const updateParliamentInfo = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: unknown) => parliamentInfoInput.parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { id, ...rest } = data;
    const { data: row, error } = await context.supabase
      .from("parliament_info")
      .upsert({ id, ...rest })
      .select()
      .single();
    if (error) throw error;

    try {
      await context.supabase.from("admin_audit_log").insert({
        actor_id: context.userId,
        actor_email:
          typeof context.claims === "object" && context.claims && "email" in context.claims
            ? String(context.claims.email)
            : null,
        entity_type: "parliament_info",
        entity_id: id,
        action: "update",
        summary: `تحديث الملف الشخصي والإعدادات العامة للنائب`,
        diff: rest,
      });
    } catch {
      /* non-blocking */
    }

    return row;
  });
