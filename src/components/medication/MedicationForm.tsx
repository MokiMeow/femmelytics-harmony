
import React from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Textarea } from "@/components/ui/textarea";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Medication, FREQUENCIES, TIME_OPTIONS } from "./types";
import { format, parseISO } from "date-fns";

interface MedicationFormProps {
  newMedication: Partial<Medication>;
  setNewMedication: React.Dispatch<React.SetStateAction<Partial<Medication>>>;
  isEditing: boolean;
  isDialogOpen: boolean;
  setIsDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  saveMedication: () => Promise<void>;
  resetForm: () => void;
  isLoading: boolean;
}

const MedicationForm: React.FC<MedicationFormProps> = ({
  newMedication,
  setNewMedication,
  isEditing,
  isDialogOpen,
  setIsDialogOpen,
  saveMedication,
  resetForm,
  isLoading
}) => {
  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Medication" : "Add New Medication"}</DialogTitle>
          <DialogDescription>
            {isEditing 
              ? "Update your medication details below" 
              : "Enter the details of your medication below"}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              value={newMedication.name || ""}
              onChange={(e) => setNewMedication({ ...newMedication, name: e.target.value })}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="dosage" className="text-right">
              Dosage
            </Label>
            <Input
              id="dosage"
              value={newMedication.dosage || ""}
              placeholder="e.g., 10mg, 1 tablet"
              onChange={(e) => setNewMedication({ ...newMedication, dosage: e.target.value })}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="frequency" className="text-right">
              Frequency
            </Label>
            <Select
              value={newMedication.frequency || "daily"}
              onValueChange={(value) => setNewMedication({ ...newMedication, frequency: value })}
            >
              <SelectTrigger id="frequency" className="col-span-3">
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                {FREQUENCIES.map((freq) => (
                  <SelectItem key={freq.value} value={freq.value}>
                    {freq.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label className="text-right pt-2">
              Time of Day
            </Label>
            <div className="flex flex-col gap-2 col-span-3">
              {TIME_OPTIONS.map((time) => (
                <div key={time.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`time-${time.value}`}
                    checked={(newMedication.time_of_day || []).includes(time.value)}
                    onCheckedChange={(checked) => {
                      const currentTimes = [...(newMedication.time_of_day || [])];
                      if (checked) {
                        if (!currentTimes.includes(time.value)) {
                          currentTimes.push(time.value);
                        }
                      } else {
                        const index = currentTimes.indexOf(time.value);
                        if (index !== -1) {
                          currentTimes.splice(index, 1);
                        }
                      }
                      setNewMedication({ ...newMedication, time_of_day: currentTimes });
                    }}
                  />
                  <Label htmlFor={`time-${time.value}`} className="text-sm font-normal flex items-center">
                    <span className="mr-1">{time.icon}</span> {time.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">
              Start Date
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "col-span-3 justify-start text-left font-normal",
                    !newMedication.start_date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {newMedication.start_date 
                    ? format(parseISO(newMedication.start_date), "PPP")
                    : "Select date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={newMedication.start_date ? parseISO(newMedication.start_date) : undefined}
                  onSelect={(date) => date && setNewMedication({ 
                    ...newMedication, 
                    start_date: format(date, 'yyyy-MM-dd') 
                  })}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">
              End Date
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "col-span-3 justify-start text-left font-normal",
                    !newMedication.end_date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {newMedication.end_date 
                    ? format(parseISO(newMedication.end_date), "PPP")
                    : "Ongoing"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <div className="p-2">
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start" 
                    onClick={() => setNewMedication({ ...newMedication, end_date: undefined })}
                  >
                    No end date (ongoing)
                  </Button>
                </div>
                <Calendar
                  mode="single"
                  selected={newMedication.end_date ? parseISO(newMedication.end_date) : undefined}
                  onSelect={(date) => date && setNewMedication({ 
                    ...newMedication, 
                    end_date: format(date, 'yyyy-MM-dd') 
                  })}
                  initialFocus
                  disabled={(date) => {
                    if (!newMedication.start_date) return false;
                    return date < parseISO(newMedication.start_date);
                  }}
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="notes" className="text-right pt-2">
              Notes
            </Label>
            <Textarea
              id="notes"
              value={newMedication.notes || ""}
              placeholder="Special instructions or additional notes"
              onChange={(e) => setNewMedication({ ...newMedication, notes: e.target.value })}
              className="col-span-3"
            />
          </div>
          {isEditing && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="active" className="text-right">
                Status
              </Label>
              <div className="col-span-3">
                <Select
                  value={newMedication.active ? "active" : "inactive"}
                  onValueChange={(value) => setNewMedication({ 
                    ...newMedication, 
                    active: value === "active" 
                  })}
                >
                  <SelectTrigger id="active">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
            Cancel
          </Button>
          <Button onClick={saveMedication} disabled={isLoading}>
            {isEditing ? "Update" : "Add"} Medication
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MedicationForm;
