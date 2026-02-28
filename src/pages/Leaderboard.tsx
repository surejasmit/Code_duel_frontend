import { useLeaderboard } from '@/hooks/useLeaderboard';
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Trophy, Medal, Award, TrendingUp, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Layout from '@/components/layout/Layout';
import LeaderboardTable from '@/components/leaderboard/LeaderboardTable';
import { dashboardApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { LeaderboardEntry } from '@/types';

const Leaderboard: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
const [searchQuery, setSearchQuery] = useState('');
const [sortKey, setSortKey] = useState<'rank' | 'totalSolved' | 'currentStreak' | 'penaltyAmount'>('rank');
const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  useEffect(() => {
    const abortController = new AbortController();
    loadLeaderboard(abortController.signal);
    return () => abortController.abort();
  }, []);

  const loadLeaderboard = async (signal: AbortSignal) => {
    setIsLoading(true);
    try {
      const response = await dashboardApi.getGlobalLeaderboard(signal);
      if (response.success && response.data) {
        setLeaderboardData(response.data);
      } else {
        throw new Error(response.message || 'Failed to fetch leaderboard data');
      }
    } catch (error: unknown) {
      if (signal.aborted) return;
      console.error('Failed to load leaderboard:', error);
      toast({
        title: 'Error loading leaderboard',
        description: 'Could not fetch the latest rankings. Please try again later.',
        variant: 'destructive',
      });
    } finally {
      if (!signal.aborted) setIsLoading(false);
    }
  };

const processedLeaderboard = useLeaderboard(
  leaderboardData,
  searchQuery,
  sortKey,
  sortOrder
);

const topThree = processedLeaderboard.slice(0, 3);

 const totalSolved = processedLeaderboard.reduce(
  (acc, e) => acc + (e.totalSolved || 0),
  0
);

const longestStreak =
  processedLeaderboard.length > 0
    ? Math.max(...processedLeaderboard.map(e => e.currentStreak || 0))
    : 0;

const totalPenalties = processedLeaderboard.reduce(
  (acc, e) => acc + (e.penaltyAmount || 0),
  0
);
  return (
    <Layout>
      <div className="space-y-8">
        {/* Back Button */}
        <Button variant="ghost" size="sm" asChild className="gap-2">
          <Link to="/">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>

        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">
            <span className="gradient-text">Leaderboard</span>
          </h1>
          <p className="text-muted-foreground">
            See who's leading the pack in solving problems
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : leaderboardData.length === 0 ? (
          <div className="text-center py-10 bg-muted/20 rounded-lg">
            <Trophy className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <h3 className="text-lg font-medium">No Data Available</h3>
            <p className="text-muted-foreground">The leaderboard is currently empty.</p>
          </div>
        ) : (
          <>
            {/* Top 3 Podium */}
            <div className="flex flex-col md:flex-row gap-4 justify-center items-center mb-6">
  <input
    type="text"
    placeholder="Search user..."
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
    className="px-3 py-2 rounded-md border bg-background text-sm"
  />

  <select
    value={sortKey}
    onChange={(e) =>
      setSortKey(
        e.target.value as 'rank' | 'totalSolved' | 'currentStreak' | 'penaltyAmount'
      )
    }
    className="px-3 py-2 rounded-md border bg-background text-sm"
  >
    <option value="rank">Rank</option>
    <option value="totalSolved">Solved</option>
    <option value="currentStreak">Streak</option>
    <option value="penaltyAmount">Penalty</option>
  </select>

  <Button
    size="sm"
    onClick={() =>
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    }
  >
    {sortOrder === 'asc' ? 'Asc' : 'Desc'}
  </Button>
</div>
            {topThree.length >= 3 && (
              <div className="grid grid-cols-3 gap-4 max-w-3xl mx-auto">
                {/* 2nd Place */}
                <div className="order-1 pt-8">
                  <Card className="hover-lift text-center p-4 bg-gradient-to-b from-gray-400/10 to-gray-400/5 border-gray-400/20">
                    <div className="relative mb-3">
                      <Avatar className="h-16 w-16 mx-auto border-4 border-gray-400">
                        <AvatarImage src={topThree[1]?.avatar} />
                        <AvatarFallback>{topThree[1]?.userName?.charAt(0) || 'U'}</AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-gray-400 rounded-full p-1">
                        <Medal className="h-4 w-4 text-primary-foreground" />
                      </div>
                    </div>
                    <p className="font-semibold truncate">{topThree[1]?.userName}</p>
                    <p className="text-sm text-muted-foreground">{topThree[1]?.totalSolved || 0} solved</p>
                    <p className="text-xs text-muted-foreground">🔥 {topThree[1]?.currentStreak || 0} streak</p>
                  </Card>
                </div>

                {/* 1st Place */}
                <div className="order-2">
                  <Card className="hover-lift text-center p-4 bg-gradient-to-b from-yellow-500/10 to-yellow-500/5 border-yellow-500/20 shadow-glow">
                    <div className="relative mb-3">
                      <Avatar className="h-20 w-20 mx-auto border-4 border-yellow-500">
                        <AvatarImage src={topThree[0]?.avatar} />
                        <AvatarFallback>{topThree[0]?.userName?.charAt(0) || 'U'}</AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-yellow-500 rounded-full p-1">
                        <Trophy className="h-4 w-4 text-primary-foreground" />
                      </div>
                    </div>
                    <p className="font-semibold truncate text-lg">{topThree[0]?.userName}</p>
                    <p className="text-sm text-muted-foreground">{topThree[0]?.totalSolved || 0} solved</p>
                    <p className="text-xs text-muted-foreground">🔥 {topThree[0]?.currentStreak || 0} streak</p>
                  </Card>
                </div>

                {/* 3rd Place */}
                <div className="order-3 pt-12">
                  <Card className="hover-lift text-center p-4 bg-gradient-to-b from-amber-600/10 to-amber-600/5 border-amber-600/20">
                    <div className="relative mb-3">
                      <Avatar className="h-14 w-14 mx-auto border-4 border-amber-600">
                        <AvatarImage src={topThree[2]?.avatar} />
                        <AvatarFallback>{topThree[2]?.userName?.charAt(0) || 'U'}</AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-amber-600 rounded-full p-1">
                        <Award className="h-4 w-4 text-primary-foreground" />
                      </div>
                    </div>
                    <p className="font-semibold truncate">{topThree[2]?.userName}</p>
                    <p className="text-sm text-muted-foreground">{topThree[2]?.totalSolved || 0} solved</p>
                    <p className="text-xs text-muted-foreground">🔥 {topThree[2]?.currentStreak || 0} streak</p>
                  </Card>
                </div>
              </div>
            )}

            {/* Stats Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="hover-lift">
                <CardContent className="p-4 text-center">
                  <TrendingUp className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="text-2xl font-bold">{totalSolved}</p>
                  <p className="text-sm text-muted-foreground">Total Solved</p>
                </CardContent>
              </Card>
              <Card className="hover-lift">
                <CardContent className="p-4 text-center">
                  <Trophy className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
                <p className="text-2xl font-bold">{processedLeaderboard.length}</p>
                  <p className="text-sm text-muted-foreground">Participants</p>
                </CardContent>
              </Card>
              <Card className="hover-lift">
                <CardContent className="p-4 text-center">
                  <span className="text-3xl">🔥</span>
                  <p className="text-2xl font-bold">{longestStreak}</p>
                  <p className="text-sm text-muted-foreground">Longest Streak</p>
                </CardContent>
              </Card>
              <Card className="hover-lift">
                <CardContent className="p-4 text-center">
                  <span className="text-3xl">💸</span>
                  <p className="text-2xl font-bold">${totalPenalties}</p>
                  <p className="text-sm text-muted-foreground">Total Penalties</p>
                </CardContent>
              </Card>
            </div>

            {/* Full Leaderboard */}
          <LeaderboardTable
  entries={processedLeaderboard}
  currentUserId={user?.id}
/>
          </>
        )}
      </div>
    </Layout>
  );
};

export default Leaderboard;
