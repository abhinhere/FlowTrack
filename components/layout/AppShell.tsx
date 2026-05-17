"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  BarChart3,
  CheckSquare,
  Home,
  Menu,
  Plus,
  Search,
  Sparkles,
  X,
  RotateCcw
} from "lucide-react";
import { useState } from "react";
import { InstallAppButton } from "@/components/ui/InstallAppButton";
import { useStreak } from "@/hooks/useStreak";

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/tasks", label: "Tasks", icon: CheckSquare },
  { href: "/analytics", label: "Analytics", icon: BarChart3 }
];

import { useAuth } from "@/components/auth/AuthProvider";

export function AppShell({
  children,
  title,
  eyebrow,
  action
}: {
  children: React.ReactNode;
  title: string;
  eyebrow?: string;
  action?: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const { user, signInWithGoogle, signOut, loading } = useAuth();

  return (
    <div className="min-h-screen bg-surface-950 text-white">
        <div className="fixed inset-0 -z-10 subtle-grid opacity-60" />
        <div className="flex min-h-screen">
          <Sidebar />

          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-40 bg-black/60 lg:hidden"
                onClick={() => setIsOpen(false)}
              >
                <motion.div
                  initial={{ x: -280 }}
                  animate={{ x: 0 }}
                  exit={{ x: -280 }}
                  transition={{ type: "spring", stiffness: 260, damping: 28 }}
                  onClick={(event) => event.stopPropagation()}
                  className="h-full w-72 border-r border-white/10 bg-surface-900 p-4 shadow-card"
                >
                  <div className="flex items-center justify-between">
                    <Logo />
                    <button
                      aria-label="Close menu"
                      onClick={() => setIsOpen(false)}
                      className="rounded-xl p-2 text-slate-400 transition hover:bg-white/10 hover:text-white"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                  <div className="flex flex-1 flex-col">
                    <NavItems onNavigate={() => setIsOpen(false)} />
                    <div className="mt-auto pt-8">
                      <StreakWidget />
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          <main className="min-w-0 flex-1 lg:pl-72">
            <header className="sticky top-0 z-30 border-b border-white/10 bg-surface-950/80 backdrop-blur-xl">
              <div className="flex min-h-20 items-center gap-4 px-4 sm:px-6 lg:px-8">
                <button
                  aria-label="Open menu"
                  onClick={() => setIsOpen(true)}
                  className="rounded-xl border border-white/10 bg-white/[0.04] p-2 text-slate-300 transition hover:bg-white/10 hover:text-white lg:hidden"
                >
                  <Menu className="h-5 w-5" />
                </button>

                <div className="min-w-0 flex-1">
                  {eyebrow && <p className="text-xs font-medium uppercase tracking-[0.22em] text-blue-300">{eyebrow}</p>}
                  <h1 className="truncate text-xl font-semibold text-white sm:text-2xl">{title}</h1>
                </div>

                <div className="hidden min-w-64 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-slate-500 md:flex">
                  <Search className="h-4 w-4" />
                  <span className="text-sm">Search workspace</span>
                </div>

                <div className="flex items-center gap-3">
                  <InstallAppButton />
                  {loading ? (
                    <div className="h-8 w-8 rounded-full bg-white/10 animate-pulse" />
                  ) : user ? (
                    <button onClick={signOut} className="flex items-center gap-2 rounded-xl bg-white/[0.04] px-3 py-2 text-sm text-slate-300 hover:bg-white/10 hover:text-white transition">
                      <img src={user.photoURL || ""} alt="User" className="h-5 w-5 rounded-full" />
                      <span className="hidden sm:inline">Sign out</span>
                    </button>
                  ) : (
                    <button onClick={signInWithGoogle} className="rounded-xl bg-blue-500 px-3 py-2 text-sm font-medium text-white shadow-glow hover:bg-blue-400 transition">
                      Sign in
                    </button>
                  )}
                  {action}
                </div>
              </div>
            </header>

            <div className="px-4 py-6 sm:px-6 lg:px-8">{children}</div>
          </main>
        </div>
    </div>
  );
}

function Sidebar() {
  const { streak, isHydrated, resetStreak } = useStreak();

  return (
    <aside className="fixed inset-y-0 left-0 hidden w-72 flex-col border-r border-white/10 bg-surface-900/82 p-4 backdrop-blur-xl lg:flex">
      <Logo />
      <NavItems />
      <div className="mt-auto">
        <StreakWidget />
      </div>
    </aside>
  );
}

function StreakWidget() {
  const { streak, isHydrated, resetStreak } = useStreak();

  return (
    <div className="rounded-2xl border border-blue-400/20 bg-blue-500/10 p-4">
      <div className="flex items-center justify-between text-blue-200">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4" />
          <span className="text-sm font-medium">Focus streak</span>
        </div>
        {streak.count > 0 && (
          <button
            onClick={resetStreak}
            aria-label="Reset streak"
            className="rounded p-1 opacity-60 transition hover:bg-blue-400/20 hover:opacity-100"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
      <p className="mt-2 text-2xl font-semibold text-white">
        {!isHydrated ? "-" : streak.count} {streak.count === 1 ? "day" : "days"}
      </p>
      <p className="mt-1 text-xs leading-5 text-slate-400">Small wins, logged daily.</p>
    </div>
  );
}

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-3">
      <div className="grid h-10 w-10 place-items-center rounded-2xl bg-blue-500 text-white shadow-glow">
        <Plus className="h-5 w-5 rotate-45" />
      </div>
      <div>
        <p className="text-base font-semibold text-white">FlowTrack</p>
        <p className="text-xs text-slate-500">Progress OS</p>
      </div>
    </Link>
  );
}

function NavItems({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="mt-8 space-y-1">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
              isActive
                ? "bg-white/10 text-white shadow-sm"
                : "text-slate-400 hover:bg-white/[0.06] hover:text-white"
            }`}
          >
            <Icon className={`h-5 w-5 ${isActive ? "text-blue-300" : "text-slate-500 group-hover:text-blue-300"}`} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
