export const REACTIONS = [
  {
    type: "pay" as const,
    label: "I'd pay for that",
    icon: "💰",
    color: "reaction-pay",
  },
  {
    type: "nice" as const,
    label: "That would be nice",
    icon: "👍",
    color: "reaction-nice",
  },
  {
    type: "meh" as const,
    label: "Not really needed",
    icon: "🤷",
    color: "reaction-meh",
  },
  {
    type: "bad" as const,
    label: "Terrible idea",
    icon: "👎",
    color: "reaction-bad",
  },
] as const;

export type ReactionType = (typeof REACTIONS)[number]["type"];

/**
 * Get a reaction config by its type.
 */
export function getReactionByType(type: ReactionType) {
  return REACTIONS.find((r) => r.type === type);
}
