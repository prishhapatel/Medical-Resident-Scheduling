"use client";
import React, { useState, useEffect, ReactElement } from "react";
import { Button } from "src/components/ui/button";
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
import { SidebarUserCard } from "@/app/dashboard/components/SidebarUserCard";
import { Repeat, CalendarDays, UserCheck, Shield, Settings, Home, LogOut, User as UserIcon, ChevronDown, Send, Check, X, Moon, Sun } from "lucide-react";
import ProtectedRoute from '../../components/ProtectedRoute';
import { useRouter } from "next/navigation";
import { toast } from '../../lib/use-toast';
import { Toaster } from '../../components/ui/toaster';
import { removeAuthToken, getUser, getAuthHeaders } from '../../lib/auth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import { useTheme } from "next-themes";
import HomePage from "./components/HomePage";
import CalendarPage from "./components/CalendarPage";
import SettingsPage from "./components/SettingsPage";
import SwapCallsPage from "./components/SwapCallsPage";
import RequestOffPage from "./components/RequestOffPage";
import CheckSchedulePage from "./components/CheckSchedulePage";
import AdminPage from "./components/AdminPage";

type MenuItem = {
  title: string;
  icon: ReactElement;
};

// menu items
const menuItems: MenuItem[] = [
  { title: "Home", icon: <Home className="w-6 h-6 mr-3" /> },
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

const sampleEvents = [
  {
    title: "test 1",
    start: "2025-06-02T09:00:00",
    end: "2025-06-02T17:00:00",
    backgroundColor: "#1a73e8",
    borderColor: "#1a73e8",
  },
  {
    title: "test 2",
    start: "2025-06-03T19:00:00",
    end: "2025-06-04T07:00:00",
    backgroundColor: "#ff9800",
    borderColor: "#ff9800",
  },
  {
    title: "test 3",
    start: "2025-06-05T08:00:00",
    end: "2025-06-05T16:00:00",
    backgroundColor: "#4CAF50",
    borderColor: "#4CAF50",
  },
];

//dashboard
function Dashboard() {
  const router = useRouter();
  const [selected, setSelected] = useState<string>("Home");
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { setTheme, theme } = useTheme();
  const [phoneNumber, setPhoneNumber] = useState<string>("");

  // Swap calls form state and data
  const [selectedResident, setSelectedResident] = useState<string>("");
  const [selectedShift, setSelectedShift] = useState<string>("");
  const [shiftDate, setShiftDate] = useState<string>("");

  // request off form state and data
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [reason, setReason] = useState<string>("");
  const [description, setDescription] = useState<string>("");

  const leaveReasons = [
    { id: "vacation", name: "Vacation" },
    { id: "sick", name: "Sick Leave" },
    { id: "cme", name: "ED (Education Days)" },
    { id: "personal", name: "Personal Leave" },
    { id: "other", name: "Other" },
  ];

  const adminSwapRequests: { id: string; date: string; originalShift: string; requestedShift: string; requester: string; responder: string; status: string; }[] = [];
  const myTimeOffRequests: { id: string; startDate: string; endDate: string; resident: string; reason: string; status: string; }[] = [];

  const [inviteEmail, setInviteEmail] = useState<string>("");
  const [userInvitations, setUserInvitations] = useState<{
    id: string;
    email: string;
    status: "Pending" | "Member" | "Not Invited";
  }[]>([]);

  const handleUpdatePhoneNumber = () => {
    const phoneRegex = /^\(?(\d{3})\)?[- ]?(\d{3})[- ]?(\d{4})$/;
    if (!phoneRegex.test(phoneNumber)) {
      toast({
        variant: "destructive",
        title: "Invalid Phone Number",
        description: "Please enter a valid phone number.",
      });
      return;
    }
    toast({
      variant: "success",
      title: "Phone Number Updated",
      description: `Your phone number has been updated to ${phoneNumber}.`,
    });
  };

  const handleSendInvite = () => {
    if (!inviteEmail) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter an email address.",
      });
      return;
    }
    const newInvitation = {
      id: Date.now().toString(),
      email: inviteEmail,
      status: "Pending" as "Pending",
    };
    setUserInvitations((prev) => [...prev, newInvitation]);
    setInviteEmail("");
    toast({
      variant: "success",
      title: "Invitation Sent",
      description: `Invitation sent to ${inviteEmail}.`, 
    });
  };

  const handleResendInvite = (id: string) => {
    toast({
      variant: "default",
      title: "Invitation Resent",
      description: `Invitation ${id} has been resent.`, 
    });
  };

  const handleApproveRequest = (id: string) => {
    toast({
      variant: "success",
      title: "Request Approved",
      description: `Time off request ${id} has been approved.`, 
    });
  };

  const handleDenyRequest = (id: string) => {
    toast({
      variant: "destructive",
      title: "Request Denied",
      description: `Time off request ${id} has been denied.`, 
    });
  };

  const handleSubmitSwap = () => {
    if (!selectedResident || !selectedShift || !shiftDate) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select both a resident, a shift, and a date.",
      });
      return;
    }

    toast({
      variant: "success",
      title: "Swap Request Submitted",
      description: `Your request to swap ${selectedShift} on ${shiftDate} with ${selectedResident} has been submitted.`, 
    });
    setSelectedResident("");
    setSelectedShift("");
    setShiftDate("");
  };

  const handleSubmitRequestOff = () => {
    if (!startDate || !endDate || !reason) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please fill out all fields.",
      });
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "End date cannot be before start date.",
      });
      return;
    }

    toast({
      variant: "success",
      title: "Time Off Request Submitted",
      description: `Your request for ${reason} from ${startDate} to ${endDate} has been submitted.`, 
    });
    setStartDate("");
    setEndDate("");
    setReason("");
    setDescription("");
  };

  // Default display name/email if user is missing
  const displayName = user ? `${user.firstName} ${user.lastName}` : "John Doe";
  const displayEmail = user?.email || "john.doe@email.com";

  useEffect(() => {
    const userData = getUser();
    setUser(userData);
    setLoading(false);
  }, []);

  const handleLogout = async () => {
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
      case "Home":
        return (
          <HomePage
            displayName={displayName}
            rotation={null}
            rotationEndDate={null}
            monthlyHours={null}
            hasData={false}
          />
        );

      case "Calendar":
        return <CalendarPage events={sampleEvents} />;

      case "Settings":
        return (
          <SettingsPage
            displayName={displayName}
            phoneNumber={phoneNumber}
            setPhoneNumber={setPhoneNumber}
            handleUpdatePhoneNumber={handleUpdatePhoneNumber}
          />
        );

      case "Swap Calls":
        return (
          <SwapCallsPage
            shiftDate={shiftDate}
            setShiftDate={setShiftDate}
            selectedResident={selectedResident}
            setSelectedResident={setSelectedResident}
            residents={[]}
            selectedShift={selectedShift}
            setSelectedShift={setSelectedShift}
            shifts={[]}
            handleSubmitSwap={handleSubmitSwap}
          />
        );

      case "Request Off":
        return (
          <RequestOffPage
            startDate={startDate}
            setStartDate={setStartDate}
            endDate={endDate}
            setEndDate={setEndDate}
            reason={reason}
            setReason={setReason}
            leaveReasons={leaveReasons}
            description={description}
            setDescription={setDescription}
            handleSubmitRequestOff={handleSubmitRequestOff}
          />
        );

      case "Check My Schedule":
        return <CheckSchedulePage mySchedule={[]} />;

      case "Admin":
        return (
          <AdminPage
            residents={[]}
            adminSwapRequests={[]}
            myTimeOffRequests={[]}
            shifts={[]}
            handleApproveRequest={handleApproveRequest}
            handleDenyRequest={handleDenyRequest}
            userInvitations={userInvitations}
            inviteEmail={inviteEmail}
            setInviteEmail={setInviteEmail}
            handleSendInvite={handleSendInvite}
            handleResendInvite={handleResendInvite}
          />
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
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div className="cursor-pointer flex items-center gap-2 group relative" title="Account options">
                    <SidebarUserCard
                      name={displayName}
                      email={displayEmail}
                    />
                    <ChevronDown className="h-5 w-5 text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors" />
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem
                    className="flex items-center gap-2"
                    onClick={() => setSelected("Settings")}
                  >
                    <UserIcon className="h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme("light")} className="flex items-center gap-2">
                    <Sun className="h-4 w-4" />
                    <span>Light</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme("dark")} className="flex items-center gap-2">
                    <Moon className="h-4 w-4" />
                    <span>Dark</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="flex items-center gap-2 text-red-600 focus:text-red-600"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarFooter>
          </Sidebar>
          {/* Main Content Area */}
          <div className="flex-1 flex flex-col w-full">
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