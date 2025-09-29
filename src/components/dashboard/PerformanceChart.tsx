import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line } from 'recharts';

interface PerformanceChartProps {
  title: string;
  data: ChartData[];
  type?: 'bar' | 'line';
  showLegend?: boolean;
}

export interface ChartData {
  name: string;
  indexCompletion: number;
  indexedCapacity: number;
  actualCapacity: number;
}

// Mock chart data based on the reference image
export const mockChartData: ChartData[] = [
  { name: '1-Aug', indexCompletion: 2712, indexedCapacity: 705, actualCapacity: 638 },
  { name: '2-Aug', indexCompletion: 2687, indexedCapacity: 690, actualCapacity: 622 },
  { name: '3-Aug', indexCompletion: 2715, indexedCapacity: 725, actualCapacity: 654 },
  { name: '4-Aug', indexCompletion: 2748, indexedCapacity: 748, actualCapacity: 675 },
  { name: '5-Aug', indexCompletion: 2705, indexedCapacity: 715, actualCapacity: 645 },
  { name: '6-Aug', indexCompletion: 2695, indexedCapacity: 695, actualCapacity: 627 },
  { name: '7-Aug', indexCompletion: 2738, indexedCapacity: 738, actualCapacity: 666 },
  { name: '8-Aug', indexCompletion: 2701, indexedCapacity: 701, actualCapacity: 632 },
  { name: '9-Aug', indexCompletion: 2689, indexedCapacity: 689, actualCapacity: 621 },
  { name: '10-Aug', indexCompletion: 2726, indexedCapacity: 726, actualCapacity: 655 },
  { name: '11-Aug', indexCompletion: 2742, indexedCapacity: 742, actualCapacity: 669 },
  { name: '12-Aug', indexCompletion: 2719, indexedCapacity: 719, actualCapacity: 648 },
  { name: '13-Aug', indexCompletion: 2698, indexedCapacity: 698, actualCapacity: 630 },
  { name: '14-Aug', indexCompletion: 2734, indexedCapacity: 734, actualCapacity: 662 },
  { name: '15-Aug', indexCompletion: 2708, indexedCapacity: 708, actualCapacity: 638 },
  { name: '16-Aug', indexCompletion: 2693, indexedCapacity: 693, actualCapacity: 625 },
  { name: '17-Aug', indexCompletion: 2741, indexedCapacity: 741, actualCapacity: 668 },
  { name: '18-Aug', indexCompletion: 2705, indexedCapacity: 705, actualCapacity: 636 },
  { name: '19-Aug', indexCompletion: 2720, indexedCapacity: 720, actualCapacity: 649 },
  { name: '20-Aug', indexCompletion: 2695, indexedCapacity: 695, actualCapacity: 627 },
  { name: '21-Aug', indexCompletion: 2738, indexedCapacity: 738, actualCapacity: 666 },
  { name: '22-Aug', indexCompletion: 2704, indexedCapacity: 704, actualCapacity: 635 },
  { name: '23-Aug', indexCompletion: 2691, indexedCapacity: 691, actualCapacity: 623 },
  { name: '24-Aug', indexCompletion: 2729, indexedCapacity: 729, actualCapacity: 658 },
  { name: '25-Aug', indexCompletion: 2715, indexedCapacity: 715, actualCapacity: 645 },
  { name: '26-Aug', indexCompletion: 2702, indexedCapacity: 702, actualCapacity: 634 },
  { name: '27-Aug', indexCompletion: 2736, indexedCapacity: 736, actualCapacity: 664 },
  { name: '28-Aug', indexCompletion: 2708, indexedCapacity: 708, actualCapacity: 638 },
  { name: '29-Aug', indexCompletion: 2694, indexedCapacity: 694, actualCapacity: 626 },
  { name: '30-Aug', indexCompletion: 2731, indexedCapacity: 731, actualCapacity: 660 },
  { name: '31-Aug', indexCompletion: 2720, indexedCapacity: 720, actualCapacity: 649 }
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border rounded-lg shadow-lg p-3">
        <p className="font-medium text-foreground">{`Date: ${label}`}</p>
        {payload.map((pld: any, index: number) => (
          <p key={index} style={{ color: pld.color }} className="text-sm">
            {`${pld.dataKey}: ${pld.value}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export const PerformanceChart = ({ 
  title, 
  data, 
  type = 'bar', 
  showLegend = true 
}: PerformanceChartProps) => {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-96 w-full">
          <ResponsiveContainer width="100%" height="100%">
            {type === 'bar' ? (
              <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="name" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                {showLegend && (
                  <Legend 
                    wrapperStyle={{ paddingTop: '20px' }}
                    iconType="rect"
                  />
                )}
                <Bar 
                  dataKey="indexCompletion" 
                  name="Index_FG completion"
                  fill="hsl(var(--chart-primary))"
                  radius={[2, 2, 0, 0]}
                />
                <Bar 
                  dataKey="indexedCapacity" 
                  name="Indexed Capacity (at 100%)"
                  fill="hsl(var(--chart-secondary))"
                  radius={[2, 2, 0, 0]}
                />
                <Bar 
                  dataKey="actualCapacity" 
                  name="Indexed Capacity (with Abs)"
                  fill="hsl(var(--chart-tertiary))"
                  radius={[2, 2, 0, 0]}
                />
              </BarChart>
            ) : (
              <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="name" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                {showLegend && (
                  <Legend 
                    wrapperStyle={{ paddingTop: '20px' }}
                    iconType="line"
                  />
                )}
                <Line 
                  type="monotone" 
                  dataKey="indexCompletion" 
                  name="Index_FG completion"
                  stroke="hsl(var(--chart-primary))"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="indexedCapacity" 
                  name="Indexed Capacity (at 100%)"
                  stroke="hsl(var(--chart-secondary))"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="actualCapacity" 
                  name="Indexed Capacity (with Abs)"
                  stroke="hsl(var(--chart-tertiary))"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};