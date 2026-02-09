"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils/cn";

interface RichTextContentProps {
  content: string;
  className?: string;
}

export function RichTextContent({ content, className }: RichTextContentProps) {
  const [sanitizedHtml, setSanitizedHtml] = useState<string>("");

  useEffect(() => {
    async function sanitize() {
      const DOMPurify = (await import("dompurify")).default;
      setSanitizedHtml(
        DOMPurify.sanitize(content, {
          ALLOWED_TAGS: [
            "p", "br", "strong", "em", "b", "i", "u", "s",
            "h1", "h2", "h3", "h4", "h5", "h6",
            "ul", "ol", "li",
            "blockquote", "pre", "code",
            "a", "span", "div",
          ],
          ALLOWED_ATTR: ["href", "target", "rel", "class"],
        })
      );
    }
    sanitize();
  }, [content]);

  return (
    <div
      className={cn(
        "prose prose-invert prose-sm max-w-none",
        "[&_a]:text-blue-400 [&_a]:underline",
        "[&_blockquote]:border-l-2 [&_blockquote]:border-surface-border [&_blockquote]:pl-4 [&_blockquote]:text-content-secondary",
        "[&_code]:bg-surface-hover [&_code]:rounded [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-sm",
        className
      )}
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
    />
  );
}
