import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";

const repositoryUrl = "https://github.com/landelatech/mpesa-node";

export default defineConfig({
  site: "https://opensource.landelatech.com",
  base: "/mpesa-node",
  integrations: [
    starlight({
      title: "M-Pesa Node",
      description: "Typed Node.js SDK and field guide for Safaricom M-Pesa Daraja APIs.",
      tagline: "Typed Daraja workflows for Node.js teams shipping real money movement.",
      logo: {
        src: "./src/assets/mpesa-node-mark.svg",
        alt: "M-Pesa Node",
      },
      social: [
        {
          icon: "github",
          label: "GitHub",
          href: repositoryUrl,
        },
      ],
      editLink: {
        baseUrl: `${repositoryUrl}/edit/main/docs/`,
      },
      customCss: ["./src/styles/custom.css"],
      lastUpdated: true,
      credits: false,
      disable404Route: true,
      favicon: "/favicon.svg",
      sidebar: [
        {
          label: "Get Started",
          autogenerate: { directory: "getting-started" },
        },
        {
          label: "Guides",
          autogenerate: { directory: "guides" },
        },
        {
          label: "Operations",
          autogenerate: { directory: "operations" },
        },
        {
          label: "Reference",
          autogenerate: { directory: "reference" },
        },
        {
          label: "Project",
          autogenerate: { directory: "project" },
        },
      ],
    }),
  ],
});
