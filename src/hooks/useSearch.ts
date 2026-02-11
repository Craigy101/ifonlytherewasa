"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import MiniSearch from "minisearch";
import { stemmer } from "stemmer";
import { createClient } from "@/lib/supabase/client";

// ---------------------
// Types
// ---------------------
export interface SearchResult {
  slug: string;
  title: string;
  body: string;
  current_solution?: string | null;
}

interface IndexDoc {
  id: string;
  title: string;
  slug: string;
  body: string;
  cs: string;
}

// ---------------------
// Stemmer-aware processTerm for MiniSearch
// ---------------------
const STOP_WORDS = new Set([
  "a","an","and","are","as","at","be","but","by","for","if",
  "in","into","is","it","no","not","of","on","or","such",
  "that","the","their","then","there","these","they","this",
  "to","was","will","with",
]);

function processTerm(term: string): string | null {
  const lower = term.toLowerCase();
  if (STOP_WORDS.has(lower)) return null;
  return stemmer(lower);
}

// ---------------------
// Module-level singleton: fetch index once, build MiniSearch once
// ---------------------
let indexPromise: Promise<MiniSearch<IndexDoc> | null> | null = null;

function getSearchIndex(): Promise<MiniSearch<IndexDoc> | null> {
  if (!indexPromise) {
    indexPromise = fetch("/api/search-index")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch search index");
        return res.json() as Promise<IndexDoc[]>;
      })
      .then((docs) => {
        const ms = new MiniSearch<IndexDoc>({
          fields: ["title", "body", "cs"],
          storeFields: ["title", "slug", "body", "cs"],
          processTerm,
          searchOptions: {
            prefix: true,
            fuzzy: 0.2,
            boost: { title: 3, body: 2, cs: 1 },
          },
        });
        return ms.addAllAsync(docs).then(() => ms);
      })
      .catch(() => {
        indexPromise = null; // allow retry on failure
        return null;
      });
  }
  return indexPromise;
}

// Warm the index on idle after page load
if (typeof window !== "undefined") {
  const warm = () => getSearchIndex();
  if ("requestIdleCallback" in window) {
    window.requestIdleCallback(warm);
  } else {
    setTimeout(warm, 200);
  }
}

// ---------------------
// Hook
// ---------------------
export function useSearch() {
  const [query, setQuery] = useState("");
  const [localResults, setLocalResults] = useState<SearchResult[]>([]);
  const [serverResults, setServerResults] = useState<SearchResult[]>([]);
  const [serverLoading, setServerLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const serverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // --- Phase 1: Client-side search (instant, every keystroke) ---
  useEffect(() => {
    if (query.length < 2) {
      setLocalResults([]);
      return;
    }

    let cancelled = false;

    getSearchIndex().then((ms) => {
      if (cancelled || !ms) return;
      const hits = ms.search(query);
      setLocalResults(
        hits.slice(0, 6).map((h) => ({
          slug: h.slug as string,
          title: h.title as string,
          body: (h.body as string) || "",
          current_solution: (h.cs as string) || null,
        }))
      );
    });

    return () => {
      cancelled = true;
    };
  }, [query]);

  // --- Phase 2: Server search (debounced, for body matches + ranking) ---
  useEffect(() => {
    if (serverTimeoutRef.current) clearTimeout(serverTimeoutRef.current);

    if (query.length < 2) {
      setServerResults([]);
      setServerLoading(false);
      return;
    }

    setServerLoading(true);

    serverTimeoutRef.current = setTimeout(async () => {
      try {
        const supabase = createClient();
        const { data, error } = await supabase.rpc("search_posts", {
          search_query: query,
          result_limit: 6,
        });

        if (!error && data) {
          setServerResults(
            (data as Array<{
              slug: string;
              title: string;
              body: string;
              current_solution?: string | null;
            }>).map((r) => ({
              slug: r.slug,
              title: r.title,
              body: r.body ?? "",
              current_solution: r.current_solution ?? null,
            }))
          );
        }
      } catch {
        // network error or aborted
      } finally {
        setServerLoading(false);
      }
    }, 250);

    return () => {
      if (serverTimeoutRef.current) clearTimeout(serverTimeoutRef.current);
    };
  }, [query]);

  // --- Merge & dedupe: server results first (better ranking + body), then local ---
  const results = useMemo(() => {
    const seen = new Set<string>();
    const merged: SearchResult[] = [];

    for (const r of serverResults) {
      if (!seen.has(r.slug)) {
        seen.add(r.slug);
        merged.push(r);
      }
    }
    for (const r of localResults) {
      if (!seen.has(r.slug)) {
        seen.add(r.slug);
        merged.push(r);
      }
    }
    return merged.slice(0, 6);
  }, [localResults, serverResults]);

  // Show loading only when server is fetching AND we have no local results yet
  const isLoading = serverLoading && localResults.length === 0;

  // Cleanup
  useEffect(() => {
    return () => {
      if (serverTimeoutRef.current) clearTimeout(serverTimeoutRef.current);
    };
  }, []);

  return {
    query,
    setQuery,
    results,
    isLoading,
    isOpen,
    setIsOpen,
  };
}
