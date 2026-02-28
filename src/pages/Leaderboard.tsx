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
    sortOrder
  );

  const topThree = useMemo(() => processedLeaderboard.slice(0, 3), [processedLeaderboard]);

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
            {/* Top 3 Podium */}
            {topThree.length >= 3 && searchQuery === "" && (
              <div className="grid grid-cols-3 gap-4 max-w-3xl mx-auto mb-8">
                {/* 2nd Place */}
                <div className="order-1 pt-8">
                  <Card className="hover-lift text-center p-4 bg-gradient-to-b from-gray-400/10 to-gray-400/5 border-gray-400/20">
                    <div className="relative mb-3">
                      <Avatar className="h-16 w-16 mx-auto border-4 border-gray-400">
                        <AvatarImage src={topThree[1]?.avatar} />
                        <AvatarFallback>
                          {topThree[1]?.userName?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-gray-400 rounded-full p-1 shadow-lg">
                        <Medal className="h-4 w-4 text-white" />
                      </div>
                    </div>
                    <div className="font-bold truncate">{topThree[1]?.userName}</div>
                    <div className="text-xs text-muted-foreground">#2 Overall</div>
                  </Card>
                </div>

                {/* 1st Place */}
                <div className="order-2">
                  <Card className="hover-lift text-center p-6 bg-gradient-to-b from-yellow-500/10 to-yellow-500/5 border-yellow-500/30 shadow-glow border-2">
                    <div className="relative mb-4">
                      <Avatar className="h-20 w-20 mx-auto border-4 border-yellow-500 shadow-lg">
                        <AvatarImage src={topThree[0]?.avatar} />
                        <AvatarFallback>
                          {topThree[0]?.userName?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-yellow-500 rounded-full p-1.5 shadow-xl animate-pulse">
                        <Trophy className="h-5 w-5 text-white" />
                      </div>
                    </div>
                    <div className="font-black text-lg truncate text-yellow-500">
                      {topThree[0]?.userName}
                    </div>
                    <div className="text-xs font-semibold uppercase tracking-wider text-yellow-600">
                      Grand Master
                    </div>
                  </Card>
                </div>

                {/* 3rd Place */}
                <div className="order-3 pt-12">
                  <Card className="hover-lift text-center p-4 bg-gradient-to-b from-amber-600/10 to-amber-600/5 border-amber-600/20">
                    <div className="relative mb-3">
                      <Avatar className="h-14 w-14 mx-auto border-4 border-amber-600">
                        <AvatarImage src={topThree[2]?.avatar} />
                        <AvatarFallback>
                          {topThree[2]?.userName?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-amber-600 rounded-full p-1 shadow-md">
                        <Award className="h-4 w-4 text-white" />
                      </div>
                    </div>
                    <div className="font-bold truncate">{topThree[2]?.userName}</div>
                    <div className="text-xs text-muted-foreground">#3 Overall</div>
                  </Card>
                </div>
              </div>
            )}

            {/* Top Performers (Upstream style if not enough for podium or searching) */}
            {(topThree.length < 3 || searchQuery !== "") && topThree.length > 0 && (
              <Card className="mb-6">
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

            <LeaderboardTable
              entries={processedLeaderboard}
              currentUserId={user?.id}
            />

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
