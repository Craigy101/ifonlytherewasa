"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

const FLUORO_COLORS = [
  "#39FF14", // neon green
  "#FF6EC7", // hot pink
  "#00FFFF", // cyan
  "#FFFF00", // yellow
  "#FF9F1C", // neon orange
  "#7DF9FF", // electric blue
  "#FF44CC", // magenta
  "#ADFF2F", // green-yellow
  "#00FF7F", // spring green
  "#FF073A", // neon red
];

function getFluoroColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return FLUORO_COLORS[Math.abs(hash) % FLUORO_COLORS.length];
}

interface DeveloperProfileViewProps {
  bio: string;
  githubUsername: string;
  technologies: Array<{ id: number; name: string }>;
  onEdit: () => void;
}

export function DeveloperProfileView({ bio, githubUsername, technologies, onEdit }: DeveloperProfileViewProps) {
  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-content">Your Profile</h2>
        <Button variant="secondary" size="sm" onClick={onEdit}>
          Edit
        </Button>
      </div>

      {bio && (
        <div>
          <p className="text-xs font-medium text-content-muted uppercase tracking-wide mb-1">Bio</p>
          <p className="text-sm text-content-secondary whitespace-pre-wrap">{bio}</p>
        </div>
      )}

      {githubUsername && (
        <div>
          <p className="text-xs font-medium text-content-muted uppercase tracking-wide mb-1">GitHub</p>
          <a
            href={`https://github.com/${githubUsername}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-accent hover:underline"
          >
            {githubUsername}
          </a>
        </div>
      )}

      {technologies.length > 0 && (
        <div>
          <p className="text-xs font-medium text-content-muted uppercase tracking-wide mb-2">Tech Stack</p>
          <div className="flex flex-wrap gap-1.5">
            {technologies.map((tech) => (
              <Badge key={tech.id} color={getFluoroColor(tech.name)}>{tech.name}</Badge>
            ))}
          </div>
        </div>
      )}

      {!bio && !githubUsername && technologies.length === 0 && (
        <p className="text-sm text-content-muted">
          Your profile is empty. Click Edit to add your details.
        </p>
      )}
    </Card>
  );
}
