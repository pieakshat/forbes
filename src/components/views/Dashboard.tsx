'use client';

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { HierarchySelector, HierarchySelection } from "@/components/navigation/HierarchySelector";
import { DataTable, TableData } from "@/components/dashboard/DataTable";
import { PerformanceChart, ChartData } from "@/components/dashboard/PerformanceChart";
import { ReportUpload } from "@/components/reports/ReportUpload";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Users,
  Factory,
  Target,
  Clock,
  AlertTriangle,
  Loader2
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import type { DashboardMeta, DashboardMetricsResult, DashboardSummary } from "@/types/dashboard";

const Dashboard = () => {
  const [selectedHierarchy, setSelectedHierarchy] = useState<HierarchySelection | null>(null);
  const [tableData, setTableData] = useState<TableData | null>(null);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [meta, setMeta] = useState<DashboardMeta | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aggregatedSummary, setAggregatedSummary] = useState<DashboardSummary | null>(null);
  const [activeGroupsCount, setActiveGroupsCount] = useState<number | null>(null);
  const [isLoadingAggregated, setIsLoadingAggregated] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  // Redirect admin from /dashboard to /group-leader, but only if they didn't intentionally navigate here
  useEffect(() => {
    if (user?.role === 'admin') {
      const hasIntentionalAccess = typeof window !== 'undefined' &&
        sessionStorage.getItem('admin_dashboard_access') === 'true';

      if (!hasIntentionalAccess) {
        // Admin landed here directly (not via button), redirect them
        router.push('/group-leader');
      } else {
        // Admin intentionally navigated here, clear the flag so it doesn't persist
        sessionStorage.removeItem('admin_dashboard_access');
      }
    }
  }, [user, router]);

  const handleHierarchyChange = (selection: HierarchySelection) => {
    setSelectedHierarchy(selection);
  };

  // Fetch aggregated metrics for all groups (for KPI cards)
  useEffect(() => {
    const controller = new AbortController();
    const fetchAggregatedMetrics = async () => {
      try {
        setIsLoadingAggregated(true);

        const now = new Date();
        const monthValue = now.getMonth() + 1;
        const yearValue = now.getFullYear();

        const params = new URLSearchParams({
          month: monthValue.toString(),
          year: yearValue.toString()
        });

        const response = await fetch(`/api/dashboard/metrics/all?${params.toString()}`, {
          method: "GET",
          signal: controller.signal
        });

        const payload = await response.json().catch(() => ({}));

        if (!response.ok || !payload?.success) {
          throw new Error(payload?.error || "Failed to fetch aggregated metrics");
        }

        const data = payload.data;
        setAggregatedSummary(data.summary);
        setActiveGroupsCount(data.activeGroupsCount ?? null);
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") {
          return;
        }
        console.error("Failed to fetch aggregated metrics:", err);
        setAggregatedSummary(null);
        setActiveGroupsCount(null);
      } finally {
        setIsLoadingAggregated(false);
      }
    };

    fetchAggregatedMetrics();

    return () => {
      controller.abort();
    };
  }, []);

  // Fetch group-specific metrics when a group is selected
  useEffect(() => {
    if (!selectedHierarchy?.group) {
      setTableData(null);
      setChartData([]);
      setSummary(null);
      setMeta(null);
      setError(null);
      setIsLoading(false);
      return;
    }

    const controller = new AbortController();
    const fetchMetrics = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const now = new Date();
        const monthValue = selectedHierarchy.month ?? now.getMonth() + 1;
        const yearValue = selectedHierarchy.year ?? now.getFullYear();

        const params = new URLSearchParams({
          group: selectedHierarchy.group,
          month: monthValue.toString(),
          year: yearValue.toString()
        });

        const response = await fetch(`/api/dashboard/metrics?${params.toString()}`, {
          method: "GET",
          signal: controller.signal
        });

        const payload = await response.json().catch(() => ({}));

        if (!response.ok || !payload?.success) {
          throw new Error(payload?.error || "Failed to fetch dashboard metrics");
        }

        const data: DashboardMetricsResult = payload.data;

        setTableData({
          headers: data.table.headers,
          rows: data.table.rows.map(row => ({
            label: row.label,
            values: row.values,
            total: row.total,
            average: row.average
          }))
        });

        setChartData(data.chart);
        setSummary(data.summary);
        setMeta(data.meta);
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") {
          return;
        }
        const message = err instanceof Error ? err.message : "Unable to load dashboard metrics";
        setError(message);
        setTableData(null);
        setChartData([]);
        setSummary(null);
        setMeta(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMetrics();

    return () => {
      controller.abort();
    };
  }, [selectedHierarchy]);

  // KPI cards always show aggregated data (all groups)
  // Group-specific data is only used for detailed tables/charts
  const kpiSummary = aggregatedSummary;

  const overallCompletion = kpiSummary?.capacityUtilizationAverage ?? null;
  const fgCompletionAverage = kpiSummary?.indexedFgCompletionAverage ?? null;
  const manpowerAverage = kpiSummary?.manpowerAverage ?? null;
  const absenteeismAverage = kpiSummary?.absenteeismAverage ?? null;

  const selectedPeriodLabel = selectedHierarchy
    ? new Date(
      selectedHierarchy.year,
      selectedHierarchy.month - 1,
      1
    ).toLocaleString("default", { month: "long", year: "numeric" })
    : null;

  const kpiData = [
    {
      title: "Overall Completion",
      value: overallCompletion !== null ? `${overallCompletion.toFixed(1)}%` : "—",
      change: fgCompletionAverage !== null ? `${fgCompletionAverage.toFixed(1)}% FG Index` : "—",
      trend: overallCompletion !== null && overallCompletion < 95 ? "down" : "up",
      icon: Target,
      color: "text-success"
    },
    {
      title: "Active Groups",
      value: activeGroupsCount !== null ? activeGroupsCount.toString() : "—",
      change: "—",
      trend: "up",
      icon: Factory,
      color: "text-primary"
    },
    {
      title: "Total Workforce",
      value: manpowerAverage !== null ? Math.round(manpowerAverage).toLocaleString() : "—",
      change: kpiSummary ? `${Math.round(kpiSummary.manpowerTotal).toLocaleString()} monthly` : "—",
      trend: "up",
      icon: Users,
      color: "text-primary"
    },
    {
      title: "Avg. Absenteeism",
      value: absenteeismAverage !== null ? `${absenteeismAverage.toFixed(1)}%` : "—",
      change: kpiSummary ? "Monthly avg" : "—",
      trend: absenteeismAverage !== null && absenteeismAverage > 10 ? "down" : "up",
      icon: AlertTriangle,
      color: "text-warning"
    }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Work Order Dashboard</h1>
            <p className="text-muted-foreground">
              Monitor daily progress across all plants and products
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="px-3 py-1">
              <Clock className="w-4 h-4 mr-1" />
              Last Updated: {new Date().toLocaleTimeString()}
            </Badge>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {kpiData.map((kpi, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">
                      {kpi.title}
                    </p>
                    <div className="flex items-center space-x-2">
                      <p className="text-2xl font-bold">{kpi.value}</p>
                      <div className={`flex items-center space-x-1 ${kpi.trend === 'up' ? 'text-success' : 'text-destructive'
                        }`}>
                        {kpi.trend === 'up' ? (
                          <TrendingUp className="w-4 h-4" />
                        ) : (
                          <TrendingDown className="w-4 h-4" />
                        )}
                        <span className="text-sm font-medium">{kpi.change}</span>
                      </div>
                    </div>
                  </div>
                  <div className={`p-3 rounded-full bg-muted ${kpi.color}`}>
                    <kpi.icon className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Hierarchy Selection */}
        <HierarchySelector onSelectionChange={handleHierarchyChange} />

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="reports" disabled={user?.role !== 'manager' && user?.role !== 'admin'}>
              Upload Reports
            </TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {selectedHierarchy ? (
              <>
                {/* Current Selection Info */}
                <Card>
                  <CardHeader>
                    <CardTitle>Current Selection</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Group</p>
                        <p className="font-semibold">{selectedHierarchy.group}</p>
                      </div>
                      {meta && (
                        <div>
                          <p className="text-sm text-muted-foreground">Period</p>
                          <p className="font-semibold">{meta.label}</p>
                        </div>
                      )}
                      {!meta && selectedPeriodLabel && (
                        <div>
                          <p className="text-sm text-muted-foreground">Period</p>
                          <p className="font-semibold">{selectedPeriodLabel}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Data Tables and Charts */}
                {isLoading && (
                  <Card>
                    <CardContent className="p-12 text-center space-y-4">
                      <Loader2 className="w-10 h-10 mx-auto animate-spin text-muted-foreground" />
                      <div>
                        <h3 className="text-lg font-semibold">Loading metrics…</h3>
                        <p className="text-sm text-muted-foreground">
                          Gathering attendance and production data for {selectedHierarchy.group}.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {!isLoading && error && (
                  <Card>
                    <CardContent className="p-12 text-center space-y-4">
                      <AlertTriangle className="w-10 h-10 mx-auto text-destructive" />
                      <div>
                        <h3 className="text-lg font-semibold">Unable to load data</h3>
                        <p className="text-sm text-muted-foreground">{error}</p>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {!isLoading && !error && tableData && chartData.length > 0 && (
                  <>
                    <DataTable
                      title={`${selectedHierarchy.group} - ${meta?.label ?? selectedPeriodLabel ?? 'Current Period'}`}
                      data={tableData}
                    />
                    <PerformanceChart
                      title={`${selectedHierarchy.group} Total - ${meta?.label ?? selectedPeriodLabel ?? 'Current Period'}`}
                      data={chartData}
                      type="combo"
                    />
                  </>
                )}

                {!isLoading && !error && (!tableData || chartData.length === 0) && (
                  <Card>
                    <CardContent className="p-12 text-center space-y-4">
                      <AlertTriangle className="w-10 h-10 mx-auto text-muted-foreground" />
                      <div>
                        <h3 className="text-lg font-semibold">No data available</h3>
                        <p className="text-sm text-muted-foreground">
                          We were unable to find dashboard data for {selectedHierarchy.group}. Try selecting a different period or upload new reports.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <Activity className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Select Group</h3>
                  <p className="text-muted-foreground">
                    Please select a group to view detailed data
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            {user?.role === 'manager' || user?.role === 'admin' ? (
              <ReportUpload onUploadComplete={(files) => console.log('Upload complete:', files)} />
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <AlertTriangle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Access Restricted</h3>
                  <p className="text-muted-foreground">
                    Only Managers and Admins can upload reports. Please contact your administrator.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Performance Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <PerformanceChart
                    title="Monthly Comparison"
                    data={(chartData).slice(0, 12)}
                    type="line"
                    showLegend={false}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Plant Efficiency</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {chartData.length > 0 ? (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">
                          Select a group to view plant efficiency data
                        </p>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">
                          No efficiency data available. Please select a group to view metrics.
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;