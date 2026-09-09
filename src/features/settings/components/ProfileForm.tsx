/**
 * features/settings/components/ProfileForm.tsx
 * Per 03-pages-and-features.md §7 "Profile tab": display_name (editable,
 * PATCH /users/me), email (read-only), email verification status badge.
 * Per the Forms Validation Summary: display_name non-empty is a reasonable
 * client rule - backend has no stated length limit found, so none is
 * enforced client-side beyond non-empty.
 */
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { updateMe } from "../../auth/api";
import { useAuthStore } from "../../auth/useAuthStore";
import { CheckCircle2, AlertCircle, Pencil, Check, X } from "lucide-react";
import type { User } from "../../auth/types";

interface ProfileFormProps {
  user: User;
}

export function ProfileForm({ user }: ProfileFormProps) {
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState(user.display_name ?? "");
  const setUser = useAuthStore((s) => s.setUser);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: updateMe,
    onSuccess: (updatedUser) => {
      setUser(updatedUser);
      queryClient.setQueryData(["profile", "me"], updatedUser);
      toast.success("Profile updated");
      setEditing(false);
    },
    onError: () =>
      toast.error("Couldn't update your profile. Please try again."),
  });

  const handleSave = () => {
    const trimmed = displayName.trim();
    if (!trimmed) {
      toast.error("Display name can't be empty.");
      return;
    }
    mutation.mutate({ display_name: trimmed });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <label className="text-sm font-medium">Display name</label>
        {editing ? (
          <div className="flex items-center gap-2">
            <input
              autoFocus
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="flex-1 rounded-md border px-3 py-2 text-sm"
            />
            <button
              onClick={handleSave}
              disabled={mutation.isPending}
              aria-label="Save"
            >
              <Check className="h-4 w-4" />
            </button>
            <button onClick={() => setEditing(false)} aria-label="Cancel">
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <p className="text-sm">{user.display_name || "(not set)"}</p>
            <button
              onClick={() => setEditing(true)}
              aria-label="Edit display name"
            >
              <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          </div>
        )}
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium">Email</label>
        <div className="flex items-center gap-2">
          <p className="text-sm text-muted-foreground">{user.email}</p>
          {user.email_verified ? (
            <span className="flex items-center gap-1 rounded bg-green-100 px-1.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-950 dark:text-green-300">
              <CheckCircle2 className="h-3 w-3" /> Verified
            </span>
          ) : (
            <span className="flex items-center gap-1 rounded bg-yellow-100 px-1.5 py-0.5 text-xs font-medium text-yellow-800 dark:bg-yellow-950 dark:text-yellow-300">
              <AlertCircle className="h-3 w-3" /> Unverified
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
