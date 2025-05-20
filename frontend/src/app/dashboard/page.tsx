"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Repeat, CalendarDays, UserCheck, Shield, Settings } from "lucide-react";

const items = [
  { title: "Swap Calls", icon: <Repeat className="w-6 h-6 mr-3" /> },
  { title: "Request Off", icon: <CalendarDays className="w-6 h-6 mr-3" /> },
  { title: "Check My Schedule", icon: <UserCheck className="w-6 h-6 mr-3" /> },
  { title: "Admin", icon: <Shield className="w-6 h-6 mr-3" /> },
];

function page() {
  const [selected, setSelected] = useState("Swap Calls");

  const renderMainContent = () => {
    switch (selected) {
      case "Settings":
        return (
          <Card className="p-8 bg-gray-100 shadow-lg rounded-2xl w-full h-[400px] flex flex-col justify-start">
            <h2 className="text-xl font-bold mb-4">Settings</h2>
            <p className="text-base">Settings content goes here.</p>
          </Card>
        );
      case "Swap Calls":
        return (
          <Card className="p-8 bg-gray-100 shadow-lg rounded-2xl w-[400px] h-[400px] flex flex-col justify-start">
            <h2 className="text-xl font-bold mb-4">Swap Calls</h2>
            <p className="text-base">This is your card content.</p>
          </Card>
        );
      case "Request Off":
        return (
          <Card className="p-8 bg-gray-100 shadow-lg rounded-2xl w-[400px] h-[400px] flex flex-col justify-start">
            <h2 className="text-xl font-bold mb-4">Request Off</h2>
            <p className="text-base">Request off content.</p>
          </Card>
        );
      case "Check My Schedule":
        return (
          <Card className="p-8 bg-gray-100 shadow-lg rounded-2xl w-[400px] h-[400px] flex flex-col justify-start">
            <h2 className="text-xl font-bold mb-4">Check My Schedule</h2>
            <p className="text-base">Schedule content.</p>
          </Card>
        );
      case "Admin":
        return (
          <Card className="p-8 bg-gray-100 shadow-lg rounded-2xl w-[400px] h-[400px] flex flex-col justify-start">
            <h2 className="text-xl font-bold mb-4">Admin</h2>
            <p className="text-base">Admin content.</p>
          </Card>
        );
      default:
        return null;
    }
  };

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full">
        {/* Sidebar */}
        <Sidebar>
          <SidebarHeader>
            <div className="flex items-center justify-center py-2">
              <span className="text-3xl font-bold tracking-wide">PYSCALL</span>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  {items.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        <span
                          className={`flex items-center text-xl cursor-pointer rounded-lg px-2 py-1 transition-colors ${
                            selected === item.title
                              ? "font-bold text-gray-800 bg-gray-300"
                              : "hover:bg-gray-200"
                          }`}
                          onClick={() => setSelected(item.title)}
                        >
                          {item.icon}
                          {item.title}
                        </span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <span
                    className={`flex items-center text-xl cursor-pointer rounded-lg px-2 py-1 transition-colors ${
                      selected === "Settings"
                        ? "font-bold text-gray-800 bg-gray-300"
                        : "hover:bg-gray-200"
                    }`}
                    onClick={() => setSelected("Settings")}
                  >
                    <Settings className="w-6 h-6 mr-3" />
                    Settings
                  </span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>

        {/* Main */}
        <div className="flex-1 flex flex-col w-full">
          {/* Header */}
          <header className="w-full flex items-center justify-between py-6 px-8 border-b bg-white">
            <span className="text-2xl font-bold tracking-wide"></span>
            <div className="flex items-center gap-4">
              <Avatar className="w-12 h-12">
                <AvatarImage src="https://github.com/shadcn.png" alt="User Avatar" />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
              <span className="text-lg font-semibold">John Doe</span>
              <Button variant="outline" className="ml-4 bg-black text-white">
                Log out
              </Button>
            </div>
          </header>
          <main className="flex flex-row gap-8 p-8 w-full">
            {renderMainContent()}
            {selected !== "Settings" && (
              <div className="bg-gray-100 rounded-2xl shadow-lg p-8 h-[400px] flex items-start">
                <Calendar />
              </div>
            )}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

export default page;
