"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { cn } from "@/lib/utils/cn";

interface MobileNavProps {
  className?: string;
}

const tabs = [
  {
    label: "Home",
    href: "/",
    requiresAuth: false,
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" />
        <path d="M9 21V12h6v9" />
      </svg>
    ),
  },
  {
    label: "Search",
    href: "/search",
    requiresAuth: false,
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" />
        <path d="M21 21l-4.35-4.35" />
      </svg>
    ),
  },
  {
    label: "New Post",
    href: "/post/new",
    requiresAuth: true,
    special: true,
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 8v8M8 12h8" />
      </svg>
    ),
  },
  {
    label: "Notifications",
    href: "/notifications",
    requiresAuth: true,
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 106 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 01-3.46 0" />
      </svg>
    ),
  },
  {
    label: "Profile",
    href: "/profile",
    requiresAuth: true,
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
];

export function MobileNav({ className }: MobileNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();

  function handleTabClick(e: React.MouseEvent, tab: (typeof tabs)[number]) {
    if (tab.requiresAuth && !user) {
      e.preventDefault();
      router.push("/login");
    }
  }

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  return (
    <nav
      className={cn(
        "fixed bottom-0 left-0 right-0 z-30 bg-surface/90 backdrop-blur-md border-t border-surface-border",
        className
      )}
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex">
        {tabs.map((tab) => {
          const active = isActive(tab.href);

          return (
            <Link
              key={tab.label}
              href={tab.href}
              onClick={(e) => handleTabClick(e, tab)}
              className={cn(
                "flex-1 flex flex-col items-center justify-center py-2 gap-1 transition-colors",
                active ? "text-accent" : "text-content-muted"
              )}
            >
              {tab.special ? (
                <span className="rounded-full bg-accent text-content-inverse p-1">
                  {tab.icon}
                </span>
              ) : (
                tab.icon
              )}
              <span className="text-[10px] leading-none">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
