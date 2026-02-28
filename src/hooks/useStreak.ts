/**
 * useStreak Hook - React integration for streak tracking system
 * Provides real-time streak data and activity logging functions
 */

import { useState, useEffect, useCallback } from 'react';
import {
  ActivityLog,
  loadActivityLog,
  recordActivity,
  resetActivityLog,
  recalculateStreaks,
  getActivityStats,
  hasActivityToday,
  normalizeDate
} from '../utils/streakEngine';

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  totalActiveDays: number;
  activeToday: boolean;
  missedDays: number;
  dates: string[];
  lastUpdated: string;
  isLoading: boolean;
}

export interface UseStreakReturn {
  streakData: StreakData;
  logActivity: (date?: Date) => boolean;
  resetStreak: () => void;
  refreshStreak: () => void;
  hasLoggedToday: () => boolean;
}

/**
 * Custom hook for managing user activity streaks
 */
export function useStreak(): UseStreakReturn {
  const [streakData, setStreakData] = useState<StreakData>({
    currentStreak: 0,
    longestStreak: 0,
    totalActiveDays: 0,
    activeToday: false,
    missedDays: 0,
    dates: [],
    lastUpdated: normalizeDate(),
    isLoading: true
  });

  /**
   * Converts ActivityLog to StreakData format
   */
  const transformActivityLog = useCallback((log: ActivityLog): StreakData => {
    const stats = getActivityStats(log.dates);

    return {
      currentStreak: stats.currentStreak,
      longestStreak: stats.longestStreak,
      totalActiveDays: stats.totalActiveDays,
      activeToday: stats.activeToday,
      missedDays: stats.missedDays,
      dates: stats.dates,
      lastUpdated: log.lastUpdated,
      isLoading: false
    };
  }, []);

  /**
   * Refreshes streak data by recalculating from stored dates
   * Useful after manual localStorage modifications or to check for day changes
   */
  const refreshStreak = useCallback(() => {
    try {
      const recalculatedLog = recalculateStreaks();
      setStreakData(transformActivityLog(recalculatedLog));
    } catch (error) {
      console.error('Failed to refresh streak:', error);
    }
  }, [transformActivityLog]);

  /**
   * Resets all streak data and clears activity history
   */
  const resetStreak = useCallback(() => {
    try {
      const emptyLog = resetActivityLog();
      setStreakData(transformActivityLog(emptyLog));
    } catch (error) {
      console.error('Failed to reset streak:', error);
    }
  }, [transformActivityLog]);

  /**
   * Checks if user has logged activity today
   */
  const hasLoggedToday = useCallback((): boolean => {
    return hasActivityToday(streakData.dates);
  }, [streakData.dates]);

  /**
   * Loads streak data from localStorage on mount
   */
  useEffect(() => {
    const loadData = () => {
      try {
        const log = loadActivityLog();
        setStreakData(transformActivityLog(log));
      } catch (error) {
        console.error('Failed to load streak data:', error);
        setStreakData(prev => ({ ...prev, isLoading: false }));
      }
    };

    loadData();
  }, [transformActivityLog]);

  /**
   * Re-checks streak validity at midnight
   */
  useEffect(() => {
    const checkMidnight = () => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);

      const msUntilMidnight = tomorrow.getTime() - now.getTime();

      return setTimeout(() => {
        refreshStreak();
        const dailyInterval = setInterval(() => {
          refreshStreak();
        }, 24 * 60 * 60 * 1000);
        return () => clearInterval(dailyInterval);
      }, msUntilMidnight);
    };

    const midnightTimeout = checkMidnight();
    return () => clearTimeout(midnightTimeout);
  }, [refreshStreak]);

  /**
   * Logs activity for the specified date
   */
  const logActivity = useCallback((date?: Date): boolean => {
    try {
      const beforeCount = streakData.dates.length;
      const updatedLog = recordActivity(date);
      const afterCount = updatedLog.dates.length;

      setStreakData(transformActivityLog(updatedLog));
      return afterCount > beforeCount;
    } catch (error) {
      console.error('Failed to log activity:', error);
      return false;
    }
  }, [streakData.dates.length, transformActivityLog]);

  return {
    streakData,
    logActivity,
    resetStreak,
    refreshStreak,
    hasLoggedToday
  };
}

export default useStreak;
