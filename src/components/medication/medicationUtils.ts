
import { format, parseISO, isPast, isFuture } from "date-fns";
import { Medication, MedicationHistory, FREQUENCIES, TIME_OPTIONS } from "./types";

export const isMedicationActive = (medication: Medication): boolean => {
  if (!medication.active) return false;
  
  const startDate = parseISO(medication.start_date);
  const today = new Date();
  
  if (isPast(startDate)) {
    if (medication.end_date) {
      const endDate = parseISO(medication.end_date);
      return !isPast(endDate);
    }
    return true;
  }
  
  return false;
};

export const hasTakenMedication = (
  medicationId: string, 
  timeOfDay: string, 
  history: Record<string, MedicationHistory[]>
): boolean => {
  if (!history[medicationId]) return false;
  
  return history[medicationId].some(record => {
    const recordHour = new Date(record.taken_at).getHours();
    let timeRange: [number, number] = [0, 0];
    
    switch (timeOfDay) {
      case "morning": timeRange = [5, 11]; break;
      case "afternoon": timeRange = [12, 16]; break;
      case "evening": timeRange = [17, 21]; break;
      case "night": timeRange = [22, 4]; break;
      case "with_food": return true; // Special case, just check if any record exists
      default: return false;
    }
    
    const inRange = timeRange[0] <= recordHour || recordHour <= timeRange[1];
    return record.taken && inRange;
  });
};

export const getFrequencyLabel = (frequency: string): string => {
  return FREQUENCIES.find(f => f.value === frequency)?.label || frequency;
};
