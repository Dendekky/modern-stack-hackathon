"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { TicketStatus } from "@/types";
import type { Id } from "../../convex/_generated/dataModel";

interface TicketStatusUpdaterProps {
  ticketId: string;
  currentStatus: TicketStatus;
  onUpdate?: () => void;
}

const statusOptions: { value: TicketStatus; label: string; color: string }[] = [
  { value: "open", label: "Open", color: "bg-green-100 text-green-800" },
  { value: "in_progress", label: "In Progress", color: "bg-blue-100 text-blue-800" },
  { value: "resolved", label: "Resolved", color: "bg-gray-100 text-gray-800" },
  { value: "closed", label: "Closed", color: "bg-red-100 text-red-800" },
];

export function TicketStatusUpdater({ ticketId, currentStatus, onUpdate }: TicketStatusUpdaterProps) {
  const [selectedStatus, setSelectedStatus] = useState<TicketStatus>(currentStatus);
  const [selectedAgent, setSelectedAgent] = useState<string>("");
  const [isUpdating, setIsUpdating] = useState(false);

  const updateTicketStatus = useMutation(api.tickets.updateTicketStatus);
  const agents = useQuery(api.users.getAgents);

  const handleStatusUpdate = async () => {
    if (selectedStatus === currentStatus && !selectedAgent) return;

    setIsUpdating(true);
    try {
      await updateTicketStatus({
        ticketId: ticketId as Id<"tickets">,
        status: selectedStatus,
        assignedAgentId: selectedAgent ? (selectedAgent as Id<"users">) : undefined,
      });
      onUpdate?.();
    } catch (error) {
      console.error("Error updating ticket status:", error);
      alert("Failed to update ticket status. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-lg">Update Ticket Status</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as TicketStatus)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Assign Agent
          </label>
          <select
            value={selectedAgent}
            onChange={(e) => setSelectedAgent(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select an agent...</option>
            {agents?.map((agent) => (
              <option key={agent._id} value={agent._id}>
                {agent.name} ({agent.email})
              </option>
            ))}
          </select>
        </div>

        <Button
          onClick={handleStatusUpdate}
          disabled={isUpdating || (selectedStatus === currentStatus && !selectedAgent)}
          className="w-full"
        >
          {isUpdating ? "Updating..." : "Update Ticket"}
        </Button>
      </CardContent>
    </Card>
  );
}
