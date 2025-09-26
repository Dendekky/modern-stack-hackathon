import * as React from "react";
import Link from "next/link";
import { useMutation } from "convex/react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate, formatStatus, cn } from "@/lib/ui-utils";
import { Id } from "../../../convex/_generated/dataModel";
import { api } from "../../../convex/_generated/api";
import type { TicketStatus } from "@/types";

interface TicketCardProps {
  ticket: any; // Use any to handle different ticket structures from different queries
  showCustomer?: boolean;
  showAgent?: boolean;
  actions?: React.ReactNode;
  className?: string;
  showStatusDropdown?: boolean;
}

export function TicketCard({ 
  ticket, 
  showCustomer = false, 
  showAgent = false, 
  actions,
  className,
  showStatusDropdown = false 
}: TicketCardProps) {
  const updateTicketStatus = useMutation(api.tickets.updateTicketStatus);

  const statusOptions: { value: TicketStatus; label: string }[] = [
    { value: "open", label: "Open" },
    { value: "in_progress", label: "In Progress" },
    { value: "resolved", label: "Resolved" },
    { value: "closed", label: "Closed" },
  ];

  const handleStatusChange = async (newStatus: TicketStatus) => {
    if (newStatus === ticket.status) return;
    
    try {
      await updateTicketStatus({
        ticketId: ticket._id as Id<"tickets">,
        status: newStatus,
      });
    } catch (error) {
      console.error("Error updating ticket status:", error);
    }
  };

  const statusColor = {
    open: "bg-blue-50 text-blue-700 border-blue-200",
    in_progress: "bg-yellow-50 text-yellow-700 border-yellow-200",
    resolved: "bg-green-50 text-green-700 border-green-200",
    closed: "bg-gray-50 text-gray-700 border-gray-200"
  }[ticket.status] || "bg-gray-50 text-gray-700 border-gray-200";

  const priorityColor = {
    low: "bg-gray-50 text-gray-600",
    medium: "bg-blue-50 text-blue-600",
    high: "bg-orange-50 text-orange-600",
    urgent: "bg-red-50 text-red-600"
  }[ticket.priority] || "bg-gray-50 text-gray-600";

  return (
    <Card className={cn(
      "group hover:shadow-lg hover:shadow-gray-200/60 transition-all duration-300 border-gray-200/60 bg-white/70 backdrop-blur-sm",
      className
    )}>
      <CardContent className="p-0">
        <div className="p-6">
          {/* Header with Status and Priority */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className={cn("px-3 py-1 rounded-full text-xs font-medium border", statusColor)}>
                {formatStatus(ticket.status)}
              </div>
              <div className={cn("px-3 py-1 rounded-full text-xs font-medium", priorityColor)}>
                {ticket.priority}
              </div>
              {ticket.category && (
                <div className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                  {ticket.category}
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              {ticket.isVoiceTicket && (
                <div className="p-1.5 bg-purple-100 rounded-lg">
                  <span className="text-purple-600 text-sm">🎤</span>
                </div>
              )}
              {ticket.hasConversation && (
                <div className="flex items-center gap-1 px-2 py-1 bg-blue-50 rounded-lg">
                  <span className="text-blue-600 text-xs">💬</span>
                  <span className="text-blue-700 text-xs font-medium">{ticket.messageCount}</span>
                </div>
              )}
              {ticket.unreadCount > 0 && (
                <div className="flex items-center gap-1 px-2 py-1 bg-red-50 rounded-lg animate-pulse">
                  <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                  <span className="text-red-700 text-xs font-medium">{ticket.unreadCount}</span>
                </div>
              )}
            </div>
          </div>

          {/* Title and Status Dropdown */}
          <div className="mb-3 flex items-start justify-between gap-4">
            <Link 
              href={`/ticket/${ticket._id}`}
              className="flex-1 group-hover:text-blue-600 transition-colors duration-200"
            >
              <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 leading-6">
                {ticket.title}
              </h3>
            </Link>
            
            {showStatusDropdown && (
              <div className="flex-shrink-0">
                <select
                  value={ticket.status}
                  onChange={(e) => handleStatusChange(e.target.value as TicketStatus)}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                >
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
          
          {/* Description */}
          <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-2">
            {ticket.description}
          </p>
          
          {/* Meta Information */}
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-4">
              <span>Created {formatDate(ticket.createdAt)}</span>
              {showCustomer && ticket.customer?.name && (
                <span>by {ticket.customer.name}</span>
              )}
              {showAgent && ticket.assignedAgent?.name && (
                <span>assigned to {ticket.assignedAgent.name}</span>
              )}
            </div>
            <span className="text-gray-400">#{ticket._id.slice(-6)}</span>
          </div>
        </div>
        
        {/* Actions */}
        {actions && (
          <div className="border-t border-gray-100 bg-gray-50/50 px-6 py-4">
            {actions}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
