import * as React from "react";
import { cn, layoutClasses } from "@/lib/ui-utils";

interface PageLayoutProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
}

export function PageLayout({ children, className, maxWidth = "xl" }: PageLayoutProps) {
  const maxWidthClasses = {
    sm: "max-w-2xl mx-auto",
    md: "max-w-4xl mx-auto", 
    lg: "max-w-6xl mx-auto",
    xl: "max-w-7xl mx-auto",
    "2xl": "max-w-screen-2xl mx-auto",
    full: "w-full"
  };

  return (
    <div className="min-h-screen text-render">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className={cn(maxWidthClasses[maxWidth], className)}>
          {children}
        </div>
      </div>
    </div>
  );
}
