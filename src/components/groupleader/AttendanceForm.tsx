import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Upload, UserCheck, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Employee {
  token_no: string;
  name: string;
  group: string | null;
  desig: string | null;
  role: string | null;
}

interface AttendanceFormProps {
  onAttendanceUpdate?: () => void;
}

type AttendanceStatus = 'present' | 'absent' | 'leave' | 'half_day' | 'holiday' | 'remote';

export function AttendanceForm({ onAttendanceUpdate }: AttendanceFormProps) {
  const { toast } = useToast();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [attendanceStatuses, setAttendanceStatuses] = useState<Record<string, AttendanceStatus>>({});
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
      const response = await fetch('/api/employees');
      const data = await response.json();

      if (data.success && data.data) {
        setEmployees(data.data);
        // Initialize statuses for all employees
        const initialStatuses: Record<string, AttendanceStatus> = {};
        data.data.forEach((emp: Employee) => {
          initialStatuses[emp.token_no] = 'present'; // Default to present
        });
        setAttendanceStatuses(initialStatuses);
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
        // Map existing attendance by token_no
        const existing: Record<string, AttendanceStatus> = {};
        data.data.forEach((record: any) => {
          existing[record.token_no] = record.status;
        });
        setExistingAttendance(existing);

        // Update the status selector with existing values
        setAttendanceStatuses(prev => {
          const updated = { ...prev };
          Object.keys(existing).forEach(token => {
            updated[token] = existing[token];
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
      // Prepare records for all employees with their selected statuses
      const records = employees.map(emp => ({
        token_no: emp.token_no,
        attendance_date: date,
        status: attendanceStatuses[emp.token_no] || 'present',
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
        // Update existing attendance map
        setExistingAttendance(prev => {
          const updated = { ...prev };
          records.forEach(record => {
            updated[record.token_no] = record.status;
          });
          return updated;
        });
        // Callback to refresh parent component if needed
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

  const handleCSVUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event?.target?.result as string;
        const lines = text.split("\n").slice(1).filter(line => line.trim()); // Skip header and empty lines
        const records: Array<{ token_no: string; attendance_date: string; status: AttendanceStatus }> = [];

        lines.forEach((line) => {
          const [token, statusStr, dateStr] = line.split(",").map(s => s.trim());
          if (!token || !statusStr) return;

          // Validate status
          const validStatuses: AttendanceStatus[] = ['present', 'absent', 'leave', 'half_day', 'holiday', 'remote'];
          const status = validStatuses.includes(statusStr.toLowerCase() as AttendanceStatus)
            ? (statusStr.toLowerCase() as AttendanceStatus)
            : 'present';

          records.push({
            token_no: token,
            attendance_date: dateStr || date,
            status,
          });
        });

        if (records.length === 0) {
          toast({
            title: "Error",
            description: "No valid records found in CSV",
            variant: "destructive",
          });
          return;
        }

        setSaving(true);
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
            title: "Bulk Upload Complete",
            description: `Successfully uploaded ${data.recordsUpdated || records.length} attendance records`,
          });
          // Refresh existing attendance
          await fetchExistingAttendance();
          onAttendanceUpdate?.();
        } else {
          toast({
            title: "Error",
            description: data.error || "Failed to upload CSV",
            variant: "destructive",
          });
          if (data.errors && data.errors.length > 0) {
            console.error('Errors:', data.errors);
          }
        }
      } catch (error) {
        console.error('Error processing CSV:', error);
        toast({
          title: "Error",
          description: "Failed to process CSV file",
          variant: "destructive",
        });
      } finally {
        setSaving(false);
      }
    };

    reader.readAsText(file);
    e.target.value = "";
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
        <Tabs defaultValue="manual" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-muted">
            <TabsTrigger value="manual">Manual Entry</TabsTrigger>
            <TabsTrigger value="upload">CSV Upload</TabsTrigger>
          </TabsList>

          <TabsContent value="manual" className="space-y-4">
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
                        <TableCell>{employee.group || '-'}</TableCell>
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
                              <SelectItem value="remote">Remote</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>

          <TabsContent value="upload" className="space-y-4">
            <div className="border-2 border-dashed rounded-lg p-8 text-center">
              <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <Label htmlFor="csv-upload" className="cursor-pointer">
                <div className="text-sm text-muted-foreground mb-2">
                  Upload a CSV file with columns: Token, Status, Date (optional)
                </div>
                <Button type="button" variant="outline" asChild>
                  <span>Choose CSV File</span>
                </Button>
              </Label>
              <Input
                id="csv-upload"
                type="file"
                accept=".csv"
                onChange={handleCSVUpload}
                className="hidden"
              />
            </div>
            <div className="text-xs text-muted-foreground">
              <p className="font-semibold mb-1">CSV Format Example:</p>
              <code className="block bg-muted p-2 rounded">
                Token,Status,Date<br />
                101,present,2025-10-06<br />
                102,absent,2025-10-06<br />
                103,leave,2025-10-06
              </code>
              <p className="mt-2">Valid statuses: present, absent, leave, half_day, holiday, remote</p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
