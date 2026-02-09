"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/providers/AuthProvider";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Dialog } from "@/components/ui/Dialog";
import { useToast } from "@/components/providers/ToastProvider";

export default function SettingsPage() {
  const { user, profile, signOut } = useAuth();
  const router = useRouter();
  const { addToast } = useToast();

  const [editingUsername, setEditingUsername] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [savingUsername, setSavingUsername] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    if (!user) {
      router.replace("/login");
    }
  }, [user, router]);

  if (!user) return null;

  async function handleUsernameSave() {
    const trimmed = newUsername.trim().toLowerCase();

    if (!trimmed) {
      setUsernameError("Username is required.");
      return;
    }

    if (trimmed.length < 3) {
      setUsernameError("Username must be at least 3 characters.");
      return;
    }

    if (trimmed.length > 20) {
      setUsernameError("Username must be 20 characters or less.");
      return;
    }

    if (!/^[a-z0-9_-]+$/.test(trimmed)) {
      setUsernameError(
        "Username can only contain lowercase letters, numbers, hyphens, and underscores."
      );
      return;
    }

    setSavingUsername(true);
    setUsernameError("");

    const supabase = createClient();

    const { data: existing } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", trimmed)
      .neq("id", user!.id)
      .single();

    if (existing) {
      setUsernameError("This username is already taken.");
      setSavingUsername(false);
      return;
    }

    const { error } = await supabase
      .from("profiles")
      .update({ username: trimmed })
      .eq("id", user!.id);

    if (error) {
      setUsernameError("Failed to update username. Please try again.");
      setSavingUsername(false);
      return;
    }

    addToast(`Username updated — you are now @${trimmed}`, "success");
    setEditingUsername(false);
    setNewUsername("");
    setSavingUsername(false);
  }

  async function handleSignOut() {
    await signOut();
    router.replace("/");
  }

  function handleDeleteAccount() {
    setShowDeleteDialog(false);
    addToast("Contact support to delete your account.", "info");
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/profile"
          className="text-sm text-content-muted hover:text-content-secondary transition-colors"
        >
          &larr; Back to Profile
        </Link>
      </div>

      <h1 className="text-2xl font-bold text-content mb-6">Settings</h1>

      <Card className="p-6 space-y-4">
        <h2 className="text-sm font-medium text-content-secondary uppercase tracking-wider">
          Username
        </h2>

        {editingUsername ? (
          <div className="space-y-3">
            <Input
              value={newUsername}
              onChange={(e) => {
                setNewUsername(e.target.value);
                setUsernameError("");
              }}
              placeholder="New username"
              className="max-w-xs"
            />
            {usernameError && (
              <p className="text-xs text-red-500">{usernameError}</p>
            )}
            <div className="flex gap-2">
              <Button
                onClick={handleUsernameSave}
                disabled={savingUsername}
                size="sm"
              >
                {savingUsername ? "Saving..." : "Save"}
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setEditingUsername(false);
                  setNewUsername("");
                  setUsernameError("");
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <span className="text-content">
              @{profile?.username || "unknown"}
            </span>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setNewUsername(profile?.username || "");
                setEditingUsername(true);
              }}
            >
              Edit
            </Button>
          </div>
        )}
      </Card>

      <Card className="p-6 space-y-4">
        <h2 className="text-sm font-medium text-content-secondary uppercase tracking-wider">
          Account
        </h2>
        <Button variant="secondary" onClick={handleSignOut}>
          Sign Out
        </Button>
      </Card>

      <Card className="border-red-500/20 p-6 space-y-4">
        <h2 className="text-sm font-medium text-red-400 uppercase tracking-wider">
          Danger Zone
        </h2>
        <p className="text-sm text-content-muted">
          Once you delete your account, there is no going back. Please be
          certain.
        </p>
        <Button variant="danger" onClick={() => setShowDeleteDialog(true)}>
          Delete Account
        </Button>
      </Card>

      <Dialog
        open={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        title="Delete Account"
      >
        <p className="text-sm text-content-muted">
          Are you sure you want to delete your account? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3 mt-6">
          <Button
            variant="secondary"
            onClick={() => setShowDeleteDialog(false)}
          >
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteAccount}>
            Yes, Delete My Account
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
