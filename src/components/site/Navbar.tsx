import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { parliamentInfoQuery } from "@/lib/queries";
import MagdyBayoumi from "@/assets/image.jpg";

const links = [
  { to: "/", label: "الرئيسية" },
  { to: "/achievements", label: "الإنجازات" },
  { to: "/initiatives", label: "المبادرات" },
  { to: "/gallery", label: "المعرض" },
  { to: "/services", label: "خدمات المواطنين" },
] as const;

export function Navbar() {
  const [open, setOpen] = useState(false);
  const { data: info } = useQuery(parliamentInfoQuery);
  const social = (info?.social_media as Record<string, string> | undefined) || {};
  const avatarUrl = social.profile_image || MagdyBayoumi;

  return (
    <header className="sticky top-0 z-40 border-b border-navy-100 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2 text-navy-800">
          <div className="border-2 border-gold-500/50 rounded-full">
            <img
              src={avatarUrl}
              alt="السيد مجدي بيومي"
              className="h-12 w-12 rounded-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = MagdyBayoumi;
              }}
            />
          </div>
          <div className="hidden text-right sm:block">
            <div className="text-sm font-bold leading-tight">النائب مجدي بيومي</div>
            <div className="text-[11px] text-navy-500">عضو مجلس النواب — جنوب سيناء وشرم الشيخ</div>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              activeOptions={{ exact: l.to === "/" }}
              activeProps={{ className: "bg-navy-800 text-white hover:text-navy-700" }}
              className={cn(
                "rounded-md px-3 py-2 text-sm font-medium text-navy-700 transition-colors hover:bg-navy-50",
              )}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <button
          aria-label="فتح القائمة"
          onClick={() => setOpen(!open)}
          className="rounded-md p-2 text-navy-700 cursor-pointer hover:bg-navy-50 md:hidden"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <nav className="border-t border-navy-100 bg-white md:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-3">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                activeOptions={{ exact: l.to === "/" }}
                activeProps={{ className: "bg-navy-800 text-white" }}
                className="rounded-md px-3 py-2 text-sm font-medium text-navy-700 hover:bg-navy-50"
              >
                {l.label}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
