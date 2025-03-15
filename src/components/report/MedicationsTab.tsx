
import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Medication } from '@/services/medicationService';

interface MedicationsTabProps {
  showMedicationsSection: boolean;
  loadingMedications: boolean;
  medications: Medication[];
  selectedMedications: string[];
  handleMedicationChange: (medId: string, checked: boolean) => void;
}

const MedicationsTab: React.FC<MedicationsTabProps> = ({
  showMedicationsSection,
  loadingMedications,
  medications,
  selectedMedications,
  handleMedicationChange,
}) => {
  if (!showMedicationsSection) {
    return (
      <div className="p-6 text-center bg-muted rounded-md">
        <p>Please select "Medications" or "All data" in the Data Selection tab to configure medication options.</p>
      </div>
    );
  }

  return (
    <>
      <h3 className="text-sm font-medium mb-2">Select Medications to Include</h3>
      {loadingMedications ? (
        <div className="flex items-center justify-center p-4">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <span className="ml-2">Loading medications...</span>
        </div>
      ) : medications.length > 0 ? (
        <div className="space-y-3 pl-1 max-h-[300px] overflow-y-auto pr-2">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="all-meds" 
              checked={selectedMedications.includes('all')} 
              onCheckedChange={(checked) => handleMedicationChange('all', !!checked)} 
            />
            <Label htmlFor="all-meds" className="font-medium">All medications</Label>
          </div>
          
          {medications.map(med => (
            <div key={med.id} className="flex items-center space-x-2">
              <Checkbox 
                id={`med-${med.id}`} 
                checked={selectedMedications.includes(med.id || '') || selectedMedications.includes('all')} 
                onCheckedChange={(checked) => handleMedicationChange(med.id || '', !!checked)} 
                disabled={selectedMedications.includes('all')}
              />
              <Label 
                htmlFor={`med-${med.id}`} 
                className={cn(
                  selectedMedications.includes('all') ? "text-muted-foreground" : "",
                  "flex-1"
                )}
              >
                <span className="font-medium">{med.name}</span>
                <span className="ml-2 text-sm text-muted-foreground">
                  {med.dosage}, {med.frequency}
                </span>
              </Label>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-4 text-center bg-muted/50 rounded-md">
          No medications found. Add medications in the Medications section to include them in reports.
        </div>
      )}
      
      <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-900/20">
        <AlertDescription className="text-blue-800 dark:text-blue-300">
          <p className="text-sm">
            For better readability, consider selecting a few specific medications for your report.
            Including many medications may result in crowded charts and tables.
          </p>
        </AlertDescription>
      </Alert>
    </>
  );
};

export default MedicationsTab;
