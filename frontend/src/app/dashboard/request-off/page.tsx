"use client";
import React, { useState } from 'react';
import RequestOffPage from '../components/RequestOffPage';

const leaveReasons = [
  { id: "vacation", name: "Vacation" },
  { id: "sick", name: "Sick Leave" },
  { id: "cme", name: "ED (Education Days)" },
  { id: "personal", name: "Personal Leave" },
  { id: "other", name: "Other" },
];

export default function Page() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmitRequestOff = () => {
    // You can implement the real submit logic here
    alert("Request submitted! (implement real logic)");
  };

  return (
    <RequestOffPage
      startDate={startDate}
      setStartDate={setStartDate}
      endDate={endDate}
      setEndDate={setEndDate}
      reason={reason}
      setReason={setReason}
      leaveReasons={leaveReasons}
      description={description}
      setDescription={setDescription}
      handleSubmitRequestOff={handleSubmitRequestOff}
    />
  );
} 