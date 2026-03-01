/**
 * Leaderboard Engine Test Examples
 * 
 * This file contains test scenarios demonstrating the leaderboard ranking system.
 * These examples validate the core functionality including:
 * - Unique ranks
 * - Tie-breaking on primary metric (current streak)
 * - Tie-breaking on secondary metric (total solved)
 * - Tie-breaking on tertiary metric (longest streak)
 * - Completely identical users (alphabetical fallback)
 * - Empty leaderboard
 * - Large dataset performance
 * 
 * Run these examples to verify the ranking engine works correctly.
 */

import {
  sortUsersByRanking,
  calculateRanks,
  applyTieBreaking,
  getRankChanges,
  filterUsersByQuery,
  paginateEntries,
  getTotalPages,
  findUserEntry,
  getRankContext,
  sanitizeUsers,
  RankableUser,
} from './leaderboardEngine';

// ============================================
// Test Scenario 1: Unique Ranks
// ============================================
export const testUniqueRanks = () => {
  console.log('Test 1: Unique Ranks');
  console.log('='.repeat(50));

  const users: RankableUser[] = [
    {
      userId: '1',
      userName: 'Alice',
      totalSolved: 100,
      currentStreak: 10,
      longestStreak: 15,
      missedDays: 2,
      penaltyAmount: 10,
    },
    {
      userId: '2',
      userName: 'Bob',
      totalSolved: 150,
      currentStreak: 20,
      longestStreak: 25,
      missedDays: 1,
      penaltyAmount: 5,
    },
    {
      userId: '3',
      userName: 'Charlie',
      totalSolved: 80,
      currentStreak: 5,
      longestStreak: 10,
      missedDays: 5,
      penaltyAmount: 25,
    },
  ];

  const ranked = applyTieBreaking(users);
  console.log(ranked);
  console.log('Expected: Bob (rank 1), Alice (rank 2), Charlie (rank 3)');
  console.log('\n');

  return ranked;
};

// ============================================
// Test Scenario 2: Tie on Primary Metric (Current Streak)
// ============================================
export const testTieOnPrimaryMetric = () => {
  console.log('Test 2: Tie on Primary Metric (Current Streak)');
  console.log('='.repeat(50));

  const users: RankableUser[] = [
    {
      userId: '1',
      userName: 'Alice',
      totalSolved: 100,
      currentStreak: 10,
      longestStreak: 15,
      missedDays: 2,
      penaltyAmount: 10,
    },
    {
      userId: '2',
      userName: 'Bob',
      totalSolved: 150,
      currentStreak: 10, // Same streak as Alice
      longestStreak: 20,
      missedDays: 1,
      penaltyAmount: 5,
    },
    {
      userId: '3',
      userName: 'Charlie',
      totalSolved: 80,
      currentStreak: 10, // Same streak as Alice and Bob
      longestStreak: 12,
      missedDays: 5,
      penaltyAmount: 25,
    },
  ];

  const ranked = applyTieBreaking(users);
  console.log(ranked);
  console.log('Expected: Bob (rank 1 - higher totalSolved), Alice (rank 2), Charlie (rank 3)');
  console.log('\n');

  return ranked;
};

// ============================================
// Test Scenario 3: Tie on Secondary Metric (Total Solved)
// ============================================
export const testTieOnSecondaryMetric = () => {
  console.log('Test 3: Tie on Secondary Metric (Total Solved)');
  console.log('='.repeat(50));

  const users: RankableUser[] = [
    {
      userId: '1',
      userName: 'Alice',
      totalSolved: 100,
      currentStreak: 10,
      longestStreak: 20,
      missedDays: 2,
      penaltyAmount: 10,
    },
    {
      userId: '2',
      userName: 'Bob',
      totalSolved: 100, // Same as Alice
      currentStreak: 10, // Same as Alice
      longestStreak: 25, // Higher than Alice
      missedDays: 1,
      penaltyAmount: 5,
    },
    {
      userId: '3',
      userName: 'Charlie',
      totalSolved: 100, // Same as others
      currentStreak: 10, // Same as others
      longestStreak: 15, // Lower than others
      missedDays: 5,
      penaltyAmount: 25,
    },
  ];

  const ranked = applyTieBreaking(users);
  console.log(ranked);
  console.log('Expected: Bob (rank 1 - highest longestStreak), Alice (rank 2), Charlie (rank 3)');
  console.log('\n');

  return ranked;
};

