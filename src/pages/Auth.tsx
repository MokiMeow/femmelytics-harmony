
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { User, LockKeyhole, Mail, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { PieChartIcon, LightbulbIcon, MessageSquareIcon } from '@/components/ui/icons';
import Navigation from '@/components/Navigation';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { InfoIcon } from 'lucide-react';

const Auth = () => {
  const navigate = useNavigate();
  const { signIn, signUp, user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') === 'signup' ? 'signup' : 'signin');
  const [showEmailConfirmAlert, setShowEmailConfirmAlert] = useState(false);

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'signup') {
      setActiveTab('signup');
    } else if (tab === 'signin') {
      setActiveTab('signin');
    }
  }, [searchParams]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({
        title: "Missing fields",
        description: "Please fill in all fields.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    try {
      await signIn(email, password);
      // Note: Navigation is now handled in the signIn function
    } catch (error) {
      console.error("Sign in error:", error);
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({
        title: "Missing fields",
        description: "Please fill in all fields.",
        variant: "destructive",
      });
      return;
    }
    
    if (password.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    try {
      const normalizedEmail = email.toLowerCase().trim();
      const result = await signUp(normalizedEmail, password);
      
      if (result) {
        setShowEmailConfirmAlert(true);
        toast({
          title: "Account created",
          description: "Please check your email to confirm your account.",
        });
      }
      setIsLoading(false);
    } catch (error) {
      console.error("Sign up error:", error);
      setIsLoading(false);
    }
  };

  // Don't show loading spinner in both places
  const showLoadingSpinner = isLoading || authLoading;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-lavender-50 flex flex-col">
      <Navigation />
      
      <div className="flex-1 flex flex-col lg:flex-row w-full max-w-6xl mx-auto px-4 pt-24 pb-16">
        <div className="lg:w-1/2 lg:pr-12 mb-10 lg:mb-0">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl font-bold text-primary mb-4">Your health journey starts here</h1>
            <p className="text-lg text-muted-foreground mb-8">
              Track your cycle, understand your patterns, and get personalized insights for your well-being.
            </p>
            
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="bg-primary/10 p-2 rounded-full">
                  <PieChartIcon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">Track your cycle with ease</h3>
                  <p className="text-muted-foreground">Log your period, symptoms, and mood to get a complete picture of your health.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="bg-primary/10 p-2 rounded-full">
                  <LightbulbIcon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">Personalized insights</h3>
                  <p className="text-muted-foreground">Discover patterns and receive tailored recommendations.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="bg-primary/10 p-2 rounded-full">
                  <MessageSquareIcon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">AI Health Assistant</h3>
                  <p className="text-muted-foreground">Chat with Luna for personalized advice and support.</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
        
        <div className="lg:w-1/2 lg:pl-12">
          <Card className="w-full shadow-lg border-lavender-200">
            <CardHeader>
              <Tabs defaultValue={activeTab} className="w-full" onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="signin">Sign In</TabsTrigger>
                  <TabsTrigger value="signup">Sign Up</TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>
            <CardContent>
              {showEmailConfirmAlert && activeTab === "signup" && (
                <Alert className="mb-4 bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800">
                  <InfoIcon className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                  <AlertTitle>Check your email</AlertTitle>
                  <AlertDescription>
                    We've sent a confirmation link to your email. Please check your inbox and confirm your account.
                  </AlertDescription>
                </Alert>
              )}
            
              {activeTab === "signin" ? (
                <form onSubmit={handleSignIn}>
                  <CardContent className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label htmlFor="signin-email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="signin-email"
                          type="email"
                          placeholder="name@example.com"
                          className="pl-10"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          disabled={showLoadingSpinner}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signin-password">Password</Label>
                      <div className="relative">
                        <LockKeyhole className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="signin-password"
                          type="password"
                          placeholder="••••••••"
                          className="pl-10"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          disabled={showLoadingSpinner}
                        />
                      </div>
                    </div>
                  </CardContent>
                  
                  <CardFooter>
                    <Button
                      type="submit"
                      className="w-full bg-lavender-500 hover:bg-lavender-600"
                      disabled={showLoadingSpinner}
                    >
                      {showLoadingSpinner ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          <span>Signing in...</span>
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <span>Sign In</span>
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </div>
                      )}
                    </Button>
                  </CardFooter>
                </form>
              ) : (
                <form onSubmit={handleSignUp}>
                  <CardContent className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="signup-email"
                          type="email"
                          placeholder="name@example.com"
                          className="pl-10"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          disabled={isLoading}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Password</Label>
                      <div className="relative">
                        <LockKeyhole className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="signup-password"
                          type="password"
                          placeholder="••••••••"
                          className="pl-10"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          disabled={isLoading}
                        />
                      </div>
                    </div>
                  </CardContent>
                  
                  <CardFooter>
                    <Button
                      type="submit"
                      className="w-full bg-lavender-500 hover:bg-lavender-600"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          <span>Creating account...</span>
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <span>Create Account</span>
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </div>
                      )}
                    </Button>
                  </CardFooter>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      <div className="py-8 bg-muted">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-muted-foreground">
            Secure, private, and designed for your well-being.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
