import {
  Mail,
  MapPin,
  Phone,
  Clock,
  Twitter,
  Facebook,
  Instagram,
  Youtube,
  MessageCircle,
} from "lucide-react";
import type { ParliamentInfo } from "@/lib/parliament-types";

export function Footer({ info }: { info: ParliamentInfo | null }) {
  if (!info) return null;
  const sm = (info.social_media as Record<string, string>) ?? {};
  return (
    <footer className="mt-20 bg-navy-900 text-navy-100">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-3 lg:px-8">
        <div>
          <h3 className="mb-3 text-lg font-bold text-white">{info.name}</h3>
          <p className="text-sm leading-relaxed text-navy-200">{info.title}</p>
          <div className="mt-4 flex gap-3">
            {sm.twitter && (
              <a
                href={sm.twitter}
                target="_blank"
                rel="noreferrer"
                className="rounded-full bg-navy-800 p-2 hover:bg-gold-700"
              >
                <Twitter className="h-4 w-4" />
              </a>
            )}
            {sm.facebook && (
              <a
                href={sm.facebook}
                target="_blank"
                rel="noreferrer"
                className="rounded-full bg-navy-800 p-2 hover:bg-gold-700"
              >
                <Facebook className="h-4 w-4" />
              </a>
            )}
            {sm.instagram && (
              <a
                href={sm.instagram}
                target="_blank"
                rel="noreferrer"
                className="rounded-full bg-navy-800 p-2 hover:bg-gold-700"
              >
                <Instagram className="h-4 w-4" />
              </a>
            )}
            {sm.youtube && (
              <a
                href={sm.youtube}
                target="_blank"
                rel="noreferrer"
                className="rounded-full bg-navy-800 p-2 hover:bg-gold-700"
              >
                <Youtube className="h-4 w-4" />
              </a>
            )}
            {sm.whatsapp && (
              <a
                href={`https://wa.me/${sm.whatsapp.replace(/[^0-9]/g, "")}`}
                target="_blank"
                rel="noreferrer"
                className="rounded-full bg-navy-800 p-2 hover:bg-gold-700"
                title="واتساب"
              >
                <MessageCircle className="h-4 w-4" />
              </a>
            )}
          </div>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-bold uppercase tracking-wider text-gold-400">
            معلومات التواصل
          </h4>
          <ul className="space-y-3 text-sm">
            <li className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 text-gold-400" />
              <div>
                <span>{info.office_address}</span>
                {sm.map_link && (
                  <a
                    href={sm.map_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block mt-1 text-xs text-gold-400 hover:underline"
                  >
                    عرض على الخريطة
                  </a>
                )}
              </div>
            </li>
            <li className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-gold-400" />
              <span dir="ltr">{info.phone}</span>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-gold-400" />
              <a href={`mailto:${info.email}`} className="hover:text-gold-400">
                {info.email}
              </a>
            </li>
            <li className="flex items-start gap-2">
              <Clock className="mt-0.5 h-4 w-4 text-gold-400" />
              <span>{info.working_hours}</span>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-bold uppercase tracking-wider text-gold-400">نبذة</h4>
          <p className="text-sm leading-relaxed text-navy-200">{info.bio}</p>
        </div>
      </div>
      <div className="border-t border-navy-800 py-4 text-center text-xs text-navy-300">
        © {new Date().getFullYear()} المكتب البرلماني للنائب مجدي بيومي — جنوب سيناء وشرم الشيخ.
        جميع الحقوق محفوظة.
      </div>
    </footer>
  );
}
