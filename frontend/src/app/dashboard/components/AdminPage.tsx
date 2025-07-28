"use client";

import React, { useState, useEffect } from "react";
import { Card } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { CalendarDays, Send, Check, X, Shield, Users, Repeat2 } from "lucide-react";
import { differenceInCalendarDays, parseISO } from 'date-fns';
import { config } from '../../../config';
import { toast } from "../../../lib/use-toast";
import { useMemo } from "react";
import { Dialog } from "../../../components/ui/dialog";

interface AdminPageProps {
  residents: { id: string; name: string }[];
  myTimeOffRequests: { id: string; startDate: string; endDate: string; resident: string; reason: string; status: string; }[];
  shifts: { id: string; name: string }[];
  handleApproveRequest: (id: string) => void;
  handleDenyRequest: (id: string) => void;
  userInvitations: { id: string; email: string; status: "Pending" | "Member" | "Not Invited"; }[];
  inviteEmail: string;
  setInviteEmail: (value: string) => void;
  handleSendInvite: () => void;
  handleResendInvite: (id: string) => void;
  inviteRole: string;
  setInviteRole: (value: string) => void;
  users: { id: string; first_name: string; last_name: string; email: string; role: string }[];
  handleDeleteUser: (user: { id: string; first_name: string; last_name: string; email: string; role: string }) => void;
  onClearRequests?: () => void;
  latestVersion?: string;
  onNavigateToCalendar?: () => void;
  userId: string;
}

interface Request {
  id: string;
  firstName: string;
  lastName: string;
  reason: string;
  status: string;
  date: string;
  startDate?: string;
  endDate?: string;
  residentId?: string;
  details?: string;
  groupId: string;
}

interface SwapRequest {
  SwapId: string;
  ScheduleSwapId: string;
  RequesterId: string;
  RequesteeId: string;
  RequesterDate: string;
  RequesteeDate: string;
  Status: string;
  CreatedAt: string;
  UpdatedAt: string;
  Details?: string;
}

interface Announcement {
  announcementId: string;
  message: string;
  createdAt?: string;
}


// Modal component
function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-card p-8 rounded-xl shadow-lg max-w-2xl w-full relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-xl font-bold">&times;</button>
        <h2 className="text-2xl font-bold mb-4">{title}</h2>
        <div className="overflow-y-auto max-h-[60vh]">{children}</div>
      </div>
    </div>
  );
}

