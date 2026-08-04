import React, { useState } from "react";
import { useSession } from "@/lib/session";
import { Lock, ShieldAlert, UserCheck, KeyRound, Loader2, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export function PanelLoginPage() {
  const { login } = useSession();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier || !password) {
      toast.error("Please enter your email and password");
      return;
    }

    setLoading(true);
    setError(null);

    const result = await login(identifier.trim(), password);
    if (!result.success) {
      setError(result.error || "Authentication failed");
    } else {
      toast.success("Welcome back!");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-center items-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo / Brand */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-bold text-xl mb-4 shadow-lg">
            E
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Enginow Staff Portal</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Sign in with your staff credentials
          </p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-lg">
          {error && (
            <div className="mb-5 p-3.5 rounded-lg bg-destructive/10 border border-destructive/25 flex items-start gap-2.5 text-sm text-destructive">
              <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Email or Username
              </label>
              <div className="relative">
                <Input
                  id="staff-identifier"
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="your@enginow.in"
                  className="pl-9"
                  autoComplete="username"
                  required
                />
                <UserCheck className="h-4 w-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Password
              </label>
              <div className="relative">
                <Input
                  id="staff-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="pl-9"
                  autoComplete="current-password"
                  required
                />
                <KeyRound className="h-4 w-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full mt-2"
              id="staff-login-btn"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn className="h-4 w-4 mr-2" />
                  Sign In
                </>
              )}
            </Button>
          </form>

          <div className="mt-5 pt-4 border-t border-border text-center">
            <p className="text-xs text-muted-foreground flex items-center justify-center gap-1.5">
              <Lock className="h-3 w-3" />
              Restricted to authorized Enginow staff only
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
