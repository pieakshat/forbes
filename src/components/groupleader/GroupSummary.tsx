import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AttendanceRecord } from "@/pages/GroupLeaderPanel";

interface GroupSummaryProps {
  attendance: AttendanceRecord[];
}

export function GroupSummary({ attendance }: GroupSummaryProps) {
  // Get unique groups
  const groups = Array.from(new Set(attendance.map(a => a.group))).sort();
  
  // Calculate summary by group and employment type
  const summary = groups.map(group => {
    const groupRecords = attendance.filter(a => a.group === group && a.status === "Present");
    
    return {
      group,
      onRoll: groupRecords.filter(r => r.employmentType === "On-Roll").length,
      contract: groupRecords.filter(r => r.employmentType === "Contract").length,
      fte: groupRecords.filter(r => r.employmentType === "FTE").length,
      apprenticeship: groupRecords.filter(r => r.employmentType === "Apprenticeship").length,
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
      <CardContent>
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
      </CardContent>
    </Card>
  );
}
