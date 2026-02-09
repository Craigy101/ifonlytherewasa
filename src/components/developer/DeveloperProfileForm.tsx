"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { TechStackPicker } from "./TechStackPicker";

interface DeveloperProfileFormProps {
  initialData?: {
    bio: string;
    github_username: string;
    technologies: Array<{ id: number; name: string }>;
  };
  onSubmit: (data: {
    bio?: string;
    github_username?: string;
    technology_ids: number[];
  }) => Promise<void>;
  onCancel?: () => void;
}

export function DeveloperProfileForm({ initialData, onSubmit, onCancel }: DeveloperProfileFormProps) {
  const [bio, setBio] = useState(initialData?.bio ?? "");
  const [githubUsername, setGithubUsername] = useState(initialData?.github_username ?? "");
  const [techs, setTechs] = useState<Array<{ id: number; name: string }>>(initialData?.technologies ?? []);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await onSubmit({
        bio: bio || undefined,
        github_username: githubUsername || undefined,
        technology_ids: techs.map((t) => t.id),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card className="p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-content-secondary mb-2">Bio</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Tell us about yourself and what you build..."
            maxLength={1000}
            rows={4}
            className="w-full rounded-lg border border-surface-border bg-surface px-3 py-2 text-sm text-content placeholder:text-content-muted focus:outline-none focus:ring-1 focus:ring-accent resize-none"
          />
          <p className="text-xs text-content-muted mt-1">{bio.length}/1000</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-content-secondary mb-2">GitHub Username</label>
          <Input
            value={githubUsername}
            onChange={(e) => setGithubUsername(e.target.value)}
            placeholder="your-github-username"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-content-secondary mb-2">Tech Stack</label>
          <TechStackPicker selectedTechs={techs} onChange={setTechs} />
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <div className="flex gap-3">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : initialData ? "Update Profile" : "Create Developer Profile"}
          </Button>
          {onCancel && (
            <Button type="button" variant="ghost" onClick={onCancel} disabled={isSubmitting}>
              Cancel
            </Button>
          )}
        </div>
      </Card>
    </form>
  );
}
