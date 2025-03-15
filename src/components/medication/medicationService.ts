
import { supabase } from "@/integrations/supabase/client";
import { Medication, MedicationHistory } from "./types";
import { format, addDays } from "date-fns";

export const fetchMedications = async (userId: string): Promise<Medication[]> => {
  const { data, error } = await supabase
    .from('medications')
    .select('*')
    .eq('user_id', userId)
    .order('name');

  if (error) throw error;
  
  return data.map(med => ({
    ...med,
    time_of_day: typeof med.time_of_day === 'string' ? JSON.parse(med.time_of_day) : med.time_of_day,
    active: med.active !== undefined ? med.active : true
  }));
};

export const fetchHistoryForDate = async (
  userId: string, 
  date: Date, 
  medicationIds: string[]
): Promise<Record<string, MedicationHistory[]>> => {
  if (!medicationIds.length) return {};

  const formattedDate = format(date, 'yyyy-MM-dd');
  const nextDay = format(addDays(date, 1), 'yyyy-MM-dd');

  const { data, error } = await supabase
    .from('medication_history')
    .select('*')
    .gte('taken_at', `${formattedDate}T00:00:00`)
    .lt('taken_at', `${nextDay}T00:00:00`)
    .in('medication_id', medicationIds);

  if (error) throw error;

  const historyByMedication: Record<string, MedicationHistory[]> = {};
  data.forEach(entry => {
    if (!historyByMedication[entry.medication_id]) {
      historyByMedication[entry.medication_id] = [];
    }
    historyByMedication[entry.medication_id].push({
      id: entry.id,
      medication_id: entry.medication_id,
      taken_at: entry.taken_at,
      taken: entry.taken,
      notes: entry.notes || null,
      created_at: entry.created_at
    });
  });

  return historyByMedication;
};

export const saveMedication = async (
  medication: Partial<Medication>,
  userId: string,
  isEditing: boolean
): Promise<void> => {
  const timeOfDayForDb = JSON.stringify(medication.time_of_day);
  
  if (isEditing && medication.id) {
    const { error } = await supabase
      .from('medications')
      .update({
        name: medication.name,
        dosage: medication.dosage,
        frequency: medication.frequency,
        start_date: medication.start_date,
        end_date: medication.end_date,
        time_of_day: timeOfDayForDb,
        notes: medication.notes,
        active: medication.active,
      })
      .eq('id', medication.id)
      .eq('user_id', userId);

    if (error) throw error;
  } else {
    const { error } = await supabase
      .from('medications')
      .insert({
        user_id: userId,
        name: medication.name,
        dosage: medication.dosage,
        frequency: medication.frequency,
        start_date: medication.start_date,
        end_date: medication.end_date || null,
        time_of_day: timeOfDayForDb,
        notes: medication.notes || null,
        active: true,
      });

    if (error) throw error;
  }
};

export const deleteMedication = async (id: string, userId: string): Promise<void> => {
  const { error } = await supabase
    .from('medications')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  if (error) throw error;
};

export const recordMedicationTaken = async (
  medicationId: string, 
  userId: string,
  taken: boolean, 
  notes: string = ""
): Promise<void> => {
  const now = new Date();
  const { error } = await supabase
    .from('medication_history')
    .insert({
      user_id: userId,
      medication_id: medicationId,
      taken_at: now.toISOString(),
      taken: taken,
      notes: notes || null,
    });

  if (error) throw error;
};
