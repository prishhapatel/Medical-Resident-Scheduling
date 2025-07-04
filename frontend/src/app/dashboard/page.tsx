"use client";
import React, { useState, useEffect, ReactElement, useCallback } from "react";
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "../../components/ui/sidebar";
import { SidebarUserCard } from "./components/SidebarUserCard";
import { Repeat, CalendarDays, UserCheck, Shield, Settings, Home, LogOut, User as UserIcon, ChevronDown, Moon, Sun } from "lucide-react";
import ProtectedRoute from '../../components/ProtectedRoute';
import { useRouter } from "next/navigation";
import { toast } from '../../lib/use-toast';
import { Toaster } from '../../components/ui/toaster';
import { config } from '../../config';
import { removeAuthToken, getUser, verifyAdminStatus, User } from '../../lib/auth';
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

// Define types for API responses
interface DateResponse {
  dateId: string;
  callType: string;
  residentId?: string;
  date: string;
  scheduleId: string;
  firstName?: string;
  lastName?: string;
}

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  backgroundColor: string;
  borderColor: string;
  extendedProps: {
    scheduleId: string;
    residentId?: string;
    firstName?: string;
    lastName?: string;
    callType: string;
    dateId: string;
    pgyLevel?: number;
  };
}

interface Resident {
  resident_id: string;
  first_name: string;
  last_name: string;
  graduate_yr: number;
  email: string;
  phone_number?: string;
}

interface ScheduleItem {
  id: string;
  date: string;
  time: string;
  shift: string;
  location: string;
}

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

const leaveReasons = [
  { id: "vacation", name: "Vacation" },
  { id: "sick", name: "Sick Leave" },
  { id: "cme", name: "ED (Education Days)" },
  { id: "personal", name: "Personal Leave" },
  { id: "other", name: "Other" },
];

