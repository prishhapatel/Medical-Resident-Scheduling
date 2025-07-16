import React from "react";
import { Avatar, AvatarFallback } from "../../../components/ui/avatar";

interface SidebarUserCardProps {
  name: string;
  email: string;
}

export function SidebarUserCard({ name, email }: SidebarUserCardProps) {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
      <div className="relative">
        <Avatar>
          <AvatarFallback>{getInitials(name)}</AvatarFallback>
        </Avatar>
      </div>
      <div className="flex-1 min-w-0 max-w-[140px]">
        <p className="text-sm font-medium truncate">{name}</p>
        <p className="text-xs text-gray-500 truncate">{email}</p>
      </div>
    </div>
  );
}