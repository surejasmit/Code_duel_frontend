import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <section className="min-h-screen flex flex-col items-center justify-center bg-background px-4 text-center">

      {/* Removed animated image for cleaner 404 UI */}

      {/* Content Box */}
      <div className="mt-6 space-y-4">
        <h2 className="text-2xl sm:text-3xl font-semibold">
          Looks like you're lost
        </h2>

        <p className="text-muted-foreground max-w-md mx-auto">
          The page you are looking for is not available or might have been moved.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">

          <Button
            variant="outline"
            className="gap-2"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </Button>

          <Button asChild className="gradient-primary gap-2">
            <Link to="/">
              <Home className="h-4 w-4" />
              Go To Home
            </Link>
          </Button>

        </div>
      </div>

    </section>
  );
};

export default NotFound;