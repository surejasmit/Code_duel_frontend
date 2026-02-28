import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getErrorMessage(error: unknown): string {
  if (error && typeof error === "object" && "response" in error) {
    const errorObj = error as Record<string, unknown>;
    const response = errorObj.response;
    if (response && typeof response === "object" && "data" in response) {
      const data = (response as Record<string, unknown>).data;
      if (data && typeof data === "object" && "message" in data) {
        const message = (data as Record<string, unknown>).message;
        if (typeof message === "string") return message;
      }
    }
  }
  return error instanceof Error ? error.message : "An unexpected error occurred.";
}
