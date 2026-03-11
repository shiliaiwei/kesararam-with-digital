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
};

export function DashboardHeader({ title }: { title?: string }) {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  return (
    <header
      className="flex h-14 shrink-0 items-center gap-3 px-4"
      style={{
        background: "#1a2035",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      {/* Sidebar toggle */}
      <SidebarTrigger
        className="-ml-1"
        style={{ color: "#8E8E8E" }}
      />

      {/* Curb stripe divider */}
      <div
        style={{
          width: "1px",
          height: "20px",
          background: "rgba(255,255,255,0.1)",
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
                <span style={{ color: "rgba(255,255,255,0.2)", margin: "0 2px" }}>
                  /
                </span>
              )}
              {isLast ? (
                <span style={{ color: "#FFD700", fontWeight: 600 }}>
                  {title ?? label}
                </span>
              ) : (
                <Link
                  href={href}
                  style={{ color: "#8E8E8E", transition: "color 0.15s" }}
                  className="hover:!text-white"
                >
                  {label}
                </Link>
              )}
            </span>
          );
        })}
      </nav>

      {/* Right side: traffic signal indicator */}
      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "6px" }}>
        <div
          style={{
            display: "flex",
            gap: "5px",
            alignItems: "center",
            padding: "4px 10px",
            borderRadius: "15px",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#ff0050" }} />
          <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#FFD700" }} />
          <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#006747" }} />
        </div>
      </div>
    </header>
  );
}
