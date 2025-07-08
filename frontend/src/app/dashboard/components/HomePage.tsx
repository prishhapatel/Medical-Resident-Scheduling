import React, { useState, useEffect } from "react";
import { Card } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Calendar, Clock, RotateCcw, CalendarCheck, Bell, Users } from "lucide-react";
import { config } from "../../../config";

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

const HomePage: React.FC<HomeProps & { calendarEvents?: any[]; userId: string }> = ({
  displayName,
  onNavigateToSwapCalls,
  onNavigateToRequestOff,
  onNavigateToSchedule,
  userId,
  calendarEvents = [], // Accept calendarEvents as prop if available
}) => {
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    monthlyHours: 0,
    upcomingShifts: [],
    recentActivity: [],
    teamUpdates: []
  });
  const [loading, setLoading] = useState(true);
  const [hoursThisMonth, setHoursThisMonth] = useState(0);

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
          <div className="flex flex-col md:flex-row md:justify-center md:items-center gap-4 mt-2">
            <Button 
              onClick={onNavigateToSwapCalls}
              className="p-8 w-55 bg-card text-card-foreground border border-border hover:bg-accent hover:text-accent-foreground rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
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
              className="p-8 w-55 bg-card text-card-foreground border border-border hover:bg-accent hover:text-accent-foreground rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
              variant="outline"
            >
              <div className="text-left w-full">
                <div className="flex items-center gap-3 mb-2">
                  <Calendar className="h-6 w-6" />
                  <span className="font-semibold text-base">Request Day Off</span>
                </div>
                <p className="text-sm text-muted-foreground ">Plan your time off</p>
              </div>
            </Button>
            
            <Button 
              onClick={onNavigateToSchedule}
              className="p-8 w-55 bg-card text-card-foreground border border-border hover:bg-accent hover:text-accent-foreground rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
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
          </div>
        </Card>

        {/* Activity and Updates */}
        <div className="w-full max-w-5xl mx-auto flex flex-col md:flex-row gap-6">
          {/* Recent Activity Card */}
          <Card className="p-6 bg-card shadow-lg rounded-2xl">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Recent Activity
            </h2>
            <div className="space-y-3">
              {filteredRecentActivity.length > 0 ? (
                filteredRecentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                    <div className="p-2 bg-primary/10 rounded-full">
                      {activity.type === 'swap' ? (
                        <RotateCcw className="h-4 w-4 text-primary" />
                      ) : (
                        <Calendar className="h-4 w-4 text-primary" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.message}</p>
                      <p className="text-xs text-muted-foreground">{activity.date}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-center py-4">No recent activity</p>
              )}
            </div>
          </Card>

          {/* Team Updates Card */}
          <Card className="p-6 bg-card shadow-lg rounded-2xl">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Users className="h-5 w-5" />
              Team Updates
            </h2>
            <div className="space-y-3">
              {dashboardData.teamUpdates.length > 0 ? (
                dashboardData.teamUpdates.map((update) => (
                  <div key={update.id} className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-sm font-medium mb-1">{update.message}</p>
                    <p className="text-xs text-muted-foreground">{update.date}</p>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-center py-4">No team updates</p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default HomePage;