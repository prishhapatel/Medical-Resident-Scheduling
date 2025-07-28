"use client";

import React, { useState, useRef } from "react";
import { ChevronLeft, ChevronRight, CalendarDays, Home, Repeat2, Calendar, User, Settings as SettingsIcon } from "lucide-react";

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
  onNavigateToRequestOff?: () => void;
  onNavigateToCheckSchedule?: () => void;
  onNavigateToSettings?: () => void;
  onNavigateToHome?: () => void;
  onDateChange?: (month: number, year: number) => void;
  isAdmin?: boolean;
}

const CalendarPage: React.FC<CalendarPageProps> = ({ events, onNavigateToSwapCalls, onNavigateToRequestOff, onNavigateToCheckSchedule, onNavigateToSettings, onNavigateToHome, onDateChange, isAdmin }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month' | 'year'>('month');
  const [isUpcomingOpen, setIsUpcomingOpen] = useState(true);
  const [eventPopover, setEventPopover] = useState<{ event: CalendarEvent; x: number; y: number } | null>(null);
  const calendarGridRef = useRef<HTMLDivElement>(null);

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
    
    const dayEvents = getEventsForDate(date);
    if (dayEvents.length === 1) {
      setSelectedEvent(dayEvents[0]);
      // Fallback to center if no specific position
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

  const getVisibleRange = () => {
    const start = new Date(currentDate);
    let end = new Date(currentDate);
    if (viewMode === 'month') {
      // Get first and last day of the month
      const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      // First visible day: Sunday before the 1st (or the 1st if it's Sunday)
      const firstVisibleDay = new Date(firstDayOfMonth);
      firstVisibleDay.setDate(firstDayOfMonth.getDate() - firstDayOfMonth.getDay());
      // Last visible day: Saturday after the last day of the month (or the last day if it's Saturday)
      const lastVisibleDay = new Date(lastDayOfMonth);
      lastVisibleDay.setDate(lastDayOfMonth.getDate() + (6 - lastDayOfMonth.getDay()));
      firstVisibleDay.setHours(0,0,0,0);
      lastVisibleDay.setHours(23,59,59,999);
      return { start: firstVisibleDay, end: lastVisibleDay };
    } else if (viewMode === 'week') {
      const day = currentDate.getDay();
      start.setDate(currentDate.getDate() - day);
      end = new Date(start);
      end.setDate(start.getDate() + 6);
    } else if (viewMode === 'day') {
      // start and end are the same
    } else if (viewMode === 'year') {
      start.setMonth(0, 1);
      end = new Date(currentDate.getFullYear(), 11, 31);
    }
    // Normalize times
    start.setHours(0,0,0,0);
    end.setHours(23,59,59,999);
    return { start, end };
  };

  const { start: visibleStart, end: visibleEnd } = getVisibleRange();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const visibleEvents = events
    .filter(event => {
      const eventDate = ensureDate(event.start);
      return eventDate >= visibleStart && eventDate <= visibleEnd && eventDate >= today;
    })
    .sort((a, b) => ensureDate(a.start).getTime() - ensureDate(b.start).getTime())
    .slice(0, 10);

  return (
    <div className="flex flex-col w-full min-h-screen bg-background text-foreground relative">
      {/* Header - Hidden on mobile */}
      <div className="bg-card border pt-6 pb-8 fixed left-0 right-0 top-0 z-10 px-8 hidden md:block">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h1 className="text-5xl font-bold text-foreground">
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
          <div className="flex space-x-3 items-center">
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
            <button
              className={`flex items-center text-sm font-medium rounded-xl transition-colors duration-200 px-5 py-3 border border-border ${isUpcomingOpen ? 'bg-primary text-primary-foreground border-primary shadow-lg' : 'bg-card text-muted-foreground hover:bg-muted'}`}
              onClick={() => setIsUpcomingOpen((open) => !open)}
              aria-expanded={isUpcomingOpen}
              aria-controls="upcoming-panel-content"
              type="button"
            >
              <span className="mr-2">Upcoming</span>
              <span className={`transition-transform duration-200 ${isUpcomingOpen ? '' : 'rotate-180'}`}> 
                <ChevronLeft className="w-4 h-4" style={{ transform: isUpcomingOpen ? 'rotate(-90deg)' : 'rotate(90deg)' }} />
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Header - Simple navigation */}
      <div className="bg-card border-b border-border fixed left-0 right-0 top-0 z-10 px-4 py-3 md:hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => navigatePeriod('prev')}
              className="p-2 hover:bg-muted rounded-full transition-colors duration-200"
            >
              <ChevronLeft className="w-5 h-5 text-muted-foreground" />
            </button>
            <h1 className="text-lg font-semibold text-foreground">
              {getPeriodTitle()}
            </h1>
            <button
              onClick={() => navigatePeriod('next')}
              className="p-2 hover:bg-muted rounded-full transition-colors duration-200"
            >
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
          <button
            onClick={goToToday}
            className="px-4 py-2 text-sm font-medium text-primary hover:bg-primary/10 rounded-lg transition-colors duration-200"
          >
            Today
          </button>
        </div>
        

      </div>

      {/* Navigation Buttons - Hidden on mobile */}
      <div className="py-4 border bg-card fixed left-0 right-0 z-10 px-8 mt-2 hidden md:block" style={{ top: 'calc(4.5rem + 1px)' }}>
        <div className="flex items-center justify-end">
          <div className="flex space-x-2">
            <button onClick={onNavigateToHome} className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold hover:bg-muted transition text-foreground">
              <Home className="w-5 h-5" /> Home
            </button>
            <button onClick={onNavigateToSwapCalls} className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold hover:bg-muted transition text-foreground">
              <Repeat2 className="w-5 h-5" /> Swap Calls
            </button>
            {/* Request Off button: only show if not admin */}
            {!isAdmin && (
              <button onClick={onNavigateToRequestOff} className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold hover:bg-muted transition text-foreground">
                <Calendar className="w-5 h-5" /> Request Off
              </button>
            )}
            {/* Check My Schedule button: only show if not admin */}
            {!isAdmin && (
              <button onClick={onNavigateToCheckSchedule} className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold hover:bg-muted transition text-foreground">
                <User className="w-5 h-5" /> Check My Schedule
              </button>
            )}
            {isAdmin && (
              null
            )}
            <button onClick={onNavigateToSettings} className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold hover:bg-muted transition text-foreground">
              <SettingsIcon className="w-5 h-5" /> Settings
            </button>
          </div>
        </div>
      </div>

      {/* Main Content: Calendar + Upcoming */}
      <div className="flex flex-1 w-full relative pt-24 md:pt-[9rem] md:justify-start">
        {/* Calendar Grid */}
        <div className={`w-full md:flex-1 pl-0 pr-6 md:px-8 py-4 md:py-8 transition-all duration-300 ${isUpcomingOpen ? 'mr-0 md:mr-[24rem]' : ''}`} ref={calendarGridRef}>
          <div className="flex justify-center md:justify-start">
            <div className="calendar-print-area bg-card rounded-2xl shadow-xl border border-border overflow-hidden h-full w-full max-w-2xl md:max-w-none">
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
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedEvent(event);
                            const labelRect = e.currentTarget.getBoundingClientRect();
                            const gridRect = calendarGridRef.current?.getBoundingClientRect();
                            const modalWidth = 340; // match max-w-[340px]
                            let left = labelRect.right - (gridRect?.left || 0) + 8;

                            if (left + modalWidth > (gridRect?.width || window.innerWidth)) {
                              left = (gridRect?.width || window.innerWidth) - modalWidth - 16;
                            }
                            // Fallback to center if no specific position
                          }}
                        >
                          <h4 className="font-semibold text-gray-900 dark:text-gray-100">{event.title}</h4>
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
                                setSelectedEvent(null);
                                const rect = e.currentTarget.getBoundingClientRect();
                                setEventPopover({ 
                                  event: date, // <-- FIXED: use 'date' from map scope
                                  x: rect.left, 
                                  y: rect.bottom + 5 
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
                    <div key={day} className="px-2 md:px-6 py-3 md:py-5 text-xs md:text-sm font-semibold text-gray-700 dark:text-gray-200 text-center uppercase tracking-wide">
                      {day.substring(0, 3)}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 h-full">
                  {calendarDays.map((dayInfo, index) => {
                    if (!dayInfo) return <div key={index} className="min-h-32 md:min-h-40 border-r border-b border-gray-100 dark:border-gray-600" />;
                    const dayEvents = getEventsForDate(dayInfo.date);
                    const isCurrentDay = isToday(dayInfo.date);
                    // There are 6 rows of 7 days = 42 cells
                    const isLastRow = index >= 35;
                    return (
                      <div
                        key={index}
                        className={`min-h-32 md:min-h-40 border-r border-b border-gray-100 dark:border-gray-600 p-2 md:p-4 relative hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 cursor-pointer ${
                          !dayInfo.isCurrentMonth ? 'text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-800/50' : 'bg-white dark:bg-gray-800'
                        } ${isLastRow ? 'pb-16' : ''}`}
                        onClick={() => handleDateClick(dayInfo.date)}
                      >
                        <div className={`text-sm md:text-lg font-medium mb-2 md:mb-3 ${
                          isCurrentDay 
                            ? 'w-8 h-8 md:w-10 md:h-10 bg-blue-600 dark:bg-blue-500 text-white rounded-full flex items-center justify-center text-xs md:text-sm font-bold shadow-lg' 
                            : dayInfo.isCurrentMonth ? 'text-gray-900 dark:text-gray-100' : 'text-gray-400 dark:text-gray-500'
                        }`}>
                          {dayInfo.day}
                        </div>
                        <div className="space-y-1 md:space-y-2">
                          {dayEvents.slice(0, 3).map((event, eventIndex) => (
                            <div
                              key={eventIndex}
                              className={`text-xs px-2 md:px-3 py-1 md:py-2 rounded-lg cursor-pointer hover:shadow-md transition-all duration-200 truncate font-medium`}
                              style={{ backgroundColor: getPGYColor(event), color: 'white' }}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedEvent(event);
                              }}
                              title={event.title}
                            >
                              {event.title}
                            </div>
                          ))}
                          {dayEvents.length > 3 && (
                            <div 
                              className="text-xs text-muted-foreground px-2 py-1 bg-muted/50 rounded text-center cursor-pointer hover:bg-muted/70 transition-colors"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedEvent(null);
                                const rect = e.currentTarget.getBoundingClientRect();
                                setEventPopover({ 
                                  event: dayInfo.date, 
                                  x: rect.left, 
                                  y: rect.bottom + 5 
                                });
                              }}
                            >
                              +{dayEvents.length - 3} more
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
        {/* Upcoming Section to the right (animated slide in/out) - Hidden on mobile */}
        <div
          className={`max-w-xs w-[24rem] h-[50rem] fixed right-0 z-10 border-l border-border bg-card p-6 flex flex-col transition-transform duration-300 ease-in-out ${isUpcomingOpen ? 'translate-x-0' : 'translate-x-full'} pointer-events-auto hidden md:flex`}
          style={{ top: 'calc(4.5rem + 4.5rem + 0.7rem)', boxShadow: isUpcomingOpen ? '0 0 24px 0 rgba(0,0,0,0.08)' : 'none' }}
        >
          <div id="upcoming-panel-content" className="flex-1 overflow-y-auto pb-32">
            {events.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CalendarDays className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                </div>
                <p className="text-gray-500 dark:text-gray-400">No upcoming events</p>
              </div>
            ) : (
              <div className="space-y-4">
                {visibleEvents.map((event, index) => (
                  <div 
                    key={index}
                    className="p-4 rounded-xl border border-gray-200 dark:border-gray-600 hover:shadow-md dark:hover:bg-gray-700 transition-all duration-200 cursor-pointer"
                    onClick={() => {
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
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Event Detail Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => { setSelectedEvent(null); }}>
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-6 md:p-8 min-w-[320px] max-w-[340px] border border-gray-300 dark:border-gray-700 mx-4" style={{ borderRadius: '18px' }} onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-2">{selectedEvent.title}</h2>
            <div className="mb-2">
              <span className="font-semibold">Date: </span>
              {ensureDate(selectedEvent.start).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </div>
            <div className="mb-2">
              <span className="font-semibold">Call Type: </span>
              {selectedEvent.extendedProps?.callType}
            </div>
            <div className="mb-2">
              <span className="font-semibold">Resident: </span>
              {selectedEvent.extendedProps?.firstName} {selectedEvent.extendedProps?.lastName}
            </div>
            {selectedEvent.extendedProps?.pgyLevel && (
              <div className="mb-2">
                <span className="font-semibold">PGY: </span>
                {selectedEvent.extendedProps.pgyLevel}
              </div>
            )}
            <button className="mt-4 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors shadow-sm" onClick={() => { setSelectedEvent(null); }}>
              Close
            </button>
          </div>
        </div>
      )}
      {eventPopover && (
        <div
          className="z-50"
          style={{ position: 'fixed', left: eventPopover.x, top: eventPopover.y, background: 'none', boxShadow: 'none' }}
          tabIndex={-1}
        >
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl p-6 min-w-[260px] max-w-[90vw] border border-gray-300 dark:border-gray-700 mx-4" tabIndex={0}>
            <h2 className="text-lg font-bold mb-2">{eventPopover.event.title}</h2>
            <div className="mb-2">
              <span className="font-semibold">Date: </span>
              {ensureDate(eventPopover.event.start).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </div>
            <div className="mb-2">
              <span className="font-semibold">Call Type: </span>
              {eventPopover.event.extendedProps?.callType}
            </div>
            <div className="mb-2">
              <span className="font-semibold">Resident: </span>
              {eventPopover.event.extendedProps?.firstName} {eventPopover.event.extendedProps?.lastName}
            </div>
            {eventPopover.event.extendedProps?.pgyLevel && (
              <div className="mb-2">
                <span className="font-semibold">PGY: </span>
                {eventPopover.event.extendedProps.pgyLevel}
              </div>
            )}
            <button className="mt-4 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors shadow-sm" onClick={() => setEventPopover(null)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarPage;