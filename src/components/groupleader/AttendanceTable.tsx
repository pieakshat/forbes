import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AttendanceRecord } from "@/pages/GroupLeaderPanel";
import { Calendar } from "lucide-react";

interface AttendanceTableProps {
  attendance: AttendanceRecord[];
}

export function AttendanceTable({ attendance }: AttendanceTableProps) {
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split("T")[0]);

  const filteredAttendance = attendance.filter(record => 
    !filterDate || record.date === filterDate
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Present":
        return <Badge className="bg-green-500 hover:bg-green-600">Present</Badge>;
      case "Absent":
        return <Badge variant="destructive">Absent</Badge>;
      case "Leave":
        return <Badge variant="secondary">Leave</Badge>;
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
              {filteredAttendance.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    No attendance records found for the selected date
                  </TableCell>
                </TableRow>
              ) : (
                filteredAttendance.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium">{record.tokenNumber}</TableCell>
                    <TableCell>{record.employeeName}</TableCell>
                    <TableCell>{record.designation}</TableCell>
                    <TableCell>{record.employmentType}</TableCell>
                    <TableCell>{record.group}</TableCell>
                    <TableCell>{getStatusBadge(record.status)}</TableCell>
                    <TableCell>{new Date(record.date).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
