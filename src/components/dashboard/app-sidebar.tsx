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
  Route,
  Pencil,
  Info,
  Settings,
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
    label: "Road Markings",
    href: "/admin/road-markings",
    icon: Route,
    accent: "#f97316",
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
          style={{ color: "#eab308" }}
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
          "--sidebar": "#ffffff",
          "--sidebar-foreground": "#000000",
          "--sidebar-border": "#000000",
          "--sidebar-accent": "#f5f5f0",
          "--sidebar-accent-foreground": "#000000",
          "--sidebar-primary": "#006747",
          "--sidebar-primary-foreground": "#ffffff",
          borderRight: "3px solid #000000",
        } as React.CSSProperties
      }
    >
      {/* ── Header / Logo ── */}
      <SidebarHeader
        style={{
          borderBottom: "3px solid #000000",
          padding: "12px 10px",
          background: "#006747",
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
              className="hover:bg-[#005038] transition-colors"
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
              color: "#a8a8a8",
              fontSize: "10px",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              paddingLeft: "8px",
              fontWeight: 800,
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
                      background: active ? "#006747" : "transparent",
                      borderLeft: active
                        ? "4px solid #000000"
                        : "4px solid transparent",
                      color: active ? "#ffffff" : "#000000",
                      transition: "all 0.15s ease",
                      boxShadow: active ? "2px 2px 0 #000" : "none",
                    }}
                    className="hover:bg-[#f5f5f0] hover:!text-black"
                  >
                    <item.icon
                      style={{
                        color: active ? "#ffffff" : "#a8a8a8",
                        width: "16px",
                        height: "16px",
                        flexShrink: 0,
                      }}
                    />
                    <span style={{ fontWeight: active ? 800 : 500 }}>
                      {item.label}
                    </span>
                    {active && !isCollapsed && (
                      <ChevronRight
                        style={{
                          marginLeft: "auto",
                          width: "12px",
                          height: "12px",
                          color: "#ffffff",
                        }}
                      />
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>

        {/* ── Role badge ── */}
        {!isCollapsed && (
          <div style={{ padding: "8px 8px 0" }}>
            <div
              style={{
                padding: "8px 12px",
                background: "#ffffff",
                border: "2px solid #a8a8a8",
                boxShadow: "2px 2px 0 #000",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              {role === "admin" ? (
                <ShieldCheck
                  style={{ width: "14px", height: "14px", color: "#ef4444" }}
                />
              ) : (
                <GraduationCap
                  style={{ width: "14px", height: "14px", color: "#006747" }}
                />
              )}
              <span
                style={{
                  fontSize: "11px",
                  color: "#000000",
                  textTransform: "uppercase",
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                }}
              >
                {role} access
              </span>
              <div style={{ marginLeft: "auto", display: "flex", gap: "4px" }}>
                <div
                  style={{
                    width: "6px",
                    height: "6px",
                    background: "#ef4444",
                    border: "1px solid #000",
                  }}
                />
                <div
                  style={{
                    width: "6px",
                    height: "6px",
                    background: "#eab308",
                    border: "1px solid #000",
                  }}
                />
                <div
                  style={{
                    width: "6px",
                    height: "6px",
                    background: "#006747",
                    border: "1px solid #000",
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
          borderTop: "3px solid #000000",
          padding: "8px 6px",
          background: "#ffffff",
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
                      background: "#ffffff",
                      border: "2px solid #a8a8a8",
                    }}
                    className="hover:bg-[#f5f5f0] hover:border-black"
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
                        fontWeight: 800,
                        color: "#000000",
                      }}
                    >
                      {name}
                    </span>
                    <span
                      className="truncate"
                      style={{ fontSize: "11px", color: "#a8a8a8" }}
                    >
                      {email}
                    </span>
                  </div>
                )}
              </DropdownMenuTrigger>
              <DropdownMenuContent
                style={{
                  background: "#ffffff",
                  border: "2px solid #000000",
                  boxShadow: "4px 4px 0 #000",
                  borderRadius: "0",
                  minWidth: "220px",
                  padding: "0",
                }}
                side="top"
                align="start"
                sideOffset={4}
              >
                {/* Header strip */}
                <div
                  style={{
                    padding: "8px 12px",
                    borderBottom: "2px solid #a8a8a8",
                    background: "#f5f5f0",
                  }}
                >
                  <p
                    style={{
                      fontSize: "10px",
                      fontWeight: 900,
                      color: "#a8a8a8",
                      textTransform: "uppercase",
                      letterSpacing: "0.12em",
                      margin: 0,
                    }}
                  >
                    {name}
                  </p>
                  <p
                    style={{
                      fontSize: "11px",
                      color: "#000",
                      fontWeight: 700,
                      margin: 0,
                      marginTop: "2px",
                    }}
                  >
                    {email}
                  </p>
                </div>

                {/* Edit Profile */}
                <DropdownMenuItem
                  style={{ borderRadius: "0", cursor: "pointer", padding: "0" }}
                  className="hover:bg-[#eab308] focus:bg-[#eab308]"
                >
                  <Link
                    href={
                      role === "admin" ? "/admin/profile" : "/teacher/profile"
                    }
                    className="flex w-full items-center gap-2.5 px-3 py-2.5 text-sm font-bold"
                    style={{ color: "#000000" }}
                  >
                    <Pencil
                      style={{ width: "13px", height: "13px", flexShrink: 0 }}
                    />
                    Edit Profile
                  </Link>
                </DropdownMenuItem>

                {/* View Info */}
                <DropdownMenuItem
                  style={{ borderRadius: "0", cursor: "pointer", padding: "0" }}
                  className="hover:bg-[#eab308] focus:bg-[#eab308]"
                >
                  <Link
                    href={
                      role === "admin"
                        ? "/admin/profile?tab=info"
                        : "/teacher/profile?tab=info"
                    }
                    className="flex w-full items-center gap-2.5 px-3 py-2.5 text-sm font-bold"
                    style={{ color: "#000000" }}
                  >
                    <Info
                      style={{ width: "13px", height: "13px", flexShrink: 0 }}
                    />
                    View Info
                  </Link>
                </DropdownMenuItem>

                {/* Settings */}
                <DropdownMenuItem
                  style={{ borderRadius: "0", cursor: "pointer", padding: "0" }}
                  className="hover:bg-[#eab308] focus:bg-[#eab308]"
                >
                  <Link
                    href={
                      role === "admin"
                        ? "/admin/profile?tab=settings"
                        : "/teacher/profile?tab=settings"
                    }
                    className="flex w-full items-center gap-2.5 px-3 py-2.5 text-sm font-bold"
                    style={{ color: "#000000" }}
                  >
                    <Settings
                      style={{ width: "13px", height: "13px", flexShrink: 0 }}
                    />
                    Settings
                  </Link>
                </DropdownMenuItem>

                {/* Divider */}
                <div
                  style={{ height: "2px", background: "#000000", margin: "0" }}
                />

                {/* Logout */}
                <DropdownMenuItem
                  style={{ borderRadius: "0", cursor: "pointer", padding: "0" }}
                  className="hover:bg-[#ef4444] focus:bg-[#ef4444] group"
                >
                  <form action={logoutAction} className="w-full">
                    <button
                      type="submit"
                      className="flex w-full items-center gap-2.5 px-3 py-2.5 text-sm font-black group-hover:text-white group-focus:text-white"
                      style={{ color: "#ef4444" }}
                    >
                      <LogOut
                        style={{ width: "13px", height: "13px", flexShrink: 0 }}
                      />
                      Logout
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
