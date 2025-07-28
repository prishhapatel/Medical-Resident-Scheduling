"use client";
import React, { useEffect, useState, useCallback } from 'react';
import AdminPage from '../components/AdminPage';
import { config } from '../../../config';

// Types
interface Resident { id: string; name: string; }
interface TimeOffRequest { id: string; startDate: string; endDate: string; resident: string; reason: string; status: string; }
interface Shift { id: string; name: string; }
interface UserInvitation { id: string; email: string; status: "Pending" | "Member" | "Not Invited"; }
interface User { id: string; first_name: string; last_name: string; email: string; role: string; }

// API Response types
interface ResidentResponse {
  resident_id: string;
  first_name: string;
  last_name: string;
  email: string;
}

interface ShiftResponse {
  id?: string;
  rotation_id?: string;
  name?: string;
  rotation_name?: string;
  rotation?: string;
}

interface AdminResponse {
  admin_id: string;
  first_name: string;
  last_name: string;
  email: string;
}

export default function Page() {
  // State for all required props
  const [residents, setResidents] = useState<Resident[]>([]);
  const [myTimeOffRequests, setMyTimeOffRequests] = useState<TimeOffRequest[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [userInvitations] = useState<UserInvitation[]>([]); // Not used, but required by AdminPage
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'resident' | 'admin'>('resident');
  const [users, setUsers] = useState<User[]>([]);

  // Fetch residents
  const fetchResidents = useCallback(async () => {
    const response = await fetch(`${config.apiUrl}/api/residents`);
    if (response.ok) {
      const data: ResidentResponse[] = await response.json();
      setResidents(data.map((r) => ({ id: r.resident_id, name: `${r.first_name} ${r.last_name}` })));
    }
  }, []);

  // Fetch time off requests
  const fetchMyTimeOffRequests = useCallback(async () => {
    const response = await fetch(`${config.apiUrl}/api/vacations`);
    if (response.ok) {
      setMyTimeOffRequests(await response.json());
    }
  }, []);

  // Fetch shifts
  const fetchShifts = useCallback(async () => {
    const response = await fetch(`${config.apiUrl}/api/rotations`);
    if (response.ok) {
      const data: ShiftResponse[] = await response.json();
      setShifts(data.map((s) => ({ id: s.id || s.rotation_id || '', name: s.name || s.rotation_name || s.rotation || '' })));
    }
  }, []);

  // Fetch users
  const fetchUsers = useCallback(async () => {
    const [residentsRes, adminsRes] = await Promise.all([
      fetch(`${config.apiUrl}/api/Residents`),
      fetch(`${config.apiUrl}/api/Admins`)
    ]);
    const residentsData: ResidentResponse[] = residentsRes.ok ? await residentsRes.json() : [];
    const adminsData: AdminResponse[] = adminsRes.ok ? await adminsRes.json() : [];
    const residentUsers: User[] = residentsData.map((r) => ({
      id: r.resident_id,
      first_name: r.first_name,
      last_name: r.last_name,
      email: r.email,
      role: 'resident',
    }));
    const adminUsers: User[] = adminsData.map((a) => ({
      id: a.admin_id,
      first_name: a.first_name,
      last_name: a.last_name,
      email: a.email,
      role: 'admin',
    }));
    setUsers([...residentUsers, ...adminUsers]);
  }, []);

  useEffect(() => {
    fetchResidents();
    fetchMyTimeOffRequests();
    fetchShifts();
    fetchUsers();
  }, [fetchResidents, fetchMyTimeOffRequests, fetchShifts, fetchUsers]);

  // Handlers (no-ops for now)
  const handleApproveRequest = () => {};
  const handleDenyRequest = () => {};
  const handleSendInvite = () => {};
  const handleResendInvite = () => {};
  const handleDeleteUser = () => {};
  const handleClearRequests = () => setMyTimeOffRequests([]);

  // Wrapper function to handle type mismatch
  const handleSetInviteRole = (value: string) => {
    setInviteRole(value as 'resident' | 'admin');
  };

  return (
    <AdminPage
      residents={residents}
      myTimeOffRequests={myTimeOffRequests}
      shifts={shifts}
      handleApproveRequest={handleApproveRequest}
      handleDenyRequest={handleDenyRequest}
      userInvitations={userInvitations}
      inviteEmail={inviteEmail}
      setInviteEmail={setInviteEmail}
      handleSendInvite={handleSendInvite}
      handleResendInvite={handleResendInvite}
      users={users}
      handleDeleteUser={handleDeleteUser}
      inviteRole={inviteRole}
      setInviteRole={handleSetInviteRole}
      onClearRequests={handleClearRequests}
      onNavigateToCalendar={() => window.location.href = '/dashboard?view=Calendar'}
      userId="admin" // Since this is the admin page, we'll use a default admin ID
    />
  );
} 