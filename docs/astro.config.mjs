import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";

const repositoryUrl = "https://github.com/landelatech/mpesa-node";
const siteUrl = "https://pesakit.landelatech.com";

export default defineConfig({
  site: siteUrl,
  integrations: [
    starlight({
      title: "PesaKit",
      description:
        "PesaKit is the Node.js toolkit and field guide for Safaricom M-Pesa Daraja APIs.",
      tagline:
        "Build and operate M-Pesa flows from Node.js with less plumbing and more confidence.",
      logo: {
        src: "./src/assets/pesakit-mark.svg",
        alt: "PesaKit",
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
