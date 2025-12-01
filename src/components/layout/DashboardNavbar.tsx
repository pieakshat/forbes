'use client';

import { Button } from "@/components/ui/button";
import {
    Building2,
    LogOut,
    User,
    Settings,
    ChevronDown,
    BarChart3,
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
import { useRouter, usePathname } from "next/navigation";

export const DashboardNavbar = () => {
    const { user, signOut } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    const handleLogout = async () => {
        await signOut();
    };

    const handleManageEmployees = () => {
        router.push('/group-leader');
    };

    const handleViewDashboard = () => {
        // Mark in sessionStorage that admin intentionally navigated to dashboard
        if (typeof window !== 'undefined') {
            sessionStorage.setItem('admin_dashboard_access', 'true');
        }
        router.push('/dashboard');
    };

    const handleManageAccounts = () => {
        router.push('/manage-accounts');
    };

    // Determine button visibility and behavior
    const isAdmin = user?.role === 'admin';
    const isOnGroupLeaderPage = pathname === '/group-leader';
    const isOnDashboardPage = pathname === '/dashboard';
    const showButton = isAdmin; // Only show for admin
    const buttonText = isOnGroupLeaderPage ? 'View Dashboard' : 'Manage Employees';
    const buttonAction = isOnGroupLeaderPage ? handleViewDashboard : handleManageEmployees;

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
                    {/* Manage Employees / View Dashboard Button - Only visible for admin */}
                    {showButton && (
                        <Button
                            variant="outline"
                            onClick={buttonAction}
                            className="flex items-center space-x-2"
                        >
                            {isOnGroupLeaderPage ? (
                                <BarChart3 className="w-4 h-4" />
                            ) : (
                                <Users className="w-4 h-4" />
                            )}
                            <span className="hidden md:inline">{buttonText}</span>
                        </Button>
                    )}

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

