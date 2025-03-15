
import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ReportOptionsTabProps {
  includeCharts: boolean;
  setIncludeCharts: (include: boolean) => void;
  includeSummary: boolean;
  setIncludeSummary: (include: boolean) => void;
  medicationPeriod?: number;
  setMedicationPeriod?: (days: number) => void;
}

const ReportOptionsTab: React.FC<ReportOptionsTabProps> = ({
  includeCharts,
  setIncludeCharts,
  includeSummary,
  setIncludeSummary,
  medicationPeriod = 30,
  setMedicationPeriod
}) => {
  return (
    <div className="space-y-5">
      <div className="space-y-4">
        <h3 className="text-sm font-medium mb-2">Chart Options</h3>
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="include-charts" 
            checked={includeCharts} 
            onCheckedChange={(checked) => setIncludeCharts(!!checked)} 
          />
          <Label htmlFor="include-charts">Include charts and visualizations</Label>
        </div>
      </div>
      
      <div className="space-y-4">
        <h3 className="text-sm font-medium mb-2">AI Summary</h3>
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="include-summary" 
            checked={includeSummary} 
            onCheckedChange={(checked) => setIncludeSummary(!!checked)} 
          />
          <Label htmlFor="include-summary">Include AI-generated health summary</Label>
        </div>
        
        {includeSummary && (
          <div className="text-sm text-muted-foreground bg-muted/50 p-4 rounded-md border border-muted">
            <p className="mb-2">The AI summary will analyze your health data and provide insights about: </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Patterns in your symptoms and cycle data</li>
              <li>Potential correlations between tracked metrics</li>
              <li>Suggestions for discussion with healthcare providers</li>
            </ul>
          </div>
        )}
      </div>
      
      {setMedicationPeriod && (
        <div className="space-y-4">
          <h3 className="text-sm font-medium mb-2">Medication History</h3>
          <div className="flex items-center space-x-2">
            <Label htmlFor="medication-period">Include medication history for the last:</Label>
            <Select
              value={medicationPeriod.toString()}
              onValueChange={(value) => setMedicationPeriod(parseInt(value, 10))}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">7 days</SelectItem>
                <SelectItem value="15">15 days</SelectItem>
                <SelectItem value="30">30 days</SelectItem>
                <SelectItem value="60">60 days</SelectItem>
                <SelectItem value="90">90 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
      
      <Alert className="bg-amber-50 border-amber-200 dark:bg-yellow-900/20 mt-6">
        <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
        <AlertDescription className="text-amber-800 dark:text-amber-300">
          PDF generation may take a few moments depending on the amount of data and chart options selected.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default ReportOptionsTab;