const AdminPage: React.FC<AdminPageProps> = ({
  residents,
  handleApproveRequest,
  handleDenyRequest,
  userInvitations,
  inviteEmail,
  setInviteEmail,
  handleSendInvite,
  handleResendInvite,
  // inviteRole and setInviteRole are not currently used but kept for future functionality
  // inviteRole,
  // setInviteRole,
  users,
  handleDeleteUser,
  onClearRequests,
  onNavigateToCalendar,
  userId,
}) => {
  console.log('AdminPage props - users:', users);
  console.log('AdminPage props - users length:', users.length);
  
  const [generating, setGenerating] = useState(false);
  const [message, setMessage] = useState("");
  const [showRequestsModal, setShowRequestsModal] = useState(false);
  const [showInvitationsModal, setShowInvitationsModal] = useState(false);
  const [myTimeOffRequests, setMyTimeOffRequests] = useState<Request[]>([]);
  console.log("RAW REQUESTS:", myTimeOffRequests);
  const [confirmDelete, setConfirmDelete] = useState<{ open: boolean; user: { id: string; first_name: string; last_name: string; email: string; role: string } | null }>({ open: false, user: null });
  const [swapHistory, setSwapHistory] = useState<SwapRequest[]>([]);
  const [activeTab, setActiveTab] = useState<'swaps' | 'requests' | 'users' | 'announcements'>('swaps');
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [announcementText, setAnnouncementText] = useState('');
  const [posting, setPosting] = useState(false);
  const [announcementError, setAnnouncementError] = useState<string | null>(null);
  const [showAnnouncementConfirm, setShowAnnouncementConfirm] = useState(false);
  const [deletingAnnouncement, setDeletingAnnouncement] = useState<string | null>(null);
  const [switchingRole, setSwitchingRole] = useState<string | null>(null);



  const handleGenerateSchedule = async () => {
    setGenerating(true);
    setMessage("");
    try {
      const response = await fetch(`${config.apiUrl}/api/algorithm/training/2025`, { method: "POST" });
      if (!response.ok) throw new Error("Failed to generate schedule");
      setMessage("New schedule generated successfully!");
      
      // Navigate to calendar view after successful generation
      if (onNavigateToCalendar) {
        setTimeout(() => {
          onNavigateToCalendar();
        }, 1500); // Wait 1.5 seconds to show success message
      }
    } catch {
      setMessage("Error generating schedule. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  useEffect(() => {
    // Ping backend API
    fetch(`${config.apiUrl}/api/rotations`, { method: 'GET' })
      .then(res => {
        // Backend status check - keeping the logic but not storing the result
        if (!res.ok) {
          console.warn('Backend is offline');
        }
      })
      .catch(() => {
        console.warn('Backend is offline');
      });
  }, []);

  useEffect(() => {
    fetch(`${config.apiUrl}/api/vacations`)
      .then(res => res.json())
      .then((data) => {
        const mapped: Request[] = data.map((vac: {
          vacationId: string;
          firstName: string;
          lastName: string;
          date: string;
          reason: string;
          status: string;
          residentId: string;
          details?: string;
          groupId: string;
        }) => ({
          id: vac.vacationId,
          firstName: vac.firstName,
          lastName: vac.lastName,
          date: vac.date,
          startDate: vac.date,
          endDate: vac.date,
          reason: vac.reason,
          status: vac.status,
          residentId: vac.residentId,
          details: vac.details,
          groupId: vac.groupId
        }));
        setMyTimeOffRequests(mapped);
      });
  }, []);

  useEffect(() => {
    fetch(`${config.apiUrl}/api/swaprequests`)
      .then(res => {
        console.log('Swap requests API response status:', res.status);
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }
        return res.json();
      })
      .then((data) => {
        console.log('Swap history data:', data);
        console.log('Swap history data length:', data.length);
        setSwapHistory(data);
      })
      .catch(error => {
        console.error('Error fetching swap history:', error);
        setSwapHistory([]);
      });
  }, []);
  
  // Refetch swapHistory when switching to the swaps tab
  useEffect(() => {
    if (activeTab === 'swaps') {
      console.log('Switching to swaps tab, fetching data...');
      fetch(`${config.apiUrl}/api/swaprequests`)
        .then(res => {
          console.log('Swap requests API response status (tab switch):', res.status);
          if (!res.ok) {
            throw new Error(`HTTP ${res.status}: ${res.statusText}`);
          }
          return res.json();
        })
        .then((data) => {
          console.log('Swap history data (tab switch):', data);
          console.log('Swap history data length (tab switch):', data.length);
          setSwapHistory(data);
        })
        .catch(error => {
          console.error('Error fetching swap history (tab switch):', error);
          setSwapHistory([]);
        });
    }
  }, [activeTab]);

  // Fetch announcements when switching to the announcements tab
  useEffect(() => {
    if (activeTab === 'announcements') {
      fetch(`${config.apiUrl}/api/announcements`)
        .then(res => {
          if (!res.ok) throw new Error('Failed to fetch');
          return res.json();
        })
        .then(setAnnouncements)
        .catch(() => setAnnouncementError('Could not load announcements. Backend may not be ready.'));
    }
  }, [activeTab]);


  // Group vacation requests by resident and reason into date ranges
  function groupRequests(requests: Request[]) {
    if (!requests || requests.length === 0) return [];
  
    const groupedMap = new Map<string, Request[]>();
  
    for (const req of requests) {
      const key = `${req.firstName} ${req.lastName}||${req.reason}`;
      if (!groupedMap.has(key)) {
        groupedMap.set(key, []);
      }
      groupedMap.get(key)!.push(req);
    }
  
    const result = [];
  
    for (const [, entries] of groupedMap.entries()) {
      const sorted = entries.sort((a, b) =>
        new Date(a.startDate || "").getTime() - new Date(b.startDate || "").getTime()
      );
  
      let i = 0;
      while (i < sorted.length) {
        const current = sorted[i];
        const start = current.startDate!;
        let end = current.endDate!;
  
        let j = i + 1;
        while (
          j < sorted.length &&
          differenceInCalendarDays(parseISO(sorted[j].startDate!), parseISO(end)) <= 1
        ) {
          end = sorted[j].endDate!;
          j++;
        }
  
        result.push({
          id: current.id,
          residentId: current.residentId,
          firstName: current.firstName,
          lastName: current.lastName,
          reason: current.reason,
          status: current.status,
          startDate: start,
          endDate: end,
          groupId:   current.groupId,
        });
        
  
        i = j;
      }
    }
  
    return result;
  }
  
  

  const groupedRequests = groupRequests(myTimeOffRequests);
  console.log("Grouped requests:", groupedRequests);

  // Create a mapping from resident ID to name
  const idToName = useMemo(() => {
    console.log('Creating idToName mapping with users:', users);
    console.log('Users array length:', users.length);
    console.log('First few users:', users.slice(0, 3));
    
    const mapping: { [key: string]: string } = {};
    users.forEach(user => {
      console.log('Processing user:', user);
      mapping[user.id] = `${user.first_name} ${user.last_name}`;
    });
    console.log('Final idToName mapping:', mapping);
    return mapping;
  }, [users]);

  // Fallback mapping using residents data if users is empty
  const fallbackIdToName = useMemo(() => {
    console.log('Creating fallback mapping, users length:', users.length);
    if (users.length === 0) {
      // This is a temporary fallback - we'll need to pass residents data to AdminPage
      return {
        'LLU6249': 'Felix Hernandez Perez',
        'FVO3464': 'Alexis Shahidi'
      };
    }
    return {};
  }, [users]);

  const finalIdToName = users.length > 0 ? idToName : fallbackIdToName;
  console.log('Final mapping being used:', finalIdToName);

  const pendingSwapsCount = swapHistory.filter(s => s.Status === 'Pending').length;
  console.log('swapHistory array:', swapHistory);
  console.log('pendingSwapsCount:', pendingSwapsCount);
  const pendingRequestsCount = groupedRequests.filter(r => r.status === 'Pending').length;


  // Helper to format a date as MM/DD/YYYY
  const formatDate = (dateStr: string) => {
    console.log("Parsing dateStr:", dateStr); // <-- Debug line
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return 'N/A';
    return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
  };

  // Helper to get date or date range
  const getRequestDate = (request: Request) => {
    if (request.startDate && request.endDate) {
      return request.startDate === request.endDate
        ? formatDate(request.startDate)
        : `${formatDate(request.startDate)} - ${formatDate(request.endDate)}`;
    }
    return 'N/A';
  };
  

  // Helper to get resident name
  const getResidentName = (request: Request) => {
    if (request.firstName && request.lastName) {
      return `${request.firstName} ${request.lastName}`;
    }
    return 'N/A';
  };

  const handleDeleteUserWithConfirm = (user: { id: string; first_name: string; last_name: string; email: string; role: string }) => {
    setConfirmDelete({ open: true, user });
  };
  const handleConfirmDelete = () => {
    if (confirmDelete.user) {
      handleDeleteUser(confirmDelete.user);
      toast({ title: "User deleted", description: `${confirmDelete.user.first_name} ${confirmDelete.user.last_name} has been deleted.`, variant: "success" });
    }
    setConfirmDelete({ open: false, user: null });
  };
  const handleCancelDelete = () => setConfirmDelete({ open: false, user: null });

  const handlePostAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowAnnouncementConfirm(true);
  };
  const handleConfirmPostAnnouncement = async () => {
    setPosting(true);
    setAnnouncementError(null);
    setShowAnnouncementConfirm(false);
    try {
      const res = await fetch(`${config.apiUrl}/api/announcements`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: announcementText,
          authorId: userId 
        }),
      });
      if (!res.ok) throw new Error('Failed to post');
      setAnnouncementText('');
      // Refetch announcements
      const data = await fetch(`${config.apiUrl}/api/announcements`).then(r => r.json());
      setAnnouncements(data);
    } catch {
      setAnnouncementError('Could not post announcement. Backend may not be ready.');
    } finally {
      setPosting(false);
    }
  };

  const handleDeleteAnnouncement = async (announcementId: string) => {
    setDeletingAnnouncement(announcementId);
    setAnnouncementError(null);
    try {
      const res = await fetch(`${config.apiUrl}/api/announcements/${announcementId}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Failed to delete: ${res.status} ${errorText}`);
      }
      // Refetch announcements
      const data = await fetch(`${config.apiUrl}/api/announcements`).then(r => r.json());
      setAnnouncements(data);
    } catch (error) {
      console.error('Delete announcement error:', error);
      setAnnouncementError(`Could not delete announcement: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setDeletingAnnouncement(null);
    }
  };

  const handleSwitchRole = async (user: { id: string; first_name: string; last_name: string; email: string; role: string }, newRole: string) => {
    // Don't do anything if the role hasn't actually changed
    if (user.role === newRole) return;
    
    setSwitchingRole(user.id);
    try {
      const endpoint = user.role === 'admin' ? 'Residents/demote-admin' : 'Admins/promote-resident';
      const response = await fetch(`${config.apiUrl}/api/${endpoint}/${user.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        toast({
          title: "Role Updated",
          description: `${user.first_name} ${user.last_name} has been switched to ${newRole}.`,
          variant: "success"
        });
        // Refresh the page to update the user list
        window.location.reload();
      } else {
        const error = await response.text();
        toast({
          title: "Error",
          description: error || "Failed to switch user role.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error switching user role:', error);
      toast({
        title: "Error",
        description: "Failed to switch user role. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSwitchingRole(null);
    }
  };



  return (
    <div className="w-full pt-4 h-[calc(100vh-4rem)] flex flex-col items-center px-4 md:pl-8">
      {/* Dashboard Overview Card */}
              <Card className="mb-8 p-6 flex flex-col gap-4 items-center justify-between bg-white dark:bg-neutral-900 shadow-lg rounded-2xl border border-gray-200 dark:border-gray-800">
        <h2 className="text-2xl font-bold flex items-center gap-2 justify-center w-full mb-2">
          <Shield className="w-6 h-6 text-blue-600" />
          Admin Dashboard
        </h2>
        <div className="flex flex-col md:flex-row items-center w-full justify-between gap-4">
          <div />
          <div className="flex flex-col sm:flex-row gap-4 md:gap-8 items-center">
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-2 mb-1">
                <Users className="w-5 h-5 text-blue-500" />
                <span className="text-2xl font-bold text-gray-900 dark:text-white">{residents.length}</span>
              </div>
              <span className="text-xs text-gray-500">Residents</span>
            </div>
                          <div className="flex flex-col items-center border-t sm:border-t-0 sm:border-l border-gray-200 dark:border-gray-700 pt-4 sm:pt-0 sm:pl-8">
                <div className="flex items-center gap-2 mb-1">
                  <Repeat2 className="w-5 h-5 text-yellow-500" />
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">{pendingSwapsCount}</span>
                </div>
                <span className="text-xs text-gray-500">Pending Swaps</span>
              </div>
                          <div className="flex flex-col items-center border-t sm:border-t-0 sm:border-l border-gray-200 dark:border-gray-700 pt-4 sm:pt-0 sm:pl-8">
                <div className="flex items-center gap-2 mb-1">
                  <CalendarDays className="w-5 h-5 text-green-500" />
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">{pendingRequestsCount}</span>
                </div>
                <span className="text-xs text-gray-500">Pending Time Off</span>
              </div>
            <div className="h-6 sm:h-10 border-t sm:border-t-0 sm:border-l border-gray-200 dark:border-gray-700 mx-0 sm:mx-4 lg:mx-6 hidden sm:block" />
            <Button onClick={handleGenerateSchedule} disabled={generating} className="px-1 sm:px-6 py-1 sm:py-3 bg-blue-600 text-white font-semibold rounded-xl shadow hover:bg-blue-700 transition whitespace-nowrap w-full sm:w-auto text-xs sm:text-sm lg:text-base">
              {generating ? "Generating..." : "Generate New Schedule"}
            </Button>
          </div>
        </div>
      </Card>
      {message && <div className="mb-4 text-center text-sm font-medium text-green-600 dark:text-green-400">{message}</div>}

      {/* Tab Navigation */}
      <div className="w-full max-w-6xl flex flex-col sm:flex-row gap-1 sm:gap-2 mb-4 sm:mb-6">
        <Button
          variant={activeTab === 'swaps' ? 'default' : 'outline'}
          className={`flex-1 rounded-b-none sm:rounded-br-none text-xs sm:text-sm py-1 sm:py-2 ${activeTab === 'swaps' ? 'shadow-md' : ''}`}
          onClick={() => setActiveTab('swaps')}
        >
          Swap Call History
        </Button>
        <Button
          variant={activeTab === 'requests' ? 'default' : 'outline'}
          className={`flex-1 rounded-b-none text-xs sm:text-sm py-1 sm:py-2 ${activeTab === 'requests' ? 'shadow-md' : ''}`}
          onClick={() => setActiveTab('requests')}
        >
          Time Off Requests
        </Button>
        <Button
          variant={activeTab === 'users' ? 'default' : 'outline'}
          className={`flex-1 rounded-b-none text-xs sm:text-sm py-1 sm:py-2 ${activeTab === 'users' ? 'shadow-md' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          User Management
        </Button>
        <Button
          variant={activeTab === 'announcements' ? 'default' : 'outline'}
          className={`flex-1 rounded-b-none text-xs sm:text-sm py-1 sm:py-2 ${activeTab === 'announcements' ? 'shadow-md' : ''}`}
          onClick={() => setActiveTab('announcements')}
        >
          Announcements
        </Button>
      </div>
      {/* Tab Content */}
      <div className="w-full">
        {activeTab === 'swaps' && (
          <Card className="p-4 sm:p-6 lg:p-8 bg-gray-50 dark:bg-neutral-900 shadow-lg rounded-2xl w-full flex flex-col gap-4 mb-6 sm:mb-8 border border-gray-200 dark:border-gray-800">
            <h2 className="text-lg sm:text-xl font-bold mb-4">Swap Call History</h2>
            <div className="overflow-x-auto max-h-96 overflow-y-auto w-full">
              <table className="w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-100 dark:bg-neutral-800">
                  <tr>
                    <th className="px-1 sm:px-3 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requester</th>
                    <th className="px-1 sm:px-3 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requestee</th>
                    <th className="px-1 sm:px-3 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-1 sm:px-3 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Partner</th>
                    <th className="px-1 sm:px-3 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-1 sm:px-3 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200 dark:bg-neutral-900 dark:divide-gray-700">
                  {swapHistory.length > 0 ? (
                    swapHistory.map((swap, idx) => {
                      console.log('Rendering swap:', swap);
                      console.log('swap.RequesterId:', swap.RequesterId);
                      console.log('swap.RequesteeId:', swap.RequesteeId);
                      console.log('finalIdToName[swap.RequesterId]:', finalIdToName[swap.RequesterId]);
                      console.log('finalIdToName[swap.RequesteeId]:', finalIdToName[swap.RequesteeId]);
                      
                      return (
                      <tr key={swap.SwapId || idx} className="hover:bg-gray-50 dark:hover:bg-neutral-800">
                        <td className="px-1 sm:px-3 py-3 sm:py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                          {finalIdToName[swap.RequesterId] || `Resident ${swap.RequesterId}`}
                        </td>
                        <td className="px-1 sm:px-3 py-3 sm:py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                          {finalIdToName[swap.RequesteeId] || `Resident ${swap.RequesteeId}`}
                        </td>
                        <td className="px-1 sm:px-3 py-3 sm:py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{swap.RequesterDate ? new Date(swap.RequesterDate).toLocaleDateString() : ''}</td>
                        <td className="px-1 sm:px-3 py-3 sm:py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{swap.RequesteeDate ? new Date(swap.RequesteeDate).toLocaleDateString() : ''}</td>
                        <td className={`px-1 sm:px-3 py-3 sm:py-4 whitespace-nowrap text-sm font-semibold ${
                          swap.Status === 'Approved' ? 'text-green-600' : 
                          swap.Status === 'Denied' ? 'text-red-600' : 
                          'text-yellow-600'
                        }`}>
                          {swap.Status}
                        </td>
                        <td className="px-1 sm:px-3 py-3 sm:py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{swap.Details || '-'}</td>
                      </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 text-center text-gray-500 italic">No swap call history found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        )}
        {activeTab === 'requests' && (
          <Card className="p-4 sm:p-6 lg:p-8 bg-gray-50 dark:bg-neutral-900 shadow-lg rounded-2xl w-full flex flex-col gap-4 mb-6 sm:mb-8 border border-gray-200 dark:border-gray-800">
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
                <h2 className="text-lg sm:text-xl font-bold">Time Off Requests</h2>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex items-center gap-2"
                  onClick={() => setShowRequestsModal(true)}>
                  <CalendarDays className="h-4 w-4" />
                  <span>View All</span>
                </Button>
                {onClearRequests && (
                  <Button variant="outline" size="sm" className="flex items-center gap-2 text-red-600 border-red-600 hover:bg-red-500 hover:text-white" onClick={onClearRequests}>
                    <X className="h-4 w-4" />
                    <span>Clear</span>
                  </Button>
                )}
              </div>
            </div>
            <div className="overflow-x-auto max-h-96 overflow-y-auto w-full">
              <table className="w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-100 dark:bg-neutral-800">
                  <tr>
                    <th className="px-2 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Range</th>
                    <th className="px-2 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Resident</th>
                    <th className="px-2 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                    <th className="px-2 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-2 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200 dark:bg-neutral-900 dark:divide-gray-700">
                  {groupedRequests.length > 0 ? (
                    groupedRequests.map((request: Request, idx: number) => (
                      <tr key={request.id || `${request.startDate || request.date || ''}-${getResidentName(request)}-${idx}`}
                          className="hover:bg-gray-50 dark:hover:bg-neutral-800">
                        <td className="px-2 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{getRequestDate(request)}</td>
                        <td className="px-2 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{getResidentName(request)}</td>
                        <td className="px-2 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{request.reason}</td>
                        <td className="px-2 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{request.status}</td>
                        <td className="px-2 sm:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          {request.status === "Pending" && (
                            <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2">
                              <Button variant="outline" size="sm" className="text-green-600 border-green-600 hover:bg-green-500 hover:text-white w-full sm:w-auto" onClick={() => handleApproveRequest(request.groupId || '')}>
                                <Check className="h-4 w-4 mr-2" /> Approve
                              </Button>
                              <Button variant="outline" size="sm" className="text-red-600 border-red-600 hover:bg-red-500 hover:text-white w-full sm:w-auto" onClick={() => handleDenyRequest(request.groupId || '')}>
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
        )}
        {activeTab === 'users' && (
          <Card className="p-8 bg-gray-50 dark:bg-neutral-900 shadow-lg rounded-2xl w-full flex flex-col gap-8 mb-8 border border-gray-200 dark:border-gray-800">
            {/* User Invitations Section */}
            <div>
              <h2 className="text-xl font-bold mb-2">User Invitations</h2>
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
              <div className="overflow-x-auto max-h-60 overflow-y-auto mb-6">
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
                              <Button variant="outline" size="sm" className="text-blue-600 border-blue-600 hover:bg-blue-500 hover:text-white" onClick={() => handleResendInvite(invite.id || '')}>
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
            </div>
            {/* User Management Table Section */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">User Management</h2>
              </div>
              <div className="overflow-x-auto max-h-96 overflow-y-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-100 dark:bg-neutral-800">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200 dark:bg-neutral-900 dark:divide-gray-700">
                    {users.length > 0 ? (
                      users.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-neutral-800">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{user.first_name} {user.last_name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{user.email}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <select
                              value={user.role}
                              onChange={(e) => handleSwitchRole(user, e.target.value)}
                              disabled={switchingRole === user.id}
                              className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="resident">{switchingRole === user.id ? 'Switching...' : 'Resident'}</option>
                              <option value="admin">{switchingRole === user.id ? 'Switching...' : 'Admin'}</option>
                            </select>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <Button variant="outline" size="sm" className="text-red-600 border-red-600 hover:bg-red-500 hover:text-white" onClick={() => handleDeleteUserWithConfirm(user)}>
                              Delete
                            </Button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="px-6 py-4 text-center text-gray-500 italic">No users found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </Card>
        )}
        {activeTab === 'announcements' && (
          <Card className="p-8 bg-gray-50 dark:bg-neutral-900 shadow-lg rounded-2xl w-full flex flex-col gap-8 mb-8 border border-gray-200 dark:border-gray-800">
            <h2 className="text-xl font-bold mb-4">Announcements</h2>
            <form onSubmit={handlePostAnnouncement} className="flex flex-col gap-4 mb-6">
              <textarea
                className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100"
                placeholder="Write a new announcement..."
                value={announcementText}
                onChange={e => setAnnouncementText(e.target.value)}
                rows={3}
                disabled={posting}
              />
              <Button type="submit" disabled={posting || !announcementText.trim()} className="self-end px-6 py-2">
                {posting ? 'Posting...' : 'Post Announcement'}
              </Button>
            </form>
            <Dialog open={showAnnouncementConfirm} onOpenChange={setShowAnnouncementConfirm}>
              <div className="max-w-md w-full bg-white dark:bg-neutral-900 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                <div className="text-lg font-semibold mb-4">Are you sure you want to post this announcement?</div>
                <div className="my-4 p-3 bg-gray-100 dark:bg-neutral-800 rounded text-gray-900 dark:text-gray-100">
                  {announcementText}
                </div>
                <div className="flex justify-end gap-2 mt-6">
                  <Button variant="outline" onClick={() => setShowAnnouncementConfirm(false)}>Cancel</Button>
                  <Button onClick={handleConfirmPostAnnouncement} disabled={posting} className="bg-blue-600 text-white">Yes, Post</Button>
                </div>
              </div>
            </Dialog>
            {announcementError && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {announcementError}
              </div>
            )}
            <div className="flex flex-col gap-4">
              {announcements.length === 0 && !announcementError && (
                <div className="text-gray-500">No announcements yet.</div>
              )}
              {announcements.map((a, idx) => (
                <div key={a.announcementId || idx} className="p-4 bg-white dark:bg-neutral-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-sm">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="text-gray-900 dark:text-gray-100 mb-1">{a.message}</div>
                      <div className="text-xs text-gray-500">{a.createdAt ? new Date(a.createdAt).toLocaleString() : ''}</div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 border-red-600 hover:bg-red-500 hover:text-white ml-4"
                      onClick={() => handleDeleteAnnouncement(a.announcementId)}
                      disabled={deletingAnnouncement === a.announcementId}
                    >
                      {deletingAnnouncement === a.announcementId ? 'Deleting...' : 'Delete'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>

      {/* Modals for View All */}
      <Modal
        open={showRequestsModal}
        onClose={() => setShowRequestsModal(false)}
        title="All Time Off Requests"
      >
        <div className="overflow-x-auto">
          {/* Copy the full requests table here */}
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
              {groupedRequests.length > 0 ? (
                groupedRequests.map((request: Request, idx: number) => (
                  <tr key={request.id || `${request.startDate || request.date || ''}-${getResidentName(request)}-${idx}`}
                      className="hover:bg-gray-50 dark:hover:bg-neutral-800">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{getRequestDate(request)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{getResidentName(request)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{request.reason}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{request.status}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {request.status === "Pending" && (
                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="sm" className="text-green-600 border-green-600 hover:bg-green-500 hover:text-white" onClick={() => handleApproveRequest(request.groupId || '')}>
                            <Check className="h-4 w-4 mr-2" /> Approve
                          </Button>
                          <Button variant="outline" size="sm" className="text-red-600 border-red-600 hover:bg-red-500 hover:text-white" onClick={() => handleDenyRequest(request.groupId || '')}>
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
      </Modal>

      <Modal
        open={showInvitationsModal}
        onClose={() => setShowInvitationsModal(false)}
        title="All User Invitations"
      >
        <div className="overflow-x-auto">
          {/* Copy the full invitations table here */}
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
                        <Button variant="outline" size="sm" className="text-blue-600 border-blue-600 hover:bg-blue-500 hover:text-white" onClick={() => handleResendInvite(invite.id || '')}>
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
      </Modal>

      {/* Add spacing between User Invitations and User Management */}
      <div className="my-4" />

      {/* User Management */}
      {/* This section is now part of the tab content, so it's removed from here */}

      <Modal open={confirmDelete.open} onClose={handleCancelDelete} title="Confirm Delete">
        <div className="space-y-4">
          <p>Are you sure you want to delete {confirmDelete.user?.first_name} {confirmDelete.user?.last_name}?</p>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={handleCancelDelete}>Cancel</Button>
            <Button className="bg-red-600 text-white hover:bg-red-700" onClick={handleConfirmDelete}>Delete</Button>
          </div>
        </div>
      </Modal>

      
    </div>
  )
}

export default AdminPage; 