"use client";

import {
  type ReactNode,
  useState,
  useRef,
  useEffect,
  useCallback,
} from "react";
import { cn } from "@/lib/utils/cn";

interface DropdownProps {
  trigger: ReactNode;
  children: ReactNode;
  align?: "left" | "right";
  className?: string;
}

function Dropdown({
  trigger,
  children,
  align = "left",
  className,
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (
      containerRef.current &&
      !containerRef.current.contains(e.target as Node)
    ) {
      setIsOpen(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, handleClickOutside]);

  return (
    <div ref={containerRef} className="relative inline-block">
      <div
        onClick={() => setIsOpen((prev) => !prev)}
        className="cursor-pointer"
      >
        {trigger}
      </div>

      {isOpen && (
        <div
          className={cn(
            "absolute top-full mt-1 bg-surface-overlay border border-surface-border rounded-lg shadow-lg py-1 min-w-[160px] z-40",
            align === "right" ? "right-0" : "left-0",
            className
          )}
          onClick={() => setIsOpen(false)}
        >
          {children}
        </div>
      )}
    </div>
  );
}

interface DropdownItemProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  destructive?: boolean;
}

function DropdownItem({
  children,
  onClick,
  className,
  destructive,
}: DropdownItemProps) {
  return (
    <div
      role="menuitem"
      onClick={onClick}
      className={cn(
        "px-4 py-2 text-sm text-content hover:bg-surface-hover cursor-pointer flex items-center gap-2 transition-colors",
        destructive && "text-red-500 hover:text-red-400",
        className
      )}
    >
      {children}
    </div>
  );
}

export { Dropdown, DropdownItem };
export type { DropdownProps, DropdownItemProps };
