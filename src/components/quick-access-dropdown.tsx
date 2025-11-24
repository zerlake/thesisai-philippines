"use client";

import { ChevronDown, type LucideIcon } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";

interface QuickAccessItem {
  icon: LucideIcon;
  title: string;
  description: string;
  href: string;
}

interface QuickAccessToolsDropdownProps {
  items: QuickAccessItem[];
}

export function QuickAccessToolsDropdown({ items }: QuickAccessToolsDropdownProps) {
  const [open, setOpen] = useState(false);

  // Group items by category for better organization
  const groupedItems = {
    ideation: items.slice(0, 3), // Topic, Outline, Research
    drafting: items.slice(3, 6), // Methodology, Results, Conclusion
    presentation: items.slice(6, 8), // Presentation, Flashcards
    review: items.slice(8, 10), // Originality, References
    advanced: items.slice(10), // Advanced tools
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="w-full sm:w-auto gap-2"
        >
          Quick Access Tools
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        {/* Ideation Tools */}
        <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground">
          Planning & Research
        </DropdownMenuLabel>
        <DropdownMenuGroup>
          {groupedItems.ideation.map((item) => {
            const Icon = item.icon;
            return (
              <DropdownMenuItem key={item.href} asChild>
                <Link href={item.href} className="flex items-start gap-3 cursor-pointer">
                  <Icon className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{item.title}</span>
                    <span className="text-xs text-muted-foreground">{item.description}</span>
                  </div>
                </Link>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        {/* Drafting Tools */}
        <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground">
          Drafting & Writing
        </DropdownMenuLabel>
        <DropdownMenuGroup>
          {groupedItems.drafting.map((item) => {
            const Icon = item.icon;
            return (
              <DropdownMenuItem key={item.href} asChild>
                <Link href={item.href} className="flex items-start gap-3 cursor-pointer">
                  <Icon className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{item.title}</span>
                    <span className="text-xs text-muted-foreground">{item.description}</span>
                  </div>
                </Link>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        {/* Presentation & Learning */}
        <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground">
          Presentation & Learning
        </DropdownMenuLabel>
        <DropdownMenuGroup>
          {groupedItems.presentation.map((item) => {
            const Icon = item.icon;
            return (
              <DropdownMenuItem key={item.href} asChild>
                <Link href={item.href} className="flex items-start gap-3 cursor-pointer">
                  <Icon className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{item.title}</span>
                    <span className="text-xs text-muted-foreground">{item.description}</span>
                  </div>
                </Link>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        {/* Quality Review */}
        <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground">
          Quality & References
        </DropdownMenuLabel>
        <DropdownMenuGroup>
          {groupedItems.review.map((item) => {
            const Icon = item.icon;
            return (
              <DropdownMenuItem key={item.href} asChild>
                <Link href={item.href} className="flex items-start gap-3 cursor-pointer">
                  <Icon className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{item.title}</span>
                    <span className="text-xs text-muted-foreground">{item.description}</span>
                  </div>
                </Link>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        {/* Advanced Tools */}
        <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground">
          Advanced Tools
        </DropdownMenuLabel>
        <DropdownMenuGroup>
          {groupedItems.advanced.map((item) => {
            const Icon = item.icon;
            return (
              <DropdownMenuItem key={item.href} asChild>
                <Link href={item.href} className="flex items-start gap-3 cursor-pointer">
                  <Icon className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{item.title}</span>
                    <span className="text-xs text-muted-foreground">{item.description}</span>
                  </div>
                </Link>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
