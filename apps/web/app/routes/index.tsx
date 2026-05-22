import { createRoute } from "@tanstack/react-router";

import { CTA } from "@/components/sections/cta";
import { Features } from "@/components/sections/features";
import { Hero } from "@/components/sections/hero";
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
    <>
      <Hero />
      <Features />
      <HowItWorks />
      <UseCases />
      <Security />
      <CTA />
      <div className="h-6" />
    </>
  );
}
