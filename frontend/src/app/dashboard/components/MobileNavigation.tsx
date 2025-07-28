"use client";

import React from "react";
import { Home, CalendarDays, Repeat, UserCheck, Settings, Shield } from "lucide-react";
import { cn } from "../../../lib/utils";

interface MobileNavigationProps {
  selected: string;
  setSelected: (selected: string) => void;
  isAdmin: boolean;
}

const MobileNavigation: React.FC<MobileNavigationProps> = ({
  selected,
  setSelected,
  isAdmin,
}) => {
  const menuItems = [
    { title: "Home", icon: Home, show: true },
    { title: "Calendar", icon: CalendarDays, show: true },
    { title: "Swap Calls", icon: Repeat, show: true },
    { title: "Request Off", icon: CalendarDays, show: !isAdmin },
    { title: "Check My Schedule", icon: UserCheck, show: !isAdmin },
    { title: "Admin", icon: Shield, show: isAdmin },
    { title: "Settings", icon: Settings, show: true },
  ].filter(item => item.show);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border md:hidden">
      <div className="flex items-center justify-around px-2 py-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = selected === item.title;
          
          return (
            <button
              key={item.title}
              onClick={() => setSelected(item.title)}
              className={cn(
                "flex flex-col items-center justify-center w-full py-2 px-1 rounded-lg transition-all duration-200",
                "hover:bg-muted active:bg-muted/80",
                isActive 
                  ? "text-primary bg-primary/10" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className={cn(
                "h-5 w-5 mb-1 transition-colors",
                isActive ? "text-primary" : "text-muted-foreground"
              )} />
              <span className={cn(
                "text-xs font-medium transition-colors",
                isActive ? "text-primary" : "text-muted-foreground"
              )}>
                {item.title === "Request Off" ? "Request" : 
                 item.title === "Check My Schedule" ? "Schedule" :
                 item.title}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default MobileNavigation; 