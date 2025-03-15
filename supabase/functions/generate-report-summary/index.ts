
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { reportData } = await req.json();
    
    // Format the data for OpenAI
    let promptText = "Generate a concise health summary based on the following data:\n\n";
    
    if (reportData.cycleData?.length > 0) {
      promptText += `Cycle data: ${reportData.cycleData.length} entries over ${reportData.period} days.\n`;
      
      // Add cycle length and regularity info
      if (reportData.cycleData.filter((entry: any) => entry.flow_intensity !== 'none').length > 0) {
        promptText += `Period days recorded: ${reportData.cycleData.filter((entry: any) => entry.flow_intensity !== 'none').length}.\n`;
      }
    }
    
    if (reportData.symptomsData?.length > 0) {
      promptText += `Symptoms data: ${reportData.symptomsData.length} symptoms recorded.\n`;
      
      // Group symptoms by type
      const symptomGroups: Record<string, number> = {};
      reportData.symptomsData.forEach((entry: any) => {
        if (!symptomGroups[entry.symptom_type]) {
          symptomGroups[entry.symptom_type] = 0;
        }
        symptomGroups[entry.symptom_type]++;
      });
      
      promptText += "Most common symptoms:\n";
      Object.entries(symptomGroups)
        .sort(([, a]: any, [, b]: any) => b - a)
        .slice(0, 3)
        .forEach(([symptom, count]: any) => {
          promptText += `- ${symptom}: ${count} occurrences\n`;
        });
    }
    
    if (reportData.moodData?.length > 0) {
      const moodScores = reportData.moodData
        .filter((entry: any) => entry.mood_score !== null)
        .map((entry: any) => entry.mood_score);
      
      const energyScores = reportData.moodData
        .filter((entry: any) => entry.energy_score !== null)
        .map((entry: any) => entry.energy_score);
      
      if (moodScores.length > 0) {
        const avgMood = moodScores.reduce((sum: number, score: number) => sum + score, 0) / moodScores.length;
        promptText += `Average mood score: ${avgMood.toFixed(1)} out of 5.\n`;
      }
      
      if (energyScores.length > 0) {
        const avgEnergy = energyScores.reduce((sum: number, score: number) => sum + score, 0) / energyScores.length;
        promptText += `Average energy score: ${avgEnergy.toFixed(1)} out of 5.\n`;
      }
    }
    
    if (reportData.medicationsData?.length > 0) {
      promptText += `Medications: Currently tracking ${reportData.medicationsData.length} medications.\n`;
      reportData.medicationsData.forEach((med: any) => {
        promptText += `- ${med.name} (${med.dosage}): ${med.frequency}, ${med.time_of_day}\n`;
      });
    }
    
    promptText += "\nProvide a concise professional health summary that could be shared with a healthcare provider. Include any notable patterns or trends. The summary should be about 200-300 words, written in a clinical yet understandable style. Do not include any disclaimers or introduce yourself as an AI.";
    
    console.log("Sending prompt to OpenAI:", promptText);
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a healthcare assistant tasked with generating concise, professional health summaries based on patient data.' },
          { role: 'user', content: promptText }
        ],
        temperature: 0.3,
        max_tokens: 500,
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('OpenAI API error:', data);
      throw new Error(`OpenAI API error: ${data.error?.message || 'Unknown error'}`);
    }
    
    const summary = data.choices[0].message.content;

    return new Response(JSON.stringify({ summary }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-report-summary function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
