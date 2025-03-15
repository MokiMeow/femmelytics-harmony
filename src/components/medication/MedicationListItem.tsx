
import React from "react";
import { format, parseISO } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit2, Trash2, Bell, Clock, Calendar as CalendarIcon } from "lucide-react";
import { Medication, TIME_OPTIONS } from "./types";
import { getFrequencyLabel } from "./medicationUtils";

interface MedicationListItemProps {
  medication: Medication;
  isActive: boolean;
  editMedication: (medication: Medication) => void;
  deleteMedication: (id: string) => Promise<void>;
}

const MedicationListItem: React.FC<MedicationListItemProps> = ({
  medication,
  isActive,
  editMedication,
  deleteMedication
}) => {
  return (
    <Card key={medication.id} className={isActive ? "" : "opacity-70"}>
      <CardHeader className="pb-2">
        <div className="flex justify-between">
          <CardTitle className="flex items-center">
            {medication.name}
            {!isActive && <Badge variant="outline" className="ml-2">Inactive</Badge>}
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
              <span>{isActive ? "Ends" : "Ended"} {format(parseISO(medication.end_date), "MMM d, yyyy")}</span>
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
  );
};

export default MedicationListItem;
