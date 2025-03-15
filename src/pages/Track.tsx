
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, Activity, Moon, Droplet, Thermometer, Heart, Plus, Save, ArrowLeft, X } from 'lucide-react';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { fetchDayEntry, saveTrackingData } from '@/services/trackerService';

const Track = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [date, setDate] = useState<Date>(new Date());
  const [mood, setMood] = useState<number>(3);
  const [energy, setEnergy] = useState<number>(3);
  const [flow, setFlow] = useState<number>(0);
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [notes, setNotes] = useState<string>('');
  const [isFetchingData, setIsFetchingData] = useState(false);
  const [customSymptomDialogOpen, setCustomSymptomDialogOpen] = useState(false);
  const [newCustomSymptom, setNewCustomSymptom] = useState('');
  const [customSymptoms, setCustomSymptoms] = useState<{id: string, label: string}[]>([]);

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

  // Load custom symptoms from localStorage on mount
  useEffect(() => {
    const savedCustomSymptoms = localStorage.getItem('customSymptoms');
    if (savedCustomSymptoms) {
      setCustomSymptoms(JSON.parse(savedCustomSymptoms));
    }
  }, []);

  // Save custom symptoms to localStorage when they change
  useEffect(() => {
    if (customSymptoms.length > 0) {
      localStorage.setItem('customSymptoms', JSON.stringify(customSymptoms));
    }
  }, [customSymptoms]);

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  // Fetch data for selected date
  useEffect(() => {
    const loadDayEntry = async () => {
      if (!user) return;
      
      setIsFetchingData(true);
      try {
        const data = await fetchDayEntry(date);
        
        // Set flow
        if (data.cycle) {
          const flowMap: Record<string, number> = {
            'none': 0,
            'light': 1,
            'medium': 2,
            'heavy': 3,
            'very_heavy': 4
          };
          setFlow(flowMap[data.cycle.flow_intensity] || 0);
        } else {
          setFlow(0);
        }
        
        // Set mood and energy
        if (data.mood) {
          setMood(data.mood.mood_score);
          setEnergy(data.mood.energy_score);
          if (data.mood.notes) {
            setNotes(data.mood.notes);
          }
        } else {
          setMood(3);
          setEnergy(3);
        }
        
        // Set symptoms
        if (data.symptoms && data.symptoms.length > 0) {
          setSymptoms(data.symptoms.map(s => s.symptom_type));
        } else {
          setSymptoms([]);
        }
        
      } catch (error) {
        console.error("Error loading day entry:", error);
      } finally {
        setIsFetchingData(false);
      }
    };
    
    loadDayEntry();
  }, [date, user]);

  const toggleSymptom = (symptomId: string) => {
    if (symptoms.includes(symptomId)) {
      setSymptoms(symptoms.filter((id) => id !== symptomId));
    } else {
      setSymptoms([...symptoms, symptomId]);
    }
  };

  const handleAddCustomSymptom = () => {
    if (newCustomSymptom.trim()) {
      const newSymptomId = `custom-${Date.now()}`;
      const newSymptom = {
        id: newSymptomId,
        label: newCustomSymptom.trim()
      };
      
      setCustomSymptoms([...customSymptoms, newSymptom]);
      setSymptoms([...symptoms, newSymptomId]);
      setNewCustomSymptom('');
      setCustomSymptomDialogOpen(false);
      
      toast({
        title: "Symptom added",
        description: `"${newCustomSymptom.trim()}" has been added to your symptoms.`,
      });
    }
  };

  const handleRemoveCustomSymptom = (id: string) => {
    setCustomSymptoms(customSymptoms.filter(symptom => symptom.id !== id));
    setSymptoms(symptoms.filter(symptomId => symptomId !== id));
  };

  const handleSave = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to save your data.",
        variant: "destructive"
      });
      navigate('/auth');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Convert flow number to intensity string
      const flowIntensity = ['none', 'light', 'medium', 'heavy', 'very_heavy'][flow] as 'none' | 'light' | 'medium' | 'heavy' | 'very_heavy';
      
      await saveTrackingData(
        date,
        flowIntensity,
        mood,
        energy,
        symptoms,
        notes
      );
      
      toast({
        title: "Entry saved",
        description: "Your tracking data has been successfully saved.",
      });
      
      navigate('/dashboard');
    } catch (error) {
      console.error("Error saving tracking data:", error);
      toast({
        title: "Error saving data",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetchingData) {
    return (
      <div className="min-h-screen bg-background flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

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
                      value={[flow]}
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
                            flow === index ? "bg-lavender-100 text-lavender-700 font-medium dark:bg-lavender-900 dark:text-lavender-200" : ""
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
                      value={[mood]}
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
                            mood === index ? "bg-lavender-100 text-lavender-700 font-medium dark:bg-lavender-900 dark:text-lavender-200" : ""
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
                      value={[energy]}
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
                            energy === index ? "bg-lavender-100 text-lavender-700 font-medium dark:bg-lavender-900 dark:text-lavender-200" : ""
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
                            ? "bg-lavender-100 border-lavender-300 text-lavender-700 dark:bg-lavender-900 dark:border-lavender-700 dark:text-lavender-200"
                            : "border-border hover:border-lavender-200 hover:bg-lavender-50 dark:hover:bg-lavender-950 dark:hover:border-lavender-800"
                        )}
                      >
                        <div className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center",
                          symptoms.includes(symptom.id)
                            ? "bg-lavender-200 dark:bg-lavender-800"
                            : "bg-muted"
                        )}>
                          {symptom.icon}
                        </div>
                        <span>{symptom.label}</span>
                      </button>
                    ))}
                    
                    {customSymptoms.map((symptom) => (
                      <button
                        key={symptom.id}
                        type="button"
                        onClick={() => toggleSymptom(symptom.id)}
                        className={cn(
                          "border rounded-xl p-3 text-sm flex flex-col items-center justify-center gap-2 transition-all relative",
                          symptoms.includes(symptom.id)
                            ? "bg-lavender-100 border-lavender-300 text-lavender-700 dark:bg-lavender-900 dark:border-lavender-700 dark:text-lavender-200"
                            : "border-border hover:border-lavender-200 hover:bg-lavender-50 dark:hover:bg-lavender-950 dark:hover:border-lavender-800"
                        )}
                      >
                        <div className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center",
                          symptoms.includes(symptom.id)
                            ? "bg-lavender-200 dark:bg-lavender-800"
                            : "bg-muted"
                        )}>
                          <Heart className="h-4 w-4" />
                        </div>
                        <span>{symptom.label}</span>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="absolute top-1 right-1 h-5 w-5 rounded-full bg-muted/50 hover:bg-red-100 dark:hover:bg-red-900"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveCustomSymptom(symptom.id);
                          }}
                        >
                          <X className="h-3 w-3 text-muted-foreground" />
                        </Button>
                      </button>
                    ))}
                    
                    <button
                      type="button"
                      onClick={() => setCustomSymptomDialogOpen(true)}
                      className="border border-dashed border-border rounded-xl p-3 text-sm flex flex-col items-center justify-center gap-2 hover:border-lavender-200 hover:bg-lavender-50 dark:hover:bg-lavender-950 dark:hover:border-lavender-800 transition-all"
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
                    className="w-full p-3 rounded-xl border border-border bg-muted/50 min-h-32 focus:outline-none focus:ring-2 focus:ring-lavender-200 transition-all dark:focus:ring-lavender-800"
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
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  <span>Saving...</span>
                </div>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Entry
                </>
              )}
            </Button>
          </div>
        </Tabs>
      </div>
      
      {/* Custom Symptom Dialog */}
      <Dialog open={customSymptomDialogOpen} onOpenChange={setCustomSymptomDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Custom Symptom</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={newCustomSymptom}
              onChange={(e) => setNewCustomSymptom(e.target.value)}
              placeholder="Enter symptom name..."
              className="w-full"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter' && newCustomSymptom.trim()) {
                  handleAddCustomSymptom();
                }
              }}
            />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button 
              onClick={handleAddCustomSymptom}
              disabled={!newCustomSymptom.trim()}
            >
              Add Symptom
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Track;
