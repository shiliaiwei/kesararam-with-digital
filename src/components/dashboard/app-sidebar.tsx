"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  ScrollText,
  School,
  Tv2,
  LogOut,
  Route,
  Bell,
  Pencil,
  Images,
  FolderOpen,
  Tags,
  Settings,
  Info,
  User,
  ChevronRight,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { logoutAction } from "@/app/actions/auth";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const adminNav: NavItem[] = [
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Content", href: "/admin/content", icon: BookOpen },
  { label: "Media", href: "/admin/media", icon: Images },
  { label: "Logs", href: "/admin/logs", icon: ScrollText },
];

const teacherNav: NavItem[] = [
  { label: "Classes", href: "/teacher/classes", icon: School },
  { label: "Sessions", href: "/teacher/sessions", icon: Tv2 },
];

interface AppSidebarProps {
  role: "admin" | "teacher";
  name: string;
  email: string;
  avatar?: string | null;
}

export function AppSidebar({ role, name, email, avatar }: AppSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const navItems = role === "admin" ? adminNav : teacherNav;
  const profileHref = role === "admin" ? "/admin/profile" : "/teacher/profile";

  function isNavItemActive(href: string) {
    const targetPath = href.split("?")[0];
    return pathname === targetPath || pathname.startsWith(`${targetPath}/`);
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-black text-white">
                <Image
                  src="https://raw.githubusercontent.com/kesararam/kesararam/refs/heads/main/brand/lgo.png"
                  alt="KWD"
                  width={24}
                  height={24}
                  className="object-contain invert"
                  unoptimized
                />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">KWD</span>
                <span className="truncate text-xs text-muted-foreground capitalize">
                  {role} Panel
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Account</SidebarGroupLabel>
          <SidebarMenu>
            <Collapsible defaultOpen={false} className="group/collapsible">
              <SidebarMenuItem>
                <CollapsibleTrigger
                  render={
                    <SidebarMenuButton tooltip="Profile">
                      <User />
                      <span>Profile</span>
                      <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                  }
                />
                <CollapsibleContent>
                  <SidebarMenuSub>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton
                        render={
                          <Link href={`${profileHref}?tab=info`}>
                            <Info />
                            <span>View Info</span>
                          </Link>
                        }
                      />
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton
                        render={
                          <Link href={profileHref}>
                            <Pencil />
                            <span>Edit Profile</span>
                          </Link>
                        }
                      />
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton
                        render={
                          <Link href={`${profileHref}?tab=settings`}>
                            <Settings />
                            <span>Settings</span>
                          </Link>
                        }
                      />
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <form action={logoutAction} className="w-full">
                        <SidebarMenuSubButton
                          render={
                            <button type="submit" className="flex w-full items-center gap-2 cursor-pointer">
                              <LogOut />
                              <span>Log out</span>
                            </button>
                          }
                        />
                      </form>
                    </SidebarMenuSubItem>
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Platform</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    isActive={isNavItemActive(item.href)}
                    tooltip={item.label}
                    render={<Link href={item.href} />}
                  >
                    <item.icon />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
