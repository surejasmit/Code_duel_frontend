import React, { useMemo, useRef, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider, // Added this
} from "@/components/ui/tooltip";
import { ActivityData } from "@/types";
import { cn } from "@/lib/utils";
import { Flame, Calendar, TrendingUp } from "lucide-react";

interface ActivityHeatmapProps {
  data: ActivityData[];
  title?: string;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const getCellStyle = (count: number): string => {
  if (count <= 0) return "cell-empty";
  if (count === 1) return "cell-1";
  if (count === 2) return "cell-2";
  if (count === 3) return "cell-3";
  return "cell-4";
};

const LEGEND_LEVELS = [
  { label: "None", style: "cell-empty" },
  { label: "Low", style: "cell-1" },
  { label: "Medium", style: "cell-2" },
  { label: "High", style: "cell-3" },
  { label: "Max", style: "cell-4" },
];

const ActivityHeatmap: React.FC<ActivityHeatmapProps> = ({
  data = [], // Default to empty array to prevent .forEach errors
  title = "Contribution Graph",
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 60);
    return () => clearTimeout(timer);
  }, []);

  // Debug: log all data on mount
  useEffect(() => {
    if (data && data.length > 0) {
      console.log("Activity heatmap loaded with", data.length, "days of data");
    }
  }, [data]);

  const formatDate = (dateStr: number | string): string => {
    if (!dateStr) return "";
    
    let date: Date;
    
    // Handle different date formats
    if (typeof dateStr === "number") {
      // Unix timestamp in seconds or milliseconds
      date = new Date(dateStr > 10000000000 ? dateStr : dateStr * 1000);
    } else if (typeof dateStr === "string") {
      // ISO string format (YYYY-MM-DD) or full ISO (2024-02-26T...)
      if (dateStr.includes("T")) {
        // Full ISO format
        date = new Date(dateStr);
      } else if (/^\d+$/.test(dateStr)) {
        // Numeric string - Unix timestamp in seconds
        const timestamp = parseInt(dateStr, 10);
        date = new Date(timestamp * 1000);
      } else if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
        // Date-only format YYYY-MM-DD - use UTC to avoid timezone issues
        date = new Date(dateStr + "T00:00:00Z");
      } else {
        // Try parsing as-is
        date = new Date(dateStr);
      }
    } else {
      return "";
    }
    
    // Check for Invalid Date
    if (isNaN(date.getTime())) {
      return "";
    }

    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const weeks = useMemo(() => {
    const result: ActivityData[][] = [];
    let current: ActivityData[] = [];

    data.forEach((day, index) => {
      // Fix: Check if day exists and has a valid date before creating a Date object
      if (index === 0 && day.date) {
        const date = new Date(day.date);
        if (!isNaN(date.getTime())) {
          const dow = date.getDay();
          for (let i = 0; i < dow; i++) {
            current.push({ date: "", count: 0 });
          }
        }
      }
      current.push(day);
      if (current.length === 7) {
        result.push(current);
        current = [];
      }
    });

    if (current.length > 0) {
      while (current.length < 7) {
        current.push({ date: "", count: 0 });
      }
      result.push(current);
    }

    return result;
  }, [data]);

  const monthLabels = useMemo(() => {
    const labels: { month: string; weekIndex: number }[] = [];
    let lastMonth = -1;

    weeks.forEach((week, wi) => {
      // Look for the first valid date in the week to determine the month
      for (const day of week) {
        if (!day.date) continue;
        const d = new Date(day.date);
        if (isNaN(d.getTime())) continue;

        const m = d.getMonth();
        if (m !== lastMonth) {
          labels.push({ month: MONTHS[m], weekIndex: wi });
          lastMonth = m;
        }
        break; 
      }
    });

    return labels;
  }, [weeks]);

  const stats = useMemo(() => {
    const activeDays = data.filter((d) => d.count > 0).length;
    const totalSubmissions = data.reduce((s, d) => s + (d.count || 0), 0);
    const maxDay = data.reduce((m, d) => Math.max(m, d.count || 0), 0);

    let streak = 0;
    let longestStreak = 0;
    data.forEach((d) => {
      if (d.count > 0) {
        streak++;
        longestStreak = Math.max(longestStreak, streak);
      } else {
        streak = 0;
      }
    });

    return { activeDays, totalSubmissions, maxDay, longestStreak };
  }, [data]);

  const CELL_SIZE = 13;
  const CELL_GAP = 3;

  return (
    <TooltipProvider> {/* Necessary for shadcn Tooltips to function */}
      <Card className="hover-lift overflow-hidden border border-border/60 bg-card/80 backdrop-blur-sm shadow-md">
        <div className="h-0.5 w-full bg-gradient-to-r from-green-500 via-emerald-400 to-teal-500 opacity-80" />

        <CardHeader className="pb-3 pt-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10">
                <Calendar className="h-4 w-4 text-emerald-500" />
              </div>
              {title}
            </CardTitle>

            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-emerald-500" />
                <span>
                  <span className="font-semibold text-foreground">{stats.activeDays}</span> active days
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Flame className="h-3.5 w-3.5 text-orange-500" />
                <span>
                  <span className="font-semibold text-foreground">{stats.longestStreak}</span> day streak
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <TrendingUp className="h-3.5 w-3.5 text-primary" />
                <span>
                  <span className="font-semibold text-foreground">{stats.totalSubmissions}</span> total
                </span>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pb-5">
          <div className="overflow-x-auto pb-1">
            <div className="min-w-[680px]">
              <div
                className="relative mb-2 ml-8 text-[11px] font-medium text-muted-foreground"
                style={{ height: 16 }}
              >
                {monthLabels.map(({ month, weekIndex }) => (
                  <span
                    key={`${month}-${weekIndex}`}
                    className="absolute"
                    style={{
                      left: weekIndex * (CELL_SIZE + CELL_GAP),
                    }}
                  >
                    {month}
                  </span>
                ))}
              </div>

              <div className="flex gap-[3px]">
                <div className="flex flex-col gap-[3px] pr-2 text-[10px] font-medium text-muted-foreground">
                  {DAY_LABELS.map((day, i) => (
                    <div
                      key={day}
                      className="flex items-center"
                      style={{ height: CELL_SIZE }}
                    >
                      {(i === 1 || i === 3 || i === 5) && (
                        <span className="leading-none">{day}</span>
                      )}
                    </div>
                  ))}
                </div>

                <div ref={containerRef} className="flex gap-[3px]">
                  {weeks.map((week, wi) => (
                    <div key={wi} className="flex flex-col gap-[3px]">
                      {week.map((day, di) => {
                        const isEmpty = !day.date;
                        const cellStyle = getCellStyle(day.count);
                        const delay = `${(wi * 7 + di) * 4}ms`;

                        const cell = (
                          <div
                            key={`${wi}-${di}`}
                            role={isEmpty ? undefined : "button"}
                            tabIndex={isEmpty ? undefined : 0}
                            style={{
                              width: CELL_SIZE,
                              height: CELL_SIZE,
                              transitionDelay: delay,
                              animationDelay: delay,
                            }}
                            className={cn(
                              "rounded-[3px]",
                              "transition-all duration-150",
                              !isEmpty && "hover:scale-[1.3] hover:z-10 relative cursor-pointer",
                              isEmpty && "opacity-0 pointer-events-none",
                              visible ? "animate-cell-in" : "opacity-0",
                              cellStyle
                            )}
                          />
                        );

                        if (isEmpty) return <div key={`${wi}-${di}`} style={{ width: CELL_SIZE, height: CELL_SIZE }} />;

                        return (
                          <Tooltip key={`${wi}-${di}`} delayDuration={80}>
                            <TooltipTrigger asChild>{cell}</TooltipTrigger>
                            <TooltipContent
                              side="top"
                              className="flex flex-col gap-0.5 px-3 py-2 text-xs shadow-lg"
                            >
                              <p className="font-semibold text-foreground">
                                {day.count > 0
                                  ? `${day.count} submission${day.count !== 1 ? "s" : ""}`
                                  : "No submissions"}
                              </p>
                              {day.date && (
                                <p className="text-muted-foreground">
                                  {formatDate(day.date) || "Date unavailable"}
                                </p>
                              )}
                            </TooltipContent>
                          </Tooltip>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 flex items-center justify-end gap-2 text-[11px] text-muted-foreground">
                <span>Less</span>
                <div className="flex items-center gap-[3px]">
                  {LEGEND_LEVELS.map((l) => (
                    <Tooltip key={l.label} delayDuration={80}>
                      <TooltipTrigger asChild>
                        <div
                          style={{ width: CELL_SIZE, height: CELL_SIZE }}
                          className={cn("rounded-[3px] cursor-default", l.style)}
                        />
                      </TooltipTrigger>
                      <TooltipContent side="top" className="text-xs">
                        {l.label}
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </div>
                <span>More</span>
              </div>
            </div>
          </div>
        </CardContent>

        <style dangerouslySetInnerHTML={{ __html: `
          .cell-empty { background-color: hsl(var(--muted)); border: 1px solid hsl(var(--border)); }
          .cell-1 { background-color: #bbf7d0; border: 1px solid #86efac; }
          .cell-2 { background-color: #4ade80; border: 1px solid #22c55e; }
          .cell-3 { background-color: #16a34a; border: 1px solid #15803d; box-shadow: 0 0 6px 0 rgba(34,197,94,0.35); }
          .cell-4 { background-color: #14532d; border: 1px solid #166534; box-shadow: 0 0 10px 0 rgba(16,185,129,0.45); }
          
          .dark .cell-1 { background-color: #166534; border-color: #15803d; }
          .dark .cell-2 { background-color: #16a34a; border-color: #22c55e; }
          .dark .cell-3 { background-color: #22c55e; border-color: #4ade80; }
          .dark .cell-4 { background-color: #4ade80; border-color: #86efac; }

          @keyframes cellFadeIn {
            from { opacity: 0; transform: scale(0.5); }
            to { opacity: 1; transform: scale(1); }
          }
          .animate-cell-in { animation: cellFadeIn 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) both; }
        `}} />
      </Card>
    </TooltipProvider>
  );
};

export default ActivityHeatmap;