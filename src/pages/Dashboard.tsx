import React from "react";
import { Flame, Target, DollarSign, Zap, Trophy, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Layout from "@/components/layout/Layout";
import StatsCard from "@/components/common/StatsCard";
import TodayStatus from "@/components/dashboard/TodayStatus";
import ProgressChart from "@/components/dashboard/ProgressChart";
import ActivityHeatmap from "@/components/dashboard/ActivityHeatmap";
import ChallengeCard from "@/components/dashboard/ChallengeCard";
import InviteRequests from "@/components/dashboard/InviteRequests";
import EmptyState from "@/components/common/EmptyState";
import { Skeleton } from "@/components/common/Skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { Stats, Challenge } from "@/types";

// ✅ Centralized React Query hooks — single source of truth
import { useDashboardStats, useActivityHeatmap, useSubmissionChart } from "@/hooks/useDashboardData";
import { useChallenges } from "@/hooks/useChallenges";

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  // ✅ All data is fetched via cached React Query hooks
  // No manual useState/useEffect/loadDashboardData needed
  const { data: statsData, isLoading: statsLoading } = useDashboardStats();
  const { data: activityData, isLoading: activityLoading } = useActivityHeatmap();
  const { data: chartData, isLoading: chartLoading } = useSubmissionChart();
  const { data: challengesData, isLoading: challengesLoading } = useChallenges();

  const isLoading = statsLoading || activityLoading || chartLoading || challengesLoading;

  // Derive stats with fallbacks
  const stats: Stats = statsData || {
    todayStatus: "pending",
    todaySolved: 0,
    todayTarget: 0,
    currentStreak: 0,
    longestStreak: 0,
    totalPenalties: 0,
    activeChallenges: 0,
    totalSolved: 0,
  };

  const challenges = challengesData || [];
  const activity = activityData || [];
  const chart = chartData || [];

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">
              Welcome back,{" "}
              <span className="gradient-text">{user?.name || "Developer"}</span>
            </h1>
            <p className="text-muted-foreground mt-1">
              Track your daily coding progress and stay consistent
            </p>
          </div>
          <Button asChild className="gradient-primary sm:w-auto w-full">
            <Link to="/create-challenge" className="gap-2">
              <Plus className="h-4 w-4" />
              New Challenge
            </Link>
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Current Streak"
            value={stats.currentStreak}
            subtitle={`Best: ${stats.longestStreak} days`}
            icon={Flame}
            variant="warning"
            trend="up"
            trendValue="+3 from last week"
          />
          <StatsCard
            title="Total Solved"
            value={stats.totalSolved}
            subtitle="Lifetime problems"
            icon={Target}
            variant="primary"
          />

          <StatsCard
            title="Active Challenges"
            value={stats.activeChallenges}
            subtitle="Ongoing competitions"
            icon={Trophy}
            variant="success"
          />
          <StatsCard
            title="Total Penalties"
            value={`$${stats.totalPenalties}`}
            subtitle="Avoid missing days!"
            icon={DollarSign}
            variant="destructive"
          />
        </div>

        {/* Invite Requests */}
        <InviteRequests />

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Today's Status */}
          <div className="lg:col-span-1">
            <TodayStatus stats={stats} />
          </div>

          {/* Right Column - Chart */}
          <div className="lg:col-span-2">
            <ProgressChart
              data={chart}
              title="Daily Submissions (Last 30 Days)"
            />
          </div>
        </div>

        {/* Activity Heatmap */}
        <ActivityHeatmap data={activity} title="Contribution Graph" />

        {/* Active Challenges */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Active Challenges</h2>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/challenges">View all</Link>
            </Button>
          </div>

          {challenges.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {challenges.slice(0, 3).map((challenge: Challenge) => (
                <ChallengeCard key={challenge.id} challenge={challenge} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Zap}
              title="No active challenges"
              description="Create or join a challenge to start competing with others and stay motivated!"
              action={{
                label: "Create Challenge",
                onClick: () => { },
              }}
            />
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
