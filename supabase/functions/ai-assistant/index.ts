
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

interface ChatRequest {
  message: string;
  cycleData?: any;
  moodData?: any;
  symptomsData?: any;
  statisticsData?: any;
}

interface TextToSpeechRequest {
  text: string;
  voice?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/').filter(Boolean);
    const endpoint = pathParts[pathParts.length - 1];

    if (endpoint === 'chat') {
      return handleChatRequest(req);
    } else if (endpoint === 'text-to-speech') {
      return handleTextToSpeechRequest(req);
    } else {
      return new Response(
        JSON.stringify({ error: 'Invalid endpoint' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }
  } catch (error) {
    console.error('Error in AI assistant function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }
});

async function handleChatRequest(req: Request) {
  const { message, cycleData, moodData, symptomsData, statisticsData }: ChatRequest = await req.json();

  // Create context from user data
  let context = "";
  if (cycleData) {
    const periodSummary = cycleData.filter((entry: any) => entry.flow_intensity !== 'none');
    if (periodSummary.length > 0) {
      context += `Recent period data: ${JSON.stringify(periodSummary)}. `;
    }
  }
  
  if (statisticsData) {
    context += `Cycle statistics: Average cycle length - ${statisticsData.average_cycle_length || 'unknown'} days, `;
    context += `Average period length - ${statisticsData.average_period_length || 'unknown'} days. `;
    
    if (statisticsData.next_predicted_date) {
      const nextDate = new Date(statisticsData.next_predicted_date);
      const today = new Date();
      const diffTime = nextDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays <= 7 && diffDays > 0) {
        context += `Next period predicted in ${diffDays} days. `;
      }
    }
  }
  
  if (moodData && moodData.length > 0) {
    const latestMood = moodData[moodData.length - 1];
    const moodLabels = ['Very Low', 'Low', 'Neutral', 'Good', 'Excellent'];
    const energyLabels = ['Exhausted', 'Tired', 'Normal', 'Energetic', 'Very Energetic'];
    
    context += `Current mood: ${moodLabels[latestMood.mood_score]}, `;
    context += `Energy level: ${energyLabels[latestMood.energy_score]}. `;
  }
  
  if (symptomsData && symptomsData.length > 0) {
    const recentSymptoms = symptomsData
      .filter((s: any) => {
        const symptomDate = new Date(s.date);
        const threeDaysAgo = new Date();
        threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
        return symptomDate >= threeDaysAgo;
      })
      .map((s: any) => s.symptom_type);
    
    if (recentSymptoms.length > 0) {
      context += `Recent symptoms: ${recentSymptoms.join(', ')}. `;
    }
  }

  const systemPrompt = `You are a compassionate and knowledgeable women's health assistant called "Luna". You specialize in menstrual health, cycle tracking, and related concerns. 
  
  ${context}
  
  Provide empathetic, evidence-based advice for women's health questions.
  Keep responses concise and under 1000 characters when possible to ensure they can be spoken out loud effectively.
  If asked to recommend books, suggest relevant titles about women's health, menstrual cycle health, hormonal balance, and female wellness.
  If asked to recommend videos, suggest watching content on topics like cycle syncing, period nutrition, hormonal health exercises, or stress reduction.
  If asked about period products, provide information about various options, their benefits, and considerations.
  If period is approaching soon, remind about stocking up on necessary supplies.
  
  Do NOT respond to questions unrelated to women's health, wellbeing, or the menstrual cycle.
  Do NOT provide medical diagnosis or claim to replace professional medical advice.
  
  Keep responses supportive and practical.`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ],
      max_tokens: 1000,
      temperature: 0.7,
    }),
  });

  const data = await response.json();
  console.log('OpenAI response:', data);

  if (data.error) {
    throw new Error(`OpenAI API error: ${data.error.message}`);
  }

  const reply = data.choices[0].message.content;

  return new Response(
    JSON.stringify({ reply }),
    { headers: { 'Content-Type': 'application/json', ...corsHeaders } }
  );
}

async function handleTextToSpeechRequest(req: Request) {
  try {
    const { text, voice = 'nova' }: TextToSpeechRequest = await req.json();

    if (!text) {
      return new Response(
        JSON.stringify({ error: 'Text is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Limit text length to prevent TTS errors
    const limitedText = text.length > 1000 ? text.substring(0, 1000) + "..." : text;
    console.log(`Processing TTS request with ${limitedText.length} characters`);

    const response = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'tts-1',
        input: limitedText,
        voice: voice,
        response_format: 'mp3',
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('TTS API error:', errorData);
      throw new Error(errorData.error?.message || 'Text-to-speech request failed');
    }

    const audioBuffer = await response.arrayBuffer();
    const base64Audio = btoa(String.fromCharCode(...new Uint8Array(audioBuffer)));

    return new Response(
      JSON.stringify({ audioContent: base64Audio }),
      { headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  } catch (error) {
    console.error('Text-to-speech error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }
}
