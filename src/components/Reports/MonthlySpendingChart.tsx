
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  BarChart,
  Bar,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
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

interface MonthlySpendingChartProps {
  monthlySpending: { name: string; amount: number }[];
  currentYear: number;
}

export const MonthlySpendingChart = ({ 
  monthlySpending,
  currentYear 
}: MonthlySpendingChartProps) => {
  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Monthly Spending ({currentYear})</CardTitle>
        <CardDescription>
          Reimbursement amount by month
        </CardDescription>
      </CardHeader>
      <CardContent className="px-2">
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlySpending}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis tickFormatter={(value) => `$${value}`} />
              <Tooltip formatter={(value) => formatCurrency(value as number)} />
              <Bar dataKey="amount" fill="#4299E1" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
