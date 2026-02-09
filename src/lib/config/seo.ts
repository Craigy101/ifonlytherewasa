export const seoConfig = {
  siteName: "If Only There Was A",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  defaultDescription:
    "Share your everyday frustrations and discover if others feel the same. Vote on pain points and inspire the next great solution.",
  defaultOgImage: "/og-default.png",
  twitterHandle: "@ifonlytherawasa",
} as const;

/**
 * Generate page-specific metadata.
 */
export function generatePageMeta({
  title,
  description,
  ogImage,
  path = "",
}: {
  title?: string;
  description?: string;
  ogImage?: string;
  path?: string;
}) {
  const fullTitle = title
    ? `${title} | ${seoConfig.siteName}`
    : seoConfig.siteName;
  const fullDescription = description || seoConfig.defaultDescription;
  const fullUrl = `${seoConfig.siteUrl}${path}`;
  const fullOgImage = ogImage || `${seoConfig.siteUrl}${seoConfig.defaultOgImage}`;

  return {
    title: fullTitle,
    description: fullDescription,
    openGraph: {
      title: fullTitle,
      description: fullDescription,
      url: fullUrl,
      siteName: seoConfig.siteName,
      images: [
        {
          url: fullOgImage,
          width: 1200,
          height: 630,
          alt: fullTitle,
        },
      ],
      type: "website" as const,
    },
    twitter: {
      card: "summary_large_image" as const,
      title: fullTitle,
      description: fullDescription,
      images: [fullOgImage],
    },
  };
}
