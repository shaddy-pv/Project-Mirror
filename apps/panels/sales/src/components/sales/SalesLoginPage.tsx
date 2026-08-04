import React, { useState } from "react";
import { useSalesAuth } from "@/store/useSalesAuth";
import { Lock, ShieldAlert, UserCheck, KeyRound, Loader2, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export function SalesLoginPage() {
  const { login } = useSalesAuth();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier || !password) {
      toast.error("Please enter both ID/Email and Password");
      return;
    }

    setLoading(true);
    setError(null);

    const result = await login(identifier.trim(), password);
    if (!result.success) {
      setError(result.error || "Authentication failed");
      toast.error(result.error || "Authentication failed");
    } else {
      toast.success("Welcome to Enginow Commerce & Sales Panel!");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      <div className="w-full max-w-md relative z-10">
        <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-2xl">
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-500 mb-4 shadow-sm">
              <TrendingUp className="h-7 w-7" />
            </div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-purple-500 bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20 mb-2">
              COMMERCE & REVENUE OPERATIONS
            </span>
            <h1 className="text-2xl font-bold tracking-tight">Sales Panel</h1>
            <p className="text-xs text-muted-foreground mt-1 max-w-xs">
              Sign in with your sales credentials to monitor enrollment analytics and client inquiries.
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3 rounded-lg bg-destructive/10 border border-destructive/20 flex items-start gap-2.5 text-xs text-destructive">
              <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Access Denied</p>
                <p>{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-foreground mb-1.5">
                Staff ID or Email
              </label>
              <div className="relative">
                <Input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="sales@enginow.in"
                  className="pl-9 text-sm"
                  required
                />
                <UserCheck className="h-4 w-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-foreground mb-1.5">
                Password
              </label>
              <div className="relative">
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="pl-9 text-sm"
                  required
                />
                <KeyRound className="h-4 w-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div className="pt-2">
              <Button type="submit" disabled={loading} className="w-full font-medium text-sm py-2.5 bg-purple-600 hover:bg-purple-500 text-white">
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Authenticating...
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4 mr-2" />
                    Sign In to Sales Panel
                  </>
                )}
              </Button>
            </div>
          </form>

          <div className="mt-6 pt-4 border-t border-border text-center">
            <p className="text-[11px] text-muted-foreground flex items-center justify-center gap-1.5">
              <Lock className="h-3 w-3" />
              Protected by Role Isolation &bull; Unauthorized attempts logged
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
