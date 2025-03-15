
import { format } from 'date-fns';
import { ChartData } from './reportTypes';

export const prepareSymptomChartData = (symptomsData: any[]): ChartData => {
  const symptomCounts: {[key: string]: number} = {};
  
  symptomsData.forEach(entry => {
    const symptom = entry.symptom_type;
    symptomCounts[symptom] = (symptomCounts[symptom] || 0) + 1;
  });
  
  return {
    labels: Object.keys(symptomCounts),
    values: Object.values(symptomCounts),
  };
};

export const prepareMoodChartData = (moodData: any[]): ChartData => {
  const dates = moodData.map(entry => format(new Date(entry.date), 'MMM d'));
  const moodScores = moodData.map(entry => entry.mood_score);
  const energyScores = moodData.map(entry => entry.energy_score);
  
  return {
    labels: dates,
    datasets: [
      {
        label: 'Mood',
        data: moodScores,
        borderColor: 'rgba(255, 99, 132, 1)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        tension: 0.3,
      },
      {
        label: 'Energy',
        data: energyScores,
        borderColor: 'rgba(54, 162, 235, 1)',
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        tension: 0.3,
      }
    ],
    yAxisLabel: 'Score (1-5)',
    xAxisLabel: 'Date',
  };
};

export const prepareCyclePhaseChartData = (cycleData: any[]): ChartData => {
  const phaseCounts: {[key: string]: number} = {};
  
  cycleData.forEach(entry => {
    const phase = entry.cycle_phase || 'Not specified';
    phaseCounts[phase] = (phaseCounts[phase] || 0) + 1;
  });
  
  return {
    labels: Object.keys(phaseCounts),
    values: Object.values(phaseCounts),
  };
};

export const prepareMedicationAdherenceChartData = (medicationsData: any[], medicationHistoryData: any[]): ChartData => {
  // Group medication history by medication id
  const medicationGroups: {[key: string]: any[]} = {};
  medicationHistoryData.forEach(entry => {
    const medId = entry.medication_id;
    if (!medicationGroups[medId]) {
      medicationGroups[medId] = [];
    }
    medicationGroups[medId].push(entry);
  });
  
  // Calculate adherence percentage for each medication
  const medicationNames: string[] = [];
  const adherenceValues: number[] = [];
  
  medicationsData.forEach(med => {
    if (med.id) {
      const history = medicationGroups[med.id] || [];
      // Simplified calculation - percentage of days in the period the medication was taken
      const takenDays = new Set(history.map(h => h.taken_at.split('T')[0])).size;
      const totalPossibleDays = 30; // Assuming a 30-day period
      const adherence = Math.round((takenDays / totalPossibleDays) * 100);
      
      medicationNames.push(med.name);
      adherenceValues.push(adherence);
    }
  });
  
  return {
    labels: medicationNames,
    datasets: [{
      label: 'Adherence (%)',
      data: adherenceValues,
      backgroundColor: 'rgba(75, 192, 192, 0.7)',
      borderColor: 'rgba(75, 192, 192, 1)',
      borderWidth: 2,
      borderRadius: 4,
    }],
    yAxisLabel: 'Adherence (%)',
  };
};
