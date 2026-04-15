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
import { APPLICATION_STATUS_LABEL } from "@/lib/applications/candidate-copy";
import { getCandidateDashboardAnalytics } from "@/lib/services/applications-service";
import type { CandidateDashboardAnalytics } from "@/types/analytics.types";
import type { ApplicationStatus } from "@/types/applications.types";

function formatDayLabel(isoDate: string) {
  const d = new Date(`${isoDate}T12:00:00.000Z`);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

const statusChartConfig = {
  count: {
    label: "Applications",
    color: "var(--primary)",
  },
} as const;

const trendChartConfig = {
  count: {
    label: "Started",
    color: "var(--primary)",
  },
} as const;

export function CandidateDashboardAnalytics() {
  const [data, setData] = useState<CandidateDashboardAnalytics | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const d = await getCandidateDashboardAnalytics();
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

  if (loading) {
    return (
      <div className="flex flex-col gap-5">
        <DashboardStatsStripSkeleton columns={1} />
        <div className="grid gap-5 lg:grid-cols-2">
          <Skeleton className="h-48 rounded-xl" />
          <Skeleton className="h-48 rounded-xl" />
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

  return (
    <div className="flex flex-col gap-5">
      <DashboardStatsStrip
        className="max-w-xl"
        items={[
          {
            value: totals.applications,
            label: "Your applications",
            hint: "Roles you have applied to through Hirevine.",
          },
        ]}
      />

      {totals.applications === 0 ? (
        <p className="text-muted-foreground text-sm">
          Apply to a job from the board—your pipeline progress will show here.
        </p>
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Where you stand</CardTitle>
              <CardDescription>
                Applications by current stage for your account
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
              <CardTitle className="text-base">Activity over time</CardTitle>
              <CardDescription>
                Applications started per day (last 30 days, UTC)
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
      )}
    </div>
  );
}
