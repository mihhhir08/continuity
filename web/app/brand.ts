export const brand = {
  name: "Continuity",
  mark: "C",
  tagline: "Software that survives change.",
  description:
    "Predict what software changes will break, repair affected systems locally, and prove they are safe before release.",
  siteUrl:
    process.env.NEXT_PUBLIC_SITE_URL ??
    "https://continuity-change-infrastructure.mihhhir08.chatgpt.site",
} as const;

export const marketingRoutes = [
  "",
  "/pricing",
  "/docs",
  "/mcp",
  "/research",
  "/security",
  "/enterprise",
  "/changelog",
  "/open-source",
] as const;
