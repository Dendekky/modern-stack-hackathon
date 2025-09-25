import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/ui-utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        // Status variants
        open: "bg-blue-100 text-blue-800 border-blue-200",
        in_progress: "bg-yellow-100 text-yellow-800 border-yellow-200",
        resolved: "bg-green-100 text-green-800 border-green-200",
        closed: "bg-gray-100 text-gray-800 border-gray-200",
        // Priority variants
        urgent: "bg-red-100 text-red-800 border-red-200",
        high: "bg-orange-100 text-orange-800 border-orange-200",
        medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
        low: "bg-green-100 text-green-800 border-green-200",
        // Special variants
        voice: "bg-purple-100 text-purple-800 border-purple-200",
        ai: "bg-indigo-100 text-indigo-800 border-indigo-200",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
