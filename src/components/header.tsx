"use client";

import {
  LogOut,
  Menu,
  User,
  Users,
  FileText,
  Target,
  FlaskConical,
  BarChart,
  BookOpen,
  CreditCard,
  Gift,
  UserCheck,
  ClipboardCheck,
  ChevronDown,
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
              <img src="/THESIS-AI-LOGO2.png" alt="ThesisAI Logo" width={24} height={24} className="mr-2" />
              <span className="font-bold">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-electric-purple via-accent-cyan to-pink-500">ThesisAI</span>
                <span> Philippines</span>
              </span>
            </Button>
          </Link>
        </div>

        {/* Main Navigation - Hidden on mobile */}
        <div className="hidden lg:flex items-center space-x-1">
          {/* Thesis Phases Dropdown - Show for students (not on admin/critic/advisor pages) */}
          {!pathname.startsWith('/admin') && !pathname.startsWith('/critic') && !pathname.startsWith('/advisor') && (
            <>
              {/* Thesis Phases Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="px-3">
                    Thesis Phases <ChevronDown className="ml-1 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">
                  <DropdownMenuLabel>Thesis Chapters</DropdownMenuLabel>
                  <DropdownMenuItem>
                    <Link href="/thesis-phases/chapter-1">Chapter 1 - Introduction</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link href="/thesis-phases/chapter-2">Chapter 2 - Literature Review</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link href="/thesis-phases/chapter-3">Chapter 3 - Methodology</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link href="/thesis-phases/chapter-4">Chapter 4 - Results & Analysis</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link href="/thesis-phases/chapter-5">Chapter 5 - Conclusions</Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}

          {/* Billing */}
          <Button variant="ghost" className="px-3" asChild>
            <Link href="/settings/billing">Billing</Link>
          </Button>

          {/* Referrals */}
          <Button variant="ghost" className="px-3" asChild>
            <Link href="/settings/referrals">Referrals</Link>
          </Button>

          {/* Manage Groups */}
          <Button variant="ghost" className="px-3" asChild>
            <Link href="/groups">Manage Groups</Link>
          </Button>

          {/* Usage & Analytics */}
          <Button variant="ghost" className="px-3" asChild>
            <Link href="/analytics">Usage & Analytics</Link>
          </Button>
        </div>

        {/* Right side: User */}
        <div className="flex items-center space-x-2">

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
                    <img src="/THESIS-AI-LOGO2.png" alt="ThesisAI Logo" width={24} height={24} />
                    <span className="text-lg font-semibold">
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-electric-purple via-accent-cyan to-pink-500">ThesisAI</span>
                      <span> Philippines</span>
                    </span>
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
                  {!pathname.startsWith('/admin') && !pathname.startsWith('/critic') && !pathname.startsWith('/advisor') && (
                    <div>
                      <DropdownMenuLabel>Thesis Phases</DropdownMenuLabel>
                      <Link href="/thesis-phases/chapter-1">
                        <DropdownMenuItem>Chapter 1 - Introduction</DropdownMenuItem>
                      </Link>
                      <Link href="/thesis-phases/chapter-2">
                        <DropdownMenuItem>Chapter 2 - Literature Review</DropdownMenuItem>
                      </Link>
                      <Link href="/thesis-phases/chapter-3">
                        <DropdownMenuItem>Chapter 3 - Methodology</DropdownMenuItem>
                      </Link>
                      <Link href="/thesis-phases/chapter-4">
                        <DropdownMenuItem>Chapter 4 - Results & Analysis</DropdownMenuItem>
                      </Link>
                      <Link href="/thesis-phases/chapter-5">
                        <DropdownMenuItem>Chapter 5 - Conclusions</DropdownMenuItem>
                      </Link>
                    </div>
                  )}
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
                    <DropdownMenuLabel>Account</DropdownMenuLabel>
                    <Link href="/settings/billing">
                      <DropdownMenuItem>Billing</DropdownMenuItem>
                    </Link>
                    <Link href="/settings/referrals">
                      <DropdownMenuItem>Referrals</DropdownMenuItem>
                    </Link>
                    <Link href="/groups">
                      <DropdownMenuItem>Manage Groups</DropdownMenuItem>
                    </Link>
                    <Link href="/analytics">
                      <DropdownMenuItem>Usage & Analytics</DropdownMenuItem>
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
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}