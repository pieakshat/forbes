import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Package } from "lucide-react";

interface HierarchySelectorProps {
  onSelectionChange: (selection: HierarchySelection) => void;
}

export interface HierarchySelection {
  group: string;
  month: number;
  year: number;
}

const hierarchyData = {
  groups: ["Group1", "Group2", "Group3", "Group4", "Group5"]
};

export const HierarchySelector = ({ onSelectionChange }: HierarchySelectorProps) => {
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const [selection, setSelection] = useState<HierarchySelection>({
    group: "",
    month: currentMonth,
    year: currentYear
  });

  const monthOptions = [
    { value: 1, label: "January" },
    { value: 2, label: "February" },
    { value: 3, label: "March" },
    { value: 4, label: "April" },
    { value: 5, label: "May" },
    { value: 6, label: "June" },
    { value: 7, label: "July" },
    { value: 8, label: "August" },
    { value: 9, label: "September" },
    { value: 10, label: "October" },
    { value: 11, label: "November" },
    { value: 12, label: "December" }
  ];

  const yearOptions = Array.from({ length: 5 }, (_, index) => currentYear - index);

  const handleChange = (key: keyof HierarchySelection, value: string) => {
    const parsedValue =
      key === "month" || key === "year" ? Number.parseInt(value, 10) : value;
    const newSelection = {
      ...selection,
      [key]: parsedValue
    } as HierarchySelection;

    setSelection(newSelection);

    // Call callback when group is selected
    if (newSelection.group) {
      onSelectionChange(newSelection as HierarchySelection);
    }
  };

  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Package className="w-4 h-4 text-primary" />
              <label className="text-sm font-medium">Group</label>
            </div>
            <Select
              value={selection.group || ""}
              onValueChange={(value) => handleChange("group", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Group" />
              </SelectTrigger>
              <SelectContent>
                {hierarchyData.groups.map((group) => (
                  <SelectItem key={group} value={group}>{group}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Package className="w-4 h-4 text-primary" />
              <label className="text-sm font-medium">Month</label>
            </div>
            <Select
              value={selection.month.toString()}
              onValueChange={(value) => handleChange("month", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Month" />
              </SelectTrigger>
              <SelectContent>
                {monthOptions.map((month) => (
                  <SelectItem key={month.value} value={month.value.toString()}>
                    {month.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Package className="w-4 h-4 text-primary" />
              <label className="text-sm font-medium">Year</label>
            </div>
            <Select
              value={selection.year.toString()}
              onValueChange={(value) => handleChange("year", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Year" />
              </SelectTrigger>
              <SelectContent>
                {yearOptions.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Selection Summary */}
        {selection.group && (
          <div className="mt-4 pt-4 border-t">
            <p className="text-sm text-muted-foreground mb-2">Current Selection:</p>
            <div className="flex flex-wrap gap-2">
              {selection.group && <Badge variant="secondary">{selection.group}</Badge>}
              <Badge variant="outline">
                {monthOptions.find((month) => month.value === selection.month)?.label}
              </Badge>
              <Badge variant="outline">{selection.year}</Badge>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};