
import React, { useState, useRef, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { VolumeIcon, PlusIcon, SendIcon, Mic, StopCircleIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { fetchRecentEntries } from '@/services/trackerService';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
};

const AIAssistant = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [audioSrc, setAudioSrc] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  
  useEffect(() => {
    setMessages([
      {
        id: '0',
        role: 'assistant',
        content: "Hello! I'm Luna, your women's health assistant. I can help you with questions about your cycle, suggest self-care practices, or provide information about menstrual health. How can I assist you today?",
        timestamp: new Date(),
      },
    ]);
  }, []);

  useEffect(() => {
    const loadUserData = async () => {
      if (!user) return;
      
      try {
        const data = await fetchRecentEntries(90);
        setUserData(data);
      } catch (error) {
        console.error('Error loading user data for AI assistant:', error);
      }
    };
    
    loadUserData();
  }, [user]);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (audioSrc && audioRef.current) {
      audioRef.current.onended = () => setIsSpeaking(false);
      audioRef.current.onplaying = () => setIsSpeaking(true);
      audioRef.current.play().catch(error => {
        console.error('Error playing audio:', error);
        setIsSpeaking(false);
      });
    }
  }, [audioSrc]);
  
  const handleSendMessage = async () => {
    if (!input.trim()) return;
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to chat with Luna",
        variant: "destructive",
      });
      return;
    }
    
    const userMessage = {
      id: Date.now().toString(),
      role: 'user' as const,
      content: input.trim(),
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('ai-assistant/chat', {
        body: {
          message: input.trim(),
          cycleData: userData?.cycleEntries || [],
          moodData: userData?.moodEntries || [],
          symptomsData: userData?.symptoms || [],
          statisticsData: userData?.statistics || {},
        },
      });
      
      if (error) throw error;
      
      const assistantMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant' as const,
        content: data.reply,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to get response from Luna. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  const speakMessage = async (text: string) => {
    if (isSpeaking && audioRef.current) {
      audioRef.current.pause();
      setIsSpeaking(false);
      setAudioSrc(null);
      return;
    }
    
    setIsLoading(true);
    try {
      // Limit text length to prevent TTS errors
      const limitedText = text.length > 1000 ? text.substring(0, 1000) + "..." : text;
      
      const { data, error } = await supabase.functions.invoke('ai-assistant/text-to-speech', {
        body: { text: limitedText, voice: 'nova' },
      });
      
      if (error) throw error;
      
      if (!data.audioContent) {
        throw new Error("No audio content returned");
      }
      
      const audioContent = data.audioContent;
      const audioBlob = new Blob(
        [Uint8Array.from(atob(audioContent), c => c.charCodeAt(0))],
        { type: 'audio/mp3' }
      );
      
      const url = URL.createObjectURL(audioBlob);
      setAudioSrc(url);
    } catch (error) {
      console.error('Error with text-to-speech:', error);
      toast({
        title: "Error",
        description: "Failed to generate speech. The message might be too long.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Card className="w-full h-[80vh] flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-primary">
          <Avatar className="h-8 w-8 bg-lavender-100">
            <AvatarFallback className="text-lavender-600">AI</AvatarFallback>
            <AvatarImage src="/luna-avatar.png" alt="Luna" />
          </Avatar>
          <span>Luna | Your Health Assistant</span>
        </CardTitle>
      </CardHeader>
      
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}
              >
                <div className="whitespace-pre-wrap">{message.content}</div>
                {message.role === 'assistant' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-2 h-6 w-6 p-0 rounded-full"
                    onClick={() => speakMessage(message.content)}
                    title={isSpeaking ? "Stop speaking" : "Speak this message"}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    ) : (
                      <VolumeIcon className="h-3 w-3" />
                    )}
                    <span className="sr-only">
                      {isSpeaking ? "Stop speaking" : "Speak message"}
                    </span>
                  </Button>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>
      
      <CardFooter className="pt-2">
        <div className="flex w-full items-end gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask Luna about your cycle, health tips, or self-care..."
            className="min-h-10 resize-none"
            disabled={isLoading}
          />
          <Button
            onClick={handleSendMessage}
            disabled={isLoading || !input.trim()}
            size="icon"
            className="h-10 w-10 shrink-0"
          >
            {isLoading ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : (
              <SendIcon className="h-4 w-4" />
            )}
            <span className="sr-only">Send</span>
          </Button>
        </div>
      </CardFooter>
      
      <audio ref={audioRef} src={audioSrc || undefined} hidden />
    </Card>
  );
};

export default AIAssistant;
