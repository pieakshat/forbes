'use client';

import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmployeeForm } from "@/components/groupleader/EmployeeForm";
import { AttendanceForm } from "@/components/groupleader/AttendanceForm";
import { AttendanceTable } from "@/components/groupleader/AttendanceTable";
import { GroupSummary } from "@/components/groupleader/GroupSummary";

export default function GroupLeaderPanel() {
  const [activeTab, setActiveTab] = useState("attendance");
  const [employeeRefreshKey, setEmployeeRefreshKey] = useState(0);

  // Trigger refresh when employees tab becomes active
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    if (value === "employees") {
      // Increment refresh key to force EmployeeForm to refetch
      setEmployeeRefreshKey(prev => prev + 1);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Group Leader Panel</h1>
          <p className="text-muted-foreground mt-2">Manage employees and track daily attendance</p>
        </div>

        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-muted">
            <TabsTrigger value="attendance">Mark Attendance</TabsTrigger>
            <TabsTrigger value="view">View Attendance</TabsTrigger>
            <TabsTrigger value="employees">Manage Employees</TabsTrigger>
            <TabsTrigger value="summary">Summary Report</TabsTrigger>
          </TabsList>

          <TabsContent value="attendance" className="space-y-4">
            <AttendanceForm
              onAttendanceUpdate={() => {
                // Refresh attendance table if needed
                // You can add fetch logic here if needed
              }}
            />
          </TabsContent>

          <TabsContent value="view">
            <AttendanceTable />
          </TabsContent>

          <TabsContent value="employees">
            <Card>
              <CardHeader>
                <CardTitle>Employee Management</CardTitle>
              </CardHeader>
              <CardContent>
                <EmployeeForm
                  key={`employee-form-${employeeRefreshKey}`}
                  refreshTrigger={employeeRefreshKey}
                  onEmployeeUpdate={() => {
                    // Refresh attendance form when employees are updated
                  }}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="summary">
            <GroupSummary />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
