"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";

export default function RegisterNew() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    residentId: "",
    email: "",
    phone: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      const res = await fetch("http://localhost:5109/api/register/new", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          firstName: form.firstName,
          lastName: form.lastName,
          residentId: form.residentId,
          email: form.email,
          phone: form.phone,
          password: form.password,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        console.error("Registration error:", err);
        alert(`Error: ${err.message || "Something went wrong."}`);
        return;
      }

      const data = await res.json();
      console.log("Registration successful:", data);
      alert("Registration complete! You can now log in.");
    } catch (err) {
      console.error("Request failed:", err);
      alert("Network error. Please try again.");
    }
  };

  return (
    <div className="max-w-lg mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Complete Your Registration</h1>
      <div className="space-y-4">
        <input
          name="firstName"
          placeholder="First Name"
          value={form.firstName}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
        <input
          name="lastName"
          placeholder="Last Name"
          value={form.lastName}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
        <input
          name="residentId"
          placeholder="Resident ID"
          value={form.residentId}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
        <input
          name="email"
          placeholder="Email Address"
          value={form.email}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
        <input
          name="phone"
          placeholder="Phone Number"
          value={form.phone}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
        <button
          onClick={handleSubmit}
          className="w-full bg-blue-600 text-white p-2 rounded"
        >
          Submit
        </button>
      </div>
    </div>
  );
}