// ============================================
// Test Scenario 4: Completely Identical Users (Alphabetical Fallback)
// ============================================
export const testIdenticalUsers = () => {
  console.log('Test 4: Completely Identical Users (Alphabetical Fallback)');
  console.log('='.repeat(50));

  const users: RankableUser[] = [
    {
      userId: '1',
      userName: 'Charlie',
      totalSolved: 100,
      currentStreak: 10,
      longestStreak: 15,
      missedDays: 2,
      penaltyAmount: 10,
    },
    {
      userId: '2',
      userName: 'Alice', // Alphabetically first
      totalSolved: 100, // Same stats
      currentStreak: 10,
      longestStreak: 15,
      missedDays: 2,
      penaltyAmount: 10,
    },
    {
      userId: '3',
      userName: 'Bob',
      totalSolved: 100, // Same stats
      currentStreak: 10,
      longestStreak: 15,
      missedDays: 2,
      penaltyAmount: 10,
    },
  ];

  const ranked = applyTieBreaking(users);
  console.log(ranked);
  console.log('Expected: All rank 1 (tied), but ordered: Alice, Bob, Charlie (alphabetically)');
  console.log('\n');

  return ranked;
};

// ============================================
// Test Scenario 5: Empty Leaderboard
// ============================================
export const testEmptyLeaderboard = () => {
  console.log('Test 5: Empty Leaderboard');
  console.log('='.repeat(50));

  const users: RankableUser[] = [];
  const ranked = applyTieBreaking(users);
  console.log(ranked);
  console.log('Expected: Empty array');
  console.log('\n');

  return ranked;
};

// ============================================
// Test Scenario 6: Large Dataset (Performance Test)
// ============================================
export const testLargeDataset = () => {
  console.log('Test 6: Large Dataset (100+ users)');
  console.log('='.repeat(50));

  const users: RankableUser[] = [];
  for (let i = 1; i <= 150; i++) {
    users.push({
      userId: `user-${i}`,
      userName: `User ${i}`,
      totalSolved: Math.floor(Math.random() * 300),
      currentStreak: Math.floor(Math.random() * 50),
      longestStreak: Math.floor(Math.random() * 100),
      missedDays: Math.floor(Math.random() * 20),
      penaltyAmount: Math.floor(Math.random() * 100),
    });
  }

  const startTime = performance.now();
  const ranked = applyTieBreaking(users);
  const endTime = performance.now();

  console.log(`Ranked ${ranked.length} users in ${(endTime - startTime).toFixed(2)}ms`);
  console.log('Top 5:');
  console.log(ranked.slice(0, 5));
  console.log('Expected: Fast execution (< 10ms for 150 users)');
  console.log('\n');

  return ranked;
};

// ============================================
// Test Scenario 7: Rank Changes Detection
// ============================================
export const testRankChanges = () => {
  console.log('Test 7: Rank Changes Detection');
  console.log('='.repeat(50));

  const previousRankings = applyTieBreaking([
    {
      userId: '1',
      userName: 'Alice',
      totalSolved: 100,
      currentStreak: 10,
      longestStreak: 15,
      missedDays: 2,
      penaltyAmount: 10,
    },
    {
      userId: '2',
      userName: 'Bob',
      totalSolved: 150,
      currentStreak: 20,
      longestStreak: 25,
      missedDays: 1,
      penaltyAmount: 5,
    },
  ]);

  const currentRankings = applyTieBreaking([
    {
      userId: '1',
      userName: 'Alice',
      totalSolved: 200, // Improved
      currentStreak: 25, // Improved
      longestStreak: 30,
      missedDays: 2,
      penaltyAmount: 10,
    },
    {
      userId: '2',
      userName: 'Bob',
      totalSolved: 150,
      currentStreak: 20,
      longestStreak: 25,
      missedDays: 1,
      penaltyAmount: 5,
    },
    {
      userId: '3',
      userName: 'Charlie', // New user
      totalSolved: 50,
      currentStreak: 5,
      longestStreak: 10,
      missedDays: 5,
      penaltyAmount: 25,
    },
  ]);

  const withChanges = getRankChanges(currentRankings, previousRankings);
  console.log(withChanges);
  console.log('Expected: Alice moved up, Bob moved down, Charlie is new');
  console.log('\n');

  return withChanges;
};

// ============================================
// Test Scenario 8: Search/Filter Functionality
// ============================================
export const testSearchFilter = () => {
  console.log('Test 8: Search/Filter Functionality');
  console.log('='.repeat(50));

  const users: RankableUser[] = [
    {
      userId: '1',
      userName: 'Alice Johnson',
      totalSolved: 100,
      currentStreak: 10,
      longestStreak: 15,
      missedDays: 2,
      penaltyAmount: 10,
    },
    {
      userId: '2',
      userName: 'Bob Smith',
      totalSolved: 150,
      currentStreak: 20,
      longestStreak: 25,
      missedDays: 1,
      penaltyAmount: 5,
    },
    {
      userId: '3',
      userName: 'Charlie Johnson',
      totalSolved: 80,
      currentStreak: 5,
      longestStreak: 10,
      missedDays: 5,
      penaltyAmount: 25,
    },
  ];

  const filtered = filterUsersByQuery(users, 'Johnson');
  console.log(filtered);
  console.log('Expected: Alice Johnson and Charlie Johnson');
  console.log('\n');

  return filtered;
};

