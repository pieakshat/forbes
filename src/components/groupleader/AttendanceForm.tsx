import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, UserCheck } from "lucide-react";
import { Employee, AttendanceRecord } from "@/components/views/GroupLeaderPanel";
import { useToast } from "@/hooks/use-toast";

interface AttendanceFormProps {
  employees: Employee[];
  onAddAttendance: (record: AttendanceRecord) => void;
  onBulkAddAttendance: (records: AttendanceRecord[]) => void;
}

export function AttendanceForm({ employees, onAddAttendance, onBulkAddAttendance }: AttendanceFormProps) {
  const { toast } = useToast();
  const [tokenNumber, setTokenNumber] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [status, setStatus] = useState<"Present" | "Absent" | "Leave">("Present");

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const employee = employees.find(emp => emp.tokenNumber === tokenNumber);
    if (!employee) {
      toast({
        title: "Employee Not Found",
        description: "Please enter a valid token number",
        variant: "destructive",
      });
      return;
    }

    const record: AttendanceRecord = {
      id: Date.now().toString(),
      tokenNumber,
      employeeName: employee.name,
      date,
      status,
      group: employee.group,
      designation: employee.designation,
      employmentType: employee.employmentType,
    };

    onAddAttendance(record);
    toast({
      title: "Attendance Recorded",
      description: `${status} marked for ${employee.name}`,
    });
    setTokenNumber("");
  };

  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split("\n").slice(1); // Skip header
      const records: AttendanceRecord[] = [];

      lines.forEach((line) => {
        const [token, statusStr, dateStr] = line.split(",").map(s => s.trim());
        if (!token || !statusStr) return;

        const employee = employees.find(emp => emp.tokenNumber === token);
        if (!employee) return;

        records.push({
          id: `${Date.now()}-${Math.random()}`,
          tokenNumber: token,
          employeeName: employee.name,
          date: dateStr || date,
          status: statusStr as any,
          group: employee.group,
          designation: employee.designation,
          employmentType: employee.employmentType,
        });
      });

      onBulkAddAttendance(records);
      toast({
        title: "Bulk Upload Complete",
        description: `${records.length} attendance records added`,
      });
    };

    reader.readAsText(file);
    e.target.value = "";
  };

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

          <TabsContent value="manual">
            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="token">Employee Token Number</Label>
                  <Input
                    id="token"
                    value={tokenNumber}
                    onChange={(e) => setTokenNumber(e.target.value)}
                    placeholder="e.g. 101"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Attendance Status</Label>
                  <Select value={status} onValueChange={(value: any) => setStatus(value)}>
                    <SelectTrigger id="status" className="bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-background z-50">
                      <SelectItem value="Present">Present</SelectItem>
                      <SelectItem value="Absent">Absent</SelectItem>
                      <SelectItem value="Leave">Leave</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button type="submit" className="w-full md:w-auto">
                <UserCheck className="w-4 h-4 mr-2" />
                Mark Attendance
              </Button>
            </form>
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
                101,Present,2025-10-06<br />
                102,Absent,2025-10-06
              </code>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
