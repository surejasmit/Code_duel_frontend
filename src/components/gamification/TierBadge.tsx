import React from "react";
import { cn } from "@/lib/utils";
import { UserTier } from "@/types";

interface TierBadgeProps {
    tier: UserTier;
    size?: "sm" | "md" | "lg" | "xl";
    showLabel?: boolean;
    animated?: boolean;
    className?: string;
}

const tierConfig = {
    bronze: {
        icon: "🥉",
        label: "Bronze",
        gradient: "from-amber-600 to-amber-800",
        glow: "shadow-amber-500/30",
        ring: "ring-amber-500",
        text: "text-amber-700 dark:text-amber-400",
    },
    silver: {
        icon: "🥈",
        label: "Silver",
        gradient: "from-gray-400 to-gray-600",
        glow: "shadow-gray-400/30",
        ring: "ring-gray-400",
        text: "text-gray-600 dark:text-gray-300",
    },
    gold: {
        icon: "🥇",
        label: "Gold",
        gradient: "from-yellow-400 to-yellow-600",
        glow: "shadow-yellow-500/40",
        ring: "ring-yellow-500",
        text: "text-yellow-600 dark:text-yellow-400",
    },
    platinum: {
        icon: "💎",
        label: "Platinum",
        gradient: "from-cyan-400 to-cyan-600",
        glow: "shadow-cyan-500/40",
        ring: "ring-cyan-500",
        text: "text-cyan-600 dark:text-cyan-400",
    },
    diamond: {
        icon: "👑",
        label: "Diamond",
        gradient: "from-blue-400 via-purple-400 to-pink-400",
        glow: "shadow-blue-400/50",
        ring: "ring-blue-400",
        text: "text-blue-500 dark:text-blue-400",
    },
};

const sizeConfig = {
    sm: {
        badge: "h-6 w-6 text-sm",
        container: "gap-1",
        label: "text-xs",
    },
    md: {
        badge: "h-8 w-8 text-lg",
        container: "gap-1.5",
        label: "text-sm",
    },
    lg: {
        badge: "h-12 w-12 text-2xl",
        container: "gap-2",
        label: "text-base",
    },
    xl: {
        badge: "h-16 w-16 text-3xl",
        container: "gap-3",
        label: "text-lg",
    },
};

const TierBadge: React.FC<TierBadgeProps> = ({
    tier,
    size = "md",
    showLabel = false,
    animated = false,
    className,
}) => {
    const config = tierConfig[tier];
    const sizes = sizeConfig[size];

    return (
        <div
            className={cn(
                "inline-flex items-center",
                sizes.container,
                className
            )}
        >
            <div
                className={cn(
                    "relative flex items-center justify-center rounded-full",
                    `bg-gradient-to-br ${config.gradient}`,
                    sizes.badge,
                    animated && "animate-pulse",
                    `shadow-lg ${config.glow}`,
                    `ring-2 ${config.ring} ring-offset-2 ring-offset-background`
                )}
            >
                <span className={cn(animated && "animate-bounce")}>{config.icon}</span>
                {tier === "diamond" && animated && (
                    <div className="absolute inset-0 rounded-full animate-ping bg-gradient-to-br from-blue-400/20 via-purple-400/20 to-pink-400/20" />
                )}
            </div>
            {showLabel && (
                <span className={cn("font-semibold", sizes.label, config.text)}>
                    {config.label}
                </span>
            )}
        </div>
    );
};

export default TierBadge;
