import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Status badge utilities
export const getStatusColor = (status: string) => {
  switch (status) {
    case "open": 
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "in_progress": 
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "resolved": 
      return "bg-green-100 text-green-800 border-green-200";
    case "closed": 
      return "bg-gray-100 text-gray-800 border-gray-200";
    default: 
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

export const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "urgent": 
      return "bg-red-100 text-red-800 border-red-200";
    case "high": 
      return "bg-orange-100 text-orange-800 border-orange-200";
    case "medium": 
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "low": 
      return "bg-green-100 text-green-800 border-green-200";
    default: 
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

// Format utilities
export const formatDate = (timestamp: number) => {
  return new Date(timestamp).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
};

export const formatStatus = (status: string) => {
  return status.replace("_", " ").toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
};

// Common layout classes
export const layoutClasses = {
  page: "min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50",
  container: "container mx-auto px-4 py-8",
  maxWidth: "max-w-6xl mx-auto",
  card: "bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200",
  badge: "inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border",
  gradientText: "bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent",
  button: {
    primary: "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white",
    secondary: "bg-white border-2 border-gray-200 hover:border-gray-300 text-gray-700 hover:bg-gray-50",
  }
};
