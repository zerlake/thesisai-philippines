"use client";

import {
  BookText,
  LogOut,
  Menu,
  User,
  Users,
  FileText,
  Target,
  FlaskConical,
  BarChart,
  Settings,
  BookOpen,
  ChevronDown,
  Bell,
  CreditCard,
  Gift,
  UserCheck,
  ClipboardCheck,
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
import { usePathname } from "next/navigation";
import Link from "next/link";
import { ThemeToggle } from "./theme-toggle";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "./ui/sheet";
import { cn } from "../lib/utils";
import { AuthenticatedNotificationBell } from "./authenticated-notification-bell";
import { studentNavGroups, adminNavItems, advisorNavGroups, criticNavGroups, type NavItem, type NavGroup } from "../lib/navigation";
import { toast } from "sonner";
import { ScrollArea } from "./ui/scroll-area";

export function Header() {
  const { supabase, session, profile } = useAuth();
  const pathname = usePathname();

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

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="h-9 px-0">
              <BookText className="h-6 w-6 mr-2" />
              <span className="font-bold">ThesisAI Philippines</span>
            </Button>
          </Link>
        </div>

        {/* Main Navigation - Hidden on mobile */}
        <div className="hidden lg:flex items-center space-x-1">
          {/* Products Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="px-3">
                Products <ChevronDown className="ml-1 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuLabel>Our Products</DropdownMenuLabel>
              <DropdownMenuItem>
                <Link href="/thesis">ThesisAI</Link>
              </DropdownMenuItem>
              <DropdownMenuItem disabled>
                ARC Generator (Coming Soon)
              </DropdownMenuItem>
              <DropdownMenuItem disabled>
                AI Copilot (Coming Soon)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>


        </div>

        {/* Right side: Admin + User */}
        <div className="flex items-center space-x-2">
          {/* Admin Section */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2 hidden lg:flex">
                <Settings className="h-4 w-4" />
                Admin
                <Bell className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
              <DropdownMenuLabel>Organization Settings</DropdownMenuLabel>
              <DropdownMenuItem>
                <Link href="/settings/billing">Billing</Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link href="/settings/referrals">Referrals</Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link href="/groups">Manage Groups</Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link href="/analytics">Usage & Analytics</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Mobile menu button */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Toggle navigation menu">
                <Menu className="w-6 h-6" />
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
                  <div>
                    <DropdownMenuLabel>Products</DropdownMenuLabel>
                    <Link href="/thesis">
                      <DropdownMenuItem>ThesisAI</DropdownMenuItem>
                    </Link>
                    <DropdownMenuItem disabled>ARC Generator</DropdownMenuItem>
                  </div>
                  <div>
                    <DropdownMenuLabel>Resources</DropdownMenuLabel>
                    <Link href="/documentation">
                      <DropdownMenuItem>Documentation</DropdownMenuItem>
                    </Link>
                    <Link href="/support">
                      <DropdownMenuItem>Support</DropdownMenuItem>
                    </Link>
                  </div>
                  <div>
                    <DropdownMenuLabel>Admin</DropdownMenuLabel>
                    <Link href="/settings/billing">
                      <DropdownMenuItem>Billing</DropdownMenuItem>
                    </Link>
                    <Link href="/settings/referrals">
                      <DropdownMenuItem>Referrals</DropdownMenuItem>
                    </Link>
                    <Link href="/groups">
                      <DropdownMenuItem>Manage Groups</DropdownMenuItem>
                    </Link>
                  </div>
                </nav>
              </ScrollArea>
            </SheetContent>
          </Sheet>

          {/* Notification Bell */}
          <AuthenticatedNotificationBell />

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* User Profile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={profile?.avatar_url || undefined} />
                  <AvatarFallback>{fallback}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{profile?.first_name || 'User'}</p>
                  <p className="w-[200px] truncate text-xs text-muted-foreground">
                    {userEmail}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Link href="/settings">Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link href="/settings">API Keys</Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link href="/settings">Preferences</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}