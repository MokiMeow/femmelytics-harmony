
-- Modify the medications table to store time_of_day as JSON string and add active column
ALTER TABLE public.medications 
ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT true;

-- Add notes field to medication_history if it doesn't exist
ALTER TABLE public.medication_history
ADD COLUMN IF NOT EXISTS notes TEXT;
