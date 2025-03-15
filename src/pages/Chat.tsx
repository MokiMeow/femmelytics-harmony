
import React from 'react';
import Navigation from '@/components/Navigation';
import AIAssistant from '@/components/AIAssistant';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';

const Chat = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="pt-24 pb-16 px-4 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Chat with Luna</h1>
        <AIAssistant />
      </div>
    </div>
  );
};

export default Chat;
