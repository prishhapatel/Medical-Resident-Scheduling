"use client";

import React from "react";
import { Card } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Send } from "lucide-react";

interface RequestOffPageProps {
  startDate: string;
  setStartDate: (value: string) => void;
  endDate: string;
  setEndDate: (value: string) => void;
  reason: string;
  setReason: (value: string) => void;
  leaveReasons: { id: string; name: string }[];
  description: string;
  setDescription: (value: string) => void;
  handleSubmitRequestOff: () => void;
}

const RequestOffPage: React.FC<RequestOffPageProps> = ({
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  reason,
  setReason,
  leaveReasons,
  description,
  setDescription,
  handleSubmitRequestOff,
}) => {
  return (
    <div className="w-full pt-4 h-[calc(100vh-4rem)] flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-6">Request Time Off</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-8">Submit your time off request below. Please specify the dates and reason.</p>
      <Card className="p-8 bg-gray-50 dark:bg-neutral-900 shadow-lg rounded-2xl w-full flex flex-col gap-6">
        {/* Start Date Input */}
        <div>
          <label htmlFor="start-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Start Date:</label>
          <input
            id="start-date"
            type="date"
            className="block w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>

        {/* End Date Input */}
        <div>
          <label htmlFor="end-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">End Date:</label>
          <input
            id="end-date"
            type="date"
            className="block w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>

        {/* Reason Dropdown */}
        <div>
          <label htmlFor="reason-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Reason for Request:</label>
          <select
            id="reason-select"
            className="block w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          >
            <option value="">Select a reason</option>
            {leaveReasons.map((r) => (
              <option key={r.id} value={r.name}>{r.name}</option>
            ))}
          </select>
        </div>

        {/* Description Box */}
        <div>
          <label htmlFor="description-box" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Additional Details (Optional):</label>
          <textarea
            id="description-box"
            rows={4}
            className="block w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g., specific duties, contact info, special considerations..."
          ></textarea>
        </div>

        {/* Submit Button */}
        <Button onClick={handleSubmitRequestOff} className="w-full py-2 flex items-center justify-center gap-2">
          <Send className="h-5 w-5" />
          <span>Submit Request</span>
        </Button>
      </Card>
    </div>
  )
}

export default RequestOffPage; 