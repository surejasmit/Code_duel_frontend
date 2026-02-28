/**
 * Streak Engine - Date-based consistency tracking system
 * Handles streak calculation, activity logging, and persistence
 */

export interface ActivityLog {
  dates: string[]; // Array of dates in YYYY-MM-DD format
  currentStreak: number;
  longestStreak: number;
  lastUpdated: string;
}

/**
 * Normalizes a date to YYYY-MM-DD format in local timezone
 * Strips time portion to ensure consistent date comparison
 */
export function normalizeDate(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Checks if two date strings represent the same calendar day
 */
export function isSameDay(date1: string, date2: string): boolean {
  return date1 === date2;
}

/**
 * Calculates the difference in days between two date strings
 * Returns positive number if date2 is after date1
 */
export function getDateDifference(date1: string, date2: string): number {
  const d1 = new Date(date1 + 'T00:00:00');
  const d2 = new Date(date2 + 'T00:00:00');
  const diffTime = d2.getTime() - d1.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

/**
 * Calculates the current streak from an array of activity dates
 * Streak continues if last activity was today or yesterday
 */
export function calculateCurrentStreak(dates: string[]): number {
  if (dates.length === 0) return 0;

  const today = normalizeDate();
  const sortedDates = [...dates].sort((a, b) => b.localeCompare(a)); // Sort descending
  
  let streak = 0;
  let expectedDate = today;
  
  // Check if last activity was today or yesterday
  const lastActivity = sortedDates[0];
  const daysSinceLastActivity = getDateDifference(lastActivity, today);
  
  // If more than 1 day has passed, streak is broken
  if (daysSinceLastActivity > 1) {
    return 0;
  }
  
  // If last activity was yesterday, start counting from yesterday
  if (daysSinceLastActivity === 1) {
    expectedDate = lastActivity;
  }
  
  // Count consecutive days
  for (const date of sortedDates) {
    if (isSameDay(date, expectedDate)) {
      streak++;
      // Move expected date back by one day
      const prevDate = new Date(expectedDate + 'T00:00:00');
      prevDate.setDate(prevDate.getDate() - 1);
      expectedDate = normalizeDate(prevDate);
    } else if (getDateDifference(date, expectedDate) < 0) {
      // Date is earlier than expected, continue checking
      continue;
    } else {
      // Gap found, stop counting
      break;
    }
  }
  
  return streak;
}

/**
 * Calculates the longest streak from an array of activity dates
 */
export function calculateLongestStreak(dates: string[]): number {
  if (dates.length === 0) return 0;
  if (dates.length === 1) return 1;

  const sortedDates = [...dates].sort((a, b) => a.localeCompare(b)); // Sort ascending
  
  let longestStreak = 1;
  let currentStreak = 1;
  
  for (let i = 1; i < sortedDates.length; i++) {
    const diff = getDateDifference(sortedDates[i - 1], sortedDates[i]);
    
    if (diff === 1) {
      // Consecutive day
      currentStreak++;
      longestStreak = Math.max(longestStreak, currentStreak);
    } else if (diff === 0) {
      // Same day (duplicate), skip
      continue;
    } else {
      // Gap found, reset current streak
      currentStreak = 1;
    }
  }
  
  return longestStreak;
}

/**
 * Adds a new activity date to the log, preventing duplicates
 * Returns updated dates array
 */
export function addActivity(dates: string[], date: Date = new Date()): string[] {
  const normalizedDate = normalizeDate(date);
  
  // Prevent duplicate entries for the same day
  if (dates.includes(normalizedDate)) {
    return dates;
  }
  
  return [...dates, normalizedDate];
}

/**
 * Removes duplicate dates and sorts chronologically
 */
export function sanitizeDates(dates: string[]): string[] {
  const uniqueDates = [...new Set(dates)];
  return uniqueDates.sort((a, b) => a.localeCompare(b));
}

/**
 * Validates if a date string is in correct format and valid
 */
export function isValidDateString(dateStr: string): boolean {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateStr)) return false;
  
  const date = new Date(dateStr + 'T00:00:00');
  return date instanceof Date && !isNaN(date.getTime());
}

