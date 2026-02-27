import React, { useState, useEffect, useCallback, useRef } from "react";
import { CheckCircle2, XCircle, Mail, Loader2, Trophy } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { inviteApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { ChallengeInvite } from "@/types";
import { cn } from "@/lib/utils";

const InviteRequests: React.FC = () => {
  const { toast } = useToast();
  const [invites, setInvites] = useState<ChallengeInvite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [respondingId, setRespondingId] = useState<string | null>(null);
  const [respondingAction, setRespondingAction] = useState<"accepted" | "rejected" | null>(null);
  const isMountedRef = useRef(true);

  // Track mount status to avoid updating state after unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const loadInvites = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await inviteApi.getMyInvites();
      if (isMountedRef.current && response.success && response.data) {
        const pending = (response.data as ChallengeInvite[]).filter(
          (inv) => inv.status === "pending"
        );
        setInvites(pending);
      }
    } catch {
      // Silently fail — not critical for dashboard render
    } finally {
      if (isMountedRef.current) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInvites();
  }, [loadInvites]);

  const handleRespond = async (
    invite: ChallengeInvite,
    action: "accepted" | "rejected"
  ) => {
    setRespondingId(invite.id);
    setRespondingAction(action);
    try {
      const response =
        action === "accepted"
          ? await inviteApi.acceptInvite(invite.challengeId)
          : await inviteApi.rejectInvite(invite.challengeId);
      if (!isMountedRef.current) return;
      if (response.success) {
        // Remove the invite from the list regardless of action
        setInvites((prev) => prev.filter((inv) => inv.id !== invite.id));
        toast({
          title:
            action === "accepted" ? "Invite accepted!" : "Invite declined",
          description:
            action === "accepted"
              ? `You have joined "${invite.challengeName}". Visit the challenge page to get started.`
              : `You have declined the invite to "${invite.challengeName}".`,
        });
      } else {
        throw new Error(response.message || "Failed to respond to invite");
      }
    } catch (error: any) {
      if (!isMountedRef.current) return;
      toast({
        title: "Action failed",
        description:
          error.response?.data?.message || error.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      if (isMountedRef.current) {
        setRespondingId(null);
        setRespondingAction(null);
      }
    }
  };

  // Return null while loading and when there are no pending invites.
  // This prevents a visible flash of the card+spinner before we know whether
  // there are any invites to show, keeping the dashboard clean.
  if (isLoading || invites.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Challenge Invites
          </CardTitle>
          <Badge variant="secondary" className="text-sm">
            {invites.length} pending
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {invites.map((invite) => {
            const isResponding = respondingId === invite.id;

            return (
              <div
                key={invite.id}
                className={cn(
                  "flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-lg border",
                  "bg-muted/30 hover:bg-muted/50 transition-colors"
                )}
              >
                {/* Challenge Info */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <Trophy className="h-5 w-5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium truncate">{invite.challengeName}</p>
                    <p className="text-sm text-muted-foreground">
                      Invited by{" "}
                      <span className="font-medium text-foreground">
                        {invite.senderName}
                      </span>
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    size="sm"
                    className={cn(
                      "gap-1.5",
                      "bg-success/10 text-success border-success/20 hover:bg-success/20",
                      "border"
                    )}
                    variant="ghost"
                    onClick={() => handleRespond(invite, "accepted")}
                    disabled={isResponding}
                  >
                    {isResponding && respondingAction === "accepted" ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    )}
                    Accept
                  </Button>
                  <Button
                    size="sm"
                    className={cn(
                      "gap-1.5",
                      "bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/20",
                      "border"
                    )}
                    variant="ghost"
                    onClick={() => handleRespond(invite, "rejected")}
                    disabled={isResponding}
                  >
                    {isResponding && respondingAction === "rejected" ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <XCircle className="h-3.5 w-3.5" />
                    )}
                    Decline
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    asChild
                  >
                    <Link to={`/challenge/${invite.challengeId}`}>
                      View
                    </Link>
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default InviteRequests;
