"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function DemoSetup() {
  const [isSeeding, setIsSeeding] = useState(false);
  const [isSeeded, setIsSeeded] = useState(false);
  
  const seedDemoData = useMutation(api.demo.seedDemoData);

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

  if (isSeeded) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-4">
          <div className="flex items-center text-green-800">
            ✅ Demo data ready! You can now assign tickets to agents.
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
        <p className="text-sm text-yellow-800 mb-3">
          Initialize demo agents and team for testing the ticket assignment functionality.
        </p>
        <Button
          onClick={handleSeedData}
          disabled={isSeeding}
          variant="outline"
          className="border-yellow-300 text-yellow-800 hover:bg-yellow-100"
        >
          {isSeeding ? "Setting up..." : "Setup Demo Data"}
        </Button>
      </CardContent>
    </Card>
  );
}
