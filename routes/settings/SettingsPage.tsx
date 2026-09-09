/**
 * routes/settings/SettingsPage.tsx
 * Per 03-pages-and-features.md §7. Profile tab + danger zone.
 */
import { useState } from "react";
import { Link } from "react-router-dom";
import { useProfileQuery } from "../../src/features/settings/useProfileQuery";
import { ProfileForm } from "../../src/features/settings/components/ProfileForm";
import { DeleteAccountDialog } from "../../src/features/settings/components/DeleteAccountDialog";
import { PageErrorState } from "../../components/shared/PageErrorState";

export default function SettingsPage() {
  const { data: user, isLoading, isError, refetch } = useProfileQuery();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  return (
    <div className="mx-auto max-w-lg space-y-8 p-6">
      <div>
        <h1 className="text-lg font-semibold">Settings</h1>
        <Link to="/settings/billing" className="text-xs text-primary underline">
          Manage billing →
        </Link>
      </div>

      {isLoading && (
        <div className="space-y-3">
          <div className="h-6 w-1/2 animate-pulse rounded bg-muted" />
          <div className="h-6 w-2/3 animate-pulse rounded bg-muted" />
        </div>
      )}

      {isError && (
        <PageErrorState
          message="Couldn't load your profile."
          onRetry={() => refetch()}
        />
      )}

      {user && <ProfileForm user={user} />}

      {user && (
        <section className="rounded-lg border border-destructive/50 p-4">
          <h2 className="text-sm font-semibold text-destructive">
            Danger zone
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Deleting your account is permanent and cannot be undone.
          </p>
          <button
            type="button"
            onClick={() => setDeleteDialogOpen(true)}
            className="mt-3 rounded-md border border-destructive px-3 py-1.5 text-sm font-medium text-destructive hover:bg-destructive/10"
          >
            Delete account
          </button>
        </section>
      )}

      {user && (
        <DeleteAccountDialog
          userEmail={user.email}
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
        />
      )}
    </div>
  );
}
