import { createFileRoute, useNavigate, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout } from "@/components/site/SiteLayout";
import { ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "تسجيل الدخول - الإدارة" },
      { name: "description", content: "دخول المكتب البرلماني." },
    ],
  }),
  component: () => (
    <SiteLayout>
      <AuthPage />
    </SiteLayout>
  ),
});

function AuthPage() {
  const navigate = useNavigate();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/admin", replace: true });
    });
  }, [navigate]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      await router.invalidate();
      navigate({ to: "/admin", replace: true });
    } catch (err: any) {
      toast.error(err.message || "حدث خطأ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6 lg:px-8">
      <div className="rounded-2xl border border-navy-100 bg-white p-8 shadow-sm">
        <div className="text-center">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-navy-800 text-gold-400">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h1 className="mt-4 text-2xl font-extrabold text-navy-800">تسجيل الدخول</h1>
          <p className="mt-1 text-sm text-navy-500">للمكتب البرلماني فقط</p>
        </div>
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <label className="block">
            <span className="mb-1 block text-sm font-bold text-navy-700">البريد الإلكتروني</span>
            <input
              required
              type="email"
              dir="ltr"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-navy-100 px-3 py-2 focus:border-gold-500 focus:outline-none"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-bold text-navy-700">كلمة المرور</span>
            <input
              required
              type="password"
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-navy-100 px-3 py-2 focus:border-gold-500 focus:outline-none"
            />
          </label>
          <button
            disabled={loading}
            className="w-full rounded-lg cursor-pointer bg-navy-800 px-5 py-3 font-bold text-white hover:bg-navy-700 disabled:opacity-60"
          >
            {loading ? "..." : "دخول"}
          </button>
        </form>
      </div>
    </div>
  );
}
