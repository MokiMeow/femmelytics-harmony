
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // This effect ensures we wait for auth state to be fully resolved
    if (!loading) {
      // Set a brief timeout to ensure auth state is fully updated
      const timer = setTimeout(() => {
        setIsChecking(false);
      }, 300); // Increased timeout for more reliability
      
      return () => clearTimeout(timer);
    }
  }, [loading, user]);

  // Detailed logging for debugging
  console.log('ProtectedRoute - Auth state:', { 
    user: user?.email, 
    loading, 
    isChecking
  });

  // Show loading state while checking auth
  if (loading || isChecking) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Redirect if not authenticated
  if (!user) {
    console.log('ProtectedRoute - Not authenticated, redirecting to /auth');
    return <Navigate to="/auth" replace />;
  }

  console.log('ProtectedRoute - Authenticated, rendering children');
  return <>{children}</>;
};

export default ProtectedRoute;
