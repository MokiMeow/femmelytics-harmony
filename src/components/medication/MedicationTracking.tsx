
import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Pill, Calendar as CalendarIcon, AlertTriangle, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

import { Medication } from "./types";
import { isMedicationActive } from "./medicationUtils";
import { 
  fetchMedications, 
  fetchHistoryForDate, 
  saveMedication, 
  deleteMedication as deleteMed, 
  recordMedicationTaken as recordMed 
} from "./medicationService";

import MedicationForm from "./MedicationForm";
import ActiveMedicationCard from "./ActiveMedicationCard";
import MedicationListItem from "./MedicationListItem";
import EmptyMedicationState from "./EmptyMedicationState";

const MedicationTracking: React.FC = () => {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [history, setHistory] = useState<Record<string, any>>({});
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
      fetchMedicationsData();
    }
  }, [user]);

  useEffect(() => {
    if (user && medications.length > 0) {
      fetchHistoryForDateData(historyDate);
    }
  }, [user, medications, historyDate]);

  const fetchMedicationsData = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const data = await fetchMedications(user.id);
      setMedications(data);
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

  const fetchHistoryForDateData = async (date: Date) => {
    if (!user || medications.length === 0) return;

    try {
      const medicationIds = medications.map(med => med.id);
      const historyData = await fetchHistoryForDate(user.id, date, medicationIds);
      setHistory(historyData);
    } catch (error) {
      console.error('Error fetching medication history:', error);
    }
  };

  const handleSaveMedication = async () => {
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
      await saveMedication(newMedication, user.id, isEditing);
      
      toast({
        title: isEditing ? "Medication updated" : "Medication added",
        description: isEditing 
          ? "Your medication has been updated successfully."
          : "Your medication has been added successfully.",
      });

      resetForm();
      fetchMedicationsData();
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

  const handleDeleteMedication = async (id: string) => {
    if (!user) return;
    if (!confirm("Are you sure you want to delete this medication?")) return;

    setIsLoading(true);
    try {
      await deleteMed(id, user.id);

      toast({
        title: "Medication deleted",
        description: "Your medication has been deleted successfully.",
      });

      fetchMedicationsData();
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

  const handleRecordMedicationTaken = async (medicationId: string, taken: boolean, notes: string = "") => {
    if (!user) return;

    try {
      await recordMed(medicationId, user.id, taken, notes);

      toast({
        title: taken ? "Medication taken" : "Medication skipped",
        description: taken ? "Successfully recorded as taken" : "Successfully recorded as skipped",
      });

      fetchHistoryForDateData(historyDate);
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

  const activeMedications = medications.filter(med => isMedicationActive(med));
  const inactiveMedications = medications.filter(med => !isMedicationActive(med));

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold flex items-center">
          <Pill className="mr-2 h-5 w-5" /> Medication Tracking
        </h2>
        <Button onClick={() => { resetForm(); setIsDialogOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" />
          Add Medication
        </Button>
      </div>

      <MedicationForm
        newMedication={newMedication}
        setNewMedication={setNewMedication}
        isEditing={isEditing}
        isDialogOpen={isDialogOpen}
        setIsDialogOpen={setIsDialogOpen}
        saveMedication={handleSaveMedication}
        resetForm={resetForm}
        isLoading={isLoading}
      />

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
            <EmptyMedicationState openAddMedicationDialog={() => setIsDialogOpen(true)} />
          ) : (
            <>
              {activeMedications.map((medication) => (
                <ActiveMedicationCard
                  key={medication.id}
                  medication={medication}
                  history={history}
                  recordMedicationTaken={handleRecordMedicationTaken}
                />
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
            <EmptyMedicationState openAddMedicationDialog={() => setIsDialogOpen(true)} />
          ) : (
            <>
              {activeMedications.length > 0 && (
                <>
                  <h3 className="text-lg font-medium">Active Medications</h3>
                  {activeMedications.map((medication) => (
                    <MedicationListItem
                      key={medication.id}
                      medication={medication}
                      isActive={true}
                      editMedication={editMedication}
                      deleteMedication={handleDeleteMedication}
                    />
                  ))}
                </>
              )}
              
              {inactiveMedications.length > 0 && (
                <>
                  <h3 className="text-lg font-medium mt-6">Inactive Medications</h3>
                  {inactiveMedications.map((medication) => (
                    <MedicationListItem
                      key={medication.id}
                      medication={medication}
                      isActive={false}
                      editMedication={editMedication}
                      deleteMedication={handleDeleteMedication}
                    />
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
