
import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pill, Plus } from "lucide-react";

interface EmptyMedicationStateProps {
  openAddMedicationDialog: () => void;
}

const EmptyMedicationState: React.FC<EmptyMedicationStateProps> = ({ openAddMedicationDialog }) => {
  return (
    <Card className="p-8 text-center">
      <Pill className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
      <p className="text-lg font-medium">No active medications</p>
      <p className="text-muted-foreground mt-1 mb-4">
        Add a medication to start tracking
      </p>
      <Button onClick={openAddMedicationDialog}>
        <Plus className="mr-2 h-4 w-4" />
        Add Medication
      </Button>
    </Card>
  );
};

export default EmptyMedicationState;
