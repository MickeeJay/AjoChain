import type { MetadataRoute } from "next";
import icon192 from "./assets/android-chrome-192x192.png";
import icon512 from "./assets/android-chrome-512x512.png";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "AjoChain",
    short_name: "AjoChain",
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
    theme_color: "#ffffff",
    background_color: "#ffffff",
    display: "standalone",
  };
}
