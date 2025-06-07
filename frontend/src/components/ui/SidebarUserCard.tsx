"use client";

import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";

interface SidebarUserCardProps {
  name: string;
  email: string;
  imageUrl: string;
  status: "online" | "be right back" | "offline";
}

export function SidebarUserCard({ name, email, imageUrl, status }: SidebarUserCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "bg-green-500";
      case "be right back":
        return "bg-yellow-500";
      case "offline":
        return "bg-gray-500";
      default:
        return "bg-gray-500";
    }
  };

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
          <AvatarImage src={imageUrl} alt={name} />
          <AvatarFallback>{getInitials(name)}</AvatarFallback>
        </Avatar>
        <span
          className={`absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full ring-2 ring-white dark:ring-gray-800 ${getStatusColor(
            status
          )}`}
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{name}</p>
        <p className="text-xs text-gray-500 truncate">{email}</p>
      </div>
    </div>
  );
}