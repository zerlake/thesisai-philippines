"use client";

import {
  BookText,
  LogOut,
  Menu,
  User,
} from "lucide-react";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { useAuth } from "./auth-provider";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { ThemeToggle } from "./theme-toggle";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "./ui/sheet";
import { cn } from "../lib/utils";
import { NotificationBell } from "./notification-bell";
import { studentNavGroups, adminNavItems, advisorNavGroups, criticNavGroups, type NavItem, type NavGroup } from "../lib/navigation";
import { toast } from "sonner";
import { ScrollArea } from "./ui/scroll-area";

export function Header() {
  const { supabase, session, profile } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
      // Use window.location to force a full page reload, clearing all state.
      window.location.href = "/login";
    } catch (error: any) {
      toast.error("Logout failed: " + error.message);
      console.error("Logout error:", error);
    }
  };

  const userEmail = session?.user?.email || "";
  const fallback = userEmail ? userEmail.charAt(0).toUpperCase() : "U";

  const renderNavGroup = (group: NavGroup) => (
    <div key={group.title}>
      <h3 className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        {group.title}
      </h3>
      {group.items.map((item: NavItem) => (
        <Link
          key={item.label}
          href={item.href}
          className={cn(
            "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground",
            pathname === item.href && "bg-accent text-accent-foreground"
          )}
        >
          <item.icon className="w-5 h-5" />
          <span>{item.label}</span>
        </Link>
      ))}
    </div>
  );

  const renderNav = () => {
    switch (profile?.role) {
      case "admin":
        return (
          <div className="mb-4">
            <h3 className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Admin
            </h3>
            {adminNavItems.map((item: NavItem) => (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                  pathname === item.href && "bg-accent text-accent-foreground"
                )}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
        );
      case "advisor":
        return advisorNavGroups.map(renderNavGroup);
      case "critic":
        return criticNavGroups.map(renderNavGroup);
      default:
        return studentNavGroups.map(renderNavGroup);
    }
  };

  return (
    <header className="flex items-center justify-between h-16 px-4 md:px-6 border-b bg-card">
      <div className="flex items-center gap-3">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="w-6 h-6" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-4 flex flex-col">
            <SheetHeader className="text-left mb-2">
              <SheetTitle>
                <div className="flex items-center gap-3">
                  <BookText className="w-6 h-6" />
                  <span className="text-lg font-semibold">ThesisAI Philippines</span>
                </div>
              </SheetTitle>
              <SheetDescription className="sr-only">
                Main navigation menu.
              </SheetDescription>
            </SheetHeader>
            <ScrollArea className="-mx-4 flex-1">
              <nav className="space-y-2 px-4">
                {renderNav()}
              </nav>
            </ScrollArea>
          </SheetContent>
        </Sheet>

        <div className="hidden md:flex items-center gap-3">
          <BookText className="w-6 h-6" />
          <h1 className="text-lg font-semibold">ThesisAI Philippines</h1>
        </div>
      </div>
      <div className="flex items-center gap-2 md:gap-4">
        <NotificationBell />

        <ThemeToggle />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Avatar className="h-8 w-8 cursor-pointer">
              <AvatarImage src={profile?.avatar_url || undefined} />
              <AvatarFallback>{fallback}</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <Link href="/settings">
              <DropdownMenuItem>
                <User className="w-4 h-4 mr-2" />
                <span>Profile</span>
              </DropdownMenuItem>
            </Link>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}