"use client";

import React, { useState } from "react";
import { Card } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Calendar, Users, Clock, Send, ArrowRightLeft, AlertTriangle } from "lucide-react";

interface SwapCallsPageProps {
  yourShiftDate: string;
  setYourShiftDate: (value: string) => void;
  partnerShiftDate: string;
  setPartnerShiftDate: (value: string) => void;
  selectedResident: string;
  setSelectedResident: (value: string) => void;
  residents: { id: string; name: string }[];
  selectedShift: string;
  setSelectedShift: (value: string) => void;
  partnerShift: string;
  setPartnerShift: (value: string) => void;
  shifts: { id: string; name: string }[];
  handleSubmitSwap: () => void;
}

// Add this utility function for shift mapping
function mapShiftType(shift: string) {
  if (shift === "Saturday") return ["24h", "Saturday"];
  if (shift === "Sunday") return ["12h", "Sunday"];
  return [shift]; // "Short" stays "Short"
}

const SwapCallsPage: React.FC<SwapCallsPageProps> = ({
  yourShiftDate,
  setYourShiftDate,
  partnerShiftDate,
  setPartnerShiftDate,
  selectedResident,
  setSelectedResident,
  residents,
  selectedShift,
  setSelectedShift,
  partnerShift,
  setPartnerShift,
  shifts,
  handleSubmitSwap,
}) => {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const isFormValid = yourShiftDate && partnerShiftDate && selectedResident && selectedShift && partnerShift;

  const handleInitialSubmit = () => {
    if (isFormValid) {
      setShowConfirmation(true);
    }
  };

  const handleConfirmSubmit = () => {
    handleSubmitSwap();
    setShowConfirmation(false);
  };

  const handleCancelSubmit = () => {
    setShowConfirmation(false);
  };

  return (
    <div className="w-full h-full bg-background p-4 overflow-hidden">
      <div className="max-w-xl mx-auto h-full flex flex-col">
        {/* Header */}
        <div className="text-center mb-5">
          <div className="flex justify-center mb-2">
            <div className="p-2.5 bg-primary/10 rounded-full">
              <ArrowRightLeft className="h-5 w-5 text-primary" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-1">Request Call Swap</h1>
          <p className="text-sm text-muted-foreground">
            Exchange shifts with a colleague by completing the form below.
          </p>
        </div>

        {/* Main Form Card */}
        <Card className="p-5 shadow-lg border border-border flex-1 flex flex-col">
          <div className="space-y-5 flex-1">
            {/* Your Shift Date Selection */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                <label htmlFor="your-shift-date" className="text-sm font-semibold text-foreground">
                  Your Shift Date
                </label>
              </div>
              <input
                id="your-shift-date"
                type="date"
                className="w-full px-3 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                value={yourShiftDate}
                onChange={(e) => setYourShiftDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            {/* Partner&apos;s Shift Date Selection */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                <label htmlFor="partner-shift-date" className="text-sm font-semibold text-foreground">
                  Partner&apos;s Shift Date
                </label>
              </div>
              <input
                id="partner-shift-date"
                type="date"
                className="w-full px-3 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                value={partnerShiftDate}
                onChange={(e) => setPartnerShiftDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            {/* Resident Selection */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                <label htmlFor="resident-select" className="text-sm font-semibold text-foreground">
                  Swap Partner
                </label>
              </div>
              <select
                id="resident-select"
                className="w-full px-3 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors appearance-none cursor-pointer"
                value={selectedResident}
                onChange={(e) => setSelectedResident(e.target.value)}
              >
                <option value="" disabled>Choose a resident to swap with</option>
                {residents.map((resident) => (
                  <option key={resident.id} value={resident.id}>
                    {resident.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Your Shift Type Selection */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                <label htmlFor="shift-select" className="text-sm font-semibold text-foreground">
                  Your Shift Type
                </label>
              </div>
              <select
                id="shift-select"
                className="w-full px-3 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors appearance-none cursor-pointer"
                value={selectedShift}
                onChange={(e) => setSelectedShift(e.target.value)}
              >
                <option value="" disabled>Select shift type</option>
                {shifts.map((shift) => (
                  <option key={shift.id} value={shift.id}>
                    {shift.name}
                  </option>
                ))}
              </select>
            </div>
            {/* Partner&apos;s Shift Type Selection */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                <label htmlFor="partner-shift-select" className="text-sm font-semibold text-foreground">
                  Partner&apos;s Shift Type
                </label>
              </div>
              <select
                id="partner-shift-select"
                className="w-full px-3 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors appearance-none cursor-pointer"
                value={partnerShift}
                onChange={(e) => setPartnerShift(e.target.value)}
              >
                <option value="" disabled>Select shift type</option>
                {shifts.map((shift) => (
                  <option key={shift.id} value={shift.id}>
                    {shift.name}
                  </option>
                ))}
              </select>
            </div>
            {/* Form Summary */}
            {isFormValid && (
              <div className="bg-muted/50 rounded-lg p-3 border border-border">
                <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2 text-sm">
                  <ArrowRightLeft className="h-3 w-3" />
                  Swap Summary
                </h3>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Your Shift:</span>
                    <span className="font-medium text-foreground">
                      {yourShiftDate ? (() => {
                        const [year, month, day] = yourShiftDate.split('-');
                        const localDate = new Date(Number(year), Number(month) - 1, Number(day));
                        return localDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                      })() : ''} - {selectedShift ? mapShiftType(shifts.find(s => s.id === selectedShift)?.name || '').join(' / ') : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Partner&apos;s Shift:</span>
                    <span className="font-medium text-foreground">
                      {partnerShiftDate ? (() => {
                        const [year, month, day] = partnerShiftDate.split('-');
                        const localDate = new Date(Number(year), Number(month) - 1, Number(day));
                        return localDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                      })() : ''} - {partnerShift ? mapShiftType(shifts.find(s => s.id === partnerShift)?.name || '').join(' / ') : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Partner:</span>
                    <span className="font-medium text-foreground">
                      {residents.find(r => r.id === selectedResident)?.name || 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Submit Button / Confirmation */}
          <div className="pt-4 mt-auto">
            {!showConfirmation ? (
              <>
                <Button 
                  onClick={handleInitialSubmit} 
                  className="w-full py-2.5 text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-200"
                  disabled={!isFormValid}
                >
                  <Send className="h-4 w-4" />
                  <span>Submit Swap Request</span>
                </Button>
                {!isFormValid && (
                  <p className="text-xs text-muted-foreground mt-2 text-center">
                    Complete all fields to submit
                  </p>
                )}
              </>
            ) : (
              <div className="space-y-3">
                <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                    <h3 className="text-sm font-semibold text-yellow-800 dark:text-yellow-200">
                      Confirm Swap Request
                    </h3>
                  </div>
                  <p className="text-xs text-yellow-700 dark:text-yellow-300 mb-2">
                    Are you sure you want to submit this swap request? This action will notify your selected partner.
                  </p>
                  <div className="text-xs text-yellow-600 dark:text-yellow-400">
                    <strong>Your Shift:</strong> {yourShiftDate ? (() => {
                      const [year, month, day] = yourShiftDate.split('-');
                      const localDate = new Date(Number(year), Number(month) - 1, Number(day));
                      return localDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                    })() : ''} - {selectedShift ? mapShiftType(shifts.find(s => s.id === selectedShift)?.name || '').join(' / ') : 'N/A'}<br/>
                    <strong>Partner&apos;s Shift:</strong> {partnerShiftDate ? (() => {
                      const [year, month, day] = partnerShiftDate.split('-');
                      const localDate = new Date(Number(year), Number(month) - 1, Number(day));
                      return localDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                    })() : ''} - {partnerShift ? mapShiftType(shifts.find(s => s.id === partnerShift)?.name || '').join(' / ') : 'N/A'}<br/>
                    <strong>Partner:</strong> {residents.find(r => r.id === selectedResident)?.name}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={handleCancelSubmit}
                    variant="outline"
                    className="flex-1 py-2.5 text-sm"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleConfirmSubmit}
                    className="flex-1 py-2.5 text-sm font-semibold flex items-center justify-center gap-2"
                  >
                    <Send className="h-4 w-4" />
                    Confirm & Send
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default SwapCallsPage; 