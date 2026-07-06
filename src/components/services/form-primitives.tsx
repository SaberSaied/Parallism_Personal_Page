import type { ReactNode } from "react";

export function SectionHeader({
  icon,
  title,
  subtitle,
}: {
  icon: ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="mb-5 flex items-center gap-3 border-b border-navy-100 pb-3">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-navy-900 text-gold-400">
        {icon}
      </span>
      <div className="min-w-0">
        <h3 className="truncate text-base font-bold text-navy-800">{title}</h3>
        <p className="truncate text-xs text-navy-500">{subtitle}</p>
      </div>
    </div>
  );
}

export function Field({ label, children }: { label: ReactNode; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-bold text-navy-700">{label}</span>
      {children}
    </label>
  );
}

export function InputStyle() {
  return (
    <style>{`.input{width:100%;border-radius:.5rem;border:1px solid #e5e7eb;background:#fff;padding:.6rem .8rem;font-size:.9rem;outline:none;transition:border-color .15s;}.input:focus{border-color:#c5a85c;box-shadow:0 0 0 3px rgba(197,168,92,.15)}`}</style>
  );
}
