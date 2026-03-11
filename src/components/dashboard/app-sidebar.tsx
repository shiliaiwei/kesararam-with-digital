"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  ScrollText,
  School,
  Tv2,
  LogOut,
  ShieldCheck,
  GraduationCap,
  ChevronRight,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { logoutAction } from "@/app/actions/auth";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ style?: React.CSSProperties; className?: string }>;
  accent: string;
}

const adminNav: NavItem[] = [
  { label: "Overview", href: "/admin/overview", icon: LayoutDashboard, accent: "#FFD700" },
  { label: "Users", href: "/admin/users", icon: Users, accent: "#006747" },
  { label: "Content", href: "/admin/content", icon: BookOpen, accent: "#06b6d4" },
  { label: "Audit Logs", href: "/admin/logs", icon: ScrollText, accent: "#8E8E8E" },
];

const teacherNav: NavItem[] = [
  { label: "Overview", href: "/teacher/overview", icon: LayoutDashboard, accent: "#FFD700" },
  { label: "Classes", href: "/teacher/classes", icon: School, accent: "#006747" },
  { label: "Sessions", href: "/teacher/sessions", icon: Tv2, accent: "#06b6d4" },
];

interface AppSidebarProps {
  role: "admin" | "teacher";
  name: string;
  email: string;
}

function KWDLogoFull({ role }: { role: "admin" | "teacher" }) {
  return (
    <div className="flex items-center gap-2.5 px-1">
      <div
        className="flex size-8 shrink-0 items-center justify-center overflow-hidden"
        style={{ borderRadius: "15px", background: "#FFD700" }}
      >
        <Image
          src="https://raw.githubusercontent.com/kesararam/kesararam/refs/heads/main/brand/lgo.png"
          alt="KWD"
          width={28}
          height={28}
          className="object-contain"
          unoptimized
        />
      </div>
      <div className="flex flex-col leading-none">
        <span className="font-black text-sm tracking-tight" style={{ color: "#ffffff" }}>
          KWD
        </span>
        <span
          className="text-[10px] font-semibold uppercase tracking-widest"
          style={{ color: "#FFD700" }}
        >
          {role === "admin" ? "Admin Panel" : "Teacher Panel"}
        </span>
      </div>
    </div>
  );
}

function KWDLogoIcon() {
  return (
    <div
      className="flex size-8 shrink-0 items-center justify-center overflow-hidden"
      style={{ borderRadius: "15px", background: "#FFD700" }}
    >
      <Image
        src="https://raw.githubusercontent.com/kesararam/kesararam/refs/heads/main/brand/lgo.png"
        alt="KWD"
        width={28}
        height={28}
        className="object-contain"
        unoptimized
      />
    </div>
  );
}

