import { useEffect, useState } from "react";
import {
  BadgeCheck,
  Check,
  CircleAlert,
  Loader2,
  Pencil,
  X,
} from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

import { updateMyProfile } from "@/features/settings/api";
import { useAuthStore } from "@/features/auth/useAuthStore";
import { ApiError } from "@/lib/apiError";
import type { User } from "@/features/auth/types";

type ProfileFormProps = {
  user: User;
};

function getProfileErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 401 || error.code === "UNAUTHORIZED") {
      return "Your session has expired. Please sign in again.";
    }

    if (error.code === "VALIDATION_ERROR") {
      return error.message;
    }

    return error.message || "Couldn't update your profile.";
  }

  return "Couldn't update your profile. Please try again.";
}

export function ProfileForm({ user }: ProfileFormProps) {
  const queryClient = useQueryClient();
  const setUser = useAuthStore((state) => state.setUser);

  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(user.display_name ?? "");
  const [displayNameError, setDisplayNameError] = useState<string | null>(null);

  useEffect(() => {
    if (!isEditing) {
      setDisplayName(user.display_name ?? "");
      setDisplayNameError(null);
    }
  }, [isEditing, user.display_name]);

  const updateProfileMutation = useMutation({
    mutationFn: updateMyProfile,

    onSuccess: async (updatedUser) => {
      /*
       * Keep all representations of the signed-in profile synchronized:
       * - Zustand: application/session identity shown in sidebar/avatar.
       * - React Query: Settings page server-state cache.
       */
      setUser(updatedUser);

      queryClient.setQueryData(["profile", "me"], updatedUser);
      await queryClient.invalidateQueries({
        queryKey: ["profile", "me"],
      });

      toast.success("Profile updated");
      setIsEditing(false);
      setDisplayNameError(null);
    },

    onError: (error) => {
      const message = getProfileErrorMessage(error);
      setDisplayNameError(message);
      toast.error(message);
    },
  });

  const handleCancel = () => {
    setDisplayName(user.display_name ?? "");
    setDisplayNameError(null);
    setIsEditing(false);
    updateProfileMutation.reset();
  };

  const handleSave = () => {
    const trimmedDisplayName = displayName.trim();

    /*
     * The backend has no documented max length for display_name.
     * We only perform the reasonable client-side non-empty validation;
     * backend 422 validation remains the authoritative fallback.
     */
    if (!trimmedDisplayName) {
      setDisplayNameError("Display name cannot be empty.");
      return;
    }

    if (trimmedDisplayName === (user.display_name ?? "")) {
      setIsEditing(false);
      return;
    }

    setDisplayNameError(null);

    updateProfileMutation.mutate({
      display_name: trimmedDisplayName,
    });
  };

  const createdDate = new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(user.created_at));

  return (
    <Card className="border-border/80 bg-card/80">
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle className="text-base">Profile</CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage the identity shown across your heyHi workspace.
          </p>
        </div>

        {!isEditing && (
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="shrink-0 gap-1.5"
            onClick={() => setIsEditing(true)}
          >
            <Pencil className="size-3.5" />
            Edit
          </Button>
        )}
      </CardHeader>

      <CardContent className="space-y-6">
        <Field data-invalid={Boolean(displayNameError)}>
          <FieldLabel htmlFor="profile-display-name">Display name</FieldLabel>

          {isEditing ? (
            <>
              <div className="flex min-w-0 items-center gap-2">
                <Input
                  id="profile-display-name"
                  value={displayName}
                  autoFocus
                  disabled={updateProfileMutation.isPending}
                  aria-invalid={Boolean(displayNameError)}
                  placeholder="Your name"
                  onChange={(event) => {
                    setDisplayName(event.target.value);

                    if (displayNameError) {
                      setDisplayNameError(null);
                    }
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      handleSave();
                    }

                    if (event.key === "Escape") {
                      event.preventDefault();
                      handleCancel();
                    }
                  }}
                />

                <Button
                  type="button"
                  size="icon-sm"
                  disabled={updateProfileMutation.isPending}
                  onClick={handleSave}
                  aria-label="Save display name"
                >
                  {updateProfileMutation.isPending ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Check className="size-4" />
                  )}
                </Button>

                <Button
                  type="button"
                  size="icon-sm"
                  variant="ghost"
                  disabled={updateProfileMutation.isPending}
                  onClick={handleCancel}
                  aria-label="Cancel editing display name"
                >
                  <X className="size-4" />
                </Button>
              </div>

              {displayNameError ? (
                <FieldError>{displayNameError}</FieldError>
              ) : (
                <FieldDescription>
                  Press Enter to save or Escape to cancel.
                </FieldDescription>
              )}
            </>
          ) : (
            <div className="rounded-lg border border-border/60 bg-background/35 px-3 py-2.5">
              <p className="text-sm">
                {user.display_name?.trim() || "No display name set"}
              </p>
            </div>
          )}
        </Field>

        <Field>
          <FieldLabel>Email address</FieldLabel>

          <div className="flex min-w-0 flex-wrap items-center gap-2 rounded-lg border border-border/60 bg-background/35 px-3 py-2.5">
            <p className="min-w-0 flex-1 truncate text-sm text-muted-foreground">
              {user.email}
            </p>

            {user.email_verified ? (
              <Badge
                variant="secondary"
                className="shrink-0 gap-1 rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
              >
                <BadgeCheck className="size-3.5" />
                Verified
              </Badge>
            ) : (
              <Badge
                variant="secondary"
                className="shrink-0 gap-1 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-300"
              >
                <CircleAlert className="size-3.5" />
                Unverified
              </Badge>
            )}
          </div>

          <FieldDescription>
            Your email address cannot currently be changed.
          </FieldDescription>
        </Field>

        <div className="border-t border-border/60 pt-4">
          <p className="text-xs text-muted-foreground">
            Account created {createdDate}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
