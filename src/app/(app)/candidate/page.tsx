import Link from "next/link";
import { Briefcase, ScrollText } from "lucide-react";
import { buttonVariants } from "@/components/ui/button-variants";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function CandidateHomePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Browse open roles and track your applications.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Briefcase className="size-5" />
              Browse jobs
            </CardTitle>
            <CardDescription>
              Active listings from employers on Hirevine.
            </CardDescription>
            <Link
              href="/jobs"
              className={cn(
                buttonVariants({ variant: "default" }),
                "mt-2 w-fit no-underline",
              )}
            >
              View jobs
            </Link>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <ScrollText className="size-5" />
              My applications
            </CardTitle>
            <CardDescription>
              Status, screening results, and quizzes in one place.
            </CardDescription>
            <Link
              href="/candidate/applications"
              className={cn(
                buttonVariants({ variant: "outline" }),
                "mt-2 w-fit no-underline",
              )}
            >
              Open applications
            </Link>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
