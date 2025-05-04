
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Download } from "lucide-react";

interface TimeRangeSelectorProps {
  timeRange: string;
  setTimeRange: (value: string) => void;
  onExport: () => void;
}

export const TimeRangeSelector = ({ 
  timeRange, 
  setTimeRange, 
  onExport 
}: TimeRangeSelectorProps) => {
  return (
    <div className="flex gap-2">
      <Select
        value={timeRange}
        onValueChange={setTimeRange}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select time range" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="30-days">Last 30 Days</SelectItem>
          <SelectItem value="90-days">Last 90 Days</SelectItem>
          <SelectItem value="year-to-date">Year to Date</SelectItem>
          <SelectItem value="all-time">All Time</SelectItem>
        </SelectContent>
      </Select>
      <Button variant="outline" onClick={onExport}>
        <Download className="mr-2 h-4 w-4" />
        Export Data
      </Button>
    </div>
  );
};
