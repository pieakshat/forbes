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
}

// Mock data - In real app, this would come from API
const hierarchyData = {
  groups: ["Group1", "Group2", "Group3", "Group4", "Group5"]
};

export const HierarchySelector = ({ onSelectionChange }: HierarchySelectorProps) => {
  const [selection, setSelection] = useState<Partial<HierarchySelection>>({});

  const handleChange = (key: keyof HierarchySelection, value: string) => {
    const newSelection = { ...selection, [key]: value };

    setSelection(newSelection);

    // Call callback when group is selected
    if (newSelection.group) {
      onSelectionChange(newSelection as HierarchySelection);
    }
  };

  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
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
        </div>

        {/* Selection Summary */}
        {selection.group && (
          <div className="mt-4 pt-4 border-t">
            <p className="text-sm text-muted-foreground mb-2">Current Selection:</p>
            <div className="flex flex-wrap gap-2">
              {selection.group && <Badge variant="secondary">{selection.group}</Badge>}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};