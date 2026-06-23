import starlight from "@astrojs/starlight";
import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://docs.simplyvest.com",
  output: "static",
  integrations: [
    starlight({
      title: "SimplyVest Docs",
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
          items: [{ autogenerate: { directory: "appendix" } }],
        },
      ],
      customCss: ["./src/styles/custom.css"],
    }),
  ],
});
