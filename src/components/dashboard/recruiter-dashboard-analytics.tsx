"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  DashboardStatsStrip,
  DashboardStatsStripSkeleton,
} from "@/components/dashboard/dashboard-stats-strip";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  APPLICATION_STATUS_LABEL,
  jobPostingStatusLabel,
} from "@/lib/applications/candidate-copy";
import { getRecruiterDashboardAnalytics } from "@/lib/services/applications-service";
import type { RecruiterDashboardAnalytics } from "@/types/analytics.types";
import type { ApplicationStatus } from "@/types/applications.types";

function formatDayLabel(isoDate: string) {
  const d = new Date(`${isoDate}T12:00:00.000Z`);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function truncateTitle(title: string, max = 36) {
  const t = title.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1)}…`;
}

const statusChartConfig = {
  count: {
    label: "Applications",
    color: "var(--primary)",
  },
} as const;

const trendChartConfig = {
  count: {
    label: "New applications",
    color: "var(--primary)",
  },
} as const;

const topJobsChartConfig = {
  count: {
    label: "Applications",
    color: "var(--primary)",
  },
} as const;

export function RecruiterDashboardAnalytics() {
  const [data, setData] = useState<RecruiterDashboardAnalytics | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const d = await getRecruiterDashboardAnalytics();
        if (!cancelled) {
          setData(d);
          setError(null);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Could not load analytics");
          setData(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const statusRows = useMemo(() => {
    if (!data) return [];
    return data.applicationsByStatus.map((row) => ({
      status: row.status,
      label: APPLICATION_STATUS_LABEL[row.status as ApplicationStatus],
      count: row.count,
    }));
  }, [data]);

  const trendRows = useMemo(() => {
    if (!data) return [];
    return data.applicationsByDay.map((row) => ({
      ...row,
      label: formatDayLabel(row.date),
    }));
  }, [data]);

  const topJobRows = useMemo(() => {
    if (!data) return [];
    return data.topJobsByApplications.map((row) => ({
      ...row,
      shortTitle: truncateTitle(row.title),
      count: row.count,
    }));
  }, [data]);

  if (loading) {
    return (
      <div className="flex flex-col gap-5">
        <DashboardStatsStripSkeleton columns={3} />
        <div className="grid gap-5 lg:grid-cols-2">
          <Skeleton className="h-48 rounded-xl" />
          <Skeleton className="h-48 rounded-xl" />
          <Skeleton className="h-56 rounded-xl lg:col-span-2" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <p className="text-muted-foreground text-sm" role="alert">
        {error}
      </p>
    );
  }

  if (!data) return null;

  const { totals } = data;

  const statItems = [
    {
      value: totals.applications,
      label: "Total applications",
      hint: "All submissions to jobs in your organization.",
    },
    {
      value: totals.newApplicationsLast7Days,
      label: "New in the last 7 days",
      hint: "Applications started this week (rolling window).",
    },
    {
      value: totals.activeJobs,
      label: "Active job posts",
      hint: "Roles currently open to candidates on the board.",
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      <DashboardStatsStrip items={statItems} />

      {totals.applications === 0 && totals.activeJobs === 0 ? (
        <p className="text-muted-foreground text-sm">
          Publish an active job post, then share it with candidates—analytics
          will fill in as applications arrive.
        </p>
      ) : null}

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Pipeline stage</CardTitle>
            <CardDescription>
              Applications by current status in your organization
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <ChartContainer
              config={statusChartConfig}
              className="aspect-auto h-[220px] w-full"
            >
              <BarChart
                accessibilityLayer
                data={statusRows}
                layout="vertical"
                margin={{ left: 8, right: 12, top: 8, bottom: 8 }}
              >
                <CartesianGrid horizontal={false} />
                <XAxis type="number" allowDecimals={false} />
                <YAxis
                  type="category"
                  dataKey="label"
                  width={108}
                  tickLine={false}
                  axisLine={false}
                  tickMargin={4}
                />
                <ChartTooltip
                  content={<ChartTooltipContent hideLabel />}
                  cursor={false}
                />
                <Bar dataKey="count" fill="var(--color-count)" radius={4} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Applications over time</CardTitle>
            <CardDescription>
              New applications per day (last 30 days, UTC)
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-0 pr-2">
            <ChartContainer
              config={trendChartConfig}
              className="aspect-auto h-[220px] w-full"
            >
              <AreaChart
                accessibilityLayer
                data={trendRows}
                margin={{ left: 0, right: 8, top: 8, bottom: 0 }}
              >
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={6}
                  interval="preserveStartEnd"
                  minTickGap={24}
                />
                <YAxis
                  allowDecimals={false}
                  width={28}
                  tickLine={false}
                  axisLine={false}
                />
                <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                <Area
                  dataKey="count"
                  type="monotone"
                  fill="var(--color-count)"
                  fillOpacity={0.25}
                  stroke="var(--color-count)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Top jobs by volume</CardTitle>
          <CardDescription>
            Jobs with the most applications in your organization
          </CardDescription>
        </CardHeader>
        <CardContent className="pl-2">
          {topJobRows.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              No applications yet—postings will show here once candidates apply.
            </p>
          ) : (
            <ChartContainer
              config={topJobsChartConfig}
              className="aspect-auto h-[min(20rem,44vh)] w-full"
            >
              <BarChart
                accessibilityLayer
                data={topJobRows}
                layout="vertical"
                margin={{ left: 4, right: 12, top: 8, bottom: 8 }}
              >
                <CartesianGrid horizontal={false} />
                <XAxis type="number" allowDecimals={false} />
                <YAxis
                  type="category"
                  dataKey="shortTitle"
                  width={140}
                  tickLine={false}
                  axisLine={false}
                  tickMargin={4}
                />
                <ChartTooltip
                  content={<ChartTooltipContent hideLabel />}
                  cursor={false}
                />
                <Bar dataKey="count" fill="var(--color-count)" radius={4} />
              </BarChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>

      {data.jobsByStatus.some((j) => j.count > 0) ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Job posts by status</CardTitle>
            <CardDescription>Draft, active, paused, or closed</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="text-muted-foreground flex flex-wrap gap-3 text-sm">
              {data.jobsByStatus.map((row) => (
                <li key={row.status}>
                  <span className="text-foreground font-medium tabular-nums">
                    {row.count}
                  </span>{" "}
                  {jobPostingStatusLabel(row.status)}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
