import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Achievement, AchievementCategory } from "@/types";
import AchievementCard from "./AchievementCard";
import { Award, Flame, Code, Trophy, Target, Users, Zap } from "lucide-react";

interface BadgeWallProps {
    achievements: Achievement[];
    title?: string;
}

const categoryConfig: Record<
    AchievementCategory,
    { label: string; icon: React.ElementType }
> = {
    streak: { label: "Streak", icon: Flame },
    problem_solving: { label: "Problems", icon: Code },
    challenge: { label: "Challenges", icon: Trophy },
    difficulty: { label: "Difficulty", icon: Target },
    social: { label: "Social", icon: Users },
    special: { label: "Special", icon: Zap },
};

const BadgeWall: React.FC<BadgeWallProps> = ({
    achievements,
    title = "Achievement Wall",
}) => {
    const [selectedCategory, setSelectedCategory] = useState<
        AchievementCategory | "all"
    >("all");

    const unlockedCount = achievements.filter((a) => a.unlockedAt).length;
    const totalCount = achievements.length;

    const filteredAchievements =
        selectedCategory === "all"
            ? achievements
            : achievements.filter((a) => a.category === selectedCategory);

    const sortedAchievements = [...filteredAchievements].sort((a, b) => {
        // Unlocked achievements first
        if (a.unlockedAt && !b.unlockedAt) return -1;
        if (!a.unlockedAt && b.unlockedAt) return 1;
        // Then by progress percentage
        const aProgress = (a.progress || 0) / a.requirement;
        const bProgress = (b.progress || 0) / b.requirement;
        return bProgress - aProgress;
    });

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <Award className="h-5 w-5" />
                        {title}
                    </CardTitle>
                    <Badge variant="secondary">
                        {unlockedCount} / {totalCount} Unlocked
                    </Badge>
                </div>
            </CardHeader>
            <CardContent>
                <Tabs
                    value={selectedCategory}
                    onValueChange={(v) =>
                        setSelectedCategory(v as AchievementCategory | "all")
                    }
                    className="w-full"
                >
                    <TabsList className="w-full flex flex-wrap h-auto gap-1 mb-4">
                        <TabsTrigger value="all" className="flex-1 min-w-[80px]">
                            All
                        </TabsTrigger>
                        {(
                            Object.entries(categoryConfig) as [
                                AchievementCategory,
                                { label: string; icon: React.ElementType }
                            ][]
                        ).map(([category, config]) => {
                            const Icon = config.icon;
                            const count = achievements.filter(
                                (a) => a.category === category && a.unlockedAt
                            ).length;
                            const total = achievements.filter(
                                (a) => a.category === category
                            ).length;
                            return (
                                <TabsTrigger
                                    key={category}
                                    value={category}
                                    className="flex-1 min-w-[80px] gap-1"
                                >
                                    <Icon className="h-3 w-3" />
                                    <span className="hidden sm:inline">{config.label}</span>
                                    <span className="text-xs text-muted-foreground">
                                        ({count}/{total})
                                    </span>
                                </TabsTrigger>
                            );
                        })}
                    </TabsList>

                    <TabsContent value={selectedCategory} className="mt-0">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {sortedAchievements.map((achievement) => (
                                <AchievementCard key={achievement.id} achievement={achievement} />
                            ))}
                        </div>
                        {sortedAchievements.length === 0 && (
                            <div className="text-center py-8 text-muted-foreground">
                                No achievements in this category yet.
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
};

export default BadgeWall;
