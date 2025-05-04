
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";

// Helper function to format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

interface KeyMetricsCardsProps {
  totalRequests: number;
  totalAmount: number;
  approvedAmount: number;
  pendingAmount: number;
  approvedRequests: number;
  rejectedRequests: number;
  approvalRate: number;
}

export const KeyMetricsCards = ({
  totalRequests,
  totalAmount,
  approvedAmount,
  pendingAmount,
  approvedRequests,
  rejectedRequests,
  approvalRate,
}: KeyMetricsCardsProps) => {
  return (
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
  );
};
