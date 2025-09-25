"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";

export function TicketForm() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: session } = authClient.useSession();
  const router = useRouter();
  
  const createTicket = useMutation(api.tickets.createTicket);
  const getUserByEmail = useQuery(
    api.users.getUserByEmail,
    session?.user?.email ? { email: session.user.email } : "skip"
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    setIsSubmitting(true);
    try {
      // Must be signed in to create tickets now
      if (!session?.user?.email || !getUserByEmail?._id) {
        alert("Please sign in to create a ticket.");
        setIsSubmitting(false);
        return;
      }

      await createTicket({
        title: title.trim(),
        description: description.trim(),
        customerId: getUserByEmail._id,
        priority: "medium",
      });

      // Reset form
      setTitle("");
      setDescription("");
      
      // Redirect to customer tickets page if user is a customer
      if (getUserByEmail?.role === "customer") {
        router.push("/my-tickets");
      } else {
        alert("Ticket created successfully!");
      }
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
