
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, Activity, Moon, Droplet, Thermometer, Heart, Plus, Save, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';

const Track = () => {
  const navigate = useNavigate();
  const [date, setDate] = useState<Date>(new Date());
  const [mood, setMood] = useState<number>(3);
  const [energy, setEnergy] = useState<number>(3);
  const [flow, setFlow] = useState<number>(0);
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [notes, setNotes] = useState<string>('');

  const moodLabels = ['Very Low', 'Low', 'Neutral', 'Good', 'Excellent'];
  const energyLabels = ['Exhausted', 'Tired', 'Normal', 'Energetic', 'Very Energetic'];
  const flowLabels = ['None', 'Light', 'Medium', 'Heavy', 'Very Heavy'];

  const commonSymptoms = [
    { id: 'headache', label: 'Headache', icon: <Thermometer className="h-4 w-4" /> },
    { id: 'cramps', label: 'Cramps', icon: <Activity className="h-4 w-4" /> },
    { id: 'bloating', label: 'Bloating', icon: <Droplet className="h-4 w-4" /> },
    { id: 'fatigue', label: 'Fatigue', icon: <Moon className="h-4 w-4" /> },
    { id: 'nausea', label: 'Nausea', icon: <Droplet className="h-4 w-4" /> },
    { id: 'backPain', label: 'Back Pain', icon: <Activity className="h-4 w-4" /> },
    { id: 'cravings', label: 'Cravings', icon: <Heart className="h-4 w-4" /> },
    { id: 'insomnia', label: 'Insomnia', icon: <Moon className="h-4 w-4" /> },
  ];

  const toggleSymptom = (symptomId: string) => {
    if (symptoms.includes(symptomId)) {
      setSymptoms(symptoms.filter((id) => id !== symptomId));
    } else {
      setSymptoms([...symptoms, symptomId]);
    }
  };

  const handleSave = () => {
    // Here we would save the tracking data
    // For now, just simulate and navigate to dashboard
    console.log({
      date,
      mood,
      energy,
      flow,
      symptoms,
      notes
    });
    
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="pt-24 pb-16 px-4 md:px-6 max-w-4xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 flex items-center"
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="mr-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-semibold">Track Your Health</h1>
        </motion.div>
        
        <Tabs defaultValue="cycle" className="w-full">
          <TabsList className="grid grid-cols-3 mb-8">
            <TabsTrigger value="cycle">Cycle Tracking</TabsTrigger>
            <TabsTrigger value="mood">Mood & Energy</TabsTrigger>
            <TabsTrigger value="symptoms">Symptoms</TabsTrigger>
          </TabsList>
          
          <div className="space-y-8">
            {/* Date Selector */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-medium mb-1 flex items-center">
                      <Calendar className="h-5 w-5 mr-2 text-lavender-500" />
                      Date
                    </h2>
                    <p className="text-sm text-muted-foreground">Select the date you want to track</p>
                  </div>
                  
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full sm:w-auto justify-start text-left font-normal"
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        {format(date, 'PPP')}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="center">
                      <CalendarComponent
                        mode="single"
                        selected={date}
                        onSelect={(date) => date && setDate(date)}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </CardContent>
            </Card>
            
            <TabsContent value="cycle" className="mt-0 space-y-6">
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-lg font-medium mb-4 flex items-center">
                    <Droplet className="h-5 w-5 mr-2 text-coral-500" />
                    Flow Intensity
                  </h2>
                  
                  <div className="space-y-6">
                    <Slider
                      defaultValue={[flow]}
                      max={4}
                      step={1}
                      onValueChange={(value) => setFlow(value[0])}
                      className="py-4"
                    />
                    
                    <div className="grid grid-cols-5 gap-2 text-center text-sm text-muted-foreground">
                      {flowLabels.map((label, index) => (
                        <div 
                          key={index} 
                          className={cn(
                            "py-1 rounded transition-colors",
                            flow === index ? "bg-lavender-100 text-lavender-700 font-medium" : ""
                          )}
                        >
                          {label}
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="mood" className="mt-0 space-y-6">
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-lg font-medium mb-4 flex items-center">
                    <Heart className="h-5 w-5 mr-2 text-coral-500" />
                    Mood
                  </h2>
                  
                  <div className="space-y-6">
                    <Slider
                      defaultValue={[mood]}
                      max={4}
                      step={1}
                      onValueChange={(value) => setMood(value[0])}
                      className="py-4"
                    />
                    
                    <div className="grid grid-cols-5 gap-2 text-center text-sm text-muted-foreground">
                      {moodLabels.map((label, index) => (
                        <div 
                          key={index} 
                          className={cn(
                            "py-1 rounded transition-colors",
                            mood === index ? "bg-lavender-100 text-lavender-700 font-medium" : ""
                          )}
                        >
                          {label}
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-lg font-medium mb-4 flex items-center">
                    <Activity className="h-5 w-5 mr-2 text-teal-500" />
                    Energy Level
                  </h2>
                  
                  <div className="space-y-6">
                    <Slider
                      defaultValue={[energy]}
                      max={4}
                      step={1}
                      onValueChange={(value) => setEnergy(value[0])}
                      className="py-4"
                    />
                    
                    <div className="grid grid-cols-5 gap-2 text-center text-sm text-muted-foreground">
                      {energyLabels.map((label, index) => (
                        <div 
                          key={index} 
                          className={cn(
                            "py-1 rounded transition-colors",
                            energy === index ? "bg-lavender-100 text-lavender-700 font-medium" : ""
                          )}
                        >
                          {label}
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="symptoms" className="mt-0 space-y-6">
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-lg font-medium mb-4">Symptoms</h2>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {commonSymptoms.map((symptom) => (
                      <button
                        key={symptom.id}
                        type="button"
                        onClick={() => toggleSymptom(symptom.id)}
                        className={cn(
                          "border rounded-xl p-3 text-sm flex flex-col items-center justify-center gap-2 transition-all",
                          symptoms.includes(symptom.id)
                            ? "bg-lavender-100 border-lavender-300 text-lavender-700"
                            : "border-border hover:border-lavender-200 hover:bg-lavender-50"
                        )}
                      >
                        <div className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center",
                          symptoms.includes(symptom.id)
                            ? "bg-lavender-200"
                            : "bg-muted"
                        )}>
                          {symptom.icon}
                        </div>
                        <span>{symptom.label}</span>
                      </button>
                    ))}
                    
                    <button
                      type="button"
                      className="border border-dashed border-border rounded-xl p-3 text-sm flex flex-col items-center justify-center gap-2 hover:border-lavender-200 hover:bg-lavender-50 transition-all"
                    >
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                        <Plus className="h-4 w-4" />
                      </div>
                      <span>Add Custom</span>
                    </button>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-lg font-medium mb-4">Notes</h2>
                  <textarea
                    className="w-full p-3 rounded-xl border border-border bg-muted/50 min-h-32 focus:outline-none focus:ring-2 focus:ring-lavender-200 transition-all"
                    placeholder="Add any additional notes about how you're feeling today..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </div>
          
          <div className="mt-8 flex justify-end">
            <Button
              className="bg-primary hover:bg-primary/90 text-white px-6"
              onClick={handleSave}
            >
              <Save className="h-4 w-4 mr-2" />
              Save Entry
            </Button>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default Track;
