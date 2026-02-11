"use client";

import { useState, useRef, useEffect } from "react";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { searchTechnologies, addCustomTechnology } from "@/actions/developer-profiles";

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

interface Tech {
  id: number;
  name: string;
}

interface TechStackPickerProps {
  selectedTechs: Tech[];
  onChange: (techs: Tech[]) => void;
}

export function TechStackPicker({ selectedTechs, onChange }: TechStackPickerProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Array<{ id: number; name: string; slug: string }>>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (value: string) => {
    setQuery(value);
    setHighlightIndex(-1);
    if (timerRef.current) clearTimeout(timerRef.current);
    if (!value.trim()) {
      setResults([]);
      setIsOpen(false);
      return;
    }
    timerRef.current = setTimeout(async () => {
      setIsSearching(true);
      const data = await searchTechnologies(value);
      setResults(data.filter((t) => !selectedTechs.some((s) => s.id === t.id)));
      setIsOpen(true);
      setIsSearching(false);
    }, 300);
  };

  const addTech = (tech: Tech) => {
    if (selectedTechs.length >= 20) return;
    onChange([...selectedTechs, tech]);
    setQuery("");
    setResults([]);
    setIsOpen(false);
    setHighlightIndex(-1);
  };

  const removeTech = (id: number) => {
    onChange(selectedTechs.filter((t) => t.id !== id));
  };

  const handleAddCustom = async () => {
    if (!query.trim() || selectedTechs.length >= 20) return;
    const tech = await addCustomTechnology(query.trim());
    if (tech) addTech(tech);
  };

  const hasExactMatch = results.some(
    (r) => r.name.toLowerCase() === query.trim().toLowerCase()
  );
  const showCustomOption = query.trim() && !isSearching && !hasExactMatch;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (!isOpen || isSearching) return;

      if (highlightIndex >= 0 && highlightIndex < results.length) {
        addTech(results[highlightIndex]);
      } else if (results.length > 0 && highlightIndex === -1) {
        // No highlight - select first result
        addTech(results[0]);
      } else if (showCustomOption) {
        handleAddCustom();
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      const max = results.length + (showCustomOption ? 1 : 0);
      setHighlightIndex((prev) => (prev + 1) % max);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const max = results.length + (showCustomOption ? 1 : 0);
      setHighlightIndex((prev) => (prev - 1 + max) % max);
    } else if (e.key === "Escape") {
      setIsOpen(false);
      setHighlightIndex(-1);
    }
  };

  return (
    <div ref={containerRef} className="space-y-2">
      <div className="flex flex-wrap gap-1.5 min-h-[32px]">
        {selectedTechs.map((tech) => (
          <Badge key={tech.id} color={getFluoroColor(tech.name)} className="gap-1">
            {tech.name}
            <button type="button" onClick={() => removeTech(tech.id)} className="ml-1 text-content-muted hover:text-content">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </Badge>
        ))}
      </div>

      <div className="relative">
        <Input
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => query.trim() && results.length > 0 && setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Type a technology and press Enter to add..."
          className="w-full"
        />
        <p className="text-xs text-content-muted mt-1">
          Search existing technologies or type any name and press Enter to add a custom one.
        </p>
        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-surface-raised border border-surface-border rounded-lg shadow-lg max-h-48 overflow-y-auto">
            {isSearching ? (
              <div className="p-3 text-sm text-content-muted">Searching...</div>
            ) : (
              <>
                {results.map((tech, i) => (
                  <button
                    key={tech.id}
                    type="button"
                    onClick={() => addTech(tech)}
                    className={`w-full px-3 py-2 text-left text-sm text-content transition-colors ${
                      i === highlightIndex ? "bg-surface-border/70" : "hover:bg-surface-border/50"
                    }`}
                  >
                    {tech.name}
                  </button>
                ))}
                {showCustomOption && (
                  <button
                    type="button"
                    onClick={handleAddCustom}
                    className={`w-full px-3 py-2 text-left text-sm border-t border-surface-border transition-colors ${
                      highlightIndex === results.length ? "bg-surface-border/70" : "hover:bg-surface-border/50"
                    }`}
                  >
                    <span className="text-accent font-medium">+ Add &quot;{query.trim()}&quot;</span>
                    <span className="text-content-muted ml-1.5">as custom technology</span>
                  </button>
                )}
                {results.length === 0 && !showCustomOption && (
                  <div className="p-3 text-sm text-content-muted">No results found</div>
                )}
              </>
            )}
          </div>
        )}
      </div>
      {selectedTechs.length >= 20 && (
        <p className="text-xs text-amber-400">Maximum 20 technologies selected</p>
      )}
    </div>
  );
}
