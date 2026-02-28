import React, { useEffect, useState, useCallback } from "react";
import { Achievement } from "@/types";
import { cn } from "@/lib/utils";
import { X, PartyPopper } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AchievementNotificationProps {
    achievement: Achievement;
    onClose: () => void;
    autoHide?: boolean;
    autoHideDelay?: number;
}

const tierGradients = {
    bronze: "from-amber-500 to-amber-700",
    silver: "from-gray-400 to-gray-600",
    gold: "from-yellow-400 to-yellow-600",
    platinum: "from-cyan-400 to-cyan-600",
    diamond: "from-blue-400 via-purple-500 to-pink-500",
};

const AchievementNotification: React.FC<AchievementNotificationProps> = ({
    achievement,
    onClose,
    autoHide = true,
    autoHideDelay = 5000,
}) => {
    const [isVisible, setIsVisible] = useState(false);
    const [isExiting, setIsExiting] = useState(false);

    const handleClose = useCallback(() => {
        setIsExiting(true);
        setTimeout(() => {
            setIsVisible(false);
            onClose();
        }, 300);
    }, [onClose]);

    useEffect(() => {
        // Trigger entrance animation
        const showTimer = setTimeout(() => setIsVisible(true), 100);

        // Auto-hide functionality
        let hideTimer: ReturnType<typeof setTimeout>;
        if (autoHide) {
            hideTimer = setTimeout(() => {
                handleClose();
            }, autoHideDelay);
        }

        return () => {
            clearTimeout(showTimer);
            if (hideTimer) clearTimeout(hideTimer);
        };
    }, [autoHide, autoHideDelay, handleClose]);

    return (
        <div
            className={cn(
                "fixed top-4 right-4 z-50 w-80 transform transition-all duration-300 ease-out",
                isVisible && !isExiting
                    ? "translate-x-0 opacity-100"
                    : "translate-x-full opacity-0"
            )}
        >
            <div
                className={cn(
                    "relative overflow-hidden rounded-lg shadow-2xl",
                    `bg-gradient-to-br ${tierGradients[achievement.tier]}`
                )}
            >
                {/* Confetti effect for diamond tier */}
                {achievement.tier === "diamond" && (
                    <div className="absolute inset-0 overflow-hidden">
                        {[...Array(20)].map((_, i) => (
                            <div
                                key={i}
                                className="absolute animate-ping"
                                style={{
                                    left: `${Math.random() * 100}%`,
                                    top: `${Math.random() * 100}%`,
                                    animationDelay: `${Math.random() * 2}s`,
                                    animationDuration: `${1 + Math.random()}s`,
                                }}
                            >
                                ✨
                            </div>
                        ))}
                    </div>
                )}

                <div className="relative p-4">
                    {/* Close button */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 h-6 w-6 text-white/80 hover:text-white hover:bg-white/20"
                        onClick={handleClose}
                    >
                        <X className="h-4 w-4" />
                    </Button>

                    {/* Header */}
                    <div className="flex items-center gap-2 mb-3">
                        <PartyPopper className="h-5 w-5 text-white animate-bounce" />
                        <span className="text-sm font-semibold text-white/90 uppercase tracking-wide">
                            Achievement Unlocked!
                        </span>
                    </div>

                    {/* Achievement Content */}
                    <div className="flex items-center gap-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/20 text-3xl animate-pulse">
                            {achievement.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-white text-lg truncate">
                                {achievement.name}
                            </h3>
                            <p className="text-sm text-white/80 truncate">
                                {achievement.description}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs font-medium text-white/90 capitalize px-2 py-0.5 bg-white/20 rounded-full">
                                    {achievement.tier}
                                </span>
                                <span className="text-xs font-bold text-white">
                                    +{achievement.points} pts
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Progress bar animation */}
                {autoHide && (
                    <div className="h-1 bg-white/20">
                        <div
                            className="h-full bg-white/60 transition-all ease-linear"
                            style={{
                                width: isVisible && !isExiting ? "0%" : "100%",
                                transitionDuration: `${autoHideDelay}ms`,
                            }}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default AchievementNotification;
