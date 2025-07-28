"use client";

import React from "react";
import { User, LogOut } from "lucide-react";
import { cn } from "../../../lib/utils";

interface MobileHeaderProps {
  selected: string;
  onOpenUserMenu: () => void;
  onLogout: () => void;
}

const MobileHeader: React.FC<MobileHeaderProps> = ({
  selected,
  onOpenUserMenu,
  onLogout,
}) => {
  const getPageTitle = (selected: string) => {
    switch (selected) {
      case "Home":
        return "Dashboard";
      case "Calendar":
        return "Calendar";
      case "Swap Calls":
        return "Swap Calls";
      case "Request Off":
        return "Request Time Off";
      case "Check My Schedule":
        return "My Schedule";
      case "Admin":
        return "Admin Panel";
      case "Settings":
        return "Settings";
      default:
        return "Dashboard";
    }
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-40 bg-background border-b border-border md:hidden">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Left side - Page title */}
        <div>
          <h1 className="text-lg font-semibold text-foreground">
            {getPageTitle(selected)}
          </h1>
        </div>

        {/* Right side - Logout and User menu buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={onLogout}
            className={cn(
              "flex items-center justify-center w-10 h-10 rounded-full",
              "bg-red-100 hover:bg-red-200 transition-colors",
              "border border-red-300 text-red-600"
            )}
            title="Log out"
          >
            <LogOut className="h-4 w-4" />
          </button>
          <button
            onClick={onOpenUserMenu}
            className={cn(
              "flex items-center justify-center w-10 h-10 rounded-full",
              "bg-muted hover:bg-muted/80 transition-colors",
              "border border-border"
            )}
          >
            <User className="h-5 w-5 text-foreground" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MobileHeader; 