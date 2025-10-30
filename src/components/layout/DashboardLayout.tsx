'use client';

import { Button } from "@/components/ui/button";
import {
  Building2,
  LogOut,
  User,
  Bell,
  Settings,
  ChevronDown,
  BarChart3,
  TrendingUp
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const { user, signOut, loading } = useAuth();

  const handleLogout = async () => {
    await signOut();
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
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
            {/* Quick Stats */}
            <div className="hidden md:flex items-center space-x-6 px-4 py-2 bg-muted/50 rounded-lg">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-success" />
                <span className="text-sm font-medium">94.2% Complete</span>
              </div>
              <div className="flex items-center space-x-2">
                <BarChart3 className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">15 Plants Active</span>
              </div>
            </div>

            {/* Notifications */}
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5" />
              <Badge className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center p-0 text-xs">
                3
              </Badge>
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4" />
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium">{user.email}</p>
                    <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
                  </div>
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="w-4 h-4 mr-2" />
                  Profile Settings
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="w-4 h-4 mr-2" />
                  Preferences
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

      {/* Main Content */}
      <main className="flex-1 p-6">
        {children}
      </main>
    </div>
  );
};