import Link from "next/link";
import { Briefcase, Building2, FolderKanban, Inbox } from "lucide-react";
import { buttonVariants } from "@/components/ui/button-variants";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

const cards = [
  {
    title: "Organization",
    description: "Create your employer org or review name and slug.",
    href: "/recruiter/organization",
    icon: Building2,
  },
  {
    title: "Job posts",
    description:
      "Draft roles, publish to the board, generate hiring pipelines.",
    href: "/recruiter/jobs",
    icon: FolderKanban,
  },
  {
    title: "Applications",
    description: "Org-wide applicant list with filters and pipeline detail.",
    href: "/recruiter/applications",
    icon: Inbox,
  },
  {
    title: "Public job board",
    description: "Preview how candidates see active listings.",
    href: "/jobs",
    icon: Briefcase,
  },
] as const;

export default function RecruiterHomePage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Recruiter</h1>
        <p className="text-muted-foreground mt-1 max-w-2xl text-sm leading-relaxed">
          Manage your organization, job posts, and applications from the
          sidebar, or jump in below.
        </p>
      </div>
      <ul className="grid gap-4 sm:grid-cols-2">
        {cards.map(({ title, description, href, icon: Icon }) => (
          <li key={href}>
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Icon className="size-5" />
                  {title}
                </CardTitle>
                <CardDescription className="leading-relaxed">
                  {description}
                </CardDescription>
                <Link
                  href={href}
                  className={cn(
                    buttonVariants({ variant: "outline" }),
                    "mt-2 w-fit no-underline",
                  )}
                >
                  Open
                </Link>
              </CardHeader>
            </Card>
          </li>
        ))}
      </ul>
    </div>
  );
}
