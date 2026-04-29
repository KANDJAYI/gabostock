import type { MetadataRoute } from "next";

/** Même fichier que le favicon (`public/logogabostock.png`) — installation PWA. */
const ICON = "/logogabostock.png";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Gabostock",
    short_name: "Gabostock",
    description: "Gestion de stock et ventes — mode hors ligne",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#EBE4D9",
    theme_color: "#0066ff",
    orientation: "portrait-primary",
    lang: "fr",
    icons: [
      {
        src: ICON,
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: ICON,
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: ICON,
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
