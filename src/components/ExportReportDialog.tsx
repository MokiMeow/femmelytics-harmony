
import React, { useState, useEffect } from 'react';
import { 
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateReport, ExportDataType, ExportPeriod } from '@/services/reportService';
import { fetchActiveMedications, Medication } from '@/services/medicationService';
import DataTypeSelectionTab from './report/DataTypeSelectionTab';
import MedicationsTab from './report/MedicationsTab';
import ReportOptionsTab from './report/ReportOptionsTab';

interface ExportReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ExportReportDialog = ({ open, onOpenChange }: ExportReportDialogProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [period, setPeriod] = useState<ExportPeriod>(30);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [dataTypes, setDataTypes] = useState<ExportDataType[]>(['all']);
  const [includeCharts, setIncludeCharts] = useState(true);
  const [includeSummary, setIncludeSummary] = useState(true);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [selectedMedications, setSelectedMedications] = useState<string[]>(['all']);
  const [loadingMedications, setLoadingMedications] = useState(false);
  
  // Fetch available medications when dialog opens
  useEffect(() => {
    if (open && (dataTypes.includes('all') || dataTypes.includes('medications'))) {
      const loadMedications = async () => {
        setLoadingMedications(true);
        try {
          const medicationData = await fetchActiveMedications();
          setMedications(medicationData);
        } catch (error) {
          console.error('Error fetching medications:', error);
          toast({
            title: "Error fetching medications",
            description: "Unable to load your medications. Please try again.",
            variant: "destructive"
          });
        } finally {
          setLoadingMedications(false);
        }
      };
      
      loadMedications();
    }
  }, [open, dataTypes, toast]);
  
  const handleExport = async () => {
    setLoading(true);
    try {
      // Prepare medication filter
      const medicationFilter = selectedMedications.includes('all') 
        ? 'all' 
        : selectedMedications.join(',');
      
      const pdfBlob = await generateReport({
        dataTypes,
        period,
        startDate,
        endDate,
        includeCharts,
        includeSummary,
        medicationFilter
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
  
  // Handler for medication selection
  const handleMedicationChange = (medId: string, checked: boolean) => {
    if (medId === 'all' && checked) {
      setSelectedMedications(['all']);
      return;
    }
    
    if (checked) {
      if (selectedMedications.includes('all')) {
        setSelectedMedications([medId]);
      } else {
        setSelectedMedications([...selectedMedications, medId]);
      }
    } else {
      setSelectedMedications(selectedMedications.filter(id => id !== medId));
    }
  };
  
  // Check if medications section should be shown
  const showMedicationsSection = dataTypes.includes('all') || dataTypes.includes('medications');
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="text-xl">Export Health Report</DialogTitle>
          <DialogDescription>
            Create a detailed report of your health data to share with healthcare providers.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="data" className="w-full mt-4">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="data">Data Selection</TabsTrigger>
            <TabsTrigger value="medications" disabled={!showMedicationsSection}>Medications</TabsTrigger>
            <TabsTrigger value="options">Report Options</TabsTrigger>
          </TabsList>
          
          <TabsContent value="data" className="space-y-4 mt-4">
            <DataTypeSelectionTab 
              period={period}
              setPeriod={setPeriod}
              startDate={startDate}
              setStartDate={setStartDate}
              endDate={endDate}
              setEndDate={setEndDate}
              dataTypes={dataTypes}
              handleDataTypeChange={handleDataTypeChange}
            />
          </TabsContent>
          
          <TabsContent value="medications" className="space-y-4 mt-4">
            <MedicationsTab 
              showMedicationsSection={showMedicationsSection}
              loadingMedications={loadingMedications}
              medications={medications}
              selectedMedications={selectedMedications}
              handleMedicationChange={handleMedicationChange}
            />
          </TabsContent>
          
          <TabsContent value="options" className="space-y-6 mt-4">
            <ReportOptionsTab 
              includeCharts={includeCharts}
              setIncludeCharts={setIncludeCharts}
              includeSummary={includeSummary}
              setIncludeSummary={setIncludeSummary}
            />
          </TabsContent>
        </Tabs>
        
        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleExport} 
            disabled={loading || dataTypes.length === 0 || (period === 'custom' && (!startDate || !endDate))}
          >
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
