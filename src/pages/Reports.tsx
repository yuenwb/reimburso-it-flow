
import { useState } from "react";
import { useReimbursement, ReimbursementType } from "@/contexts/ReimbursementContext";
import { 
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/Spinner";
import {
  BarChart,
  Bar,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Download } from "lucide-react";

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

const STATUS_COLORS = {
  pending: "#F6E05E",   // yellow-300
  approved: "#68D391",  // green-300
  rejected: "#FC8181",  // red-300
};

const Reports = () => {
  const { requests, isLoading, exportToCSV } = useReimbursement();
  const [timeRange, setTimeRange] = useState<string>("all-time");
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }
  
  // Filter requests based on time range
  const filteredRequests = requests.filter(request => {
    const requestDate = new Date(request.date);
    const now = new Date();
    switch (timeRange) {
      case "30-days":
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(now.getDate() - 30);
        return requestDate >= thirtyDaysAgo;
      case "90-days":
        const ninetyDaysAgo = new Date();
        ninetyDaysAgo.setDate(now.getDate() - 90);
        return requestDate >= ninetyDaysAgo;
      case "year-to-date":
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        return requestDate >= startOfYear;
      default:
        return true; // all-time
    }
  });
  
  // Calculate key metrics
  const totalRequests = filteredRequests.length;
  const approvedRequests = filteredRequests.filter(req => req.status === "approved").length;
  const rejectedRequests = filteredRequests.filter(req => req.status === "rejected").length;
  const pendingRequests = filteredRequests.filter(req => req.status === "pending").length;
  
  const totalAmount = filteredRequests.reduce((sum, req) => sum + req.amount, 0);
  const approvedAmount = filteredRequests
    .filter(req => req.status === "approved")
    .reduce((sum, req) => sum + req.amount, 0);
  const pendingAmount = filteredRequests
    .filter(req => req.status === "pending")
    .reduce((sum, req) => sum + req.amount, 0);
  
  const approvalRate = totalRequests > 0 ? (approvedRequests / (approvedRequests + rejectedRequests)) * 100 : 0;
  
  // Prepare data for expense by type chart
  const expensesByType = Object.values(ReimbursementType).map(type => {
    const amount = filteredRequests
      .filter(req => req.type === type)
      .reduce((sum, req) => sum + req.amount, 0);
    
    return {
      name: type.charAt(0).toUpperCase() + type.slice(1),
      amount,
    };
  }).sort((a, b) => b.amount - a.amount);
  
  // Prepare data for status distribution chart
  const statusDistribution = [
    { name: "Approved", value: approvedRequests },
    { name: "Rejected", value: rejectedRequests },
    { name: "Pending", value: pendingRequests },
  ];
  
  // Prepare data for monthly spending chart
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const currentYear = new Date().getFullYear();
  
  const monthlySpending = monthNames.map((month, idx) => {
    const amount = filteredRequests
      .filter(req => {
        const reqDate = new Date(req.date);
        return reqDate.getMonth() === idx && reqDate.getFullYear() === currentYear;
      })
      .reduce((sum, req) => sum + req.amount, 0);
    
    return {
      name: month,
      amount,
    };
  });
  
  // Prepare data for department spending
  const departmentSpending = filteredRequests
    .reduce((acc, req) => {
      if (!acc[req.userDepartment]) {
        acc[req.userDepartment] = 0;
      }
      acc[req.userDepartment] += req.amount;
      return acc;
    }, {} as Record<string, number>);
  
  const departmentData = Object.entries(departmentSpending)
    .map(([name, amount]) => ({ name, amount }))
    .sort((a, b) => b.amount - a.amount);
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Reports & Analytics</h1>
          <p className="text-muted-foreground">
            View reimbursement statistics and trends
          </p>
        </div>
        <div className="flex gap-2">
          <Select
            value={timeRange}
            onValueChange={setTimeRange}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30-days">Last 30 Days</SelectItem>
              <SelectItem value="90-days">Last 90 Days</SelectItem>
              <SelectItem value="year-to-date">Year to Date</SelectItem>
              <SelectItem value="all-time">All Time</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={exportToCSV}>
            <Download className="mr-2 h-4 w-4" />
            Export Data
          </Button>
        </div>
      </div>
      
      {/* Key metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRequests}</div>
            <p className="text-xs text-muted-foreground">
              Includes all reimbursement requests
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalAmount)}</div>
            <p className="text-xs text-muted-foreground">
              Total reimbursement requested
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Approved Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(approvedAmount)}</div>
            <p className="text-xs text-muted-foreground">
              {pendingAmount > 0 ? `${formatCurrency(pendingAmount)} pending approval` : "All requests processed"}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Approval Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{approvalRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {approvedRequests} approved / {rejectedRequests} rejected
            </p>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="spending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="spending">Spending Analysis</TabsTrigger>
          <TabsTrigger value="status">Status Distribution</TabsTrigger>
          <TabsTrigger value="departments">By Department</TabsTrigger>
        </TabsList>
        
        <TabsContent value="spending" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Expense by Type */}
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
            
            {/* Monthly Spending */}
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
          </div>
        </TabsContent>
        
        <TabsContent value="status" className="space-y-4">
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
        </TabsContent>
        
        <TabsContent value="departments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Spending by Department</CardTitle>
              <CardDescription>
                Total reimbursement amounts by department
              </CardDescription>
            </CardHeader>
            <CardContent className="px-2">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={departmentData}
                    layout="vertical"
                    margin={{ left: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" tickFormatter={(value) => `$${value}`} />
                    <YAxis dataKey="name" type="category" width={80} />
                    <Tooltip formatter={(value) => formatCurrency(value as number)} />
                    <Bar dataKey="amount" fill="#4299E1" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Reports;
