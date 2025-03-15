import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Pill, Calendar as CalendarIcon, Clock, Plus, Edit2, Trash2, CheckCircle2, XCircle, Bell, Syringe, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { format, parseISO, isToday, isFuture, isPast, addDays, isWithinInterval } from "date-fns";

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  start_date: string;
  end_date: string | null;
  time_of_day: string[];
  notes: string | null;
  user_id: string;
  created_at: string;
  active: boolean;
}

interface MedicationHistory {
  id: string;
  medication_id: string;
  taken_at: string;
  taken: boolean;
  notes?: string | null;
  created_at: string;
}

const FREQUENCIES = [
  { value: "daily", label: "Daily" },
  { value: "every_other_day", label: "Every Other Day" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "as_needed", label: "As Needed" },
];

const TIME_OPTIONS = [
  { value: "morning", label: "Morning", icon: "🌅" },
  { value: "afternoon", label: "Afternoon", icon: "🌞" },
  { value: "evening", label: "Evening", icon: "🌆" },
  { value: "night", label: "Night", icon: "🌙" },
  { value: "with_food", label: "With Food", icon: "🍽️" },
];

const MedicationTracking = () => {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [history, setHistory] = useState<Record<string, MedicationHistory[]>>({});
  const [newMedication, setNewMedication] = useState<Partial<Medication>>({
    name: "",
    dosage: "",
    frequency: "daily",
    time_of_day: ["morning"],
    start_date: format(new Date(), 'yyyy-MM-dd'),
    active: true,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [historyDate, setHistoryDate] = useState<Date>(new Date());
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchMedications();
    }
  }, [user]);

  useEffect(() => {
    if (user && medications.length > 0) {
      fetchHistoryForDate(historyDate);
    }
  }, [user, medications, historyDate]);

  const fetchMedications = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('medications')
        .select('*')
        .eq('user_id', user.id)
        .order('name');

      if (error) throw error;
      
      const transformedData = data.map(med => ({
        ...med,
        time_of_day: typeof med.time_of_day === 'string' ? JSON.parse(med.time_of_day) : med.time_of_day,
        active: med.active !== undefined ? med.active : true
      }));
      
      setMedications(transformedData);
    } catch (error) {
      console.error('Error fetching medications:', error);
      toast({
        title: "Failed to load medications",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchHistoryForDate = async (date: Date) => {
    if (!user || medications.length === 0) return;

    try {
      const formattedDate = format(date, 'yyyy-MM-dd');
      const nextDay = format(addDays(date, 1), 'yyyy-MM-dd');

      const { data, error } = await supabase
        .from('medication_history')
        .select('*')
        .gte('taken_at', `${formattedDate}T00:00:00`)
        .lt('taken_at', `${nextDay}T00:00:00`)
        .in('medication_id', medications.map(med => med.id));

      if (error) throw error;

      const historyByMedication: Record<string, MedicationHistory[]> = {};
      data.forEach(entry => {
        if (!historyByMedication[entry.medication_id]) {
          historyByMedication[entry.medication_id] = [];
        }
        historyByMedication[entry.medication_id].push({
          id: entry.id,
          medication_id: entry.medication_id,
          taken_at: entry.taken_at,
          taken: entry.taken,
          notes: entry.notes || null,
          created_at: entry.created_at
        });
      });

      setHistory(historyByMedication);
    } catch (error) {
      console.error('Error fetching medication history:', error);
    }
  };

  const saveMedication = async () => {
    if (!user) return;
    if (!newMedication.name?.trim() || !newMedication.dosage?.trim()) {
      toast({
        title: "Missing information",
        description: "Please provide both a name and dosage for your medication.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const timeOfDayForDb = JSON.stringify(newMedication.time_of_day);
      
      if (isEditing && newMedication.id) {
        const { error } = await supabase
          .from('medications')
          .update({
            name: newMedication.name,
            dosage: newMedication.dosage,
            frequency: newMedication.frequency,
            start_date: newMedication.start_date,
            end_date: newMedication.end_date,
            time_of_day: timeOfDayForDb,
            notes: newMedication.notes,
            active: newMedication.active,
          })
          .eq('id', newMedication.id)
          .eq('user_id', user.id);

        if (error) throw error;

        toast({
          title: "Medication updated",
          description: "Your medication has been updated successfully.",
        });
      } else {
        const { error } = await supabase
          .from('medications')
          .insert({
            user_id: user.id,
            name: newMedication.name,
            dosage: newMedication.dosage,
            frequency: newMedication.frequency,
            start_date: newMedication.start_date,
            end_date: newMedication.end_date || null,
            time_of_day: timeOfDayForDb,
            notes: newMedication.notes || null,
            active: true,
          });

        if (error) throw error;

        toast({
          title: "Medication added",
          description: "Your medication has been added successfully.",
        });
      }

      resetForm();
      fetchMedications();
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error saving medication:', error);
      toast({
        title: "Failed to save medication",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deleteMedication = async (id: string) => {
    if (!user) return;
    if (!confirm("Are you sure you want to delete this medication?")) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('medications')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Medication deleted",
        description: "Your medication has been deleted successfully.",
      });

      fetchMedications();
    } catch (error) {
      console.error('Error deleting medication:', error);
      toast({
        title: "Failed to delete medication",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const recordMedicationTaken = async (medicationId: string, taken: boolean, notes: string = "") => {
    if (!user) return;

    try {
      const now = new Date();
      const { error } = await supabase
        .from('medication_history')
        .insert({
          user_id: user.id,
          medication_id: medicationId,
          taken_at: now.toISOString(),
          taken: taken,
          notes: notes || null,
        });

      if (error) throw error;

      toast({
        title: taken ? "Medication taken" : "Medication skipped",
        description: taken ? "Successfully recorded as taken" : "Successfully recorded as skipped",
      });

      fetchHistoryForDate(historyDate);
    } catch (error) {
      console.error('Error recording medication history:', error);
      toast({
        title: "Failed to record medication",
        description: "Please try again later.",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setNewMedication({
      name: "",
      dosage: "",
      frequency: "daily",
      time_of_day: ["morning"],
      start_date: format(new Date(), 'yyyy-MM-dd'),
      active: true,
    });
    setIsEditing(false);
  };

  const editMedication = (medication: Medication) => {
    setNewMedication(medication);
    setIsEditing(true);
    setIsDialogOpen(true);
  };

  const hasTakenMedication = (medicationId: string, timeOfDay: string): boolean => {
    if (!history[medicationId]) return false;
    
    return history[medicationId].some(record => {
      const recordHour = new Date(record.taken_at).getHours();
      let timeRange: [number, number] = [0, 0];
      
      switch (timeOfDay) {
        case "morning": timeRange = [5, 11]; break;
        case "afternoon": timeRange = [12, 16]; break;
        case "evening": timeRange = [17, 21]; break;
        case "night": timeRange = [22, 4]; break;
        case "with_food": return true; // Special case, just check if any record exists
        default: return false;
      }
      
      const inRange = timeRange[0] <= recordHour || recordHour <= timeRange[1];
      return record.taken && inRange;
    });
  };

  const isMedicationActive = (medication: Medication): boolean => {
    if (!medication.active) return false;
    
    const startDate = parseISO(medication.start_date);
    const today = new Date();
    
    if (isPast(startDate)) {
      if (medication.end_date) {
        const endDate = parseISO(medication.end_date);
        return !isPast(endDate);
      }
      return true;
    }
    
    return false;
  };

  const getFrequencyLabel = (frequency: string): string => {
    return FREQUENCIES.find(f => f.value === frequency)?.label || frequency;
  };

  const activeMedications = medications.filter(med => isMedicationActive(med));
  const inactiveMedications = medications.filter(med => !isMedicationActive(med));

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold flex items-center">
          <Pill className="mr-2 h-5 w-5" /> Medication Tracking
        </h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" />
              Add Medication
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{isEditing ? "Edit Medication" : "Add New Medication"}</DialogTitle>
              <DialogDescription>
                {isEditing 
                  ? "Update your medication details below" 
                  : "Enter the details of your medication below"}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input
                  id="name"
                  value={newMedication.name || ""}
                  onChange={(e) => setNewMedication({ ...newMedication, name: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="dosage" className="text-right">
                  Dosage
                </Label>
                <Input
                  id="dosage"
                  value={newMedication.dosage || ""}
                  placeholder="e.g., 10mg, 1 tablet"
                  onChange={(e) => setNewMedication({ ...newMedication, dosage: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="frequency" className="text-right">
                  Frequency
                </Label>
                <Select
                  value={newMedication.frequency || "daily"}
                  onValueChange={(value) => setNewMedication({ ...newMedication, frequency: value })}
                >
                  <SelectTrigger id="frequency" className="col-span-3">
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    {FREQUENCIES.map((freq) => (
                      <SelectItem key={freq.value} value={freq.value}>
                        {freq.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label className="text-right pt-2">
                  Time of Day
                </Label>
                <div className="flex flex-col gap-2 col-span-3">
                  {TIME_OPTIONS.map((time) => (
                    <div key={time.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`time-${time.value}`}
                        checked={(newMedication.time_of_day || []).includes(time.value)}
                        onCheckedChange={(checked) => {
                          const currentTimes = [...(newMedication.time_of_day || [])];
                          if (checked) {
                            if (!currentTimes.includes(time.value)) {
                              currentTimes.push(time.value);
                            }
                          } else {
                            const index = currentTimes.indexOf(time.value);
                            if (index !== -1) {
                              currentTimes.splice(index, 1);
                            }
                          }
                          setNewMedication({ ...newMedication, time_of_day: currentTimes });
                        }}
                      />
                      <Label htmlFor={`time-${time.value}`} className="text-sm font-normal flex items-center">
                        <span className="mr-1">{time.icon}</span> {time.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">
                  Start Date
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "col-span-3 justify-start text-left font-normal",
                        !newMedication.start_date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {newMedication.start_date 
                        ? format(parseISO(newMedication.start_date), "PPP")
                        : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={newMedication.start_date ? parseISO(newMedication.start_date) : undefined}
                      onSelect={(date) => date && setNewMedication({ 
                        ...newMedication, 
                        start_date: format(date, 'yyyy-MM-dd') 
                      })}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">
                  End Date
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "col-span-3 justify-start text-left font-normal",
                        !newMedication.end_date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {newMedication.end_date 
                        ? format(parseISO(newMedication.end_date), "PPP")
                        : "Ongoing"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <div className="p-2">
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start" 
                        onClick={() => setNewMedication({ ...newMedication, end_date: undefined })}
                      >
                        No end date (ongoing)
                      </Button>
                    </div>
                    <Calendar
                      mode="single"
                      selected={newMedication.end_date ? parseISO(newMedication.end_date) : undefined}
                      onSelect={(date) => date && setNewMedication({ 
                        ...newMedication, 
                        end_date: format(date, 'yyyy-MM-dd') 
                      })}
                      initialFocus
                      disabled={(date) => {
                        if (!newMedication.start_date) return false;
                        return date < parseISO(newMedication.start_date);
                      }}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="notes" className="text-right pt-2">
                  Notes
                </Label>
                <Textarea
                  id="notes"
                  value={newMedication.notes || ""}
                  placeholder="Special instructions or additional notes"
                  onChange={(e) => setNewMedication({ ...newMedication, notes: e.target.value })}
                  className="col-span-3"
                />
              </div>
              {isEditing && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="active" className="text-right">
                    Status
                  </Label>
                  <div className="col-span-3">
                    <Select
                      value={newMedication.active ? "active" : "inactive"}
                      onValueChange={(value) => setNewMedication({ 
                        ...newMedication, 
                        active: value === "active" 
                      })}
                    >
                      <SelectTrigger id="active">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={saveMedication} disabled={isLoading}>
                {isEditing ? "Update" : "Add"} Medication
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="today" className="w-full">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="today">Today</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="all">All Medications</TabsTrigger>
        </TabsList>

        <TabsContent value="today" className="space-y-4">
          <div className="flex justify-end">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-auto justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(historyDate, "PPP")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={historyDate}
                  onSelect={(date) => date && setHistoryDate(date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {isLoading && activeMedications.length === 0 ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : activeMedications.length === 0 ? (
            <Card className="p-8 text-center">
              <Pill className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium">No active medications</p>
              <p className="text-muted-foreground mt-1 mb-4">
                Add a medication to start tracking
              </p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Medication
              </Button>
            </Card>
          ) : (
            <>
              {activeMedications.map((medication) => (
                <Card key={medication.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex justify-between items-start">
                      <span>{medication.name}</span>
                      <Badge variant="outline">
                        {getFrequencyLabel(medication.frequency)}
                      </Badge>
                    </CardTitle>
                    <CardDescription>{medication.dosage}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex flex-wrap gap-2">
                        {medication.time_of_day.map((time) => {
                          const timeOption = TIME_OPTIONS.find(t => t.value === time);
                          const taken = hasTakenMedication(medication.id, time);
                          
                          return (
                            <div 
                              key={time} 
                              className={cn(
                                "flex items-center p-2 border rounded-md",
                                taken ? "bg-primary/10 border-primary" : "border-muted"
                              )}
                            >
                              <span className="mr-2">{timeOption?.icon}</span>
                              <span>{timeOption?.label}</span>
                              {taken ? (
                                <CheckCircle2 className="ml-2 h-4 w-4 text-primary" />
                              ) : (
                                <Clock className="ml-2 h-4 w-4 text-muted-foreground" />
                              )}
                            </div>
                          );
                        })}
                      </div>
                      
                      {medication.notes && (
                        <div className="text-sm text-muted-foreground bg-muted p-2 rounded-md">
                          <p className="font-medium">Notes:</p>
                          <p>{medication.notes}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="justify-between border-t p-4">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="mr-1 h-4 w-4" />
                      {!medication.end_date ? (
                        <span>Started {format(parseISO(medication.start_date), "MMM d, yyyy")} • Ongoing</span>
                      ) : (
                        <span>
                          {format(parseISO(medication.start_date), "MMM d, yyyy")} to {format(parseISO(medication.end_date), "MMM d, yyyy")}
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-destructive hover:text-destructive"
                        onClick={() => recordMedicationTaken(medication.id, false)}
                      >
                        <XCircle className="mr-1 h-4 w-4" />
                        Skip
                      </Button>
                      <Button 
                        size="sm"
                        onClick={() => recordMedicationTaken(medication.id, true)}
                      >
                        <CheckCircle2 className="mr-1 h-4 w-4" />
                        Taken
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Medication History</CardTitle>
              <CardDescription>Track your medication adherence over time</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center text-muted-foreground mb-4">Coming soon: Medication adherence charts and history tracking</p>
              <div className="flex justify-center">
                <AlertTriangle className="h-12 w-12 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          {isLoading && medications.length === 0 ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : medications.length === 0 ? (
            <Card className="p-8 text-center">
              <Pill className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium">No medications added yet</p>
              <p className="text-muted-foreground mt-1 mb-4">
                Start tracking your medications by adding them
              </p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Medication
              </Button>
            </Card>
          ) : (
            <>
              {activeMedications.length > 0 && (
                <>
                  <h3 className="text-lg font-medium">Active Medications</h3>
                  {activeMedications.map((medication) => (
                    <Card key={medication.id}>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between">
                          <CardTitle>{medication.name}</CardTitle>
                          <div className="flex gap-2">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => editMedication(medication)}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="text-destructive hover:text-destructive" 
                              onClick={() => deleteMedication(medication.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <CardDescription>{medication.dosage}</CardDescription>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          <div className="flex items-center gap-2">
                            <Bell className="h-4 w-4 text-muted-foreground" />
                            <span>{getFrequencyLabel(medication.frequency)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span>
                              {medication.time_of_day.map(time => {
                                const option = TIME_OPTIONS.find(t => t.value === time);
                                return option ? `${option.icon} ${option.label}` : time;
                              }).join(", ")}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                            <span>Started {format(parseISO(medication.start_date), "MMM d, yyyy")}</span>
                          </div>
                          {medication.end_date && (
                            <div className="flex items-center gap-2">
                              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                              <span>Ends {format(parseISO(medication.end_date), "MMM d, yyyy")}</span>
                            </div>
                          )}
                        </div>
                        {medication.notes && (
                          <div className="mt-2 text-sm text-muted-foreground bg-muted p-2 rounded-md">
                            <p className="font-medium">Notes:</p>
                            <p>{medication.notes}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </>
              )}
              
              {inactiveMedications.length > 0 && (
                <>
                  <h3 className="text-lg font-medium mt-6">Inactive Medications</h3>
                  {inactiveMedications.map((medication) => (
                    <Card key={medication.id} className="opacity-70">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between">
                          <CardTitle className="flex items-center">
                            {medication.name}
                            <Badge variant="outline" className="ml-2">Inactive</Badge>
                          </CardTitle>
                          <div className="flex gap-2">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => editMedication(medication)}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="text-destructive hover:text-destructive" 
                              onClick={() => deleteMedication(medication.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <CardDescription>{medication.dosage}</CardDescription>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          <div className="flex items-center gap-2">
                            <Bell className="h-4 w-4 text-muted-foreground" />
                            <span>{getFrequencyLabel(medication.frequency)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span>
                              {medication.time_of_day.map(time => {
                                const option = TIME_OPTIONS.find(t => t.value === time);
                                return option ? `${option.icon} ${option.label}` : time;
                              }).join(", ")}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                            <span>Started {format(parseISO(medication.start_date), "MMM d, yyyy")}</span>
                          </div>
                          {medication.end_date && (
                            <div className="flex items-center gap-2">
                              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                              <span>Ended {format(parseISO(medication.end_date), "MMM d, yyyy")}</span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MedicationTracking;
