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
  currentRotation: string;
  rotationEndDate: string;
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

const HomePage: React.FC<HomeProps> = ({ 
  displayName,
  onNavigateToSwapCalls,
  onNavigateToRequestOff,
  onNavigateToSchedule,
  userId,
}) => {
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    currentRotation: "Loading...",
    rotationEndDate: "",
    monthlyHours: 0,
    upcomingShifts: [],
    recentActivity: [],
    teamUpdates: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch all dashboard data in a single API call
        const dashboardResponse = await fetch(`${config.apiUrl}/api/dashboard/resident/${userId}`);
        
        if (dashboardResponse.ok) {
          const data = await dashboardResponse.json();
          setDashboardData({
            currentRotation: data.currentRotation,
            rotationEndDate: data.rotationEndDate,
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

  return (
    <div className="w-full pt-4 flex flex-col items-center">
      <div className="mb-6 w-full max-w-5xl">
        <h1 className="text-3xl font-bold">Hello, {displayName}!</h1>
        <p className="text-muted-foreground mt-2">
          Welcome back! Here&apos;s your dashboard overview.
        </p>
      </div>
      
      <div className="w-full max-w-5xl flex flex-col gap-6">
        {/* Main Summary Card */}
        <Card className="p-6 bg-card shadow-lg rounded-2xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="text-center md:text-left">
              <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
                <RotateCcw className="h-5 w-5" />
                Current Rotation
              </h2>
              <p className="text-lg font-medium text-primary">
                {dashboardData.currentRotation}
              </p>
              <p className="text-sm text-muted-foreground">
                {dashboardData.rotationEndDate}
              </p>
            </div>
            
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2 flex items-center justify-center gap-2">
                <Clock className="h-5 w-5" />
                Hours This Month
              </h2>
              <p className="text-3xl font-bold text-primary">
                {dashboardData.monthlyHours}
              </p>
              <p className="text-sm text-muted-foreground">Total hours</p>
            </div>

            <div className="text-center md:text-right">
              <h2 className="text-xl font-semibold mb-2 flex items-center justify-center md:justify-end gap-2">
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Button 
              onClick={onNavigateToSwapCalls}
              className="p-6 bg-card text-card-foreground border border-border hover:bg-accent hover:text-accent-foreground rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
              variant="outline"
            >
              <div className="text-left w-full">
                <div className="flex items-center gap-3 mb-2">
                  <RotateCcw className="h-6 w-6" />
                  <span className="font-semibold text-base">Request Call Swap</span>
                </div>
                <p className="text-sm text-muted-foreground">Submit a swap request</p>
              </div>
            </Button>
            
            <Button 
              onClick={onNavigateToRequestOff}
              className="p-6 bg-card text-card-foreground border border-border hover:bg-accent hover:text-accent-foreground rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
              variant="outline"
            >
              <div className="text-left w-full">
                <div className="flex items-center gap-3 mb-2">
                  <Calendar className="h-6 w-6" />
                  <span className="font-semibold text-base">Request Day Off</span>
                </div>
                <p className="text-sm text-muted-foreground">Plan your time off</p>
              </div>
            </Button>
            
            <Button 
              onClick={onNavigateToSchedule}
              className="p-6 bg-card text-card-foreground border border-border hover:bg-accent hover:text-accent-foreground rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
              variant="outline"
            >
              <div className="text-left w-full">
                <div className="flex items-center gap-3 mb-2">
                  <CalendarCheck className="h-6 w-6" />
                  <span className="font-semibold text-base">View My Schedule</span>
                </div>
                <p className="text-sm text-muted-foreground">See your full schedule</p>
              </div>
            </Button>
          </div>
        </Card>

        {/* Activity and Updates */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity Card */}
          <Card className="p-6 bg-card shadow-lg rounded-2xl">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Recent Activity
            </h2>
            <div className="space-y-3">
              {dashboardData.recentActivity.length > 0 ? (
                dashboardData.recentActivity.map((activity) => (
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