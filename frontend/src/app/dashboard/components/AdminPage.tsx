"use client";

import React, { useState } from "react";
import { Card } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Repeat, CalendarDays, UserPlus, Send, Check, X } from "lucide-react";

interface AdminPageProps {
  residents: { id: string; name: string }[];
  adminSwapRequests: { id: string; date: string; originalShift: string; requestedShift: string; requester: string; responder: string; status: string; }[];
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
}

const AdminPage: React.FC<AdminPageProps> = ({
  residents,
  adminSwapRequests,
  myTimeOffRequests,
  shifts,
  handleApproveRequest,
  handleDenyRequest,
  userInvitations,
  inviteEmail,
  setInviteEmail,
  handleSendInvite,
  handleResendInvite,
  inviteRole,
  setInviteRole,
  users,
  handleChangeRole,
  handleDeleteUser,
}) => {
  const [generating, setGenerating] = useState(false);
  const [message, setMessage] = useState("");

  const handleGenerateSchedule = async () => {
    setGenerating(true);
    setMessage("");
    try {
      const response = await fetch("/api/schedules/generate", { method: "POST" });
      if (!response.ok) throw new Error("Failed to generate schedule");
      setMessage("New schedule generated successfully!");
    } catch (err) {
      setMessage("Error generating schedule. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="w-full pt-4 h-[calc(100vh-4rem)] flex flex-col items-center">
      {/* Generate New Schedule Button */}
      <div className="w-full flex justify-center mb-6">
        <Button onClick={handleGenerateSchedule} disabled={generating} className="bg-blue-600 text-white hover:bg-blue-700">
          {generating ? "Generating..." : "Generate New Schedule"}
        </Button>
      </div>
      {message && <div className="mb-4 text-center text-sm font-medium text-green-600 dark:text-green-400">{message}</div>}
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
          <select
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100"
            value={inviteRole}
            onChange={e => setInviteRole(e.target.value)}
          >
            <option value="resident">Resident</option>
            <option value="admin">Admin</option>
          </select>
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

      {/* User Management */}
      <Card className="p-8 bg-gray-50 dark:bg-neutral-900 shadow-lg rounded-2xl w-full flex flex-col gap-4 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">User Management</h2>
        </div>
        <div className="overflow-x-auto">
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