"use client";

import React, { useState, useEffect } from "react";
import { Card } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { CalendarDays, UserPlus, Send, Check, X } from "lucide-react";
import { differenceInCalendarDays, parseISO } from 'date-fns';
import { config } from '../../../config';

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
  handleChangeRole: (user: { id: string; first_name: string; last_name: string; email: string; role: string }, newRole: string) => void;
  handleDeleteUser: (user: { id: string; first_name: string; last_name: string; email: string; role: string }) => void;
  onClearRequests?: () => void;
  latestVersion?: string;
  onNavigateToCalendar?: () => void;
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
  handleChangeRole,
  handleDeleteUser,
  onClearRequests,
  onNavigateToCalendar,
}) => {
  const [generating, setGenerating] = useState(false);
  const [message, setMessage] = useState("");
  const [showRequestsModal, setShowRequestsModal] = useState(false);
  const [showInvitationsModal, setShowInvitationsModal] = useState(false);
  const [myTimeOffRequests, setMyTimeOffRequests] = useState<Request[]>([]);
  console.log("RAW REQUESTS:", myTimeOffRequests);

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
        }));
        setMyTimeOffRequests(mapped);
      });
  }, []);
  

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
        });
        
  
        i = j;
      }
    }
  
    return result;
  }
  
  

  const groupedRequests = groupRequests(myTimeOffRequests);
  console.log("Grouped requests:", groupedRequests);


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
  

  return (
    <div className="w-full pt-4 h-[calc(100vh-4rem)] flex flex-col items-center pl-8">
      <div className="w-full flex flex-row-reverse items-center justify-center gap-8 mb-8 flex-wrap">
        <Button onClick={handleGenerateSchedule} disabled={generating} className="bg-blue-600 text-white hover:bg-blue-700 whitespace-nowrap ml-0 md:ml-20">
          {generating ? "Generating..." : "Generate New Schedule"}
        </Button>
        <div className="grid grid-cols-2 gap-2 max-w-lg">
          <Card className="p-4 bg-gray-50 dark:bg-neutral-900 shadow rounded-xl flex flex-col items-center">
            <h3 className="text-xl font-medium text-gray-500 dark:text-gray-400 mb-1">Total Residents</h3>
            <p className="text-2xl font-bold mb-0.5">{residents.length}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Active</p>
          </Card>
          <Card className="p-4 bg-gray-50 dark:bg-neutral-900 shadow rounded-xl flex flex-col items-center">
            <h3 className="text-xl font-medium text-gray-500 dark:text-gray-400 mb-1">Pending Requests</h3>
            <p className="text-2xl font-bold mb-0.5">{myTimeOffRequests.filter(r => r.status === "Pending").length}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Time off</p>
          </Card>
        </div>
      </div>
      {message && <div className="mb-4 text-center text-sm font-medium text-green-600 dark:text-green-400">{message}</div>}

      {/* Request Off Management */}
      <Card className="p-8 bg-gray-50 dark:bg-neutral-900 shadow-lg rounded-2xl w-full flex flex-col gap-4 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Time Off Requests</h2>
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
        <div className="overflow-x-auto max-h-96 overflow-y-auto">
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
                          <Button variant="outline" size="sm" className="text-green-600 border-green-600 hover:bg-green-500 hover:text-white" onClick={() => handleApproveRequest(request.id || '')}>
                            <Check className="h-4 w-4 mr-2" /> Approve
                          </Button>
                          <Button variant="outline" size="sm" className="text-red-600 border-red-600 hover:bg-red-500 hover:text-white" onClick={() => handleDenyRequest(request.id || '')}>
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
          <Button variant="outline" size="sm" className="flex items-center gap-2"
            onClick={() => setShowInvitationsModal(true)}>
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
        <div className="overflow-x-auto max-h-96 overflow-y-auto">
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
      </Card>

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
                          <Button variant="outline" size="sm" className="text-green-600 border-green-600 hover:bg-green-500 hover:text-white" onClick={() => handleApproveRequest(request.id || '')}>
                            <Check className="h-4 w-4 mr-2" /> Approve
                          </Button>
                          <Button variant="outline" size="sm" className="text-red-600 border-red-600 hover:bg-red-500 hover:text-white" onClick={() => handleDenyRequest(request.id || '')}>
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
      <Card className="p-8 bg-gray-50 dark:bg-neutral-900 shadow-lg rounded-2xl w-full flex flex-col gap-4 mb-8">
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
                        onChange={e => handleChangeRole(user, e.target.value)}
                        className="border border-gray-300 dark:border-gray-700 rounded px-2 py-1 bg-white dark:bg-neutral-800"
                      >
                        <option value="resident">Resident</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Button variant="outline" size="sm" className="text-red-600 border-red-600 hover:bg-red-500 hover:text-white" onClick={() => handleDeleteUser(user)}>
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
      </Card>
    </div>
  )
}

export default AdminPage; 