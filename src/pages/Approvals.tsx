
import { useState } from "react";
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
  Eye,
  CheckCircle,
  XCircle
} from "lucide-react";
import RequestDetailView from "@/components/RequestDetailView";
import RequestApprovalView from "@/components/RequestApprovalView";
import { format } from "date-fns";

type SortField = 'date' | 'amount' | 'name';
type SortDirection = 'asc' | 'desc';
type ViewMode = 'detail' | 'approval';

const Approvals = () => {
  const { 
    requests, 
    isLoading, 
    filters, 
    setFilters,
    exportToCSV
  } = useReimbursement();
  
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('detail');
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  
  // All pending requests that need manager approval
  const pendingRequests = requests.filter(req => req.status === "pending");
  
  // Apply filters
  let filteredRequests = [...pendingRequests];
  
  if (filters.type && filters.type !== "all") {
    filteredRequests = filteredRequests.filter(req => req.type === filters.type);
  }
  
  if (filters.searchTerm) {
    const term = filters.searchTerm.toLowerCase();
    filteredRequests = filteredRequests.filter(req => 
      req.title.toLowerCase().includes(term) || 
      req.description.toLowerCase().includes(term) ||
      req.userName.toLowerCase().includes(term) ||
      req.userDepartment.toLowerCase().includes(term)
    );
  }
  
  // Apply sorting
  filteredRequests.sort((a, b) => {
    if (sortField === 'date') {
      return sortDirection === 'asc' 
        ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    
    if (sortField === 'amount') {
      return sortDirection === 'asc' 
        ? a.amount - b.amount
        : b.amount - a.amount;
    }
    
    // Name sorting
    return sortDirection === 'asc'
      ? a.userName.localeCompare(b.userName)
      : b.userName.localeCompare(a.userName);
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
  
  const formatExpenseType = (type: ReimbursementType) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };
  
  const handleViewDetail = (id: string) => {
    setSelectedRequest(id);
    setViewMode('detail');
  };
  
  const handleApprove = (id: string) => {
    setSelectedRequest(id);
    setViewMode('approval');
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
          <h1 className="text-2xl font-bold tracking-tight">Approval Queue</h1>
          <p className="text-muted-foreground">
            Review and approve pending reimbursement requests
          </p>
        </div>
        <Button variant="outline" onClick={exportToCSV}>
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Pending Requests</CardTitle>
          <CardDescription>
            Requests that need your approval
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="flex relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by title, employee name, or department..."
                className="pl-8"
                value={filters.searchTerm || ""}
                onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
              />
            </div>
            <div className="flex gap-2">
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
              <h3 className="mt-4 text-lg font-medium">No pending requests</h3>
              <p className="mt-1 text-muted-foreground">
                There are currently no reimbursement requests waiting for approval.
              </p>
            </div>
          ) : (
            <div className="rounded-md border overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      Title
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer"
                      onClick={() => handleSort('name')}
                    >
                      <div className="flex items-center">
                        Employee
                        {renderSortIcon('name')}
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
                        Submitted
                        {renderSortIcon('date')}
                      </div>
                    </TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell className="font-medium">{request.title}</TableCell>
                      <TableCell>
                        <div>
                          <div>{request.userName}</div>
                          <div className="text-xs text-muted-foreground">{request.userDepartment}</div>
                        </div>
                      </TableCell>
                      <TableCell>${request.amount.toFixed(2)}</TableCell>
                      <TableCell>{format(new Date(request.createdAt), "MMM d, yyyy")}</TableCell>
                      <TableCell>{formatExpenseType(request.type)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleViewDetail(request.id)}
                          >
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">View request</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-green-600 hover:text-green-800 hover:bg-green-100"
                            onClick={() => handleApprove(request.id)}
                          >
                            <CheckCircle className="h-4 w-4" />
                            <span className="sr-only">Approve request</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-600 hover:text-red-800 hover:bg-red-100"
                            onClick={() => handleApprove(request.id)}
                          >
                            <XCircle className="h-4 w-4" />
                            <span className="sr-only">Reject request</span>
                          </Button>
                        </div>
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
          {selectedRequest && viewMode === 'detail' && (
            <RequestDetailView requestId={selectedRequest} />
          )}
          {selectedRequest && viewMode === 'approval' && (
            <RequestApprovalView 
              requestId={selectedRequest} 
              onClose={() => setSelectedRequest(null)} 
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Approvals;
