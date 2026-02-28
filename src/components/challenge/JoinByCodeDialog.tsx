import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Ticket } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { challengeApi } from "@/lib/api";

const JoinByCodeDialog: React.FC = () => {
    const [open, setOpen] = useState(false);
    const [code, setCode] = useState("");
    const [isJoining, setIsJoining] = useState(false);
    const { toast } = useToast();
    const navigate = useNavigate();

    const handleJoin = async () => {
        if (!code.trim()) {
            toast({
                title: "Code required",
                description: "Please enter an invite code",
                variant: "destructive",
            });
            return;
        }

        setIsJoining(true);
        try {
            const response = await challengeApi.joinByCode(code.trim());

            if (response.success) {
                toast({
                    title: "Successfully joined!",
                    description: `You've joined ${response.data?.challenge?.name || "the challenge"}`,
                });
                setOpen(false);
                setCode("");

                const challengeId =
                    response.data?.challengeId || response.data?.challenge?.id;
                if (challengeId) {
                    navigate(`/challenge/${challengeId}`);
                }
            }
        } catch (error: any) {
            toast({
                title: "Failed to join",
                description:
                    error.response?.data?.message || "Invalid or expired invite code",
                variant: "destructive",
            });
        } finally {
            setIsJoining(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setCode(""); }}>
            <DialogTrigger asChild>
                <Button variant="outline" className="gap-2 sm:w-auto w-full">
                    <Ticket className="h-4 w-4" />
                    Join by Code
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-sm">
                <DialogHeader>
                    <DialogTitle>Join by Invite Code</DialogTitle>
                    <DialogDescription>
                        Enter the invite code shared by a challenge owner to join their challenge.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 pt-2">
                    <div className="space-y-2">
                        <Label htmlFor="inviteCode">Invite Code</Label>
                        <Input
                            id="inviteCode"
                            placeholder="e.g. X7KP2M"
                            value={code}
                            onChange={(e) => setCode(e.target.value.toUpperCase())}
                            className="font-mono text-lg tracking-widest text-center"
                            maxLength={12}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") handleJoin();
                            }}
                        />
                    </div>

                    <Button
                        onClick={handleJoin}
                        disabled={isJoining || !code.trim()}
                        className="w-full gap-2 gradient-primary"
                    >
                        {isJoining ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Ticket className="h-4 w-4" />
                        )}
                        Join Challenge
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default JoinByCodeDialog;
