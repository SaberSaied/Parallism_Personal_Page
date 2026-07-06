import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { getParliamentInfo } from "@/lib/content.functions";
import type { ReactNode } from "react";

export const parliamentInfoQuery = queryOptions({
  queryKey: ["parliament_info"],
  queryFn: () => getParliamentInfo(),
});

export function SiteLayout({ children }: { children: ReactNode }) {
  const { data: info } = useSuspenseQuery(parliamentInfoQuery);
  return (
    <div className="flex min-h-screen flex-col bg-navy-50/40">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer info={info as any} />
    </div>
  );
}
