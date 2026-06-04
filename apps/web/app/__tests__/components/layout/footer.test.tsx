import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";

import { Footer } from "@/components/layout/footer";
import { renderWithRouter } from "@/__tests__/test-utils";

describe("Footer", () => {
  it("renders the brand logo and description", async () => {
    renderWithRouter(<Footer />);

    const logo = await screen.findByAltText("SimplyVest");
    expect(logo).toBeInTheDocument();

    const brandLink = await screen.findByText("SimplyVest");
    expect(brandLink.closest("a")).toHaveAttribute("href", "/");
  });

  it("renders link columns with correct titles and hrefs", async () => {
    renderWithRouter(<Footer />);

    // Column headings
    expect(await screen.findByText("product")).toBeInTheDocument();
    expect(await screen.findByText("resources")).toBeInTheDocument();
    expect(await screen.findByText("company")).toBeInTheDocument();

    // Product links (internal)
    expect((await screen.findByText("Features")).closest("a")).toHaveAttribute(
      "href",
      "/#features",
    );
    expect((await screen.findByText("Documentation")).closest("a")).toHaveAttribute(
      "href",
      "/docs",
    );
    expect((await screen.findByText("Waitlist")).closest("a")).toHaveAttribute(
      "href",
      "/waitlist",
    );

    // Resources links (internal)
    expect((await screen.findByText("Support")).closest("a")).toHaveAttribute(
      "href",
      "/waitlist",
    );

    // Company links - GitHub is external
    const githubLink = await screen.findByText("GitHub");
    expect(githubLink.closest("a")).toHaveAttribute(
      "href",
      "https://github.com/simplyvest/simplyvest",
    );
    expect(githubLink.closest("a")).toHaveAttribute("target", "_blank");
    expect(githubLink.closest("a")).toHaveAttribute(
      "rel",
      "noopener noreferrer",
    );
  });

  it("renders social media links with aria labels", async () => {
    renderWithRouter(<Footer />);

    const githubIcon = await screen.findByLabelText("GitHub");
    expect(githubIcon).toBeInTheDocument();
    expect(githubIcon).toHaveAttribute(
      "href",
      "https://github.com/simplyvest/simplyvest",
    );

    const twitterIcon = await screen.findByLabelText("Twitter");
    expect(twitterIcon).toBeInTheDocument();
    expect(twitterIcon).toHaveAttribute("href", "https://x.com/simplyvestsol");

    const emailIcon = await screen.findByLabelText("Email");
    expect(emailIcon).toBeInTheDocument();
    expect(emailIcon).toHaveAttribute("href", "mailto:hello@simplyvest.com");
  });

  it("renders copyright with current year", async () => {
    renderWithRouter(<Footer />);

    const year = new Date().getFullYear();
    expect(
      await screen.findByText(`© ${year} SimplyVest. All rights reserved.`),
    ).toBeInTheDocument();
  });
});
