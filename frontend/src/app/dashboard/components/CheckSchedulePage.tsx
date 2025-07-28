"use client";

import React from "react";
import { Card } from "../../../components/ui/card";
import { Calendar, CalendarDays } from "lucide-react";

interface ScheduleEntry {
  id: string;
  date: string;
  time: string;
  shift: string;
  location: string;
}

interface CheckSchedulePageProps {
  mySchedule: ScheduleEntry[];
}

const CheckSchedulePage: React.FC<CheckSchedulePageProps> = ({ mySchedule }) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const oneWeekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

  // Group schedule entries by date proximity
  const scheduleCategories = mySchedule.reduce((acc, entry) => {
    const entryDate = new Date(entry.date);
    entryDate.setHours(0, 0, 0, 0);
    
    if (entryDate.getTime() === today.getTime()) {
      acc.today.push(entry);
    } else if (entryDate <= oneWeekFromNow) {
      acc.thisWeek.push(entry);
    } else {
      acc.later.push(entry);
    }
    return acc;
  }, { today: [] as ScheduleEntry[], thisWeek: [] as ScheduleEntry[], later: [] as ScheduleEntry[] });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    date.setHours(0, 0, 0, 0);
    
    if (date.getTime() === today.getTime()) return "Today";
    if (date.getTime() === today.getTime() + 24 * 60 * 60 * 1000) return "Tomorrow";
    
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getShiftTypeColor = () => {
    // Use black color for all shift types
    return "bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 border-gray-900 dark:border-gray-200";
  };

  const ScheduleSection = ({ title, entries, icon }: { title: string; entries: ScheduleEntry[]; icon: React.ReactNode }) => (
    entries.length > 0 && (
      <div className="space-y-3">
        <div className="flex items-center gap-2 pb-2 border-b border-border">
          {icon}
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          <span className="text-xs text-muted-foreground">({entries.length})</span>
        </div>
        <div className="space-y-2">
          {entries.map((entry) => (
            <Card key={entry.id} className="p-3 border border-border hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">
                    {formatDate(entry.date)}
                  </span>
                </div>
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getShiftTypeColor()}`}>
                  {entry.shift}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    )
  );

  return (
    <div className="w-full h-full bg-background p-4 overflow-auto">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-3">
            <div className="p-3 bg-primary/10 rounded-full">
              <CalendarDays className="h-6 w-6 text-primary" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">My Upcoming Schedule</h1>
        </div>

        {/* Schedule Content */}
        {mySchedule.length > 0 ? (
          <div className="space-y-6">
            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-4 border border-border">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                    <Calendar className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Total Shifts</p>
                    <p className="text-lg font-bold text-foreground">{mySchedule.length}</p>
                  </div>
                </div>
              </Card>
              <Card className="p-4 border border-border">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                    <Calendar className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">This Week</p>
                    <p className="text-lg font-bold text-foreground">{scheduleCategories.today.length + scheduleCategories.thisWeek.length}</p>
                  </div>
                </div>
              </Card>
              <Card className="p-4 border border-border">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                    <CalendarDays className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Upcoming</p>
                    <p className="text-lg font-bold text-foreground">{scheduleCategories.later.length}</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Schedule Sections */}
            <div className="space-y-6">
              <ScheduleSection 
                title="Today" 
                entries={scheduleCategories.today} 
                icon={<Calendar className="h-4 w-4 text-primary" />}
              />
              <ScheduleSection 
                title="This Week" 
                entries={scheduleCategories.thisWeek} 
                icon={<Calendar className="h-4 w-4 text-primary" />}
              />
              <ScheduleSection 
                title="Later" 
                entries={scheduleCategories.later} 
                icon={<CalendarDays className="h-4 w-4 text-primary" />}
              />
            </div>
          </div>
        ) : (
          <Card className="p-8 border border-border text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="p-4 bg-muted/50 rounded-full">
                <CalendarDays className="h-8 w-8 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">No Upcoming Shifts</h3>
                <p className="text-sm text-muted-foreground max-w-md">
                  You don&apos;t have any upcoming schedule entries at the moment. 
                  Check back later or contact your supervisor if you believe this is an error.
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default CheckSchedulePage; 