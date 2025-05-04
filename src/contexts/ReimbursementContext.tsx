
import React, { createContext, useState, useContext, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { toast } from "sonner";

// Make sure ReimbursementType is exported as a type
export type ReimbursementType = "travel" | "meals" | "equipment" | "software" | "other";
export type ReimbursementStatus = "pending" | "approved" | "rejected";

export interface Receipt {
  id: string;
  fileName: string;
  fileUrl: string; // In a real app, this would point to the actual file location
  fileType: string; // "image" or "pdf"
  uploadedAt: string;
}

export interface ReimbursementRequest {
  id: string;
  title: string;
  amount: number;
  date: string;
  type: ReimbursementType;
  description: string;
  status: ReimbursementStatus;
  receipts: Receipt[];
  userId: string;
  userName: string;
  userDepartment: string;
  createdAt: string;
  updatedAt: string;
  approverName?: string;
  approverComment?: string;
  approvedOrRejectedAt?: string;
}

export interface ReimbursementFilters {
  status?: ReimbursementStatus | "all";
  type?: ReimbursementType | "all";
  dateFrom?: string;
  dateTo?: string;
  searchTerm?: string;
}

interface ReimbursementContextType {
  requests: ReimbursementRequest[];
  filters: ReimbursementFilters;
  isLoading: boolean;
  error: string | null;
  setFilters: React.Dispatch<React.SetStateAction<ReimbursementFilters>>;
  submitRequest: (newRequest: Omit<ReimbursementRequest, "id" | "userId" | "userName" | "userDepartment" | "status" | "createdAt" | "updatedAt">) => Promise<void>;
  updateRequestStatus: (id: string, status: ReimbursementStatus, comment?: string) => Promise<void>;
  getRequestById: (id: string) => ReimbursementRequest | undefined;
  exportToCSV: () => void;
}

// Make sure to export the ReimbursementType values as a constant for use in Reports.tsx
export const REIMBURSEMENT_TYPES: ReimbursementType[] = ["travel", "meals", "equipment", "software", "other"];

// Generate a UUID
const generateId = () => Math.random().toString(36).substring(2, 12);

// Sample data
const MOCK_REQUESTS: ReimbursementRequest[] = [
  {
    id: "req-001",
    title: "Team Lunch",
    amount: 85.25,
    date: "2023-04-15",
    type: "meals",
    description: "Team lunch with the IT department to discuss the new server infrastructure.",
    status: "approved",
    receipts: [
      {
        id: "rec-001",
        fileName: "lunch_receipt.jpg",
        fileUrl: "https://via.placeholder.com/150",
        fileType: "image",
        uploadedAt: "2023-04-15T14:30:00Z",
      }
    ],
    userId: "1",
    userName: "John Employee",
    userDepartment: "IT",
    createdAt: "2023-04-15T15:00:00Z",
    updatedAt: "2023-04-16T09:30:00Z",
    approverName: "Sarah Manager",
    approverComment: "Approved. Valid team lunch expense.",
    approvedOrRejectedAt: "2023-04-16T09:30:00Z",
  },
  {
    id: "req-002",
    title: "New Laptop",
    amount: 1299.99,
    date: "2023-04-20",
    type: "equipment",
    description: "Replacement laptop for development work as per equipment policy.",
    status: "pending",
    receipts: [
      {
        id: "rec-002",
        fileName: "laptop_receipt.pdf",
        fileUrl: "https://via.placeholder.com/150",
        fileType: "pdf",
        uploadedAt: "2023-04-20T10:15:00Z",
      }
    ],
    userId: "1",
    userName: "John Employee",
    userDepartment: "IT",
    createdAt: "2023-04-20T10:30:00Z",
    updatedAt: "2023-04-20T10:30:00Z",
  },
  {
    id: "req-003",
    title: "Conference Tickets",
    amount: 599.00,
    date: "2023-05-01",
    type: "travel",
    description: "Tickets for the annual tech conference in San Francisco.",
    status: "rejected",
    receipts: [
      {
        id: "rec-003",
        fileName: "conf_tickets.pdf",
        fileUrl: "https://via.placeholder.com/150",
        fileType: "pdf",
        uploadedAt: "2023-05-01T09:45:00Z",
      }
    ],
    userId: "1",
    userName: "John Employee",
    userDepartment: "IT",
    createdAt: "2023-05-01T10:00:00Z",
    updatedAt: "2023-05-02T11:20:00Z",
    approverName: "Sarah Manager",
    approverComment: "Rejected. We already have enough team members attending this conference.",
    approvedOrRejectedAt: "2023-05-02T11:20:00Z",
  },
  {
    id: "req-004",
    title: "Software License",
    amount: 299.99,
    date: "2023-05-10",
    type: "software",
    description: "Annual license for development IDE.",
    status: "approved",
    receipts: [
      {
        id: "rec-004",
        fileName: "license_invoice.pdf",
        fileUrl: "https://via.placeholder.com/150",
        fileType: "pdf",
        uploadedAt: "2023-05-10T14:00:00Z",
      }
    ],
    userId: "1",
    userName: "John Employee",
    userDepartment: "IT",
    createdAt: "2023-05-10T14:30:00Z",
    updatedAt: "2023-05-11T09:15:00Z",
    approverName: "Sarah Manager",
    approverComment: "Approved. Standard software expense.",
    approvedOrRejectedAt: "2023-05-11T09:15:00Z",
  },
  // More sample data for different users and scenarios
  {
    id: "req-005",
    title: "Office Supplies",
    amount: 45.75,
    date: "2023-05-15",
    type: "other",
    description: "Notebooks, pens and other office supplies.",
    status: "pending",
    receipts: [
      {
        id: "rec-005",
        fileName: "office_supplies.jpg",
        fileUrl: "https://via.placeholder.com/150",
        fileType: "image",
        uploadedAt: "2023-05-15T11:30:00Z",
      }
    ],
    userId: "2",
    userName: "Sarah Manager",
    userDepartment: "IT",
    createdAt: "2023-05-15T12:00:00Z",
    updatedAt: "2023-05-15T12:00:00Z",
  }
];

const ReimbursementContext = createContext<ReimbursementContextType | undefined>(undefined);

export const ReimbursementProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<ReimbursementRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ReimbursementFilters>({
    status: "all",
    type: "all",
    searchTerm: ""
  });

  // Load initial data
  useEffect(() => {
    const fetchRequests = async () => {
      setIsLoading(true);
      try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Check local storage first for cached data
        const cachedRequests = localStorage.getItem("reimbursementRequests");
        
        if (cachedRequests) {
          setRequests(JSON.parse(cachedRequests));
        } else {
          // If no cached data, use mock data
          setRequests(MOCK_REQUESTS);
          // Cache the mock data
          localStorage.setItem("reimbursementRequests", JSON.stringify(MOCK_REQUESTS));
        }
        
      } catch (err) {
        console.error("Failed to fetch reimbursement requests:", err);
        setError("Failed to load reimbursement requests. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchRequests();
  }, []);

  // Submit a new reimbursement request
  const submitRequest = async (newRequest: Omit<ReimbursementRequest, "id" | "userId" | "userName" | "userDepartment" | "status" | "createdAt" | "updatedAt">) => {
    if (!user) {
      throw new Error("You must be logged in to submit a request");
    }
    
    setIsLoading(true);
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const timestamp = new Date().toISOString();
      
      const fullRequest: ReimbursementRequest = {
        ...newRequest,
        id: `req-${generateId()}`,
        userId: user.id,
        userName: user.name,
        userDepartment: user.department,
        status: "pending",
        createdAt: timestamp,
        updatedAt: timestamp,
      };
      
      // Update state with the new request
      setRequests(prev => {
        const updated = [fullRequest, ...prev];
        // Update cache in localStorage
        localStorage.setItem("reimbursementRequests", JSON.stringify(updated));
        return updated;
      });
      
      // Simulate notification dispatch
      console.log("🐰 RabbitMQ: New reimbursement request notification dispatched");
      
      toast.success("Reimbursement request submitted successfully");
    } catch (err) {
      console.error("Failed to submit reimbursement request:", err);
      setError("Failed to submit request. Please try again.");
      toast.error("Failed to submit reimbursement request");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Update request status (approve/reject)
  const updateRequestStatus = async (id: string, status: ReimbursementStatus, comment?: string) => {
    if (!user) {
      throw new Error("You must be logged in to update a request");
    }
    
    if (!user.role || (user.role !== "manager" && user.role !== "admin")) {
      throw new Error("You don't have permission to update request status");
    }
    
    setIsLoading(true);
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Update the request status
      setRequests(prev => {
        const updated = prev.map(req => {
          if (req.id === id) {
            return {
              ...req,
              status,
              updatedAt: new Date().toISOString(),
              approverName: user.name,
              approverComment: comment || undefined,
              approvedOrRejectedAt: new Date().toISOString(),
            };
          }
          return req;
        });
        
        // Update cache in localStorage
        localStorage.setItem("reimbursementRequests", JSON.stringify(updated));
        return updated;
      });
      
      // Simulate notification dispatch
      console.log(`🐰 RabbitMQ: Reimbursement request ${status} notification dispatched`);
      console.log(`🔄 Redis: Updated request cache for ID: ${id}`);
      
      toast.success(`Request ${status} successfully`);
    } catch (err) {
      console.error(`Failed to ${status} request:`, err);
      setError(`Failed to ${status} request. Please try again.`);
      toast.error(`Failed to ${status} request`);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Get a specific request by ID
  const getRequestById = (id: string) => {
    return requests.find(req => req.id === id);
  };

  // Export requests to CSV
  const exportToCSV = () => {
    try {
      // Filter requests based on current filters
      let filteredRequests = [...requests];
      
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
          req.description.toLowerCase().includes(term) ||
          req.userName.toLowerCase().includes(term)
        );
      }
      
      // Create CSV content
      const headers = ["ID", "Title", "Amount", "Date", "Type", "Status", "Submitted By", "Department", "Created At"];
      const csvRows = [
        headers.join(","),
        ...filteredRequests.map(req => {
          return [
            req.id,
            `"${req.title.replace(/"/g, '""')}"`, // Escape quotes in title
            req.amount,
            req.date,
            req.type,
            req.status,
            `"${req.userName}"`,
            req.userDepartment,
            new Date(req.createdAt).toLocaleDateString()
          ].join(",");
        })
      ];
      
      // Create and trigger download
      const csvContent = csvRows.join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `reimbursement_requests_${new Date().toISOString().split("T")[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success("CSV file downloaded successfully");
    } catch (err) {
      console.error("Failed to export to CSV:", err);
      toast.error("Failed to export data to CSV");
    }
  };

  return (
    <ReimbursementContext.Provider
      value={{
        requests,
        filters,
        isLoading,
        error,
        setFilters,
        submitRequest,
        updateRequestStatus,
        getRequestById,
        exportToCSV
      }}
    >
      {children}
    </ReimbursementContext.Provider>
  );
};

export const useReimbursement = () => {
  const context = useContext(ReimbursementContext);
  
  if (context === undefined) {
    throw new Error("useReimbursement must be used within a ReimbursementProvider");
  }
  
  return context;
};
