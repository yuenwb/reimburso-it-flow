
import { useState } from "react";
import { useReimbursement, REIMBURSEMENT_TYPES } from "@/contexts/ReimbursementContext";
import { 
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Spinner } from "@/components/ui/Spinner";

// Import refactored components
import { KeyMetricsCards } from "@/components/Reports/KeyMetricsCards";
import { ExpenseTypeChart } from "@/components/Reports/ExpenseTypeChart";
import { MonthlySpendingChart } from "@/components/Reports/MonthlySpendingChart";
import { StatusDistributionChart } from "@/components/Reports/StatusDistributionChart";
import { DepartmentSpendingChart } from "@/components/Reports/DepartmentSpendingChart";
import { TimeRangeSelector } from "@/components/Reports/TimeRangeSelector";

// Import utility functions
import {
  filterRequestsByTimeRange,
  prepareExpensesByTypeData,
  prepareStatusDistributionData,
  prepareMonthlySpendingData,
  prepareDepartmentSpendingData
} from "@/components/Reports/utils";

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
  const filteredRequests = filterRequestsByTimeRange(requests, timeRange);
  
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
  
  // Prepare data for various charts
  const expensesByType = prepareExpensesByTypeData(filteredRequests, REIMBURSEMENT_TYPES);
  const statusDistribution = prepareStatusDistributionData(approvedRequests, rejectedRequests, pendingRequests);
  const { data: monthlySpending, currentYear } = prepareMonthlySpendingData(filteredRequests);
  const departmentData = prepareDepartmentSpendingData(filteredRequests);
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Reports & Analytics</h1>
          <p className="text-muted-foreground">
            View reimbursement statistics and trends
          </p>
        </div>
        <TimeRangeSelector 
          timeRange={timeRange}
          setTimeRange={setTimeRange}
          onExport={exportToCSV}
        />
      </div>
      
      {/* Key metrics */}
      <KeyMetricsCards 
        totalRequests={totalRequests}
        totalAmount={totalAmount}
        approvedAmount={approvedAmount}
        pendingAmount={pendingAmount}
        approvedRequests={approvedRequests}
        rejectedRequests={rejectedRequests}
        approvalRate={approvalRate}
      />
      
      <Tabs defaultValue="spending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="spending">Spending Analysis</TabsTrigger>
          <TabsTrigger value="status">Status Distribution</TabsTrigger>
          <TabsTrigger value="departments">By Department</TabsTrigger>
        </TabsList>
        
        <TabsContent value="spending" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Expense by Type */}
            <ExpenseTypeChart expensesByType={expensesByType} />
            
            {/* Monthly Spending */}
            <MonthlySpendingChart monthlySpending={monthlySpending} currentYear={currentYear} />
          </div>
        </TabsContent>
        
        <TabsContent value="status" className="space-y-4">
          <StatusDistributionChart statusDistribution={statusDistribution} />
        </TabsContent>
        
        <TabsContent value="departments" className="space-y-4">
          <DepartmentSpendingChart departmentData={departmentData} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Reports;
