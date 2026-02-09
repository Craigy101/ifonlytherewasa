"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { SearchBar } from "@/components/search/SearchBar";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { Button, DropdownItem } from "@/components/ui";
import { cn } from "@/lib/utils/cn";

export function Navbar() {
  const { user, signOut } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-30 bg-surface/80 backdrop-blur-md border-b border-surface-border h-14 sm:h-16">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 flex items-center h-full gap-2 sm:gap-4">
        {/* Left - Logo */}
        <Link href="/" className="shrink-0">
          <span className="text-sm sm:text-base text-content font-bold tracking-tight whitespace-nowrap">
            If Only There Was A...
          </span>
        </Link>

        {/* Center - Search (dead center on desktop) */}
        <div className="hidden md:flex flex-1 justify-center">
          <div className="w-full max-w-md">
            <SearchBar />
          </div>
        </div>

        {/* Right - Nav links + Auth */}
        <div className="flex items-center gap-2 sm:gap-3 ml-auto">
          {/* Mobile search toggle */}
          <button
            type="button"
            onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
            className="md:hidden p-2 rounded-lg text-content-muted hover:text-content hover:bg-surface-hover transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
          </button>

          {/* For Developers link */}
          <Link
            href="/developers"
            className="hidden sm:block text-sm font-medium text-content hover:text-accent transition-colors whitespace-nowrap"
          >
            For Developers
          </Link>

          {user ? (
            <>
              <NotificationBell />
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen((prev) => !prev)}
                  className={cn(
                    "flex items-center gap-2 rounded-full px-1.5 sm:px-2 py-1",
                    "hover:bg-surface-hover transition-colors"
                  )}
                >
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-surface-raised flex items-center justify-center text-sm font-medium text-content-secondary border border-surface-border">
                    {user.email?.charAt(0).toUpperCase() ?? "U"}
                  </div>
                </button>
                {dropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-surface-overlay border border-surface-border rounded-lg shadow-lg py-1 z-40">
                    <div className="px-3 py-2 border-b border-surface-border">
                      <p className="text-sm font-medium text-content truncate">
                        {user.user_metadata?.username ?? user.email}
                      </p>
                      <p className="text-xs text-content-muted truncate">
                        {user.email}
                      </p>
                    </div>
                    <Link href="/profile" onClick={() => setDropdownOpen(false)}>
                      <DropdownItem>Profile</DropdownItem>
                    </Link>
                    <Link href="/profile/developer" onClick={() => setDropdownOpen(false)}>
                      <DropdownItem>Developer</DropdownItem>
                    </Link>
                    <Link href="/developers" onClick={() => setDropdownOpen(false)} className="sm:hidden">
                      <DropdownItem>For Developers</DropdownItem>
                    </Link>
                    <Link href="/profile/settings" onClick={() => setDropdownOpen(false)}>
                      <DropdownItem>Settings</DropdownItem>
                    </Link>
                    <DropdownItem
                      onClick={() => {
                        setDropdownOpen(false);
                        signOut();
                      }}
                      className="text-red-400"
                    >
                      Sign Out
                    </DropdownItem>
                  </div>
                )}
              </div>
            </>
          ) : (
            <Link href="/login">
              <Button variant="primary" size="sm">
                Sign In
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Mobile search dropdown */}
      {mobileSearchOpen && (
        <div className="md:hidden px-3 pb-3 bg-surface/95 backdrop-blur-md border-b border-surface-border">
          <SearchBar />
        </div>
      )}
    </header>
  );
}
