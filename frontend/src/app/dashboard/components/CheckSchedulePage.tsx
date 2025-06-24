import React from "react";
import { Card } from "src/components/ui/card";

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
  return (
    <div className="w-full pt-4 h-[calc(100vh-4rem)] flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-6">My Upcoming Schedule</h1>
      <p className="text-center text-gray-600 dark:text-gray-400 mb-8 max-w-lg">Here's an overview of your upcoming shifts and rotations.</p>
      <Card className="p-8 bg-gray-50 dark:bg-neutral-900 shadow-lg rounded-2xl w-full flex flex-col gap-4">
        {mySchedule.length > 0 ? (
          <div className="space-y-4">
            {mySchedule.map((entry) => (
              <div key={entry.id} className="p-4 bg-white dark:bg-neutral-800 rounded-lg shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                <div className="flex flex-col">
                  <p className="font-semibold text-lg text-gray-900 dark:text-gray-100">{entry.date}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{entry.time}</p>
                </div>
                <div className="flex flex-col text-left md:text-right">
                  <p className="font-medium text-gray-800 dark:text-gray-200">{entry.shift}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{entry.location}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 italic">No upcoming schedule entries found.</p>
        )}
      </Card>
    </div>
  );
};

export default CheckSchedulePage; 