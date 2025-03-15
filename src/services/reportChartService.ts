
import { format } from 'date-fns';
import { ChartData } from './reportTypes';

export const prepareSymptomChartData = (symptomsData: any[]): ChartData => {
  const symptomCounts: {[key: string]: number} = {};
  
  symptomsData.forEach(entry => {
    const symptom = entry.symptom_type;
    symptomCounts[symptom] = (symptomCounts[symptom] || 0) + 1;
  });
  
  // Convert to array and sort by count (descending)
  const sortedSymptoms = Object.entries(symptomCounts)
    .sort(([, countA], [, countB]) => (countB as number) - (countA as number))
    .slice(0, 5); // Limit to top 5 for clarity
    
  return {
    labels: sortedSymptoms.map(([symptom]) => symptom),
    values: sortedSymptoms.map(([, count]) => count as number),
  };
};

export const prepareMoodChartData = (moodData: any[]): ChartData => {
  // Sort by date and limit to last 10 entries for better readability
  const sortedData = [...moodData]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-10);
    
  const dates = sortedData.map(entry => format(new Date(entry.date), 'MMM d'));
  const moodScores = sortedData.map(entry => entry.mood_score || 0);
  const energyScores = sortedData.map(entry => entry.energy_score || 0);
  
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
  
  // Convert to array and sort by count
  const sortedPhases = Object.entries(phaseCounts)
    .sort(([, countA], [, countB]) => (countB as number) - (countA as number));
    
  return {
    labels: sortedPhases.map(([phase]) => phase),
    values: sortedPhases.map(([, count]) => count as number),
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
  
  // Limit to top 5 medications for clarity
  medicationsData.slice(0, 5).forEach(med => {
    if (med.id) {
      const history = medicationGroups[med.id] || [];
      // Simplified calculation - percentage of days in the period the medication was taken
      const takenDays = new Set(history.map(h => h.taken_at.split('T')[0])).size;
      const totalPossibleDays = 30; // Assuming a 30-day period
      const adherence = Math.round((takenDays / totalPossibleDays) * 100);
      
      // Truncate long medication names
      const displayName = med.name.length > 10 ? med.name.substring(0, 8) + '...' : med.name;
      medicationNames.push(displayName);
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
      borderWidth: 1,
      borderRadius: 4,
    }],
    yAxisLabel: 'Adherence (%)',
  };
};
