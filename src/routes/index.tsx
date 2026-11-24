import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/SiteHeader";
import { SERVICES } from "@/lib/services";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Studio Nieto — Hair salon booking" },
      { name: "description", content: "Book a haircut, color or beard trim at Studio Nieto in seconds." },
      { property: "og:title", content: "Studio Nieto — Hair salon booking" },
      { property: "og:description", content: "Book a haircut, color or beard trim at Studio Nieto in seconds." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-6 pb-20">
        <section className="py-16 md:py-24">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-accent">Hair salon</p>
          <h1 className="mt-4 max-w-2xl font-display text-5xl font-semibold leading-tight text-primary md:text-6xl">
            A good cut, booked in a minute.
          </h1>
          <p className="mt-5 max-w-lg text-lg text-muted-foreground">
            Pick a service, choose your time, and we'll have the chair ready.
          </p>
          <Button asChild size="lg" className="mt-8 h-12 rounded-full px-8 text-base">
            <Link to="/book">Book an appointment</Link>
          </Button>
        </section>
        <section className="grid gap-4 md:grid-cols-3">
          {SERVICES.map((s) => (
            <div key={s.id} className="rounded-2xl border bg-card p-6 shadow-soft">
              <h3 className="font-display text-xl font-semibold">{s.name}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.duration}</p>
              <p className="mt-4 text-2xl font-semibold text-primary">{s.price}</p>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}