export function AppSidebar({ role, name, email }: AppSidebarProps) {
  const pathname = usePathname();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  const navItems = role === "admin" ? adminNav : teacherNav;
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <Sidebar
      collapsible="icon"
      style={
        {
          "--sidebar": "#1a2035",
          "--sidebar-foreground": "#f0f2f5",
          "--sidebar-border": "rgba(255,255,255,0.06)",
          "--sidebar-accent": "#252d3d",
          "--sidebar-accent-foreground": "#FFD700",
          "--sidebar-primary": "#FFD700",
          "--sidebar-primary-foreground": "#1a1a1a",
        } as React.CSSProperties
      }
    >
      {/* ── Header / Logo ── */}
      <SidebarHeader
        style={{
          borderBottom: "1px solid rgba(255,215,0,0.15)",
          padding: "12px 10px",
        }}
      >
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              render={
                <Link href={role === "admin" ? "/admin/overview" : "/teacher/overview"} />
              }
              style={{ borderRadius: "15px" }}
              className="hover:bg-[#252d3d] transition-colors"
            >
              {isCollapsed ? <KWDLogoIcon /> : <KWDLogoFull role={role} />}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* ── Navigation ── */}
      <SidebarContent style={{ padding: "8px 6px" }}>
        <SidebarGroup>
          <SidebarGroupLabel
            style={{
              color: "#8E8E8E",
              fontSize: "10px",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              paddingLeft: "8px",
            }}
          >
            {role === "admin" ? "Administration" : "Teaching"}
          </SidebarGroupLabel>
          <SidebarMenu>
            {navItems.map((item) => {
              const active =
                pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    render={<Link href={item.href} />}
                    isActive={active}
                    tooltip={item.label}
                    style={{
                      borderRadius: "15px",
                      marginBottom: "2px",
                      background: active ? "rgba(255,215,0,0.12)" : "transparent",
                      borderLeft: active
                        ? `3px solid ${item.accent}`
                        : "3px solid transparent",
                      color: active ? "#ffffff" : "#a8a8a8",
                      transition: "all 0.15s ease",
                    }}
                    className="hover:bg-[#252d3d] hover:!text-white"
                  >
                    <item.icon
                      style={{
                        color: active ? item.accent : "#8E8E8E",
                        width: "16px",
                        height: "16px",
                        flexShrink: 0,
                      }}
                    />
                    <span style={{ fontWeight: active ? 600 : 400 }}>{item.label}</span>
                    {active && !isCollapsed && (
                      <ChevronRight
                        style={{
                          marginLeft: "auto",
                          width: "12px",
                          height: "12px",
                          color: item.accent,
                        }}
                      />
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>

        {/* ── Traffic signal role badge ── */}
        {!isCollapsed && (
          <div style={{ padding: "8px 8px 0" }}>
            <div
              style={{
                borderRadius: "15px",
                padding: "8px 12px",
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.06)",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              {role === "admin" ? (
                <ShieldCheck style={{ width: "14px", height: "14px", color: "#ff0050" }} />
              ) : (
                <GraduationCap style={{ width: "14px", height: "14px", color: "#006747" }} />
              )}
              <span
                style={{
                  fontSize: "11px",
                  color: "#8E8E8E",
                  textTransform: "capitalize",
                }}
              >
                {role} access
              </span>
              <div style={{ marginLeft: "auto", display: "flex", gap: "4px" }}>
                <div
                  style={{
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    background: "#ff0050",
                  }}
                />
                <div
                  style={{
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    background: "#FFD700",
                  }}
                />
                <div
                  style={{
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    background: "#006747",
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </SidebarContent>

      {/* ── Footer / User ── */}
      <SidebarFooter
        style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "8px 6px" }}
      >
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <SidebarMenuButton
                    size="lg"
                    style={{
                      borderRadius: "15px",
                      background: "rgba(255,255,255,0.04)",
                    }}
                    className="hover:bg-[#252d3d]"
                  />
                }
              >
                <Avatar
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "15px",
                    flexShrink: 0,
                  }}
                >
                  <AvatarFallback
                    style={{
                      borderRadius: "15px",
                      background: "#FFD700",
                      color: "#1a1a1a",
                      fontSize: "11px",
                      fontWeight: 700,
                    }}
                  >
                    {initials}
                  </AvatarFallback>
                </Avatar>
                {!isCollapsed && (
                  <div
                    className="grid flex-1 text-left leading-tight"
                    style={{ overflow: "hidden" }}
                  >
                    <span
                      className="truncate"
                      style={{ fontSize: "13px", fontWeight: 600, color: "#f0f2f5" }}
                    >
                      {name}
                    </span>
                    <span className="truncate" style={{ fontSize: "11px", color: "#8E8E8E" }}>
                      {email}
                    </span>
                  </div>
                )}
              </DropdownMenuTrigger>
              <DropdownMenuContent
                style={{
                  background: "#252d3d",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "15px",
                  minWidth: "200px",
                }}
                side="top"
                align="start"
                sideOffset={4}
              >
                <DropdownMenuItem
                  style={{ borderRadius: "15px", cursor: "pointer" }}
                >
                  <form action={logoutAction} className="w-full">
                    <button
                      type="submit"
                      className="flex w-full items-center gap-2 text-sm"
                      style={{ color: "#ff0050" }}
                    >
                      <LogOut style={{ width: "14px", height: "14px" }} />
                      Sign Out
                    </button>
                  </form>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

