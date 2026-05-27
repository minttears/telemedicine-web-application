import type { MetadataRoute } from "next";

const appUrl = process.env.APP_URL ?? "http://localhost:3000";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    "",
    "/doctors",
    "/about",
    "/contacts",
    "/privacy",
    "/terms",
  ].map((path) => ({
    url: `${appUrl}${path}`,
    lastModified: new Date(),
  }));
}
