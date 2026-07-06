import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { getMyAdminStatus, bootstrapAdmin } from "@/lib/roles.functions";
import { supabase } from "@/integrations/supabase/client";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  LogOut,
  ShieldCheck,
  Inbox,
  Award,
  Compass,
  Image as ImageIcon,
  Landmark,
  Menu,
  Home,
  ChevronRight,
  ChevronLeft,
  LayoutDashboard,
  FileBarChart2,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DashboardAdmin } from "@/components/admin/DashboardAdmin";
import { RequestsAdmin } from "@/components/admin/RequestsAdmin";
import { AchievementsAdmin, InitiativesAdmin, GalleryAdmin } from "@/components/admin/ContentAdmin";
import { ReportsAdmin } from "@/components/admin/ReportsAdmin";
import { SettingsAdmin } from "@/components/admin/SettingsAdmin";

export const Route = createFileRoute("/_authenticated/admin")({
  component: AdminPage,
});

type Tab =
  "dashboard" | "requests" | "achievements" | "initiatives" | "gallery" | "reports" | "settings";

const NAV_ITEMS: ReadonlyArray<{ key: Tab; label: string; icon: typeof Inbox }> = [
  { key: "dashboard", label: "اللوحة", icon: LayoutDashboard },
  { key: "requests", label: "المعاملات", icon: Inbox },
  { key: "achievements", label: "الإنجازات", icon: Award },
  { key: "initiatives", label: "المبادرات", icon: Compass },
  { key: "gallery", label: "المعرض", icon: ImageIcon },
  { key: "reports", label: "التقارير", icon: FileBarChart2 },
  { key: "settings", label: "الإعدادات", icon: Settings },
];

