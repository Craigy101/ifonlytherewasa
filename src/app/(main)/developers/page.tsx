import { createClient } from "@/lib/supabase/server";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import Link from "next/link";

export const revalidate = 60;

export default async function DevelopersPage() {
  const supabase = await createClient();

  const { data: developers } = await supabase
    .from("developer_profiles")
    .select(`
      id, bio, github_username,
      user:profiles!user_id(username, avatar_url),
      technologies:developer_technologies(technology:technologies(id, name))
    `)
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-content">Developer Directory</h1>
        <p className="text-sm text-content-muted mt-1">
          Developers looking to build solutions for real problems.
        </p>
      </div>

      {!developers || developers.length === 0 ? (
        <p className="text-content-muted text-center py-12">No developers yet.</p>
      ) : (
        <div className="space-y-4">
          {developers.map((dev) => {
            const user = dev.user as unknown as { username: string | null; avatar_url: string | null };
            const techs = ((dev.technologies || []) as Array<{ technology: { id: number; name: string } }>)
              .map((t) => t.technology)
              .filter(Boolean);

            return (
              <Card key={dev.id} className="p-4">
                <div className="flex items-start gap-3">
                  <Avatar username={user?.username || "Dev"} avatarUrl={user?.avatar_url ?? undefined} size="md" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-content">{user?.username || "Anonymous"}</span>
                      {dev.github_username && (
                        <Link
                          href={`https://github.com/${dev.github_username}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-content-muted hover:text-accent"
                        >
                          @{dev.github_username}
                        </Link>
                      )}
                    </div>
                    {dev.bio && (
                      <p className="text-sm text-content-secondary mt-1 line-clamp-2">{dev.bio}</p>
                    )}
                    {techs.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {techs.slice(0, 8).map((tech) => (
                          <Badge key={tech.id} color="#2A2A2A">{tech.name}</Badge>
                        ))}
                        {techs.length > 8 && (
                          <span className="text-xs text-content-muted self-center">+{techs.length - 8} more</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
