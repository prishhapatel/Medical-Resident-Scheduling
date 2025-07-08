"use client";
import React, { useEffect, useState, useCallback } from 'react';
import CheckSchedulePage from '../components/CheckSchedulePage';
import { config } from '../../../config';

interface ScheduleEntry {
  id: string;
  date: string;
  time: string;
  shift: string;
  location: string;
}

// API Response types
interface DateResponse {
  dateId: string;
  date: string;
  callType: string;
  scheduleId: string;
}

export default function Page() {
  const [mySchedule, setMySchedule] = useState<ScheduleEntry[]>([]);

  const fetchMySchedule = useCallback(async () => {
    try {
      const response = await fetch(`${config.apiUrl}/api/dates`);
      if (response.ok) {
        const dates: DateResponse[] = await response.json();
        const currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0); // Start of today

        // Find the scheduleId with the most recent date
        let latestScheduleId: string | null = null;
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
            .sort((a, b) => (Number(b[1]) - Number(a[1])))[0]?.[0] || null;
        }

        // Only include events from the latest schedule
        const filteredDates = latestScheduleId
          ? dates.filter((date: DateResponse) => date.scheduleId === latestScheduleId)
          : dates;

        // Filter for future dates only, and with a real callType
        const userSchedule = filteredDates
          .filter((date: DateResponse) => {
            const dateObj = new Date(date.date);
            return dateObj >= currentDate && date.callType;
          })
          .sort((a: DateResponse, b: DateResponse) => new Date(a.date).getTime() - new Date(b.date).getTime())
          .slice(0, 20)
          .map((date: DateResponse) => ({
            id: date.dateId,
            date: date.date,
            time: "All Day",
            shift: `${date.callType} Call`,
            location: "Hospital"
          }));

        setMySchedule(userSchedule);
      } else {
        console.error('Failed to fetch schedule');
      }
    } catch (error) {
      console.error('Error fetching schedule:', error);
    }
  }, []);

  useEffect(() => {
    fetchMySchedule();
  }, [fetchMySchedule]);

  return <CheckSchedulePage mySchedule={mySchedule} />;
} 