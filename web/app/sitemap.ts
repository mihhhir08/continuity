import type { MetadataRoute } from "next";
import { brand, marketingRoutes } from "./brand";

export default function sitemap(): MetadataRoute.Sitemap {
  return marketingRoutes.map((route) => ({
    url: new URL(route || "/", brand.siteUrl).toString(),
    lastModified: new Date("2026-07-23"),
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : .7,
  }));
}
