import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pencil, Trash2, Plus, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Employee {
  token_no: string;
  name: string;
  group: string | null;
  desig: string | null;
  role: string | null;
  created_at: string;
}

interface EmployeeFormProps {
  onEmployeeUpdate?: () => void;
  refreshTrigger?: number;
}

export function EmployeeForm({ onEmployeeUpdate, refreshTrigger }: EmployeeFormProps) {
  const { toast } = useToast();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingTokenNo, setEditingTokenNo] = useState<string | null>(null);
  const [formData, setFormData] = useState<{
    name: string;
    token_no: string;
    desig: string;
    group: string;
    role: string;
  }>({
    name: "",
    token_no: "",
    desig: "",
    group: "",
    role: "",
  });

  // Fetch employees on component mount and when refreshTrigger changes
  useEffect(() => {
    console.log('EmployeeForm mounted or refreshTrigger changed, fetching employees...', { refreshTrigger });
    // Clear any existing employees first to ensure fresh state
    setEmployees([]);
    setLoading(true);

    // Fetch employees
    fetch('/api/employees', {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache',
      },
    })
      .then(response => response.json())
      .then(data => {
        console.log('EmployeeForm - API Response:', JSON.stringify(data, null, 2));
        console.log('EmployeeForm - Employees fetched:', data.data);
        console.log('EmployeeForm - First employee sample:', data.data?.[0]);

        if (data.success && data.data) {
          console.log(`Setting ${data.data.length} employees in state`);
          console.log('EmployeeForm - Employee tokens:', data.data.map((e: Employee) => e.token_no));
          setEmployees(data.data);
          console.log('EmployeeForm - Employees state updated');
        } else {
          console.error('EmployeeForm - API Error:', data.error);
          toast({
            title: "Error",
            description: data.error || "Failed to fetch employees",
            variant: "destructive",
          });
        }
      })
      .catch(error => {
        console.error('EmployeeForm - Fetch Error:', error);
        toast({
          title: "Error",
          description: "Failed to fetch employees",
          variant: "destructive",
        });
      })
      .finally(() => {
        setLoading(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshTrigger]);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      // Add cache-busting and ensure fresh data
      const response = await fetch('/api/employees', {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
        },
      });

      const data = await response.json();
      console.log('EmployeeForm - API Response:', data);
      console.log('EmployeeForm - Employees fetched:', data.data);

      if (data.success && data.data) {
        console.log(`Setting ${data.data.length} employees in state`);
        setEmployees(data.data);
      } else {
        console.error('EmployeeForm - API Error:', data.error);
        toast({
          title: "Error",
          description: data.error || "Failed to fetch employees",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('EmployeeForm - Fetch Error:', error);
      toast({
        title: "Error",
        description: "Failed to fetch employees",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      token_no: "",
      desig: "",
      group: "",
      role: "",
    });
    setEditingTokenNo(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.token_no) {
      toast({
        title: "Missing Information",
        description: "Please fill in at least name and token number",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      if (editingTokenNo) {
        // Update employee
        const { token_no, ...updateData } = formData;
        const response = await fetch('/api/employees', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            token_no: editingTokenNo,
            ...updateData,
          }),
        });

        const data = await response.json();

        if (data.success) {
          toast({
            title: "Employee Updated",
            description: `${formData.name} has been updated successfully`,
          });
          await fetchEmployees();
          resetForm();
          onEmployeeUpdate?.();
        } else {
          toast({
            title: "Error",
            description: data.error || "Failed to update employee",
            variant: "destructive",
          });
        }
      } else {
        // Create employee
        const response = await fetch('/api/employees', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });

        const data = await response.json();

        if (data.success) {
          toast({
            title: "Employee Added",
            description: `${formData.name} has been added successfully`,
          });
          await fetchEmployees();
          resetForm();
          onEmployeeUpdate?.();
        } else {
          toast({
            title: "Error",
            description: data.error || "Failed to add employee",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error('Error saving employee:', error);
      toast({
        title: "Error",
        description: "Failed to save employee",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (employee: Employee) => {
    setFormData({
      name: employee.name,
      token_no: employee.token_no,
      desig: employee.desig || "",
      group: employee.group || "",
      role: employee.role || "",
    });
    setEditingTokenNo(employee.token_no);
  };

  const handleDelete = async (token_no: string, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}? This will also delete all related attendance records.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/employees?token_no=${encodeURIComponent(token_no)}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Employee Removed",
          description: `${name} has been removed`,
        });
        await fetchEmployees();
        onEmployeeUpdate?.();
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to delete employee",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error deleting employee:', error);
      toast({
        title: "Error",
        description: "Failed to delete employee",
        variant: "destructive",
      });
    }
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
            value={formData.token_no}
            onChange={(e) => setFormData({ ...formData, token_no: e.target.value })}
            placeholder="e.g. 101"
            disabled={!!editingTokenNo}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="desig">Designation</Label>
          <Input
            id="desig"
            value={formData.desig}
            onChange={(e) => setFormData({ ...formData, desig: e.target.value })}
            placeholder="e.g. Packer, Loader, Supervisor"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="role">Role</Label>
          <Input
            id="role"
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            placeholder="e.g. Employee role"
          />
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
          <Button type="submit" className="flex-1" disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {editingTokenNo ? "Updating..." : "Adding..."}
              </>
            ) : editingTokenNo ? (
              "Update Employee"
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Add Employee
              </>
            )}
          </Button>
          {editingTokenNo && (
            <Button type="button" variant="outline" onClick={resetForm} disabled={saving}>
              Cancel
            </Button>
          )}
        </div>
      </form>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">Loading employees...</span>
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Token</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Designation</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Group</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    No employees found
                  </TableCell>
                </TableRow>
              ) : (
                employees.map((employee) => (
                  <TableRow key={employee.token_no}>
                    <TableCell className="font-medium">{employee.token_no}</TableCell>
                    <TableCell>{employee.name}</TableCell>
                    <TableCell>{employee.desig || '-'}</TableCell>
                    <TableCell>{employee.role || '-'}</TableCell>
                    <TableCell>{employee.group || '-'}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(employee)}
                        disabled={saving}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(employee.token_no, employee.name)}
                        disabled={saving}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
