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
import { Repeat, CalendarDays, UserCheck, Shield, Settings, Home, LogOut, User, ChevronDown, Send, Check, X, Moon, Sun, UserPlus } from "lucide-react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import "@fullcalendar/common/main.css";
import ProtectedRoute from '../../components/ProtectedRoute';
import { useRouter } from "next/navigation";
import { toast } from '../../hooks/use-toast';
import { Toaster } from '../../components/ui/toaster';
import { removeAuthToken, getUser, getAuthHeaders } from '../../utils/auth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import { useTheme } from "next-themes";

type MenuItem = {
  title: string;
  icon: ReactElement;
};

type UserStatus = "online" | "be right back" | "offline";

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

//dashboard
function Dashboard() {
  const router = useRouter();
  const [selected, setSelected] = useState<string>("Home");
  const [activeTab, setActiveTab] = useState<string>("All events");
  const [search, setSearch] = useState<string>("");
  const [status, setStatus] = useState<UserStatus>("online");
  const [isLoggedOut, setIsLoggedOut] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Swap calls form state and data
  const [selectedResident, setSelectedResident] = useState<string>("");
  const [selectedShift, setSelectedShift] = useState<string>("");
  const [shiftDate, setShiftDate] = useState<string>("");

  const residents: { id: string; name: string; }[] = [];
  const shifts: { id: string; name: string; }[] = [];

  // Request Off form state and data
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [reason, setReason] = useState<string>("");
  const [description, setDescription] = useState<string>("");

  const leaveReasons = [
    { id: "vacation", name: "Vacation" },
    { id: "sick", name: "Sick Leave" },
    { id: "cme", name: "CME (Continuing Medical Education)" },
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
    console.log(`Resending invitation ${id}`);
    toast({
      variant: "default",
      title: "Invitation Resent",
      description: `Invitation ${id} has been resent.`, 
    });
  };

  const handleApproveRequest = (id: string) => {
    console.log(`Approving request ${id}`);
    toast({
      variant: "success",
      title: "Request Approved",
      description: `Time off request ${id} has been approved.`, 
    });
  };

  const handleDenyRequest = (id: string) => {
    console.log(`Denying request ${id}`);
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

    console.log({
      selectedResident,
      selectedShift,
      shiftDate,
    });
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

    console.log({
      startDate,
      endDate,
      reason,
      description,
    });
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

  // activity tracking timeouts
  const activityTimeout = useRef<NodeJS.Timeout | null>(null);
  const brbTimeout = useRef<NodeJS.Timeout | null>(null);

  // Default display name/email if user is missing
  const displayName = user?.firstName?.trim() || "John Doe";
  const displayEmail = user?.email || "john.doe@email.com";

  const { setTheme, theme } = useTheme();

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
      case "Home":
        return (
          <div className="w-full pt-4 flex flex-col items-center">
            <div className="mb-6 w-full max-w-5xl">
              <h1 className="text-3xl font-bold">Hello, {displayName}!</h1>
            </div>
            <div className="w-full max-w-5xl flex flex-col gap-6">
              {/* Main Summary Card */}
              <Card className="p-6 bg-gray-50 dark:bg-neutral-900 shadow-lg rounded-2xl">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-semibold mb-1">Current Rotation</h2>
                    <p className="text-lg font-medium text-gray-400 italic">No rotation data available</p>
                    <p className="text-sm text-gray-400 italic">No end date</p>
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold mb-1">Hours This Month</h2>
                    <p className="text-2xl font-bold text-gray-400 italic">--</p>
                  </div>
                </div>
                <div className="flex flex-col md:flex-row gap-4 mt-4">
                  <button className="flex-1 p-3 bg-white dark:bg-neutral-800 rounded-lg text-left border border-gray-200 dark:border-gray-700 text-gray-400 cursor-not-allowed" disabled>
                    <span className="font-medium">Request Call Swap</span>
                    <p className="text-xs">No data</p>
                  </button>
                  <button className="flex-1 p-3 bg-white dark:bg-neutral-800 rounded-lg text-left border border-gray-200 dark:border-gray-700 text-gray-400 cursor-not-allowed" disabled>
                    <span className="font-medium">Request Day Off</span>
                    <p className="text-xs">No data</p>
                  </button>
                  <button className="flex-1 p-3 bg-white dark:bg-neutral-800 rounded-lg text-left border border-gray-200 dark:border-gray-700 text-gray-400 cursor-not-allowed" disabled>
                    <span className="font-medium">View My Rotations</span>
                    <p className="text-xs">No data</p>
                  </button>
                </div>
              </Card>
              {/* Activity Card */}
              <Card className="p-6 bg-gray-50 dark:bg-neutral-900 shadow-lg rounded-2xl">
                <h2 className="text-xl font-semibold mb-2">Recent Activity</h2>
                <div className="space-y-3 text-gray-400 italic">No recent activity</div>
                <h2 className="text-xl font-semibold mb-2 mt-4">Team Updates</h2>
                <div className="space-y-3 text-gray-400 italic">No team updates</div>
              </Card>
            </div>
          </div>
        );

      case "Calendar":
        return (
          <div className="w-full pt-4 h-[calc(100vh-4rem)] flex flex-col">
            <h1 className="text-2xl font-bold mb-4">Calendar</h1>
            <Card className="p-8 bg-gray-50 dark:bg-neutral-900 shadow-lg rounded-2xl w-full max-w-8xl mx-auto flex-1 flex flex-col justify-start">
              <FullCalendar
                plugins={[dayGridPlugin, timeGridPlugin]}
                initialView="dayGridMonth"
                height="100%"
                contentHeight="100%"
                headerToolbar={{
                  left: "dayGridMonth,timeGridWeek,timeGridDay",
                  center: "title",
                  right: "prev,today,next",
                }}
                buttonText={{
                  today: "Today",
                  month: "Month",
                  week: "Week",
                  day: "Day",
                }}
                nowIndicator={true}
                events={[
                  {
                    title: "Dr. Smith: Psychiatry Inpatient",
                    start: "2024-06-07T09:00:00",
                    end: "2024-06-07T17:00:00",
                    backgroundColor: "#1a73e8", // Blue for Smith
                    borderColor: "#1a73e8",
                    extendedProps: { resident: "Dr. Smith", shiftType: "Inpatient" }
                  },
                  {
                    title: "Dr. Jones: Night Float",
                    start: "2024-06-08T19:00:00",
                    end: "2024-06-09T07:00:00",
                    backgroundColor: "#ff9800", // Orange for Jones
                    borderColor: "#ff9800",
                    extendedProps: { resident: "Dr. Jones", shiftType: "Night Float" }
                  },
                  {
                    title: "Dr. Lee: Consult Liaison",
                    start: "2024-06-10T08:00:00",
                    end: "2024-06-10T16:00:00",
                    backgroundColor: "#4CAF50", // Green for Lee
                    borderColor: "#4CAF50",
                    extendedProps: { resident: "Dr. Lee", shiftType: "Consult Liaison" }
                  },
                ]}
                eventClick={(info) => {
                  console.log("Event clicked:", info.event.title);
                  console.log("Shift details:", info.event.extendedProps);
                  alert(`Swap Request for: ${info.event.title}\nStart: ${info.event.start?.toLocaleString()}\nEnd: ${info.event.end?.toLocaleString()}\n(Check console for more details)`);
                  // Here you would typically open a modal or navigate to a swap request form
                }}
              />
            </Card>
          </div>
        );

      case "Settings":
        return (
          <div className="w-full pt-4 h-[calc(100vh-4rem)] flex flex-col items-center">
            <h1 className="text-2xl font-bold mb-6">Settings</h1>
            <p className="text-center text-gray-600 dark:text-gray-400 mb-8 max-w-lg">Manage your account preferences and settings.</p>
            <Card className="p-8 bg-gray-50 dark:bg-neutral-900 shadow-lg rounded-2xl w-full flex flex-col gap-6">
              {/* Theme Settings */}
              <div>
                <h2 className="text-xl font-semibold mb-4">Theme</h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className="flex items-center gap-2"
                >
                  {theme === "dark" ? (
                    <>
                      <Sun className="h-4 w-4" />
                      <span>Light Mode</span>
                    </>
                  ) : (
                    <>
                      <Moon className="h-4 w-4" />
                      <span>Dark Mode</span>
                    </>
                  )}
                </Button>
              </div>

              {/* Profile Settings */}
              <div>
                <h2 className="text-xl font-semibold mb-4">Profile</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Display Name
                    </label>
                    <input
                      type="text"
                      value={displayName}
                      disabled
                      className="block w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm bg-gray-100 dark:bg-neutral-800 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>
            </Card>
          </div>
        );

      case "Swap Calls":
        return (
          <div className="w-full pt-4 h-[calc(100vh-4rem)] flex flex-col items-center">
            <h1 className="text-2xl font-bold mb-6">Request to Swap Calls</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8">Fill out the form below to request a swap for an upcoming shift. Please ensure all details are accurate.</p>
            <Card className="p-8 bg-gray-50 dark:bg-neutral-900 shadow-lg rounded-2xl w-full flex flex-col gap-6">
              {/* Date Input */}
              <div>
                <label htmlFor="shift-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Date of Shift:</label>
                <input
                  id="shift-date"
                  type="date"
                  className="block w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100"
                  value={shiftDate}
                  onChange={(e) => setShiftDate(e.target.value)}
                />
              </div>
              {/* Resident Dropdown */}
              <div>
                <label htmlFor="resident-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Seeking to swap with:</label>
                <select
                  id="resident-select"
                  className="block w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100"
                  value={selectedResident}
                  onChange={(e) => setSelectedResident(e.target.value)}
                >
                  <option value="">Select a resident</option>
                  {residents.map((resident) => (
                    <option key={resident.id} value={resident.name}>{resident.name}</option>
                  ))}
                </select>
              </div>

              {/* Shift Dropdown */}
              <div>
                <label htmlFor="shift-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Shift details to swap:</label>
                <select
                  id="shift-select"
                  className="block w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100"
                  value={selectedShift}
                  onChange={(e) => setSelectedShift(e.target.value)}
                >
                  <option value="">Select a shift</option>
                  {shifts.map((shift) => (
                    <option key={shift.id} value={shift.name}>{shift.name}</option>
                  ))}
                </select>
              </div>

              {/* Submit Button */}
              <Button onClick={handleSubmitSwap} className="w-full py-2 flex items-center justify-center gap-2">
                <Send className="h-5 w-5" />
                <span>Submit Swap Request</span>
              </Button>
            </Card>
          </div>
        );

      case "Request Off":
        return (
          <div className="w-full pt-4 h-[calc(100vh-4rem)] flex flex-col items-center">
            <h1 className="text-2xl font-bold mb-6">Request Time Off</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8">Submit your time off request below. Please specify the dates and reason.</p>
            <Card className="p-8 bg-gray-50 dark:bg-neutral-900 shadow-lg rounded-2xl w-full flex flex-col gap-6">
              {/* Start Date Input */}
              <div>
                <label htmlFor="start-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Start Date:</label>
                <input
                  id="start-date"
                  type="date"
                  className="block w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>

              {/* End Date Input */}
              <div>
                <label htmlFor="end-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">End Date:</label>
                <input
                  id="end-date"
                  type="date"
                  className="block w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>

              {/* Reason Dropdown */}
              <div>
                <label htmlFor="reason-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Reason for Request:</label>
                <select
                  id="reason-select"
                  className="block w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                >
                  <option value="">Select a reason</option>
                  {leaveReasons.map((r) => (
                    <option key={r.id} value={r.name}>{r.name}</option>
                  ))}
                </select>
              </div>

              {/* Description Box */}
              <div>
                <label htmlFor="description-box" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Additional Details (Optional):</label>
                <textarea
                  id="description-box"
                  rows={4}
                  className="block w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g., specific duties, contact info, special considerations..."
                ></textarea>
              </div>

              {/* Submit Button */}
              <Button onClick={handleSubmitRequestOff} className="w-full py-2 flex items-center justify-center gap-2">
                <Send className="h-5 w-5" />
                <span>Submit Request</span>
              </Button>
            </Card>
          </div>
        );

      case "Check My Schedule":
        const mySchedule = [
          // Removed dummy data
        ];

        return (
          <div className="w-full pt-4 h-[calc(100vh-4rem)] flex flex-col items-center">
            <h1 className="text-2xl font-bold mb-6">My Upcoming Schedule</h1>
            <p className="text-center text-gray-600 dark:text-gray-400 mb-8 max-w-lg">Here's an overview of your upcoming shifts and rotations.</p>
            <Card className="p-8 bg-gray-50 dark:bg-neutral-900 shadow-lg rounded-2xl w-full flex flex-col gap-4">
              {mySchedule.length > 0 ? (
                <div className="space-y-4">
                  {mySchedule.map((entry) => (
                    <div key={entry.id} className="p-4 bg-white dark:bg-neutral-800 rounded-lg shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                      <div className="flex flex-col">
                        <p className="font-semibold text-lg text-gray-900 dark:text-gray-100">{entry.date}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{entry.time}</p>
                      </div>
                      <div className="flex flex-col text-left md:text-right">
                        <p className="font-medium text-gray-800 dark:text-gray-200">{entry.shift}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{entry.location}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 italic">No upcoming schedule entries found.</p>
              )}
            </Card>
          </div>
        );

      case "Admin":
        return (
          <div className="w-full pt-4 h-[calc(100vh-4rem)] flex flex-col items-center">
            <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
            
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mb-8">
              <Card className="p-6 bg-gray-50 dark:bg-neutral-900 shadow-lg rounded-2xl">
                <div className="flex flex-col">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Residents</h3>
                  <p className="text-3xl font-bold mt-2">{residents.length}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Active members</p>
                </div>
              </Card>
              <Card className="p-6 bg-gray-50 dark:bg-neutral-900 shadow-lg rounded-2xl">
                <div className="flex flex-col">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Pending Requests</h3>
                  <p className="text-3xl font-bold mt-2">
                    {adminSwapRequests.filter(r => r.status === "Pending").length + 
                     myTimeOffRequests.filter(r => r.status === "Pending").length}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    {adminSwapRequests.filter(r => r.status === "Pending").length} swaps, {myTimeOffRequests.filter(r => r.status === "Pending").length} time off
                  </p>
                </div>
              </Card>
              <Card className="p-6 bg-gray-50 dark:bg-neutral-900 shadow-lg rounded-2xl">
                <div className="flex flex-col">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Rotations</h3>
                  <p className="text-3xl font-bold mt-2">{shifts.length}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Current shifts</p>
                </div>
              </Card>
            </div>

            {/* Swap Calls Tracking */}
            <Card className="p-8 bg-gray-50 dark:bg-neutral-900 shadow-lg rounded-2xl w-full flex flex-col gap-4 mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Swap Requests</h2>
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <Repeat className="h-4 w-4" />
                  <span>View All</span>
                </Button>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-100 dark:bg-neutral-800">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Original Shift</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requested Shift</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requester</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Responder</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200 dark:bg-neutral-900 dark:divide-gray-700">
                    {adminSwapRequests.length > 0 ? (
                      adminSwapRequests.map((request) => (
                        <tr key={request.id} className="hover:bg-gray-50 dark:hover:bg-neutral-800">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{request.date}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{request.originalShift}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{request.requestedShift}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{request.requester}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{request.responder}</td>
                          <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${request.status === "Pending" ? "text-yellow-600" : request.status === "Approved" ? "text-green-600" : request.status === "Denied" ? "text-red-600" : "text-blue-600"}`}>
                            {request.status}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <Repeat className="h-5 w-5 text-gray-400" />
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="px-6 py-4 text-center text-gray-500 italic">No swap requests found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Request Off Management */}
            <Card className="p-8 bg-gray-50 dark:bg-neutral-900 shadow-lg rounded-2xl w-full flex flex-col gap-4 mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Time Off Requests</h2>
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4" />
                  <span>View All</span>
                </Button>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-100 dark:bg-neutral-800">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Range</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Resident</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200 dark:bg-neutral-900 dark:divide-gray-700">
                    {myTimeOffRequests.length > 0 ? (
                      myTimeOffRequests.map((request) => (
                        <tr key={request.id} className="hover:bg-gray-50 dark:hover:bg-neutral-800">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{`${request.startDate} - ${request.endDate}`}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{request.resident}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{request.reason}</td>
                          <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${request.status === "Pending" ? "text-yellow-600" : request.status === "Approved" ? "text-green-600" : "text-red-600"}`}>
                            {request.status}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            {request.status === "Pending" && (
                              <div className="flex items-center space-x-2">
                                <Button variant="outline" size="sm" className="text-green-600 border-green-600 hover:bg-green-500 hover:text-white" onClick={() => handleApproveRequest(request.id)}>
                                  <Check className="h-4 w-4 mr-2" /> Approve
                                </Button>
                                <Button variant="outline" size="sm" className="text-red-600 border-red-600 hover:bg-red-500 hover:text-white" onClick={() => handleDenyRequest(request.id)}>
                                  <X className="h-4 w-4 mr-2" /> Deny
                                </Button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-6 py-4 text-center text-gray-500 italic">No time off requests found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* New User Invitations */}
            <Card className="p-8 bg-gray-50 dark:bg-neutral-900 shadow-lg rounded-2xl w-full flex flex-col gap-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">User Invitations</h2>
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <UserPlus className="h-4 w-4" />
                  <span>View All</span>
                </Button>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 mb-4">
                <input
                  type="email"
                  placeholder="Enter resident email address"
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                />
                <Button onClick={handleSendInvite} className="py-2 flex items-center justify-center gap-2">
                  <Send className="h-5 w-5" />
                  <span>Send Invitation</span>
                </Button>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-100 dark:bg-neutral-800">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200 dark:bg-neutral-900 dark:divide-gray-700">
                    {userInvitations.length > 0 ? (
                      userInvitations.map((invite) => (
                        <tr key={invite.id} className="hover:bg-gray-50 dark:hover:bg-neutral-800">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{invite.email}</td>
                          <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${invite.status === "Pending" ? "text-yellow-600" : invite.status === "Member" ? "text-green-600" : "text-gray-500"}`}>
                            {invite.status}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            {invite.status === "Pending" && (
                              <Button variant="outline" size="sm" className="text-blue-600 border-blue-600 hover:bg-blue-500 hover:text-white" onClick={() => handleResendInvite(invite.id)}>
                                Resend
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={3} className="px-6 py-4 text-center text-gray-500 italic">No pending invitations.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
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
                      imageUrl="https://github.com/shadcn.png"
                      status={status}
                    />
                    <ChevronDown className="h-5 w-5 text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors" />
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem className="flex items-center gap-2">
                    <User className="h-4 w-4" />
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
