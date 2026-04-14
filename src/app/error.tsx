"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="bg-background flex min-h-screen flex-col items-center justify-center gap-4 p-6">
      <h1 className="text-xl font-semibold">Something went wrong</h1>
      <p className="text-muted-foreground max-w-md text-center text-sm">
        {error.message || "An unexpected error occurred."}
      </p>
      <Button type="button" onClick={() => reset()}>
        Try again
      </Button>
    </div>
  );
}
