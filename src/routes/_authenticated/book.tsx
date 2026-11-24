import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { format, startOfToday } from "date-fns";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { SiteHeader } from "@/components/SiteHeader";
import { supabase } from "@/integrations/supabase/client";
import { SERVICES, TIMES, serviceName, type ServiceId } from "@/lib/services";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/book")({
  head: () => ({
    meta: [
      { title: "Book & my appointments — Studio Nieto" },
      { name: "description", content: "Book a new appointment and manage your bookings at Studio Nieto." },
      { property: "og:title", content: "Book — Studio Nieto" },
      { property: "og:description", content: "Book a new appointment and manage your bookings." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: BookPage,
});

function BookPage() {
  const { user } = Route.useRouteContext();
  const qc = useQueryClient();
  const [service, setService] = useState<ServiceId | null>(null);
  const [date, setDate] = useState<Date | undefined>();
  const [time, setTime] = useState<string | null>(null);

  const bookings = useQuery({
    queryKey: ["bookings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("bookings").select("*").order("booking_date").order("booking_time");
      if (error) throw error;
      return data;
    },
  });

  const create = useMutation({
    mutationFn: async () => {
      if (!service || !date || !time) throw new Error("Pick a service, date and time");
      const { error } = await supabase.from("bookings").insert({
        user_id: user.id, service, booking_date: format(date, "yyyy-MM-dd"), booking_time: time,
      });
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Appointment booked!"); setService(null); setDate(undefined); setTime(null); qc.invalidateQueries({ queryKey: ["bookings"] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  const cancel = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("bookings").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Booking cancelled"); qc.invalidateQueries({ queryKey: ["bookings"] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto grid max-w-5xl gap-8 px-6 pb-20 lg:grid-cols-[1.4fr_1fr]">
        <section className="rounded-3xl border bg-card p-6 shadow-soft md:p-8">
          <h1 className="font-display text-3xl font-semibold text-primary">Book an appointment</h1>
          <h2 className="mt-6 text-sm font-medium text-muted-foreground">1. Service</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            {SERVICES.map((s) => (
              <button key={s.id} type="button" onClick={() => setService(s.id)}
                className={cn("rounded-2xl border p-4 text-left transition-colors", service === s.id ? "border-primary bg-primary text-primary-foreground" : "bg-background hover:border-primary")}>
                <div className="font-semibold">{s.name}</div>
                <div className="text-sm opacity-75">{s.duration} · {s.price}</div>
              </button>
            ))}
          </div>
          <h2 className="mt-6 text-sm font-medium text-muted-foreground">2. Date</h2>
          <div className="mt-3 inline-block rounded-2xl border bg-background">
            <Calendar mode="single" selected={date} onSelect={setDate} disabled={(d) => d < startOfToday() || d.getDay() === 0} className="p-3" />
          </div>
          <h2 className="mt-6 text-sm font-medium text-muted-foreground">3. Time</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {TIMES.map((t) => (
              <button key={t} type="button" onClick={() => setTime(t)}
                className={cn("rounded-full border px-4 py-2 text-sm transition-colors", time === t ? "border-primary bg-primary text-primary-foreground" : "bg-background hover:border-primary")}>
                {t}
              </button>
            ))}
          </div>
          <Button className="mt-8 h-12 w-full rounded-full text-base" disabled={!service || !date || !time || create.isPending} onClick={() => create.mutate()}>
            {create.isPending ? "Booking…" : "Confirm booking"}
          </Button>
        </section>
        <section>
          <h2 className="font-display text-2xl font-semibold text-primary">My bookings</h2>
          <div className="mt-4 space-y-3">
            {bookings.isLoading && <p className="text-muted-foreground">Loading…</p>}
            {bookings.data?.length === 0 && <p className="rounded-2xl border border-dashed p-6 text-center text-muted-foreground">No bookings yet.</p>}
            {bookings.data?.map((b) => (
              <div key={b.id} className="flex items-center justify-between rounded-2xl border bg-card p-4">
                <div>
                  <div className="font-semibold">{serviceName(b.service)}</div>
                  <div className="text-sm text-muted-foreground">{format(new Date(b.booking_date + "T00:00"), "EEE d MMM yyyy")} · {b.booking_time.slice(0, 5)}</div>
                </div>
                <Button variant="outline" size="sm" disabled={cancel.isPending} onClick={() => cancel.mutate(b.id)}>Cancel</Button>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
