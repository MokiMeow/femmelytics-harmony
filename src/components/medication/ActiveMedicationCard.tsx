
import React from "react";
import { format, parseISO } from "date-fns";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Clock, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { Medication, MedicationHistory, TIME_OPTIONS } from "./types";
import { getFrequencyLabel, hasTakenMedication } from "./medicationUtils";

interface ActiveMedicationCardProps {
  medication: Medication;
  history: Record<string, MedicationHistory[]>;
  recordMedicationTaken: (medicationId: string, taken: boolean) => Promise<void>;
}

const ActiveMedicationCard: React.FC<ActiveMedicationCardProps> = ({
  medication,
  history,
  recordMedicationTaken
}) => {
  return (
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
              const taken = hasTakenMedication(medication.id, time, history);
              
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
  );
};

export default ActiveMedicationCard;
