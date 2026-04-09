import { fileURLToPath } from "node:url";

import partytown from "@astrojs/partytown";
import starlight from "@astrojs/starlight";
import mermaid from "astro-mermaid";
import { defineConfig } from "astro/config";
import starlightLinksValidator from "starlight-links-validator";
import { createStarlightTypeDocPlugin } from "starlight-typedoc";

const repositoryUrl = "https://github.com/landelatech/pesakit";
const siteUrl = "https://pesakit.landelatech.com";
const googleAnalyticsId = process.env.PUBLIC_GA_MEASUREMENT_ID;
const [starlightTypeDoc, apiSidebarGroup] = createStarlightTypeDocPlugin();

const googleAnalyticsHead = googleAnalyticsId
  ? [
      {
        tag: "script",
        attrs: {
          async: true,
          src: `https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsId}`,
          type: "text/partytown",
        },
      },
      {
        tag: "script",
        attrs: {
          type: "text/partytown",
        },
        content: `
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag("js", new Date());
gtag("config", "${googleAnalyticsId}");
        `.trim(),
      },
    ]
  : [];

export default defineConfig({
  site: siteUrl,
  integrations: [
    mermaid({
      theme: "forest",
      autoTheme: true,
      mermaidConfig: {
        flowchart: {
          curve: "linear",
        },
        sequence: {
          showSequenceNumbers: true,
        },
      },
    }),
    ...(googleAnalyticsId
      ? [
          partytown({
            config: {
              forward: ["dataLayer.push"],
            },
          }),
        ]
      : []),
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
      head: googleAnalyticsHead,
      customCss: ["./src/styles/custom.css"],
      lastUpdated: true,
      credits: false,
      disable404Route: true,
      favicon: "/favicon.svg",
      plugins: [
        starlightLinksValidator(),
        starlightTypeDoc({
          entryPoints: [fileURLToPath(new URL("../src/index.ts", import.meta.url))],
          output: "sdk-api",
          pagination: true,
          sidebar: {
            collapsed: true,
            label: "SDK API",
          },
          tsconfig: fileURLToPath(new URL("../tsconfig.json", import.meta.url)),
        }),
      ],
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
          items: [
            {
              label: "Reference Guides",
              autogenerate: { directory: "reference" },
            },
            apiSidebarGroup,
          ],
        },
        {
          label: "Project",
          autogenerate: { directory: "project" },
        },
      ],
    }),
  ],
});
