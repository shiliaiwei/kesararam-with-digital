"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { SidebarTrigger } from "@/components/ui/sidebar";

const LABEL_MAP: Record<string, string> = {
  admin: "Admin",
  teacher: "Teacher",
  overview: "Overview",
  users: "Users",
  content: "Content",
  logs: "Audit Logs",
  classes: "Classes",
  sessions: "Sessions",
  profile: "My Profile",
};

export function DashboardHeader({ title }: { title?: string }) {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  return (
    <header
      className="flex h-14 shrink-0 items-center gap-3 px-4"
      style={{
        background: "#0d1117",
        borderBottom: "2px solid #FFD700",
        position: "sticky",
        top: 0,
        zIndex: 10,
      }}
    >
      {/* Sidebar toggle */}
      <SidebarTrigger className="-ml-1" style={{ color: "#FFD700" }} />

      {/* Longitudinal road marking divider */}
      <div
        style={{
          width: "2px",
          height: "20px",
          background:
            "repeating-linear-gradient(180deg,#FFD700 0,#FFD700 4px,transparent 4px,transparent 8px)",
          flexShrink: 0,
        }}
      />

      {/* Breadcrumb */}
      <nav className="flex items-center gap-1" style={{ fontSize: "13px" }}>
        {segments.map((seg, i) => {
          const href = "/" + segments.slice(0, i + 1).join("/");
          const label = LABEL_MAP[seg] ?? seg;
          const isLast = i === segments.length - 1;
          return (
            <span key={href} className="flex items-center gap-1">
              {i > 0 && (
                <span
                  style={{
                    color: "rgba(255,215,0,0.4)",
                    margin: "0 2px",
                    fontWeight: 900,
                  }}
                >
                  /
                </span>
              )}
              {isLast ? (
                <span style={{ color: "#FFD700", fontWeight: 800 }}>
                  {title ?? label}
                </span>
              ) : (
                <Link
                  href={href}
                  style={{ color: "#a8a8a8", transition: "color 0.15s" }}
                  className="hover:!text-white"
                >
                  {label}
                </Link>
              )}
            </span>
          );
        })}
      </nav>

      {/* Right side: neo-brutalist traffic signal box */}
      <div
        style={{
          marginLeft: "auto",
          display: "flex",
          alignItems: "center",
          gap: "6px",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: "5px",
            alignItems: "center",
            padding: "4px 10px",
            background: "#111827",
            border: "2px solid #FFD700",
            boxShadow: "2px 2px 0 #FFD700",
          }}
        >
          <div style={{ width: "7px", height: "7px", background: "#ff0050" }} />
          <div style={{ width: "7px", height: "7px", background: "#FFD700" }} />
          <div style={{ width: "7px", height: "7px", background: "#006747" }} />
        </div>
      </div>
    </header>
  );
}
