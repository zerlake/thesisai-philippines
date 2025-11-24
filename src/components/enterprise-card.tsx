"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";

interface EnterpriseCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "outline";
  interactive?: boolean;
  href?: string;
}

const EnterpriseCard = React.forwardRef<HTMLDivElement, EnterpriseCardProps>(
  ({ className, variant = "default", interactive = false, href, ...props }, ref) => {
    const baseStyles =
      "rounded-xl border transition-all duration-300 ease-in-out overflow-hidden";

    const variantStyles = {
      default: "bg-card border-border/50 shadow-sm hover:shadow-md",
      elevated: "bg-gradient-to-br from-card to-card/50 border-border/70 shadow-lg hover:shadow-xl",
      outline: "bg-background/50 border-border/80 backdrop-blur-sm hover:bg-card/50",
    };

    const interactiveStyles = interactive ? "cursor-pointer hover:border-primary/50" : "";

    return (
      <div
        ref={ref}
        className={cn(baseStyles, variantStyles[variant], interactiveStyles, className)}
        {...props}
      />
    );
  }
);
EnterpriseCard.displayName = "EnterpriseCard";

interface EnterpriseCardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

const EnterpriseCardHeader = React.forwardRef<HTMLDivElement, EnterpriseCardHeaderProps>(
  ({ className, icon, action, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex items-center justify-between border-b border-border/50 px-6 py-4", className)}
      {...props}
    >
      <div className="flex items-center gap-3">
        {icon && <div className="flex-shrink-0">{icon}</div>}
        {props.children}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  )
);
EnterpriseCardHeader.displayName = "EnterpriseCardHeader";

interface EnterpriseCardTitleProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg";
}

const EnterpriseCardTitle = React.forwardRef<HTMLDivElement, EnterpriseCardTitleProps>(
  ({ className, size = "md", ...props }, ref) => {
    const sizeStyles = {
      sm: "text-sm font-semibold",
      md: "text-base font-semibold tracking-tight",
      lg: "text-lg font-bold tracking-tight",
    };

    return <div ref={ref} className={cn(sizeStyles[size], className)} {...props} />;
  }
);
EnterpriseCardTitle.displayName = "EnterpriseCardTitle";

const EnterpriseCardDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
));
EnterpriseCardDescription.displayName = "EnterpriseCardDescription";

const EnterpriseCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("px-6 py-5", className)} {...props} />
));
EnterpriseCardContent.displayName = "EnterpriseCardContent";

interface EnterpriseCardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  action?: React.ReactNode;
  divider?: boolean;
}

const EnterpriseCardFooter = React.forwardRef<HTMLDivElement, EnterpriseCardFooterProps>(
  ({ className, action, divider = false, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex items-center justify-between px-6 py-4",
        divider && "border-t border-border/50",
        className
      )}
      {...props}
    >
      <div>{props.children}</div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  )
);
EnterpriseCardFooter.displayName = "EnterpriseCardFooter";

export {
  EnterpriseCard,
  EnterpriseCardHeader,
  EnterpriseCardTitle,
  EnterpriseCardDescription,
  EnterpriseCardContent,
  EnterpriseCardFooter,
};
