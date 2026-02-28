import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Loader2,
  PlayCircle,
  Target,
  UserPlus,
  Users,
} from "lucide-react";

import Layout from "@/components/layout/Layout";
import ProgressChart from "@/components/dashboard/ProgressChart";
import InviteUserDialog from "@/components/challenge/InviteUserDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { challengeApi, dashboardApi } from "@/lib/api";
import { Challenge, ChartData, LeaderboardEntry } from "@/types";
import { useAuth } from "@/contexts/AuthContext";

type ChallengeDetails = Challenge & {
  description?: string;
  ownerId?: string;
  visibility?: "PUBLIC" | "PRIVATE" | string;
};

const ChallengePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();

  const [challenge, setChallenge] = useState<ChallengeDetails | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [isActivating, setIsActivating] = useState(false);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);

  const loadChallengeData = async () => {
    if (!id) return;

    setIsLoading(true);
    setHasError(false);

    try {
      const [challengeResponse, leaderboardResponse, progressResponse] =
        await Promise.all([
          challengeApi.getById(id),
          dashboardApi.getChallengeLeaderboard(id),
          dashboardApi.getChallengeProgress(id),
        ]);

      if (challengeResponse.success && challengeResponse.data) {
        setChallenge(challengeResponse.data as ChallengeDetails);
      } else {
        setHasError(true);
      }

      setLeaderboard(
        leaderboardResponse.success && leaderboardResponse.data
          ? leaderboardResponse.data
          : [],
      );
      setChartData(
        progressResponse.success && progressResponse.data
          ? progressResponse.data
          : [],
      );
    } catch {
      setHasError(true);
      toast({
        title: "Failed to load challenge",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadChallengeData();
  }, [id]);

  const handleJoinChallenge = async () => {
    if (!id) return;

    setIsJoining(true);
    try {
      const response = await challengeApi.join(id);
      if (response.success) {
        toast({
          title: "Joined challenge!",
          description: "You have successfully joined the challenge.",
        });
        await loadChallengeData();
      } else {
        toast({
          title: "Failed to join challenge",
          description: response.message || "Please try again.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Failed to join challenge",
        description:
          error?.response?.data?.message ||
          error?.message ||
          "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsJoining(false);
    }
  };

  const handleActivateChallenge = async () => {
    if (!id) return;

    setIsActivating(true);
    try {
      const response = await challengeApi.updateStatus(id, "ACTIVE");
      if (response.success) {
        toast({
          title: "Challenge activated!",
          description: "Your challenge is now active.",
        });
        await loadChallengeData();
      } else {
        toast({
          title: "Failed to activate challenge",
          description: response.message || "Please try again.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Failed to activate challenge",
        description:
          error?.response?.data?.message ||
          error?.message ||
          "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsActivating(false);
    }
  };

  const difficultyDisplay = useMemo(() => {
    if (!challenge?.difficultyFilter || challenge.difficultyFilter.length === 0)
      return "Any";
    if (challenge.difficultyFilter.length === 3) return "Any";
    if (challenge.difficultyFilter.length === 1)
      return challenge.difficultyFilter[0];
    return "Mixed";
  }, [challenge]);

  const daysRemaining = useMemo(() => {
    if (!challenge) return 0;
    return Math.max(
      0,
      Math.ceil(
        (new Date(challenge.endDate).getTime() - Date.now()) /
          (1000 * 60 * 60 * 24),
      ),
    );
  }, [challenge]);

  const totalDays = useMemo(() => {
    if (!challenge) return 1;
    return Math.max(
      1,
      Math.ceil(
        (new Date(challenge.endDate).getTime() -
          new Date(challenge.startDate).getTime()) /
          (1000 * 60 * 60 * 24),
      ),
    );
  }, [challenge]);

  const progress = Math.min(
    100,
    Math.max(0, Math.round(((totalDays - daysRemaining) / totalDays) * 100)),
  );

  const isMember = useMemo(() => {
    if (!user) return false;
    return leaderboard.some((member) => member.userId === user.id);
  }, [leaderboard, user]);

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      </Layout>
    );
  }

  if (hasError || !challenge) {
    return (
      <Layout>
        <div className="text-center py-12">
          <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-bold">Challenge not found</h2>
          <p className="text-muted-foreground mt-2">
            We couldn't load this challenge.
          </p>
          <Button asChild className="mt-4">
            <Link to="/dashboard">Go to Dashboard</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <Button variant="ghost" size="sm" asChild className="gap-2">
          <Link to="/dashboard">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>

        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-3xl font-bold">{challenge.name}</h1>
              <Badge variant="outline">{difficultyDisplay}</Badge>
              {challenge.status && (
                <Badge variant="outline">{challenge.status}</Badge>
              )}
            </div>

            <p className="text-muted-foreground">
              {challenge.description || "No description provided."}
            </p>

            <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>
                  {new Date(challenge.startDate).toLocaleDateString()} -{" "}
                  {new Date(challenge.endDate).toLocaleDateString()}
                </span>
              </div>

              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{daysRemaining} days left</span>
              </div>
            </div>
          </div>

          <div className="flex gap-2 flex-wrap">
            {challenge.status === "PENDING" &&
              challenge.ownerId === user?.id && (
                <Button
                  className="gap-2"
                  onClick={handleActivateChallenge}
                  disabled={isActivating}
                >
                  {isActivating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <PlayCircle className="h-4 w-4" />
                  )}
                  Activate Challenge
                </Button>
              )}

            {challenge.visibility === "PRIVATE" &&
              challenge.ownerId === user?.id && (
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => setIsInviteDialogOpen(true)}
                >
                  <UserPlus className="h-4 w-4" />
                  Invite Users
                </Button>
              )}

            {!isMember && challenge.visibility !== "PRIVATE" && (
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={handleJoinChallenge}
                disabled={isJoining}
              >
                {isJoining ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Users className="h-4 w-4" />
                )}
                Join Challenge
              </Button>
            )}
          </div>
        </div>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Challenge Progress</span>
              <span className="text-sm text-muted-foreground">
                {Math.max(0, totalDays - daysRemaining)} of {totalDays} days
              </span>
            </div>
            <Progress value={progress} className="h-3" />
          </CardContent>
        </Card>

        <Tabs defaultValue="members">
          <TabsList>
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="progress">Progress</TabsTrigger>
          </TabsList>

          <TabsContent value="members">
            <Card>
              <CardHeader>
                <CardTitle>Leaderboard</CardTitle>
              </CardHeader>
              <CardContent>
                {leaderboard.length > 0 ? (
                  leaderboard.map((member, index) => (
                    <div
                      key={member.userId || `member-${index}`}
                      className="flex justify-between p-3 border rounded-lg mb-2"
                    >
                      <span>#{index + 1}</span>
                      <span>{member.userName}</span>
                      <span>${member.penaltyAmount || 0}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground">No members yet.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="progress">
            <ProgressChart data={chartData} title="Team Progress" />
          </TabsContent>
        </Tabs>
      </div>

      <InviteUserDialog
        open={
          challenge.visibility === "PRIVATE" &&
          challenge.ownerId === user?.id &&
          isInviteDialogOpen
        }
        onOpenChange={setIsInviteDialogOpen}
        challengeId={challenge.id}
        challengeName={challenge.name}
        existingMemberIds={leaderboard.map((member) => member.userId)}
      />
    </Layout>
  );
};

export default ChallengePage;
