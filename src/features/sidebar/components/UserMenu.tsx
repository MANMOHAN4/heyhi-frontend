import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BadgeCheck,
  ChevronUp,
  Crown,
  LogIn,
  LogOut,
  Settings,
  ShieldCheck,
  UserPlus,
} from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

import { useAdminCheck } from "@/features/auth/useAdminCheck";
import { useAuthStore } from "@/features/auth/useAuthStore";

type UserMenuProps = {
  onNavigate?: () => void;
};

function getInitials(email: string): string {
  const localPart = email.split("@")[0] ?? "";

  if (!localPart) {
    return "U";
  }

  const words = localPart.split(/[._-]+/).filter(Boolean);

  if (words.length >= 2) {
    return `${words[0]?.[0] ?? ""}${words[1]?.[0] ?? ""}`.toUpperCase();
  }

  return localPart.slice(0, 2).toUpperCase();
}

export function UserMenu({ onNavigate }: UserMenuProps) {
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);

  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const { isAdmin, isChecking } = useAdminCheck();

  const email = user?.email ?? "Guest";
  const displayName = user?.display_name?.trim() || email;

  function closeMenu(): void {
    setIsOpen(false);
  }

  function navigateTo(path: string): void {
    closeMenu();
    onNavigate?.();
    navigate(path);
  }

  function handleLogout(): void {
    closeMenu();
    onNavigate?.();
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton
                size="lg"
                className="data-[popup-open]:bg-sidebar-accent data-[popup-open]:text-sidebar-accent-foreground"
              >
                <Avatar className="size-8 rounded-lg">
                  <AvatarFallback className="rounded-lg bg-primary text-xs font-semibold text-primary-foreground">
                    {getInitials(email)}
                  </AvatarFallback>
                </Avatar>

                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{displayName}</span>

                  <span className="truncate text-xs text-muted-foreground">
                    {user ? email : "Guest session"}
                  </span>
                </div>

                <ChevronUp className="ml-auto size-4" />
              </SidebarMenuButton>
            }
          />

          <DropdownMenuContent
            className="w-64 rounded-lg"
            side="top"
            align="end"
            sideOffset={8}
          >
            {/*
              * DropdownMenuLabel renders Base UI's Menu.GroupLabel under the
              * hood, which throws ("MenuGroupContext is missing") unless
              * it's nested inside a <Menu.Group> - a <DropdownMenuGroup>
              * wrapper is required here even though this is a single,
              * non-interactive header row rather than a real option group.
              */}
            <DropdownMenuGroup>
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-2 py-2 text-left text-sm">
                  <Avatar className="size-8 rounded-lg">
                    <AvatarFallback className="rounded-lg bg-primary text-xs font-semibold text-primary-foreground">
                      {getInitials(email)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">{displayName}</span>

                    <span className="truncate text-xs text-muted-foreground">
                      {user ? email : "Guest session"}
                    </span>
                  </div>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            {user ? (
              <>
                <DropdownMenuGroup>
                  <DropdownMenuItem onClick={() => navigateTo("/settings")}>
                    <Settings className="size-4" />
                    Settings
                  </DropdownMenuItem>

                  {user.email_verified ? (
                    <DropdownMenuItem disabled>
                      <BadgeCheck className="size-4 text-emerald-500" />
                      Email verified
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem disabled>
                      <BadgeCheck className="size-4 text-amber-500" />
                      Email not verified
                    </DropdownMenuItem>
                  )}

                  {isAdmin === true ? (
                    <DropdownMenuItem onClick={() => navigateTo("/admin")}>
                      <ShieldCheck className="size-4" />
                      Admin console
                    </DropdownMenuItem>
                  ) : null}

                  {isChecking ? (
                    <DropdownMenuItem disabled>
                      <Crown className="size-4" />
                      Checking permissions…
                    </DropdownMenuItem>
                  ) : null}
                </DropdownMenuGroup>

                <DropdownMenuSeparator />

                <DropdownMenuItem variant="destructive" onClick={handleLogout}>
                  <LogOut className="size-4" />
                  Log out
                </DropdownMenuItem>
              </>
            ) : (
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={() => navigateTo("/login")}>
                  <LogIn className="size-4" />
                  Log in
                </DropdownMenuItem>

                <DropdownMenuItem onClick={() => navigateTo("/signup")}>
                  <UserPlus className="size-4" />
                  Create account
                </DropdownMenuItem>
              </DropdownMenuGroup>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
