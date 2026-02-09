"use client";

import { useState, useCallback } from "react";
import { cn } from "@/lib/utils/cn";

interface ShareButtonProps {
  slug: string;
}

export function ShareButton({ slug }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleClick = useCallback(async () => {
    const url = `${window.location.origin}/post/${slug}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: create a temporary input
      const input = document.createElement("input");
      input.value = url;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [slug]);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={handleClick}
        title="Copy link"
        className={cn(
          "p-2 rounded-lg text-content-muted hover:text-content hover:bg-surface-hover transition-colors"
        )}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M8 11a3.5 3.5 0 0 0 5 0l2.5-2.5a3.5 3.5 0 0 0-5-5L9 4.75" />
          <path d="M12 9a3.5 3.5 0 0 0-5 0L4.5 11.5a3.5 3.5 0 0 0 5 5L11 15.25" />
        </svg>
      </button>
      {copied && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 rounded bg-surface-overlay text-content text-xs whitespace-nowrap shadow-lg border border-surface-border">
          Copied!
        </div>
      )}
    </div>
  );
}
