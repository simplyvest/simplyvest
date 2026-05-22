import { createRoute } from "@tanstack/react-router";

import { Badge } from "@/components/ui/badge";
import { faqs } from "@/data/faqs";
import { cn } from "@/utils/cn";

import { Route as RootRoute } from "./__root";

function Accordion({ items }: { items: { q: string; a: string }[] }) {
  return (
    <div className="divide-y divide-border rounded-xl border border-border">
      {items.map((item) => (
        <details key={item.q} className="group open:bg-bg1">
          <summary
            className={cn(
              "flex cursor-pointer items-center justify-between px-6 py-4 text-[0.95rem] font-medium transition-colors hover:bg-bg2",
              "marker:hidden",
            )}
          >
            {item.q}
            <span
              className="ml-4 font-mono text-sm text-dim transition-transform group-open:rotate-45"
              aria-hidden="true"
            >
              +
            </span>
          </summary>
          <div className="border-t border-border px-6 py-4">
            <p className="text-[0.9rem] leading-relaxed text-muted">{item.a}</p>
          </div>
        </details>
      ))}
    </div>
  );
}

export const Route = createRoute({
  getParentRoute: () => RootRoute,
  path: "/faq",
  component: FAQPage,
});

function FAQPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 pt-28">
      <Badge variant="sol">FAQ</Badge>
      <h1 className="mt-4">
        FREQUENTLY
        <br />
        <em>ASKED</em>
      </h1>
      <p className="max-w-[580px] text-lg leading-relaxed text-muted">
        Common questions about SimplyVest, token vesting, and the protocol.
      </p>

      <div className="mt-12">
        <Accordion items={faqs} />
      </div>

      <div className="h-16" />
    </div>
  );
}
