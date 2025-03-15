
export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  start_date: string;
  end_date: string | null;
  time_of_day: string[];
  notes: string | null;
  user_id: string;
  created_at: string;
  active: boolean;
}

export interface MedicationHistory {
  id: string;
  medication_id: string;
  taken_at: string;
  taken: boolean;
  notes?: string | null;
  created_at: string;
}

export const FREQUENCIES = [
  { value: "daily", label: "Daily" },
  { value: "every_other_day", label: "Every Other Day" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "as_needed", label: "As Needed" },
];

export const TIME_OPTIONS = [
  { value: "morning", label: "Morning", icon: "🌅" },
  { value: "afternoon", label: "Afternoon", icon: "🌞" },
  { value: "evening", label: "Evening", icon: "🌆" },
  { value: "night", label: "Night", icon: "🌙" },
  { value: "with_food", label: "With Food", icon: "🍽️" },
];
