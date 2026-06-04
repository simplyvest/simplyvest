import { createRoute } from "@tanstack/react-router";

import { CTA } from "@/components/marketing/cta/cta";
import { Features } from "@/components/marketing/features/features";
import { Hero } from "@/components/marketing/hero/hero";
import { HomeFAQ } from "@/components/marketing/home-faq/home-faq";
import { HowItWorks } from "@/components/marketing/how-it-works/how-it-works";
import { Security } from "@/components/marketing/security/security";
import { UseCases } from "@/components/marketing/use-cases/use-cases";

import { Route as RootRoute } from "./__root";

export const Route = createRoute({
  getParentRoute: () => RootRoute,
  path: "/",
  component: LandingPage,
});

function LandingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      <Hero />
      <Features />
      <HowItWorks />
      <UseCases />
      <Security />
      <HomeFAQ />
      <CTA />
    </div>
  );
}
