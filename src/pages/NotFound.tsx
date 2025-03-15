
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center max-w-md px-4">
        <h1 className="text-5xl font-bold mb-4 text-primary">404</h1>
        <p className="text-xl text-muted-foreground mb-6">
          Oops! The page you're looking for doesn't exist
        </p>
        <p className="mb-8 text-muted-foreground">
          You may have mistyped the address or the page may have moved.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild variant="default">
            <Link to="/" className="flex items-center gap-2">
              <Home size={16} /> Go to Home
            </Link>
          </Button>
          <Button asChild variant="outline">
            <a 
              href="javascript:history.back()" 
              className="flex items-center gap-2"
            >
              <ArrowLeft size={16} /> Go Back
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
