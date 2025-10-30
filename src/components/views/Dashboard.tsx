'use client';

import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { HierarchySelector, HierarchySelection } from "@/components/navigation/HierarchySelector";
import { DataTable, mockTableData } from "@/components/dashboard/DataTable";
import { PerformanceChart, mockChartData } from "@/components/dashboard/PerformanceChart";
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
  AlertTriangle
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const Dashboard = () => {
  const [selectedHierarchy, setSelectedHierarchy] = useState<HierarchySelection | null>(null);
  const { user } = useAuth();

  const handleHierarchyChange = (selection: HierarchySelection) => {
    setSelectedHierarchy(selection);
  };

  // Mock KPI data
  const kpiData = [
    {
      title: "Overall Completion",
      value: "94.2%",
      change: "+2.3%",
      trend: "up",
      icon: Target,
      color: "text-success"
    },
    {
      title: "Active Plants",
      value: "15",
      change: "+1",
      trend: "up",
      icon: Factory,
      color: "text-primary"
    },
    {
      title: "Total Workforce",
      value: "5,565",
      change: "+125",
      trend: "up",
      icon: Users,
      color: "text-primary"
    },
    {
      title: "Avg. Absenteeism",
      value: "9.7%",
      change: "-0.8%",
      trend: "down",
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
            <TabsTrigger value="reports" disabled={user?.role !== 'manager'}>
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
                        <p className="text-sm text-muted-foreground">City</p>
                        <p className="font-semibold">{selectedHierarchy.city}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Area</p>
                        <p className="font-semibold">{selectedHierarchy.area}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Plant</p>
                        <p className="font-semibold">{selectedHierarchy.plant}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Product</p>
                        <p className="font-semibold">{selectedHierarchy.product}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Data Tables and Charts */}
                <DataTable
                  title={`${selectedHierarchy.plant} - ${selectedHierarchy.product} - August 2025`}
                  data={mockTableData}
                />

                <PerformanceChart
                  title={`${selectedHierarchy.product} Total - September 2025`}
                  data={mockChartData}
                  type="combo"
                />
              </>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <Activity className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Select Hierarchy</h3>
                  <p className="text-muted-foreground">
                    Please select City → Area → Plant → Product to view detailed data
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            {user?.role === 'manager' ? (
              <ReportUpload onUploadComplete={(files) => console.log('Upload complete:', files)} />
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <AlertTriangle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Access Restricted</h3>
                  <p className="text-muted-foreground">
                    Only Managers can upload reports. Please contact your administrator.
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
                    data={mockChartData.slice(0, 12)}
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
                    {[
                      { plant: "Plant A1", efficiency: 96.2, change: "+1.2%" },
                      { plant: "Plant A2", efficiency: 94.8, change: "+0.8%" },
                      { plant: "Plant B1", efficiency: 93.5, change: "-0.3%" },
                      { plant: "Plant H1", efficiency: 95.1, change: "+2.1%" }
                    ].map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{item.plant}</p>
                          <p className="text-sm text-muted-foreground">{item.efficiency}% Efficient</p>
                        </div>
                        <Badge
                          variant={item.change.startsWith('+') ? 'default' : 'destructive'}
                          className="bg-success text-success-foreground"
                        >
                          {item.change}
                        </Badge>
                      </div>
                    ))}
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