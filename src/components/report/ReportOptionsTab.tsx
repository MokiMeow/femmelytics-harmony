
import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface ReportOptionsTabProps {
  includeCharts: boolean;
  setIncludeCharts: (include: boolean) => void;
  includeSummary: boolean;
  setIncludeSummary: (include: boolean) => void;
}

const ReportOptionsTab: React.FC<ReportOptionsTabProps> = ({
  includeCharts,
  setIncludeCharts,
  includeSummary,
  setIncludeSummary,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Checkbox 
          id="include-charts" 
          checked={includeCharts} 
          onCheckedChange={(checked) => setIncludeCharts(!!checked)} 
        />
        <Label htmlFor="include-charts">Include charts and visualizations</Label>
      </div>
      
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
          <p className="mb-2">The AI summary will analyze your health data and provide insights about:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Patterns in your symptoms and cycle data</li>
            <li>Potential correlations between tracked metrics</li>
            <li>Suggestions for discussion with healthcare providers</li>
          </ul>
        </div>
      )}
      
      <Alert className="bg-amber-50 border-amber-200 dark:bg-yellow-900/20">
        <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
        <AlertDescription className="text-amber-800 dark:text-amber-300">
          PDF generation may take a few moments depending on the amount of data and chart options selected.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default ReportOptionsTab;
