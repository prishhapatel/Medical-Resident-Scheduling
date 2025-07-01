"use client";

import React from "react";
import { Card } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Send } from "lucide-react";

interface SwapCallsPageProps {
  shiftDate: string;
  setShiftDate: (value: string) => void;
  selectedResident: string;
  setSelectedResident: (value: string) => void;
  residents: { id: string; name: string }[];
  selectedShift: string;
  setSelectedShift: (value: string) => void;
  shifts: { id: string; name: string }[];
  handleSubmitSwap: () => void;
}

const SwapCallsPage: React.FC<SwapCallsPageProps> = ({
  shiftDate,
  setShiftDate,
  selectedResident,
  setSelectedResident,
  residents,
  selectedShift,
  setSelectedShift,
  shifts,
  handleSubmitSwap,
}) => {
  return (
    <div className="w-full pt-4 h-[calc(100vh-4rem)] flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-6">Request to Swap Calls</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-8">Fill out the form below to request a swap for an upcoming shift. Please ensure all details are accurate.</p>
      <Card className="p-8 bg-gray-50 dark:bg-neutral-900 shadow-lg rounded-2xl w-full flex flex-col gap-6">
        {/* Date Input */}
        <div>
          <label htmlFor="shift-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Date of Shift:</label>
          <input
            id="shift-date"
            type="date"
            className="block w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100"
            value={shiftDate}
            onChange={(e) => setShiftDate(e.target.value)}
          />
        </div>
        {/* Resident Dropdown */}
        <div>
          <label htmlFor="resident-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Seeking to swap with:</label>
          <select
            id="resident-select"
            className="block w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100"
            value={selectedResident}
            onChange={(e) => setSelectedResident(e.target.value)}
          >
            <option value="">Select a resident</option>
            {residents.map((resident) => (
              <option key={resident.id} value={resident.name}>{resident.name}</option>
            ))}
          </select>
        </div>

        {/* Shift Dropdown */}
        <div>
          <label htmlFor="shift-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Shift details to swap:</label>
          <select
            id="shift-select"
            className="block w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100"
            value={selectedShift}
            onChange={(e) => setSelectedShift(e.target.value)}
          >
            <option value="">Select a shift</option>
            {shifts.map((shift) => (
              <option key={shift.id} value={shift.name}>{shift.name}</option>
            ))}
          </select>
        </div>

        {/* Submit Button */}
        <Button onClick={handleSubmitSwap} className="w-full py-2 flex items-center justify-center gap-2">
          <Send className="h-5 w-5" />
          <span>Submit Swap Request</span>
        </Button>
      </Card>
    </div>
  );
};

export default SwapCallsPage; 