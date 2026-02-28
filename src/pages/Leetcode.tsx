import Layout from "@/components/layout/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { Database, Settings } from "lucide-react";
import ActivityHeatmap from "@/components/dashboard/ActivityHeatmap";
import EmptyState from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { leetcodeApi } from "@/lib/api";
import { getErrorMessage } from "@/lib/utils";

interface LeetCodeSubmission {
  id: string | number;
  title: string;
  titleSlug: string;
  lang: string;
  timestamp: number;
  status?: string;
  statusDisplay?: string;
}

// ✅ Centralized React Query hooks — cached, auto-refreshing
import {
  useLeetcodeProfile,
  useLeetcodeSubmissions,
  useUserProfile,
} from "@/hooks/useLeetcodeProfile";

const Leetcode = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // ✅ Cached queries replace manual useState/useEffect/loadProfile
  const { data: userProfile } = useUserProfile();
  const {
    data: leetcodeProfile,
    isLoading,
    refetch: refetchProfile,
  } = useLeetcodeProfile(user?.leetcodeUsername);
  const { data: recentSubmissions = [], refetch: refetchSubmissions } =
    useLeetcodeSubmissions(user?.leetcodeUsername);

  const profile = userProfile || user;

  // ✅ Refresh button uses React Query's refetch — re-uses cache + loading states
  const handleRefresh = () => {
    refetchProfile();
    refetchSubmissions();
  };

  return (
    <Layout>
      <div className="container mx-auto p-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">LeetCode Profile</h1>
            <p className="text-sm text-muted-foreground mt-1">
              View your LeetCode contribution stats and profile details
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={handleRefresh} disabled={isLoading}>
              Refresh
            </Button>
            <Button asChild>
              <Link to="/settings">Settings</Link>
            </Button>
          </div>
        </div>

        {!user?.leetcodeUsername && (
          <EmptyState
            icon={Settings}
            title="No LeetCode username"
            description="Set your LeetCode username in settings to fetch profile data."
            action={{
              label: "Go to Settings",
              onClick: () => {
                navigate("/settings");
              },
            }}
          />
        )}

        {user?.leetcodeUsername && !leetcodeProfile && !isLoading && (
          <EmptyState
            icon={Database}
            title="No profile data"
            description="Make sure you've stored a LeetCode session in the backend."
            action={{
              label: "Go to Settings",
              onClick: () => {
                navigate("/settings");
              },
            }}
          />
        )}

        {leetcodeProfile && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="col-span-2">
                <div className="p-4 bg-card rounded-md">
                  <h2 className="text-xl font-semibold">
                    {leetcodeProfile.username}
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Current streak:{" "}
                    <span className="font-medium">
                      {leetcodeProfile.streak}
                    </span>
                    {" • "}Total active days:{" "}
                    <span className="font-medium">
                      {leetcodeProfile.totalActiveDays}
                    </span>
                  </p>

                  <div className="mt-4">
                    <h3 className="text-sm font-medium text-muted-foreground">
                      Active Years
                    </h3>
                    <div className="flex gap-2 mt-2">
                      {(leetcodeProfile.activeYears || []).map((y: number) => (
                        <span
                          key={y}
                          className="px-2 py-1 bg-muted rounded text-sm"
                        >
                          {y}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <div className="p-4 bg-card rounded-md">
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Actions
                  </h3>
                  <div className="flex flex-col gap-2 mt-3">
                    <TestConnectionButton
                      username={leetcodeProfile.username}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <ActivityHeatmap
                data={formatSubmissionCalendar(
                  leetcodeProfile.submissionCalendar
                )}
                title="Contribution Graph"
              />
            </div>
            <div>
              <div className="p-4 bg-card rounded-md">
                <h3 className="text-lg font-semibold">Recent Submissions</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Latest accepted submissions (sample)
                </p>

                {recentSubmissions.length === 0 ? (
                  <div className="mt-4 text-sm text-muted-foreground">
                    No recent submissions available.
                  </div>
                ) : (
                  <ul className="mt-4 space-y-3">
                    {recentSubmissions.map((s: LeetCodeSubmission) => (
                      <li
                        key={s.id}
                        className="flex items-center justify-between"
                      >
                        <div>
                          <a
                            href={`https://leetcode.com/problems/${s.titleSlug}/`}
                            target="_blank"
                            rel="noreferrer"
                            className="font-medium hover:underline"
                          >
                            {s.title}
                          </a>
                          <div className="text-xs text-muted-foreground">
                            {s.lang} •{" "}
                            {new Date(
                              Number(s.timestamp) * 1000
                            ).toLocaleString()}
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {s.statusDisplay || s.status}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Leetcode;

function formatSubmissionCalendar(calendar: string | Record<string, number> | unknown) {
  if (!calendar) return [];

  // The backend returns an object mapping dateStr -> count (or nested structure)
  // Normalize to ActivityData[] expected by ActivityHeatmap
  try {
    // If calendar is a stringified JSON, try to parse
    const cal =
      typeof calendar === "string" ? JSON.parse(calendar) : calendar;

    const entries = Object.keys(cal).map((date) => ({
      date,
      count: cal[date] || 0,
    }));
    // Sort by date ascending
    entries.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    return entries;
  } catch (err) {
    console.error("Failed to parse submission calendar", err);
    return [];
  }
}

function TestConnectionButton({ username }: { username: string }) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleTest = async () => {
    setLoading(true);
    try {
      const res = await leetcodeApi.testConnection(username);
      if (res.success) {
        toast({
          title: "Connection OK",
          description: res.message || "LeetCode connection successful",
        });
      } else {
        toast({
          title: "Connection failed",
          description: res.message || res.error || "Failed to connect",
        });
      }
    } catch (err: unknown) {
      toast({ title: "Error", description: getErrorMessage(err) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button onClick={handleTest} disabled={loading} variant="outline">
      {loading ? "Testing..." : "Test Connection"}
    </Button>
  );
}
