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
        background: "#ffffff",
        borderBottom: "3px solid #000000",
        position: "sticky",
        top: 0,
        zIndex: 10,
        boxShadow: "0 3px 0 #000",
      }}
    >
      {/* Sidebar toggle */}
      <SidebarTrigger className="-ml-1" style={{ color: "#000000" }} />

      {/* Hard divider bar */}
      <div
        style={{
          width: "3px",
          height: "20px",
          background: "#006747",
          flexShrink: 0,
          border: "1px solid #000",
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
                    color: "#a8a8a8",
                    margin: "0 2px",
                    fontWeight: 900,
                  }}
                >
                  /
                </span>
              )}
              {isLast ? (
                <span
                  style={{
                    color: "#006747",
                    fontWeight: 900,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  {title ?? label}
                </span>
              ) : (
                <Link
                  href={href}
                  style={{
                    color: "#a8a8a8",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    transition: "color 0.15s",
                  }}
                  className="hover:!text-black"
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
            background: "#ffffff",
            border: "2px solid #000000",
            boxShadow: "2px 2px 0 #000",
          }}
        >
          <div
            style={{
              width: "7px",
              height: "7px",
              background: "#ef4444",
              border: "1px solid #000",
            }}
          />
          <div
            style={{
              width: "7px",
              height: "7px",
              background: "#eab308",
              border: "1px solid #000",
            }}
          />
          <div
            style={{
              width: "7px",
              height: "7px",
              background: "#006747",
              border: "1px solid #000",
            }}
          />
        </div>
      </div>
    </header>
  );
}
