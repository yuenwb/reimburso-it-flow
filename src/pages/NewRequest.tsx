import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useReimbursement, Receipt } from "@/contexts/ReimbursementContext";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  title: z.string().min(3, {
    message: "Title must be at least 3 characters.",
  }),
  amount: z.coerce.number().positive({
    message: "Amount must be a positive number.",
  }),
  date: z.date({
    required_error: "Please select a date.",
  }),
  type: z.enum(["travel", "meals", "equipment", "software", "other"], {
    required_error: "Please select a reimbursement type.",
  }),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }),
});

const NewRequest = () => {
  const navigate = useNavigate();
  const { submitRequest, isLoading } = useReimbursement();
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      amount: 0,
      description: "",
    },
  });
  
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      // Make sure to define all required properties with non-optional values
      await submitRequest({
        title: values.title,
        amount: values.amount,
        date: format(values.date, "yyyy-MM-dd"),
        type: values.type,
        description: values.description,
        receipts: receipts
      });
      
      toast.success("Reimbursement request created successfully");
      navigate("/requests");
    } catch (error) {
      console.error("Failed to submit reimbursement request:", error);
      toast.error("Failed to create reimbursement request");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    setFiles(selectedFiles);

    const newReceipts: Receipt[] = selectedFiles.map(file => ({
      id: `rec-${Math.random().toString(36).substring(2, 12)}`,
      fileName: file.name,
      fileUrl: URL.createObjectURL(file),
      fileType: file.type.startsWith("image/") ? "image" : "pdf",
      uploadedAt: new Date().toISOString(),
    }));

    setReceipts(prevReceipts => [...prevReceipts, ...newReceipts]);
  };

  const removeReceipt = (id: string) => {
    setReceipts(prevReceipts => prevReceipts.filter(receipt => receipt.id !== id));
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">New Reimbursement Request</h1>
        <p className="text-muted-foreground">
          Fill out the form below to submit a new reimbursement request
        </p>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input placeholder="Expense Title" {...field} />
                </FormControl>
                <FormDescription>
                  Give your expense a clear and concise title.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Amount</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="0.00" {...field} />
                </FormControl>
                <FormDescription>
                  Enter the total amount of the expense.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-[240px] pl-3 text-left font-normal",
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
                        date > new Date() || date < new Date("2023-01-01")
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormDescription>
                  Select the date of the expense.
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
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a type" />
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
                <FormDescription>
                  Choose the category that best describes your expense.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Detailed description of the expense"
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Provide a detailed description of the expense.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div>
            <FormLabel>Receipts</FormLabel>
            <FormDescription>
              Upload receipts for your expense.
            </FormDescription>
            <Input
              type="file"
              multiple
              accept="image/*, application/pdf"
              onChange={handleFileChange}
            />

            {receipts.length > 0 && (
              <div className="mt-4">
                <h3 className="text-sm font-medium">Uploaded Receipts:</h3>
                <div className="flex flex-wrap gap-4 mt-2">
                  {receipts.map((receipt) => (
                    <div key={receipt.id} className="relative">
                      {receipt.fileType === "image" ? (
                        <img
                          src={receipt.fileUrl}
                          alt={receipt.fileName}
                          className="w-32 h-32 object-cover rounded-md"
                        />
                      ) : (
                        <div className="w-32 h-32 flex items-center justify-center rounded-md bg-gray-100">
                          <p className="text-sm text-gray-500">PDF File</p>
                        </div>
                      )}
                      <button
                        onClick={() => removeReceipt(receipt.id)}
                        className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-400"
                      >
                        X
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <Button type="submit" disabled={isLoading}>
            Submit Request
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default NewRequest;