// ============================================
// Test Scenario 9: Pagination
// ============================================
export const testPagination = () => {
  console.log('Test 9: Pagination');
  console.log('='.repeat(50));

  const users: RankableUser[] = [];
  for (let i = 1; i <= 25; i++) {
    users.push({
      userId: `user-${i}`,
      userName: `User ${i}`,
      totalSolved: 100 - i,
      currentStreak: 50 - i,
      longestStreak: 75 - i,
      missedDays: i,
      penaltyAmount: i * 5,
    });
  }

  const ranked = applyTieBreaking(users);
  const pageSize = 10;
  const totalPages = getTotalPages(ranked.length, pageSize);

  console.log(`Total entries: ${ranked.length}`);
  console.log(`Page size: ${pageSize}`);
  console.log(`Total pages: ${totalPages}`);

  const page1 = paginateEntries(ranked, 1, pageSize);
  const page2 = paginateEntries(ranked, 2, pageSize);

  console.log('\nPage 1:', page1.map((u) => u.userName));
  console.log('Page 2:', page2.map((u) => u.userName));
  console.log('Expected: 10 users per page, 3 total pages');
  console.log('\n');

  return { page1, page2, totalPages };
};

// ============================================
// Test Scenario 10: Find User & Context View
// ============================================
export const testUserContext = () => {
  console.log('Test 10: Find User & Context View');
  console.log('='.repeat(50));

  const users: RankableUser[] = [];
  for (let i = 1; i <= 20; i++) {
    users.push({
      userId: `user-${i}`,
      userName: `User ${i}`,
      totalSolved: 200 - i * 10,
      currentStreak: 20 - i,
      longestStreak: 30 - i,
      missedDays: i,
      penaltyAmount: i * 5,
    });
  }

  const ranked = applyTieBreaking(users);
  const targetUserId = 'user-10';
  const userEntry = findUserEntry(ranked, targetUserId);

  console.log('Target user:', userEntry);

  if (userEntry) {
    const context = getRankContext(ranked, userEntry.rank, 2);
    console.log('\nContext (2 above, 2 below):');
    console.log(context.map((u) => `Rank ${u.rank}: ${u.userName}`));
  }

  console.log('Expected: User 10 with 2 users above and 2 below');
  console.log('\n');

  return { userEntry, context: userEntry ? getRankContext(ranked, userEntry.rank, 2) : [] };
};

// ============================================
// Test Scenario 11: Data Validation & Sanitization
// ============================================
export const testDataValidation = () => {
  console.log('Test 11: Data Validation & Sanitization');
  console.log('='.repeat(50));

  const mixedData: Partial<RankableUser>[] = [
    {
      userId: '1',
      userName: 'Valid User',
      totalSolved: 100,
      currentStreak: 10,
      longestStreak: 15,
      missedDays: 2,
      penaltyAmount: 10,
    },
    {
      userId: '2',
      userName: 'Invalid User', // Missing required fields
      totalSolved: 50,
    },
    {
      userId: '', // Invalid empty ID
      userName: 'Empty ID User',
      totalSolved: 80,
      currentStreak: 5,
      longestStreak: 10,
      missedDays: 3,
      penaltyAmount: 15,
    },
    {
      userId: '3',
      userName: 'Another Valid User',
      totalSolved: 120,
      currentStreak: 15,
      longestStreak: 20,
      missedDays: 1,
      penaltyAmount: 5,
    },
  ];

  const sanitized = sanitizeUsers(mixedData);
  console.log('Original data count:', mixedData.length);
  console.log('Sanitized data count:', sanitized.length);
  console.log('Sanitized users:', sanitized);
  console.log('Expected: Only 2 valid users (Invalid User and Empty ID User removed)');
  console.log('\n');

  return sanitized;
};

// ============================================
// Run All Tests
// ============================================
export const runAllTests = () => {
  console.log('\n\n');
  console.log('╔' + '═'.repeat(78) + '╗');
  console.log('║' + ' '.repeat(20) + 'LEADERBOARD ENGINE TEST SUITE' + ' '.repeat(29) + '║');
  console.log('╚' + '═'.repeat(78) + '╝');
  console.log('\n');

  const results = {
    test1: testUniqueRanks(),
    test2: testTieOnPrimaryMetric(),
    test3: testTieOnSecondaryMetric(),
    test4: testIdenticalUsers(),
    test5: testEmptyLeaderboard(),
    test6: testLargeDataset(),
    test7: testRankChanges(),
    test8: testSearchFilter(),
    test9: testPagination(),
    test10: testUserContext(),
    test11: testDataValidation(),
  };

  console.log('╔' + '═'.repeat(78) + '╗');
  console.log('║' + ' '.repeat(30) + 'ALL TESTS COMPLETE' + ' '.repeat(30) + '║');
  console.log('╚' + '═'.repeat(78) + '╝');
  console.log('\n');

  return results;
};

// Export for console testing
// You can run these in browser console:
// import { runAllTests } from './leaderboardEngine.test.examples'
// runAllTests()
