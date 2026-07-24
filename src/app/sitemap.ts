import type { MetadataRoute } from "next";

const SITE_URL = "https://lrtcity.lixionary.com";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE_URL,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/resources`,
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];
}
