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
  SidebarTrigger,
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

function SidebarFloatingTrigger() {
  return (
    <div
      className={` z-50 left-65 top-13 -translate-y-1/2 transition-all duration-300`}
      style={{ pointerEvents: 'auto' }}
    >
      <SidebarTrigger />
    </div>
  );
}

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
  const [yourShiftDate, setYourShiftDate] = useState<string>("");
  const [partnerShiftDate, setPartnerShiftDate] = useState<string>("");
  const [partnerShift, setPartnerShift] = useState<string>("");

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
  const [users, setUsers] = useState<{ id: string; first_name: string; last_name: string; email: string; role: string }[]>([]);

  // Add state for adminSwapRequests, myTimeOffRequests, and shifts
  const [myTimeOffRequests, setMyTimeOffRequests] = useState<{
    id: string;
    date: string;
    reason: string;
    status: string;
    residentId: string;
  }[]>([]);
  const [shifts, setShifts] = useState<{
    id: string;
    name: string;
  }[]>([]);

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

  function mapShiftType(shift) {
    if (shift === "Saturday") return ["24h", "Saturday"];
    if (shift === "Sunday") return ["12h", "Sunday"];
    return [shift]; // "Short" stays "Short"
  }

  function parseLocalDate(dateStr: string) {
    if (!dateStr) return null;
    const [year, month, day] = dateStr.split('-');
    return new Date(Number(year), Number(month) - 1, Number(day));
  }

  function isSameDay(date1: Date | string, date2: Date | string) {
    const d1 = (typeof date1 === 'string') ? parseLocalDate(date1) : new Date(date1);
    const d2 = (typeof date2 === 'string') ? parseLocalDate(date2) : new Date(date2);
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  }

  function mapShiftType(shift) {
    if (shift === "Saturday") return ["24h", "Saturday"];
    if (shift === "Sunday") return ["12h", "Sunday"];
    return [shift]; // "Short" stays "Short"
  }

  function parseLocalDate(dateStr: string) {
    if (!dateStr) return null;
    const [year, month, day] = dateStr.split('-');
    return new Date(Number(year), Number(month) - 1, Number(day));
  }

  function isSameDay(date1: Date | string, date2: Date | string) {
    const d1 = (typeof date1 === 'string') ? parseLocalDate(date1) : new Date(date1);
    const d2 = (typeof date2 === 'string') ? parseLocalDate(date2) : new Date(date2);
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  }

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

        // Find the scheduleId with the most recent date (same as calendar)
        let latestScheduleId = null;
        if (dates.length > 0) {
          const scheduleIdToLatestDate = {};
          dates.forEach((date) => {
            if (!date.scheduleId) return;
            const current = scheduleIdToLatestDate[date.scheduleId];
            const thisDate = new Date(date.date).getTime();
            if (!current || thisDate > current) {
              scheduleIdToLatestDate[date.scheduleId] = thisDate;
            }
          });
          latestScheduleId = Object.entries(scheduleIdToLatestDate)
            .sort((a, b) => (Number(b[1]) - Number(a[1])))[0]?.[0];
        }

        // Only include events from the latest schedule
        const filteredDates = latestScheduleId
          ? dates.filter((date) => date.scheduleId === latestScheduleId)
          : dates;

        // Filter for current user and future dates only, and with a real callType
        const userSchedule = filteredDates
          .filter((date) => {
            const dateObj = new Date(date.date);
            return date.residentId === user.id && dateObj >= currentDate && date.callType;
          })
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
          .slice(0, 20)
          .map((date) => ({
            id: date.dateId,
            date: date.date,
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

  const fetchCalendarEvents = useCallback(async () => {
    try {
      // Fetch all dates - the backend doesn't support month/year filtering yet
      const response = await fetch(`${config.apiUrl}/api/dates`);
      if (response.ok) {
        const dates = await response.json();

        // Find the scheduleId with the most recent date
        let latestScheduleId = null;
        if (dates.length > 0) {
          // Map of scheduleId to most recent date
          const scheduleIdToLatestDate: Record<string, number> = {};
          dates.forEach((date: DateResponse) => {
            if (!date.scheduleId) return;
            const current = scheduleIdToLatestDate[date.scheduleId];
            const thisDate = new Date(date.date).getTime();
            if (!current || thisDate > current) {
              scheduleIdToLatestDate[date.scheduleId] = thisDate;
            }
          });
          // Find the scheduleId with the most recent date
          latestScheduleId = Object.entries(scheduleIdToLatestDate)
            .sort((a, b) => (Number(b[1]) - Number(a[1])))[0]?.[0];
        }

        // Only include events from the latest schedule
        const filteredDates = latestScheduleId
          ? dates.filter((date: DateResponse) => date.scheduleId === latestScheduleId)
          : dates;

        const events = filteredDates.map((date: DateResponse) => {
          // Only show the resident's name on the calendar
          const fullName = date.firstName && date.lastName
            ? `${date.firstName} ${date.lastName}`
            : date.residentId;

          // Standardize callType
          let callType = date.callType;
          if (callType === 'Sunday') callType = '12h';
          if (callType === 'Saturday') callType = '24h';

          // Find the resident to get graduate_yr directly (for details only)
          const resident = residents.find(r => r.resident_id === date.residentId);
          const graduateYear = resident?.graduate_yr;
          const eventColor = getEventColor(callType, graduateYear);

          return {
            id: date.dateId,
            title: fullName || '', // Only name
            start: new Date(date.date),
            end: new Date(date.date),
            backgroundColor: eventColor,
            borderColor: eventColor,
            extendedProps: {
              scheduleId: date.scheduleId,
              residentId: date.residentId,
              firstName: date.firstName,
              lastName: date.lastName,
              callType: callType,
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
    } catch {
      console.error('Error fetching calendar events');
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load calendar events",
      });
    }
  }, [residents]);

  const fetchUsers = async () => {
    try {
      const [residentsRes, adminsRes] = await Promise.all([
        fetch(`${config.apiUrl}/api/Residents`),
        fetch(`${config.apiUrl}/api/Admins`)
      ]);
      const residents = residentsRes.ok ? await residentsRes.json() : [];
      const admins = adminsRes.ok ? await adminsRes.json() : [];
      const residentUsers = residents.map((r: { resident_id: string; first_name: string; last_name: string; email: string }) => ({
        id: r.resident_id,
        first_name: r.first_name,
        last_name: r.last_name,
        email: r.email,
        role: 'resident',
      }));
      const adminUsers = admins.map((a: { admin_id: string; first_name: string; last_name: string; email: string }) => ({
        id: a.admin_id,
        first_name: a.first_name,
        last_name: a.last_name,
        email: a.email,
        role: 'admin',
      }));
      setUsers([...residentUsers, ...adminUsers]);
    } catch {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to fetch users.'
      });
    }
  };

  // Fetch time off requests
  const fetchMyTimeOffRequests = useCallback(async () => {
    try {
      const response = await fetch(`${config.apiUrl}/api/vacations`);
      if (response.ok) {
        const data = await response.json();
        setMyTimeOffRequests(data);
      } else {
        setMyTimeOffRequests([]);
      }
    } catch {
      setMyTimeOffRequests([]);
    }
  }, []);

  // Fetch shifts (rotations)
  const fetchShifts = useCallback(async () => {
    try {
      const response = await fetch(`${config.apiUrl}/api/rotations`);
      if (response.ok) {
        const data = await response.json();
        setShifts(data);
      } else {
        setShifts([]);
      }
    } catch {
      setShifts([]);
    }
  }, []);

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

  const handleSendInvite = async () => {
    if (!inviteEmail.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter an email address.",
      });
      return;
    }
  
    try {
      const response = await fetch(`${config.apiUrl}/api/invite/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: inviteEmail.trim(),
        }),
      });
  
      if (response.ok) {
        const newInvitation = {
          id: Date.now().toString(),
          email: inviteEmail.trim(),
          status: "Pending" as const,
        };
        setUserInvitations((prev) => [...prev, newInvitation]);
        setInviteEmail("");
        toast({
          variant: "success",
          title: "Invitation Sent",
          description: `Invitation sent to ${inviteEmail.trim()}.`,
        });
      } else {
        throw new Error('Failed to send invitation');
      }
    } catch (error) {
      console.error("Send invitation error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to send invitation. Please check the email or try again.",
      });
    }
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
    console.log('handleSubmitSwap called');
    if (!selectedResident) {
      console.log('Validation failed: selectedResident is missing');
    }
    if (!selectedShift) {
      console.log('Validation failed: selectedShift is missing');
    }
    if (!yourShiftDate) {
      console.log('Validation failed: yourShiftDate is missing');
    }
    if (!partnerShiftDate) {
      console.log('Validation failed: partnerShiftDate is missing');
    }
    if (!partnerShift) {
      console.log('Validation failed: partnerShift is missing');
    }
    if (!selectedResident || !selectedShift || !yourShiftDate || !partnerShiftDate || !partnerShift) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select both residents, both shifts, and both dates.",
      });
      return;
    }

    // Check PGY level
    const myPGY = residents.find(r => r.resident_id === user?.id)?.graduate_yr;
    const partnerPGY = residents.find(r => r.resident_id === selectedResident)?.graduate_yr;
    if (myPGY !== partnerPGY) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Both residents must be the same PGY level.",
      });
      return;
    }

    try {
      // Filter for user's shift
      const myCandidates = calendarEvents.filter((event) => {
        const eventCallType = (event.extendedProps?.callType || "").trim();
        const eventResidentId = (event.extendedProps?.residentId || "").trim();
        const validCallTypes = mapShiftType(selectedShift);
        if (
          eventResidentId === (user?.id || "").trim() &&
          validCallTypes.includes(eventCallType)
        ) {
          const eventDateLocal = new Date(event.start);
          const yourShiftDateLocal = parseLocalDate(yourShiftDate);
          const equal = isSameDay(eventDateLocal, yourShiftDateLocal);
          console.log("Date compare (my):", {
            eventDate: eventDateLocal.toString(),
            yourShiftDate: yourShiftDateLocal?.toString(),
            equal,
          });
          return equal;
        }
        return false;
      });

      console.log(
        'All events for my user on yourShiftDate:',
        calendarEvents.filter(
          (event) =>
            (event.extendedProps?.residentId || '').trim() === (user?.id || '').trim() &&
            isSameDay(event.start, parseLocalDate(yourShiftDate))
        )
      );

      const myEventsOnDate = calendarEvents.filter(
        (event) =>
          (event.extendedProps?.residentId || '').trim() === (user?.id || '').trim() &&
          isSameDay(event.start, parseLocalDate(yourShiftDate))
      );
      console.log('All events for my user on yourShiftDate (full details):', JSON.stringify(myEventsOnDate, null, 2));

      // Filter for partner's shift
      const partnerCandidates = calendarEvents.filter((event) => {
        const eventCallType = (event.extendedProps?.callType || "").trim();
        const eventResidentId = (event.extendedProps?.residentId || "").trim();
        const validCallTypes = mapShiftType(partnerShift);
        if (
          eventResidentId === (selectedResident || "").trim() &&
          validCallTypes.includes(eventCallType)
        ) {
          const eventDateLocal = new Date(event.start);
          const partnerShiftDateLocal = parseLocalDate(partnerShiftDate);
          const equal = isSameDay(eventDateLocal, partnerShiftDateLocal);
          console.log("Date compare (partner):", {
            eventDate: eventDateLocal.toString(),
            partnerShiftDate: partnerShiftDateLocal?.toString(),
            equal,
          });
          return equal;
        }
        return false;
      });
      console.log('myCandidates:', myCandidates);
      console.log('partnerCandidates:', partnerCandidates);
      const myShift = myCandidates[0];
      const partnerShiftEvent = partnerCandidates[0];
      if (!myShift || !partnerShiftEvent) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not find both shifts to swap.",
        });
        return;
      }
      // Create a swap request (pending approval)
      const swapRequest = {
        ScheduleSwapId: myShift.extendedProps.scheduleId, // or partnerShiftEvent.extendedProps.scheduleId
        RequesterId: user?.id,
        RequesteeId: selectedResident,
        RequesterDate: yourShiftDate,
        RequesteeDate: partnerShiftDate,
        Status: "Pending",
        Details: ""
      };
      console.log('Submitting swapRequest:', swapRequest);
      const response = await fetch(`${config.apiUrl}/api/swaprequests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(swapRequest)
      });
      if (response.ok) {
        toast({
          variant: "success",
          title: "Swap Request Sent",
          description: "Your swap request has been sent and is pending approval.",
        });
      } else {
        const error = await response.text();
        toast({
          variant: "destructive",
          title: "Error",
          description: error || "Failed to create swap request.",
        });
      }
    } catch (error) {
      console.error('Error creating swap request:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create swap request. Please try again.",
      });
    }
    setSelectedResident("");
    setSelectedShift("");
    setYourShiftDate("");
    setPartnerShiftDate("");
    setPartnerShift("");
  };

  const handleSubmitRequestOff = async () => {
    if (!user?.id) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "User ID is missing. Please log in again.",
      });
      return;
    }

    // console.log('[RequestOff] Submitting vacation request for residentId:', user?.id);

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
      
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        requests.push({
          residentId: user.id,
          date: d.toISOString().split('T')[0],
          reason: reason,
          description: description || '',
        });
      }

      // Send all requests
      const response = await fetch(`${config.apiUrl}/api/vacations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requests),
      });

      if (response.ok) {
        toast({
          variant: "success",
          title: "Request Submitted",
          description: `Time off request submitted for ${startDate} to ${endDate}.`,
        });
        
        // Clear form
        setStartDate("");
        setEndDate("");
        setReason("");
        setDescription("");
        
        // Refresh data
        fetchMyTimeOffRequests();
        
        // Add to recent activity
      } else {
        throw new Error('Failed to submit request');
      }
    } catch {
      console.error('Error submitting vacation request');
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to submit request. Please try again.",
      });
    }
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

  const handleChangeRole = async (user: { id: string; first_name: string; last_name: string; email: string; role: string }, newRole: string) => {
    try {
      const response = await fetch(`${config.apiUrl}/api/users/${user.id}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: newRole }),
      });

      if (response.ok) {
        setUsers(prev => prev.map(u => 
          u.id === user.id ? { ...u, role: newRole } : u
        ));
        toast({
          variant: 'success',
          title: 'Role Updated',
          description: `${user.first_name} ${user.last_name}'s role has been updated to ${newRole}.`
        });
      } else {
        throw new Error('Failed to update role');
      }
    } catch {
      console.error('Error updating user role');
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update user role.'
      });
    }
  };

  const handleDeleteUser = async (user: { id: string; role: string }) => {
    try {
      const endpoint = user.role === 'admin' ? 'Admins' : 'Residents';
      const response = await fetch(`${config.apiUrl}/api/${endpoint}/${user.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setUsers(prev => prev.filter(u => u.id !== user.id));
        toast({
          variant: 'success',
          title: 'User Deleted',
          description: 'User has been successfully deleted.'
        });
      } else {
        throw new Error('Failed to delete user');
      }
    } catch {
      console.error('Error deleting user');
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete user.'
      });
    }
  };

  // Handler to clear all requests
  const handleClearRequests = () => {
    setMyTimeOffRequests([]);
  };

  const refreshCalendar = async () => {
    await fetchCalendarEvents();
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
            calendarEvents={calendarEvents}
            onRefreshCalendar={refreshCalendar}
          />
        );

      case "Calendar":
        return (
          <CalendarPage
            events={calendarEvents}
            onNavigateToSwapCalls={() => setSelected("Swap Calls")}
            onNavigateToRequestOff={() => setSelected("Request Off")}
            onNavigateToCheckSchedule={() => setSelected("Check My Schedule")}
            onNavigateToAdmin={() => setSelected("Admin")}
            onNavigateToSettings={() => setSelected("Settings")}
            onNavigateToHome={() => setSelected("Home")}
            isAdmin={isAdmin}
          />
        );

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
        // Compute PGY-matched residents for swap
        const myPGY = residents.find(r => r.resident_id === user?.id)?.graduate_yr;
        const pgyMatchedResidents = residents.filter(r => r.graduate_yr === myPGY && r.resident_id !== user?.id)
          .map(r => ({ id: r.resident_id, name: `${r.first_name} ${r.last_name}` }));
        
        const availableShifts = [
          { id: "Short", name: "Short" },
          { id: "Saturday", name: "Saturday" },
          { id: "Sunday", name: "Sunday" }
        ];
        
        return (
          <SwapCallsPage
            yourShiftDate={yourShiftDate}
            setYourShiftDate={setYourShiftDate}
            partnerShiftDate={partnerShiftDate}
            setPartnerShiftDate={setPartnerShiftDate}
            selectedResident={selectedResident}
            setSelectedResident={setSelectedResident}
            residents={pgyMatchedResidents}
            selectedShift={selectedShift}
            setSelectedShift={setSelectedShift}
            partnerShift={partnerShift}
            setPartnerShift={setPartnerShift}
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
            residents={residents.map(r => ({ id: r.resident_id, name: `${r.first_name} ${r.last_name}` }))}
            myTimeOffRequests={myTimeOffRequests.map(r => ({
              id: r.id,
              startDate: r.date || '',
              endDate: r.date || '',
              resident: r.residentId || '',
              reason: r.reason,
              status: r.status,
            }))}
            shifts={shifts.map(s => ({
              id: s.id,
              name: s.name
            }))}
            handleApproveRequest={handleApproveRequest}
            handleDenyRequest={handleDenyRequest}
            userInvitations={userInvitations}
            inviteEmail={inviteEmail}
            setInviteEmail={setInviteEmail}
            handleSendInvite={handleSendInvite}
            handleResendInvite={handleResendInvite}
            users={users}
            handleChangeRole={handleChangeRole}
            handleDeleteUser={handleDeleteUser}
            inviteRole={inviteRole}
            setInviteRole={setInviteRole}
            onClearRequests={handleClearRequests}
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

  // Initial fetch of residents and calendar events
  useEffect(() => {
    if (user && !loading) {
      fetchResidents();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, loading]);

  // Fetch calendar events after residents are loaded
  useEffect(() => {
    if (residents.length > 0) {
      fetchCalendarEvents();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [residents]);

  // Handle page-specific data fetching
  useEffect(() => {
    if (selected === "Check My Schedule") {
      fetchMySchedule();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected]);

  useEffect(() => {
    fetchUsers();
  }, []);

  // Fetch data when Admin page is selected
  useEffect(() => {
    if (selected === "Admin") {
      fetchMyTimeOffRequests();
      fetchShifts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected]);

  // Computed values
  const displayName = user ? `${user.firstName} ${user.lastName}` : "John Doe";
  const displayEmail = user?.email || "john.doe@email.com";
  const filteredMenuItems = menuItems.filter(item => {
    if (item.title === "Admin") return isAdmin;
    if (item.title === "Request Off") return !isAdmin;
    return true;
  });

  const [inviteRole, setInviteRole] = useState<string>("resident");

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <ProtectedRoute>
      <SidebarProvider defaultOpen={true}>
        <div className={`flex min-h-screen w-full`}>
          <Toaster />
          {/* Left Sidebar Trigger (moves with sidebar, only on calendar page) */}
          {selected === "Calendar" && <SidebarFloatingTrigger />}
          {/* Sidebar Navigation */}
          {selected !== "Calendar" && (
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
          )}
          {/* Main Content Area */}
          <div className={`flex-1 flex flex-col`}>
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