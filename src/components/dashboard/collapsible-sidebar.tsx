"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ChevronDown,
  ChevronRight,
  LayoutDashboard,
  FileText,
  Image as ImageIcon,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";

interface NavItem {
  label: string;
  icon: any;
  href?: string;
  children?: NavItem[];
}

const STAFF_NAV: NavItem[] = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/staff",
  },
  {
    label: "Content",
    icon: FileText,
    children: [
      { label: "Traffic Signs", icon: null, href: "/staff/content/road-sign" },
      { label: "Road Traffic Law", icon: null, href: "/staff/content/road-traffic" },
      { label: "Right of Way", icon: null, href: "/staff/content/priority" },
      { label: "Driving Skills", icon: null, href: "/staff/content/driving" },
      { label: "Vehicle Technology", icon: null, href: "/staff/content/technical" },
      { label: "Loading People & Goods", icon: null, href: "/staff/content/loading-people-goods" },
      { label: "General Knowledge", icon: null, href: "/staff/content/general-knowledge" },
      { label: "Emergency", icon: null, href: "/staff/content/emergency" },
    ],
  },
  {
    label: "Media",
    icon: ImageIcon,
    href: "/staff/media",
  },
  {
    label: "Account",
    icon: Users,
    href: "/staff/account",
  },
];

export function CollapsibleSidebar({ userName, userRole }: { userName: string; userRole: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [expanded, setExpanded] = useState<string[]>(["Content"]);
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleExpand = (label: string) => {
    setExpanded((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]
    );
  };

  const handleSignOut = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const NavItems = () => (
    <>
      {STAFF_NAV.map((item) => (
        <div key={item.label}>
          {item.children ? (
            <div>
              <button
                onClick={() => toggleExpand(item.label)}
                className="w-full flex items-center justify-between px-4 py-3 font-bold hover:bg-yellow-100 transition-all border-b-2 border-black"
              >
                <div className="flex items-center gap-3">
                  <item.icon size={20} />
                  <span>{item.label}</span>
                </div>
                {expanded.includes(item.label) ? (
                  <ChevronDown size={16} />
                ) : (
                  <ChevronRight size={16} />
                )}
              </button>
              {expanded.includes(item.label) && (
                <div className="bg-gray-50">
                  {item.children.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href!}
                      className={`block px-8 py-2 text-sm font-medium hover:bg-yellow-100 transition-all border-b border-gray-200 ${
                        pathname === child.href ? "bg-yellow-200" : ""
                      }`}
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <Link
              href={item.href!}
              className={`flex items-center gap-3 px-4 py-3 font-bold hover:bg-yellow-100 transition-all border-b-2 border-black ${
                pathname === item.href ? "bg-yellow-200" : ""
              }`}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </Link>
          )}
        </div>
      ))}
    </>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 bg-yellow-400 border-2 border-black p-2 shadow-[4px_4px_0_#000]"
      >
        {mobileOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed lg:sticky top-0 left-0 h-screen w-64 bg-white border-r-4 border-black flex flex-col z-40 transition-transform ${
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
        style={{ boxShadow: "4px 0 0 #000" }}
      >
        {/* Header */}
        <div className="bg-yellow-400 border-b-4 border-black p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-black border-2 border-black flex items-center justify-center">
              <span className="text-white font-black text-xl">K</span>
            </div>
            <div>
              <div className="font-black text-lg">Kesararam With Digital</div>
              <div className="text-xs font-bold uppercase">{userRole} Panel</div>
            </div>
          </div>
        </div>

        {/* User Info */}
        <div className="bg-gray-50 border-b-2 border-black p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-400 border-2 border-black flex items-center justify-center">
              <Users size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-sm truncate">{userName}</div>
              <div className="text-xs text-zinc-600 uppercase">{userRole}</div>
            </div>
          </div>
        </div>

        {/* Navigation - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          <NavItems />
        </div>

        {/* Sign Out Button - Sticky at Bottom */}
        <div className="border-t-4 border-black bg-white">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-4 py-4 font-black text-red-600 hover:bg-red-50 transition-all"
          >
            <LogOut size={20} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </>
  );
}
