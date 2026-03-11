"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";

const LABEL_MAP: Record<string, string> = {
  admin: "Admin",
  teacher: "Teacher",
  overview: "Overview",
  users: "Users",
  content: "Content",
  logs: "Audit Logs",
  classes: "Classes",
  sessions: "Sessions",
};

export function DashboardHeader({ title }: { title?: string }) {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b bg-background px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mx-2 h-4" />
      <nav className="flex items-center text-sm text-muted-foreground gap-1">
        {segments.map((seg, i) => {
          const href = "/" + segments.slice(0, i + 1).join("/");
          const label = LABEL_MAP[seg] ?? seg;
          const isLast = i === segments.length - 1;
          return (
            <span key={href} className="flex items-center gap-1">
              {i > 0 && <span>/</span>}
              {isLast ? (
                <span className="font-medium text-foreground">
                  {title ?? label}
                </span>
              ) : (
                <Link
                  href={href}
                  className="hover:text-foreground transition-colors"
                >
                  {label}
                </Link>
              )}
            </span>
          );
        })}
      </nav>
    </header>
  );
}
