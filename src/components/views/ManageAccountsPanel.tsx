'use client';

import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Settings, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const ManageAccountsPanel = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        role: '' as 'leader' | 'manager' | 'admin' | '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [submitMessage, setSubmitMessage] = useState('');
    const { toast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formData.email || !formData.password || !formData.role) {
            toast({
                title: 'Validation Error',
                description: 'Please fill in all fields.',
                variant: 'destructive',
            });
            return;
        }

        setIsSubmitting(true);
        setSubmitStatus('idle');
        setSubmitMessage('');

        try {
            const response = await fetch('/api/users/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.error || 'Failed to create user');
            }

            setSubmitStatus('success');
            setSubmitMessage(data.message || 'User created successfully!');
            
            toast({
                title: 'Success',
                description: data.message || 'User created successfully. Confirmation email has been sent.',
            });

            // Reset form
            setFormData({
                email: '',
                password: '',
                role: '',
            });
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to create user';
            setSubmitStatus('error');
            setSubmitMessage(errorMessage);
            
            toast({
                title: 'Error',
                description: errorMessage,
                variant: 'destructive',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Manage Accounts</h1>
                    <p className="text-muted-foreground">
                        Create new user accounts and assign roles
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <div className="flex items-center space-x-2">
                            <Settings className="w-5 h-5" />
                            <CardTitle>Create New User</CardTitle>
                        </div>
                        <CardDescription>
                            Enter email, password, and role to create a new user account. A confirmation email will be sent to the user.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Email Field */}
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email *</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        placeholder="user@example.com"
                                        required
                                        disabled={isSubmitting}
                                    />
                                </div>

                                {/* Password Field */}
                                <div className="space-y-2">
                                    <Label htmlFor="password">Password *</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        placeholder="Enter password"
                                        required
                                        disabled={isSubmitting}
                                        minLength={6}
                                    />
                                </div>

                                {/* Role Field */}
                                <div className="space-y-2">
                                    <Label htmlFor="role">Role *</Label>
                                    <Select
                                        value={formData.role}
                                        onValueChange={(value) => setFormData({ ...formData, role: value as 'leader' | 'manager' | 'admin' })}
                                        disabled={isSubmitting}
                                        required
                                    >
                                        <SelectTrigger id="role">
                                            <SelectValue placeholder="Select a role" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="leader">Leader</SelectItem>
                                            <SelectItem value="manager">Manager</SelectItem>
                                            <SelectItem value="admin">Admin</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Status Message */}
                            {submitStatus !== 'idle' && (
                                <div
                                    className={`flex items-center space-x-2 p-4 rounded-lg ${
                                        submitStatus === 'success'
                                            ? 'bg-success/10 text-success border border-success/20'
                                            : 'bg-destructive/10 text-destructive border border-destructive/20'
                                    }`}
                                >
                                    {submitStatus === 'success' ? (
                                        <CheckCircle2 className="w-5 h-5" />
                                    ) : (
                                        <AlertCircle className="w-5 h-5" />
                                    )}
                                    <p className="text-sm font-medium">{submitMessage}</p>
                                </div>
                            )}

                            {/* Submit Button */}
                            <div className="flex justify-end">
                                <Button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="min-w-[120px]"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Creating...
                                        </>
                                    ) : (
                                        'Create User'
                                    )}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
};

export default ManageAccountsPanel;

