
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

// Colors for charts
const STATUS_COLORS = {
  pending: "#F6E05E",   // yellow-300
  approved: "#68D391",  // green-300
  rejected: "#FC8181",  // red-300
};

interface StatusDistributionChartProps {
  statusDistribution: { name: string; value: number }[];
}

export const StatusDistributionChart = ({ 
  statusDistribution 
}: StatusDistributionChartProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Request Status Distribution</CardTitle>
        <CardDescription>
          Overview of reimbursement request statuses
        </CardDescription>
      </CardHeader>
      <CardContent className="px-2">
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={statusDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                <Cell fill={STATUS_COLORS.approved} />
                <Cell fill={STATUS_COLORS.rejected} />
                <Cell fill={STATUS_COLORS.pending} />
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
