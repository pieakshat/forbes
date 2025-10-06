import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmployeeForm } from "@/components/groupleader/EmployeeForm";
import { AttendanceForm } from "@/components/groupleader/AttendanceForm";
import { AttendanceTable } from "@/components/groupleader/AttendanceTable";
import { GroupSummary } from "@/components/groupleader/GroupSummary";

export interface Employee {
  id: string;
  name: string;
  tokenNumber: string;
  designation: string;
  employmentType: "On-Roll" | "Contract" | "FTE" | "Apprenticeship";
  group: string;
}

export interface AttendanceRecord {
  id: string;
  tokenNumber: string;
  employeeName: string;
  date: string;
  status: "Present" | "Absent" | "Leave";
  group: string;
  designation: string;
  employmentType: string;
}

const initialEmployees: Employee[] = [
  { id: "1", name: "Rajesh Kumar", tokenNumber: "101", designation: "Packer", employmentType: "Contract", group: "G1" },
  { id: "2", name: "Priya Singh", tokenNumber: "102", designation: "Loader", employmentType: "On-Roll", group: "G1" },
  { id: "3", name: "Amit Sharma", tokenNumber: "103", designation: "Supervisor", employmentType: "FTE", group: "G1" },
  { id: "4", name: "Sneha Patel", tokenNumber: "104", designation: "Packer", employmentType: "Apprenticeship", group: "G1" },
  { id: "5", name: "Ravi Gupta", tokenNumber: "105", designation: "Loader", employmentType: "Contract", group: "G2" },
  { id: "6", name: "Kavita Reddy", tokenNumber: "106", designation: "Packer", employmentType: "On-Roll", group: "G2" },
  { id: "7", name: "Suresh Yadav", tokenNumber: "107", designation: "Supervisor", employmentType: "FTE", group: "G2" },
  { id: "8", name: "Meera Joshi", tokenNumber: "108", designation: "Packer", employmentType: "Contract", group: "G3" },
];

const today = new Date().toISOString().split("T")[0];

const initialAttendance: AttendanceRecord[] = [
  { id: "1", tokenNumber: "101", employeeName: "Rajesh Kumar", date: today, status: "Present", group: "G1", designation: "Packer", employmentType: "Contract" },
  { id: "2", tokenNumber: "102", employeeName: "Priya Singh", date: today, status: "Present", group: "G1", designation: "Loader", employmentType: "On-Roll" },
  { id: "3", tokenNumber: "103", employeeName: "Amit Sharma", date: today, status: "Absent", group: "G1", designation: "Supervisor", employmentType: "FTE" },
  { id: "4", tokenNumber: "104", employeeName: "Sneha Patel", date: today, status: "Present", group: "G1", designation: "Packer", employmentType: "Apprenticeship" },
  { id: "5", tokenNumber: "105", employeeName: "Ravi Gupta", date: today, status: "Leave", group: "G2", designation: "Loader", employmentType: "Contract" },
  { id: "6", tokenNumber: "106", employeeName: "Kavita Reddy", date: today, status: "Present", group: "G2", designation: "Packer", employmentType: "On-Roll" },
];

export default function GroupLeaderPanel() {
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(initialAttendance);

  const addEmployee = (employee: Employee) => {
    setEmployees([...employees, employee]);
  };

  const updateEmployee = (updatedEmployee: Employee) => {
    setEmployees(employees.map(emp => emp.id === updatedEmployee.id ? updatedEmployee : emp));
  };

  const deleteEmployee = (id: string) => {
    setEmployees(employees.filter(emp => emp.id !== id));
  };

  const addAttendance = (record: AttendanceRecord) => {
    setAttendance([...attendance, record]);
  };

  const bulkAddAttendance = (records: AttendanceRecord[]) => {
    setAttendance([...attendance, ...records]);
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Group Leader Panel</h1>
          <p className="text-muted-foreground mt-2">Manage employees and track daily attendance</p>
        </div>

        <Tabs defaultValue="attendance" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-muted">
            <TabsTrigger value="attendance">Mark Attendance</TabsTrigger>
            <TabsTrigger value="view">View Attendance</TabsTrigger>
            <TabsTrigger value="employees">Manage Employees</TabsTrigger>
            <TabsTrigger value="summary">Summary Report</TabsTrigger>
          </TabsList>

          <TabsContent value="attendance" className="space-y-4">
            <AttendanceForm 
              employees={employees}
              onAddAttendance={addAttendance}
              onBulkAddAttendance={bulkAddAttendance}
            />
          </TabsContent>

          <TabsContent value="view">
            <AttendanceTable attendance={attendance} />
          </TabsContent>

          <TabsContent value="employees">
            <Card>
              <CardHeader>
                <CardTitle>Employee Management</CardTitle>
              </CardHeader>
              <CardContent>
                <EmployeeForm 
                  employees={employees}
                  onAddEmployee={addEmployee}
                  onUpdateEmployee={updateEmployee}
                  onDeleteEmployee={deleteEmployee}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="summary">
            <GroupSummary attendance={attendance} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
