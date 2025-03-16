
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { User, LockKeyhole, Mail, ArrowRight, LogIn } from 'lucide-react';
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
import { Separator } from '@/components/ui/separator';

const Auth = () => {
  const navigate = useNavigate();
  const { signIn, signUp, signInWithGoogle, user } = useAuth();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
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
      navigate('/dashboard');
    } catch (error) {
      console.error('Sign in error:', error);
    } finally {
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
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      await signInWithGoogle();
      // No need to navigate here as OAuth will handle the redirect
    } catch (error) {
      console.error('Google sign in error:', error);
      toast({
        title: "Google sign in failed",
        description: "There was a problem signing in with Google.",
        variant: "destructive",
      });
    } finally {
      setIsGoogleLoading(false);
    }
  };

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
                  <div className="space-y-4 pt-4">
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
                          disabled={isLoading}
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
                          disabled={isLoading}
                        />
                      </div>
                    </div>
                  
                    <Button
                      type="submit"
                      className="w-full bg-lavender-500 hover:bg-lavender-600"
                      disabled={isLoading}
                    >
                      {isLoading ? (
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
                    
                    <div className="relative flex items-center my-4">
                      <Separator className="flex-1" />
                      <span className="px-3 text-sm text-muted-foreground">OR</span>
                      <Separator className="flex-1" />
                    </div>
                    
                    <Button 
                      type="button"
                      variant="outline" 
                      className="w-full" 
                      onClick={handleGoogleSignIn}
                      disabled={isGoogleLoading}
                    >
                      {isGoogleLoading ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-lavender-600 mr-2"></div>
                          <span>Connecting...</span>
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                            <path
                              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                              fill="#4285F4"
                            />
                            <path
                              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                              fill="#34A853"
                            />
                            <path
                              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                              fill="#FBBC05"
                            />
                            <path
                              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                              fill="#EA4335"
                            />
                          </svg>
                          Sign in with Google
                        </div>
                      )}
                    </Button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleSignUp}>
                  <div className="space-y-4 pt-4">
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
                    
                    <div className="relative flex items-center my-4">
                      <Separator className="flex-1" />
                      <span className="px-3 text-sm text-muted-foreground">OR</span>
                      <Separator className="flex-1" />
                    </div>
                    
                    <Button 
                      type="button"
                      variant="outline" 
                      className="w-full" 
                      onClick={handleGoogleSignIn}
                      disabled={isGoogleLoading}
                    >
                      {isGoogleLoading ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-lavender-600 mr-2"></div>
                          <span>Connecting...</span>
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                            <path
                              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                              fill="#4285F4"
                            />
                            <path
                              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                              fill="#34A853"
                            />
                            <path
                              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                              fill="#FBBC05"
                            />
                            <path
                              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                              fill="#EA4335"
                            />
                          </svg>
                          Sign up with Google
                        </div>
                      )}
                    </Button>
                  </div>
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
