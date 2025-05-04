
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useReimbursement, ReimbursementType, Receipt } from "@/contexts/ReimbursementContext";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon, FileUp, X, File, FileText } from "lucide-react";
import { Spinner } from "@/components/ui/Spinner";

const MAX_FILE_SIZE = 5000000; // 5MB
const ACCEPTED_FILE_TYPES = ["image/jpeg", "image/png", "image/gif", "application/pdf"];

const newRequestSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  amount: z.coerce
    .number()
    .positive("Amount must be positive")
    .min(0.01, "Amount must be at least 0.01"),
  date: z.date({
    required_error: "Please select a date",
  }),
  type: z.enum(["travel", "meals", "equipment", "software", "other"], {
    required_error: "Please select a type",
  }),
  description: z.string().min(10, "Description must be at least 10 characters"),
  receipts: z
    .array(
      z.object({
        id: z.string(),
        fileName: z.string(),
        fileUrl: z.string(),
        fileType: z.string(),
        uploadedAt: z.string(),
      })
    )
    .min(1, "At least one receipt is required"),
});

type NewRequestFormValues = z.infer<typeof newRequestSchema>;

const NewRequest = () => {
  const { submitRequest } = useReimbursement();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const form = useForm<NewRequestFormValues>({
    resolver: zodResolver(newRequestSchema),
    defaultValues: {
      title: "",
      amount: undefined,
      date: new Date(),
      type: undefined,
      description: "",
      receipts: [],
    },
  });

  const onSubmit = async (data: NewRequestFormValues) => {
    setIsSubmitting(true);
    try {
      await submitRequest({
        ...data,
        receipts,
      });
      toast.success("Reimbursement request submitted successfully");
      navigate("/requests");
    } catch (error) {
      console.error("Error submitting request:", error);
      toast.error("Failed to submit reimbursement request");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    handleFiles(files);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      handleFiles(files);
    }
  };

  const handleFiles = (files: FileList) => {
    // Convert FileList to array
    const fileArray = Array.from(files);

    // Validate file types and size
    const invalidFiles = fileArray.filter(
      (file) =>
        !ACCEPTED_FILE_TYPES.includes(file.type) || file.size > MAX_FILE_SIZE
    );

    if (invalidFiles.length > 0) {
      toast.error(
        "Some files were rejected. Please only upload images (JPG, PNG, GIF) or PDFs under 5MB."
      );
    }

    // Process valid files
    const validFiles = fileArray.filter(
      (file) =>
        ACCEPTED_FILE_TYPES.includes(file.type) && file.size <= MAX_FILE_SIZE
    );

    // Create receipt objects from valid files
    const newReceipts = validFiles.map((file) => {
      // Create object URL for preview
      const fileUrl = URL.createObjectURL(file);
      
      return {
        id: `rec-${generateId()}`,
        fileName: file.name,
        fileUrl,
        fileType: file.type.includes("image") ? "image" : "pdf",
        uploadedAt: new Date().toISOString(),
      };
    });

    // Update state with new receipts
    setReceipts((prev) => [...prev, ...newReceipts]);
    form.setValue("receipts", [...receipts, ...newReceipts]);
    form.clearErrors("receipts");
  };

  const removeReceipt = (id: string) => {
    const updatedReceipts = receipts.filter((receipt) => receipt.id !== id);
    setReceipts(updatedReceipts);
    form.setValue("receipts", updatedReceipts);
    
    if (updatedReceipts.length === 0) {
      form.setError("receipts", { 
        type: "manual", 
        message: "At least one receipt is required" 
      });
    }
  };

  // Generate a random ID for receipts
  const generateId = () => Math.random().toString(36).substring(2, 12);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">New Reimbursement Request</h1>
        <p className="text-muted-foreground">
          Submit a new reimbursement request with required details and receipts.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Reimbursement Details</CardTitle>
          <CardDescription>
            Provide information about your expense
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="E.g., Office Supplies, Business Trip" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount ($)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Date of Expense</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date > new Date() || 
                              date < new Date(new Date().setFullYear(new Date().getFullYear() - 1))
                            }
                            initialFocus
                            className="pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                      <FormDescription>
                        Date when the expense was incurred.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select expense type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="travel">Travel</SelectItem>
                          <SelectItem value="meals">Meals</SelectItem>
                          <SelectItem value="equipment">Equipment</SelectItem>
                          <SelectItem value="software">Software</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Provide details about the expense..."
                        className="min-h-[100px] resize-y"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Explain the purpose of this expense and how it relates to your work.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="receipts"
                render={() => (
                  <FormItem>
                    <FormLabel>Receipts</FormLabel>
                    <FormControl>
                      <div
                        className={cn(
                          "file-input-area border-input transition-colors",
                          isDragging && "border-primary bg-primary/5",
                          receipts.length === 0 && form.formState.errors.receipts && "border-destructive"
                        )}
                        onDragOver={(e) => {
                          e.preventDefault();
                          setIsDragging(true);
                        }}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={handleFileDrop}
                      >
                        <FileUp className="h-8 w-8 text-muted-foreground mb-2" />
                        <div className="text-center">
                          <p className="font-medium">
                            Drag and drop files here
                          </p>
                          <p className="text-sm text-muted-foreground mb-2">
                            or click to browse
                          </p>
                          <Input
                            type="file"
                            className="hidden"
                            onChange={handleFileInput}
                            accept={ACCEPTED_FILE_TYPES.join(",")}
                            multiple
                            id="receipts-upload"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              document
                                .getElementById("receipts-upload")
                                ?.click();
                            }}
                          >
                            Select Files
                          </Button>
                          <p className="text-xs text-muted-foreground mt-2">
                            JPG, PNG, GIF or PDF (max 5MB)
                          </p>
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Receipt preview */}
              {receipts.length > 0 && (
                <div>
                  <h3 className="font-medium mb-2">Uploaded Files</h3>
                  <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
                    {receipts.map((receipt) => (
                      <div
                        key={receipt.id}
                        className="flex items-center p-2 border rounded-md bg-muted/20"
                      >
                        <div className="p-2 bg-background rounded">
                          {receipt.fileType === "image" ? (
                            <img
                              src={receipt.fileUrl}
                              alt={receipt.fileName}
                              className="w-10 h-10 object-cover rounded"
                            />
                          ) : (
                            <FileText className="w-10 h-10 text-primary" />
                          )}
                        </div>
                        <div className="ml-3 flex-grow overflow-hidden">
                          <p className="text-sm font-medium truncate">
                            {receipt.fileName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Uploaded {new Date(receipt.uploadedAt).toLocaleTimeString()}
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeReceipt(receipt.id)}
                          className="flex-shrink-0"
                        >
                          <X className="h-4 w-4" />
                          <span className="sr-only">Remove file</span>
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/requests")}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Spinner size="sm" className="mr-2" />}
                  Submit Request
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default NewRequest;
