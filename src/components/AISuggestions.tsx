"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

interface AISuggestionsProps {
  suggestions?: {
    category?: string;
    priority?: string;
    suggestedReply?: string;
    relevantDocs?: string[];
  };
  isLoading?: boolean;
  ticketId?: Id<"tickets">;
  agentId?: Id<"authUsers">;
  showSendButton?: boolean;
  onCopyToManualReply?: (text: string) => void;
}

export function AISuggestions({ suggestions, isLoading, ticketId, agentId, showSendButton = false, onCopyToManualReply }: AISuggestionsProps) {
  const [showFullReply, setShowFullReply] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const sendAIReply = useMutation(api.tickets.sendAIReply);

  const handleSendAIReply = async () => {
    if (!suggestions?.suggestedReply || !ticketId || !agentId || isSending) return;
    
    setIsSending(true);
    try {
      await sendAIReply({
        ticketId,
        agentId,
        aiSuggestedReply: suggestions.suggestedReply,
      });
    } catch (error) {
      console.error("Error sending AI reply:", error);
    } finally {
      setIsSending(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-blue-900 flex items-center">
            🤖 AI Analysis
            <div className="ml-2 animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-blue-800">
            Analyzing ticket content and generating suggestions...
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!suggestions) {
    return null;
  }

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg text-blue-900 flex items-center">
          🤖 AI Analysis & Suggestions
          <span className="ml-2 px-2 py-1 text-xs bg-blue-200 text-blue-800 rounded-full">
            PRO FEATURE
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          {suggestions.category && (
            <div>
              <h4 className="font-medium text-blue-900 mb-1">Category</h4>
              <span className="inline-block px-2 py-1 bg-blue-200 text-blue-800 rounded-full text-sm">
                {suggestions.category.replace('_', ' ').toUpperCase()}
              </span>
            </div>
          )}
          
          {suggestions.priority && (
            <div>
              <h4 className="font-medium text-blue-900 mb-1">Suggested Priority</h4>
              <span className={`inline-block px-2 py-1 rounded-full text-sm ${
                suggestions.priority === 'urgent' ? 'bg-red-200 text-red-800' :
                suggestions.priority === 'high' ? 'bg-orange-200 text-orange-800' :
                suggestions.priority === 'medium' ? 'bg-yellow-200 text-yellow-800' :
                'bg-green-200 text-green-800'
              }`}>
                {suggestions.priority.toUpperCase()}
              </span>
            </div>
          )}
        </div>

        {suggestions.suggestedReply && (
          <div>
            <h4 className="font-medium text-blue-900 mb-2">Suggested Reply</h4>
            <div className="bg-white p-3 rounded-md border">
              <p className="text-sm text-gray-700">
                {showFullReply 
                  ? suggestions.suggestedReply 
                  : `${suggestions.suggestedReply.substring(0, 100)}${suggestions.suggestedReply.length > 100 ? '...' : ''}`
                }
              </p>
              {suggestions.suggestedReply.length > 100 && (
                <Button
                  variant="link"
                  size="sm"
                  onClick={() => setShowFullReply(!showFullReply)}
                  className="p-0 h-auto text-blue-600"
                >
                  {showFullReply ? 'Show less' : 'Show more'}
                </Button>
              )}
            </div>
            {showSendButton && (
              <div className="flex space-x-2 mt-2">
                <Button 
                  size="sm" 
                  variant="default" 
                  className="text-xs bg-blue-600 hover:bg-blue-700"
                  onClick={handleSendAIReply}
                  disabled={isSending}
                >
                  {isSending ? "Sending..." : "Send as AI Reply"}
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="text-xs"
                  onClick={() => onCopyToManualReply?.(suggestions.suggestedReply!)}
                >
                  Copy to Manual Reply
                </Button>
              </div>
            )}
          </div>
        )}

        {suggestions.relevantDocs && suggestions.relevantDocs.length > 0 && (
          <div>
            <h4 className="font-medium text-blue-900 mb-2">Relevant Documentation</h4>
            <div className="space-y-1">
              {suggestions.relevantDocs.map((doc, index) => (
                <div key={index} className="text-sm text-blue-700 hover:text-blue-900">
                  📄 {doc}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="pt-2 border-t border-blue-200">
          <p className="text-xs text-blue-600">
            💡 AI suggestions are powered by OpenAI and help agents respond faster and more accurately.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
