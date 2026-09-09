import { Activity, ClipboardList, Flag, Users } from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const ADMIN_TABS = [
  {
    to: "/admin",
    label: "Users",
    icon: Users,
    end: true,
  },
  {
    to: "/admin/moderation",
    label: "Moderation",
    icon: Flag,
    end: false,
  },
  {
    to: "/admin/audit-log",
    label: "Audit log",
    icon: ClipboardList,
    end: false,
  },
  {
    to: "/admin/health",
    label: "Health",
    icon: Activity,
    end: false,
  },
];

export default function AdminLayout() {
  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <div className="mx-auto w-full max-w-6xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        <header>
          <h1 className="text-2xl font-semibold tracking-tight">
            Admin console
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Account administration, moderation visibility, audit activity, and
            backend health.
          </p>
        </header>

        <Tabs defaultValue="users">
          <TabsList className="h-auto w-full justify-start overflow-x-auto rounded-xl bg-muted/50 p-1 sm:w-auto">
            {ADMIN_TABS.map((tab) => {
              const Icon = tab.icon;

              return (
                <TabsTrigger
                  key={tab.to}
                  value={tab.to}
                  className="shrink-0 gap-1.5"
                  render={<NavLink to={tab.to} end={tab.end} />}
                >
                  <Icon className="size-3.5" />
                  {tab.label}
                </TabsTrigger>
              );
            })}
          </TabsList>
        </Tabs>

        <Outlet />
      </div>
    </div>
  );
}
