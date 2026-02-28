import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Loader2, Trophy } from "lucide-react";

import Layout from "@/components/layout/Layout";
import LeaderboardTable from "@/components/leaderboard/LeaderboardTable";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { LeaderboardEntry } from "@/types";

// ✅ Centralized React Query hook — cached globally
import { useGlobalLeaderboard, useLeaderboard } from "@/hooks/useLeaderboard";

const Leaderboard: React.FC = () => {
  const { user } = useAuth();

  // ✅ Single hook replaces useState + useEffect + loadLeaderboard + toast error handling
  const { data: leaderboardData = [], isLoading } = useGlobalLeaderboard();

  // Client-side filtering and sorting state
  const [searchQuery, setSearchQuery] = useState("");
  const [sortKey, setSortKey] = useState<
    "rank" | "totalSolved" | "currentStreak" | "penaltyAmount"
  >("rank");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const processedLeaderboard = useLeaderboard(
    leaderboardData as LeaderboardEntry[],
    searchQuery,
    sortKey,
    sortOrder,
  );
  const topThree = processedLeaderboard.slice(0, 3);

  const totalSolved = useMemo(
    () =>
      processedLeaderboard.reduce(
        (acc, entry) => acc + (entry.totalSolved || 0),
        0,
      ),
    [processedLeaderboard],
  );

  const longestStreak = useMemo(
    () =>
      processedLeaderboard.length > 0
        ? Math.max(
          ...processedLeaderboard.map((entry) => entry.currentStreak || 0),
        )
        : 0,
    [processedLeaderboard],
  );

  const totalPenalties = useMemo(
    () =>
      processedLeaderboard.reduce(
        (acc, entry) => acc + (entry.penaltyAmount || 0),
        0,
      ),
    [processedLeaderboard],
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
        ) : (
          <>
            {topThree.length > 0 && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Trophy className="h-5 w-5 text-primary" />
                    <h2 className="font-semibold">Top Performers</h2>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-3">
                    {topThree.map((entry) => (
                      <div
                        key={entry.userId}
                        className="rounded-md border p-3 text-sm"
                      >
                        <p className="font-medium">
                          #{entry.rank} {entry.userName}
                        </p>
                        <p className="text-muted-foreground">
                          {entry.totalSolved} solved
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <LeaderboardTable
              entries={processedLeaderboard}
              currentUserId={user?.id}
            />

            <div className="grid gap-3 sm:grid-cols-3">
              <Card>
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground">Total Solved</p>
                  <p className="text-2xl font-semibold">{totalSolved}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground">
                    Longest Streak
                  </p>
                  <p className="text-2xl font-semibold">{longestStreak}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground">
                    Total Penalties
                  </p>
                  <p className="text-2xl font-semibold">${totalPenalties}</p>
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
