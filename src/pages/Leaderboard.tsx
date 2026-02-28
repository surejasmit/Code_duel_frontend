

import React from 'react';

import { useLeaderboard } from '@/hooks/useLeaderboard';
import React, { useState, useEffect } from 'react';

import { Link } from 'react-router-dom';
import { ArrowLeft, Trophy, Medal, Award, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import LeaderboardTable from '@/components/leaderboard/LeaderboardTable';
import { useAuth } from '@/contexts/AuthContext';
import { useLeaderboard } from '@/hooks/useLeaderboard';
import { mockLeaderboard } from '@/data/mockData';
import type { RankableUser } from '@/utils/leaderboardEngine';
import React, { useEffect, useMemo, useState } from "react";
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
import { dashboardApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { LeaderboardEntry } from "@/types";
import { useLeaderboard } from "@/hooks/useLeaderboard";

const Leaderboard: React.FC = () => {
  const { user } = useAuth();

  
  // Remove rank property from mock data since hook will calculate it
  const rawLeaderboardData: RankableUser[] = mockLeaderboard.map(({ rank, ...rest }) => rest) as RankableUser[];

  // Use the dynamic leaderboard hook for client-side ranking
  const { 
    rankedEntries, 
    topThree,
    totalEntries,
  } = useLeaderboard(rawLeaderboardData, {
    currentUserId: user?.id,
    trackChanges: false,
    enableSearch: false,
    enablePagination: false,
  });

  // Calculate stats from ranked entries
  const totalSolved = rankedEntries.reduce((acc, e) => acc + (e.totalSolved || 0), 0);
  const longestStreak = rankedEntries.length > 0 
    ? Math.max(...rankedEntries.map(e => e.longestStreak || e.currentStreak || 0)) 
    : 0;
  const totalPenalties = rankedEntries.reduce((acc, e) => acc + (e.penaltyAmount || 0), 0);

  const { toast } = useToast();

  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(true);
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
      } catch {
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
  }, []);

  const processedLeaderboard = useLeaderboard(
    leaderboardData,
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
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Back Button */}
        <Button variant="ghost" size="sm" asChild className="gap-2">
          <Link to="/">
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

        {rankedEntries.length === 0 ? (
          <div className="text-center py-10 bg-muted/20 rounded-lg">
            <Trophy className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <h3 className="text-lg font-medium">No Data Available</h3>
            <p className="text-muted-foreground">The leaderboard is currently empty.</p>
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
              <Card className="hover-lift">
                <CardContent className="p-4 text-center">
                  <Trophy className="h-8 w-8 mx-auto mb-2 text-yellow-500" />

                  <p className="text-2xl font-bold">{totalEntries}</p>

                <p className="text-2xl font-bold">{processedLeaderboard.length}</p>

                  <p className="text-sm text-muted-foreground">Participants</p>
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

            {/* Full Leaderboard */}

            <LeaderboardTable entries={rankedEntries} currentUserId={user?.id} />

          <LeaderboardTable
  entries={processedLeaderboard}
  currentUserId={user?.id}
/>
          </>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
