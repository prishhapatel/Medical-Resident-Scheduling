"use client";

import React from "react";
import { LogOut } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "../../../components/ui/sheet";
import { Button } from "../../../components/ui/button";

interface MobileUserMenuProps {
  isOpen: boolean;
  onClose: () => void;
  displayName: string;
  displayEmail: string;
  onLogout: () => void;
}

const MobileUserMenu: React.FC<MobileUserMenuProps> = ({
  isOpen,
  onClose,
  displayName,
  displayEmail,
  onLogout,
}) => {
  const handleLogoutClick = () => {
    onLogout();
    onClose();
  };

  // Generate initials from display name
  const getInitials = (name: string) => {
    const names = name.split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-80 p-0">
        <SheetHeader className="px-6 py-4 border-b border-border">
          <SheetTitle className="text-lg font-semibold">Account</SheetTitle>
        </SheetHeader>

        <div className="flex flex-col h-full">
          {/* User Info */}
          <div className="px-6 py-4 border-b border-border">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary font-semibold text-sm">
                {getInitials(displayName)}
              </div>
              <div>
                <h3 className="font-medium text-foreground">{displayName}</h3>
                <p className="text-sm text-muted-foreground">{displayEmail}</p>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="flex-1 px-6 py-4">
          </div>

          {/* Logout Button */}
          <div className="px-6 py-4 border-t border-border">
            <Button
              variant="outline"
              className="w-full h-12 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950"
              onClick={handleLogoutClick}
            >
              <LogOut className="h-5 w-5 mr-3" />
              <span>Log Out</span>
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileUserMenu; 