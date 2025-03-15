
import React, { useState } from 'react';
import { 
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateReport, ExportDataType, ExportPeriod } from '@/services/reportService';

interface ExportReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ExportReportDialog = ({ open, onOpenChange }: ExportReportDialogProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [period, setPeriod] = useState<ExportPeriod>(30);
  const [dataTypes, setDataTypes] = useState<ExportDataType[]>(['all']);
  const [includeCharts, setIncludeCharts] = useState(true);
  const [includeSummary, setIncludeSummary] = useState(true);
  
  const handleExport = async () => {
    setLoading(true);
    try {
      const pdfBlob = await generateReport({
        dataTypes,
        period,
        includeCharts,
        includeSummary
      });
      
      // Create download link
      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `health-report-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Report generated successfully",
        description: "Your health report has been downloaded.",
      });
      
      onOpenChange(false);
    } catch (error) {
      console.error('Error generating report:', error);
      toast({
        title: "Error generating report",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleDataTypeChange = (type: ExportDataType, checked: boolean) => {
    if (type === 'all' && checked) {
      setDataTypes(['all']);
      return;
    }
    
    if (checked) {
      if (dataTypes.includes('all')) {
        setDataTypes([type]);
      } else {
        setDataTypes([...dataTypes, type]);
      }
    } else {
      setDataTypes(dataTypes.filter(t => t !== type));
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Export Health Report</DialogTitle>
          <DialogDescription>
            Create a detailed report of your health data to share with healthcare providers.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="data" className="w-full mt-4">
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="data">Data Selection</TabsTrigger>
            <TabsTrigger value="options">Report Options</TabsTrigger>
          </TabsList>
          
          <TabsContent value="data" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-2">Time Period</h3>
                <Select value={period.toString()} onValueChange={(value) => setPeriod(parseInt(value) as ExportPeriod)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select time period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">Last 7 days</SelectItem>
                    <SelectItem value="30">Last 30 days</SelectItem>
                    <SelectItem value="90">Last 3 months</SelectItem>
                    <SelectItem value="180">Last 6 months</SelectItem>
                    <SelectItem value="365">Last year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-2">Data to Include</h3>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="all" 
                      checked={dataTypes.includes('all')} 
                      onCheckedChange={(checked) => handleDataTypeChange('all', !!checked)} 
                    />
                    <Label htmlFor="all" className="font-medium">All data</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="cycle" 
                      checked={dataTypes.includes('cycle') || dataTypes.includes('all')} 
                      onCheckedChange={(checked) => handleDataTypeChange('cycle', !!checked)} 
                      disabled={dataTypes.includes('all')}
                    />
                    <Label htmlFor="cycle" className={dataTypes.includes('all') ? "text-muted-foreground" : ""}>
                      Cycle data
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="symptoms" 
                      checked={dataTypes.includes('symptoms') || dataTypes.includes('all')} 
                      onCheckedChange={(checked) => handleDataTypeChange('symptoms', !!checked)} 
                      disabled={dataTypes.includes('all')}
                    />
                    <Label htmlFor="symptoms" className={dataTypes.includes('all') ? "text-muted-foreground" : ""}>
                      Symptoms
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="mood" 
                      checked={dataTypes.includes('mood') || dataTypes.includes('all')} 
                      onCheckedChange={(checked) => handleDataTypeChange('mood', !!checked)} 
                      disabled={dataTypes.includes('all')}
                    />
                    <Label htmlFor="mood" className={dataTypes.includes('all') ? "text-muted-foreground" : ""}>
                      Mood & Energy
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="medications" 
                      checked={dataTypes.includes('medications') || dataTypes.includes('all')} 
                      onCheckedChange={(checked) => handleDataTypeChange('medications', !!checked)} 
                      disabled={dataTypes.includes('all')}
                    />
                    <Label htmlFor="medications" className={dataTypes.includes('all') ? "text-muted-foreground" : ""}>
                      Medications
                    </Label>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="options" className="space-y-4 mt-4">
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
                <div className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                  The AI summary will analyze your health data and provide insights about patterns, 
                  trends, and potential correlations between different aspects of your health. 
                  This can be useful for healthcare providers.
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
        
        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleExport} disabled={loading || dataTypes.length === 0}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <FileText className="mr-2 h-4 w-4" />
                Export PDF
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ExportReportDialog;
