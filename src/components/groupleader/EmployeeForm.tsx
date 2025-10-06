import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pencil, Trash2, Plus } from "lucide-react";
import { Employee } from "@/pages/GroupLeaderPanel";
import { useToast } from "@/hooks/use-toast";

interface EmployeeFormProps {
  employees: Employee[];
  onAddEmployee: (employee: Employee) => void;
  onUpdateEmployee: (employee: Employee) => void;
  onDeleteEmployee: (id: string) => void;
}

export function EmployeeForm({ employees, onAddEmployee, onUpdateEmployee, onDeleteEmployee }: EmployeeFormProps) {
  const { toast } = useToast();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<{
    name: string;
    tokenNumber: string;
    designation: string;
    employmentType: "On-Roll" | "Contract" | "FTE" | "Apprenticeship";
    group: string;
  }>({
    name: "",
    tokenNumber: "",
    designation: "",
    employmentType: "Contract",
    group: "",
  });

  const resetForm = () => {
    setFormData({
      name: "",
      tokenNumber: "",
      designation: "",
      employmentType: "Contract",
      group: "",
    });
    setEditingId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.tokenNumber || !formData.designation || !formData.group) {
      toast({
        title: "Missing Information",
        description: "Please fill all required fields",
        variant: "destructive",
      });
      return;
    }

    if (editingId) {
      onUpdateEmployee({ ...formData, id: editingId });
      toast({ title: "Employee Updated", description: `${formData.name} has been updated successfully` });
    } else {
      onAddEmployee({ ...formData, id: Date.now().toString() });
      toast({ title: "Employee Added", description: `${formData.name} has been added successfully` });
    }
    
    resetForm();
  };

  const handleEdit = (employee: Employee) => {
    setFormData({
      name: employee.name,
      tokenNumber: employee.tokenNumber,
      designation: employee.designation,
      employmentType: employee.employmentType,
      group: employee.group,
    });
    setEditingId(employee.id);
  };

  const handleDelete = (id: string, name: string) => {
    onDeleteEmployee(id);
    toast({ title: "Employee Removed", description: `${name} has been removed` });
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg bg-card">
        <div className="space-y-2">
          <Label htmlFor="name">Employee Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Enter full name"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="token">Token Number *</Label>
          <Input
            id="token"
            value={formData.tokenNumber}
            onChange={(e) => setFormData({ ...formData, tokenNumber: e.target.value })}
            placeholder="e.g. 101"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="designation">Designation / Role *</Label>
          <Input
            id="designation"
            value={formData.designation}
            onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
            placeholder="e.g. Packer, Loader"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="type">Employment Type *</Label>
          <Select
            value={formData.employmentType}
            onValueChange={(value: any) => setFormData({ ...formData, employmentType: value })}
          >
            <SelectTrigger id="type" className="bg-background">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-background z-50">
              <SelectItem value="On-Roll">On-Roll</SelectItem>
              <SelectItem value="Contract">Contract</SelectItem>
              <SelectItem value="FTE">FTE</SelectItem>
              <SelectItem value="Apprenticeship">Apprenticeship</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="group">Assigned Group *</Label>
          <Input
            id="group"
            value={formData.group}
            onChange={(e) => setFormData({ ...formData, group: e.target.value })}
            placeholder="e.g. G1, G2, G3"
          />
        </div>

        <div className="flex items-end gap-2">
          <Button type="submit" className="flex-1">
            {editingId ? "Update Employee" : <><Plus className="w-4 h-4 mr-2" /> Add Employee</>}
          </Button>
          {editingId && (
            <Button type="button" variant="outline" onClick={resetForm}>
              Cancel
            </Button>
          )}
        </div>
      </form>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Token</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Designation</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Group</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {employees.map((employee) => (
              <TableRow key={employee.id}>
                <TableCell className="font-medium">{employee.tokenNumber}</TableCell>
                <TableCell>{employee.name}</TableCell>
                <TableCell>{employee.designation}</TableCell>
                <TableCell>{employee.employmentType}</TableCell>
                <TableCell>{employee.group}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(employee)}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(employee.id, employee.name)}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
