import React, { useState } from "react";
import { Copy, Link2, Loader2, UserPlus } from "lucide-react";
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { challengeApi } from "@/lib/api";

interface InviteDialogProps {
    challengeId: string;
}

const InviteDialog: React.FC<InviteDialogProps> = ({ challengeId }) => {
    const [open, setOpen] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [expiresInHours, setExpiresInHours] = useState("24");
    const [maxUses, setMaxUses] = useState(5);
    const [generatedCode, setGeneratedCode] = useState<string | null>(null);
    const [expiresAt, setExpiresAt] = useState<string | null>(null);
    const { toast } = useToast();

    const inviteLink = generatedCode
        ? `${window.location.origin}/join/${generatedCode}`
        : "";

    const handleGenerate = async () => {
        setIsGenerating(true);
        try {
            const response = await challengeApi.generateInvite(challengeId, {
                expiresInHours: parseInt(expiresInHours),
                maxUses,
            });

            if (response.success && response.data) {
                setGeneratedCode(response.data.code);
                setExpiresAt(response.data.expiresAt);
                toast({
                    title: "Invite code generated!",
                    description: `Code: ${response.data.code}`,
                });
            }
        } catch (error: any) {
            toast({
                title: "Failed to generate invite code",
                description:
                    error.response?.data?.message || "Something went wrong",
                variant: "destructive",
            });
        } finally {
            setIsGenerating(false);
        }
    };

    const handleCopyCode = () => {
        if (generatedCode) {
            navigator.clipboard.writeText(generatedCode);
            toast({ title: "Code copied!", description: generatedCode });
        }
    };

    const handleCopyLink = () => {
        if (inviteLink) {
            navigator.clipboard.writeText(inviteLink);
            toast({ title: "Invite link copied!", description: "Share it with your friends" });
        }
    };

    const handleReset = () => {
        setGeneratedCode(null);
        setExpiresAt(null);
    };

    return (
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) handleReset(); }}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                    <UserPlus className="h-4 w-4" />
                    Invite Members
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Invite Members</DialogTitle>
                    <DialogDescription>
                        Generate an invite code to share with others so they can join this challenge.
                    </DialogDescription>
                </DialogHeader>

                {!generatedCode ? (
                    <div className="space-y-4 pt-2">
                        <div className="space-y-2">
                            <Label htmlFor="expiry">Code Expiry</Label>
                            <Select value={expiresInHours} onValueChange={setExpiresInHours}>
                                <SelectTrigger id="expiry">
                                    <SelectValue placeholder="Select expiry" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="1">1 hour</SelectItem>
                                    <SelectItem value="6">6 hours</SelectItem>
                                    <SelectItem value="24">24 hours</SelectItem>
                                    <SelectItem value="72">3 days</SelectItem>
                                    <SelectItem value="168">7 days</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="maxUses">Max Uses</Label>
                            <Input
                                id="maxUses"
                                type="number"
                                min={1}
                                max={100}
                                value={maxUses}
                                onChange={(e) => setMaxUses(parseInt(e.target.value) || 1)}
                            />
                        </div>

                        <Button
                            onClick={handleGenerate}
                            disabled={isGenerating}
                            className="w-full gap-2 gradient-primary"
                        >
                            {isGenerating ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Link2 className="h-4 w-4" />
                            )}
                            Generate Invite Code
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-4 pt-2">
                        <div className="space-y-2">
                            <Label>Invite Code</Label>
                            <div className="flex gap-2">
                                <Input value={generatedCode} readOnly className="font-mono text-lg tracking-widest" />
                                <Button variant="outline" size="icon" onClick={handleCopyCode}>
                                    <Copy className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Invite Link</Label>
                            <div className="flex gap-2">
                                <Input value={inviteLink} readOnly className="text-sm" />
                                <Button variant="outline" size="icon" onClick={handleCopyLink}>
                                    <Copy className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        {expiresAt && (
                            <p className="text-xs text-muted-foreground">
                                Expires: {new Date(expiresAt).toLocaleString()} · Max uses: {maxUses}
                            </p>
                        )}

                        <Button variant="outline" onClick={handleReset} className="w-full">
                            Generate Another Code
                        </Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default InviteDialog;
