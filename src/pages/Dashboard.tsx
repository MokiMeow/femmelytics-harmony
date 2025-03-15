
import React, { useState } from "react";
import Navigation from "@/components/Navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import CycleInsightsDashboard from "@/components/dashboard/CycleInsightsDashboard";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("insights");

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto py-6 px-4 md:px-6">
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
        
        <CycleInsightsDashboard />
      </main>
    </div>
  );
};

export default Dashboard;
