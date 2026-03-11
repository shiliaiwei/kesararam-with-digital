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
import { AvatarDisplay } from "@/components/shared/avatar-display";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{
    style?: React.CSSProperties;
    className?: string;
  }>;
  accent: string;
}

const adminNav: NavItem[] = [
  {
    label: "Overview",
    href: "/admin/overview",
    icon: LayoutDashboard,
    accent: "#FFD700",
  },
  { label: "Users", href: "/admin/users", icon: Users, accent: "#006747" },
  {
    label: "Content",
    href: "/admin/content",
    icon: BookOpen,
    accent: "#06b6d4",
  },
  {
    label: "Audit Logs",
    href: "/admin/logs",
    icon: ScrollText,
    accent: "#8E8E8E",
  },
];

const teacherNav: NavItem[] = [
  {
    label: "Overview",
    href: "/teacher/overview",
    icon: LayoutDashboard,
    accent: "#FFD700",
  },
  {
    label: "Classes",
    href: "/teacher/classes",
    icon: School,
    accent: "#006747",
  },
  {
    label: "Sessions",
    href: "/teacher/sessions",
    icon: Tv2,
    accent: "#06b6d4",
  },
];

interface AppSidebarProps {
  role: "admin" | "teacher";
  name: string;
  email: string;
  avatar?: string | null;
}

function KWDLogoFull({ role }: { role: "admin" | "teacher" }) {
  return (
    <div className="flex items-center gap-2.5 px-1">
      <div
        className="flex size-8 shrink-0 items-center justify-center overflow-hidden"
        style={{ background: "#FFD700", border: "2px solid #000" }}
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
        <span
          className="font-black text-sm tracking-tight"
          style={{ color: "#ffffff" }}
        >
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
      style={{ background: "#FFD700", border: "2px solid #000" }}
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

export function AppSidebar({ role, name, email, avatar }: AppSidebarProps) {
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
          "--sidebar-border": "#FFD700",
          "--sidebar-accent": "#252d3d",
          "--sidebar-accent-foreground": "#FFD700",
          "--sidebar-primary": "#FFD700",
          "--sidebar-primary-foreground": "#1a1a1a",
          borderRight: "3px solid #FFD700",
        } as React.CSSProperties
      }
    >
      {/* ── Header / Logo ── */}
      <SidebarHeader
        style={{
          borderBottom: "2px solid #FFD700",
          padding: "12px 10px",
        }}
      >
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              render={
                <Link
                  href={
                    role === "admin" ? "/admin/overview" : "/teacher/overview"
                  }
                />
              }
              style={{ borderRadius: "0" }}
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
                      borderRadius: "0",
                      marginBottom: "2px",
                      background: active
                        ? "rgba(255,215,0,0.12)"
                        : "transparent",
                      borderLeft: active
                        ? `4px solid ${item.accent}`
                        : "4px solid transparent",
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
                    <span style={{ fontWeight: active ? 600 : 400 }}>
                      {item.label}
                    </span>
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
                padding: "8px 12px",
                background: "rgba(255,255,255,0.03)",
                border: "2px solid rgba(255,215,0,0.3)",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              {role === "admin" ? (
                <ShieldCheck
                  style={{ width: "14px", height: "14px", color: "#ff0050" }}
                />
              ) : (
                <GraduationCap
                  style={{ width: "14px", height: "14px", color: "#006747" }}
                />
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
        style={{
          borderTop: "2px solid #FFD700",
          padding: "8px 6px",
        }}
      >
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <SidebarMenuButton
                    size="lg"
                    style={{
                      borderRadius: "0",
                      background: "rgba(255,255,255,0.04)",
                    }}
                    className="hover:bg-[#252d3d]"
                  />
                }
              >
                <AvatarDisplay
                  avatar={avatar ?? null}
                  name={name}
                  size={32}
                  radius={15}
                />
                {!isCollapsed && (
                  <div
                    className="grid flex-1 text-left leading-tight"
                    style={{ overflow: "hidden" }}
                  >
                    <span
                      className="truncate"
                      style={{
                        fontSize: "13px",
                        fontWeight: 600,
                        color: "#f0f2f5",
                      }}
                    >
                      {name}
                    </span>
                    <span
                      className="truncate"
                      style={{ fontSize: "11px", color: "#8E8E8E" }}
                    >
                      {email}
                    </span>
                  </div>
                )}
              </DropdownMenuTrigger>
              <DropdownMenuContent
                style={{
                  background: "#1a2035",
                  border: "2px solid #FFD700",
                  boxShadow: "4px 4px 0 #FFD700",
                  borderRadius: "0",
                  minWidth: "200px",
                }}
                side="top"
                align="start"
                sideOffset={4}
              >
                <DropdownMenuItem
                  style={{ borderRadius: "0", cursor: "pointer" }}
                >
                  <Link
                    href={
                      role === "admin" ? "/admin/profile" : "/teacher/profile"
                    }
                    className="flex w-full items-center gap-2 text-sm"
                    style={{ color: "#f0f2f5" }}
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="8" r="4" />
                      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                    </svg>
                    My Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  style={{ borderRadius: "0", cursor: "pointer" }}
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
