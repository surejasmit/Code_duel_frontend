import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Trophy, Medal, Award, TrendingUp, Loader2 } from "lucide-react";

import Layout from "@/components/layout/Layout";
import LeaderboardTable from "@/components/leaderboard/LeaderboardTable";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useErrorHandler } from "@/hooks/useErrorHandler";
import { LeaderboardEntry } from "@/types";

// ✅ Centralized React Query hook — cached globally
import { useGlobalLeaderboard, useClientLeaderboard } from "@/hooks/useLeaderboard";

const Leaderboard: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const errorHandler = useErrorHandler();

  // ✅ Single hook replaces useState + useEffect + loadLeaderboard + toast error handling
  const { data: leaderboardData = [], isLoading, error } = useGlobalLeaderboard();

  // Client-side filtering and sorting state
  const [searchQuery, setSearchQuery] = useState("");
  const [sortKey, setSortKey] = useState<
    "rank" | "totalSolved" | "currentStreak" | "penaltyAmount"
  >("rank");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  useEffect(() => {
    const loadLeaderboard = async () => {
      setIsLoading(true);
      try {
        const response = await dashboardApi.getGlobalLeaderboard();
        if (response.success && response.data) {
          setLeaderboardData(response.data);
        } else {
          throw new Error(response.message || "Failed to load leaderboard");
        }
      } catch (err) {
        errorHandler(err, 'Leaderboard:loadLeaderboard');
        toast({
          title: "Error loading leaderboard",
          description: "Could not fetch leaderboard.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadLeaderboard();
  }, [errorHandler]);

  const processedLeaderboard = useClientLeaderboard(
    leaderboardData as LeaderboardEntry[],
    searchQuery,
    sortKey,
    sortOrder
  );
  const topThree = processedLeaderboard.slice(0, 3);

  const totalSolved = useMemo(
    () =>
      processedLeaderboard.reduce(
        (acc, entry) => acc + (entry.totalSolved || 0),
        0
      ),
    [processedLeaderboard]
  );

  const longestStreak = useMemo(
    () =>
      processedLeaderboard.length > 0
        ? Math.max(
            ...processedLeaderboard.map((entry) => entry.currentStreak || 0),
          )
        : 0,
    [processedLeaderboard]
  );

  const totalPenalties = useMemo(
    () =>
      processedLeaderboard.reduce(
        (acc, entry) => acc + (entry.penaltyAmount || 0),
        0
      ),
    [processedLeaderboard]
  );

  return (
    <Layout>
      <div className="space-y-6">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/dashboard" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>

        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Leaderboard</h1>
          <p className="text-muted-foreground">
            See who's leading the pack in solving problems
          </p>
        </div>

        {/* Filters */}
        <div className="grid gap-3 sm:grid-cols-3">
          <Input
            placeholder="Search username..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
          />

          <Select
            value={sortKey}
            onValueChange={(value) => setSortKey(value as typeof sortKey)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="rank">Rank</SelectItem>
              <SelectItem value="totalSolved">Solved</SelectItem>
              <SelectItem value="currentStreak">Streak</SelectItem>
              <SelectItem value="penaltyAmount">Penalty</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={sortOrder}
            onValueChange={(value) => setSortOrder(value as typeof sortOrder)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Order" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="asc">Ascending</SelectItem>
              <SelectItem value="desc">Descending</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20">
            <p className="text-destructive mb-2">Failed to load leaderboard</p>
            <p className="text-sm text-muted-foreground">{error.message || 'An error occurred'}</p>
          </div>
        ) : processedLeaderboard.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Trophy className="h-12 w-12 mb-4 text-muted-foreground" />
            <p className="text-lg font-medium">No leaderboard data available</p>
            <p className="text-sm text-muted-foreground">Check back later!</p>
          </div>
        ) : (
          <>
            {topThree.length > 0 && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    <h2 className="font-semibold">Top Performers</h2>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-3">
                    {topThree.map((entry) => (
                      <div
                        key={entry.userId}
                        className="rounded-md border p-3 text-sm flex items-center gap-3 bg-muted/30"
                      >
                        <span className="font-bold text-lg text-primary">#{entry.rank}</span>
                        <div className="min-w-0">
                          <p className="font-medium truncate">{entry.userName}</p>
                          <p className="text-xs text-muted-foreground uppercase">
                            {entry.totalSolved} solved
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Leaderboard Table */}
            <LeaderboardTable
              entries={processedLeaderboard}
              currentUserId={user?.id}
            />

            {/* Stats Cards */}
            <div className="grid gap-3 sm:grid-cols-3">
              <Card className="hover-lift border-primary/20">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Solved</p>
                    <p className="text-2xl font-black text-primary">{totalSolved}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-primary/20" />
                </CardContent>
              </Card>
              <Card className="hover-lift border-yellow-500/20">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Longest Streak</p>
                    <p className="text-2xl font-black text-yellow-500">{longestStreak}d</p>
                  </div>
                  <Trophy className="h-8 w-8 text-yellow-500/20" />
                </CardContent>
              </Card>
              <Card className="hover-lift border-destructive/20">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Penalties</p>
                    <p className="text-2xl font-black text-destructive">${totalPenalties}</p>
                  </div>
                  <Award className="h-8 w-8 text-destructive/20" />
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default Leaderboard;
