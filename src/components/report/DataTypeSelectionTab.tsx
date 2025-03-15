
import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { format, addDays } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ExportDataType, ExportPeriod } from '@/services/reportService';

interface DataTypeSelectionTabProps {
  period: ExportPeriod;
  setPeriod: (period: ExportPeriod) => void;
  startDate: Date | undefined;
  setStartDate: (date: Date | undefined) => void;
  endDate: Date | undefined;
  setEndDate: (date: Date | undefined) => void;
  dataTypes: ExportDataType[];
  handleDataTypeChange: (type: ExportDataType, checked: boolean) => void;
}

const DataTypeSelectionTab: React.FC<DataTypeSelectionTabProps> = ({
  period,
  setPeriod,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  dataTypes,
  handleDataTypeChange,
}) => {
  const handlePeriodChange = (value: string) => {
    const newPeriod = value as ExportPeriod;
    setPeriod(newPeriod);
    
    // When a fixed period is selected, clear custom dates
    if (newPeriod !== 'custom') {
      setStartDate(undefined);
      setEndDate(undefined);
    } else {
      // When switching to custom, set default date range to last 30 days
      const end = new Date();
      const start = addDays(end, -30);
      setStartDate(start);
      setEndDate(end);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-medium mb-2">Time Period</h3>
        <Select value={String(period)} onValueChange={handlePeriodChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select time period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 3 months</SelectItem>
            <SelectItem value="180">Last 6 months</SelectItem>
            <SelectItem value="365">Last year</SelectItem>
            <SelectItem value="custom">Custom date range</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {period === 'custom' && (
        <div className="flex flex-col space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col space-y-1">
              <Label htmlFor="startDate">Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="startDate"
                    variant="outline"
                    className={cn(
                      "justify-start text-left font-normal",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, 'PPP') : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    initialFocus
                    disabled={(date) => date > new Date() || (endDate ? date > endDate : false)}
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="flex flex-col space-y-1">
              <Label htmlFor="endDate">End Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="endDate"
                    variant="outline"
                    className={cn(
                      "justify-start text-left font-normal",
                      !endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, 'PPP') : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    initialFocus
                    disabled={(date) => date > new Date() || (startDate ? date < startDate : false)}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          <div className="text-sm text-muted-foreground">
            Select a specific date range for your report. For medication history, 
            using a shorter range (1-3 months) will produce more readable reports.
          </div>
        </div>
      )}
      
      <div>
        <h3 className="text-sm font-medium mb-2">Data to Include</h3>
        <div className="space-y-3 pl-1">
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
  );
};

export default DataTypeSelectionTab;
