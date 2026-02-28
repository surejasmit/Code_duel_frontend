import * as React from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
    TooltipArrow,
    TooltipProvider,
} from "@/components/ui/tooltip";

interface ValidatedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    error?: string;
    showError?: boolean;
}

const ValidatedInput = React.forwardRef<HTMLInputElement, ValidatedInputProps>(
    ({ className, type, error, showError, ...props }, ref) => {
        return (
            <TooltipProvider delayDuration={0}>
                <Tooltip open={showError && !!error}>
                    <TooltipTrigger asChild>
                        <div className="w-full">
                            <Input
                                ref={ref}
                                type={type}
                                className={cn(
                                    "transition-all duration-200 h-12 text-lg rounded-xl",
                                    showError && error
                                        ? "border-2 border-[hsl(var(--orange-primary))] focus-visible:ring-0 focus-visible:ring-offset-0 ring-[hsl(var(--orange-ring))]"
                                        : "focus-visible:ring-[hsl(var(--orange-primary))] focus-visible:border-[hsl(var(--orange-primary))]",
                                    className
                                )}
                                {...props}
                            />
                        </div>
                    </TooltipTrigger>
                    <TooltipContent
                        side="bottom"
                        align="start"
                        className="bg-white text-[#333] border border-gray-300 shadow-[0_4px_12px_rgba(0,0,0,0.15)] p-0 overflow-visible rounded-lg animate-in fade-in-0 zoom-in-95 px-3 py-2 flex items-center gap-3 min-w-[200px]"
                        sideOffset={8}
                    >
                        <div className="bg-[hsl(var(--orange-primary))] h-6 w-6 rounded flex items-center justify-center shrink-0">
                            <span className="text-white font-extrabold text-sm">!</span>
                        </div>
                        <span className="text-[15px] font-medium leading-tight">
                            {error || "Please fill out this field."}
                        </span>
                        <TooltipArrow className="fill-white" width={14} height={7} />
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        );
    }
);

ValidatedInput.displayName = "ValidatedInput";

export { ValidatedInput };
