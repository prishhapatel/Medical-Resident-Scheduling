"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function RegisterNew() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const email = searchParams.get("email") || "";

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    residentId: "",
    phone: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    // Placeholder for form submission logic
    console.log("Register New Submission:", form, "Token:", token);
  };

  return (
    <div className="max-w-lg mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Complete Your Registration</h1>
      <div className="space-y-4">
        <input name="firstName" placeholder="First Name" value={form.firstName} onChange={handleChange} className="w-full p-2 border rounded" />
        <input name="lastName" placeholder="Last Name" value={form.lastName} onChange={handleChange} className="w-full p-2 border rounded" />
        <input name="residentId" placeholder="Resident ID" value={form.residentId} onChange={handleChange} className="w-full p-2 border rounded" />
        <input type="text" value={email} disabled className="w-full p-2 border rounded bg-gray-100 text-gray-500" />
        <input name="phone" placeholder="Phone Number" value={form.phone} onChange={handleChange} className="w-full p-2 border rounded" />
        <input type="password" name="password" placeholder="Password" value={form.password} onChange={handleChange} className="w-full p-2 border rounded" />
        <button onClick={handleSubmit} className="w-full bg-blue-600 text-white p-2 rounded">Submit</button>
      </div>
    </div>
  );
}
