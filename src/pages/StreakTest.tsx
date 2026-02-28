import { useState } from 'react';
import { useStreak } from '@/hooks/useStreak';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calendar, Flame, TrendingUp, CheckCircle, XCircle, BarChart3 } from 'lucide-react';

export default function StreakTest() {
  const { streakData, logActivity, resetStreak, refreshStreak, hasLoggedToday } = useStreak();
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  const handleLogActivity = () => {
    const success = logActivity();
    if (success) {
      setMessage({ type: 'success', text: '✅ Activity logged successfully!' });
    } else {
      setMessage({ type: 'info', text: '⚠️ You already logged activity today!' });
    }
    setTimeout(() => setMessage(null), 3000);
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all streak data? This cannot be undone.')) {
      resetStreak();
      setMessage({ type: 'success', text: '🔄 Streak data has been reset!' });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleRefresh = () => {
    refreshStreak();
    setMessage({ type: 'success', text: '🔄 Streak data refreshed!' });
    setTimeout(() => setMessage(null), 3000);
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">🔥 Streak Tracking System - Test Page</h1>
        <p className="text-muted-foreground">
          Test and verify the streak engine functionality in real-time
        </p>
      </div>

      {message && (
        <Alert className={`mb-6 ${
          message.type === 'success' ? 'bg-green-50 border-green-200' : 
          message.type === 'error' ? 'bg-red-50 border-red-200' : 
          'bg-blue-50 border-blue-200'
        }`}>
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Flame className="h-4 w-4 text-orange-500" />
              Current Streak
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{streakData.currentStreak}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {streakData.currentStreak === 1 ? 'day' : 'days'} in a row
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-500" />
              Longest Streak
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{streakData.longestStreak}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Personal best
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4 text-green-500" />
              Total Active Days
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{streakData.totalActiveDays}</div>
            <p className="text-xs text-muted-foreground mt-1">
              All-time activity
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-purple-500" />
              Missed Days
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{streakData.missedDays}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Since last activity
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Status and Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Today's Status</CardTitle>
            <CardDescription>Check if you've logged activity today</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-3">
                {streakData.activeToday ? (
                  <>
                    <CheckCircle className="h-8 w-8 text-green-500" />
                    <div>
                      <p className="font-semibold">Activity Logged</p>
                      <p className="text-sm text-muted-foreground">You're on track!</p>
                    </div>
                  </>
                ) : (
                  <>
                    <XCircle className="h-8 w-8 text-red-500" />
                    <div>
                      <p className="font-semibold">No Activity Yet</p>
                      <p className="text-sm text-muted-foreground">Log your activity now</p>
                    </div>
                  </>
                )}
              </div>
              <Badge variant={streakData.activeToday ? "default" : "destructive"}>
                {streakData.activeToday ? "Active" : "Inactive"}
              </Badge>
            </div>
            
            <Button 
              onClick={handleLogActivity} 
              className="w-full"
              disabled={streakData.activeToday}
            >
              {streakData.activeToday ? '✓ Already Logged Today' : '📝 Log Today\'s Activity'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
            <CardDescription>Manage your streak data</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              onClick={handleRefresh} 
              variant="outline" 
              className="w-full"
            >
              🔄 Refresh Data
            </Button>
            
            <Button 
              onClick={handleReset} 
              variant="destructive" 
              className="w-full"
            >
              🗑️ Reset All Data
            </Button>

            <div className="pt-2 text-xs text-muted-foreground">
              <p><strong>Last Updated:</strong> {streakData.lastUpdated}</p>
              <p><strong>Loading:</strong> {streakData.isLoading ? 'Yes' : 'No'}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity History */}
      <Card>
        <CardHeader>
          <CardTitle>Activity History</CardTitle>
          <CardDescription>
            All logged activity dates ({streakData.dates.length} total)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {streakData.dates.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No activity logged yet</p>
              <p className="text-sm">Start by logging your first activity!</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 max-h-96 overflow-y-auto">
              {streakData.dates.slice().reverse().map((date, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg border text-center ${
                    index === 0 ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted'
                  }`}
                >
                  <div className="text-xs font-medium">{date}</div>
                  {index === 0 && (
                    <div className="text-[10px] mt-1">Latest</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Testing Instructions */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>🧪 Testing Instructions</CardTitle>
          <CardDescription>How to verify the streak engine works correctly</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="space-y-2">
            <h4 className="font-semibold">Test Cases:</h4>
            <ol className="list-decimal list-inside space-y-1 ml-2">
              <li><strong>Log Activity:</strong> Click "Log Today's Activity" - should increment current streak by 1</li>
              <li><strong>Duplicate Prevention:</strong> Try clicking again - should show "already logged" message</li>
              <li><strong>Refresh Data:</strong> Click "Refresh Data" - stats should remain the same</li>
              <li><strong>Check localStorage:</strong> Open DevTools → Application → Local Storage → check <code>activity_streak_log</code></li>
              <li><strong>Reset Test:</strong> Click "Reset All Data" - everything should go to zero</li>
              <li><strong>Multiple Days:</strong> Manually add past dates in localStorage to test streak calculation</li>
              <li><strong>Midnight Test:</strong> The streak will auto-refresh at midnight (leave page open)</li>
            </ol>
          </div>

          <div className="p-3 bg-muted rounded-lg">
            <p className="font-semibold mb-2">Manual Testing in Console:</p>
            <code className="text-xs block">
              {`// Open browser console (F12) and run:
import { recordActivity } from '../utils/streakEngine';

// Add activity for yesterday
const yesterday = new Date();
yesterday.setDate(yesterday.getDate() - 1);
recordActivity(yesterday);`}
            </code>
          </div>

          <div className="flex items-start gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-green-800">
            <CheckCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Expected Behavior:</p>
              <ul className="list-disc list-inside text-xs mt-1 space-y-1">
                <li>Logging today should work once only</li>
                <li>Current streak increases with consecutive days</li>
                <li>Missing a day resets current streak to 0</li>
                <li>Longest streak preserves the best run</li>
                <li>All dates stored in YYYY-MM-DD format</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
