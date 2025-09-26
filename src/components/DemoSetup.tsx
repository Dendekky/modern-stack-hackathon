"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function DemoSetup() {
  const [isSeeding, setIsSeeding] = useState(false);
  const [isSeeded, setIsSeeded] = useState(false);
  const [isFixingRoles, setIsFixingRoles] = useState(false);
  const [rolesFixed, setRolesFixed] = useState(false);
  
  const seedDemoData = useMutation(api.demo.seedDemoData);
  const fixUnsetRoles = useMutation(api.users.fixUnsetRoles);

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


  const handleFixRoles = async () => {
    setIsFixingRoles(true);
    try {
      const result = await fixUnsetRoles({});
      console.log("Fixed user roles:", result);
      setRolesFixed(true);
      // Refresh the page to show updated roles
      window.location.reload();
    } catch (error) {
      console.error("Error fixing user roles:", error);
    } finally {
      setIsFixingRoles(false);
    }
  };

  if (isSeeded) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-4">
          <div className="flex items-center text-green-800">
            ✅ Demo ready! Agents are set up and ready to handle tickets.
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
            onClick={handleFixRoles}
            disabled={isFixingRoles || rolesFixed}
            variant="outline"
            className="border-red-300 text-red-800 hover:bg-red-100"
          >
            {isFixingRoles ? "Fixing..." : rolesFixed ? "✅ Roles Fixed" : "Fix User Roles"}
          </Button>
        </div>
        <p className="text-xs text-yellow-700 mt-3">
          Use Firecrawl integration to scrape documentation and build your knowledge base dynamically.<br />
          <strong>Fix User Roles</strong> if you see "unset" roles in the database.
        </p>
      </CardContent>
    </Card>
  );
}
