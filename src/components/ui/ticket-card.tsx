import * as React from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate, formatStatus, cn } from "@/lib/ui-utils";
import { Id } from "../../../convex/_generated/dataModel";

interface TicketCardProps {
  ticket: any; // Use any to handle different ticket structures from different queries
  showCustomer?: boolean;
  showAgent?: boolean;
  actions?: React.ReactNode;
  className?: string;
}

export function TicketCard({ 
  ticket, 
  showCustomer = false, 
  showAgent = false, 
  actions,
  className 
}: TicketCardProps) {
  return (
    <Card className={cn("hover:shadow-md transition-shadow duration-200", className)}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            {/* Title and Badges */}
            <div className="flex items-start gap-3 mb-3">
              <Link 
                href={`/ticket/${ticket._id}`}
                className="text-xl font-semibold text-gray-900 hover:text-blue-600 transition-colors line-clamp-2 flex-1"
              >
                {ticket.title}
              </Link>
              <div className="flex gap-2 flex-wrap flex-shrink-0">
                <Badge variant={ticket.status as any}>
                  {formatStatus(ticket.status)}
                </Badge>
                <Badge variant={ticket.priority as any}>
                  {ticket.priority}
                </Badge>
                {ticket.category && (
                  <Badge variant="outline">
                    {ticket.category}
                  </Badge>
                )}
                {ticket.isVoiceTicket && (
                  <Badge variant="voice">
                    🎤 Voice
                  </Badge>
                )}
              </div>
            </div>
            
            {/* Description */}
            <p className="text-gray-600 mb-4 line-clamp-2">
              {ticket.description}
            </p>
            
            {/* Meta Information */}
            <div className="flex items-center gap-4 text-sm text-gray-500 flex-wrap">
              <span>Created: {formatDate(ticket.createdAt)}</span>
              <span>Updated: {formatDate(ticket.updatedAt)}</span>
              {showCustomer && ticket.customer?.name && (
                <span>Customer: {ticket.customer.name}</span>
              )}
              {showAgent && ticket.assignedAgent?.name && (
                <span>Agent: {ticket.assignedAgent.name}</span>
              )}
            </div>
          </div>
          
          {/* Actions */}
          {actions && (
            <div className="ml-6 flex-shrink-0">
              {actions}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
