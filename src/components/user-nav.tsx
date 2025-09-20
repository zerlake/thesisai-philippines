"use client";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { LogOut, User as UserIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "./auth-provider"; // Import useAuth

export function UserNav() {
  const { session, profile } = useAuth(); // Use session and profile from AuthContext
  const router = useRouter();

  // If no session user or profile, don't render the UserNav
  if (!session?.user || !profile) {
    return null;
  }

  const user = session.user; // Use user from session

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const getInitials = () => {
    if (!profile) return "?"; // Should not happen with the above check, but for safety
    const firstNameInitial = profile.first_name ? profile.first_name[0] : "";
    const lastNameInitial = profile.last_name ? profile.last_name[0] : "";
    return `${firstNameInitial}${lastNameInitial}`.toUpperCase();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full" aria-label="Open user menu">
          <Avatar className="h-8 w-8">
            <AvatarImage src={profile?.avatar_url || ""} alt="User avatar" />
            <AvatarFallback>{getInitials()}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {profile?.first_name} {profile?.last_name}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => router.push('/dashboard')}>
            <UserIcon className="mr-2 h-4 w-4" />
            <span>Dashboard</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}