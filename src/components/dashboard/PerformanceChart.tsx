import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line, ReferenceLine, Label, LabelList } from 'recharts';

interface PerformanceChartProps {
  title: string;
  data: ChartData[];
  type?: 'bar' | 'line' | 'combo';
  showLegend?: boolean;
}

export interface ChartData {
  name: string;
  indexCompletion: number;
  indexedCapacity: number;
  actualCapacity: number;
  percentage?: number;
}

// Mock chart data based on the reference image
export const mockChartData: ChartData[] = [
  { name: '1-Aug', indexCompletion: 1982, indexedCapacity: 425, actualCapacity: 305, percentage: 85 },
  { name: '2-Aug', indexCompletion: 2687, indexedCapacity: 434, actualCapacity: 321, percentage: 119 },
  { name: '3-Aug', indexCompletion: 2687, indexedCapacity: 448, actualCapacity: 335, percentage: 102 },
  { name: '4-Aug', indexCompletion: 2687, indexedCapacity: 462, actualCapacity: 348, percentage: 118 },
  { name: '5-Aug', indexCompletion: 2687, indexedCapacity: 475, actualCapacity: 361, percentage: 131 },
  { name: '6-Aug', indexCompletion: 2661, indexedCapacity: 488, actualCapacity: 374, percentage: 128 },
  { name: '7-Aug', indexCompletion: 2661, indexedCapacity: 501, actualCapacity: 387, percentage: 106 },
  { name: '8-Aug', indexCompletion: 2661, indexedCapacity: 515, actualCapacity: 401, percentage: 133 },
  { name: '9-Aug', indexCompletion: 2661, indexedCapacity: 528, actualCapacity: 414, percentage: 98 },
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
            {type === 'combo' ? (
              <BarChart data={data} margin={{ top: 50, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="name" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  verticalAlign="top"
                  height={36}
                  iconType="rect"
                />
                <ReferenceLine 
                  y={2500} 
                  stroke="hsl(var(--muted-foreground))" 
                  strokeDasharray="5 5"
                  strokeWidth={1}
                />
                <Bar 
                  dataKey="indexCompletion" 
                  name="Index_FG completion"
                  fill="hsl(var(--chart-primary))"
                  stackId="a"
                  radius={[0, 0, 0, 0]}
                >
                  <LabelList 
                    dataKey="indexCompletion" 
                    position="inside" 
                    fill="white"
                    fontSize={11}
                  />
                </Bar>
                <Bar 
                  dataKey="indexedCapacity" 
                  name="Indexed Capacity (at 100%)"
                  fill="hsl(var(--chart-secondary))"
                  stackId="a"
                  radius={[0, 0, 0, 0]}
                >
                  <LabelList 
                    dataKey="indexedCapacity" 
                    position="inside" 
                    fill="white"
                    fontSize={11}
                  />
                </Bar>
                <Bar 
                  dataKey="actualCapacity" 
                  name="Indexed Capacity (with Abs)"
                  fill="hsl(var(--chart-tertiary))"
                  stackId="a"
                  radius={[2, 2, 0, 0]}
                >
                  <LabelList 
                    dataKey="actualCapacity" 
                    position="inside" 
                    fill="white"
                    fontSize={11}
                  />
                </Bar>
                <Line 
                  type="monotone" 
                  dataKey="percentage" 
                  name="% Capacity Utilization"
                  stroke="hsl(var(--chart-accent))"
                  strokeWidth={2}
                  dot={{ r: 5, fill: "hsl(var(--chart-accent))", strokeWidth: 2 }}
                  yAxisId={1}
                >
                  <LabelList 
                    dataKey="percentage" 
                    position="top"
                    formatter={(value: number) => `${value}%`}
                    fill="hsl(var(--chart-accent))"
                    fontSize={11}
                    fontWeight="bold"
                  />
                </Line>
                <YAxis 
                  yAxisId={1}
                  orientation="right"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${value}%`}
                />
              </BarChart>
            ) : type === 'bar' ? (
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