import { useState } from "react"
import { Settings2, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

import { PageErrorState } from "@/components/shared/PageErrorState"
import { DeleteAccountDialog } from "@/features/settings/components/DeleteAccountDialog"
import { ProfileForm } from "@/features/settings/components/ProfileForm"
import { useProfileQuery } from "@/features/settings/useProfileQuery"

export default function SettingsPage() {
  const profileQuery = useProfileQuery()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  if (profileQuery.isLoading) {
    return <SettingsSkeleton />
  }

  if (profileQuery.isError || !profileQuery.data) {
    return (
      <div className="p-6">
        <PageErrorState
          message="Couldn't load your settings."
          onRetry={() => profileQuery.refetch()}
        />
      </div>
    )
  }

  const user = profileQuery.data

  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <div className="mx-auto w-full max-w-3xl space-y-6 px-4 py-6 sm:px-6">
        <header>
          <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
            <Settings2 className="size-5 text-muted-foreground" />
            Settings
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your profile and account preferences.
          </p>
        </header>

        <ProfileForm user={user} />

        <section className="rounded-xl border border-destructive/30 bg-destructive/5 p-5">
          <div className="flex items-start gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
              <Trash2 className="size-4" />
            </div>

            <div className="min-w-0 flex-1">
              <h2 className="text-base font-semibold text-destructive">
                Danger zone
              </h2>

              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                Permanently remove your account, conversations, Spaces, and
                uploaded documents.
              </p>

              <Button
                type="button"
                variant="destructive"
                className="mt-4"
                onClick={() => setDeleteDialogOpen(true)}
              >
                Delete account
              </Button>
            </div>
          </div>
        </section>
      </div>

      <DeleteAccountDialog
        userEmail={user.email}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
      />
    </div>
  )
}

function SettingsSkeleton() {
  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 px-4 py-6 sm:px-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-5 w-64" />
      </div>
      <Skeleton className="h-72 rounded-xl" />
      <Skeleton className="h-40 rounded-xl" />
    </div>
  )
}