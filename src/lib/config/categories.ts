export interface CategoryConfig {
  id: number;
  name: string;
  slug: string;
  description: string;
  color: string;
}

export const CATEGORIES: CategoryConfig[] = [
  {
    id: 1,
    name: "Technology",
    slug: "technology",
    description: "Software, hardware, apps, and digital tools",
    color: "#3B82F6",
  },
  {
    id: 2,
    name: "Health",
    slug: "health",
    description: "Medical, wellness, fitness, and mental health",
    color: "#EF4444",
  },
  {
    id: 3,
    name: "Education",
    slug: "education",
    description: "Learning, teaching, courses, and academic tools",
    color: "#8B5CF6",
  },
  {
    id: 4,
    name: "Finance",
    slug: "finance",
    description: "Banking, investing, budgeting, and money management",
    color: "#22C55E",
  },
  {
    id: 5,
    name: "Home & Living",
    slug: "home-living",
    description: "Household, organization, cleaning, and home improvement",
    color: "#F59E0B",
  },
  {
    id: 6,
    name: "Transportation",
    slug: "transportation",
    description: "Commuting, vehicles, public transit, and travel",
    color: "#06B6D4",
  },
  {
    id: 7,
    name: "Food & Drink",
    slug: "food-drink",
    description: "Cooking, restaurants, groceries, and meal planning",
    color: "#F97316",
  },
  {
    id: 8,
    name: "Environment",
    slug: "environment",
    description: "Sustainability, recycling, energy, and conservation",
    color: "#10B981",
  },
  {
    id: 9,
    name: "Social",
    slug: "social",
    description: "Communication, community, relationships, and events",
    color: "#EC4899",
  },
  {
    id: 10,
    name: "Work & Productivity",
    slug: "work-productivity",
    description: "Workplace tools, project management, and career",
    color: "#6366F1",
  },
  {
    id: 11,
    name: "Entertainment",
    slug: "entertainment",
    description: "Gaming, media, hobbies, and leisure activities",
    color: "#A855F7",
  },
  {
    id: 12,
    name: "Other",
    slug: "other",
    description: "Everything else that doesn't fit neatly into a category",
    color: "#6B7280",
  },
];

/**
 * Get a category config by its slug.
 */
export function getCategoryBySlug(slug: string): CategoryConfig | undefined {
  return CATEGORIES.find((c) => c.slug === slug);
}

/**
 * Get a category config by its ID.
 */
export function getCategoryById(id: number): CategoryConfig | undefined {
  return CATEGORIES.find((c) => c.id === id);
}
