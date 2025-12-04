import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface DataTableProps {
  title: string;
  data: TableData;
}

export interface TableData {
  headers: string[];
  rows: {
    label: string;
    values: (string | number)[];
    total?: string | number;
    average?: string | number;
  }[];
}

export const DataTable = ({ title, data }: DataTableProps) => {
  const getStatusClass = (value: number, rowLabel: string) => {
    // Define status ranges based on row type
    if (rowLabel.includes("Capacity Utilization") || rowLabel.includes("completion")) {
      if (value >= 95) return "status-excellent";
      if (value >= 90) return "status-good";
      if (value >= 85) return "status-average";
      return "status-poor";
    }
    if (rowLabel.includes("Absenteeism")) {
      if (value <= 5) return "status-excellent";
      if (value <= 8) return "status-good";
      if (value <= 12) return "status-average";
      return "status-poor";
    }
    return "";
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="corporate-table w-full text-xs">
            <thead>
              <tr>
                <th className="min-w-[200px] sticky left-0 bg-table-header z-10">Item</th>
                {data.headers.map((header, index) => (
                  <th key={index} className="min-w-[60px] text-center">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.rows.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  <td className="font-medium sticky left-0 bg-card z-10 border-r-2">
                    {row.label}
                  </td>
                  {row.values.map((value, colIndex) => {
                    const numValue = typeof value === 'string' ? parseFloat(value) : value;
                    const statusClass = !isNaN(numValue) ? getStatusClass(numValue, row.label) : '';

                    return (
                      <td
                        key={colIndex}
                        className={`text-center ${statusClass} ${colIndex < 2 ? 'font-semibold' : ''}`}
                      >
                        {typeof value === 'number' ?
                          (value % 1 === 0 ? value.toString() : value.toFixed(1)) :
                          value
                        }
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 text-xs text-muted-foreground">
          <p>Color coding:
            <Badge className="ml-2 status-excellent">Excellent (≥95%)</Badge>
            <Badge className="ml-1 status-good">Good (90-94%)</Badge>
            <Badge className="ml-1 status-average">Average (85-89%)</Badge>
            <Badge className="ml-1 status-poor">Poor (&lt;85%)</Badge>
          </p>
        </div>
      </CardContent>
    </Card>
  );
};