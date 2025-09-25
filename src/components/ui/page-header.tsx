import * as React from "react";
import { cn } from "@/lib/ui-utils";

interface PageHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
}

export function PageHeader({ title, description, children, className }: PageHeaderProps) {
  return (
    <div className={cn("flex items-start justify-between mb-8", className)}>
      <div className="flex-1">
        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          {title}
        </h1>
        {description && (
          <p className="text-xl text-gray-600 mt-2 max-w-3xl">
            {description}
          </p>
        )}
      </div>
      {children && (
        <div className="ml-6 flex-shrink-0">
          {children}
        </div>
      )}
    </div>
  );
}
