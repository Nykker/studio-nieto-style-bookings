import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export function SiteHeader() {
  const [email, setEmail] = useState<string | null>(null);
  const navigate = useNavigate();
  const qc = useQueryClient();
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setEmail(data.session?.user.email ?? null));
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setEmail(s?.user.email ?? null));
    return () => data.subscription.unsubscribe();
  }, []);
  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }
  return (
    <header className="mx-auto flex max-w-5xl items-center justify-between px-6 py-6">
      <Link to="/" className="font-display text-2xl font-semibold text-primary">Studio Nieto</Link>
      <nav className="flex items-center gap-3">
        {email ? (
          <>
            <Button asChild variant="ghost"><Link to="/book">My bookings</Link></Button>
            <Button variant="outline" onClick={signOut}>Sign out</Button>
          </>
        ) : (
          <Button asChild><Link to="/auth">Sign in</Link></Button>
        )}
      </nav>
    </header>
  );
}
