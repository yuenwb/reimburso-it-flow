
import { useState } from "react";
import { useReimbursement, ReimbursementStatus } from "@/contexts/ReimbursementContext";
import { 
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/Spinner";
import { format } from "date-fns";
import { CheckCircle, XCircle } from "lucide-react";
import RequestDetailView from "./RequestDetailView";

interface RequestApprovalViewProps {
  requestId: string;
  onClose: () => void;
}

const RequestApprovalView = ({ requestId, onClose }: RequestApprovalViewProps) => {
  const [comment, setComment] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [selectedAction, setSelectedAction] = useState<ReimbursementStatus | null>(null);
  const { getRequestById, updateRequestStatus } = useReimbursement();
  
  const request = getRequestById(requestId);
  
  if (!request) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Request not found</p>
      </div>
    );
  }
  
  const handleActionClick = async (action: ReimbursementStatus) => {
    setSelectedAction(action);
  };
  
  const handleSubmit = async () => {
    if (!selectedAction) return;
    
    setIsSubmitting(true);
    try {
      await updateRequestStatus(requestId, selectedAction, comment);
      onClose();
    } catch (error) {
      console.error("Error updating request status:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <>
      <DialogHeader className="space-y-1">
        <DialogTitle className="text-xl">Review Request: {request.title}</DialogTitle>
        <DialogDescription>
          Submitted by {request.userName} on {format(new Date(request.createdAt), "MMMM d, yyyy")}
        </DialogDescription>
      </DialogHeader>
      
      {/* Show details of the request */}
      <div className="py-4 my-4 border-y">
        <RequestDetailView requestId={requestId} />
      </div>
      
      {/* Approval/Rejection UI */}
      <div className="space-y-4">
        <h3 className="font-medium">Decision</h3>
        
        <div className="flex gap-3">
          <Button
            className={`flex-1 ${selectedAction === "approved" ? "bg-green-600 hover:bg-green-700" : "bg-muted/50 hover:bg-muted text-foreground"}`}
            onClick={() => handleActionClick("approved")}
            disabled={isSubmitting}
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            Approve
          </Button>
          
          <Button
            variant="outline"
            className={`flex-1 ${selectedAction === "rejected" ? "bg-red-600 hover:bg-red-700 text-white" : ""}`}
            onClick={() => handleActionClick("rejected")}
            disabled={isSubmitting}
          >
            <XCircle className="mr-2 h-4 w-4" />
            Reject
          </Button>
        </div>
        
        <div className="space-y-2">
          <h3 className="font-medium">Comments (optional)</h3>
          <Textarea
            placeholder="Add any comments about your decision..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            disabled={isSubmitting}
          />
        </div>
      </div>
      
      <DialogFooter className="mt-4">
        <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          disabled={!selectedAction || isSubmitting}
          className={selectedAction === "approved" ? "bg-green-600 hover:bg-green-700" : selectedAction === "rejected" ? "bg-red-600 hover:bg-red-700" : ""}
        >
          {isSubmitting && <Spinner size="sm" className="mr-2" />}
          {selectedAction === "approved" ? "Confirm Approval" : selectedAction === "rejected" ? "Confirm Rejection" : "Select Decision"}
        </Button>
      </DialogFooter>
    </>
  );
};

export default RequestApprovalView;
