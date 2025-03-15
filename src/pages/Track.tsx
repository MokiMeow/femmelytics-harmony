import React from "react";
import Navigation from "@/components/Navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import MedicationTracking from "@/components/medication/MedicationTracking";

const Track = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto py-6 px-4 md:px-6">
        <h1 className="text-3xl font-bold mb-6">Track Health Data</h1>

        <Tabs defaultValue="medications" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="symptoms">Symptoms</TabsTrigger>
            <TabsTrigger value="mood">Mood</TabsTrigger>
            <TabsTrigger value="medications">Medications</TabsTrigger>
          </TabsList>

          <TabsContent value="symptoms" className="mt-0">
            <div className="grid gap-4">
              <Card className="p-6">
                <h3 className="text-xl font-medium mb-4">Symptom Tracking</h3>
                <p className="text-muted-foreground">
                  Track your symptoms to identify patterns and triggers.
                </p>
                {/* Symptom tracking content will go here */}
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="mood" className="mt-0">
            <div className="grid gap-4">
              <Card className="p-6">
                <h3 className="text-xl font-medium mb-4">Mood Tracking</h3>
                <p className="text-muted-foreground">
                  Monitor your mood to better understand your emotional wellbeing.
                </p>
                {/* Mood tracking content will go here */}
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="medications" className="mt-0">
            <MedicationTracking />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Track;
