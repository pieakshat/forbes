import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Calendar, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AttendanceRecord {
  id: number;
  token_no: string;
  attendance_date: string;
  status: 'present' | 'absent' | 'leave' | 'half_day' | 'holiday';
  employee?: {
    name: string;
    group: string | null;
    desig: string | null;
  };
}

interface AttendanceTableProps {
  refreshTrigger?: number;
}

export function AttendanceTable({ refreshTrigger }: AttendanceTableProps) {
  const { toast } = useToast();
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [employees, setEmployees] = useState<Record<string, { name: string; group: string | null; desig: string | null }>>({});
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split("T")[0]);
  const [loading, setLoading] = useState(true);

  // Fetch employees on mount
  useEffect(() => {
    fetchEmployees();
  }, []);

  // Fetch attendance when date changes or refreshTrigger updates
  useEffect(() => {
    if (filterDate) {
      fetchAttendance();
    }
  }, [filterDate, refreshTrigger]);

  const fetchEmployees = async () => {
    try {
      const response = await fetch('/api/employees');
      const data = await response.json();

      if (data.success && data.data) {
        const employeeMap: Record<string, { name: string; group: string | null; desig: string | null }> = {};
        data.data.forEach((emp: any) => {
          employeeMap[emp.token_no] = {
            name: emp.name,
            group: emp.group,
            desig: emp.desig,
          };
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
      const response = await fetch(`/api/attendance?date=${filterDate}`);
      const data = await response.json();

      if (data.success && data.data) {
        setAttendance(data.data);
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
        description: "Failed to fetch attendance records",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "present":
        return <Badge className="bg-green-500 hover:bg-green-600">Present</Badge>;
      case "absent":
        return <Badge variant="destructive">Absent</Badge>;
      case "leave":
        return <Badge variant="secondary">Leave</Badge>;
      case "half_day":
        return <Badge variant="outline">Half Day</Badge>;
      case "holiday":
        return <Badge className="bg-blue-500 hover:bg-blue-600">Holiday</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Attendance Records</span>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <Label htmlFor="filter-date" className="sr-only">Filter by Date</Label>
            <Input
              id="filter-date"
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="w-48"
            />
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Token</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Group</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto text-muted-foreground" />
                  </TableCell>
                </TableRow>
              ) : attendance.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    No attendance records found for the selected date
                  </TableCell>
                </TableRow>
              ) : (
                attendance.map((record) => {
                  const employee = employees[record.token_no];
                  return (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium">{record.token_no}</TableCell>
                      <TableCell>{employee?.name || 'Unknown'}</TableCell>
                      <TableCell>{employee?.desig || '-'}</TableCell>
                      <TableCell>-</TableCell>
                      <TableCell>{employee?.group || '-'}</TableCell>
                      <TableCell>{getStatusBadge(record.status)}</TableCell>
                      <TableCell>{new Date(record.attendance_date).toLocaleDateString()}</TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
