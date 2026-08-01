"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Car,
  Users,
  Wallet,
  Activity,
  Radio,
  TrendingUp,
} from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { adminApi, AdminOverview, OnlineDriver, TrendPoint } from "@/lib/api/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

const chartConfig = {
  rides: {
    label: "Rides",
    color: "var(--primary)",
  },
  revenue: {
    label: "Revenue (₹)",
    color: "#10b981",
  },
} satisfies ChartConfig;

function StatCard({
  label,
  value,
  icon: Icon,
  sub,
  accent,
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  sub?: string;
  accent?: string;
}) {
  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardContent className="flex items-center gap-3 p-4">
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white"
          style={{ backgroundColor: accent ?? "var(--primary)" }}
        >
          <Icon className="size-5" />
        </div>
        <div className="min-w-0">
          <div className="truncate text-xs font-medium text-muted-foreground">
            {label}
          </div>
          <div className="text-2xl font-bold leading-tight">{value}</div>
          {sub ? (
            <div className="text-xs text-muted-foreground">{sub}</div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminDashboardPage() {
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [trend, setTrend] = useState<TrendPoint[]>([]);
  const [online, setOnline] = useState<{ items: OnlineDriver[]; total: number } | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const [o, t, ol] = await Promise.all([
        adminApi.overview(),
        adminApi.trend(7),
        adminApi.onlineDrivers(),
      ]);
      setOverview(o.data);
      setTrend(t.data);
      setOnline(ol.data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const id = setTimeout(() => void load(), 0);
    return () => clearTimeout(id);
  }, [load]);

  if (loading || !overview) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28 rounded-xl bg-muted-foreground/20" />
          ))}
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          <Skeleton className="h-64 rounded-xl bg-muted-foreground/20 md:col-span-2" />
          <Skeleton className="h-64 rounded-xl bg-muted-foreground/20" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Platform overview</p>
        </div>
        <Badge
          variant="secondary"
          className={overview.driversOnline > 0 ? "bg-emerald-500 text-white" : ""}
        >
          <Radio className="mr-1 size-3" />
          {overview.driversOnline} online
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="Total Drivers" value={overview.totalDrivers} icon={Car} accent="#2563eb" />
        <StatCard label="Total Riders" value={overview.totalRiders} icon={Users} accent="#8b5cf6" />
        <StatCard label="Rides Today" value={overview.ridesToday} icon={Activity} sub="completed" accent="#f59e0b" />
        <StatCard label="Revenue Today" value={`₹${overview.revenueToday}`} icon={Wallet} accent="#10b981" />
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="size-4" /> Last 7 days
            </CardTitle>
            <Badge variant="secondary">rides &amp; revenue</Badge>
          </CardHeader>
          <CardContent>
            {trend.length ? (
              <ChartContainer config={chartConfig} className="h-[220px] w-full">
                <AreaChart data={trend} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
                  <defs>
                    <linearGradient id="fillRides" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-rides)" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="var(--color-rides)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-revenue)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="var(--color-revenue)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tickFormatter={(v) => v.slice(5)}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area
                    dataKey="rides"
                    type="natural"
                    fill="url(#fillRides)"
                    stroke="var(--color-rides)"
                    strokeWidth={2}
                  />
                  <Area
                    dataKey="revenue"
                    type="natural"
                    fill="url(#fillRevenue)"
                    stroke="var(--color-revenue)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ChartContainer>
            ) : (
              <p className="py-10 text-center text-sm text-muted-foreground">
                No data yet
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="flex items-center gap-2 text-base">
              <Radio className="size-4" /> Online Now
            </CardTitle>
            <Badge className={overview.driversOnline > 0 ? "bg-emerald-500 text-white" : "bg-muted"}>
              {overview.driversOnline}
            </Badge>
          </CardHeader>
          <CardContent className="space-y-2">
            {online?.items.length ? (
              online.items.map((d) => (
                <div
                  key={d.sessionId}
                  className="flex items-center justify-between rounded-lg border p-2.5 text-sm"
                >
                  <div className="min-w-0">
                    <div className="truncate font-medium">
                      {d.name ?? d.phone}
                    </div>
                    <div className="truncate text-xs text-muted-foreground">
                      {d.vehicleNumber} · {d.destination}
                    </div>
                  </div>
                  <Badge variant={d.status === "STARTED" ? "default" : "secondary"}>
                    {d.status}
                  </Badge>
                </div>
              ))
            ) : (
              <p className="py-6 text-center text-sm text-muted-foreground">
                No drivers online
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
