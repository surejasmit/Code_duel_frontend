import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Home: React.FC = () => {
  return (
    <section className="min-h-screen flex flex-col items-center justify-center bg-background px-4 text-center">
      <h1 className="text-5xl sm:text-6xl font-extrabold text-primary mb-4 drop-shadow-md">
        Welcome to Code Duel
      </h1>
      <p className="text-muted-foreground max-w-xl mx-auto text-lg sm:text-xl mb-8">
        Compete in coding challenges, track your progress, and climb the leaderboard. Log in to start dueling!
      </p>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button asChild className="gradient-primary gap-2">
          <Link to="/register">
            Sign Up
          </Link>
        </Button>

        <Button asChild variant="outline" className="gap-2">
          <Link to="/login">
            Log In
          </Link>
        </Button>
      </div>

      {/* Optional feature section */}
      <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-5xl w-full">
        <div className="p-6 bg-card rounded-lg shadow hover:shadow-lg transition">
          <h2 className="text-xl font-semibold mb-2">Challenges</h2>
          <p className="text-muted-foreground">
            Solve exciting coding problems and improve your skills.
          </p>
        </div>
        <div className="p-6 bg-card rounded-lg shadow hover:shadow-lg transition">
          <h2 className="text-xl font-semibold mb-2">Leaderboard</h2>
          <p className="text-muted-foreground">
            See how you rank against other coders worldwide.
          </p>
        </div>
        <div className="p-6 bg-card rounded-lg shadow hover:shadow-lg transition">
          <h2 className="text-xl font-semibold mb-2">Profile</h2>
          <p className="text-muted-foreground">
            Track your progress, badges, and achievements.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Home;