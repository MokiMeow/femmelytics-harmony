
import React, { useState } from "react";
import Navigation from "@/components/Navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import CycleInsightsDashboard from "@/components/dashboard/CycleInsightsDashboard";
import MedicationTracking from "@/components/medication/MedicationTracking";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("insights");

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto py-6 px-4 md:px-6">
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
        
        <Tabs 
          defaultValue={activeTab} 
          onValueChange={setActiveTab} 
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="insights">Cycle Insights</TabsTrigger>
            <TabsTrigger value="medications">Medications</TabsTrigger>
          </TabsList>
          
          <TabsContent value="insights" className="mt-0">
            <CycleInsightsDashboard />
          </TabsContent>
          
          <TabsContent value="medications" className="mt-0">
            <MedicationTracking />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Dashboard;
