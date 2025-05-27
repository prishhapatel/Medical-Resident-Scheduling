"use client";
import React, { useState, useEffect, useRef } from "react";
import { Button } from "src/components/ui/button";
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
import { SidebarUserCard } from "src/components/ui/SidebarUserCard";
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

function page() {
  const [selected, setSelected] = useState("Swap Calls");
  const [activeTab, setActiveTab] = useState("All events");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("online");
  const activityTimeout = useRef<NodeJS.Timeout | null>(null);
  const brbTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleActivity = () => {
      setStatus("online");
      if (activityTimeout.current) clearTimeout(activityTimeout.current);
      if (brbTimeout.current) clearTimeout(brbTimeout.current);

      // After 5 minutes of inactivity, set to be right back
      brbTimeout.current = setTimeout(() => setStatus("be right back"), 5 * 60 * 1000);
      // After 15 minutes of inactivity, set to "ffline
      activityTimeout.current = setTimeout(() => setStatus("offline"), 15 * 60 * 1000);
    };

    window.addEventListener("mousemove", handleActivity);
    window.addEventListener("keydown", handleActivity);

    handleActivity(); // Initialize timers

    return () => {
      window.removeEventListener("mousemove", handleActivity);
      window.removeEventListener("keydown", handleActivity);
      if (activityTimeout.current) clearTimeout(activityTimeout.current);
      if (brbTimeout.current) clearTimeout(brbTimeout.current);
    };
  }, []);

  const renderMainContent = () => {
    switch (selected) {
      case "Calendar":
        return (
          <div className="w-full pt-4 h-[calc(100vh-4rem)] flex flex-col">
            <h1 className="text-2xl font-bold mb-4">Calendar</h1>
            <Card className="p-8 bg-gray-50 dark:bg-neutral-900 shadow-lg rounded-2xl w-full max-w-8xl mx-auto flex-1 flex flex-col justify-start">
              <FullCalendar
                plugins={[dayGridPlugin]}
                initialView="dayGridMonth"
                height="100%"
                contentHeight="100%"
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
              status={status}
            />
          </SidebarFooter>
        </Sidebar>

        {/* Main */}
        <div className="flex-1 flex flex-col w-full">
          {/* Header*/}
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
