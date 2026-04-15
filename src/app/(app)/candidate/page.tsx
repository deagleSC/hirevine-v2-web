import { ScrollText, Search } from "lucide-react";
import { CandidateDashboardAnalytics } from "@/components/dashboard/candidate-dashboard-analytics";
import { DashboardQuickLinks } from "@/components/dashboard/dashboard-quick-links";

const candidateQuickLinks = [
  {
    href: "/jobs",
    title: "Browse jobs",
    hint: "Active postings you can apply to",
    icon: Search,
  },
  {
    href: "/candidate/applications",
    title: "My applications",
    hint: "Status, quiz, and results",
    icon: ScrollText,
  },
] as const;

export default function CandidateHomePage() {
  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Track your applications and next steps.
        </p>
      </header>

      <DashboardQuickLinks items={candidateQuickLinks} />

      <section className="flex flex-col gap-5">
        <div>
          <h2 className="text-muted-foreground mb-2 text-[11px] font-semibold tracking-wide uppercase">
            Analytics
          </h2>
          <p className="text-muted-foreground text-sm">
            How your applications are distributed across the hiring pipeline.
          </p>
        </div>
        <CandidateDashboardAnalytics />
      </section>
    </div>
  );
}
