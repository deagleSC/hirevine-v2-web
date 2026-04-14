import Link from "next/link";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";

export default function NotFound() {
  return (
    <div className="bg-background flex min-h-screen flex-col items-center justify-center gap-4 p-6">
      <h1 className="text-xl font-semibold">Page not found</h1>
      <p className="text-muted-foreground text-sm">
        The page you requested does not exist.
      </p>
      <Link
        href="/"
        className={cn(buttonVariants({ variant: "default" }), "no-underline")}
      >
        Home
      </Link>
    </div>
  );
}
