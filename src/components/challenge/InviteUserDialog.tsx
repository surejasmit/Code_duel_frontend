import React, { useState, useRef, useEffect } from "react";
import { Search, UserPlus, Loader2, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { inviteApi, userApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { UserSearchResult } from "@/types";
import { cn } from "@/lib/utils";

interface InviteUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  challengeId: string;
  challengeName: string;
  existingMemberIds?: string[];
}

const InviteUserDialog: React.FC<InviteUserDialogProps> = ({
  open,
  onOpenChange,
  challengeId,
  challengeName,
  existingMemberIds = [],
}) => {
  const { toast } = useToast();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<UserSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [invitedIds, setInvitedIds] = useState<Set<string>>(new Set());
  const [sendingId, setSendingId] = useState<string | null>(null);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const isMountedRef = useRef(true);

  // Cleanup on unmount: cancel pending debounce, abort in-flight request, mark unmounted
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      abortControllerRef.current?.abort();
    };
  }, []);

  const handleSearch = (value: string) => {
    setQuery(value);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Abort any in-flight request from a previous search
    abortControllerRef.current?.abort();

    if (value.trim().length < 2) {
      setResults([]);
      return;
    }

    searchTimeoutRef.current = setTimeout(async () => {
      const controller = new AbortController();
      abortControllerRef.current = controller;

      setIsSearching(true);
      try {
        const response = await userApi.searchUsers(value.trim(), controller.signal);
        if (response.success && response.data) {
          setResults(response.data);
        } else {
          setResults([]);
        }
      } catch (err: any) {
        // Ignore AbortError / Axios cancellation — triggered intentionally when a newer search starts
        const isAbortOrCancel =
          (err instanceof Error &&
            (err.name === "AbortError" || err.name === "CanceledError")) ||
          (err && (err as any).code === "ERR_CANCELED");
        if (!isAbortOrCancel) {
          setResults([]);
        }
      } finally {
        // Only clear the searching flag if this is still the current request
        if (abortControllerRef.current === controller) {
          setIsSearching(false);
        }
      }
    }, 400);
  };

  const handleSendInvite = async (user: UserSearchResult) => {
    setSendingId(user.id);
    try {
      const response = await inviteApi.sendInvite(challengeId, user.id);
      if (response.success) {
        setInvitedIds((prev) => new Set(prev).add(user.id));
        toast({
          title: "Invite sent",
          description: `Invite sent to ${user.username} successfully.`,
        });
      } else {
        throw new Error(response.message || "Failed to send invite");
      }
    } catch (error: any) {
      toast({
        title: "Failed to send invite",
        description:
          error.response?.data?.message || error.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      if (isMountedRef.current) setSendingId(null);
    }
  };

  const handleOpenChange = (value: boolean) => {
    if (!value) {
      // Cancel any pending debounce and in-flight search when dialog closes
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
      abortControllerRef.current?.abort();
      setQuery("");
      setResults([]);
      setIsSearching(false);
      setInvitedIds(new Set());
      setSendingId(null);
    }
    onOpenChange(value);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Invite Users
          </DialogTitle>
          <DialogDescription>
            Search for users to invite to{" "}
            <span className="font-medium text-foreground">{challengeName}</span>.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by username..."
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-9"
              autoFocus
            />
          </div>

          {/* Results */}
          <ScrollArea className="h-64" aria-busy={isSearching} aria-live="polite">
            {isSearching && (
              <div
                className="flex items-center justify-center py-8"
                role="status"
              >
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                <span className="sr-only">Searching for users…</span>
              </div>
            )}

            {!isSearching && query.trim().length >= 2 && results.length === 0 && (
              <p className="text-center text-sm text-muted-foreground py-8">
                No users found for {"\""}{query}{"\""}
              </p>
            )}

            {!isSearching && query.trim().length < 2 && (
              <p className="text-center text-sm text-muted-foreground py-8">
                Type at least 2 characters to search
              </p>
            )}

            {!isSearching && results.length > 0 && (
              <div className="space-y-2 pr-2">
                {results.map((user) => {
                  const isAlreadyMember = existingMemberIds.includes(user.id);
                  const isInvited = invitedIds.has(user.id);
                  const isSending = sendingId === user.id;

                  return (
                    <div
                      key={user.id}
                      className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                    >
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={user.avatar} alt={user.username} />
                        <AvatarFallback>
                          {user.username.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">
                          {user.username}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          LC: {user.leetcodeUsername}
                        </p>
                      </div>

                      {isAlreadyMember ? (
                        <Badge
                          variant="outline"
                          className="text-xs shrink-0"
                        >
                          Member
                        </Badge>
                      ) : isInvited ? (
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-xs shrink-0 gap-1",
                            "bg-success/10 text-success border-success/20"
                          )}
                        >
                          <Check className="h-3 w-3" />
                          Invited
                        </Badge>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          className="shrink-0 gap-1.5"
                          onClick={() => handleSendInvite(user)}
                          disabled={isSending}
                        >
                          {isSending ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <UserPlus className="h-3.5 w-3.5" />
                          )}
                          Invite
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InviteUserDialog;
