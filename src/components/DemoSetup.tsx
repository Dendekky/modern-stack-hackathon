"use client";

import { useState } from "react";
import { useMutation, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function DemoSetup() {
  const [isSeeding, setIsSeeding] = useState(false);
  const [isSeeded, setIsSeeded] = useState(false);
  const [isKnowledgeBaseSeeding, setIsKnowledgeBaseSeeding] = useState(false);
  const [isKnowledgeBaseSeeded, setIsKnowledgeBaseSeeded] = useState(false);
  
  const seedDemoData = useMutation(api.demo.seedDemoData);
  const setupDemoKnowledgeBase = useAction(api.demoKnowledgeBase.setupDemoKnowledgeBase);

  const handleSeedData = async () => {
    setIsSeeding(true);
    try {
      const result = await seedDemoData({});
      console.log("Demo data seeded:", result);
      setIsSeeded(true);
    } catch (error) {
      console.error("Error seeding demo data:", error);
    } finally {
      setIsSeeding(false);
    }
  };

  const handleSetupKnowledgeBase = async () => {
    setIsKnowledgeBaseSeeding(true);
    try {
      const result = await setupDemoKnowledgeBase({});
      console.log("Demo knowledge base setup:", result);
      setIsKnowledgeBaseSeeded(true);
    } catch (error) {
      console.error("Error setting up knowledge base:", error);
    } finally {
      setIsKnowledgeBaseSeeding(false);
    }
  };

  if (isSeeded && isKnowledgeBaseSeeded) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-4">
          <div className="flex items-center text-green-800">
            ✅ Demo ready! Agents and knowledge base (Convex, Resend, Firecrawl docs) are set up.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-yellow-200 bg-yellow-50">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg text-yellow-900">Demo Setup</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-yellow-800 mb-4">
          Initialize demo data for the full hackathon experience.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={handleSeedData}
            disabled={isSeeding || isSeeded}
            variant="outline"
            className="border-yellow-300 text-yellow-800 hover:bg-yellow-100"
          >
            {isSeeding ? "Setting up..." : isSeeded ? "✅ Agents Ready" : "Setup Demo Agents"}
          </Button>
          <Button
            onClick={handleSetupKnowledgeBase}
            disabled={isKnowledgeBaseSeeding || isKnowledgeBaseSeeded}
            variant="outline"
            className="border-yellow-300 text-yellow-800 hover:bg-yellow-100"
          >
            {isKnowledgeBaseSeeding ? "Loading docs..." : isKnowledgeBaseSeeded ? "✅ Docs Loaded" : "Load Knowledge Base"}
          </Button>
        </div>
        <p className="text-xs text-yellow-700 mt-3">
          Knowledge base includes Convex, Resend, and Firecrawl documentation for realistic AI responses.
        </p>
      </CardContent>
    </Card>
  );
}
