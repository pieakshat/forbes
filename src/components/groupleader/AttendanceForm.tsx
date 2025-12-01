import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { UserCheck, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Employee {
  token_no: string;
  name: string;
  group: string | null;
  desig: string | null;
  role: string | null;
  employment_start_date: string | null;
  employment_end_date: string | null;
}

interface AttendanceFormProps {
  onAttendanceUpdate?: () => void;
}

type AttendanceStatus = 'present' | 'absent' | 'leave' | 'half_day' | 'holiday';

export function AttendanceForm({ onAttendanceUpdate }: AttendanceFormProps) {
  const { toast } = useToast();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [attendanceStatuses, setAttendanceStatuses] = useState<Record<string, AttendanceStatus>>({});
  const [attendanceGroups, setAttendanceGroups] = useState<Record<string, string>>({});
  const [availableGroups, setAvailableGroups] = useState<string[]>([]);
  const [existingAttendance, setExistingAttendance] = useState<Record<string, AttendanceStatus>>({});

  // Fetch employees on component mount
  useEffect(() => {
    fetchEmployees();
  }, []);

  // Fetch existing attendance when date changes
  useEffect(() => {
    if (date && employees.length > 0) {
      fetchExistingAttendance();
    }
  }, [date, employees.length]);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/employees', {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
        },
      });
      const data = await response.json();
      console.log('AttendanceForm - Employees fetched:', data.data);

      if (data.success && data.data) {
        setEmployees(data.data);
        // Initialize statuses for all employees
        const initialStatuses: Record<string, AttendanceStatus> = {};
        const initialGroups: Record<string, string> = {};
        const groupsSet = new Set<string>();

        data.data.forEach((emp: Employee) => {
          initialStatuses[emp.token_no] = 'present';

          initialGroups[emp.token_no] = emp.group || '';

          if (emp.group) {
            groupsSet.add(emp.group);
          }
        });

        setAttendanceStatuses(initialStatuses);
        setAttendanceGroups(initialGroups);
        setAvailableGroups(Array.from(groupsSet).sort());
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to fetch employees",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
      toast({
        title: "Error",
        description: "Failed to fetch employees",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchExistingAttendance = async () => {
    try {
      const response = await fetch(`/api/attendance?date=${date}`);
      const data = await response.json();

      if (data.success && data.data) {
        const existing: Record<string, AttendanceStatus> = {};
        const existingGroups: Record<string, string> = {};
        data.data.forEach((record: any) => {
          existing[record.token_no] = record.status;
          if (record.group) {
            existingGroups[record.token_no] = record.group;
          }
        });
        setExistingAttendance(existing);


        setAttendanceStatuses(prev => {
          const updated = { ...prev };
          Object.keys(existing).forEach(token => {
            updated[token] = existing[token];
          });
          return updated;
        });


        setAttendanceGroups(prev => {
          const updated = { ...prev };
          Object.keys(existingGroups).forEach(token => {
            updated[token] = existingGroups[token];
          });
          return updated;
        });
      }
    } catch (error) {
      console.error('Error fetching existing attendance:', error);
    }
  };

  const handleStatusChange = (tokenNo: string, status: AttendanceStatus) => {
    setAttendanceStatuses(prev => ({
      ...prev,
      [tokenNo]: status,
    }));
  };

  const handleGroupChange = (tokenNo: string, group: string) => {
    setAttendanceGroups(prev => ({
      ...prev,
      [tokenNo]: group,
    }));
  };

  const handleSaveAttendance = async () => {
    if (employees.length === 0) {
      toast({
        title: "No Employees",
        description: "No employees to save attendance for",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {

      const records = employees.map(emp => ({
        token_no: emp.token_no,
        attendance_date: date,
        status: attendanceStatuses[emp.token_no] || 'present',
        group: attendanceGroups[emp.token_no] || emp.group || null,
      }));

      const response = await fetch('/api/attendance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ records }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Success",
          description: `Attendance saved for ${data.recordsUpdated || records.length} employees`,
        });

        setExistingAttendance(prev => {
          const updated = { ...prev };
          records.forEach(record => {
            updated[record.token_no] = record.status;
          });
          return updated;
        });

        onAttendanceUpdate?.();
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to save attendance",
          variant: "destructive",
        });
        if (data.errors && data.errors.length > 0) {
          console.error('Errors:', data.errors);
        }
      }
    } catch (error) {
      console.error('Error saving attendance:', error);
      toast({
        title: "Error",
        description: "Failed to save attendance",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };


  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">Loading employees...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mark Attendance</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Date Selector */}
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Label htmlFor="date">Select Date</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                max={new Date().toISOString().split("T")[0]}
                className="w-auto"
              />
            </div>
            <Button
              onClick={handleSaveAttendance}
              disabled={saving || employees.length === 0}
              className="ml-auto"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <UserCheck className="w-4 h-4 mr-2" />
                  Save Attendance
                </>
              )}
            </Button>
          </div>

          {/* Employees Table */}
          {employees.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No employees found
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Token No</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Group</TableHead>
                    <TableHead>Designation</TableHead>
                    <TableHead className="text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employees.map((employee) => (
                    <TableRow key={employee.token_no}>
                      <TableCell className="font-medium">{employee.token_no}</TableCell>
                      <TableCell>{employee.name}</TableCell>
                      <TableCell>
                        <Select
                          value={attendanceGroups[employee.token_no] || employee.group || undefined}
                          onValueChange={(value: string) =>
                            handleGroupChange(employee.token_no, value)
                          }
                        >
                          <SelectTrigger className="w-32 bg-background">
                            <SelectValue placeholder="Select group" />
                          </SelectTrigger>
                          <SelectContent className="bg-background z-50">
                            {availableGroups.map((group) => (
                              <SelectItem key={group} value={group}>
                                {group}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>{employee.desig || '-'}</TableCell>
                      <TableCell className="text-right">
                        <Select
                          value={attendanceStatuses[employee.token_no] || 'present'}
                          onValueChange={(value: AttendanceStatus) =>
                            handleStatusChange(employee.token_no, value)
                          }
                        >
                          <SelectTrigger className="w-32 ml-auto bg-background">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-background z-50">
                            <SelectItem value="present">Present</SelectItem>
                            <SelectItem value="absent">Absent</SelectItem>
                            <SelectItem value="leave">Leave</SelectItem>
                            <SelectItem value="half_day">Half Day</SelectItem>
                            <SelectItem value="holiday">Holiday</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
