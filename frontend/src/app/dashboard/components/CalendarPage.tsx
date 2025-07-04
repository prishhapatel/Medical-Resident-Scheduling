"use client";

import React, { useState } from "react";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";

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

interface CalendarPageProps {
  events: CalendarEvent[];
  onNavigateToSwapCalls?: () => void;
  onDateChange?: (month: number, year: number) => void;
}

const CalendarPage: React.FC<CalendarPageProps> = ({ events, onNavigateToSwapCalls, onDateChange }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month' | 'year'>('month');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [overflowModalData, setOverflowModalData] = useState<{ date: Date; events: CalendarEvent[]; position: { x: number; y: number } } | null>(null);

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const shortDayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Helper function to safely convert to Date object
  const ensureDate = (dateValue: Date | string): Date => {
    if (dateValue instanceof Date) {
      return dateValue;
    }
    return new Date(dateValue);
  };

  // Helper function to get PGY color based on resident data
  const getPGYColor = (event: CalendarEvent): string => {
    // Use the backgroundColor that was already calculated in the main dashboard
    // This ensures consistency between PGY calculation and display
    return event.backgroundColor || '#6b7280'; // Fallback to gray if no color set
  };

  // Navigation functions for different views
  const navigatePeriod = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    switch (viewMode) {
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
    
    // Trigger event refetch when month changes
    if (onDateChange && (viewMode === 'month' || viewMode === 'year')) {
      onDateChange(newDate.getMonth() + 1, newDate.getFullYear());
    }
  };

  // Get period title based on view mode
  const getPeriodTitle = () => {
    switch (viewMode) {
      case 'day':
        return currentDate.toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        });
      case 'week':
        const weekStart = new Date(currentDate);
        weekStart.setDate(currentDate.getDate() - currentDate.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        return `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
      case 'month':
        return `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
      case 'year':
        return `${currentDate.getFullYear()}`;
      default:
        return `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
    }
  };

  // Generate calendar days
  const generateCalendarDays = () => {
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const firstDayOfWeek = firstDayOfMonth.getDay();
    const daysInMonth = lastDayOfMonth.getDate();

    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfWeek; i++) {
      const prevMonthDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0 - (firstDayOfWeek - 1 - i));
      days.push({ day: prevMonthDate.getDate(), isCurrentMonth: false, date: prevMonthDate });
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      days.push({ day, isCurrentMonth: true, date });
    }

    // Add days from next month to fill the calendar
    const remainingCells = 42 - days.length;
    for (let day = 1; day <= remainingCells; day++) {
      const nextMonthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, day);
      days.push({ day, isCurrentMonth: false, date: nextMonthDate });
    }

    return days;
  };

  // Get events for a specific date
  const getEventsForDate = (date: Date) => {
    return events.filter(event => {
      const eventDate = ensureDate(event.start);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  const generateWeekDays = () => {
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
    
    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      days.push(date);
    }
    return days;
  };

  const generateYearMonths = () => {
    const months = [];
    for (let i = 0; i < 12; i++) {
      const monthDate = new Date(currentDate.getFullYear(), i, 1);
      months.push(monthDate);
    }
    return months;
  };

  const handleDateClick = (date: Date) => {
    // Close any other open modals first
    setSelectedEvent(null);
    setOverflowModalData(null);
    
    setSelectedDate(date);
    const dayEvents = getEventsForDate(date);
    if (dayEvents.length === 1) {
      setSelectedEvent(dayEvents[0]);
    }
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    
    // Trigger event refetch when going to today
    if (onDateChange) {
      onDateChange(today.getMonth() + 1, today.getFullYear());
    }
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const calendarDays = generateCalendarDays();

  return (
    <div className="flex w-full h-screen bg-background text-foreground">
      {/* Main Calendar Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-card border-b border-border px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <h1 className="text-5xl font-light text-foreground">
                {getPeriodTitle()}
              </h1>
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
            <div className="flex space-x-3">
              <button 
                onClick={() => setViewMode('day')}
                className={`px-5 py-3 text-sm font-medium rounded-xl transition-colors duration-200 ${
                  viewMode === 'day' 
                    ? 'text-primary-foreground bg-primary border border-primary hover:bg-primary/90 shadow-lg'
                    : 'text-muted-foreground bg-card border border-border hover:bg-muted'
                }`}
              >
                Day
              </button>
              <button 
                onClick={() => setViewMode('week')}
                className={`px-5 py-3 text-sm font-medium rounded-xl transition-colors duration-200 ${
                  viewMode === 'week' 
                    ? 'text-primary-foreground bg-primary border border-primary hover:bg-primary/90 shadow-lg'
                    : 'text-muted-foreground bg-card border border-border hover:bg-muted'
                }`}
              >
                Week
              </button>
              <button 
                onClick={() => setViewMode('month')}
                className={`px-5 py-3 text-sm font-medium rounded-xl transition-colors duration-200 ${
                  viewMode === 'month' 
                    ? 'text-primary-foreground bg-primary border border-primary hover:bg-primary/90 shadow-lg'
                    : 'text-muted-foreground bg-card border border-border hover:bg-muted'
                }`}
              >
                Month
              </button>
              <button 
                onClick={() => setViewMode('year')}
                className={`px-5 py-3 text-sm font-medium rounded-xl transition-colors duration-200 ${
                  viewMode === 'year' 
                    ? 'text-primary-foreground bg-primary border border-primary hover:bg-primary/90 shadow-lg'
                    : 'text-muted-foreground bg-card border border-border hover:bg-muted'
                }`}
              >
                Year
              </button>
            </div>
          </div>
        </div>

        {/* PGY Color Legend */}
        <div className="px-8 py-4 bg-card border-b border-border">
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

        {/* Calendar Grid */}
        <div className="flex-1 p-8">
          <div className="bg-card rounded-2xl shadow-xl border border-border overflow-hidden h-full">
            {viewMode === 'day' ? (
              // Day View
              <div className="h-full flex flex-col">
                <div className="p-6 border-b border-gray-200 dark:border-gray-600">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                  </h3>
                </div>
                <div className="flex-1 p-6">
                  {getEventsForDate(currentDate).length === 0 ? (
                    <div className="text-center py-20">
                      <CalendarDays className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                      <p className="text-gray-500 dark:text-gray-400">No events scheduled for this day</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {getEventsForDate(currentDate).map((event, index) => (
                        <div
                          key={index}
                          className="p-4 rounded-lg border border-gray-200 dark:border-gray-600 hover:shadow-md transition-all duration-200 cursor-pointer"
                          style={{ borderLeftColor: getPGYColor(event), borderLeftWidth: '4px' }}
                          onClick={() => {
                            // Close any other open modals first
                            setSelectedDate(null);
                            setOverflowModalData(null);
                            setSelectedEvent(event);
                          }}
                        >
                          <h4 className="font-semibold text-gray-900 dark:text-gray-100">{event.title}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {ensureDate(event.start).toLocaleTimeString('en-US', { 
                              hour: 'numeric', 
                              minute: '2-digit',
                              hour12: true
                            })}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : viewMode === 'week' ? (
              // Week View
              <div className="h-full flex flex-col">
                <div className="grid grid-cols-7 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 border-b border-gray-200 dark:border-gray-600">
                  {generateWeekDays().map((date, index) => (
                    <div key={index} className="px-4 py-3 text-center">
                      <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                        {shortDayNames[date.getDay()]}
                      </div>
                      <div className={`text-lg font-semibold mt-1 ${
                        isToday(date) 
                          ? 'w-8 h-8 bg-blue-600 dark:bg-blue-500 text-white rounded-full flex items-center justify-center mx-auto'
                          : 'text-gray-900 dark:text-gray-100'
                      }`}>
                        {date.getDate()}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 flex-1">
                  {generateWeekDays().map((date, index) => {
                    const dayEvents = getEventsForDate(date);
                    return (
                      <div
                        key={index}
                        className="border-r border-gray-100 dark:border-gray-600 p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        onClick={() => handleDateClick(date)}
                      >
                        <div className="space-y-2">
                          {dayEvents.slice(0, 6).map((event, eventIndex) => (
                            <div
                              key={eventIndex}
                              className="text-xs px-2 py-1 rounded truncate font-medium cursor-pointer"
                              style={{ backgroundColor: getPGYColor(event), color: 'white' }}
                              onClick={(e) => {
                                e.stopPropagation();
                                // Close any other open modals first
                                setSelectedDate(null);
                                setOverflowModalData(null);
                                setSelectedEvent(event);
                              }}
                              title={event.title}
                            >
                              {event.title}
                            </div>
                          ))}
                          {dayEvents.length > 6 && (
                            <div 
                              className="text-xs text-muted-foreground px-2 py-1 bg-muted/50 rounded text-center cursor-pointer hover:bg-muted/70 transition-colors"
                              onClick={(e) => {
                                e.stopPropagation();
                                // Close any other open modals first
                                setSelectedDate(null);
                                setSelectedEvent(null);
                                
                                const rect = e.currentTarget.getBoundingClientRect();
                                setOverflowModalData({ 
                                  date, 
                                  events: dayEvents,
                                  position: { x: rect.left, y: rect.bottom + 5 }
                                });
                              }}
                            >
                              +{dayEvents.length - 6} more
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : viewMode === 'year' ? (
              // Year View
              <div className="h-full p-6">
                <div className="grid grid-cols-4 gap-6 h-full">
                  {generateYearMonths().map((monthDate, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:shadow-md transition-all duration-200 cursor-pointer"
                      onClick={() => {
                        setCurrentDate(monthDate);
                        setViewMode('month');
                        
                        // Trigger event refetch when switching to month view
                        if (onDateChange) {
                          onDateChange(monthDate.getMonth() + 1, monthDate.getFullYear());
                        }
                      }}
                    >
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3 text-center">
                        {monthNames[monthDate.getMonth()]}
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
                            days.push(
                              <div key={day} className={`text-xs p-1 text-center ${
                                hasEvents ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded' : 'text-gray-700 dark:text-gray-300'
                              }`}>
                                {day}
                              </div>
                            );
                          }
                          
                          return days;
                        })()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              // Month View (existing)
              <>
                <div className="grid grid-cols-7 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 border-b border-gray-200 dark:border-gray-600">
                  {dayNames.map((day) => (
                    <div key={day} className="px-6 py-5 text-sm font-semibold text-gray-700 dark:text-gray-200 text-center uppercase tracking-wide">
                      {day}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 h-full">
                  {calendarDays.map((dayInfo, index) => {
                    if (!dayInfo) return <div key={index} className="min-h-40 border-r border-b border-gray-100 dark:border-gray-600" />;
                    
                    const dayEvents = getEventsForDate(dayInfo.date);
                    const isCurrentDay = isToday(dayInfo.date);

                    return (
                      <div
                        key={index}
                        className={`min-h-40 border-r border-b border-gray-100 dark:border-gray-600 p-4 relative hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 cursor-pointer ${
                          !dayInfo.isCurrentMonth ? 'text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-800/50' : 'bg-white dark:bg-gray-800'
                        }`}
                        onClick={() => handleDateClick(dayInfo.date)}
                      >
                        <div className={`text-lg font-medium mb-3 ${
                          isCurrentDay 
                            ? 'w-10 h-10 bg-blue-600 dark:bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-lg' 
                            : dayInfo.isCurrentMonth ? 'text-gray-900 dark:text-gray-100' : 'text-gray-400 dark:text-gray-500'
                        }`}>
                          {dayInfo.day}
                        </div>
                        
                        <div className="space-y-2">
                          {dayEvents.slice(0, 4).map((event, eventIndex) => (
                            <div
                              key={eventIndex}
                              className={`text-xs px-3 py-2 rounded-lg cursor-pointer hover:shadow-md transition-all duration-200 truncate font-medium`}
                              style={{ backgroundColor: getPGYColor(event), color: 'white' }}
                              onClick={(e) => {
                                e.stopPropagation();
                                // Close any other open modals first
                                setSelectedDate(null);
                                setOverflowModalData(null);
                                setSelectedEvent(event);
                              }}
                              title={event.title}
                            >
                              {event.title}
                            </div>
                          ))}
                          {dayEvents.length > 4 && (
                            <div 
                              className="text-xs text-muted-foreground px-2 py-1 bg-muted/50 rounded text-center cursor-pointer hover:bg-muted/70 transition-colors"
                              onClick={(e) => {
                                e.stopPropagation();
                                // Close any other open modals first
                                setSelectedDate(null);
                                setSelectedEvent(null);
                                
                                const rect = e.currentTarget.getBoundingClientRect();
                                setOverflowModalData({ 
                                  date: dayInfo.date, 
                                  events: dayEvents,
                                  position: { x: rect.left, y: rect.bottom + 5 }
                                });
                              }}
                            >
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
          </div>
        </div>
      </div>

      {/* Right Sidebar - Agenda */}
      <div className="w-80 bg-card border-l border-border flex flex-col">
        <div className="px-6 py-6 border-b border-border">
          <h2 className="text-xl font-semibold text-foreground">Upcoming</h2>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6">
          {events.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <CalendarDays className="w-8 h-8 text-gray-400 dark:text-gray-500" />
              </div>
              <p className="text-gray-500 dark:text-gray-400">No upcoming events</p>
            </div>
          ) : (
            <div className="space-y-4">
              {events.slice(0, 10).map((event, index) => (
                <div 
                  key={index}
                  className="p-4 rounded-xl border border-gray-200 dark:border-gray-600 hover:shadow-md dark:hover:bg-gray-700 transition-all duration-200 cursor-pointer"
                  onClick={() => {
                    // Close any other open modals first
                    setSelectedDate(null);
                    setOverflowModalData(null);
                    setSelectedEvent(event);
                  }}
                >
                  <div className="flex items-start space-x-3">
                    <div 
                      className="w-3 h-3 rounded-full mt-2 flex-shrink-0"
                      style={{ backgroundColor: getPGYColor(event) }}
                    ></div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                        {event.title}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {ensureDate(event.start).toLocaleDateString('en-US', { 
                          weekday: 'short', 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {ensureDate(event.start).toLocaleTimeString('en-US', { 
                          hour: 'numeric', 
                          minute: '2-digit',
                          hour12: true
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Date Details Modal */}
      {selectedDate && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl pointer-events-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {selectedDate.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </h3>
              <button
                onClick={() => setSelectedDate(null)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              >
                ✕
              </button>
            </div>
            
            {(() => {
              const dayEvents = getEventsForDate(selectedDate);
              return dayEvents.length === 0 ? (
                <div className="text-center py-8">
                  <CalendarDays className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-500 dark:text-gray-400">No events scheduled</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                    This day is free from scheduled duties
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    {dayEvents.length} {dayEvents.length === 1 ? 'event' : 'events'} scheduled
                  </div>
                  {dayEvents.map((event, index) => (
                    <div
                      key={index}
                      className="p-4 rounded-lg border border-gray-200 dark:border-gray-600 hover:shadow-md transition-all duration-200 cursor-pointer"
                      style={{ borderLeftColor: getPGYColor(event), borderLeftWidth: '4px' }}
                      onClick={() => {
                        setSelectedDate(null);
                        setSelectedEvent(event);
                      }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                            {event.title}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {ensureDate(event.start).toLocaleTimeString('en-US', { 
                              hour: 'numeric', 
                              minute: '2-digit',
                              hour12: true
                            })}
                          </p>
                          {event.extendedProps?.callType && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              Type: {event.extendedProps.callType}
                            </p>
                          )}
                        </div>
                        <div 
                          className="w-3 h-3 rounded-full flex-shrink-0 ml-3 mt-1"
                          style={{ backgroundColor: getPGYColor(event) }}
                        ></div>
                      </div>
                    </div>
                  ))}
                  
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-600">
                    <button
                      onClick={() => {
                        setSelectedDate(null);
                        if (dayEvents.length === 1) {
                          setSelectedEvent(dayEvents[0]);
                        }
                      }}
                      className="w-full px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors duration-200 font-medium"
                    >
                      {dayEvents.length === 1 ? 'View Event Details' : 'Manage Events'}
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* Event Details Modal */}
      {selectedEvent && (
        <div 
          className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none"
        >
          <div 
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-sm w-full mx-4 shadow-xl border border-gray-200 dark:border-gray-700 pointer-events-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div 
                  className="w-3 h-3 rounded-full mr-3"
                  style={{ backgroundColor: getPGYColor(selectedEvent) }}
                ></div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{selectedEvent.title}</h3>
              </div>
              <button
                onClick={() => setSelectedEvent(null)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              >
                <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Date and Time */}
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 mb-4">
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-1">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {ensureDate(selectedEvent.start).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  month: 'long', 
                  day: 'numeric',
                  year: 'numeric'
                })}
              </div>
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {ensureDate(selectedEvent.start).toLocaleTimeString('en-US', { 
                  hour: 'numeric', 
                  minute: '2-digit',
                  hour12: true
                })}
              </div>
            </div>
            
            {/* Details */}
            {selectedEvent.extendedProps && (
              <div className="mb-4">
                <h4 className="font-medium text-xs uppercase tracking-wide mb-3 text-gray-500 dark:text-gray-400">Details</h4>
                <div className="space-y-2">
                  {Object.entries(selectedEvent.extendedProps)
                    .filter(([key]) => key !== 'scheduleId' && key !== 'dateId')
                    .map(([key, value]) => (
                    <div key={key} className="flex justify-between items-center py-1">
                      <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                        {key === 'residentId' ? 'Resident ID' :
                         key === 'firstName' ? 'First Name' :
                         key === 'lastName' ? 'Last Name' :
                         key === 'callType' ? 'Call Type' : key}
                      </span> 
                      <span className="text-sm text-gray-900 dark:text-gray-100 font-medium">
                        {String(value)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Actions */}
            <div className="flex space-x-3 pt-2">
              <button
                onClick={() => setSelectedEvent(null)}
                className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200 text-sm font-medium"
              >
                Close
              </button>
              <button
                onClick={() => {
                  if (onNavigateToSwapCalls) {
                    onNavigateToSwapCalls();
                  }
                  setSelectedEvent(null);
                }}
                className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors duration-200 text-sm font-medium"
              >
                Request Swap
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Overflow Events Modal */}
      {overflowModalData && (
        <div 
          className="fixed inset-0 z-50 pointer-events-auto"
          onClick={() => setOverflowModalData(null)}
        >
          <div 
            className="bg-white dark:bg-gray-800 rounded-lg p-3 w-[280px] shadow-lg border border-gray-200 dark:border-gray-700 max-h-[40vh] overflow-hidden flex flex-col pointer-events-auto absolute"
            style={{
              left: `${Math.min(overflowModalData.position.x, window.innerWidth - 300)}px`,
              top: `${overflowModalData.position.y}px`,
              transform: overflowModalData.position.x > window.innerWidth - 300 ? 'translateX(-100%)' : 'none'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">
                {overflowModalData.date.toLocaleDateString('en-US', { 
                  weekday: 'short', 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </h3>
              <button
                onClick={() => setOverflowModalData(null)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              >
                <svg className="w-3 h-3 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              <div className="space-y-1">
                {overflowModalData.events.map((event, index) => (
                  <div
                    key={index}
                    className="p-2 rounded border border-gray-200 dark:border-gray-600 hover:shadow-sm transition-all duration-200 cursor-pointer"
                    style={{ borderLeftColor: getPGYColor(event), borderLeftWidth: '3px' }}
                    onClick={() => {
                      setOverflowModalData(null);
                      setSelectedEvent(event);
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-xs text-gray-900 dark:text-gray-100 mb-1 truncate">
                          {event.title}
                        </h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {ensureDate(event.start).toLocaleTimeString('en-US', { 
                            hour: 'numeric', 
                            minute: '2-digit',
                            hour12: true
                          })}
                        </p>
                      </div>
                      <div 
                        className="w-2 h-2 rounded-full flex-shrink-0 ml-2 mt-0.5"
                        style={{ backgroundColor: getPGYColor(event) }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarPage; 