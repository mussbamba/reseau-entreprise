import type { MetadataRoute } from "next";
import { SHOP } from "@/lib/config";

// Rend le site installable (« Sur l'écran d'accueil » sur iPhone, « Installer l'application » sur Android)
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SHOP.name,
    short_name: "Saveurs",
    description: SHOP.tagline,
    lang: "fr-CA",
    start_url: "/",
    display: "standalone",
    background_color: "#eaeded",
    theme_color: "#82d8e3",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
