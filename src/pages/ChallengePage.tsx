import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  Target,
  DollarSign,
  Users,
  Clock,
  Loader2,
  PlayCircle,
  UserPlus,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Layout from "@/components/layout/Layout";
import MembersList from "@/components/challenge/MembersList";
import InviteUserDialog from "@/components/challenge/InviteUserDialog";
import ProgressChart from "@/components/dashboard/ProgressChart";
import { cn } from "@/lib/utils";
import { challengeApi, dashboardApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Challenge } from "@/types";

const difficultyColors = {
  easy: "bg-success/10 text-success border-success/20",
  medium: "bg-warning/10 text-warning border-warning/20",
  hard: "bg-destructive/10 text-destructive border-destructive/20",
  any: "bg-primary/10 text-primary border-primary/20",
};

const ChallengePage: React.FC = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const { user } = useAuth();

  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);
  const [isActivating, setIsActivating] = useState(false);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);

  useEffect(() => {
    if (id) loadChallengeData();
  }, [id]);

  const loadChallengeData = async () => {
    setIsLoading(true);
    try {
      const challengeResponse = await challengeApi.getById(id!);
      const leaderboardResponse = await dashboardApi.getChallengeLeaderboard(id!);
      const progressResponse = await dashboardApi.getChallengeProgress(id!);

      if (challengeResponse.success && challengeResponse.data) {
        setChallenge(challengeResponse.data);
      }

      if (leaderboardResponse.success && leaderboardResponse.data) {
        setLeaderboard(leaderboardResponse.data);
      }

      if (progressResponse.success && progressResponse.data) {
        setChartData(progressResponse.data);
      }
    } catch (error: any) {
      console.error("Failed to load challenge:", error);
      toast({
        title: "Failed to load challenge",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

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
        loadChallengeData();
      } else {
        throw new Error(response.message);
      }
    } catch (error: any) {
      toast({
        title: "Failed to join challenge",
        description:
          error.response?.data?.message || error.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsJoining(false);
    }
  };

  const handleActivateChallenge = async () => {
    setIsActivating(true);
    try {
      const response = await challengeApi.updateStatus(id!, "ACTIVE");
      if (response.success) {
        toast({
          title: "Challenge activated!",
          description: "Your challenge is now active.",
        });
        loadChallengeData();
      }
    } catch {
      toast({
        title: "Failed to activate challenge",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsActivating(false);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center min-h-[60vh] items-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!challenge) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold">Challenge not found</h2>
        </div>
      </Layout>
    );
  }

  const daysRemaining = Math.max(0, Math.ceil(
    (new Date(challenge.endDate).getTime() - new Date().getTime()) /
    (1000 * 60 * 60 * 24)
  ));

  const totalDays = Math.max(1, Math.ceil(
    (new Date(challenge.endDate).getTime() -
      new Date(challenge.startDate).getTime()) /
    (1000 * 60 * 60 * 24)
  ));

  const progress = Math.min(100, Math.max(0, Math.round(((totalDays - daysRemaining) / totalDays) * 100)));

  const isMember = leaderboard.some(
    (member) => member.userId === user?.id
  );

  const difficultyDisplay =
    challenge.difficultyFilter?.length > 0
      ? challenge.difficultyFilter.join(", ")
      : "Any";

  return (
    <Layout>
      <div className="space-y-6">
        <Button variant="ghost" size="sm" asChild className="gap-2">
          <Link to="/">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>

        <div className="flex justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-bold">{challenge.name}</h1>
            <p className="text-muted-foreground">{challenge.description}</p>
          </div>

          <div className="flex gap-2 items-center">
            {challenge.status === "PENDING" &&
              challenge.ownerId === user?.id && (
                <Button
                  onClick={handleActivateChallenge}
                  disabled={isActivating}
                  className="gap-2 gradient-primary"
                >
                  {isActivating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <PlayCircle className="h-4 w-4" />
                  )}
                  Activate
                </Button>
              )}
            {challenge.visibility === "PRIVATE" && challenge.ownerId === user?.id && (
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

            {!isMember && challenge.visibility !== "PRIVATE" ? (
              <Button
                variant="outline"
                size="sm"
                onClick={handleJoinChallenge}
                disabled={isJoining}
                className="gap-2"
              >
                {isJoining ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Users className="h-4 w-4" />
                )}
                Join Challenge
              </Button>
            ) : (
              <Badge
                variant="outline"
                className="bg-success/10 text-success"
              >
                Already Joined
              </Badge>
            )}
          </div>
        </div>

        {/* Progress */}
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
                {leaderboard.map((m, i) => (
                  <div key={m.userId} className="border p-2 rounded mb-2">
                    #{i + 1} {m.userName || m.username}
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="progress">
            <ProgressChart data={chartData} title="Team Progress" />
          </TabsContent>
        </Tabs>
      </div>

      {/* Invite Users Dialog — open prop guards access; always mounted to avoid async teardown issues */}
      <InviteUserDialog
        open={
          challenge.visibility === "PRIVATE" &&
          challenge.ownerId === user?.id &&
          isInviteDialogOpen
        }
        onOpenChange={setIsInviteDialogOpen}
        challengeId={challenge.id}
        challengeName={challenge.name}
        existingMemberIds={leaderboard.map((m) => m.userId || m.id)}
      />
    </Layout>
  );
};

export default ChallengePage;
