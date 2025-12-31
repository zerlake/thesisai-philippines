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
  Shield,
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
import { studentNavGroups, adminNavGroups, advisorNavGroups, criticNavGroups, type NavItem, type NavGroup } from "../lib/navigation";
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
          {/* Admin Navigation */}
          {profile?.role === 'admin' && (
            <>
              {/* Dashboard Switcher for Admin - Access all dashboards */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="px-3">
                    <Shield className="h-4 w-4 mr-2" />
                    Dashboards <ChevronDown className="ml-1 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">
                  <DropdownMenuLabel>Switch Dashboard</DropdownMenuLabel>
                  <DropdownMenuItem asChild>
                    <Link href="/admin" className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Admin Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/advisor" className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Advisor Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/critic" className="flex items-center gap-2">
                      <ClipboardCheck className="h-4 w-4" />
                      Critic Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Student Dashboard
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Admin Tools Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="px-3">
                    Management <ChevronDown className="ml-1 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">
                  <DropdownMenuLabel>User Management</DropdownMenuLabel>
                  <DropdownMenuItem asChild>
                    <Link href="/admin/users">User Management</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/admin/institutions">Institutions</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/admin/testimonials">Testimonials</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel>Financial</DropdownMenuLabel>
                  <DropdownMenuItem asChild>
                    <Link href="/admin/payouts">Payout Requests</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel>System</DropdownMenuLabel>
                  <DropdownMenuItem asChild>
                    <Link href="/admin/ai">AI Pipeline</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/admin/mcp-servers">MCP Servers</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/admin/wiki">Documentation</Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}

          {/* Critic Navigation */}
          {profile?.role === 'critic' && (
            <>
              {/* Review Tools Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="px-3">
                    Review Tools <ChevronDown className="ml-1 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">
                  <DropdownMenuLabel>Manuscript Review</DropdownMenuLabel>
                  <DropdownMenuItem>
                    <Link href="/critic/manuscript-analyzer">Manuscript Analyzer</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link href="/critic/grammar-checker">Grammar & Style Checker</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link href="/critic/plagiarism-check">Plagiarism Detector</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link href="/critic/citation-auditor">Citation Auditor</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel>Feedback</DropdownMenuLabel>
                  <DropdownMenuItem>
                    <Link href="/critic/feedback-templates">Feedback Templates</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link href="/critic/certification-checklist">Certification Checklist</Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Earnings */}
              <Button variant="ghost" className="px-3" asChild>
                <Link href="/critic/billing">Earnings</Link>
              </Button>

              {/* My Reviews */}
              <Button variant="ghost" className="px-3" asChild>
                <Link href="/critic/review-history">My Reviews</Link>
              </Button>

              {/* Analytics */}
              <Button variant="ghost" className="px-3" asChild>
                <Link href="/critic/statistics">Analytics</Link>
              </Button>
            </>
          )}

          {/* Student/Advisor Navigation - Thesis Phases */}
          {!pathname.startsWith('/admin') && !pathname.startsWith('/critic') && profile?.role !== 'critic' && (
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
            </>
          )}
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
                  {/* Critic Mobile Navigation */}
                  {profile?.role === 'critic' && (
                    <>
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-muted-foreground px-3 py-2">Workspace</p>
                        <Link href="/critic" className="block">
                          <Button variant="ghost" className="w-full justify-start">Dashboard</Button>
                        </Link>
                        <Link href="/critic/review-queue" className="block">
                          <Button variant="ghost" className="w-full justify-start">Review Queue</Button>
                        </Link>
                        <Link href="/critic/students" className="block">
                          <Button variant="ghost" className="w-full justify-start">My Students</Button>
                        </Link>
                        <Link href="/critic/chat" className="block">
                          <Button variant="ghost" className="w-full justify-start">Messages</Button>
                        </Link>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-muted-foreground px-3 py-2">Review Tools</p>
                        <Link href="/critic/manuscript-analyzer" className="block">
                          <Button variant="ghost" className="w-full justify-start">Manuscript Analyzer</Button>
                        </Link>
                        <Link href="/critic/grammar-checker" className="block">
                          <Button variant="ghost" className="w-full justify-start">Grammar Checker</Button>
                        </Link>
                        <Link href="/critic/plagiarism-check" className="block">
                          <Button variant="ghost" className="w-full justify-start">Plagiarism Detector</Button>
                        </Link>
                        <Link href="/critic/citation-auditor" className="block">
                          <Button variant="ghost" className="w-full justify-start">Citation Auditor</Button>
                        </Link>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-muted-foreground px-3 py-2">Feedback</p>
                        <Link href="/critic/feedback-templates" className="block">
                          <Button variant="ghost" className="w-full justify-start">Feedback Templates</Button>
                        </Link>
                        <Link href="/critic/certification-checklist" className="block">
                          <Button variant="ghost" className="w-full justify-start">Certification Checklist</Button>
                        </Link>
                        <Link href="/critic/issue-certificate" className="block">
                          <Button variant="ghost" className="w-full justify-start">Issue Certificate</Button>
                        </Link>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-muted-foreground px-3 py-2">Analytics</p>
                        <Link href="/critic/statistics" className="block">
                          <Button variant="ghost" className="w-full justify-start">Review Statistics</Button>
                        </Link>
                        <Link href="/critic/billing" className="block">
                          <Button variant="ghost" className="w-full justify-start">Earnings Report</Button>
                        </Link>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-muted-foreground px-3 py-2">Resources</p>
                        <Link href="/critic-guide" className="block">
                          <Button variant="ghost" className="w-full justify-start">Critic Guide</Button>
                        </Link>
                        <Link href="/critic/rubrics" className="block">
                          <Button variant="ghost" className="w-full justify-start">Evaluation Rubrics</Button>
                        </Link>
                      </div>
                    </>
                  )}

                  {/* Advisor Mobile Navigation */}
                  {profile?.role === 'advisor' && (
                    <>
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-muted-foreground px-3 py-2">Advisor Workspace</p>
                        <Link href="/advisor" className="block">
                          <Button variant="ghost" className="w-full justify-start">Dashboard</Button>
                        </Link>
                        <Link href="/advisor/messages" className="block">
                          <Button variant="ghost" className="w-full justify-start">Messages</Button>
                        </Link>
                        <Link href="/advisor/drafts" className="block">
                          <Button variant="ghost" className="w-full justify-start">Drafts</Button>
                        </Link>
                        <Link href="/advisor/competency-assessment" className="block">
                          <Button variant="ghost" className="w-full justify-start">Competency Assessment</Button>
                        </Link>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-muted-foreground px-3 py-2">Thesis Phases</p>
                        <Link href="/advisor/01-conceptualize" className="block">
                          <Button variant="ghost" className="w-full justify-start">01. Conceptualize</Button>
                        </Link>
                        <Link href="/advisor/02-research" className="block">
                          <Button variant="ghost" className="w-full justify-start">02. Research</Button>
                        </Link>
                        <Link href="/advisor/03-write-refine" className="block">
                          <Button variant="ghost" className="w-full justify-start">03. Write & Refine</Button>
                        </Link>
                        <Link href="/advisor/04-submit-present" className="block">
                          <Button variant="ghost" className="w-full justify-start">04. Submit & Present</Button>
                        </Link>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-muted-foreground px-3 py-2">Student Management</p>
                        <Link href="/advisor/students/overview" className="block">
                          <Button variant="ghost" className="w-full justify-start">Overview</Button>
                        </Link>
                        <Link href="/advisor/students/communication" className="block">
                          <Button variant="ghost" className="w-full justify-start">Communication Hub</Button>
                        </Link>
                        <Link href="/advisor/students/documents" className="block">
                          <Button variant="ghost" className="w-full justify-start">Document Review Tools</Button>
                        </Link>
                        <Link href="/advisor/students/analytics" className="block">
                          <Button variant="ghost" className="w-full justify-start">Analytics</Button>
                        </Link>
                        <Link href="/advisor/students/management" className="block">
                          <Button variant="ghost" className="w-full justify-start">Management</Button>
                        </Link>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-muted-foreground px-3 py-2">Resources</p>
                        <Link href="/advisor-guide" className="block">
                          <Button variant="ghost" className="w-full justify-start">Advisor Guide</Button>
                        </Link>
                      </div>
                    </>
                  )}

                  {/* Student/General Navigation */}
                  {profile?.role !== 'critic' && profile?.role !== 'advisor' && (
                    <>
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-muted-foreground px-3 py-2">Products</p>
                        <Link href="/thesis" className="block">
                          <Button variant="ghost" className="w-full justify-start">ThesisAI</Button>
                        </Link>
                        <Button variant="ghost" className="w-full justify-start" disabled>ARC Generator</Button>
                      </div>
                      {!pathname.startsWith('/admin') && !pathname.startsWith('/advisor') && (
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-muted-foreground px-3 py-2">Thesis Phases</p>
                          <Link href="/thesis-phases/chapter-1" className="block">
                            <Button variant="ghost" className="w-full justify-start">Chapter 1 - Introduction</Button>
                          </Link>
                          <Link href="/thesis-phases/chapter-2" className="block">
                            <Button variant="ghost" className="w-full justify-start">Chapter 2 - Literature Review</Button>
                          </Link>
                          <Link href="/thesis-phases/chapter-3" className="block">
                            <Button variant="ghost" className="w-full justify-start">Chapter 3 - Methodology</Button>
                          </Link>
                          <Link href="/thesis-phases/chapter-4" className="block">
                            <Button variant="ghost" className="w-full justify-start">Chapter 4 - Results & Analysis</Button>
                        </Link>
                          <Link href="/thesis-phases/chapter-5" className="block">
                            <Button variant="ghost" className="w-full justify-start">Chapter 5 - Conclusions</Button>
                          </Link>
                        </div>
                      )}
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-muted-foreground px-3 py-2">Resources</p>
                        <Link href="/documentation" className="block">
                          <Button variant="ghost" className="w-full justify-start">Documentation</Button>
                        </Link>
                        <Link href="/support" className="block">
                          <Button variant="ghost" className="w-full justify-start">Support</Button>
                        </Link>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-muted-foreground px-3 py-2">Account</p>
                        <Link href="/settings/billing" className="block">
                          <Button variant="ghost" className="w-full justify-start">Billing</Button>
                        </Link>
                        <Link href="/settings/referrals" className="block">
                          <Button variant="ghost" className="w-full justify-start">Referrals</Button>
                        </Link>
                        <Link href="/groups" className="block">
                          <Button variant="ghost" className="w-full justify-start">Manage Groups</Button>
                        </Link>
                        <Link href="/analytics" className="block">
                          <Button variant="ghost" className="w-full justify-start">Usage & Analytics</Button>
                        </Link>
                      </div>
                    </>
                  )}
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