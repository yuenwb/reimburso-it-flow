
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useReimbursement, ReimbursementStatus } from "@/contexts/ReimbursementContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/Spinner";
import { FileUp, BarChart, FileCheck, Clock, AlertTriangle } from "lucide-react";

const StatusCard = ({ 
  title, 
  count, 
  icon, 
  description, 
  colorClass 
}: { 
  title: string; 
  count: number; 
  icon: React.ReactNode;
  description: string;
  colorClass: string;
}) => (
  <Card className="card-hover">
    <CardHeader className="pb-2">
      <div className="flex justify-between items-start">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className={`${colorClass} p-2 rounded-full`}>
          {icon}
        </div>
      </div>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{count}</div>
      <CardDescription>{description}</CardDescription>
    </CardContent>
  </Card>
);

const RecentActivityItem = ({ 
  title, 
  status, 
  date, 
  amount 
}: { 
  title: string; 
  status: ReimbursementStatus; 
  date: string; 
  amount: number;
}) => {
  const getStatusBadge = (status: ReimbursementStatus) => {
    switch (status) {
      case "approved":
        return <span className="status-badge status-approved">Approved</span>;
      case "rejected":
        return <span className="status-badge status-rejected">Rejected</span>;
      default:
        return <span className="status-badge status-pending">Pending</span>;
    }
  };

  return (
    <div className="py-2 border-b last:border-0">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium">{title}</p>
          <div className="flex items-center gap-2 mt-1">
            {getStatusBadge(status)}
            <span className="text-xs text-muted-foreground">
              {new Date(date).toLocaleDateString()}
            </span>
          </div>
        </div>
        <div className="text-right">
          <p className="font-medium">${amount.toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const { user, hasPermission } = useAuth();
  const { requests, isLoading } = useReimbursement();
  const navigate = useNavigate();
  
  if (isLoading || !user) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }
  
  // Filter requests for the current user if they're an employee
  // Managers and admins see all requests
  const userRequests = hasPermission("manager") 
    ? requests 
    : requests.filter(req => req.userId === user.id);
  
  // Calculate statistics
  const pendingCount = userRequests.filter(req => req.status === "pending").length;
  const approvedCount = userRequests.filter(req => req.status === "approved").length;
  const rejectedCount = userRequests.filter(req => req.status === "rejected").length;
  const totalAmount = userRequests.reduce((sum, req) => {
    if (req.status === "approved") return sum + req.amount;
    return sum;
  }, 0);
  
  // Get recent activity (5 most recent requests)
  const recentActivity = [...userRequests]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <Button onClick={() => navigate("/new-request")}>
          <FileUp className="mr-2 h-4 w-4" />
          New Request
        </Button>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatusCard
          title="Pending Requests"
          count={pendingCount}
          icon={<Clock className="h-4 w-4 text-yellow-500" />}
          description="Awaiting approval"
          colorClass="bg-yellow-100"
        />
        <StatusCard
          title="Approved Requests"
          count={approvedCount}
          icon={<FileCheck className="h-4 w-4 text-green-500" />}
          description="Successfully approved"
          colorClass="bg-green-100"
        />
        <StatusCard
          title="Rejected Requests"
          count={rejectedCount}
          icon={<AlertTriangle className="h-4 w-4 text-red-500" />}
          description="Not approved"
          colorClass="bg-red-100"
        />
        <StatusCard
          title="Total Reimbursed"
          count={Math.round(totalAmount)}
          icon={<BarChart className="h-4 w-4 text-blue-500" />}
          description="Approved amount ($)"
          colorClass="bg-blue-100"
        />
      </div>
      
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest 5 reimbursement requests</CardDescription>
          </CardHeader>
          <CardContent>
            {recentActivity.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">
                No activity yet. Create your first reimbursement request!
              </p>
            ) : (
              <div className="space-y-1">
                {recentActivity.map((request) => (
                  <RecentActivityItem
                    key={request.id}
                    title={request.title}
                    status={request.status}
                    date={request.createdAt}
                    amount={request.amount}
                  />
                ))}
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" onClick={() => navigate("/requests")}>
              View all requests
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Quick Tips</CardTitle>
            <CardDescription>Getting started with reimbursements</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="bg-primary/10 p-2 rounded-full h-min">
                  <FileUp className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">Submit Receipts</h3>
                  <p className="text-sm text-muted-foreground">
                    Always attach clear photos or scans of your receipts.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <div className="bg-primary/10 p-2 rounded-full h-min">
                  <Clock className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">Timely Submission</h3>
                  <p className="text-sm text-muted-foreground">
                    Submit expenses within 30 days of purchase for faster processing.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <div className="bg-primary/10 p-2 rounded-full h-min">
                  <FileCheck className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">Check Status</h3>
                  <p className="text-sm text-muted-foreground">
                    Monitor the status of your requests in the "My Requests" section.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
