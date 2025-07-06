"use client";

import React from "react";
import { Button } from "../../../components/ui/button";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

interface SettingsPageProps {
  firstName: string;
  lastName: string;
  email: string;
  setEmail: (value: string) => void;
  handleUpdateEmail: () => void;
  phoneNumber: string;
  setPhoneNumber: (value: string) => void;
  handleUpdatePhoneNumber: () => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({
  firstName,
  lastName,
  email,
  setEmail,
  handleUpdateEmail,
  phoneNumber,
  setPhoneNumber,
  handleUpdatePhoneNumber,
}) => {
  const { setTheme, theme } = useTheme();

  // Format phone number as user types
  const formatPhoneNumber = (value: string) => {
    // Remove all non-digit characters
    const phoneNumber = value.replace(/\D/g, '');
    
    // Format as XXX-XXX-XXXX
    if (phoneNumber.length <= 3) {
      return phoneNumber;
    } else if (phoneNumber.length <= 6) {
      return `${phoneNumber.slice(0, 3)}-${phoneNumber.slice(3)}`;
    } else {
      return `${phoneNumber.slice(0, 3)}-${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`;
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhoneNumber(formatted);
  };

  return (
    <div className="w-full h-full bg-background p-4 overflow-hidden">
      <div className="max-w-xl mx-auto h-full flex flex-col">
        {/* Header */}
        <div className="text-center mb-5">
          <h1 className="text-2xl font-bold text-foreground">Profile</h1>
          <p className="text-sm text-muted-foreground mt-2">Manage your profile settings</p>
        </div>

      {/* Basic Info Section */}
      <div className="bg-card rounded-lg border border-border p-6 shadow-sm">
        <div className="border-b border-border pb-4 mb-6">
          <h2 className="text-xl font-semibold text-foreground">Basic info</h2>
          <p className="text-muted-foreground text-sm mt-1">Tell us your basic info details</p>
        </div>

        <div className="space-y-6">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Full name
            </label>
            <input
              type="text"
              value={`${firstName} ${lastName}`}
              disabled
              className="w-full px-4 py-3 border border-border rounded-lg bg-muted text-muted-foreground cursor-not-allowed focus:outline-none"
            />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email-input" className="block text-sm font-medium text-foreground mb-2">
              Email
            </label>
            <div className="flex gap-3">
              <input
                id="email-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 px-4 py-3 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
                placeholder="your.email@example.com"
              />
              <Button 
                onClick={handleUpdateEmail}
                className="px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors"
              >
                Update
              </Button>
            </div>
          </div>

          {/* Phone Number */}
          <div>
            <label htmlFor="phone-number" className="block text-sm font-medium text-foreground mb-2">
              Phone number
            </label>
            <div className="flex gap-3">
              <input
                id="phone-number"
                type="tel"
                value={phoneNumber}
                onChange={handlePhoneChange}
                className="flex-1 px-4 py-3 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
                placeholder="123-456-7890"
                maxLength={12}
              />
              <Button 
                onClick={handleUpdatePhoneNumber} 
                className="px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors"
              >
                Update
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Theme Settings Section */}
      <div className="bg-card rounded-lg border border-border p-6 shadow-sm">
        <div className="border-b border-border pb-4 mb-6">
          <h2 className="text-xl font-semibold text-foreground">Appearance</h2>
          <p className="text-muted-foreground text-sm mt-1">Customize how the interface looks</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-3">
            Theme preference
          </label>
          <Button
            variant="outline"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="flex items-center gap-3 px-4 py-3 border border-border rounded-lg bg-background hover:bg-muted text-foreground transition-colors"
          >
            {theme === "dark" ? (
              <>
                <Sun className="h-5 w-5" />
                <span>Switch to Light Mode</span>
              </>
            ) : (
              <>
                <Moon className="h-5 w-5" />
                <span>Switch to Dark Mode</span>
              </>
            )}
          </Button>
        </div>
      </div>
      </div>
    </div>
  );
};

export default SettingsPage; 