
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useReimbursement, ReimbursementType, ReimbursementStatus } from "@/contexts/ReimbursementContext";
import { 
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/Spinner";
import { 
  Search,
  FileText,
  Download,
  ArrowUp,
  ArrowDown,
  Eye
} from "lucide-react";
import RequestDetailView from "@/components/RequestDetailView";

type SortField = 'date' | 'amount' | 'title';
type SortDirection = 'asc' | 'desc';

const Requests = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    requests, 
    isLoading, 
    filters, 
    setFilters,
    exportToCSV
  } = useReimbursement();
  
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  
  // Filter requests for the current user
  const userRequests = user ? requests.filter(req => req.userId === user.id) : [];
  
  // Apply filters
  let filteredRequests = [...userRequests];
  
  if (filters.status && filters.status !== "all") {
    filteredRequests = filteredRequests.filter(req => req.status === filters.status);
  }
  
  if (filters.type && filters.type !== "all") {
    filteredRequests = filteredRequests.filter(req => req.type === filters.type);
  }
  
  if (filters.searchTerm) {
    const term = filters.searchTerm.toLowerCase();
    filteredRequests = filteredRequests.filter(req => 
      req.title.toLowerCase().includes(term) || 
      req.description.toLowerCase().includes(term)
    );
  }
  
  // Apply sorting
  filteredRequests.sort((a, b) => {
    if (sortField === 'date') {
      return sortDirection === 'asc' 
        ? new Date(a.date).getTime() - new Date(b.date).getTime()
        : new Date(b.date).getTime() - new Date(a.date).getTime();
    }
    
    if (sortField === 'amount') {
      return sortDirection === 'asc' 
        ? a.amount - b.amount
        : b.amount - a.amount;
    }
    
    // Default to title sorting
    return sortDirection === 'asc'
      ? a.title.localeCompare(b.title)
      : b.title.localeCompare(a.title);
  });
  
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) return null;
    
    return sortDirection === 'asc' 
      ? <ArrowUp className="h-4 w-4 ml-1" />
      : <ArrowDown className="h-4 w-4 ml-1" />;
  };
  
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
  
  const formatExpenseType = (type: ReimbursementType) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Requests</h1>
          <p className="text-muted-foreground">
            Manage and track your reimbursement requests
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportToCSV}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button onClick={() => navigate("/new-request")}>
            New Request
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Reimbursement History</CardTitle>
          <CardDescription>
            View and search through all your past reimbursement requests
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="flex relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search requests..."
                className="pl-8"
                value={filters.searchTerm || ""}
                onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
              />
            </div>
            <div className="flex gap-2">
              <Select
                value={filters.status || "all"}
                onValueChange={(value) => 
                  setFilters({ ...filters, status: value as ReimbursementStatus | "all" })
                }
              >
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
              
              <Select
                value={filters.type || "all"}
                onValueChange={(value) => 
                  setFilters({ ...filters, type: value as ReimbursementType | "all" })
                }
              >
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="travel">Travel</SelectItem>
                  <SelectItem value="meals">Meals</SelectItem>
                  <SelectItem value="equipment">Equipment</SelectItem>
                  <SelectItem value="software">Software</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {filteredRequests.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
              <h3 className="mt-4 text-lg font-medium">No requests found</h3>
              <p className="mt-1 text-muted-foreground">
                You haven't submitted any reimbursement requests matching your filters yet.
              </p>
              <Button className="mt-4" onClick={() => navigate("/new-request")}>
                Create your first request
              </Button>
            </div>
          ) : (
            <div className="rounded-md border overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead 
                      className="cursor-pointer"
                      onClick={() => handleSort('title')}
                    >
                      <div className="flex items-center">
                        Title
                        {renderSortIcon('title')}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer"
                      onClick={() => handleSort('amount')}
                    >
                      <div className="flex items-center">
                        Amount
                        {renderSortIcon('amount')}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer"
                      onClick={() => handleSort('date')}
                    >
                      <div className="flex items-center">
                        Date
                        {renderSortIcon('date')}
                      </div>
                    </TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell className="font-medium">{request.title}</TableCell>
                      <TableCell>${request.amount.toFixed(2)}</TableCell>
                      <TableCell>{new Date(request.date).toLocaleDateString()}</TableCell>
                      <TableCell>{formatExpenseType(request.type)}</TableCell>
                      <TableCell>{getStatusBadge(request.status)}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setSelectedRequest(request.id)}
                        >
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">View request</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Dialog 
        open={!!selectedRequest} 
        onOpenChange={(open) => !open && setSelectedRequest(null)}
      >
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedRequest && (
            <RequestDetailView requestId={selectedRequest} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Requests;
