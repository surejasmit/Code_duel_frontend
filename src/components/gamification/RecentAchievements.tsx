import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Achievement } from "@/types";
import AchievementCard from "./AchievementCard";
import { Award, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface RecentAchievementsProps {
    achievements: Achievement[];
    maxItems?: number;
    title?: string;
    showViewAll?: boolean;
}

const RecentAchievements: React.FC<RecentAchievementsProps> = ({
    achievements,
    maxItems = 3,
    title = "Recent Achievements",
    showViewAll = true,
}) => {
    const recentAchievements = achievements
        .filter((a) => a.unlockedAt)
        .sort(
            (a, b) =>
                new Date(b.unlockedAt!).getTime() - new Date(a.unlockedAt!).getTime()
        )
        .slice(0, maxItems);

    if (recentAchievements.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <Award className="h-5 w-5" />
                        {title}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-6 text-muted-foreground">
                        <Award className="h-10 w-10 mx-auto mb-2 opacity-50" />
                        <p>No achievements unlocked yet.</p>
                        <p className="text-sm">Keep coding to earn your first badge!</p>
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
                        <Award className="h-5 w-5" />
                        {title}
                    </CardTitle>
                    {showViewAll && (
                        <Button variant="ghost" size="sm" asChild>
                            <Link to="/profile?tab=achievements" className="gap-1">
                                View all
                                <ArrowRight className="h-3 w-3" />
                            </Link>
                        </Button>
                    )}
                </div>
            </CardHeader>
            <CardContent className="space-y-2">
                {recentAchievements.map((achievement) => (
                    <AchievementCard
                        key={achievement.id}
                        achievement={achievement}
                        compact
                    />
                ))}
            </CardContent>
        </Card>
    );
};

export default RecentAchievements;
