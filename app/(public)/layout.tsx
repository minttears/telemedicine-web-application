import type { ReactNode } from "react";

import { PublicSiteShell } from "@/components/public/public-site-shell";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return <PublicSiteShell>{children}</PublicSiteShell>;
}
