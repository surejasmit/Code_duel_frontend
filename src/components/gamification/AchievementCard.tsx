import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Achievement } from "@/types";
import { cn } from "@/lib/utils";
import { Lock, CheckCircle } from "lucide-react";

interface AchievementCardProps {
    achievement: Achievement;
    compact?: boolean;
}

const tierStyles = {
    bronze: {
        border: "border-amber-500/50",
        bg: "bg-amber-50 dark:bg-amber-950/20",
        badge: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
    },
    silver: {
        border: "border-gray-400/50",
        bg: "bg-gray-50 dark:bg-gray-800/20",
        badge: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
    },
    gold: {
        border: "border-yellow-500/50",
        bg: "bg-yellow-50 dark:bg-yellow-950/20",
        badge: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    },
    platinum: {
        border: "border-cyan-500/50",
        bg: "bg-cyan-50 dark:bg-cyan-950/20",
        badge: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200",
    },
    diamond: {
        border: "border-blue-400/50",
        bg: "bg-blue-50 dark:bg-blue-950/20",
        badge: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    },
};

const AchievementCard: React.FC<AchievementCardProps> = ({
    achievement,
    compact = false,
}) => {
    const isUnlocked = !!achievement.unlockedAt;
    const progress = achievement.progress || 0;
    const progressPercentage = Math.min(100, (progress / achievement.requirement) * 100);
    const styles = tierStyles[achievement.tier];

    if (compact) {
        return (
            <div
                className={cn(
                    "flex items-center gap-3 p-3 rounded-lg border transition-all",
                    isUnlocked
                        ? cn(styles.border, styles.bg)
                        : "border-muted bg-muted/30 opacity-60"
                )}
            >
                <span className="text-2xl">{achievement.icon}</span>
                <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{achievement.name}</p>
                    <p className="text-xs text-muted-foreground truncate">
                        {isUnlocked ? "Unlocked" : `${progress}/${achievement.requirement}`}
                    </p>
                </div>
                {isUnlocked ? (
                    <CheckCircle className="h-4 w-4 text-success shrink-0" />
                ) : (
                    <Lock className="h-4 w-4 text-muted-foreground shrink-0" />
                )}
            </div>
        );
    }

    return (
        <Card
            className={cn(
                "overflow-hidden transition-all hover:shadow-md",
                isUnlocked
                    ? cn("border-2", styles.border)
                    : "border-muted opacity-70 grayscale-[50%]"
            )}
        >
            <CardContent className={cn("p-4", isUnlocked && styles.bg)}>
                <div className="flex items-start gap-4">
                    <div
                        className={cn(
                            "flex h-12 w-12 items-center justify-center rounded-lg text-2xl",
                            isUnlocked ? "bg-white/80 dark:bg-black/20 shadow-sm" : "bg-muted"
                        )}
                    >
                        {achievement.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold truncate">{achievement.name}</h4>
                            <Badge
                                variant="outline"
                                className={cn("text-xs capitalize shrink-0", styles.badge)}
                            >
                                {achievement.tier}
                            </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                            {achievement.description}
                        </p>
                        {!isUnlocked && (
                            <div className="space-y-1">
                                <Progress value={progressPercentage} className="h-2" />
                                <p className="text-xs text-muted-foreground">
                                    {progress} / {achievement.requirement} ({Math.round(progressPercentage)}%)
                                </p>
                            </div>
                        )}
                        {isUnlocked && achievement.unlockedAt && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <CheckCircle className="h-3 w-3 text-success" />
                                Unlocked on {new Date(achievement.unlockedAt).toLocaleDateString()}
                            </p>
                        )}
                    </div>
                    <div className="text-right shrink-0">
                        <span className="text-sm font-bold text-primary">
                            +{achievement.points}
                        </span>
                        <p className="text-xs text-muted-foreground">pts</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default AchievementCard;
