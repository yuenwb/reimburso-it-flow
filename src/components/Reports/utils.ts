
// Helper functions for data processing in Reports components

// Format currency amounts consistently
export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Filter requests based on time range
export const filterRequestsByTimeRange = (requests: any[], timeRange: string) => {
  return requests.filter(request => {
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
};

// Prepare data for expense by type chart
export const prepareExpensesByTypeData = (filteredRequests: any[], expenseTypes: string[]) => {
  return expenseTypes.map(type => {
    const amount = filteredRequests
      .filter(req => req.type === type)
      .reduce((sum, req) => sum + req.amount, 0);
    
    return {
      name: type.charAt(0).toUpperCase() + type.slice(1),
      amount,
    };
  }).sort((a, b) => b.amount - a.amount);
};

// Prepare data for status distribution chart
export const prepareStatusDistributionData = (
  approvedRequests: number,
  rejectedRequests: number,
  pendingRequests: number
) => {
  return [
    { name: "Approved", value: approvedRequests },
    { name: "Rejected", value: rejectedRequests },
    { name: "Pending", value: pendingRequests },
  ];
};

// Prepare data for monthly spending chart
export const prepareMonthlySpendingData = (filteredRequests: any[]) => {
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const currentYear = new Date().getFullYear();
  
  return {
    data: monthNames.map((month, idx) => {
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
    }),
    currentYear
  };
};

// Prepare data for department spending
export const prepareDepartmentSpendingData = (filteredRequests: any[]) => {
  const departmentSpending = filteredRequests
    .reduce((acc: Record<string, number>, req: any) => {
      if (!acc[req.userDepartment]) {
        acc[req.userDepartment] = 0;
      }
      acc[req.userDepartment] += req.amount;
      return acc;
    }, {} as Record<string, number>);
  
  return Object.entries(departmentSpending)
    .map(([name, amount]) => ({ name, amount }))
    .sort((a, b) => b.amount - a.amount);
};
