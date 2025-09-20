"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function TicketForm() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const createTicket = useMutation(api.tickets.createTicket);
  const createUser = useMutation(api.users.createUser);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    setIsSubmitting(true);
    try {
      // For demo purposes, create a temporary customer user
      // In a real app, this would come from authentication
      const customerId = await createUser({
        email: "customer@demo.com",
        name: "Demo Customer",
        role: "customer",
      });

      await createTicket({
        title: title.trim(),
        description: description.trim(),
        customerId,
        priority: "medium",
      });

      // Reset form
      setTitle("");
      setDescription("");
      alert("Ticket created successfully!");
    } catch (error) {
      console.error("Error creating ticket:", error);
      alert("Failed to create ticket. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Create Support Ticket</CardTitle>
        <CardDescription>
          Describe your issue and we&apos;ll get back to you as soon as possible.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Subject
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-300"
              placeholder="Brief description of your issue"
              required
            />
          </div>
          
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={6}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-300 resize-none"
              placeholder="Please provide detailed information about your issue..."
              required
            />
          </div>
          
          <Button 
            type="submit" 
            disabled={isSubmitting || !title.trim() || !description.trim()}
            className="w-full"
          >
            {isSubmitting ? "Creating Ticket..." : "Create Ticket"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
