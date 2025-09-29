import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { MapPin, Building, Factory, Package } from "lucide-react";

interface HierarchySelectorProps {
  onSelectionChange: (selection: HierarchySelection) => void;
}

export interface HierarchySelection {
  city: string;
  area: string;
  plant: string;
  product: string;
}

// Mock data - In real app, this would come from API
const hierarchyData = {
  cities: ["Mumbai", "Pune", "Chennai", "Delhi", "Bangalore"],
  areas: {
    "Mumbai": ["Andheri", "Bandra", "Powai"],
    "Pune": ["Hadapsar", "Hinjewadi", "Kharadi"],
    "Chennai": ["Anna Nagar", "T. Nagar", "Velachery"],
    "Delhi": ["Gurgaon", "Noida", "Faridabad"],
    "Bangalore": ["Electronic City", "Whitefield", "Koramangala"]
  },
  plants: {
    "Andheri": ["Plant A1", "Plant A2", "Plant A3"],
    "Bandra": ["Plant B1", "Plant B2"],
    "Powai": ["Plant P1", "Plant P2", "Plant P3"],
    "Hadapsar": ["Plant H1", "Plant H2"],
    "Hinjewadi": ["Plant HJ1", "Plant HJ2", "Plant HJ3"],
  },
  products: {
    "Plant A1": ["Steam Systems", "Control Valves", "Safety Valves"],
    "Plant A2": ["Boiler Controls", "Water Treatment", "Energy Solutions"],
    "Plant A3": ["Industrial Automation", "Process Controls"],
    "Plant B1": ["Steam Traps", "Condensate Recovery"],
    "Plant B2": ["Heat Exchangers", "Pressure Vessels"]
  }
};

export const HierarchySelector = ({ onSelectionChange }: HierarchySelectorProps) => {
  const [selection, setSelection] = useState<Partial<HierarchySelection>>({});

  const handleChange = (key: keyof HierarchySelection, value: string) => {
    const newSelection = { ...selection, [key]: value };
    
    // Reset dependent fields when parent changes
    if (key === "city") {
      newSelection.area = "";
      newSelection.plant = "";
      newSelection.product = "";
    } else if (key === "area") {
      newSelection.plant = "";
      newSelection.product = "";
    } else if (key === "plant") {
      newSelection.product = "";
    }
    
    setSelection(newSelection);
    
    // Only call callback when all fields are selected
    if (newSelection.city && newSelection.area && newSelection.plant && newSelection.product) {
      onSelectionChange(newSelection as HierarchySelection);
    }
  };

  const getAvailableOptions = (key: keyof HierarchySelection) => {
    switch (key) {
      case "city":
        return hierarchyData.cities;
      case "area":
        return selection.city ? hierarchyData.areas[selection.city as keyof typeof hierarchyData.areas] || [] : [];
      case "plant":
        return selection.area ? hierarchyData.plants[selection.area as keyof typeof hierarchyData.plants] || [] : [];
      case "product":
        return selection.plant ? hierarchyData.products[selection.plant as keyof typeof hierarchyData.products] || [] : [];
      default:
        return [];
    }
  };

  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-primary" />
              <label className="text-sm font-medium">City</label>
            </div>
            <Select 
              value={selection.city || ""} 
              onValueChange={(value) => handleChange("city", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select City" />
              </SelectTrigger>
              <SelectContent>
                {getAvailableOptions("city").map((city) => (
                  <SelectItem key={city} value={city}>{city}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Building className="w-4 h-4 text-primary" />
              <label className="text-sm font-medium">Area</label>
            </div>
            <Select 
              value={selection.area || ""} 
              onValueChange={(value) => handleChange("area", value)}
              disabled={!selection.city}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Area" />
              </SelectTrigger>
              <SelectContent>
                {getAvailableOptions("area").map((area) => (
                  <SelectItem key={area} value={area}>{area}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Factory className="w-4 h-4 text-primary" />
              <label className="text-sm font-medium">Plant</label>
            </div>
            <Select 
              value={selection.plant || ""} 
              onValueChange={(value) => handleChange("plant", value)}
              disabled={!selection.area}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Plant" />
              </SelectTrigger>
              <SelectContent>
                {getAvailableOptions("plant").map((plant) => (
                  <SelectItem key={plant} value={plant}>{plant}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Package className="w-4 h-4 text-primary" />
              <label className="text-sm font-medium">Product</label>
            </div>
            <Select 
              value={selection.product || ""} 
              onValueChange={(value) => handleChange("product", value)}
              disabled={!selection.plant}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Product" />
              </SelectTrigger>
              <SelectContent>
                {getAvailableOptions("product").map((product) => (
                  <SelectItem key={product} value={product}>{product}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Selection Summary */}
        {Object.values(selection).some(v => v) && (
          <div className="mt-4 pt-4 border-t">
            <p className="text-sm text-muted-foreground mb-2">Current Selection:</p>
            <div className="flex flex-wrap gap-2">
              {selection.city && <Badge variant="secondary">{selection.city}</Badge>}
              {selection.area && <Badge variant="secondary">{selection.area}</Badge>}
              {selection.plant && <Badge variant="secondary">{selection.plant}</Badge>}
              {selection.product && <Badge variant="secondary">{selection.product}</Badge>}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};