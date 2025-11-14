'use client';

import { Button } from "@/components/ui/button";
import {
    Building2,
    LogOut,
    User,
    Settings,
    ChevronDown,
    BarChart3,
    TrendingUp,
    Users
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

export const DashboardNavbar = () => {
    const { user, signOut } = useAuth();
    const router = useRouter();

    const handleLogout = async () => {
        await signOut();
    };

    const handleManageEmployees = () => {
        router.push('/group-leader');
    };

    const handleManageAccounts = () => {
        router.push('/manage-accounts');
    };

    return (
        <header className="border-b bg-card shadow-sm">
            <div className="flex h-16 items-center justify-between px-6">
                <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
                            <Building2 className="w-5 h-5 text-primary-foreground" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-foreground">Forbes Marshall</h1>
                            <p className="text-xs text-muted-foreground">Work Order Dashboard</p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center space-x-4">
                    {/* Manage Employees Button */}
                    <Button
                        variant="outline"
                        onClick={handleManageEmployees}
                        className="flex items-center space-x-2"
                    >
                        <Users className="w-4 h-4" />
                        <span className="hidden md:inline">Manage Employees</span>
                    </Button>

                    {/* User Menu */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="flex items-center space-x-2">
                                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                                    <User className="w-4 h-4" />
                                </div>
                                <div className="hidden md:block text-left">
                                    <p className="text-sm font-medium">{user?.email}</p>
                                    <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
                                </div>
                                <ChevronDown className="w-4 h-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuLabel>Account</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={handleManageAccounts}>
                                <Settings className="w-4 h-4 mr-2" />
                                Manage Accounts
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={handleLogout}>
                                <LogOut className="w-4 h-4 mr-2" />
                                Sign Out
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    );
};

