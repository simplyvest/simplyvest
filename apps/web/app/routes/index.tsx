import { createRoute } from "@tanstack/react-router";

import { Footer } from "@/components/layout/footer";
import { CTA } from "@/components/sections/cta";
import { Features } from "@/components/sections/features";
import { Hero } from "@/components/sections/hero";
import { HomeFAQ } from "@/components/sections/home-faq";
import { HowItWorks } from "@/components/sections/how-it-works";
import { Security } from "@/components/sections/security";
import { UseCases } from "@/components/sections/use-cases";

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
      <Footer />
    </div>
  );
}
