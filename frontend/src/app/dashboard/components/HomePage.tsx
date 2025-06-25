import React from "react";
import { Card } from "src/components/ui/card";

interface HomeProps {
  displayName: string;
  rotation: string | null;
  rotationEndDate: string | null;
  monthlyHours: number | string | null;
  hasData: boolean;
}

const HomePage: React.FC<HomeProps> = ({ 
  displayName,
  rotation,
  rotationEndDate,
  monthlyHours,
  hasData,
}) => {
  return (
    <div className="w-full pt-4 flex flex-col items-center">
      <div className="mb-6 w-full max-w-5xl">
        <h1 className="text-3xl font-bold">Hello, {displayName}!</h1>
      </div>
      <div className="w-full max-w-5xl flex flex-col gap-6">
        {/* Main Summary Card */}
        <Card className="p-6 bg-gray-50 dark:bg-neutral-900 shadow-lg rounded-2xl">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold mb-1">Current Rotation</h2>
              <p className="text-lg font-medium text-gray-400 italic">{rotation || "No rotation data available"}</p>
              <p className="text-sm text-gray-400 italic">{rotationEndDate || "No end date"}</p>
            </div>
            <div>
              <h2 className="text-xl font-semibold mb-1">Hours This Month</h2>
              <p className="text-2xl font-bold text-gray-400 italic">{monthlyHours || "--"}</p>
            </div>
          </div>
          <div className="flex flex-col md:flex-row gap-4 mt-4">
            <button className={`flex-1 p-3 bg-white dark:bg-neutral-800 rounded-lg text-left border border-gray-200 dark:border-gray-700 ${!hasData && "text-gray-400 cursor-not-allowed"}`} disabled={!hasData}>
              <span className="font-medium">Request Call Swap</span>
              <p className="text-xs">{hasData ? "Submit a request" : "No data"}</p>
            </button>
            <button className={`flex-1 p-3 bg-white dark:bg-neutral-800 rounded-lg text-left border border-gray-200 dark:border-gray-700 ${!hasData && "text-gray-400 cursor-not-allowed"}`} disabled={!hasData}>
              <span className="font-medium">Request Day Off</span>
              <p className="text-xs">{hasData ? "Find a day to request off" : "No data"}</p>
            </button>
            <button className={`flex-1 p-3 bg-white dark:bg-neutral-800 rounded-lg text-left border border-gray-200 dark:border-gray-700 ${!hasData && "text-gray-400 cursor-not-allowed"}`} disabled={!hasData}>
              <span className="font-medium">View My Rotations Scheduler</span>
              <p className="text-xs">{hasData ? "See your full schedule" : "No data"}</p>
            </button>
          </div>
        </Card>
        {/* Activity Card */}
        <Card className="p-6 bg-gray-50 dark:bg-neutral-900 shadow-lg rounded-2xl">
          <h2 className="text-xl font-semibold mb-2">Recent Activity</h2>
          <div className="space-y-3 text-gray-400 italic">No recent activity</div>
          <h2 className="text-xl font-semibold mb-2 mt-4">Team Updates</h2>
          <div className="space-y-3 text-gray-400 italic">No team updates</div>
        </Card>
      </div>
    </div>
  );
};

export default HomePage; 