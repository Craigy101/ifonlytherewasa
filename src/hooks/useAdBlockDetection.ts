"use client";

import { useEffect, useState, useCallback } from "react";

const STORAGE_KEY = "ad_block_dismissed";
const DISMISS_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

export function useAdBlockDetection() {
  const [isBlocked, setIsBlocked] = useState(false);
  const [dismissed, setDismissed] = useState(true); // default true to prevent flash

  useEffect(() => {
    // Check localStorage for recent dismissal
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const timestamp = parseInt(stored, 10);
        if (Date.now() - timestamp < DISMISS_DURATION_MS) {
          setDismissed(true);
          return;
        }
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      // localStorage unavailable
    }

    setDismissed(false);

    // Create bait element
    const bait = document.createElement("div");
    bait.className = "adsbox ad-banner";
    bait.style.height = "1px";
    bait.style.position = "absolute";
    bait.style.top = "-9999px";
    bait.style.left = "-9999px";
    document.body.appendChild(bait);

    const timeoutId = setTimeout(() => {
      // Check if bait was hidden by ad blocker
      const baitBlocked =
        bait.offsetHeight === 0 ||
        bait.clientHeight === 0 ||
        getComputedStyle(bait).display === "none" ||
        !document.body.contains(bait);

      if (baitBlocked) {
        setIsBlocked(true);
      } else {
        // Also try fetching a file that ad blockers commonly block
        fetch("/ads.js", { method: "HEAD", mode: "no-cors" })
          .then(() => {
            setIsBlocked(false);
          })
          .catch(() => {
            setIsBlocked(true);
          });
      }
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      if (document.body.contains(bait)) {
        document.body.removeChild(bait);
      }
    };
  }, []);

  const dismiss = useCallback(() => {
    setDismissed(true);
    try {
      localStorage.setItem(STORAGE_KEY, Date.now().toString());
    } catch {
      // localStorage unavailable
    }
  }, []);

  return { isBlocked, dismissed, dismiss };
}
