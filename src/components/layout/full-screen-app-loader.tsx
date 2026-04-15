import { Loader2 } from "lucide-react";
import { HirevineMark } from "@/components/brand/hirevine-mark";

/** Full-viewport loader for `/` and matching bootstrap states in `AuthProvider`. */
export function FullScreenAppLoader() {
  return (
    <div className="bg-background fixed inset-0 z-50 flex flex-col items-center justify-center gap-6">
      <HirevineMark size={72} priority />
      <Loader2
        className="text-muted-foreground size-9 animate-spin"
        aria-hidden
      />
      <p className="text-muted-foreground sr-only">Loading</p>
    </div>
  );
}
