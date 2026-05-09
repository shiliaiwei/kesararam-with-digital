"use client"

import { useRouter } from "next/navigation"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { 
  EllipsisVerticalIcon, 
  CircleUserRoundIcon, 
  LayoutDashboardIcon,
  SettingsIcon, 
  BellIcon, 
  LogOutIcon,
  ShieldIcon,
  UsersIcon,
  FileTextIcon,
  GraduationCapIcon
} from "lucide-react"

type UserRole = "student" | "teacher" | "admin" | "staff"

interface NavUserProps {
  user: {
    name: string
    email: string
    avatar: string
    role?: UserRole
  }
}

// Role-based dashboard routes
const getDashboardRoute = (role: UserRole): string => {
  const routes: Record<UserRole, string> = {
    student: "/profile/student",
    teacher: "/teacher",
    staff: "/staff",
    admin: "/admin",
  }
  return routes[role] || "/profile/student"
}

// Role-based profile routes
const getProfileRoute = (role: UserRole): string => {
  const routes: Record<UserRole, string> = {
    student: "/profile/student",
    teacher: "/teacher/profile",
    staff: "/staff/profile",
    admin: "/admin/profile",
  }
  return routes[role] || "/profile/student"
}

// Role display names
const getRoleDisplay = (role: UserRole): { name: string; icon: any; color: string } => {
  const displays: Record<UserRole, { name: string; icon: any; color: string }> = {
    student: { name: "Student", icon: GraduationCapIcon, color: "text-blue-600" },
    teacher: { name: "Teacher", icon: UsersIcon, color: "text-green-600" },
    staff: { name: "Staff", icon: FileTextIcon, color: "text-purple-600" },
    admin: { name: "Admin", icon: ShieldIcon, color: "text-red-600" },
  }
  return displays[role] || displays.student
}

export function NavUser({ user }: NavUserProps) {
  const { isMobile } = useSidebar()
  const router = useRouter()
  const userRole = user.role || "student"
  const roleDisplay = getRoleDisplay(userRole)
  const RoleIcon = roleDisplay.icon

  const handleLogout = async () => {
    try {
      // Clear cookie and redirect to login
      document.cookie = "kwd_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
      router.push("/login")
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton size="lg" className="aria-expanded:bg-muted" />
            }
          >
            <Avatar className="size-8 rounded-lg grayscale">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback className="rounded-lg">
                {user.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">{user.name}</span>
              <span className="truncate text-xs text-foreground/70">
                {user.email}
              </span>
            </div>
            <EllipsisVerticalIcon className="ml-auto size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="min-w-64"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            {/* User Info Header */}
            <DropdownMenuGroup>
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  <Avatar className="size-8">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback className="rounded-lg">
                      {user.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">{user.name}</span>
                    <span className="truncate text-xs text-muted-foreground">
                      {user.email}
                    </span>
                  </div>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>

            {/* Role Badge */}
            <div className="px-2 py-1.5">
              <div className="flex items-center gap-2 px-2 py-1 bg-muted rounded-md">
                <RoleIcon className={`size-4 ${roleDisplay.color}`} />
                <span className="text-xs font-medium">{roleDisplay.name}</span>
              </div>
            </div>

            <DropdownMenuSeparator />

            {/* Quick Actions */}
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => router.push(getDashboardRoute(userRole))}>
                <LayoutDashboardIcon className="size-4" />
                <span>Dashboard</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push(getProfileRoute(userRole))}>
                <CircleUserRoundIcon className="size-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push("/settings")}>
                <SettingsIcon className="size-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push("/settings/notifications")}>
                <BellIcon className="size-4" />
                <span>Notifications</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            {/* Logout */}
            <DropdownMenuItem onClick={handleLogout} className="text-red-600">
              <LogOutIcon className="size-4" />
              <span>Sign Out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