/**
 * Gets the count of missed days between last activity and today
 */
export function getMissedDays(dates: string[]): number {
  if (dates.length === 0) return 0;
  
  const today = normalizeDate();
  const sortedDates = [...dates].sort((a, b) => b.localeCompare(a));
  const lastActivity = sortedDates[0];
  
  const daysSince = getDateDifference(lastActivity, today);
  
  // If last activity was today or yesterday, no days are missed
  if (daysSince <= 1) return 0;
  
  // Otherwise, return days missed (excluding today)
  return daysSince - 1;
}

/**
 * Checks if user has logged activity today
 */
export function hasActivityToday(dates: string[]): boolean {
  const today = normalizeDate();
  return dates.includes(today);
}

/**
 * Gets activity log statistics
 */
export function getActivityStats(dates: string[]) {
  const sanitized = sanitizeDates(dates);
  const currentStreak = calculateCurrentStreak(sanitized);
  const longestStreak = calculateLongestStreak(sanitized);
  const missedDays = getMissedDays(sanitized);
  const activeToday = hasActivityToday(sanitized);
  const totalActiveDays = sanitized.length;
  
  return {
    currentStreak,
    longestStreak,
    missedDays,
    activeToday,
    totalActiveDays,
    dates: sanitized
  };
}

// LocalStorage key constant
export const STORAGE_KEY = 'activity_streak_log';

/**
 * Loads activity log from localStorage
 */
export function loadActivityLog(): ActivityLog {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return {
        dates: [],
        currentStreak: 0,
        longestStreak: 0,
        lastUpdated: normalizeDate()
      };
    }
    
    const parsed = JSON.parse(stored);
    
    // Validate and sanitize loaded data
    const dates = Array.isArray(parsed?.dates) 
      ? sanitizeDates(parsed.dates.filter(isValidDateString))
      : [];
    
    return {
      dates,
      currentStreak: calculateCurrentStreak(dates),
      longestStreak: calculateLongestStreak(dates),
      lastUpdated: normalizeDate()
    };
  } catch (error) {
    console.error('Error loading activity log:', error);
    return {
      dates: [],
      currentStreak: 0,
      longestStreak: 0,
      lastUpdated: normalizeDate()
    };
  }
}

/**
 * Saves activity log to localStorage
 */
export function saveActivityLog(log: ActivityLog): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(log));
  } catch (error) {
    console.error('Error saving activity log:', error);
  }
}

/**
 * Records a new activity and updates the log
 * Returns updated activity log
 */
export function recordActivity(date: Date = new Date()): ActivityLog {
  const log = loadActivityLog();
  const updatedDates = addActivity(log.dates, date);
  
  // Only update if a new date was added
  if (updatedDates.length === log.dates.length) {
    return log; // No change, duplicate entry prevented
  }
  
  const sanitized = sanitizeDates(updatedDates);
  const updatedLog: ActivityLog = {
    dates: sanitized,
    currentStreak: calculateCurrentStreak(sanitized),
    longestStreak: calculateLongestStreak(sanitized),
    lastUpdated: normalizeDate()
  };
  
  saveActivityLog(updatedLog);
  return updatedLog;
}

/**
 * Clears all activity data and resets streaks
 */
export function resetActivityLog(): ActivityLog {
  const emptyLog: ActivityLog = {
    dates: [],
    currentStreak: 0,
    longestStreak: 0,
    lastUpdated: normalizeDate()
  };
  
  saveActivityLog(emptyLog);
  return emptyLog;
}

/**
 * Recalculates streaks from existing data
 * Useful after manual data modifications
 */
export function recalculateStreaks(): ActivityLog {
  const log = loadActivityLog();
  const sanitized = sanitizeDates(log.dates);
  
  const updatedLog: ActivityLog = {
    dates: sanitized,
    currentStreak: calculateCurrentStreak(sanitized),
    longestStreak: calculateLongestStreak(sanitized),
    lastUpdated: normalizeDate()
  };
  
  saveActivityLog(updatedLog);
  return updatedLog;
}