function AdminPage() {
  const navigate = useNavigate();
  const getStatus = useServerFn(getMyAdminStatus);
  const bootstrap = useServerFn(bootstrapAdmin);
  const status = useQuery({ queryKey: ["admin_status"], queryFn: () => getStatus() });
  const [tab, setTab] = useState<Tab>("dashboard");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(max-width: 1023px)").matches;
  });

  const bootstrapMut = useMutation({
    mutationFn: () => bootstrap(),
    onSuccess: (r) => {
      if (r.promoted) toast.success("تم منحك صلاحيات الإدارة");
      else toast.error("يوجد مسؤول مسبقاً");
      status.refetch();
    },
  });

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  };

  if (status.isLoading) {
    return (
      <div className="grid min-h-screen place-items-center p-6 text-navy-600">جارٍ التحقق...</div>
    );
  }

  if (!status.data?.isAdmin) {
    return (
      <div className="grid min-h-screen place-items-center bg-navy-50/40 p-4">
        <div className="w-full max-w-xl rounded-2xl bg-white p-6 text-center shadow-sm sm:p-10">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-amber-100 text-amber-700">
            <ShieldCheck className="h-7 w-7" />
          </div>
          <h1 className="mt-4 text-xl font-extrabold text-navy-800 sm:text-2xl">
            حسابك لا يملك صلاحيات الإدارة
          </h1>
          <p className="mt-2 text-sm text-navy-500">
            إذا كنت أول مسؤول للموقع، يمكنك تفعيل صلاحيات الإدارة من هنا. وإلا تواصل مع مسؤول
            النظام.
          </p>
          <button
            onClick={() => bootstrapMut.mutate()}
            disabled={bootstrapMut.isPending}
            className="mt-6 w-full rounded-lg cursor-pointer bg-navy-800 px-5 py-3 font-bold text-white hover:bg-navy-700 disabled:opacity-60 sm:w-auto"
          >
            {bootstrapMut.isPending ? "..." : "تفعيل أول مسؤول"}
          </button>
          <button
            onClick={signOut}
            className="mt-3 block w-full cursor-pointer text-sm text-navy-500 hover:text-navy-700"
          >
            تسجيل الخروج
          </button>
        </div>
      </div>
    );
  }

  const SidebarBody = ({
    onNavigate,
    isCollapsed = false,
    showToggle = false,
  }: {
    onNavigate?: () => void;
    isCollapsed?: boolean;
    showToggle?: boolean;
  }) => (
    <div className="flex h-full flex-col bg-navy-900 text-white w-full">
      <div
        className={cn(
          "flex items-center gap-3 border-b border-white/10 py-5",
          isCollapsed ? "justify-center px-2" : "px-5",
        )}
      >
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gold-500 text-navy-900">
          <Landmark className="h-5 w-5" />
        </span>
        {!isCollapsed && (
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-bold">لوحة الإدارة</div>
            <div className="truncate text-[11px] text-white/60">إدارة المحتوى والمعاملات</div>
          </div>
        )}
        {showToggle && !isCollapsed && (
          <button
            onClick={() => setCollapsed(true)}
            aria-label="طي القائمة"
            className="grid h-8 w-8 shrink-0 cursor-pointer place-items-center rounded-md text-white/70 hover:bg-white/10 hover:text-white"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        )}
      </div>

      {showToggle && isCollapsed && (
        <button
          onClick={() => setCollapsed(false)}
          aria-label="توسيع القائمة"
          className="mx-2 mt-2 grid h-9 cursor-pointer place-items-center rounded-md text-white/70 hover:bg-white/10 hover:text-white"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
      )}

      <nav className="flex-1 space-y-1 p-2">
        {NAV_ITEMS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => {
              setTab(key);
              onNavigate?.();
            }}
            title={isCollapsed ? label : undefined}
            aria-label={label}
            className={cn(
              "flex cursor-pointer w-full items-center gap-3 rounded-lg text-sm font-bold transition",
              isCollapsed ? "justify-center px-2 py-3" : "px-3 py-2.5",
              tab === key
                ? "bg-gold-500 text-navy-900"
                : "text-white/80 hover:bg-white/10 hover:text-white",
            )}
          >
            <Icon className="h-5 w-5 shrink-0" />
            {!isCollapsed && <span className="truncate">{label}</span>}
          </button>
        ))}
      </nav>

      <div className="space-y-1 border-t border-white/10 p-2">
        <Link
          to="/"
          onClick={onNavigate}
          title={isCollapsed ? "العودة للموقع" : undefined}
          className={cn(
            "flex items-center gap-3 rounded-lg text-sm font-bold text-white/80 hover:bg-white/10 hover:text-white",
            isCollapsed ? "justify-center px-2 py-3" : "px-3 py-2.5",
          )}
        >
          <Home className="h-5 w-5 shrink-0" />
          {!isCollapsed && <span>العودة للموقع</span>}
        </Link>
        <button
          onClick={signOut}
          title={isCollapsed ? "تسجيل الخروج" : undefined}
          className={cn(
            "flex w-full items-center cursor-pointer gap-3 rounded-lg text-sm font-bold text-rose-300 hover:bg-rose-500/10",
            isCollapsed ? "justify-center px-2 py-3" : "px-3 py-2.5",
          )}
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {!isCollapsed && <span>تسجيل الخروج</span>}
        </button>
      </div>
    </div>
  );

  const activeLabel = NAV_ITEMS.find((n) => n.key === tab)?.label ?? "";

  return (
    <div className="min-h-screen overflow-x-hidden bg-navy-50/40 md:flex md:flex-row">
      <aside
        className={cn(
          "hidden shrink-0 transition-[width] duration-200 md:block",
          collapsed ? "w-16" : "w-64",
        )}
      >
        <div
          className={cn(
            "fixed top-0 bottom-0 right-0 z-20 bg-navy-900 text-white transition-[width] duration-200",
            collapsed ? "w-16" : "w-64",
          )}
        >
          <SidebarBody isCollapsed={collapsed} showToggle />
        </div>
      </aside>

      <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-navy-100 bg-white/95 px-4 py-3 backdrop-blur md:hidden">
        <div className="flex min-w-0 items-center gap-2">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-navy-900 text-gold-400">
            <Landmark className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <div className="truncate text-sm font-bold text-navy-800">لوحة الإدارة</div>
            <div className="truncate text-[11px] text-navy-500">{activeLabel}</div>
          </div>
        </div>
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <button
              aria-label="فتح القائمة"
              className="grid cursor-pointer h-10 w-10 place-items-center rounded-lg border border-navy-200 text-navy-700 hover:bg-navy-50"
            >
              <Menu className="h-5 w-5" />
            </button>
          </SheetTrigger>
          <SheetContent side="right" className="w-72 border-0 bg-navy-900 p-0 text-white">
            <SidebarBody onNavigate={() => setMobileOpen(false)} />
          </SheetContent>
        </Sheet>
      </header>

      <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
        <div className="mx-auto w-full max-w-6xl">
          <div className="mb-6 hidden items-end justify-between gap-4 md:flex">
            <div className="min-w-0">
              <h1 className="truncate text-2xl font-extrabold text-navy-800 xl:text-3xl">
                {activeLabel}
              </h1>
              <p className="text-sm text-navy-500">إدارة المحتوى ومعاملات المواطنين.</p>
            </div>
          </div>

          {tab === "dashboard" && <DashboardAdmin />}
          {tab === "requests" && <RequestsAdmin />}
          {tab === "achievements" && <AchievementsAdmin />}
          {tab === "initiatives" && <InitiativesAdmin />}
          {tab === "gallery" && <GalleryAdmin />}
          {tab === "reports" && <ReportsAdmin />}
          {tab === "settings" && <SettingsAdmin />}
        </div>
      </main>
    </div>
  );
}
