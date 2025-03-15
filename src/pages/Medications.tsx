
import React, { useState } from 'react';
import Navigation from '@/components/Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Pill, PlusCircle, Bell, Check, X, Calendar } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

const MedicationCard = ({ name, dosage, frequency, timeOfDay, nextDose, adherence, color }) => {
  const [taken, setTaken] = useState(false);

  return (
    <Card className={`border-l-4 border-l-${color}-500 hover:shadow-md transition-shadow`}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl font-semibold">{name}</CardTitle>
            <CardDescription>{dosage}</CardDescription>
          </div>
          <Badge variant={timeOfDay === "Morning" ? "default" : timeOfDay === "Evening" ? "secondary" : "outline"}>
            {timeOfDay}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm text-muted-foreground">{frequency}</span>
          <div className="flex items-center gap-1">
            <Calendar size={14} className="text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Next: {nextDose}</span>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm">Adherence</span>
            <span className="text-sm font-medium">{adherence}%</span>
          </div>
          <Progress value={adherence} className="h-2" />
        </div>
      </CardContent>
      <Separator />
      <CardFooter className="flex justify-between p-3 bg-muted/30">
        {taken ? (
          <div className="flex items-center gap-2 text-sm text-green-600">
            <Check size={16} />
            <span>Taken today</span>
          </div>
        ) : (
          <Button 
            variant="ghost" 
            size="sm" 
            className="gap-1"
            onClick={() => setTaken(true)}
          >
            <Check size={14} />
            Mark as taken
          </Button>
        )}
        <Button variant="ghost" size="sm">
          <Bell size={14} />
        </Button>
      </CardFooter>
    </Card>
  );
};

const Medications = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Medication Tracking</h1>
          <Button className="gap-2">
            <PlusCircle size={18} />
            Add Medication
          </Button>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <MedicationCard 
            name="Birth Control Pill" 
            dosage="1 tablet" 
            frequency="Daily" 
            timeOfDay="Morning"
            nextDose="Today, 8:00 AM"
            adherence={95}
            color="pink"
          />
          <MedicationCard 
            name="Iron Supplement" 
            dosage="65 mg" 
            frequency="Daily" 
            timeOfDay="Evening"
            nextDose="Today, 8:00 PM"
            adherence={82}
            color="blue"
          />
          <MedicationCard 
            name="Vitamin D" 
            dosage="1000 IU" 
            frequency="Daily" 
            timeOfDay="Morning"
            nextDose="Tomorrow, 8:00 AM"
            adherence={90}
            color="yellow"
          />
          <MedicationCard 
            name="Calcium" 
            dosage="500 mg" 
            frequency="Twice daily" 
            timeOfDay="Multiple"
            nextDose="Today, 1:00 PM"
            adherence={75}
            color="purple"
          />
        </div>
        
        <Card className="mb-8 p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Upcoming Refills</h3>
            <Button variant="outline" size="sm">
              View All
            </Button>
          </div>
          <Separator className="my-4" />
          <div className="space-y-4">
            {[
              { name: "Birth Control Pill", remaining: 7, date: "Nov 18, 2023" },
              { name: "Iron Supplement", remaining: 12, date: "Nov 23, 2023" }
            ].map((refill, i) => (
              <div key={i} className="flex justify-between items-center">
                <div>
                  <h4 className="font-medium">{refill.name}</h4>
                  <p className="text-sm text-muted-foreground">{refill.remaining} days remaining</p>
                </div>
                <div className="flex gap-2">
                  <span className="text-sm">{refill.date}</span>
                  <Button size="icon" variant="ghost" className="h-8 w-8">
                    <Bell size={14} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
        
        <div className="mt-8 text-center">
          <p className="text-muted-foreground mb-4">Track your medications and never miss a dose</p>
          <Button variant="outline" className="gap-2">
            <Pill size={16} />
            Medication History
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Medications;
