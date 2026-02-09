/** Number of posts between in-feed ad placements */
export const FEED_AD_INTERVAL = 5;

/** Google AdSense client ID from environment */
export const ADSENSE_CLIENT_ID =
  process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || "";

/** Ad slot configuration */
export const AD_SLOTS = {
  /** In-feed ad shown between posts */
  feed: {
    slotId: "feed-ad",
    format: "fluid" as const,
    layout: "in-article" as const,
    style: { display: "block", textAlign: "center" as const },
  },
  /** Sidebar ad shown on desktop */
  sidebar: {
    slotId: "sidebar-ad",
    format: "auto" as const,
    style: { display: "block", minHeight: "250px" },
  },
  /** Ad shown on individual post pages */
  postPage: {
    slotId: "post-page-ad",
    format: "auto" as const,
    style: { display: "block", minHeight: "90px" },
  },
} as const;

export type AdSlotKey = keyof typeof AD_SLOTS;
