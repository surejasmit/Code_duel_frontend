import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Play, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  testUniqueRanks,
  testTieOnPrimaryMetric,
  testTieOnSecondaryMetric,
  testIdenticalUsers,
  testEmptyLeaderboard,
  testLargeDataset,
  testRankChanges,
  testSearchFilter,
  testPagination,
  testUserContext,
  testDataValidation,
} from '@/utils/leaderboardEngine.test.examples';

interface TestResult {
  name: string;
  status: 'pending' | 'running' | 'passed' | 'failed';
  result?: any;
  error?: string;
  duration?: number;
}

const LeaderboardTest: React.FC = () => {
  const [testResults, setTestResults] = useState<TestResult[]>([
    { name: 'Test 1: Unique Ranks', status: 'pending' },
    { name: 'Test 2: Tie on Primary Metric', status: 'pending' },
    { name: 'Test 3: Tie on Secondary Metric', status: 'pending' },
    { name: 'Test 4: Identical Users (Alphabetical)', status: 'pending' },
    { name: 'Test 5: Empty Leaderboard', status: 'pending' },
    { name: 'Test 6: Large Dataset (Performance)', status: 'pending' },
    { name: 'Test 7: Rank Changes Detection', status: 'pending' },
    { name: 'Test 8: Search/Filter Functionality', status: 'pending' },
    { name: 'Test 9: Pagination', status: 'pending' },
    { name: 'Test 10: Find User & Context View', status: 'pending' },
    { name: 'Test 11: Data Validation', status: 'pending' },
  ]);

  const runTest = async (index: number, testFn: () => any) => {
    setTestResults((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], status: 'running' };
      return updated;
    });

    try {
      const startTime = performance.now();
      const result = testFn();
      const endTime = performance.now();
      const duration = endTime - startTime;

      setTestResults((prev) => {
        const updated = [...prev];
        updated[index] = {
          ...updated[index],
          status: 'passed',
          result,
          duration,
        };
        return updated;
      });
    } catch (error) {
      setTestResults((prev) => {
        const updated = [...prev];
        updated[index] = {
          ...updated[index],
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error',
        };
        return updated;
      });
    }
  };

  const runAllTests = async () => {
    const tests = [
      testUniqueRanks,
      testTieOnPrimaryMetric,
      testTieOnSecondaryMetric,
      testIdenticalUsers,
      testEmptyLeaderboard,
      testLargeDataset,
      testRankChanges,
      testSearchFilter,
      testPagination,
      testUserContext,
      testDataValidation,
    ];

    for (let i = 0; i < tests.length; i++) {
      await runTest(i, tests[i]);
      // Small delay between tests for UI feedback
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'running':
        return <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />;
      default:
        return <div className="h-5 w-5 border-2 border-muted rounded-full" />;
    }
  };

  const passedCount = testResults.filter((t) => t.status === 'passed').length;
  const failedCount = testResults.filter((t) => t.status === 'failed').length;
  const totalCount = testResults.length;

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Back Button */}
        <Button variant="ghost" size="sm" asChild className="gap-2">
          <Link to="/">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>

        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">
            <span className="gradient-text">Leaderboard Engine Tests</span>
          </h1>
          <p className="text-muted-foreground">
            Validate the ranking system with comprehensive test scenarios
          </p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold">{totalCount}</p>
              <p className="text-sm text-muted-foreground">Total Tests</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-green-500">{passedCount}</p>
              <p className="text-sm text-muted-foreground">Passed</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-red-500">{failedCount}</p>
              <p className="text-sm text-muted-foreground">Failed</p>
            </CardContent>
          </Card>
        </div>

        {/* Run All Button */}
        <div className="flex justify-center">
          <Button
            onClick={runAllTests}
            size="lg"
            className="gap-2"
            disabled={testResults.some((t) => t.status === 'running')}
          >
            <Play className="h-4 w-4" />
            Run All Tests
          </Button>
        </div>

        {/* Test Results */}
        <div className="space-y-3">
          {testResults.map((test, index) => (
            <Card key={index} className="hover-lift">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between text-base">
                  <span className="flex items-center gap-2">
                    {getStatusIcon(test.status)}
                    {test.name}
                  </span>
                  {test.duration && (
                    <span className="text-sm text-muted-foreground font-normal">
                      {test.duration.toFixed(2)}ms
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              {(test.result || test.error) && (
                <CardContent>
                  {test.error ? (
                    <div className="text-sm text-red-500 font-mono bg-red-50 dark:bg-red-950 p-3 rounded">
                      Error: {test.error}
                    </div>
                  ) : (
                    <details className="text-sm">
                      <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                        View Result
                      </summary>
                      <pre className="mt-2 p-3 bg-muted rounded overflow-x-auto text-xs">
                        {JSON.stringify(test.result, null, 2)}
                      </pre>
                    </details>
                  )}
                </CardContent>
              )}
            </Card>
          ))}
        </div>

        {/* Console Instructions */}
        <Card className="bg-muted/50">
          <CardHeader>
            <CardTitle className="text-base">💡 Alternative: Run in Browser Console</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p className="text-muted-foreground">
              You can also run tests directly in the browser console:
            </p>
            <pre className="bg-background p-3 rounded text-xs overflow-x-auto">
              {`const tests = await import('/src/utils/leaderboardEngine.test.examples.ts');
tests.runAllTests();`}
            </pre>
            <p className="text-muted-foreground">
              Or run individual tests:
            </p>
            <pre className="bg-background p-3 rounded text-xs overflow-x-auto">
              {`tests.testUniqueRanks();
tests.testTieOnPrimaryMetric();`}
            </pre>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LeaderboardTest;
