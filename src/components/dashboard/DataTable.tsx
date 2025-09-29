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

// Mock data based on the reference image
export const mockTableData: TableData = {
  headers: ["Total", "Average", "1-Aug", "2-Aug", "3-Aug", "4-Aug", "5-Aug", "6-Aug", "7-Aug", "8-Aug", "9-Aug", "10-Aug", "11-Aug", "12-Aug", "13-Aug", "14-Aug", "15-Aug", "16-Aug", "17-Aug", "18-Aug", "19-Aug", "20-Aug", "21-Aug", "22-Aug", "23-Aug", "24-Aug", "25-Aug", "26-Aug", "27-Aug", "28-Aug", "29-Aug", "30-Aug", "31-Aug"],
  rows: [
    {
      label: "Manpower",
      values: [5565, 179.5, 197, 165, 188, 195, 198, 189, 203, 175, 156, 187, 194, 201, 188, 179, 203, 191, 185, 174, 192, 198, 205, 182, 169, 195, 188, 201, 176, 194, 187, 203, 185],
      total: 5565,
      average: 179.5
    },
    {
      label: "Indexed Capacity (at 100%)",
      values: [21897, 706.4, 705, 690, 725, 748, 715, 695, 738, 701, 689, 726, 742, 719, 698, 734, 708, 693, 741, 705, 720, 695, 738, 704, 691, 729, 715, 702, 736, 708, 694, 731, 720],
      total: 21897,
      average: 706.4
    },
    {
      label: "Indexed Capacity (with Actual Absenteeism)",
      values: [19765, 637.6, 638, 622, 654, 675, 645, 627, 666, 632, 621, 655, 669, 648, 630, 662, 638, 625, 668, 636, 649, 627, 666, 635, 623, 658, 645, 634, 664, 638, 626, 660, 649],
      total: 19765,
      average: 637.6
    },
    {
      label: "Index - FG completion",
      values: [91.5, 91.5, 90.5, 90.1, 90.2, 90.3, 90.2, 90.2, 90.2, 89.9, 90.1, 90.2, 90.3, 90.2, 90.1, 90.2, 90.2, 90.1, 90.2, 90.1, 90.2, 90.2, 90.2, 90.1, 90.0, 90.2, 90.1, 90.2, 90.1, 90.2, 90.1, 90.2, 90.2],
      total: 91.5,
      average: 91.5
    },
    {
      label: "Absenteeism (%)",
      values: [9.7, 9.7, 9.5, 9.9, 9.8, 9.8, 9.8, 9.8, 9.8, 9.8, 9.9, 9.8, 9.7, 9.8, 9.9, 9.8, 9.8, 9.9, 9.8, 9.9, 9.8, 9.8, 9.8, 9.9, 10.0, 9.8, 9.9, 9.8, 9.9, 9.8, 9.9, 9.8, 9.8],
      total: 9.7,
      average: 9.7
    },
    {
      label: "% Capacity Utilization with Absenteeism",
      values: [97.4, 97.4, 97.2, 97.3, 97.3, 97.4, 97.3, 97.3, 97.3, 97.1, 97.3, 97.3, 97.4, 97.3, 97.2, 97.3, 97.3, 97.2, 97.3, 97.2, 97.3, 97.3, 97.3, 97.2, 97.1, 97.3, 97.2, 97.3, 97.2, 97.3, 97.2, 97.3, 97.3],
      total: 97.4,
      average: 97.4
    }
  ]
};

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