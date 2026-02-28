import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { UserTierProgress } from "@/types";
import TierBadge from "./TierBadge";
import { TrendingUp, Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProgressToTierProps {
    tierProgress: UserTierProgress;
    showDetails?: boolean;
    compact?: boolean;
}

const ProgressToTier: React.FC<ProgressToTierProps> = ({
    tierProgress,
    showDetails = true,
    compact = false,
}) => {
    const {
        currentTier,
        totalPoints,
        currentTierInfo,
        nextTierInfo,
        pointsToNextTier,
        progressPercentage,
    } = tierProgress;

    if (compact) {
        return (
            <div className="flex items-center gap-3">
                <TierBadge tier={currentTier} size="sm" />
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">{totalPoints} pts</span>
                        {nextTierInfo && (
                            <span className="text-xs text-muted-foreground">
                                {pointsToNextTier} to {nextTierInfo.name}
                            </span>
                        )}
                    </div>
                    <Progress value={progressPercentage} className="h-1.5" />
                </div>
            </div>
        );
    }

    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                    <TrendingUp className="h-5 w-5" />
                    Tier Progress
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Current Tier Display */}
                <div className="flex items-center justify-center gap-4 py-4">
                    <TierBadge tier={currentTier} size="xl" showLabel animated />
                </div>

                {/* Points Display */}
                <div className="text-center">
                    <p className="text-3xl font-bold">{totalPoints.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">Total Points</p>
                </div>

                {/* Progress Bar */}
                {nextTierInfo ? (
                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                                <TierBadge tier={currentTier} size="sm" />
                                <span className="font-medium">{currentTierInfo.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="font-medium">{nextTierInfo.name}</span>
                                <TierBadge tier={nextTierInfo.tier} size="sm" />
                            </div>
                        </div>
                        <Progress value={progressPercentage} className="h-3" />
                        <p className="text-center text-sm text-muted-foreground">
                            <span className="font-semibold text-primary">
                                {pointsToNextTier}
                            </span>{" "}
                            points to reach {nextTierInfo.name}
                        </p>
                    </div>
                ) : (
                    <div className="text-center py-4">
                        <div className="flex items-center justify-center gap-2 text-primary">
                            <Star className="h-5 w-5 fill-current" />
                            <span className="font-semibold">Maximum Tier Achieved!</span>
                            <Star className="h-5 w-5 fill-current" />
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                            You've reached the highest tier!
                        </p>
                    </div>
                )}

                {/* Point Breakdown */}
                {showDetails && (
                    <div className="pt-4 border-t space-y-2">
                        <h4 className="text-sm font-semibold">How to earn points:</h4>
                        <ul className="text-xs text-muted-foreground space-y-1">
                            <li className="flex justify-between">
                                <span>Daily target completion</span>
                                <span className="font-medium">+10 pts</span>
                            </li>
                            <li className="flex justify-between">
                                <span>Problem solved (Easy/Medium/Hard)</span>
                                <span className="font-medium">+5/10/15 pts</span>
                            </li>
                            <li className="flex justify-between">
                                <span>Weekly streak milestone</span>
                                <span className="font-medium">+50 pts</span>
                            </li>
                            <li className="flex justify-between">
                                <span>Challenge completion</span>
                                <span className="font-medium">+100 pts</span>
                            </li>
                            <li className="flex justify-between">
                                <span>Zero penalties bonus</span>
                                <span className="font-medium">+50 pts</span>
                            </li>
                        </ul>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default ProgressToTier;
