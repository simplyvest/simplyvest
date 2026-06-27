import starlight from "@astrojs/starlight";
import mermaid from "astro-mermaid";
import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://docs.simplyvest.xyz",
  output: "static",
  server: { port: 4324 },
  integrations: [
    mermaid({
      theme: "forest",
      autoTheme: true,
    }),
    starlight({
      title: "SimplyVest Docs",
      head: [{ tag: "link", attrs: { rel: "icon", type: "image/png", href: "/favicon.png" } }],
      logo: {
        src: "./public/logo.png",
        replacesTitle: true,
      },
      editLink: {
        baseUrl: "https://github.com/simplyvest/simplyvest/edit/main/apps/docs/",
      },
      social: [
        { icon: "github", label: "GitHub", href: "https://github.com/simplyvest/simplyvest" },
      ],
      sidebar: [
        {
          label: "Getting Started",
          items: [
            { label: "Welcome", slug: "getting-started/welcome" },
            { label: "Quick Start", slug: "getting-started/quick-start" },
          ],
        },
        {
          label: "Platform Guide",
          items: [
            {
              label: "Organizations",
              collapsed: false,
              items: [
                { label: "Creating an Organization", slug: "platform/organizations/creating" },
                { label: "Managing Members", slug: "platform/organizations/members" },
              ],
            },
            {
              label: "Tokens",
              collapsed: false,
              items: [
                { label: "Creating a Token", slug: "platform/tokens/creating" },
                { label: "Linking an Existing Token", slug: "platform/tokens/linking" },
              ],
            },
            {
              label: "Vesting",
              collapsed: false,
              items: [
                { label: "Vesting to Members", slug: "platform/vesting/vesting-to-members" },
                { label: "Managing Vests", slug: "platform/vesting/managing-vests" },
                { label: "Claiming Tokens", slug: "platform/claiming" },
              ],
            },
          ],
        },
        {
          label: "Protocol Reference",
          items: [{ autogenerate: { directory: "protocol" } }],
        },
        {
          label: "Operations",
          items: [{ autogenerate: { directory: "operations" } }],
        },
        {
          label: "Appendix",
          items: [
            {
              label: "Architecture Decision Records",
              collapsed: false,
              items: [{ autogenerate: { directory: "appendix/adr" } }],
            },
            { label: "Troubleshooting & FAQ", slug: "appendix/troubleshooting" },
            { label: "Glossary", slug: "appendix/glossary" },
            { label: "Observations", slug: "appendix/observations" },
            { label: "Research & Background", slug: "appendix/research" },
          ],
        },
      ],
      customCss: ["./src/styles/custom.css"],
    }),
  ],
});
