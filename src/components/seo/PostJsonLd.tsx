import { JsonLd } from "@/components/seo/JsonLd";

interface PostJsonLdProps {
  post: {
    title: string;
    body: string;
    author_username: string;
    created_at: string;
    updated_at: string;
    comment_count: number;
    reaction_count: number;
  };
}

export function PostJsonLd({ post }: PostJsonLdProps) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const data = {
    "@context": "https://schema.org",
    "@type": "DiscussionForumPosting",
    headline: post.title,
    text: post.body,
    author: {
      "@type": "Person",
      name: post.author_username,
    },
    datePublished: post.created_at,
    dateModified: post.updated_at,
    interactionStatistic: [
      {
        "@type": "InteractionCounter",
        interactionType: "https://schema.org/CommentAction",
        userInteractionCount: post.comment_count,
      },
      {
        "@type": "InteractionCounter",
        interactionType: "https://schema.org/LikeAction",
        userInteractionCount: post.reaction_count,
      },
    ],
    publisher: {
      "@type": "Organization",
      name: "If Only There Was A",
      url: baseUrl,
    },
  };

  return <JsonLd data={data} />;
}
