import { CTA } from "./cta/cta";
import { Features } from "./features/features";
import { Hero } from "./hero/hero";
import { HomeFAQ } from "./home-faq/home-faq";
import { HowItWorks } from "./how-it-works/how-it-works";
import { Security } from "./security/security";
import { UseCases } from "./use-cases/use-cases";

export function App() {
  return (
    <>
      <Hero />
      <Features />
      <HowItWorks />
      <UseCases />
      <Security />
      <HomeFAQ />
      <CTA />
    </>
  );
}
