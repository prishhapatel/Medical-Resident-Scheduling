"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function Register() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [form, setForm] = useState({
    phone: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      const res = await fetch("http://localhost:5109/api/register/complete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
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
        <input type="text" value="Example" disabled className="w-full p-2 border rounded bg-gray-100 text-gray-500" />
        <input type="text" value="User" disabled className="w-full p-2 border rounded bg-gray-100 text-gray-500" />
        <input type="text" value="123456" disabled className="w-full p-2 border rounded bg-gray-100 text-gray-500" />
        <input type="text" value="example@email.com" disabled className="w-full p-2 border rounded bg-gray-100 text-gray-500" />
        <input name="phone" placeholder="Phone Number" value={form.phone} onChange={handleChange} className="w-full p-2 border rounded" />
        <input type="password" name="password" placeholder="Password" value={form.password} onChange={handleChange} className="w-full p-2 border rounded" />
        <button onClick={handleSubmit} className="w-full bg-blue-600 text-white p-2 rounded">Submit</button>
      </div>
    </div>
  );
}
