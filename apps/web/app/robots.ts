import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl =
    process.env.NEXT_PUBLIC_API_URL || "https://doggy-scheduler.com";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/auth/", "/invite/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
