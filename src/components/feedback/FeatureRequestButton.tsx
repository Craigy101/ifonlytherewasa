"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/components/providers/AuthProvider";
import { useToast } from "@/components/providers/ToastProvider";
import { Dialog } from "@/components/ui/Dialog";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";

export function FeatureRequestButton() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [open, setOpen] = useState(false);
  const [body, setBody] = useState("");
  const [contactOk, setContactOk] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!user) return null;

  const handleSubmit = async () => {
    const trimmed = body.trim();
    if (!trimmed) return;

    setSubmitting(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("feature_requests")
        .insert({ user_id: user.id, body: trimmed, contact_ok: contactOk });

      if (error) {
        addToast("Failed to submit request. Please try again.", "error");
        return;
      }

      addToast("Thanks for your feedback!", "success");
      setBody("");
      setContactOk(false);
      setOpen(false);
    } catch {
      addToast("Something went wrong. Please try again.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-content-secondary hover:bg-surface-hover hover:text-content transition-colors w-full"
      >
        <span className="w-4 h-4 flex items-center justify-center text-xs shrink-0">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </span>
        Feature Request
      </button>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="Feature Request"
        footer={
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              loading={submitting}
              disabled={!body.trim()}
              onClick={handleSubmit}
            >
              Submit
            </Button>
          </>
        }
      >
        <Textarea
          placeholder="What feature would you like to see?"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          maxLength={2000}
          rows={4}
        />
        <label className="flex items-start gap-2 mt-3 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={contactOk}
            onChange={(e) => setContactOk(e.target.checked)}
            className="mt-0.5 rounded border-surface-border bg-surface-raised text-accent focus:ring-accent/50"
          />
          <span className="text-sm text-content-secondary">
            Happy to be contacted by the team for follow-up questions
          </span>
        </label>
      </Dialog>
    </>
  );
}
