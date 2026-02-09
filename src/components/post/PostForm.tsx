"use client";

import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils/cn";
import { RichTextEditor } from "@/components/post/RichTextEditor";
import { Button, Input, Badge } from "@/components/ui";
import { CATEGORIES } from "@/lib/config/categories";
import { PRODUCT_TYPES } from "@/lib/config/product-types";
import { TIME_SPENT_OPTIONS, createPostSchema } from "@/lib/validators/post";
import type { ZodError } from "zod";

const STORAGE_KEY = "iotwa_draft_post";

interface PostFormData {
  title: string;
  body: string;
  category_ids: number[];
  product_type: string | null;
  weekly_pay_usd: number | null;
  time_spent_weekly: string | null;
  current_solution: string | null;
}

interface PostFormProps {
  initialData?: Partial<PostFormData>;
  onSubmit: (data: PostFormData) => Promise<void>;
  isEditing?: boolean;
  requireAuth?: boolean;
  onAuthRequired?: () => void;
}

function loadDraft(): Partial<PostFormData> | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function saveDraft(data: PostFormData) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch { /* storage full or unavailable */ }
}

export function clearDraft() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch { /* ignore */ }
}

export function PostForm({ initialData, onSubmit, isEditing = false, requireAuth = false, onAuthRequired }: PostFormProps) {
  const [title, setTitle] = useState(initialData?.title ?? "");
  const [body, setBody] = useState(initialData?.body ?? "");
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>(
    initialData?.category_ids ?? []
  );
  const [productType, setProductType] = useState<string | null>(initialData?.product_type ?? null);
  const [weeklyPayUsd, setWeeklyPayUsd] = useState<number | null>(initialData?.weekly_pay_usd ?? null);
  const [timeSpentWeekly, setTimeSpentWeekly] = useState<string | null>(initialData?.time_spent_weekly ?? null);
  const [currentSolution, setCurrentSolution] = useState<string | null>(initialData?.current_solution ?? null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const draftLoaded = useRef(false);

  // Load draft from localStorage on mount (only for new posts)
  useEffect(() => {
    if (isEditing || draftLoaded.current) return;
    draftLoaded.current = true;
    const draft = loadDraft();
    if (draft) {
      if (draft.title) setTitle(draft.title);
      if (draft.body) setBody(draft.body);
      if (draft.category_ids) setSelectedCategoryIds(draft.category_ids);
      if (draft.product_type !== undefined) setProductType(draft.product_type);
      if (draft.weekly_pay_usd !== undefined) setWeeklyPayUsd(draft.weekly_pay_usd);
      if (draft.time_spent_weekly !== undefined) setTimeSpentWeekly(draft.time_spent_weekly);
      if (draft.current_solution !== undefined) setCurrentSolution(draft.current_solution);
    }
  }, [isEditing]);

  // Auto-save draft on changes (debounced)
  useEffect(() => {
    if (isEditing) return;
    const timeout = setTimeout(() => {
      saveDraft({
        title, body, category_ids: selectedCategoryIds,
        product_type: productType,
        weekly_pay_usd: weeklyPayUsd,
        time_spent_weekly: timeSpentWeekly,
        current_solution: currentSolution,
      });
    }, 500);
    return () => clearTimeout(timeout);
  }, [title, body, selectedCategoryIds, productType, weeklyPayUsd, timeSpentWeekly, currentSolution, isEditing]);

  const toggleCategory = (id: number) => {
    setSelectedCategoryIds((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
    if (errors.category_ids) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.category_ids;
        return next;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // If not authenticated and auth is required, show login popup
    if (requireAuth && onAuthRequired) {
      onAuthRequired();
      return;
    }

    setErrors({});

    try {
      const parsed = createPostSchema.parse({
        title,
        body,
        category_ids: selectedCategoryIds,
        product_type: productType,
        weekly_pay_usd: weeklyPayUsd,
        time_spent_weekly: timeSpentWeekly,
        current_solution: currentSolution,
      });

      setIsSubmitting(true);
      await onSubmit({
        ...parsed,
        product_type: parsed.product_type ?? null,
        weekly_pay_usd: parsed.weekly_pay_usd ?? null,
        time_spent_weekly: parsed.time_spent_weekly ?? null,
        current_solution: parsed.current_solution ?? null,
      });
      clearDraft();
    } catch (err) {
      if ((err as ZodError).issues) {
        const zodError = err as ZodError;
        const fieldErrors: Record<string, string> = {};
        for (const issue of zodError.issues) {
          const field = issue.path[0] as string;
          if (!fieldErrors[field]) {
            fieldErrors[field] = issue.message;
          }
        }
        setErrors(fieldErrors);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const titleLength = title.length;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title */}
      <div>
        <p className="text-content-muted text-lg italic mb-1">If only there was a...</p>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="...a tool that does X"
          className="text-xl"
        />
        <div className="flex items-center justify-between mt-1.5">
          {errors.title && (
            <p className="text-red-400 text-sm">{errors.title}</p>
          )}
          <p
            className={cn(
              "text-xs ml-auto",
              titleLength < 10 || titleLength > 300
                ? "text-red-400"
                : "text-content-muted"
            )}
          >
            {titleLength}/300
          </p>
        </div>
      </div>

      {/* Body */}
      <div>
        <RichTextEditor
          content={body}
          onChange={setBody}
          placeholder="Describe the problem in detail..."
        />
        {errors.body && (
          <p className="text-red-400 text-sm mt-1.5">{errors.body}</p>
        )}
      </div>

      {/* Pain Point Fields */}
      <div className="space-y-4 p-4 rounded-lg border border-surface-border bg-surface-raised/50">
        <p className="text-sm font-medium text-content-secondary">Help developers understand the pain</p>

        {/* Weekly Pay */}
        <div>
          <label className="block text-sm text-content-secondary mb-1.5">
            How much would you pay per week for a solution? <span className="text-content-muted">(USD)</span>
          </label>
          <div className="relative w-full max-w-[200px]">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-content-muted text-sm">$</span>
            <input
              type="number"
              min="1"
              max="10000"
              value={weeklyPayUsd ?? ""}
              onChange={(e) => setWeeklyPayUsd(e.target.value ? parseInt(e.target.value, 10) : null)}
              placeholder="0"
              className={cn(
                "w-full bg-surface-raised border border-surface-border text-content placeholder:text-content-muted rounded-lg pl-7 pr-12 py-2 text-sm",
                "focus:outline-none focus:ring-2 focus:ring-accent/50 transition-colors"
              )}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-content-muted text-sm">/wk</span>
          </div>
          {errors.weekly_pay_usd && (
            <p className="text-red-400 text-xs mt-1">{errors.weekly_pay_usd}</p>
          )}
        </div>

        {/* Time Spent */}
        <div>
          <label className="block text-sm text-content-secondary mb-1.5">
            How much time do you spend on this problem weekly?
          </label>
          <div className="flex flex-wrap gap-2">
            {TIME_SPENT_OPTIONS.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setTimeSpentWeekly(timeSpentWeekly === option ? null : option)}
              >
                <Badge
                  color={timeSpentWeekly === option ? "#FFFFFF" : undefined}
                  className={cn(
                    "cursor-pointer transition-all",
                    timeSpentWeekly === option
                      ? "ring-1 ring-offset-1 ring-offset-surface"
                      : "opacity-50 hover:opacity-75"
                  )}
                >
                  {option}
                </Badge>
              </button>
            ))}
          </div>
        </div>

        {/* Current Solution */}
        <div>
          <label className="block text-sm text-content-secondary mb-1.5">
            How do you currently solve this problem?
          </label>
          <textarea
            value={currentSolution ?? ""}
            onChange={(e) => setCurrentSolution(e.target.value || null)}
            placeholder="e.g., I manually do X, or I use Y which is slow..."
            rows={2}
            maxLength={1000}
            className={cn(
              "w-full bg-surface-raised border border-surface-border text-content placeholder:text-content-muted rounded-lg px-4 py-2 text-sm",
              "focus:outline-none focus:ring-2 focus:ring-accent/50 transition-colors resize-none"
            )}
          />
          {errors.current_solution && (
            <p className="text-red-400 text-xs mt-1">{errors.current_solution}</p>
          )}
        </div>
      </div>

      {/* Categories */}
      <div>
        <label className="block text-sm font-medium text-content-secondary mb-2">
          Categories <span className="text-content-muted">(select at least 1)</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {CATEGORIES.map((category) => {
            const isSelected = selectedCategoryIds.includes(category.id);
            return (
              <button
                key={category.id}
                type="button"
                onClick={() => toggleCategory(category.id)}
                className="text-left"
              >
                <Badge
                  color={isSelected ? category.color : undefined}
                  className={cn(
                    "w-full justify-center cursor-pointer transition-all",
                    isSelected
                      ? "ring-1 ring-offset-1 ring-offset-surface"
                      : "opacity-50 hover:opacity-75"
                  )}
                >
                  {category.name}
                </Badge>
              </button>
            );
          })}
        </div>
        {errors.category_ids && (
          <p className="text-red-400 text-sm mt-1.5">{errors.category_ids}</p>
        )}
      </div>

      {/* Product Type */}
      <div>
        <label className="block text-sm font-medium text-content-secondary mb-2">
          Product Type <span className="text-content-muted">(optional)</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {PRODUCT_TYPES.map((pt) => (
            <button
              key={pt.value}
              type="button"
              onClick={() => setProductType(productType === pt.value ? null : pt.value)}
            >
              <Badge
                color={productType === pt.value ? "#FFFFFF" : undefined}
                className={cn(
                  "cursor-pointer transition-all",
                  productType === pt.value
                    ? "ring-1 ring-offset-1 ring-offset-surface"
                    : "opacity-50 hover:opacity-75"
                )}
              >
                {pt.label}
              </Badge>
            </button>
          ))}
        </div>
      </div>

      {/* Submit */}
      <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
        {isSubmitting
          ? isEditing
            ? "Saving..."
            : "Posting..."
          : isEditing
            ? "Save Changes"
            : "Post Idea"}
      </Button>
    </form>
  );
}
