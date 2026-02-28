import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Loader2, UserPlus, CheckCircle, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Layout from "@/components/layout/Layout";
import { challengeApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const JoinByCode: React.FC = () => {
    const { code } = useParams<{ code: string }>();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [isJoining, setIsJoining] = useState(false);
    const [joinStatus, setJoinStatus] = useState<
        "idle" | "success" | "error"
    >("idle");
    const [errorMessage, setErrorMessage] = useState("");
    const [challengeData, setChallengeData] = useState<any>(null);

    const handleJoin = async () => {
        if (!code) return;

        setIsJoining(true);
        setJoinStatus("idle");

        try {
            const response = await challengeApi.joinByCode(code);

            if (response.success) {
                setJoinStatus("success");
                setChallengeData(response.data);
                toast({
                    title: "Successfully joined!",
                    description: `You've joined ${response.data?.challenge?.name || "the challenge"}`,
                });

                // Redirect to challenge page after 2 seconds
                setTimeout(() => {
                    const challengeId =
                        response.data?.challengeId || response.data?.challenge?.id;
                    if (challengeId) {
                        navigate(`/challenge/${challengeId}`);
                    } else {
                        navigate("/");
                    }
                }, 2000);
            }
        } catch (error: any) {
            setJoinStatus("error");
            const message =
                error.response?.data?.message || "Failed to join challenge";
            setErrorMessage(message);
            toast({
                title: "Failed to join",
                description: message,
                variant: "destructive",
            });
        } finally {
            setIsJoining(false);
        }
    };

    // Auto-join when page loads with a code
    useEffect(() => {
        if (code) {
            handleJoin();
        }
    }, [code]);

    return (
        <Layout>
            <div className="flex items-center justify-center min-h-[60vh]">
                <Card className="w-full max-w-md">
                    <CardHeader className="text-center">
                        <CardTitle className="text-2xl">Join Challenge</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {joinStatus === "idle" && isJoining && (
                            <div className="flex flex-col items-center gap-4 py-8">
                                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                                <p className="text-muted-foreground">
                                    Joining challenge with code: <span className="font-mono font-bold">{code}</span>
                                </p>
                            </div>
                        )}

                        {joinStatus === "success" && (
                            <div className="flex flex-col items-center gap-4 py-8">
                                <CheckCircle className="h-12 w-12 text-success" />
                                <div className="text-center">
                                    <p className="text-lg font-semibold">Successfully Joined!</p>
                                    <p className="text-muted-foreground">
                                        {challengeData?.challenge?.name
                                            ? `Welcome to "${challengeData.challenge.name}"`
                                            : "Redirecting to your challenge..."}
                                    </p>
                                </div>
                                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                            </div>
                        )}

                        {joinStatus === "error" && (
                            <div className="flex flex-col items-center gap-4 py-8">
                                <XCircle className="h-12 w-12 text-destructive" />
                                <div className="text-center">
                                    <p className="text-lg font-semibold">Unable to Join</p>
                                    <p className="text-muted-foreground">{errorMessage}</p>
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="outline" onClick={() => navigate("/")}>
                                        Go to Dashboard
                                    </Button>
                                    <Button onClick={handleJoin} disabled={isJoining} className="gap-2">
                                        {isJoining ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <UserPlus className="h-4 w-4" />
                                        )}
                                        Try Again
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </Layout>
    );
};

export default JoinByCode;
