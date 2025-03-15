
import React from 'react';
import Navigation from '@/components/Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Book } from 'lucide-react';

const Journal = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Health Journal</h1>
          <Button className="gap-2">
            <PlusCircle size={18} />
            New Entry
          </Button>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="overflow-hidden hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl font-semibold">
                    {i === 0 ? "Morning Symptoms" : i === 1 ? "Energy Levels" : "Mood Tracking"}
                  </CardTitle>
                  <span className="text-sm text-muted-foreground">{`${new Date().getMonth() + 1}/${new Date().getDate() - i}/${new Date().getFullYear()}`}</span>
                </div>
                <CardDescription>
                  {i === 0 ? "Tracking daily symptoms" : i === 1 ? "Energy throughout the day" : "Mood fluctuations and triggers"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="line-clamp-3 text-muted-foreground">
                  {i === 0 
                    ? "Experienced mild cramping this morning with slight fatigue. Feeling better after breakfast and light stretching."
                    : i === 1 
                    ? "Energy levels higher in the morning, significant dip after lunch. Afternoon walk helped revitalize."
                    : "Started day feeling positive. Slight anxiety in afternoon meeting. Evening meditation helped calm nerves."}
                </p>
                <div className="flex justify-end mt-4">
                  <Button variant="ghost" size="sm">Read more</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="mt-8 text-center">
          <p className="text-muted-foreground mb-4">Track your health patterns to gain insights into your well-being</p>
          <Button variant="outline" className="gap-2">
            <Book size={16} />
            View Journal History
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Journal;
