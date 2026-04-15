import { Building2, FolderKanban, Inbox } from "lucide-react";
import { DashboardQuickLinks } from "@/components/dashboard/dashboard-quick-links";
import { RecruiterDashboardAnalytics } from "@/components/dashboard/recruiter-dashboard-analytics";

const recruiterQuickLinks = [
  {
    href: "/recruiter/organization",
    title: "Organization",
    hint: "Employer profile and slug",
    icon: Building2,
  },
  {
    href: "/recruiter/jobs",
    title: "Job posts",
    hint: "Drafts, pipelines, publish",
    icon: FolderKanban,
  },
  {
    href: "/recruiter/applications",
    title: "Applications",
    hint: "Org-wide list and filters",
    icon: Inbox,
  },
] as const;

export default function RecruiterHomePage() {
  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Recruiter</h1>
        <p className="text-muted-foreground mt-1 max-w-2xl text-sm leading-relaxed">
          Manage your organization, job posts, and applications from the sidebar
          or the shortcuts below.
        </p>
      </header>

      <DashboardQuickLinks items={recruiterQuickLinks} />

      <section className="flex flex-col gap-5">
        <div>
          <h2 className="text-muted-foreground mb-2 text-[11px] font-semibold tracking-wide uppercase">
            Analytics
          </h2>
          <p className="text-muted-foreground text-sm">
            Application volume and pipeline mix for your organization.
          </p>
        </div>
        <RecruiterDashboardAnalytics />
      </section>
    </div>
  );
}
