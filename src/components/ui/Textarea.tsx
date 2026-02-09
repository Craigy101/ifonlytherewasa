"use client";

import {
  type TextareaHTMLAttributes,
  forwardRef,
  useEffect,
  useRef,
  useCallback,
} from "react";
import { cn } from "@/lib/utils/cn";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
  label?: string;
  maxLength?: number;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ error, label, maxLength, className, id, value, onChange, ...props }, ref) => {
    const textareaId = id || label?.toLowerCase().replace(/\s+/g, "-");
    const internalRef = useRef<HTMLTextAreaElement | null>(null);

    const setRefs = useCallback(
      (node: HTMLTextAreaElement | null) => {
        internalRef.current = node;
        if (typeof ref === "function") {
          ref(node);
        } else if (ref) {
          (ref as React.MutableRefObject<HTMLTextAreaElement | null>).current = node;
        }
      },
      [ref]
    );

    const adjustHeight = useCallback(() => {
      const textarea = internalRef.current;
      if (textarea) {
        textarea.style.height = "auto";
        textarea.style.height = `${textarea.scrollHeight}px`;
      }
    }, []);

    useEffect(() => {
      adjustHeight();
    }, [value, adjustHeight]);

    const currentLength =
      typeof value === "string" ? value.length : 0;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={textareaId}
            className="mb-1.5 block text-sm font-medium text-content"
          >
            {label}
          </label>
        )}
        <textarea
          ref={setRefs}
          id={textareaId}
          value={value}
          onChange={(e) => {
            onChange?.(e);
            adjustHeight();
          }}
          maxLength={maxLength}
          className={cn(
            "w-full bg-surface-raised border border-surface-border text-content placeholder:text-content-muted rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50 transition-colors resize-none overflow-hidden",
            error && "border-red-500 focus:ring-red-500/50 focus:border-red-500/50",
            className
          )}
          {...props}
        />
        <div className="mt-1.5 flex items-center justify-between">
          {error ? (
            <p className="text-xs text-red-500">{error}</p>
          ) : (
            <span />
          )}
          {maxLength !== undefined && (
            <p
              className={cn(
                "text-xs text-content-muted",
                currentLength >= maxLength && "text-red-500"
              )}
            >
              {currentLength}/{maxLength}
            </p>
          )}
        </div>
      </div>
    );
  }
);

Textarea.displayName = "Textarea";

export { Textarea };
export type { TextareaProps };
