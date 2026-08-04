"use client";

import React, { useState, useEffect } from "react";
import { StaffRole, StaffUser, staffLogin, staffGetMe, staffLogout } from "@/lib/staffAuth";
import { Lock, ShieldAlert, LogOut, Loader2, UserCheck, KeyRound, Sparkles, Building2, BookOpen, ShoppingBag, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface PortalLoginGateProps {
  portal: StaffRole;
  title: string;
  subtitle: string;
  children: (user: StaffUser, onLogout: () => void) => React.ReactNode;
}

const PORTAL_THEMES: Record<StaffRole, { badge: string; color: string; icon: any; placeholderEmail: string }> = {
  admin: {
    badge: "Administrative Master Command",
    color: "from-amber-500/20 via-primary/10 to-transparent",
    icon: ShieldCheck,
    placeholderEmail: "admin@enginow.in",
  },
  hr: {
    badge: "Human Resources & Talent Management",
    color: "from-blue-500/20 via-indigo-500/10 to-transparent",
    icon: Building2,
    placeholderEmail: "hr@enginow.in",
  },
  educator: {
    badge: "Academic & Curriculum Studio",
    color: "from-emerald-500/20 via-teal-500/10 to-transparent",
    icon: BookOpen,
    placeholderEmail: "educator@enginow.in",
  },
  sales: {
    badge: "Commerce & Revenue Operations",
    color: "from-purple-500/20 via-pink-500/10 to-transparent",
    icon: ShoppingBag,
    placeholderEmail: "sales@enginow.in",
  },
};

export default function PortalLoginGate({ portal, title, subtitle, children }: PortalLoginGateProps) {
  const [user, setUser] = useState<StaffUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const theme = PORTAL_THEMES[portal];
  const Icon = theme.icon;

  useEffect(() => {
    async function checkAuth() {
      try {
        const staff = await staffGetMe(portal);
        if (staff && (staff.role === portal || staff.role === "admin")) {
          setUser(staff);
        } else {
          setUser(null);
        }
      } catch (e) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    checkAuth();
  }, [portal]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier || !password) {
      toast.error("Please enter both Staff ID / Email and Password");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await staffLogin(identifier.trim(), password, portal);
      setUser(res.staff);
      toast.success(`Welcome back, ${res.staff.name}! Logged in as ${res.staff.role.toUpperCase()}`);
    } catch (err: any) {
      const msg = err.message || "Failed to authenticate with this portal";
      setError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = async () => {
    await staffLogout(portal);
    setUser(null);
    toast.info("Logged out of staff portal");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white p-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
        <p className="text-slate-400 text-sm">Verifying staff credentials...</p>
      </div>
    );
  }

  if (user) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
        {/* Top Staff Navigation Header */}
        <header className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur border-b border-slate-800 px-4 sm:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-primary/20">
              E
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-white tracking-wide">{title}</span>
                <span className="px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded bg-primary/20 text-primary border border-primary/30">
                  {portal}
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">{subtitle}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-medium text-slate-200">{user.name}</p>
              <p className="text-[11px] text-slate-400">{user.email}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs gap-1.5"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign Out
            </Button>
          </div>
        </header>

        {/* Portal Dashboard Content */}
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
          {children(user, handleLogout)}
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#090D16] text-white flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Dynamic Background Glow */}
      <div className={`absolute -top-40 -left-40 w-96 h-96 bg-gradient-to-br ${theme.color} rounded-full blur-3xl opacity-50 pointer-events-none`} />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl opacity-40 pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-black/60">
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-slate-800 to-slate-700 border border-slate-700/80 flex items-center justify-center text-primary shadow-inner mb-4">
              <Icon className="h-7 w-7" />
            </div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20 mb-2">
              {theme.badge}
            </span>
            <h1 className="text-2xl font-bold text-white tracking-tight">{title}</h1>
            <p className="text-xs text-slate-400 mt-1 max-w-xs">{subtitle}</p>
          </div>

          {error && (
            <div className="mb-5 p-3 rounded-lg bg-red-950/60 border border-red-800/50 flex items-start gap-2.5 text-xs text-red-200">
              <ShieldAlert className="h-4 w-4 shrink-0 text-red-400 mt-0.5" />
              <div>
                <p className="font-semibold text-red-300">Authentication Failed</p>
                <p>{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Staff Email or ID</label>
              <div className="relative">
                <Input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder={theme.placeholderEmail}
                  className="bg-slate-950/70 border-slate-700/80 text-slate-100 placeholder:text-slate-500 pl-9 text-sm focus-visible:ring-primary"
                  required
                />
                <UserCheck className="h-4 w-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Password</label>
              <div className="relative">
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="bg-slate-950/70 border-slate-700/80 text-slate-100 placeholder:text-slate-500 pl-9 text-sm focus-visible:ring-primary"
                  required
                />
                <KeyRound className="h-4 w-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                disabled={submitting}
                className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-medium text-sm py-2.5 shadow-lg shadow-primary/20"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Verifying Access...
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4 mr-2" />
                    Enter {portal.toUpperCase()} Portal
                  </>
                )}
              </Button>
            </div>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-800 text-center">
            <p className="text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
              <Lock className="h-3 w-3" />
              Role-Isolated Portal &bull; Unauthorized access logged
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
