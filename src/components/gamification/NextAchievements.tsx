import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Achievement } from "@/types";
import { Target, ArrowRight, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface NextAchievementsProps {
    achievements: Achievement[];
    maxItems?: number;
    title?: string;
}

const tierColors = {
    bronze: "text-amber-700",
    silver: "text-gray-500",
    gold: "text-yellow-500",
    platinum: "text-cyan-500",
    diamond: "text-blue-400",
};

const NextAchievements: React.FC<NextAchievementsProps> = ({
    achievements,
    maxItems = 3,
    title = "Next Achievements",
}) => {
    // Get locked achievements sorted by how close they are to completion
    const nextAchievements = achievements
        .filter((a) => !a.unlockedAt)
        .sort((a, b) => {
            const aProgress = (a.progress || 0) / a.requirement;
            const bProgress = (b.progress || 0) / b.requirement;
            return bProgress - aProgress;
        })
        .slice(0, maxItems);

    if (nextAchievements.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <Target className="h-5 w-5" />
                        {title}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-6 text-muted-foreground">
                        <Target className="h-10 w-10 mx-auto mb-2 opacity-50" />
                        <p>All achievements unlocked!</p>
                        <p className="text-sm">You've collected all badges. Amazing!</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <Target className="h-5 w-5" />
                        {title}
                    </CardTitle>
                    <Button variant="ghost" size="sm" asChild>
                        <Link to="/profile?tab=achievements" className="gap-1">
                            View all
                            <ArrowRight className="h-3 w-3" />
                        </Link>
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="space-y-3">
                {nextAchievements.map((achievement) => {
                    const progress = achievement.progress || 0;
                    const progressPercentage = Math.min(
                        100,
                        (progress / achievement.requirement) * 100
                    );

                    return (
                        <div
                            key={achievement.id}
                            className="flex items-start gap-3 p-3 rounded-lg border bg-muted/30"
                        >
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-xl relative">
                                {achievement.icon}
                                <Lock className="h-3 w-3 absolute -bottom-0.5 -right-0.5 text-muted-foreground" />
                            </div>
                            <div className="flex-1 min-w-0 space-y-1.5">
                                <div className="flex items-center justify-between gap-2">
                                    <p className="font-medium text-sm truncate">
                                        {achievement.name}
                                    </p>
                                    <span
                                        className={cn(
                                            "text-xs font-medium capitalize",
                                            tierColors[achievement.tier]
                                        )}
                                    >
                                        +{achievement.points}pts
                                    </span>
                                </div>
                                <Progress value={progressPercentage} className="h-1.5" />
                                <p className="text-xs text-muted-foreground">
                                    {progress} / {achievement.requirement} (
                                    {Math.round(progressPercentage)}%)
                                </p>
                            </div>
                        </div>
                    );
                })}
            </CardContent>
        </Card>
    );
};

export default NextAchievements;
