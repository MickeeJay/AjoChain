import type { MetadataRoute } from "next";
import icon192 from "./assets/android-chrome-192x192.png";
import icon512 from "./assets/android-chrome-512x512.png";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "AjoChain",
    short_name: "AjoChain",
    description: "Save money together with your community. AjoChain keeps group savings safe with automatic rules.",
    start_url: "/",
    scope: "/",
    icons: [
      {
        src: icon192.src,
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: icon512.src,
        sizes: "512x512",
        type: "image/png",
      },
    ],
    theme_color: "#07955f",
    background_color: "#f8fffb",
    display: "standalone",
    orientation: "portrait",
  };
}
