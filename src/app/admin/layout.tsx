"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { ToastProvider } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { createClient } from "@/lib/supabase/client";
import {
  LayoutDashboard,
  TrendingUp,
  FileEdit,
  Calendar,
  BarChart3,
  Users,
  Workflow,
  Settings,
  Bell,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Activity,
  Sparkles,
  Rocket,
  LogOut,
  ShieldCheck,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/", label: "Command Center", icon: LayoutDashboard },
  { href: "/growth-ops", label: "Growth Ops", icon: Rocket },
  { href: "/markets", label: "Markets", icon: TrendingUp },
  { href: "/content", label: "Content Studio", icon: FileEdit },
  { href: "/scheduler", label: "Scheduler", icon: Calendar },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/community", label: "Community", icon: Users },
  { href: "/ai-studio", label: "AI Studio", icon: Sparkles },
  { href: "/workflows", label: "Workflows", icon: Workflow },
  { href: "/settings", label: "Admin", icon: Settings },
];

const BARE_ROUTES = ["/login", "/mfa"];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [autopostEnabled, setAutopostEnabled] = useState(false);

  // Bare layout for login and MFA pages
  const isBare = BARE_ROUTES.some(
    (r) => pathname === r || pathname.startsWith(r + "/")
  );

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  if (isBare) {
    return <>{children}</>;
  }

  return (
    <ToastProvider>
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col border-r border-border bg-sidebar transition-all duration-200 lg:static",
          collapsed ? "w-16" : "w-60",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Sidebar header */}
        <div className="flex h-14 items-center justify-between border-b border-border px-3">
          {!collapsed && (
            <Link href="/" className="flex items-center gap-2">
              <span className="text-lg">🔮</span>
              <span className="font-serif font-bold text-sm text-gradient-brand">
                ForecastHer
              </span>
            </Link>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 hidden lg:flex"
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 lg:hidden"
            onClick={() => setMobileOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 py-2">
          <nav className="space-y-1 px-2">
            {NAV_ITEMS.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                  )}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              );
            })}
          </nav>
        </ScrollArea>

        {/* Sidebar footer */}
        {!collapsed && (
          <div className="border-t border-border p-3 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Autopost</span>
              <Switch
                checked={autopostEnabled}
                onCheckedChange={setAutopostEnabled}
                className="scale-75"
              />
            </div>
            <Badge variant="outline" className="text-xs w-full justify-center border-amber-200 bg-amber-50 text-amber-700">
              Pre-launch
            </Badge>
          </div>
        )}
      </aside>

      {/* Main area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top header bar */}
        <header className="flex h-14 items-center justify-between border-b border-border bg-background px-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 lg:hidden"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="h-4 w-4" />
            </Button>
            <Badge variant="outline" className="text-xs border-amber-200 bg-amber-50 text-amber-700">
              <Activity className="h-3 w-3 mr-1" />
              Pre-launch
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs border-green-200 bg-green-50 text-green-700">
              <ShieldCheck className="h-3 w-3 mr-1" />
              2FA
            </Badge>
            <Button variant="ghost" size="icon" className="h-8 w-8 relative">
              <Bell className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handleLogout}
              title="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-6">{children}</div>
        </main>
      </div>
    </div>
    </ToastProvider>
  );
}
