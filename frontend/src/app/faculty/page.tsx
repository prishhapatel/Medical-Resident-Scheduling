"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "../../components/ui/button";
import { LogOut, ChevronLeft, ChevronRight } from "lucide-react";
import { config } from "../../config";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { logout } from "../../lib/auth";

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
  extendedProps?: {
    scheduleId?: string;
    residentId?: string;
    firstName?: string;
    lastName?: string;
    callType?: string;
    dateId?: string;
    pgyLevel?: number | string;
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

// Faculty Calendar View Component (simplified version without navigation)
const FacultyCalendarView: React.FC<{ events: CalendarEvent[] }> = ({ events }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month' | 'year'>('month');
  const calendarGridRef = useRef<HTMLDivElement>(null);

  // Force month view on mobile
  const effectiveViewMode = typeof window !== 'undefined' && window.innerWidth < 768 ? 'month' : viewMode;

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const shortDayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Helper function to safely convert to Date object
  const ensureDate = (dateValue: Date | string): Date => {
    if (dateValue instanceof Date) {
      return dateValue;
    }
    return new Date(dateValue);
  };

  // Navigation functions for different views
  const navigatePeriod = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    switch (effectiveViewMode) {
      case 'day':
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
        break;
      case 'week':
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
        break;
      case 'month':
        newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
        break;
      case 'year':
        newDate.setFullYear(newDate.getFullYear() + (direction === 'next' ? 1 : -1));
        break;
    }
    setCurrentDate(newDate);
  };

  // Get period title based on view mode
  const getPeriodTitle = () => {
    switch (effectiveViewMode) {
      case 'day':
        return currentDate.toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        });
      case 'week':
        const startOfWeek = new Date(currentDate);
        startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        return `${startOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
      case 'month':
        return `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
      case 'year':
        return currentDate.getFullYear().toString();
      default:
        return currentDate.toLocaleDateString();
    }
  };

  const generateCalendarDays = () => {
    const days = [];
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const startDate = new Date(firstDayOfMonth);
    startDate.setDate(firstDayOfMonth.getDate() - firstDayOfMonth.getDay());

    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      days.push(date);
    }
    return days;
  };

  const getEventsForDate = (date: Date) => {
    return events.filter(event => {
      const eventDate = ensureDate(event.start);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const calendarDays = generateCalendarDays();

  return (
    <div className="w-full bg-background text-foreground">
      {/* Calendar Controls */}
      <div className="bg-card border-b px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h2 className="text-2xl font-bold text-foreground">
              {getPeriodTitle()}
            </h2>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigatePeriod('prev')}
                className="p-3 hover:bg-muted rounded-full transition-colors duration-200"
              >
                <ChevronLeft className="w-6 h-6 text-muted-foreground" />
              </button>
              <button
                onClick={goToToday}
                className="px-6 py-3 text-sm font-semibold text-primary hover:bg-primary/10 rounded-xl transition-colors duration-200"
              >
                Today
              </button>
              <button
                onClick={() => navigatePeriod('next')}
                className="p-3 hover:bg-muted rounded-full transition-colors duration-200"
              >
                <ChevronRight className="w-6 h-6 text-muted-foreground" />
              </button>
            </div>
          </div>
          <div className="hidden md:flex space-x-3 items-center">
            <button
              onClick={() => setViewMode('day')}
              className={`px-5 py-3 text-sm font-medium rounded-xl transition-colors duration-200 ${
                effectiveViewMode === 'day'
                  ? 'text-primary-foreground bg-primary border border-primary hover:bg-primary/90 shadow-lg'
                  : 'text-muted-foreground bg-card border border-border hover:bg-muted'
              }`}
            >
              Day
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-5 py-3 text-sm font-medium rounded-xl transition-colors duration-200 ${
                effectiveViewMode === 'week'
                  ? 'text-primary-foreground bg-primary border border-primary hover:bg-primary/90 shadow-lg'
                  : 'text-muted-foreground bg-card border border-border hover:bg-muted'
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setViewMode('month')}
              className={`px-5 py-3 text-sm font-medium rounded-xl transition-colors duration-200 ${
                effectiveViewMode === 'month'
                  ? 'text-primary-foreground bg-primary border border-primary hover:bg-primary/90 shadow-lg'
                  : 'text-muted-foreground bg-card border border-border hover:bg-muted'
              }`}
            >
              Month
            </button>
            <button
              onClick={() => setViewMode('year')}
              className={`px-5 py-3 text-sm font-medium rounded-xl transition-colors duration-200 ${
                effectiveViewMode === 'year'
                  ? 'text-primary-foreground bg-primary border border-primary hover:bg-primary/90 shadow-lg'
                  : 'text-muted-foreground bg-card border border-border hover:bg-muted'
              }`}
            >
              Year
            </button>
          </div>
        </div>
      </div>

      {/* PGY Color Legend - Desktop */}
      <div className="hidden md:block bg-card border-b px-8 py-3">
        <div className="flex items-center space-x-6">
          <span className="text-sm font-medium text-muted-foreground">PGY Color Coding:</span>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#ef4444' }}></div>
              <span className="text-sm text-foreground">PGY 1</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#f97316' }}></div>
              <span className="text-sm text-foreground">PGY 2</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#8b5cf6' }}></div>
              <span className="text-sm text-foreground">PGY 3</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#6b7280' }}></div>
              <span className="text-sm text-foreground">No PGY Info</span>
            </div>
          </div>
        </div>
      </div>

      {/* PGY Color Legend - Mobile */}
      <div className="md:hidden bg-card border-b px-4 py-3">
        <div className="flex flex-col space-y-2">
          <span className="text-sm font-medium text-muted-foreground">PGY Color Coding:</span>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: '#ef4444' }}></div>
              <span className="text-xs text-foreground">PGY 1</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: '#f97316' }}></div>
              <span className="text-xs text-foreground">PGY 2</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: '#8b5cf6' }}></div>
              <span className="text-xs text-foreground">PGY 3</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: '#6b7280' }}></div>
              <span className="text-xs text-foreground">No PGY Info</span>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 p-4 md:p-8" ref={calendarGridRef}>
        <div className="calendar-print-area faculty-calendar bg-card rounded-2xl shadow-xl border border-border h-full w-full min-w-full max-w-none">
          {effectiveViewMode === 'month' && (
            <>
              {/* Calendar Header */}
              <div className="grid grid-cols-7 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 border-b border-gray-200 dark:border-gray-600">
                {shortDayNames.map(day => (
                  <div key={day} className="px-6 py-5 text-sm font-semibold text-gray-700 dark:text-gray-200 text-center uppercase tracking-wide">
                    {day}
                  </div>
                ))}
              </div>
              
              {/* Calendar Days */}
              <div className="grid grid-cols-7 h-full w-full min-w-full">
                {calendarDays.map((date, index) => {
                  const dayEvents = getEventsForDate(date);
                  const isCurrentMonth = date.getMonth() === currentDate.getMonth();
                  const isLastRow = index >= 35;
                  
                  return (
                    <div
                      key={index}
                      className={`min-h-40 border-r border-b border-gray-100 dark:border-gray-600 p-4 relative hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 cursor-pointer ${
                        !isCurrentMonth ? 'text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-800/50' : 'bg-white dark:bg-gray-800'
                      } ${isLastRow ? 'pb-16' : ''}`}
                    >
                      <div className={`text-lg font-medium mb-3 ${
                        isToday(date) 
                          ? 'w-10 h-10 bg-blue-600 dark:bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-lg'
                          : isCurrentMonth ? 'text-gray-900 dark:text-gray-100' : 'text-gray-400 dark:text-gray-500'
                      }`}>
                        {date.getDate()}
                      </div>
                      <div className="space-y-2">
                        {dayEvents.slice(0, 4).map((event, eventIndex) => (
                          <div
                            key={eventIndex}
                            className="text-xs px-3 py-2 rounded-lg cursor-pointer hover:shadow-md transition-all duration-200 truncate font-medium"
                            style={{ backgroundColor: event.backgroundColor, color: 'white' }}
                            title={event.title}
                          >
                            {event.extendedProps?.firstName} {event.extendedProps?.lastName}
                          </div>
                        ))}
                        {dayEvents.length > 4 && (
                          <div className="text-xs text-muted-foreground px-2 py-1 bg-muted/50 rounded text-center cursor-pointer hover:bg-muted/70 transition-colors">
                            +{dayEvents.length - 4} more
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {effectiveViewMode === 'day' && (
            <div className="p-6">
              {/* Day Header with Circle Highlight */}
              <div className="flex items-center justify-center mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-foreground mb-2">
                    {currentDate.toLocaleDateString('en-US', { weekday: 'long' })}
                  </div>
                  <div className="relative inline-block">
                    <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-white font-bold text-xl">
                      {currentDate.getDate()}
                    </div>
                  </div>
                  <div className="text-lg text-muted-foreground mt-2">
                    {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                {getEventsForDate(currentDate).map((event, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-lg border border-border"
                    style={{ borderLeft: `4px solid ${event.backgroundColor}` }}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-foreground">
                          {event.extendedProps?.firstName} {event.extendedProps?.lastName}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {event.extendedProps?.callType} • PGY{event.extendedProps?.pgyLevel}
                        </p>
                      </div>
                      <div 
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: event.backgroundColor }}
                      ></div>
                    </div>
                  </div>
                ))}
                {getEventsForDate(currentDate).length === 0 && (
                  <p className="text-center text-muted-foreground py-8">No events scheduled for this day</p>
                )}
              </div>
            </div>
          )}

                      {effectiveViewMode === 'week' && (
            <div className="h-full flex flex-col">
              {/* Week Header */}
              <div className="grid grid-cols-7 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 border-b border-gray-200 dark:border-gray-600">
                {shortDayNames.map(day => (
                  <div key={day} className="px-4 py-3 text-center">
                    <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                      {day}
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Week Days */}
              <div className="grid grid-cols-7 flex-1">
                {Array.from({ length: 7 }, (_, i) => {
                  const date = new Date(currentDate);
                  date.setDate(currentDate.getDate() - currentDate.getDay() + i);
                  const dayEvents = getEventsForDate(date);
                  
                  return (
                    <div
                      key={i}
                      className="border-r border-gray-100 dark:border-gray-600 p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <div className={`text-lg font-semibold mt-1 ${
                        isToday(date) 
                          ? 'w-8 h-8 bg-blue-600 dark:bg-blue-500 text-white rounded-full flex items-center justify-center mx-auto'
                          : 'text-gray-900 dark:text-gray-100'
                      }`}>
                        {date.getDate()}
                      </div>
                      <div className="space-y-2">
                        {dayEvents.slice(0, 6).map((event, eventIndex) => (
                          <div
                            key={eventIndex}
                            className="text-xs px-2 py-1 rounded truncate font-medium cursor-pointer"
                            style={{ backgroundColor: event.backgroundColor, color: 'white' }}
                            title={event.title}
                          >
                            {event.extendedProps?.firstName} {event.extendedProps?.lastName}
                          </div>
                        ))}
                        {dayEvents.length > 6 && (
                          <div className="text-xs text-muted-foreground px-2 py-1 bg-muted/50 rounded text-center cursor-pointer hover:bg-muted/70 transition-colors">
                            +{dayEvents.length - 6} more
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

                      {effectiveViewMode === 'year' && (
            <div className="h-full p-6">
              <div className="grid grid-cols-4 gap-6 h-full">
                {Array.from({ length: 12 }, (_, monthIndex) => {
                  const monthDate = new Date(currentDate.getFullYear(), monthIndex, 1);
                  
                  return (
                    <div
                      key={monthIndex}
                      className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:shadow-md transition-all duration-200 cursor-pointer"
                    >
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3 text-center">
                        {monthNames[monthIndex]}
                      </h3>
                      <div className="grid grid-cols-7 gap-1">
                        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, dayIndex) => (
                          <div key={dayIndex} className="text-xs text-gray-500 dark:text-gray-400 text-center font-medium">
                            {day}
                          </div>
                        ))}
                        {(() => {
                          const firstDay = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
                          const lastDay = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);
                          const startDate = firstDay.getDay();
                          const days = [];
                          
                          // Empty cells for days before month starts
                          for (let i = 0; i < startDate; i++) {
                            days.push(<div key={`empty-${i}`} className="text-xs p-1"></div>);
                          }
                          
                          // Days of the month
                          for (let day = 1; day <= lastDay.getDate(); day++) {
                            const date = new Date(monthDate.getFullYear(), monthDate.getMonth(), day);
                            const hasEvents = getEventsForDate(date).length > 0;
                            const isCurrentDay = isToday(date);
                            days.push(
                              <div key={day} className={`text-xs p-1 text-center ${
                                isCurrentDay 
                                  ? 'w-6 h-6 bg-blue-600 dark:bg-blue-500 text-white rounded-full flex items-center justify-center font-bold'
                                  : hasEvents 
                                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded' 
                                    : 'text-gray-700 dark:text-gray-300'
                              }`}>
                                {day}
                              </div>
                            );
                          }
                          
                          return days;
                        })()}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default function FacultyPage() {
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [residents, setResidents] = useState<Resident[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { user, setUser } = useAuth();

  // Check if user is faculty
  useEffect(() => {
    if (!user) {
      router.push("/");
      return;
    }
    
    // Only allow faculty email
    if (user.email !== "faculty@hcahealthcare.com") {
      router.push("/");
      return;
    }
  }, [user, router]);

  // Fetch residents
  const fetchResidents = async () => {
    try {
      const response = await fetch(`${config.apiUrl}/api/residents`);
      if (response.ok) {
        const data = await response.json();
        setResidents(data);
      }
    } catch (error) {
      console.error("Error fetching residents:", error);
    }
  };

  // Fetch calendar events
  const fetchCalendarEvents = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${config.apiUrl}/api/dates`);
      if (response.ok) {
        const dates: DateResponse[] = await response.json();
        
        // Find the scheduleId with the most recent date
        let latestScheduleId = null;
        if (dates.length > 0) {
          const scheduleIdToLatestDate: Record<string, number> = {};
          dates.forEach((date: DateResponse) => {
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
          ? dates.filter((date: DateResponse) => date.scheduleId === latestScheduleId)
          : dates;

        const events: CalendarEvent[] = filteredDates.map((date: DateResponse) => {
          const resident = residents.find(r => r.resident_id === date.residentId);
          const graduateYear = resident?.graduate_yr || 1;
          
          // Get color based on call type and PGY level
          const color = getEventColor(date.callType, graduateYear);
          
          return {
            id: date.dateId,
            title: `${resident ? `${resident.first_name} ${resident.last_name}` : 'Unknown'}`,
            start: new Date(date.date),
            end: new Date(date.date),
            backgroundColor: color,
            extendedProps: {
              scheduleId: date.scheduleId,
              residentId: date.residentId,
              firstName: resident?.first_name,
              lastName: resident?.last_name,
              callType: date.callType,
              dateId: date.dateId,
              pgyLevel: graduateYear
            }
          };
        });
        
        setCalendarEvents(events);
      }
    } catch (error) {
      console.error("Error fetching calendar events:", error);
    } finally {
      setLoading(false);
    }
  }, [residents]);

  // Get event color based on PGY level (like the original calendar)
  const getEventColor = (callType: string, graduateYear?: number): string => {
    // Color coding based on PGY level
    if (graduateYear === 1) return '#ef4444'; // Red for PGY 1
    if (graduateYear === 2) return '#f97316'; // Orange for PGY 2
    if (graduateYear === 3) return '#8b5cf6'; // Purple for PGY 3
    return '#6b7280'; // Gray for no PGY info
  };

  // Handle logout
  const handleLogout = () => {
    logout();
    setUser(null);
  };

  // Initialize data
  useEffect(() => {
    const initialize = async () => {
      await fetchResidents();
    };
    initialize();
  }, []);

  useEffect(() => {
    if (residents.length > 0) {
      fetchCalendarEvents();
    }
  }, [residents, fetchCalendarEvents]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading calendar...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground relative w-full">
      {/* Faculty Header */}
      <div className="bg-card border-b fixed left-0 right-0 top-0 z-20 px-8 py-4 hidden md:block">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Calendar</h1>
            </div>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="flex items-center space-x-2"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </Button>
        </div>
      </div>

      {/* Calendar Component */}
      <div className="pt-4 md:pt-20 w-full">
        <FacultyCalendarView 
          events={calendarEvents}
        />
      </div>
    </div>
  );
} 