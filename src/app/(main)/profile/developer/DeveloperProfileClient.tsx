"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DeveloperProfileForm } from "@/components/developer/DeveloperProfileForm";
import { DeveloperProfileView } from "@/components/developer/DeveloperProfileView";
import { createDeveloperProfile, updateDeveloperProfile } from "@/actions/developer-profiles";

interface DeveloperProfileClientProps {
  hasProfile: boolean;
  initialData?: {
    bio: string;
    github_username: string;
    technologies: Array<{ id: number; name: string }>;
  };
}

export function DeveloperProfileClient({ hasProfile, initialData }: DeveloperProfileClientProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(!hasProfile);

  const handleSubmit = async (data: {
    bio?: string;
    github_username?: string;
    technology_ids: number[];
  }) => {
    if (hasProfile) {
      await updateDeveloperProfile(data);
    } else {
      await createDeveloperProfile(data);
    }
    setIsEditing(false);
    router.refresh();
  };

  if (!isEditing && hasProfile && initialData) {
    return (
      <DeveloperProfileView
        bio={initialData.bio}
        githubUsername={initialData.github_username}
        technologies={initialData.technologies}
        onEdit={() => setIsEditing(true)}
      />
    );
  }

  return (
    <DeveloperProfileForm
      initialData={initialData}
      onSubmit={handleSubmit}
      onCancel={hasProfile ? () => setIsEditing(false) : undefined}
    />
  );
}
