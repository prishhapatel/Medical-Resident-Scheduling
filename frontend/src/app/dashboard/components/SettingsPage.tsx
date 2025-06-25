"use client";

import React from "react";
import { Card } from "src/components/ui/card";
import { Button } from "src/components/ui/button";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

interface SettingsPageProps {
  displayName: string;
  phoneNumber: string;
  setPhoneNumber: (value: string) => void;
  handleUpdatePhoneNumber: () => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({
  displayName,
  phoneNumber,
  setPhoneNumber,
  handleUpdatePhoneNumber,
}) => {
  const { setTheme, theme } = useTheme();

  return (
    <div className="w-full pt-4 h-[calc(100vh-4rem)] flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      <p className="text-center text-gray-600 dark:text-gray-400 mb-8 max-w-lg">Manage your account preferences and settings.</p>
      <Card className="p-8 bg-gray-50 dark:bg-neutral-900 shadow-lg rounded-2xl w-full flex flex-col gap-6">
        {/* Theme Settings */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Theme</h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="flex items-center gap-2"
          >
            {theme === "dark" ? (
              <>
                <Sun className="h-4 w-4" />
                <span>Light Mode</span>
              </>
            ) : (
              <>
                <Moon className="h-4 w-4" />
                <span>Dark Mode</span>
              </>
            )}
          </Button>
        </div>

        {/* Profile Settings */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Profile</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Display Name
              </label>
              <input
                type="text"
                value={displayName}
                disabled
                className="block w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm bg-gray-100 dark:bg-neutral-800 text-gray-500 dark:text-gray-400 cursor-not-allowed"
              />
            </div>
            <div>
              <label htmlFor="phone-number" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Phone Number
              </label>
              <div className="flex gap-2">
                <input
                  id="phone-number"
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="block w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100"
                  placeholder="e.g., (123) 456-7890"
                />
                <Button onClick={handleUpdatePhoneNumber} className="shrink-0">
                  Update
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default SettingsPage; 