"use client";

import React from "react";
import { Card } from "../../../components/ui/card";
import { Calendar, Clock, MapPin, CalendarDays } from "lucide-react";

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

  const getShiftTypeColor = (shift: string) => {
    const lowerShift = shift.toLowerCase();
    if (lowerShift.includes('call')) {
      return "bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-800";
    }
    if (lowerShift.includes('night')) {
      return "bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-200 border-purple-200 dark:border-purple-800";
    }
    return "bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200 border-green-200 dark:border-green-800";
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
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3.5 w-3.5 text-primary" />
                    <span className="text-sm font-medium text-foreground">
                      {formatDate(entry.date)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">{entry.time}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getShiftTypeColor(entry.shift)}`}>
                    {entry.shift}
                  </div>
                  <div className="flex items-center gap-1 mt-1 justify-end">
                    <MapPin className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">{entry.location}</span>
                  </div>
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
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                    <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Total Shifts</p>
                    <p className="text-lg font-bold text-foreground">{mySchedule.length}</p>
                  </div>
                </div>
              </Card>
              <Card className="p-4 border border-border">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                    <Clock className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">This Week</p>
                    <p className="text-lg font-bold text-foreground">{scheduleCategories.today.length + scheduleCategories.thisWeek.length}</p>
                  </div>
                </div>
              </Card>
              <Card className="p-4 border border-border">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                    <CalendarDays className="h-4 w-4 text-purple-600 dark:text-purple-400" />
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
                icon={<Clock className="h-4 w-4 text-primary" />}
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