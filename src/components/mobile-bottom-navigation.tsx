"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plus, Home, FileText, Lightbulb, Settings, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useState } from "react";

interface MobileNavItem {
  label: string;
  href?: string;
  icon: React.ComponentType<{ className?: string }>;
  isAction?: boolean;
  isMenu?: boolean;
}

const mainNavItems: MobileNavItem[] = [
  { label: "New", href: "/new-document", icon: Plus, isAction: true },
  { label: "Dashboard", href: "/dashboard", icon: Home },
  { label: "Documents", href: "/documents", icon: FileText },
  { label: "Tools", href: "/tools", icon: Lightbulb },
  { label: "More", icon: Menu, isMenu: true },
];

const moreNavItems: MobileNavItem[] = [
  { label: "Settings", href: "/settings", icon: Settings },
  { label: "Collaboration", href: "/groups", icon: FileText }, // Uses FileText as placeholder
  { label: "Resources", href: "/resources", icon: Lightbulb },
  { label: "Help", href: "/help", icon: Plus }, // Uses Plus as placeholder
];

export function MobileBottomNavigation() {
  const pathname = usePathname();
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const isActive = (href: string) => {
    if (href === "/new-document") return pathname === href;
    return pathname?.startsWith(href);
  };

  return (
    <>
      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-inset-bottom md:hidden z-50">
        <div className="flex items-center justify-between h-20 px-1">
          {mainNavItems.map((item) => {
            if (item.isMenu) {
              const Icon = item.icon;
              return (
                <button
                  key="more"
                  onClick={() => setShowMoreMenu(true)}
                  className="flex flex-col items-center justify-center w-16 h-20 hover:bg-gray-100 rounded-lg transition"
                >
                  <Icon className="w-6 h-6 text-gray-600" />
                  <span className="text-xs mt-1 text-gray-600">More</span>
                </button>
              );
            }

            if (!item.href) return null;

            const Icon = item.icon;
            const active = isActive(item.href);

            if (item.isAction) {
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex flex-col items-center justify-center w-16 h-20 bg-blue-600 hover:bg-blue-700 rounded-t-full text-white transition"
                >
                  <Icon className="w-6 h-6" />
                  <span className="text-xs mt-1 font-semibold">{item.label}</span>
                </Link>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center w-16 h-20 transition rounded-lg ${
                  active ? "text-blue-600" : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <Icon className={`w-6 h-6 ${active ? "fill-current" : ""}`} />
                <span className={`text-xs mt-1 ${active ? "font-semibold" : ""}`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* More Menu Sheet */}
      <Sheet open={showMoreMenu} onOpenChange={setShowMoreMenu}>
        <SheetContent side="bottom" className="w-full">
          <SheetHeader className="text-left">
            <SheetTitle>More Options</SheetTitle>
          </SheetHeader>

          <div className="space-y-2 mt-4">
            {moreNavItems.map((item) => {
              if (!item.href) return null;

              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setShowMoreMenu(false)}
                >
                  <Button
                    variant={active ? "default" : "ghost"}
                    className="w-full justify-start h-12"
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    <span>{item.label}</span>
                  </Button>
                </Link>
              );
            })}
          </div>

          {/* Account Section */}
          <div className="border-t mt-6 pt-4 space-y-2">
            <Link href="/profile">
              <Button variant="ghost" className="w-full justify-start h-12">
                <span>👤 Profile</span>
              </Button>
            </Link>
            <Link href="/settings">
              <Button variant="ghost" className="w-full justify-start h-12">
                <span>⚙️ Settings</span>
              </Button>
            </Link>
            <Link href="/logout">
              <Button variant="destructive" className="w-full justify-start h-12">
                <span>🚪 Sign Out</span>
              </Button>
            </Link>
          </div>
        </SheetContent>
      </Sheet>

      {/* Spacer for bottom nav */}
      <div className="h-20 md:hidden" />
    </>
  );
}
