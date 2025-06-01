"use client";
import React, { useState, useEffect, useRef, ReactElement } from "react";
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
import ProtectedRoute from '../../components/ProtectedRoute';
import { useRouter } from "next/navigation";
import { toast } from '../../hooks/use-toast';
import { Toaster } from '../../components/ui/toaster';
import { removeAuthToken, getUser, getAuthHeaders } from '../../utils/auth';

type MenuItem = {
  title: string;
  icon: ReactElement;
};

type UserStatus = "online" | "be right back" | "offline";

// menu items
const menuItems: MenuItem[] = [
  { title: "Calendar", icon: <CalendarDays className="w-6 h-6 mr-3" /> },
  { title: "Swap Calls", icon: <Repeat className="w-6 h-6 mr-3" /> },
  { title: "Request Off", icon: <CalendarDays className="w-6 h-6 mr-3" /> },
  { title: "Check My Schedule", icon: <UserCheck className="w-6 h-6 mr-3" /> },
  { title: "Admin", icon: <Shield className="w-6 h-6 mr-3" /> },
  { title: "Settings", icon: <Settings className="w-6 h-6 mr-3" /> },
];

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

//dashboard
function Dashboard() {
  const router = useRouter();
  const [selected, setSelected] = useState<string>("Swap Calls");
  const [activeTab, setActiveTab] = useState<string>("All events");
  const [search, setSearch] = useState<string>("");
  const [status, setStatus] = useState<UserStatus>("online");
  const [isLoggedOut, setIsLoggedOut] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // activity tracking timeouts
  const activityTimeout = useRef<NodeJS.Timeout | null>(null);
  const brbTimeout = useRef<NodeJS.Timeout | null>(null);

  /**
   * Hooks to handle user activity tracking
   * Updates user status based on activity:
   * - online: Active
   * - be right back: 2 minutes of inactivity
   * - offline: 10 minutes of inactivity
   */
  useEffect(() => {
    if (isLoggedOut) {
      setStatus("offline");
      return;
    }

    const handleActivity = () => {
      setStatus("online");
      if (activityTimeout.current) clearTimeout(activityTimeout.current);
      if (brbTimeout.current) clearTimeout(brbTimeout.current);

      // set "be right back" status after 2 minutes of inactivity
      brbTimeout.current = setTimeout(() => setStatus("be right back"), 2 * 60 * 1000);
      // set "offline" status after 10 minutes of inactivity
      activityTimeout.current = setTimeout(() => setStatus("offline"), 10 * 60 * 1000);
    };

    // event listeners for user activity
    window.addEventListener("mousemove", handleActivity);
    window.addEventListener("keydown", handleActivity);
    window.addEventListener("click", handleActivity);
    window.addEventListener("scroll", handleActivity);

    // start the activity tracking
    handleActivity();

    // cleanup event listeners and timeouts
    return () => {
      window.removeEventListener("mousemove", handleActivity);
      window.removeEventListener("keydown", handleActivity);
      window.removeEventListener("click", handleActivity);
      window.removeEventListener("scroll", handleActivity);
      if (activityTimeout.current) clearTimeout(activityTimeout.current);
      if (brbTimeout.current) clearTimeout(brbTimeout.current);
    };
  }, [isLoggedOut]);

  useEffect(() => {
    const userData = getUser();
    console.log('User data from localStorage:', userData);
    setUser(userData);
    setLoading(false);
  }, []);

  const handleLogout = async () => {
    setIsLoggedOut(true);
    // remove auth token
    removeAuthToken();
    
    // show success toast
    toast({
      variant: "success",
      title: "Success",
      description: "Logged out successfully",
    });

    // delay before redirecting
    await new Promise(resolve => setTimeout(resolve, 1500));

    // redirect to home page
    router.push("/");
  };

  /**
   * renders the main content based on the selected menu item
   * @returns JSX.Element 
   */
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

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <ProtectedRoute>
      <SidebarProvider defaultOpen={true}>
        <div className="flex min-h-screen w-full">
          <Toaster />
          {/* Sidebar Navigation */}
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
                    {menuItems.map((item) => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton asChild>
                          <span
                            className={`flex items-center text-xl cursor-pointer rounded-lg px-2 py-1 transition-colors ${
                              selected === item.title
                                ? "font-bold text-gray-800 dark:text-gray-200 bg-gray-300 dark:bg-gray-700"
                                : "hover:bg-gray-900 dark:hover:bg-gray-700"
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
                name={user ? `${user.firstName} ${user.lastName}`.trim() : ''}
                email={user?.email || ''}
                imageUrl="https://github.com/shadcn.png"
                status={status}
              />
            </SidebarFooter>
          </Sidebar>
          {/* Main Content Area */}
          <div className="flex-1 flex flex-col w-full">
            {selected !== "Calendar" && (
              <header className="w-full flex items-center justify-between py-6 px-8 border-b border-border bg-background transition-colors">
                <span className="text-2xl font-bold tracking-wide"></span>
                <div className="flex items-center gap-4">
                  <Button 
                    variant="outline" 
                    className="ml-4 bg-black text-white dark:bg-white dark:text-black"
                    onClick={handleLogout}
                  >
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
    </ProtectedRoute>
  );
}

export default Dashboard;
