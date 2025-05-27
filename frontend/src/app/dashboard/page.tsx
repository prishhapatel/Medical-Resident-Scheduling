"use client";
import React, { useState } from "react";
import { Button } from "src/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "src/components/ui/avatar";
import { Card } from "src/components/ui/card";
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
} from "src/components/ui/sidebar";
import { Repeat, CalendarDays, UserCheck, Shield, Settings } from "lucide-react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import "@fullcalendar/common/main.css";

const items = [
  { title: "Calendar", icon: <CalendarDays className="w-6 h-6 mr-3" /> },
  { title: "Swap Calls", icon: <Repeat className="w-6 h-6 mr-3" /> },
  { title: "Request Off", icon: <CalendarDays className="w-6 h-6 mr-3" /> },
  { title: "Check My Schedule", icon: <UserCheck className="w-6 h-6 mr-3" /> },
  { title: "Admin", icon: <Shield className="w-6 h-6 mr-3" /> },
  { title: "Settings", icon: <Settings className="w-6 h-6 mr-3" /> },
];

export function SidebarUserCard({ name, email, imageUrl, status = "online" }) {
  const statusColors = {
    online: "bg-green-500",
    "be right back": "bg-yellow-400",
    offline: "bg-gray-400",
  };

  return (
    <div className="flex items-center bg-gray-200 rounded-xl shadow p-3 w-full">
      <Avatar className="h-10 w-10">
        <AvatarImage src={imageUrl} alt={name} />
        <AvatarFallback>{name[0]}</AvatarFallback>
      </Avatar>
      <div className="ml-3 flex-1">
        <div className="font-semibold text-sm">{name}</div>
        <div className="flex items-center text-xs text-gray-500">
          <span className={`w-2 h-2 rounded-full mr-2 ${statusColors[status]}`} />
          {email}
        </div>
      </div>
      <button className="ml-2 text-gray-400 hover:text-gray-600">
        <svg width="16" height="16" fill="none" viewBox="0 0 20 20">
          <path d="M7 10l5 5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  );
}

function page() {
  const [selected, setSelected] = useState("Swap Calls");
  const [activeTab, setActiveTab] = useState("All events");
  const [search, setSearch] = useState("");

  const renderMainContent = () => {
    switch (selected) {
      case "Calendar":
        return (
          <div className="w-full">
            <h1 className="text-2xl font-bold mb-4">Calendar</h1>
            <Card className="p-8 bg-gray-50 dark:bg-neutral-900 shadow-lg rounded-2xl w-full max-w-8xl mx-auto h-[640px] flex flex-col justify-start">
              <FullCalendar
                plugins={[dayGridPlugin]}
                initialView="dayGridMonth"
                height="auto"
                contentHeight="auto"
                headerToolbar={{
                  left: "dayGridMonth,dayGridWeek,dayGridDay",
                  center: "title",
                  right: "prev,today,next",
                }}
                buttonText={{
                  today: "Today",
                  month: "Month",
                  week: "Week",
                  day: "Day",
                }}
              />
            </Card>
          </div>
        );
      case "Settings":
        return (
          <Card className="p-8 bg-gray-100 dark:bg-neutral-900 shadow-lg rounded-2xl w-full h-[400px] flex flex-col justify-start">
            <h2 className="text-xl font-bold mb-4">Settings</h2>
            <p className="text-base">Settings content goes here.</p>
          </Card>
        );
      case "Swap Calls":
        return (
          <Card className="p-8 bg-gray-100 dark:bg-neutral-900 shadow-lg rounded-2xl w-[400px] h-[400px] flex flex-col justify-start">
            <h2 className="text-xl font-bold mb-4">Swap Calls</h2>
            <p className="text-base">This is your card content.</p>
          </Card>
        );
      case "Request Off":
        return (
          <Card className="p-8 bg-gray-100 dark:bg-neutral-900 shadow-lg rounded-2xl w-[400px] h-[400px] flex flex-col justify-start">
            <h2 className="text-xl font-bold mb-4">Request Off</h2>
            <p className="text-base">Request off content.</p>
          </Card>
        );
      case "Check My Schedule":
        return (
          <Card className="p-8 bg-gray-100 dark:bg-neutral-900 shadow-lg rounded-2xl w-[400px] h-[400px] flex flex-col justify-start">
            <h2 className="text-xl font-bold mb-4">Check My Schedule</h2>
            <p className="text-base">Schedule content.</p>
          </Card>
        );
      case "Admin":
        return (
          <Card className="p-8 bg-gray-100 dark:bg-neutral-900 shadow-lg rounded-2xl w-[400px] h-[400px] flex flex-col justify-start">
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
              <span className="text-3xl font-bold tracking-wide">PSYCALL</span>
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
                              : "hover:bg-gray-900"
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
            <SidebarUserCard
              name="John Doe"
              email="john@doe.com"
              imageUrl="https://github.com/shadcn.png"
              status="online"
            />
          </SidebarFooter>
        </Sidebar>

        {/* Main */}
        <div className="flex-1 flex flex-col w-full">
          {/* Header: only shows if not on calendar */}
          {selected !== "Calendar" && (
            <header className="w-full flex items-center justify-between py-6 px-8 border-b border-border bg-background transition-colors">
              <span className="text-2xl font-bold tracking-wide"></span>
              <div className="flex items-center gap-4">
                <Button variant="outline" className="ml-4 bg-black text-white dark:bg-white dark:text-black">
                  Log out
                </Button>
              </div>
            </header>
          )}
          <main
            className={`flex flex-row gap-8 w-full ${
              selected === "Calendar" ? "pt-4 px-8" : "p-8"
            }`}
          >
            {renderMainContent()}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

export default page;
