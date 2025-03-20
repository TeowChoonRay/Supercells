import { Line, LineChart, ResponsiveContainer, Tooltip } from "recharts";

interface ChartProps {
  data: Array<{
    name: string;
    value: number;
  }>;
}

export function Chart({ data }: ChartProps) {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <LineChart data={data}>
        <Line
          type="monotone"
          dataKey="value"
          strokeWidth={2}
          activeDot={{
            r: 8,
          }}
        />
        <Tooltip />
      </LineChart>
    </ResponsiveContainer>
  );
}