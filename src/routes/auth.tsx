import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SiteHeader } from "@/components/SiteHeader";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — Studio Nieto" },
      { name: "description", content: "Sign in or create an account to book at Studio Nieto." },
      { property: "og:title", content: "Sign in — Studio Nieto" },
      { property: "og:description", content: "Sign in or create an account to book at Studio Nieto." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

const schema = z.object({
  email: z.string().trim().email("Enter a valid email").max(255),
  password: z.string().min(6, "Password must be at least 6 characters").max(72),
});

function AuthPage() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const navigate = useNavigate();

  async function submit(e: FormEvent) {
    e.preventDefault();
    const parsed = schema.safeParse({ email, password });
    if (!parsed.success) { toast.error(parsed.error.issues[0]?.message ?? "Invalid input"); return; }
    setLoading(true);
    if (mode === "signup") {
      const { data, error } = await supabase.auth.signUp({ ...parsed.data, options: { emailRedirectTo: window.location.origin } });
      setLoading(false);
      if (error) { toast.error(error.message); return; }
      if (data.session) navigate({ to: "/book" }); else setSent(true);
    } else {
      const { error } = await supabase.auth.signInWithPassword(parsed.data);
      setLoading(false);
      if (error) { toast.error(error.message); return; }
      navigate({ to: "/book" });
    }
  }

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-md px-6 py-12">
        <div className="rounded-3xl border bg-card p-8 shadow-soft">
          {sent ? (
            <div className="text-center">
              <h1 className="font-display text-3xl font-semibold text-primary">Check your email</h1>
              <p className="mt-3 text-muted-foreground">We sent a confirmation link to {email}. Click it, then sign in.</p>
              <Button variant="outline" className="mt-6" onClick={() => { setSent(false); setMode("signin"); }}>Back to sign in</Button>
            </div>
          ) : (
            <>
              <h1 className="font-display text-3xl font-semibold text-primary">{mode === "signin" ? "Welcome back" : "Create account"}</h1>
              <p className="mt-2 text-sm text-muted-foreground">{mode === "signin" ? "Sign in to manage your bookings." : "Sign up to book your first appointment."}</p>
              <form onSubmit={submit} className="mt-6 space-y-4">
                <div className="space-y-2"><Label htmlFor="email">Email</Label><Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
                <div className="space-y-2"><Label htmlFor="password">Password</Label><Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required /></div>
                <Button type="submit" className="h-11 w-full rounded-full" disabled={loading}>{loading ? "Please wait…" : mode === "signin" ? "Sign in" : "Sign up"}</Button>
              </form>
              <button type="button" className="mt-5 w-full text-sm text-muted-foreground hover:text-primary" onClick={() => setMode(mode === "signin" ? "signup" : "signin")}>
                {mode === "signin" ? "New here? Create an account" : "Already have an account? Sign in"}
              </button>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