function Dashboard() {
  const router = useRouter();
  const { setTheme } = useTheme();
  
  // Core state
  const [selected, setSelected] = useState<string>("Home");
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  // Calendar state
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);

  // Swap calls form state
  const [selectedResident, setSelectedResident] = useState<string>("");
  const [selectedShift, setSelectedShift] = useState<string>("");
  const [shiftDate, setShiftDate] = useState<string>("");

  // Request off form state
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [reason, setReason] = useState<string>("");
  const [description, setDescription] = useState<string>("");

  // Admin state
  const [inviteEmail, setInviteEmail] = useState<string>("");
  const [userInvitations, setUserInvitations] = useState<{
    id: string;
    email: string;
    status: "Pending" | "Member" | "Not Invited";
  }[]>([]);

  // Data state
  const [residents, setResidents] = useState<Resident[]>([]);
  const [mySchedule, setMySchedule] = useState<ScheduleItem[]>([]);

  // Helper functions
  const formatPhoneNumber = (value: string) => {
    if (!value) return "";
    // Remove all non-digit characters
    const phoneNumber = value.replace(/\D/g, '');
    
    // Format as XXX-XXX-XXXX
    if (phoneNumber.length <= 3) {
      return phoneNumber;
    } else if (phoneNumber.length <= 6) {
      return `${phoneNumber.slice(0, 3)}-${phoneNumber.slice(3)}`;
    } else {
      return `${phoneNumber.slice(0, 3)}-${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`;
    }
  };

  // Updated color function to use graduate_yr directly
  const getEventColor = (callType: string, graduateYear?: number) => {
    // Use graduate_yr directly for PGY-based coloring
    if (graduateYear) {
      switch (graduateYear) {
        case 1:
          return '#ef4444'; // red for PGY 1
        case 2:
          return '#f97316'; // orange for PGY 2
        case 3:
          return '#8b5cf6'; // purple for PGY 3
        default:
          return '#6b7280'; // gray for unknown
      }
    }
    
    // Fallback to call type coloring if no graduate_yr
    switch (callType) {
      case 'Short':
        return '#3b82f6'; // blue
      case 'Saturday':
        return '#10b981'; // green
      case 'Sunday':
        return '#f59e0b'; // amber
      default:
        return '#6b7280'; // gray
    }
  };

  // API functions
  const fetchResidents = useCallback(async () => {
    try {
      const response = await fetch(`${config.apiUrl}/api/residents`);
      if (response.ok) {
        const residentsData = await response.json();
        setResidents(residentsData);
      } else {
        console.error('Failed to fetch residents');
      }
    } catch (error) {
      console.error('Error fetching residents:', error);
    }
  }, []);

  const fetchMySchedule = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      const response = await fetch(`${config.apiUrl}/api/dates`);
      if (response.ok) {
        const dates = await response.json();
        const currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0); // Start of today
        
        // Filter dates for current user and future dates only
        const userSchedule = dates
          .filter((date: DateResponse) => {
            const dateObj = new Date(date.date);
            return date.residentId === user.id && dateObj >= currentDate;
          })
          .sort((a: DateResponse, b: DateResponse) => {
            return new Date(a.date).getTime() - new Date(b.date).getTime();
          })
          .slice(0, 20) // Show next 20 shifts
          .map((date: DateResponse) => ({
            id: date.dateId,
            date: date.date, // Keep ISO format for proper date handling
            time: "All Day",
            shift: `${date.callType} Call`,
            location: "Hospital"
          }));
        
        setMySchedule(userSchedule);
      } else {
        console.error('Failed to fetch schedule');
      }
    } catch (error) {
      console.error('Error fetching schedule:', error);
    }
  }, [user?.id]);

  const fetchCalendarEvents = useCallback(async (month?: number, year?: number) => {
    try {
      // Build URL with month and year parameters if provided
      let url = `${config.apiUrl}/api/dates`;
      const params = new URLSearchParams();
      if (month !== undefined && year !== undefined) {
        params.append('month', month.toString());
        params.append('year', year.toString());
      }
      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await fetch(url);
      if (response.ok) {
        const dates = await response.json();
        
        const events = dates.map((date: DateResponse) => {
          const fullName = date.firstName && date.lastName
            ? `${date.firstName} ${date.lastName}`
            : date.residentId;

          // Find the resident to get graduate_yr directly
          const resident = residents.find(r => r.resident_id === date.residentId);
          
          const graduateYear = resident?.graduate_yr;
          const eventColor = getEventColor(date.callType, graduateYear);
          
          // Include PGY in the title if available
          const pgyText = graduateYear ? ` (PGY ${graduateYear})` : '';

          return {
            id: date.dateId,
            title: `${date.callType} Call${fullName ? ` - ${fullName}${pgyText}` : ''}`,
            start: new Date(date.date),
            end: new Date(date.date),
            backgroundColor: eventColor,
            borderColor: eventColor,
            extendedProps: {
              scheduleId: date.scheduleId,
              residentId: date.residentId,
              firstName: date.firstName,
              lastName: date.lastName,
              callType: date.callType,
              dateId: date.dateId,
              pgyLevel: graduateYear
            }
          };
        });
        
        setCalendarEvents(events);
      } else {
        console.error('Failed to fetch calendar events');
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load calendar events",
        });
      }
    } catch (error) {
      console.error('Error fetching calendar events:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load calendar events",
      });
    }
  }, [residents]);

  // Event handlers
  const handleUpdatePhoneNumber = async () => {
    // Updated regex to match XXX-XXX-XXXX format
    const phoneRegex = /^\d{3}-\d{3}-\d{4}$/;
    if (!phoneRegex.test(phoneNumber)) {
      toast({
        variant: "destructive",
        title: "Invalid Phone Number",
        description: "Please enter a valid phone number in format 123-456-7890.",
      });
      return;
    }

    if (!user?.id) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Unable to update phone number. Please try logging in again.",
      });
      return;
    }

    try {
      // First, get the current resident data
      const getResponse = await fetch(`${config.apiUrl}/api/residents/filter?resident_id=${user.id}`);
      if (!getResponse.ok) {
        throw new Error('Failed to fetch current resident data');
      }
      
      const residentsData = await getResponse.json();
      if (!residentsData || residentsData.length === 0) {
        throw new Error('Resident not found');
      }
      
      const currentResident = residentsData[0];

      // Update with existing data but new phone number
      const response = await fetch(`${config.apiUrl}/api/residents/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resident_id: currentResident.resident_id,
          first_name: currentResident.first_name,
          last_name: currentResident.last_name,
          email: currentResident.email,
          password: currentResident.password, // Keep existing password
          phone_num: phoneNumber, // Update phone number
          graduate_yr: currentResident.graduate_yr,
          weekly_hours: currentResident.weekly_hours,
          total_hours: currentResident.total_hours,
          bi_yearly_hours: currentResident.bi_yearly_hours
        })
      });

      if (response.ok) {
        // Update the user object in state and localStorage
        const updatedUser = { ...user, phone_num: phoneNumber };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));

        toast({
          variant: "success",
          title: "Phone Number Updated",
          description: `Your phone number has been updated to ${phoneNumber}.`,
        });
      } else {
        throw new Error('Failed to update phone number');
      }
    } catch (error) {
      console.error('Error updating phone number:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update phone number. Please try again.",
      });
    }
  };

  const handleUpdateEmail = async () => {
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({
        variant: "destructive",
        title: "Invalid Email",
        description: "Please enter a valid email address.",
      });
      return;
    }

    if (!user?.id) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Unable to update email. Please try logging in again.",
      });
      return;
    }

    try {
      // First, get the current resident data
      const getResponse = await fetch(`${config.apiUrl}/api/residents/filter?resident_id=${user.id}`);
      if (!getResponse.ok) {
        throw new Error('Failed to fetch current resident data');
      }
      
      const residentsData = await getResponse.json();
      if (!residentsData || residentsData.length === 0) {
        throw new Error('Resident not found');
      }
      
      const currentResident = residentsData[0];

      // Update with existing data but new email
      const response = await fetch(`${config.apiUrl}/api/residents/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resident_id: currentResident.resident_id,
          first_name: currentResident.first_name,
          last_name: currentResident.last_name,
          email: email, // Update email
          password: currentResident.password, // Keep existing password
          phone_num: currentResident.phone_num,
          graduate_yr: currentResident.graduate_yr,
          weekly_hours: currentResident.weekly_hours,
          total_hours: currentResident.total_hours,
          bi_yearly_hours: currentResident.bi_yearly_hours
        })
      });

      if (response.ok) {
        // Update the user object in state and localStorage
        const updatedUser = { ...user, email: email };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));

        toast({
          variant: "success",
          title: "Email Updated",
          description: `Your email has been updated to ${email}.`,
        });
      } else {
        throw new Error('Failed to update email');
      }
    } catch (error) {
      console.error('Error updating email:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update email. Please try again.",
      });
    }
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
      status: "Pending" as const,
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

  const handleSubmitSwap = async () => {
    if (!selectedResident || !selectedShift || !shiftDate) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select both a resident, a shift, and a date.",
      });
      return;
    }

    try {
      // Find the current user's shift on the selected date
      const currentUserShift = calendarEvents.find((event: CalendarEvent) => 
        event.extendedProps?.residentId === user?.id && 
        event.start.toDateString() === new Date(shiftDate).toDateString() &&
        event.extendedProps?.callType === selectedShift
      );

      // Find the target resident's shift on the same date  
      const targetUserShift = calendarEvents.find((event: CalendarEvent) => 
        event.extendedProps?.residentId === selectedResident && 
        event.start.toDateString() === new Date(shiftDate).toDateString()
      );

      if (!currentUserShift || !targetUserShift) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not find shifts to swap. Both residents must have shifts on the selected date.",
        });
        return;
      }

      // Update current user's shift to target resident
      const updateCurrentShift = fetch(`${config.apiUrl}/api/dates/${currentUserShift.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dateId: currentUserShift.id,
          scheduleId: currentUserShift.extendedProps.scheduleId,
          residentId: selectedResident,
          date: shiftDate,
          callType: selectedShift
        })
      });

      // Update target resident's shift to current user
      const updateTargetShift = fetch(`${config.apiUrl}/api/dates/${targetUserShift.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dateId: targetUserShift.id,
          scheduleId: targetUserShift.extendedProps.scheduleId,
          residentId: user?.id,
          date: shiftDate,
          callType: targetUserShift.extendedProps.callType
        })
      });

      const [response1, response2] = await Promise.all([updateCurrentShift, updateTargetShift]);

      if (response1.ok && response2.ok) {
        const targetResident = residents.find(r => r.resident_id === selectedResident);
        const targetName = targetResident ? `${targetResident.first_name} ${targetResident.last_name}` : selectedResident;
        
        toast({
          variant: "success",
          title: "Swap Request Completed",
          description: `Your shift has been swapped with ${targetName}.`,
        });
        
        // Refresh calendar events and user schedule
        const now = new Date();
        fetchCalendarEvents(now.getMonth() + 1, now.getFullYear());
        fetchMySchedule();
      } else {
        throw new Error('Failed to complete swap');
      }
    } catch (error) {
      console.error('Error swapping shifts:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to swap shifts. Please try again.",
      });
    }

    setSelectedResident("");
    setSelectedShift("");
    setShiftDate("");
  };

  const handleSubmitRequestOff = async () => {
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

    try {
      // Create vacation requests for each day in the range
      const start = new Date(startDate);
      const end = new Date(endDate);
      const requests = [];
      
      for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
        requests.push(
          fetch(`${config.apiUrl}/api/vacations`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              residentId: user?.id,
              date: date.toISOString().split('T')[0] + 'T00:00:00',
              reason: reason,
              status: 'Pending'
            })
          })
        );
      }

      const responses = await Promise.all(requests);
      const allSuccessful = responses.every(response => response.ok);

      if (allSuccessful) {
        toast({
          variant: "success",
          title: "Time Off Request Submitted",
          description: `Your request for ${reason} from ${startDate} to ${endDate} has been submitted.`,
        });
      } else {
        throw new Error('Some requests failed');
      }
    } catch (error) {
      console.error('Error submitting vacation request:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to submit vacation request. Please try again.",
      });
    }

    setStartDate("");
    setEndDate("");
    setReason("");
    setDescription("");
  };

  const handleLogout = async () => {
    removeAuthToken();
    
    toast({
      variant: "success",
      title: "Success",
      description: "Logged out successfully",
    });

    await new Promise(resolve => setTimeout(resolve, 1500));
    router.push("/");
  };

  // Render main content based on selected menu item
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
            onNavigateToSwapCalls={() => setSelected("Swap Calls")}
            onNavigateToRequestOff={() => setSelected("Request Off")}
            onNavigateToSchedule={() => setSelected("Check My Schedule")}
            userId={user?.id || ""}
          />
        );

      case "Calendar":
        return <CalendarPage 
          events={calendarEvents} 
          onNavigateToSwapCalls={() => setSelected("Swap Calls")}
          onDateChange={(month, year) => fetchCalendarEvents(month, year)}
        />;

      case "Settings":
        return (
          <SettingsPage
            firstName={user?.firstName || ""}
            lastName={user?.lastName || ""}
            email={email}
            setEmail={setEmail}
            handleUpdateEmail={handleUpdateEmail}
            phoneNumber={phoneNumber}
            setPhoneNumber={setPhoneNumber}
            handleUpdatePhoneNumber={handleUpdatePhoneNumber}
          />
        );

      case "Swap Calls":
        const availableResidents = residents
          .filter(resident => resident.resident_id !== user?.id)
          .map(resident => ({
            id: resident.resident_id,
            name: `${resident.first_name} ${resident.last_name}`
          }));
        
        const availableShifts = [
          { id: "Short", name: "Short Call" },
          { id: "Saturday", name: "Saturday Call" },
          { id: "Sunday", name: "Sunday Call" }
        ];
        
        return (
          <SwapCallsPage
            shiftDate={shiftDate}
            setShiftDate={setShiftDate}
            selectedResident={selectedResident}
            setSelectedResident={setSelectedResident}
            residents={availableResidents}
            selectedShift={selectedShift}
            setSelectedShift={setSelectedShift}
            shifts={availableShifts}
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
        return <CheckSchedulePage mySchedule={mySchedule} />;

      case "Admin":
        if (!isAdmin) {
          return (
            <div className="w-full pt-4 flex flex-col items-center">
              <h1 className="text-2xl font-bold mb-6">Access Denied</h1>
              <p className="text-center text-gray-600 dark:text-gray-400">
                You do not have permission to access the admin panel.
              </p>
            </div>
          );
        }
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

  // Effects
  useEffect(() => {
    const initialize = async () => {
      const userData = getUser();
      setUser(userData);
      
      if (userData) {
        const adminStatus = await verifyAdminStatus();
        setIsAdmin(adminStatus);
        // Initialize phone number with user's current phone number, formatted
        setPhoneNumber(formatPhoneNumber(userData.phone_num || ""));
        // Initialize email with user's current email
        setEmail(userData.email || "");
      }
      
      setLoading(false);
    };
    
    initialize();
  }, []);

  useEffect(() => {
    if (selected === "Calendar") {
      fetchResidents();
    } else if (selected === "Swap Calls") {
      fetchResidents();
    } else if (selected === "Check My Schedule") {
      fetchMySchedule();
    }
  }, [selected, fetchResidents, fetchMySchedule]);

  // Fetch calendar events whenever residents data is updated and we're on Calendar or Swap Calls page
  useEffect(() => {
    if (residents.length > 0 && (selected === "Calendar" || selected === "Swap Calls")) {
      // Load events for current month for better performance
      const now = new Date();
      fetchCalendarEvents(now.getMonth() + 1, now.getFullYear());
    }
  }, [residents, selected, fetchCalendarEvents]);

  // Computed values
  const displayName = user ? `${user.firstName} ${user.lastName}` : "John Doe";
  const displayEmail = user?.email || "john.doe@email.com";
  const filteredMenuItems = menuItems.filter(item => item.title !== "Admin" || isAdmin);

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
                    {filteredMenuItems.map((item) => (
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
              className={`w-full ${
                selected === "Calendar" ? "h-screen" : "p-8"
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