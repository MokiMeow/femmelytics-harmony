
import React, { useState, useRef, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { VolumeIcon, PlusIcon, SendIcon, Mic, StopCircleIcon, History, ChevronRight, Trash2, X } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { fetchRecentEntries } from '@/services/trackerService';
import { format } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
};

type ChatSession = {
  id: string;
  title: string;
  messages: Message[];
  created_at: string;
  updated_at: string;
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
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string>('');
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  
  // Initial welcome message
  const welcomeMessage = {
    id: '0',
    role: 'assistant' as const,
    content: "Hello! I'm Luna, your women's health assistant. I can help you with questions about your cycle, suggest self-care practices, or provide information about menstrual health. How can I assist you today?",
    timestamp: new Date(),
  };

  // Load chat sessions from Supabase
  useEffect(() => {
    const loadChatSessions = async () => {
      if (!user) return;
      
      setIsLoadingHistory(true);
      try {
        const { data, error } = await supabase
          .from('chat_sessions')
          .select('*')
          .eq('user_id', user.id)
          .order('updated_at', { ascending: false });
          
        if (error) throw error;
        
        if (data && data.length > 0) {
          setChatSessions(data.map(session => ({
            ...session,
            messages: JSON.parse(session.messages as unknown as string)
          })));
        }
      } catch (error) {
        console.error('Error loading chat sessions:', error);
      } finally {
        setIsLoadingHistory(false);
      }
    };
    
    loadChatSessions();
  }, [user]);

  // Create new chat session
  const createNewSession = async () => {
    if (!user) return;
    
    const sessionId = uuidv4();
    const newSession: ChatSession = {
      id: sessionId,
      title: 'New Conversation',
      messages: [welcomeMessage],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    try {
      // Save to Supabase
      const { error } = await supabase
        .from('chat_sessions')
        .insert({
          id: sessionId,
          user_id: user.id,
          title: 'New Conversation',
          messages: JSON.stringify([welcomeMessage]),
          created_at: newSession.created_at,
          updated_at: newSession.updated_at
        });
        
      if (error) throw error;
      
      // Update local state
      setChatSessions(prev => [newSession, ...prev]);
      setCurrentSessionId(sessionId);
      setMessages([welcomeMessage]);
      
    } catch (error) {
      console.error('Error creating new session:', error);
      toast({
        title: "Error",
        description: "Failed to create new conversation. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Delete chat session
  const deleteSession = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return;
    
    try {
      // Delete from Supabase
      const { error } = await supabase
        .from('chat_sessions')
        .delete()
        .eq('id', sessionId)
        .eq('user_id', user.id);
        
      if (error) throw error;
      
      // Update local state
      setChatSessions(prev => prev.filter(session => session.id !== sessionId));
      
      // If the current session was deleted, create a new one
      if (currentSessionId === sessionId) {
        // Reset messages to welcome message
        setMessages([welcomeMessage]);
        setCurrentSessionId('');
      }
      
      toast({
        title: "Conversation deleted",
        description: "The conversation has been successfully deleted.",
      });
      
    } catch (error) {
      console.error('Error deleting session:', error);
      toast({
        title: "Error",
        description: "Failed to delete conversation. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Load session
  const loadSession = (session: ChatSession) => {
    setMessages(session.messages);
    setCurrentSessionId(session.id);
  };

  // Update session title based on first user message
  const updateSessionTitle = async (sessionId: string, userMessage: string) => {
    if (!user || !sessionId) return;
    
    // Use the first ~20 characters of the message as the title
    const title = userMessage.length > 20 
      ? userMessage.substring(0, 20) + '...' 
      : userMessage;
    
    try {
      // Update in Supabase
      const { error } = await supabase
        .from('chat_sessions')
        .update({ title })
        .eq('id', sessionId)
        .eq('user_id', user.id);
        
      if (error) throw error;
      
      // Update local state
      setChatSessions(prev => prev.map(session => 
        session.id === sessionId 
          ? { ...session, title } 
          : session
      ));
      
    } catch (error) {
      console.error('Error updating session title:', error);
    }
  };

  // Load user data for AI context
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
  
  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle audio playback
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
  
  // Create a new session when first loading if no sessions exist
  useEffect(() => {
    if (user && !isLoadingHistory && chatSessions.length === 0 && !currentSessionId) {
      createNewSession();
    } else if (user && !isLoadingHistory && chatSessions.length > 0 && !currentSessionId) {
      // Load the most recent session
      loadSession(chatSessions[0]);
    }
  }, [user, isLoadingHistory, chatSessions.length, currentSessionId]);
  
  // Save messages to session
  const saveMessagesToSession = async (sessionId: string, updatedMessages: Message[]) => {
    if (!user || !sessionId) return;
    
    try {
      const { error } = await supabase
        .from('chat_sessions')
        .update({ 
          messages: JSON.stringify(updatedMessages),
          updated_at: new Date().toISOString()
        })
        .eq('id', sessionId)
        .eq('user_id', user.id);
        
      if (error) throw error;
      
      // Update local state
      setChatSessions(prev => prev.map(session => 
        session.id === sessionId 
          ? { 
              ...session, 
              messages: updatedMessages,
              updated_at: new Date().toISOString()
            } 
          : session
      ));
      
    } catch (error) {
      console.error('Error saving messages to session:', error);
    }
  };
  
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
    
    // Check if we need to create a new session
    if (!currentSessionId) {
      await createNewSession();
    }
    
    const userMessage = {
      id: Date.now().toString(),
      role: 'user' as const,
      content: input.trim(),
      timestamp: new Date(),
    };
    
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);
    
    // If this is the first user message, use it to update the session title
    if (messages.length === 1 && messages[0].role === 'assistant') {
      updateSessionTitle(currentSessionId, input.trim());
    }
    
    try {
      // Save user message to session
      await saveMessagesToSession(currentSessionId, updatedMessages);
      
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
      
      const finalMessages = [...updatedMessages, assistantMessage];
      setMessages(finalMessages);
      
      // Save assistant reply to session
      await saveMessagesToSession(currentSessionId, finalMessages);
      
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
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-primary">
          <Avatar className="h-8 w-8 bg-lavender-100">
            <AvatarFallback className="text-lavender-600">AI</AvatarFallback>
            <AvatarImage src="/luna-avatar.png" alt="Luna" />
          </Avatar>
          <span>Luna | Your Health Assistant</span>
        </CardTitle>
        
        <div className="flex items-center gap-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="h-8 w-8">
                <History className="h-4 w-4" />
                <span className="sr-only">Chat History</span>
              </Button>
            </SheetTrigger>
            <SheetContent className="w-[280px] sm:w-[350px] p-0">
              <SheetHeader className="p-6 pb-2">
                <SheetTitle>Chat History</SheetTitle>
              </SheetHeader>
              <div className="px-4 py-2">
                <Button 
                  variant="outline" 
                  className="w-full justify-start text-left mb-4"
                  onClick={createNewSession}
                >
                  <PlusIcon className="mr-2 h-4 w-4" />
                  <span>New Chat</span>
                </Button>
              </div>
              <ScrollArea className="h-[calc(100vh-140px)] pb-8">
                <div className="px-4 pb-8">
                  {isLoadingHistory ? (
                    <div className="flex justify-center p-4">
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                    </div>
                  ) : chatSessions.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No conversations yet
                    </div>
                  ) : (
                    chatSessions.map((session) => (
                      <SheetClose asChild key={session.id}>
                        <Button
                          variant="ghost"
                          className={`w-full justify-start text-left mb-2 ${
                            currentSessionId === session.id ? 'bg-muted' : ''
                          }`}
                          onClick={() => loadSession(session)}
                        >
                          <div className="flex items-center justify-between w-full">
                            <div className="flex items-center truncate">
                              <span className="truncate">{session.title}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 opacity-70 hover:opacity-100"
                                onClick={(e) => deleteSession(session.id, e)}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                              <ChevronRight className="h-4 w-4 opacity-70" />
                            </div>
                          </div>
                        </Button>
                      </SheetClose>
                    ))
                  )}
                </div>
              </ScrollArea>
            </SheetContent>
          </Sheet>
          
          <Button
            variant="outline" 
            size="icon" 
            className="h-8 w-8" 
            onClick={createNewSession}
          >
            <PlusIcon className="h-4 w-4" />
            <span className="sr-only">New Chat</span>
          </Button>
        </div>
      </CardHeader>
      
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full py-12">
              <div className="text-center text-muted-foreground">
                <div className="mb-4">
                  <Avatar className="h-16 w-16 mx-auto">
                    <AvatarFallback className="text-lavender-600 text-xl">AI</AvatarFallback>
                    <AvatarImage src="/luna-avatar.png" alt="Luna" />
                  </Avatar>
                </div>
                <h3 className="text-lg font-medium mb-2">Welcome to Luna</h3>
                <p className="max-w-md">Your personal health assistant. Ask questions about your cycle, get self-care tips, or learn about menstrual health.</p>
              </div>
            </div>
          ) : (
            messages.map((message) => (
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
                      ) : isSpeaking ? (
                        <StopCircleIcon className="h-3 w-3" />
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
            ))
          )}
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
