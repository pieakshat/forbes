import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AttendanceRecord {
  id: number;
  token_no: string;
  attendance_date: string;
  status: 'present' | 'absent' | 'leave' | 'half_day' | 'holiday' | 'remote';
  employee?: {
    name: string;
    group: string | null;
    desig: string | null;
    role: string | null;
  };
}

interface Employee {
  token_no: string;
  name: string;
  group: string | null;
  desig: string | null;
  role: string | null;
}

export function GroupSummary() {
  const { toast } = useToast();
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [employees, setEmployees] = useState<Record<string, Employee>>({});
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split("T")[0]);
  const [loading, setLoading] = useState(true);

  // Fetch employees on mount
  useEffect(() => {
    fetchEmployees();
  }, []);

  // Fetch attendance when date changes or employees are loaded
  useEffect(() => {
    if (filterDate && Object.keys(employees).length > 0) {
      fetchAttendance();
    }
  }, [filterDate, employees]);

  const fetchEmployees = async () => {
    try {
      const response = await fetch('/api/employees', {
        cache: 'no-store',
      });
      const data = await response.json();

      if (data.success && data.data) {
        const employeeMap: Record<string, Employee> = {};
        data.data.forEach((emp: Employee) => {
          employeeMap[emp.token_no] = emp;
        });
        setEmployees(employeeMap);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/attendance?date=${filterDate}`, {
        cache: 'no-store',
      });
      const data = await response.json();

      if (data.success && data.data) {
        // Merge attendance with employee data
        const attendanceWithEmployees = data.data.map((record: any) => ({
          ...record,
          employee: employees[record.token_no] ? {
            name: employees[record.token_no].name,
            group: employees[record.token_no].group,
            desig: employees[record.token_no].desig,
            role: employees[record.token_no].role,
          } : undefined,
        }));
        setAttendance(attendanceWithEmployees);
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to fetch attendance",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error fetching attendance:', error);
      toast({
        title: "Error",
        description: "Failed to fetch attendance",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Get unique groups from attendance records that have employee data
  const groups = Array.from(new Set(
    attendance
      .filter(a => a.employee?.group)
      .map(a => a.employee!.group)
  )).sort();

  // Calculate summary by group and employment type (using role as employment type)
  const summary = groups.map(group => {
    const groupRecords = attendance.filter(
      a => a.employee?.group === group &&
        a.status === "present" &&
        a.employee
    );

    return {
      group,
      onRoll: groupRecords.filter(r => r.employee?.role === "On-Roll" || r.employee?.role === "ON ROLL").length,
      contract: groupRecords.filter(r => r.employee?.role === "Contract" || r.employee?.desig === "CONTRACT").length,
      fte: groupRecords.filter(r => r.employee?.role === "FTE").length,
      apprenticeship: groupRecords.filter(r => r.employee?.role === "Apprenticeship" || r.employee?.desig === "APPRENTICE").length,
      total: groupRecords.length,
    };
  });

  // Calculate totals
  const totals = {
    group: "Total",
    onRoll: summary.reduce((sum, s) => sum + s.onRoll, 0),
    contract: summary.reduce((sum, s) => sum + s.contract, 0),
    fte: summary.reduce((sum, s) => sum + s.fte, 0),
    apprenticeship: summary.reduce((sum, s) => sum + s.apprenticeship, 0),
    total: summary.reduce((sum, s) => sum + s.total, 0),
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Group Summary Report</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="space-y-2">
            <Label htmlFor="summary-date">Select Date</Label>
            <Input
              id="summary-date"
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              max={new Date().toISOString().split("T")[0]}
              className="w-auto"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Loading summary...</span>
          </div>
        ) : (
          <>
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-bold">Group</TableHead>
                    <TableHead className="text-right">On-Roll</TableHead>
                    <TableHead className="text-right">Contract</TableHead>
                    <TableHead className="text-right">FTE</TableHead>
                    <TableHead className="text-right">Apprenticeship</TableHead>
                    <TableHead className="text-right font-bold">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {summary.map((row) => (
                    <TableRow key={row.group}>
                      <TableCell className="font-medium">{row.group}</TableCell>
                      <TableCell className="text-right">{row.onRoll}</TableCell>
                      <TableCell className="text-right">{row.contract}</TableCell>
                      <TableCell className="text-right">{row.fte}</TableCell>
                      <TableCell className="text-right">{row.apprenticeship}</TableCell>
                      <TableCell className="text-right font-bold">{row.total}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="bg-muted font-bold">
                    <TableCell>{totals.group}</TableCell>
                    <TableCell className="text-right">{totals.onRoll}</TableCell>
                    <TableCell className="text-right">{totals.contract}</TableCell>
                    <TableCell className="text-right">{totals.fte}</TableCell>
                    <TableCell className="text-right">{totals.apprenticeship}</TableCell>
                    <TableCell className="text-right">{totals.total}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              * Summary shows only employees marked as Present
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}
