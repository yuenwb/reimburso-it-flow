
import { useReimbursement, Receipt } from "@/contexts/ReimbursementContext";
import { format } from "date-fns";
import { 
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { 
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/Spinner";
import { FileText, Paperclip } from "lucide-react";

interface RequestDetailViewProps {
  requestId: string;
}

const ReceiptView = ({ receipt }: { receipt: Receipt }) => {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        {receipt.fileType === "image" ? (
          <div className="relative aspect-video bg-muted">
            <img
              src={receipt.fileUrl}
              alt={receipt.fileName}
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="aspect-video flex items-center justify-center bg-muted p-6">
            <div className="text-center">
              <FileText className="h-12 w-12 mx-auto text-primary" />
              <p className="mt-2 font-medium">{receipt.fileName}</p>
              <p className="text-sm text-muted-foreground">PDF Document</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const RequestDetailView = ({ requestId }: RequestDetailViewProps) => {
  const { getRequestById, isLoading } = useReimbursement();
  const request = getRequestById(requestId);
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-32">
        <Spinner size="lg" />
      </div>
    );
  }
  
  if (!request) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Request not found</p>
      </div>
    );
  }
  
  const formatExpenseType = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };
  
  const getStatusText = () => {
    switch (request.status) {
      case "approved":
        return (
          <div className="flex gap-2 items-center">
            <span className="status-badge status-approved">Approved</span>
            <span className="text-sm">
              by {request.approverName} on {new Date(request.approvedOrRejectedAt!).toLocaleDateString()}
            </span>
          </div>
        );
      case "rejected":
        return (
          <div className="flex gap-2 items-center">
            <span className="status-badge status-rejected">Rejected</span>
            <span className="text-sm">
              by {request.approverName} on {new Date(request.approvedOrRejectedAt!).toLocaleDateString()}
            </span>
          </div>
        );
      default:
        return <span className="status-badge status-pending">Pending</span>;
    }
  };

  return (
    <>
      <DialogHeader className="space-y-1">
        <DialogTitle className="text-xl">{request.title}</DialogTitle>
        <DialogDescription className="flex items-center gap-2">
          Submitted by {request.userName} on {format(new Date(request.createdAt), "MMMM d, yyyy")}
        </DialogDescription>
      </DialogHeader>
      
      <Tabs defaultValue="details" className="mt-4">
        <TabsList className="mb-4">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="receipts">
            Receipts ({request.receipts.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="details" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Amount</h3>
              <p className="text-2xl font-bold">${request.amount.toFixed(2)}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Status</h3>
              <div className="text-md">{getStatusText()}</div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Expense Date</h3>
              <p>{format(new Date(request.date), "MMMM d, yyyy")}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Type</h3>
              <p>{formatExpenseType(request.type)}</p>
            </div>
            
            <div className="md:col-span-2">
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Description</h3>
              <p className="whitespace-pre-line">{request.description}</p>
            </div>
          </div>
          
          {(request.status === "approved" || request.status === "rejected") && request.approverComment && (
            <>
              <Separator className="my-4" />
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">
                  {request.status === "approved" ? "Approval" : "Rejection"} Comments
                </h3>
                <p className="italic">{request.approverComment}</p>
              </div>
            </>
          )}
        </TabsContent>
        
        <TabsContent value="receipts">
          {request.receipts.length === 0 ? (
            <div className="text-center py-8">
              <Paperclip className="h-10 w-10 mx-auto text-muted-foreground opacity-50" />
              <p className="mt-4 text-muted-foreground">No receipts attached</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {request.receipts.map((receipt) => (
                <ReceiptView key={receipt.id} receipt={receipt} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </>
  );
};

export default RequestDetailView;
