import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_BASE_URL ?? "https://barrierfree-localroute-busan.vercel.app";
  const now = new Date();
  return ["/", "/routes", "/local", "/admin", "/about"].map((path) => ({
    url: base + path,
    lastModified: now,
    changeFrequency: "weekly",
    priority: path === "/" ? 1 : 0.7,
  }));
}
