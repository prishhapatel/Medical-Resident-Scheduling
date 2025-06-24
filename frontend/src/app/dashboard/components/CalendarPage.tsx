"use client";

import React from "react";
import { Card } from "src/components/ui/card";
import FullCalendar from "@fullcalendar/react";
import { EventSourceInput } from "@fullcalendar/core";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import "@fullcalendar/common/main.css";

interface CalendarPageProps {
  events: EventSourceInput;
}

const CalendarPage: React.FC<CalendarPageProps> = ({ events }) => {
  return (
    <div className="w-full pt-4 h-[calc(100vh-4rem)] flex flex-col">
      <h1 className="text-2xl font-bold mb-4">Calendar</h1>
      <Card className="p-8 bg-gray-50 dark:bg-neutral-900 shadow-lg rounded-2xl w-full max-w-8xl mx-auto flex-1 flex flex-col justify-start">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin]}
          initialView="dayGridMonth"
          height="100%"
          contentHeight="100%"
          headerToolbar={{
            left: "dayGridMonth,timeGridWeek,timeGridDay",
            center: "title",
            right: "prev,today,next",
          }}
          buttonText={{
            today: "Today",
            month: "Month",
            week: "Week",
            day: "Day",
          }}
          nowIndicator={true}
          events={events}
          eventClick={(info) => {
            console.log("Event clicked:", info.event.title);
            console.log("Shift details:", info.event.extendedProps);
            alert(`Swap Request for: ${info.event.title}\nStart: ${info.event.start?.toLocaleString()}\nEnd: ${info.event.end?.toLocaleString()}\n(Check console for more details)`);
            // Here you would typically open a modal or navigate to a swap request form
          }}
        />
      </Card>
    </div>
  );
};

export default CalendarPage; 