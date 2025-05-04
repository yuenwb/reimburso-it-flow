
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

// Helper function to format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Colors for charts
const EXPENSE_TYPE_COLORS = {
  travel: "#4299E1",  // blue-400
  meals: "#F6AD55",   // orange-300
  equipment: "#9F7AEA", // purple-400
  software: "#38B2AC", // teal-500
  other: "#CBD5E0",   // gray-400
};

interface ExpenseTypeChartProps {
  expensesByType: { name: string; amount: number }[];
}

export const ExpenseTypeChart = ({ expensesByType }: ExpenseTypeChartProps) => {
  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Expenses by Type</CardTitle>
        <CardDescription>
          Breakdown of expenses by category
        </CardDescription>
      </CardHeader>
      <CardContent className="px-2">
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={expensesByType}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="amount"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {expensesByType.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={EXPENSE_TYPE_COLORS[entry.name.toLowerCase() as keyof typeof EXPENSE_TYPE_COLORS] || "#CBD5E0"} 
                  />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatCurrency(value as number)} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
