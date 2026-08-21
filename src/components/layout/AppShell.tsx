import { Suspense, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { MobileNav } from "./MobileNav";
import { ToastViewport } from "../ui/Toast";

export function AppShell() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="min-h-dvh bg-[var(--bg)] text-[var(--fg)]">
      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-30 lg:flex lg:w-60 lg:flex-col lg:border-r lg:border-[var(--border)]">
        <Sidebar />
      </aside>

      {mobileOpen ? (
        <div className="lg:hidden">
          <div
            className="fixed inset-0 z-40 bg-black/40"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="fixed inset-y-0 left-0 z-50 w-72 border-r border-[var(--border)] bg-[var(--bg)]">
            <Sidebar onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      ) : null}

      <div className="lg:pl-60">
        <Topbar onMenuClick={() => setMobileOpen(true)} />
        <main
          key={location.pathname}
          className="mx-auto max-w-6xl px-4 pb-24 pt-6 sm:px-6 lg:pb-10"
        >
          <Suspense fallback={null}>
            <Outlet />
          </Suspense>
        </main>
        <MobileNav />
      </div>

      <ToastViewport />
    </div>
  );
}
