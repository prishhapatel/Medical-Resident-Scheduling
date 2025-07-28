import React, { useState, useEffect } from "react";
import { Card } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Calendar, Clock, RotateCcw, CalendarCheck, Bell, Users } from "lucide-react";
import { config } from "../../../config";
import { Dialog } from "../../../components/ui/dialog";
import { toast } from "../../../lib/use-toast";

interface HomeProps {
  displayName: string;
  rotation: string | null;
  rotationEndDate: string | null;
  monthlyHours: number | string | null;
  hasData: boolean;
  onNavigateToSwapCalls: () => void;
  onNavigateToRequestOff: () => void;
  onNavigateToSchedule: () => void;
  userId: string;
  calendarEvents?: CalendarEvent[];
  onRefreshCalendar?: () => void;
  isAdmin: boolean;
}

interface DashboardData {
  monthlyHours: number;
  upcomingShifts: Array<{
    date: string;
    type: string;
  }>;
  recentActivity: Array<{
    id: string;
    type: string;
    message: string;
    date: string;
  }>;
  teamUpdates: Array<{
    id: string;
    message: string;
    date: string;
  }>;
}

interface CalendarEvent {
  start: Date | string;
  extendedProps?: {
    residentId?: string;
  };
}

const HomePage: React.FC<HomeProps & { calendarEvents?: CalendarEvent[]; userId: string; onRefreshCalendar?: () => void }> = ({
  displayName,
  onNavigateToSwapCalls,
  onNavigateToRequestOff,
  onNavigateToSchedule,
  userId,
  calendarEvents = [], // Accept calendarEvents as prop if available
  onRefreshCalendar,
  isAdmin,
}) => {
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    monthlyHours: 0,
    upcomingShifts: [],
    recentActivity: [],
    teamUpdates: []
  });
  const [loading, setLoading] = useState(true);
  const [hoursThisMonth, setHoursThisMonth] = useState(0);
  const [denyModalOpen, setDenyModalOpen] = useState(false);
  const [denyReason, setDenyReason] = useState("");
  const [pendingDenyId, setPendingDenyId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const refreshDashboard = async () => {
    setLoading(true);
    try {
      const dashboardResponse = await fetch(`${config.apiUrl}/api/dashboard/resident/${userId}`);
      if (dashboardResponse.ok) {
        const data = await dashboardResponse.json();
        setDashboardData({
          monthlyHours: data.monthlyHours,
          upcomingShifts: data.upcomingShifts,
          recentActivity: data.recentActivity,
          teamUpdates: data.teamUpdates
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (swapId: string) => {
    setActionLoading(true);
    try {
      const response = await fetch(`${config.apiUrl}/api/swaprequests/${swapId}/approve`, { method: "POST" });
      const result = await response.json();
      
      if (response.ok) {
        toast({
          title: "Swap Approved",
          description: "The swap request has been approved successfully.",
          variant: "success"
        });
      }
      
      await refreshDashboard();
      if (onRefreshCalendar) onRefreshCalendar();
    } catch (error) {
      console.error('Error approving swap:', error);
      toast({
        title: "Error",
        description: "Failed to approve swap request.",
        variant: "destructive"
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeny = (swapId: string) => {
    setPendingDenyId(swapId);
    setDenyModalOpen(true);
  };

  const submitDeny = async () => {
    if (!pendingDenyId) return;
    setActionLoading(true);
    try {
      await fetch(`${config.apiUrl}/api/swaprequests/${pendingDenyId}/deny`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: denyReason })
      });
      setDenyModalOpen(false);
      setDenyReason("");
      setPendingDenyId(null);
      await refreshDashboard();
      if (onRefreshCalendar) onRefreshCalendar();
    } finally {
      setActionLoading(false);
    }
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch all dashboard data in a single API call
        const dashboardResponse = await fetch(`${config.apiUrl}/api/dashboard/resident/${userId}`);
        
        if (dashboardResponse.ok) {
          const data = await dashboardResponse.json();
          setDashboardData({
            monthlyHours: data.monthlyHours,
            upcomingShifts: data.upcomingShifts,
            recentActivity: data.recentActivity,
            teamUpdates: data.teamUpdates
          });
        } else if (dashboardResponse.status === 404) {
          console.log('No dashboard data found for user:', userId);
          // Keep default "No rotation assigned" state
        } else {
          console.error('Error fetching dashboard data:', dashboardResponse.status, dashboardResponse.statusText);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchDashboardData();
    }
  }, [userId]);

  useEffect(() => {
    // Calculate hours from calendarEvents for current user and current month
    if (calendarEvents && calendarEvents.length > 0) {
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      
      const userEvents = calendarEvents.filter(event => {
        const eventDate = new Date(event.start);
        return (
          eventDate.getMonth() === currentMonth &&
          eventDate.getFullYear() === currentYear &&
          event.extendedProps && event.extendedProps.residentId === userId
        );
      });
      
      setHoursThisMonth(userEvents.length * 8); // 8 hours per event
    } else {
      setHoursThisMonth(0);
    }
  }, [calendarEvents, userId]);

  if (loading) {
    return (
      <div className="w-full pt-4 flex flex-col items-center">
        <div className="w-full max-w-5xl">
          <h1 className="text-3xl font-bold mb-6">Hello, {displayName}!</h1>
          <div className="animate-pulse space-y-6">
            <div className="h-32 bg-muted rounded-2xl"></div>
            <div className="h-24 bg-muted rounded-2xl"></div>
          </div>
        </div>
      </div>
    );
  }

  // Filter out the 'schedule' type recent activity
  const filteredRecentActivity = dashboardData.recentActivity.filter(
    (activity) => activity.type !== 'schedule'
  );

  return (
    <div className="w-full pt-4 flex flex-col items-center">
      <div className="mb-6 w-full max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold">Hello, {displayName}!</h1>
        <p className="text-muted-foreground mt-2">
          Welcome back! Here&apos;s your dashboard overview.
        </p>
      </div>
      
      <div className="w-full max-w-3xl flex flex-col gap-6">
        {/* Main Summary Card */}
        <Card className="p-6 bg-card shadow-lg rounded-2xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0 mb-6 w-full justify-between">
            {/* Hours This Month - Left */}
            <div className="flex flex-col items-center text-center pr-4">
              <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Hours This Month
              </h2>
              <p className="text-3xl font-bold text-primary w-full text-center">
                {hoursThisMonth}
              </p>
              <p className="text-sm text-muted-foreground w-full text-center">Total hours</p>
            </div>

            {/* Upcoming Shifts - Center */}
            <div className="flex flex-col items-center text-center w-full">
              <h2 className="text-xl font-semibold mb-2 flex items-center justify-center gap-2">
                <CalendarCheck className="h-5 w-5" />
                Upcoming Shifts
              </h2>
              <div className="space-y-1">
                {dashboardData.upcomingShifts.length > 0 ? (
                  dashboardData.upcomingShifts.map((shift, index) => (
                    <div key={index} className="text-sm">
                      <span className="font-medium">{shift.date}</span>
                      <span className="text-muted-foreground ml-2">({shift.type})</span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No upcoming shifts</p>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col items-center md:flex-row md:justify-center md:items-center gap-4 mt-2">
            <Button 
              onClick={onNavigateToSwapCalls}
              className="p-8 w-full max-w-55 bg-card text-card-foreground border border-border hover:bg-accent hover:text-accent-foreground rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
              variant="outline"
            >
              <div className="text-left w-full">
                <div className="flex items-center gap-3 mb-2">
                  <RotateCcw className="h-4 w-4" />
                  <span className="font-semibold text-base">Request Call Swap</span>
                </div>
                <p className="text-sm text-muted-foreground">Submit a swap request</p>
              </div>
            </Button>
            
            <Button 
              onClick={onNavigateToRequestOff}
              className="p-8 w-full max-w-55 bg-card text-card-foreground border border-border hover:bg-accent hover:text-accent-foreground rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
              variant="outline"
            >
              <div className="text-left w-full">
                <div className="flex items-center gap-3 mb-2">
                  <Calendar className="h-6 w-6" />
                  <span className="font-semibold text-base">Request Time Off</span>
                </div>
                <p className="text-sm text-muted-foreground ">Plan your time off</p>
              </div>
            </Button>
            
            {/* View My Schedule button: only show if not admin */}
            {!isAdmin && (
              <Button 
                onClick={onNavigateToSchedule}
                className="p-8 w-full max-w-55 bg-card text-card-foreground border border-border hover:bg-accent hover:text-accent-foreground rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
                variant="outline"
              >
                <div className="text-left w-full">
                  <div className="flex items-center gap-3 mb-2">
                    <CalendarCheck className="h-6 w-6" />
                    <span className="font-semibold text-base">View My Schedule</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">See your full schedule</p>
                </div>
              </Button>
            )}
          </div>
        </Card>

        {/* Activity and Updates */}
        <div className="w-full max-w-5xl mx-auto flex flex-col md:flex-row gap-6">
          {/* Recent Activity Card */}
          <Card className="p-6 bg-card shadow-lg rounded-2xl min-h-[300px] flex flex-col flex-1">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Recent Activity
            </h2>
            <div className="space-y-3 flex-1">
              {filteredRecentActivity.length > 0 ? (
                filteredRecentActivity.map((activity) => (
                  <div key={activity.id} className={`flex items-start gap-3 p-3 rounded-lg ${activity.type === 'swap_approved' ? 'bg-green-100' : activity.type === 'swap_denied' ? 'bg-red-100' : 'bg-muted/50'}`}>
                    <div className="p-2 bg-primary/10 rounded-full">
                      {activity.type.startsWith('swap') ? (
                        <RotateCcw className="h-4 w-4 text-primary" />
                      ) : (
                        <Calendar className="h-4 w-4 text-primary" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.message}</p>
                      <p className="text-xs text-muted-foreground">{activity.date}</p>
                      {activity.type === 'swap_pending' && (
                        <div className="flex gap-2 mt-2">
                          <Button size="sm" disabled={actionLoading} onClick={() => handleApprove(activity.id)} className="bg-green-600 text-white hover:bg-green-700">Approve</Button>
                          <Button size="sm" disabled={actionLoading} onClick={() => handleDeny(activity.id)} className="bg-red-600 text-white hover:bg-red-700">Deny</Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <p className="text-muted-foreground text-center">No recent activity</p>
                </div>
              )}
            </div>
          </Card>

          {/* Team Updates Card */}
          <Card className="p-6 bg-card shadow-lg rounded-2xl min-h-[300px] flex flex-col flex-1">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Users className="h-5 w-5" />
              Team Updates
            </h2>
            <div className="space-y-3 flex-1">
              {dashboardData.teamUpdates.length > 0 ? (
                dashboardData.teamUpdates.map((update) => (
                  <div key={update.id} className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-sm font-medium mb-1">{update.message}</p>
                    <p className="text-xs text-muted-foreground">{update.date}</p>
                  </div>
                ))
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <p className="text-muted-foreground text-center">No team updates</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
      {/* Deny Reason Modal */}
      <Dialog open={denyModalOpen} onOpenChange={setDenyModalOpen}>
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Deny Swap Request</h3>
            <label className="block mb-2 text-sm font-medium">Reason for denial:</label>
            <textarea
              className="w-full border rounded p-2 mb-4"
              rows={3}
              value={denyReason}
              onChange={e => setDenyReason(e.target.value)}
              disabled={actionLoading}
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDenyModalOpen(false)} disabled={actionLoading}>Cancel</Button>
              <Button onClick={submitDeny} disabled={actionLoading || !denyReason.trim()} className="bg-red-600 text-white hover:bg-red-700">Submit Denial</Button>
            </div>
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default HomePage;