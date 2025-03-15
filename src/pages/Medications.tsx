
import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import Navigation from '@/components/Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Pill, PlusCircle, Bell, Check, X, Calendar, Clock, Pencil, Trash2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { format, addDays, parseISO } from 'date-fns';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Medication, fetchMedications, fetchActiveMedications, createMedication, updateMedication, deleteMedication, markMedicationAsTaken, calculateAdherence } from '@/services/medicationService';

const colorMap = {
  'Birth Control': 'pink',
  'Vitamin': 'yellow',
  'Supplement': 'blue',
  'Prescription': 'purple',
  'Other': 'gray',
};

interface MedicationCardProps {
  medication: Medication;
  onEdit: (medication: Medication) => void;
  onDelete: (id: string) => void;
  onRefresh: () => void;
}

const MedicationCard: React.FC<MedicationCardProps> = ({ medication, onEdit, onDelete, onRefresh }) => {
  const { toast } = useToast();
  const [taken, setTaken] = useState(false);
  const [adherence, setAdherence] = useState(0);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    loadAdherence();
  }, [medication.id]);
  
  const loadAdherence = async () => {
    try {
      setLoading(true);
      if (medication.id) {
        const adherenceValue = await calculateAdherence(medication.id);
        setAdherence(adherenceValue);
      }
    } catch (error) {
      console.error('Error calculating adherence:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleMarkAsTaken = async () => {
    try {
      if (!medication.id) return;
      
      await markMedicationAsTaken(medication.id);
      setTaken(true);
      toast({
        title: 'Success',
        description: `${medication.name} marked as taken`,
      });
      loadAdherence(); // Refresh adherence after marking as taken
    } catch (error) {
      console.error('Error marking medication as taken:', error);
      toast({
        title: 'Error',
        description: 'Failed to mark medication as taken. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Calculate next dose based on frequency
  const getNextDoseText = () => {
    const today = new Date();
    let nextDate = today;
    
    if (medication.frequency === 'Weekly') {
      nextDate = addDays(today, 7);
    } else if (medication.frequency === 'Monthly') {
      nextDate = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate());
    }
    
    return `${format(nextDate, 'MMM d, yyyy')}, ${medication.time_of_day}`;
  };
  
  // Determine color based on medication name or category
  const getColor = () => {
    if (medication.name.toLowerCase().includes('birth control')) return 'pink';
    if (medication.name.toLowerCase().includes('vitamin')) return 'yellow';
    if (medication.name.toLowerCase().includes('iron')) return 'blue';
    if (medication.name.toLowerCase().includes('calcium')) return 'purple';
    return 'gray';
  };

  return (
    <Card className={`border-l-4 border-l-${getColor()}-500 hover:shadow-md transition-shadow`}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl font-semibold">{medication.name}</CardTitle>
            <CardDescription>{medication.dosage}</CardDescription>
          </div>
          <Badge variant={medication.time_of_day === "Morning" ? "default" : medication.time_of_day === "Evening" ? "secondary" : "outline"}>
            {medication.time_of_day}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm text-muted-foreground">{medication.frequency}</span>
          <div className="flex items-center gap-1">
            <Calendar size={14} className="text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Next: {getNextDoseText()}</span>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm">Adherence</span>
            {loading ? (
              <Skeleton className="h-4 w-10" />
            ) : (
              <span className="text-sm font-medium">{adherence}%</span>
            )}
          </div>
          {loading ? (
            <Skeleton className="h-2 w-full" />
          ) : (
            <Progress value={adherence} className="h-2" />
          )}
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
            onClick={handleMarkAsTaken}
          >
            <Check size={14} />
            Mark as taken
          </Button>
        )}
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(medication)}>
            <Pencil size={14} />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Trash2 size={14} />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Medication</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete {medication.name}? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => medication.id && onDelete(medication.id)}>Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Bell size={14} />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

const Medications = () => {
  const { toast } = useToast();
  const [medications, setMedications] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedMedication, setSelectedMedication] = useState<Medication | null>(null);
  const [medicationForm, setMedicationForm] = useState<{
    name: string;
    dosage: string;
    frequency: string;
    time_of_day: string;
    start_date: string;
    end_date?: string;
    notes?: string;
  }>({
    name: '',
    dosage: '',
    frequency: 'Daily',
    time_of_day: 'Morning',
    start_date: format(new Date(), 'yyyy-MM-dd'),
    end_date: '',
    notes: '',
  });

  useEffect(() => {
    loadMedications();
  }, []);

  const loadMedications = async () => {
    try {
      setLoading(true);
      const data = await fetchActiveMedications();
      setMedications(data);
    } catch (error) {
      console.error('Error loading medications:', error);
      toast({
        title: 'Error',
        description: 'Failed to load medications. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMedication = async () => {
    try {
      if (!medicationForm.name.trim() || !medicationForm.dosage.trim()) {
        toast({
          title: 'Error',
          description: 'Name and dosage are required',
          variant: 'destructive',
        });
        return;
      }

      await createMedication(medicationForm);
      toast({
        title: 'Success',
        description: 'Medication added successfully',
      });
      setIsAddOpen(false);
      resetForm();
      loadMedications();
    } catch (error) {
      console.error('Error creating medication:', error);
      toast({
        title: 'Error',
        description: 'Failed to add medication. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateMedication = async () => {
    try {
      if (!selectedMedication?.id) return;
      
      await updateMedication(selectedMedication.id, medicationForm);
      toast({
        title: 'Success',
        description: 'Medication updated successfully',
      });
      setIsEditOpen(false);
      resetForm();
      loadMedications();
    } catch (error) {
      console.error('Error updating medication:', error);
      toast({
        title: 'Error',
        description: 'Failed to update medication. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteMedication = async (id: string) => {
    try {
      await deleteMedication(id);
      toast({
        title: 'Success',
        description: 'Medication deleted successfully',
      });
      loadMedications();
    } catch (error) {
      console.error('Error deleting medication:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete medication. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const openEditDialog = (medication: Medication) => {
    setSelectedMedication(medication);
    setMedicationForm({
      name: medication.name,
      dosage: medication.dosage,
      frequency: medication.frequency,
      time_of_day: medication.time_of_day,
      start_date: medication.start_date,
      end_date: medication.end_date || '',
      notes: medication.notes || '',
    });
    setIsEditOpen(true);
  };

  const resetForm = () => {
    setMedicationForm({
      name: '',
      dosage: '',
      frequency: 'Daily',
      time_of_day: 'Morning',
      start_date: format(new Date(), 'yyyy-MM-dd'),
      end_date: '',
      notes: '',
    });
    setSelectedMedication(null);
  };

  // Calculate upcoming refills
  const getUpcomingRefills = () => {
    const today = new Date();
    return medications
      .filter(med => med.active)
      .map(med => {
        const daysRemaining = Math.floor(Math.random() * 30) + 1; // Mock data for demonstration
        const refillDate = addDays(today, daysRemaining);
        return {
          name: med.name,
          remaining: daysRemaining,
          date: format(refillDate, 'MMM d, yyyy'),
        };
      })
      .sort((a, b) => a.remaining - b.remaining)
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Medication Tracking</h1>
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <PlusCircle size={18} />
                Add Medication
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px]">
              <DialogHeader>
                <DialogTitle>Add Medication</DialogTitle>
                <DialogDescription>
                  Add a new medication to track and receive reminders.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <label htmlFor="med-name">Medication Name</label>
                  <Input
                    id="med-name"
                    placeholder="E.g., Birth Control Pill"
                    value={medicationForm.name}
                    onChange={(e) => setMedicationForm({ ...medicationForm, name: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="med-dosage">Dosage</label>
                  <Input
                    id="med-dosage"
                    placeholder="E.g., 1 tablet, 10mg"
                    value={medicationForm.dosage}
                    onChange={(e) => setMedicationForm({ ...medicationForm, dosage: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <label htmlFor="med-frequency">Frequency</label>
                    <select 
                      id="med-frequency"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      value={medicationForm.frequency}
                      onChange={(e) => setMedicationForm({ ...medicationForm, frequency: e.target.value })}
                    >
                      <option value="Daily">Daily</option>
                      <option value="Twice daily">Twice daily</option>
                      <option value="Weekly">Weekly</option>
                      <option value="Monthly">Monthly</option>
                      <option value="As needed">As needed</option>
                    </select>
                  </div>
                  <div className="grid gap-2">
                    <label htmlFor="med-time">Time of Day</label>
                    <select 
                      id="med-time"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      value={medicationForm.time_of_day}
                      onChange={(e) => setMedicationForm({ ...medicationForm, time_of_day: e.target.value })}
                    >
                      <option value="Morning">Morning</option>
                      <option value="Afternoon">Afternoon</option>
                      <option value="Evening">Evening</option>
                      <option value="Bedtime">Bedtime</option>
                      <option value="Multiple">Multiple Times</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <label htmlFor="med-start">Start Date</label>
                    <Input
                      id="med-start"
                      type="date"
                      value={medicationForm.start_date}
                      onChange={(e) => setMedicationForm({ ...medicationForm, start_date: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <label htmlFor="med-end">End Date (Optional)</label>
                    <Input
                      id="med-end"
                      type="date"
                      value={medicationForm.end_date}
                      onChange={(e) => setMedicationForm({ ...medicationForm, end_date: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <label htmlFor="med-notes">Notes (Optional)</label>
                  <Textarea
                    id="med-notes"
                    placeholder="Add any additional information..."
                    value={medicationForm.notes}
                    onChange={(e) => setMedicationForm({ ...medicationForm, notes: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
                <Button onClick={handleCreateMedication}>Add Medication</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <CardHeader>
                  <Skeleton className="h-6 w-40 mb-2" />
                  <Skeleton className="h-4 w-24" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-4" />
                  <Skeleton className="h-2 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : medications.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {medications.map((medication) => (
              <MedicationCard 
                key={medication.id} 
                medication={medication}
                onEdit={openEditDialog}
                onDelete={handleDeleteMedication}
                onRefresh={loadMedications}
              />
            ))}
          </div>
        ) : (
          <div className="text-center p-10 border border-dashed rounded-lg mb-8">
            <Pill className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
            <h3 className="text-lg font-medium mb-2">No medications added yet</h3>
            <p className="text-muted-foreground mb-4">Track your medications and never miss a dose</p>
            <Button onClick={() => setIsAddOpen(true)}>Add Your First Medication</Button>
          </div>
        )}
        
        {medications.length > 0 && (
          <Card className="mb-8 p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Upcoming Refills</h3>
              <Button variant="outline" size="sm">
                View All
              </Button>
            </div>
            <Separator className="my-4" />
            <div className="space-y-4">
              {getUpcomingRefills().map((refill, i) => (
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
        )}
        
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>Edit Medication</DialogTitle>
              <DialogDescription>
                Update your medication details.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <label htmlFor="edit-med-name">Medication Name</label>
                <Input
                  id="edit-med-name"
                  placeholder="E.g., Birth Control Pill"
                  value={medicationForm.name}
                  onChange={(e) => setMedicationForm({ ...medicationForm, name: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="edit-med-dosage">Dosage</label>
                <Input
                  id="edit-med-dosage"
                  placeholder="E.g., 1 tablet, 10mg"
                  value={medicationForm.dosage}
                  onChange={(e) => setMedicationForm({ ...medicationForm, dosage: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <label htmlFor="edit-med-frequency">Frequency</label>
                  <select 
                    id="edit-med-frequency"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    value={medicationForm.frequency}
                    onChange={(e) => setMedicationForm({ ...medicationForm, frequency: e.target.value })}
                  >
                    <option value="Daily">Daily</option>
                    <option value="Twice daily">Twice daily</option>
                    <option value="Weekly">Weekly</option>
                    <option value="Monthly">Monthly</option>
                    <option value="As needed">As needed</option>
                  </select>
                </div>
                <div className="grid gap-2">
                  <label htmlFor="edit-med-time">Time of Day</label>
                  <select 
                    id="edit-med-time"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    value={medicationForm.time_of_day}
                    onChange={(e) => setMedicationForm({ ...medicationForm, time_of_day: e.target.value })}
                  >
                    <option value="Morning">Morning</option>
                    <option value="Afternoon">Afternoon</option>
                    <option value="Evening">Evening</option>
                    <option value="Bedtime">Bedtime</option>
                    <option value="Multiple">Multiple Times</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <label htmlFor="edit-med-start">Start Date</label>
                  <Input
                    id="edit-med-start"
                    type="date"
                    value={medicationForm.start_date}
                    onChange={(e) => setMedicationForm({ ...medicationForm, start_date: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="edit-med-end">End Date (Optional)</label>
                  <Input
                    id="edit-med-end"
                    type="date"
                    value={medicationForm.end_date}
                    onChange={(e) => setMedicationForm({ ...medicationForm, end_date: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <label htmlFor="edit-med-notes">Notes (Optional)</label>
                <Textarea
                  id="edit-med-notes"
                  placeholder="Add any additional information..."
                  value={medicationForm.notes}
                  onChange={(e) => setMedicationForm({ ...medicationForm, notes: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
              <Button onClick={handleUpdateMedication}>Update Medication</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
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
