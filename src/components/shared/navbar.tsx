"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { FaBars, FaTimes } from "react-icons/fa";
import { cn } from "@/lib/utils";
import { LangSwitcher } from "@/components/shared/lang-switcher";
import { useLang } from "@/context/lang-context";
import { t } from "@/lib/translations";
import { logoutAction } from "@/app/actions/auth";
import type { JWTPayload } from "@/lib/auth";
import { AvatarDisplay } from "@/components/shared/avatar-display";
import { Crown } from "lucide-react";
import { UpgradeModal } from "@/components/pricing/upgrade-modal";

interface NavbarProps {
  session?: JWTPayload | null;
}

function ProfileMenu({ session, kh }: { session: JWTPayload; kh: boolean }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const dashboardHref =
    session.role === "admin"
      ? "https://dashboard.kesararamwithdigital.tech/admin/users"
      : session.role === "teacher"
        ? "https://dashboard.kesararamwithdigital.tech/teacher/classes"
        : session.role === "staff"
          ? "https://dashboard.kesararamwithdigital.tech/staff"
          : "/profile/student";

  const roleColor =
    session.role === "admin"
      ? "#ff0050"
      : session.role === "teacher"
        ? "#006747"
        : session.role === "staff"
          ? "#3b82f6"
          : "#3b82f6";

  return (
    <div ref={ref} className="relative flex-shrink-0">
      {/* Avatar-only button — no text, no chevron */}
      <button
        onClick={() => setOpen(!open)}
        className="p-0.5 border-2 border-black bg-white shadow-[2px_2px_0_#000] hover:shadow-[4px_4px_0_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-100 block"
        style={{ borderRadius: "0px" }}
        aria-label="Profile menu"
        aria-expanded={open}
      >
        <AvatarDisplay
          avatar={session.avatar ?? null}
          name={session.name}
          size={34}
          radius={0}
        />
      </button>

      {open && (
        <div
          className="absolute right-0 mt-2 bg-white border-2 border-black shadow-[4px_4px_0_#000] z-50 min-w-[200px] overflow-hidden"
          style={{ borderRadius: "0px" }}
        >
          <div
            className="px-4 py-3 border-b-2 border-black"
            style={{ background: "#f9fafb" }}
          >
            <p className="text-xs font-black text-black truncate">
              {session.name}
            </p>
            <p className="text-[10px] text-zinc-500 truncate">
              {session.email}
            </p>
            <span
              className="inline-block mt-1 text-[9px] font-bold uppercase tracking-widest px-2 py-0.5"
              style={{
                background: roleColor,
                color: "#fff",
                borderRadius: "0px",
              }}
            >
              {session.role}
            </span>
          </div>
          <div className="py-1">
            {(session.role === "admin" || session.role === "teacher" || session.role === "staff") && (
              <a
                href={dashboardHref}
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-black hover:bg-yellow-300 transition-colors"
                onClick={() => setOpen(false)}
              >
                <span>&#9707;</span>
                Dashboard
              </a>
            )}
            {session.role === "student" && (
              <Link
                href="/profile/student"
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-black hover:bg-yellow-300 transition-colors"
                onClick={() => setOpen(false)}
              >
                <span>&#9786;</span>
                My Profile
              </Link>
            )}
            <Link
              href="/pricing"
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-amber-600 hover:bg-amber-50 transition-colors"
              onClick={() => setOpen(false)}
            >
              <Crown size={14} className="text-amber-500" />
              {kh ? "ធ្វើឱ្យប្រសើរឡើង" : "Upgrade Plan"}
            </Link>
            <div className="h-px bg-black/10 my-1" />
            <form action={logoutAction}>
              <button
                type="submit"
                className="flex w-full items-center gap-2 px-4 py-2.5 text-sm font-semibold hover:bg-[#fda4af] transition-colors"
                style={{ color: "#ff0050" }}
              >
                <span>&#8594;</span>
                Sign Out
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export function Navbar({ session }: NavbarProps) {
  const pathname = usePathname();
  const { lang } = useLang();
  const tr = t[lang].nav;
  const kh = lang === "kh";
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  const NAV_ITEMS = [
    { label: tr.home, href: "/" },
    { label: tr.learn, href: "/learn" },
    { label: tr.play, href: "/play" },
    { label: tr.leaderboard, href: "/leaderboard" },
    { label: tr.suarAI, href: "/suar/ai" },
    { label: tr.about, href: "/about" },
  ];

  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <UpgradeModal open={upgradeOpen} onClose={() => setUpgradeOpen(false)} lang={lang} />
      <header className="sticky top-0 left-0 right-0 z-50 bg-white border-b-2 border-black">
        <nav className="flex items-center px-6 py-3 max-w-7xl mx-auto">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-4 flex-shrink-0 ml-2">
            <Image
              src="/brand/kwd-black-text.png"
              alt="KWD Logo"
              width={48}
              height={48}
              className="object-contain rotate-45 transition-transform hover:scale-105"
              unoptimized
            />
            <span className="font-black text-[10px] sm:text-[11px] uppercase tracking-widest text-black leading-tight">
              Kesararam.<br />With. Digital.
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1 flex-1 justify-center">
            {NAV_ITEMS.map(({ label, href }) => {
              const active =
                pathname === href || pathname.startsWith(href + "/");
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "px-3 py-1.5 text-sm font-semibold border-2 transition-all duration-100 whitespace-nowrap",
                    active
                      ? "bg-yellow-400 text-black border-black shadow-[2px_2px_0_#ca8a04]"
                      : "border-transparent text-zinc-700 hover:border-black hover:bg-yellow-300 hover:shadow-[2px_2px_0_#000]",
                  )}
                >
                  {label}
                </Link>
              );
            })}
          </div>

          {/* Lang switcher + Upgrade + Auth */}
          <div className="hidden md:flex items-center gap-2 ml-3 flex-shrink-0">
            <LangSwitcher />
            {/* Upgrade CTA */}
            <button
              onClick={() => setUpgradeOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-black bg-amber-400 text-black border-2 border-black shadow-[2px_2px_0_#000] hover:shadow-[4px_4px_0_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-100 whitespace-nowrap uppercase tracking-wide"
            >
              <Crown size={13} />
              {kh ? "ធ្វើឱ្យប្រសើរ" : "Upgrade"}
            </button>
            {session ? (
              <ProfileMenu session={session} kh={kh} />
            ) : (
              <Link
                href="/login"
                className="px-4 py-1.5 text-sm font-bold bg-yellow-400 text-black border-2 border-black shadow-[3px_3px_0_#000] hover:shadow-[5px_5px_0_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-100 whitespace-nowrap"
              >
                {tr.login}
              </Link>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden ml-auto p-1.5 border-2 border-black bg-white shadow-[2px_2px_0_#000] active:shadow-none active:translate-x-0.5 active:translate-y-0.5 transition-all"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            {mobileOpen ? <FaTimes size={18} /> : <FaBars size={18} />}
          </button>
        </nav>
      </header>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        >
          <div className="absolute inset-0 bg-black/40" />
          <div
            className="absolute top-0 left-0 right-0 bg-white border-b-2 border-black shadow-[0_6px_0_#000] pt-20 pb-6 px-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col gap-2">
              {NAV_ITEMS.map(({ label, href }) => {
                const active =
                  pathname === href || pathname.startsWith(href + "/");
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "px-4 py-3 text-base font-bold border-2 transition-all duration-100",
                      active
                        ? "bg-yellow-400 text-black border-black shadow-[2px_2px_0_#ca8a04]"
                        : "border-black text-black hover:bg-yellow-300",
                    )}
                  >
                    {label}
                  </Link>
                );
              })}

              {session ? (
                <>
                  {(session.role === "admin" || session.role === "teacher" || session.role === "staff") && (
                    <a
                      href={
                        session.role === "admin"
                          ? "https://dashboard.kesararamwithdigital.tech/admin/users"
                          : session.role === "teacher"
                            ? "https://dashboard.kesararamwithdigital.tech/teacher/classes"
                            : "https://dashboard.kesararamwithdigital.tech/staff"
                      }
                      onClick={() => setMobileOpen(false)}
                      className="mt-2 px-4 py-3 text-base font-bold bg-yellow-400 text-black border-2 border-black shadow-[4px_4px_0_#000] text-center"
                    >
                      Dashboard
                    </a>
                  )}
                  {session.role === "student" && (
                    <Link
                      href="/profile/student"
                      onClick={() => setMobileOpen(false)}
                      className="mt-2 px-4 py-3 text-base font-bold bg-yellow-400 text-black border-2 border-black shadow-[4px_4px_0_#000] text-center"
                    >
                      My Profile
                    </Link>
                  )}
                  <form action={logoutAction}>
                    <button
                      type="submit"
                      className="w-full mt-1 px-4 py-3 text-base font-bold border-2 border-black text-center"
                      style={{ color: "#ff0050" }}
                    >
                      Sign Out
                    </button>
                  </form>
                </>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="mt-2 px-4 py-3 text-base font-bold bg-yellow-400 text-black border-2 border-black shadow-[4px_4px_0_#000] text-center"
                >
                  {tr.login}
                </Link>
              )}

              <div className="mt-2 flex justify-center">
                <LangSwitcher />
              </div>
              {/* Mobile upgrade button */}
              <button
                onClick={() => { setMobileOpen(false); setUpgradeOpen(true); }}
                className="flex items-center justify-center gap-2 mt-2 px-4 py-3 text-base font-black bg-amber-400 text-black border-2 border-black shadow-[4px_4px_0_#000] uppercase tracking-wide"
              >
                <Crown size={16} />
                {kh ? "ធ្វើឱ្យប្រសើរឡើង" : "Upgrade Plan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
