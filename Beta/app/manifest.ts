import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "EntrenaMos",
    short_name: "EntrenaMos",
    description: "Plataforma para entrenadores y alumnos: rutinas, seguimiento y agenda en un solo lugar.",
    start_url: "/",
    display: "standalone",
    background_color: "#f8fafc",
    theme_color: "#1A365D",
    icons: [
      { src: "/pwa/icon?size=192", sizes: "192x192", type: "image/png" },
      { src: "/pwa/icon?size=512", sizes: "512x512", type: "image/png" },
      { src: "/pwa/icon?size=512", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
