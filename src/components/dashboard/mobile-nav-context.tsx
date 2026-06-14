"use client";

import { createContext, useContext, useState } from "react";

/**
 * Shared open/close state for the mobile dashboard drawer.
 * The header renders the hamburger toggle; the sidebar reads `open` to slide
 * itself in/out. Both are client components under the same provider (mounted in
 * the dashboard layout), so a tiny context keeps them in sync without prop
 * drilling through the server-rendered layout.
 */
interface MobileNavState {
  open: boolean;
  setOpen: (open: boolean) => void;
  toggle: () => void;
}

const MobileNavContext = createContext<MobileNavState>({
  open: false,
  setOpen: () => {},
  toggle: () => {},
});

export function MobileNavProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <MobileNavContext.Provider value={{ open, setOpen, toggle: () => setOpen((v) => !v) }}>
      {children}
    </MobileNavContext.Provider>
  );
}

export const useMobileNav = () => useContext(MobileNavContext);
