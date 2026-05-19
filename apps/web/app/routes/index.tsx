import { createRoute } from "@tanstack/react-router";
import { Route as RootRoute } from "./__root";
import { Hero } from "@/components/sections/hero";
import { Features } from "@/components/sections/features";
import { HowItWorks } from "@/components/sections/how-it-works";
import { UseCases } from "@/components/sections/use-cases";
import { Security } from "@/components/sections/security";
import { CTA } from "@/components/sections/cta";

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
