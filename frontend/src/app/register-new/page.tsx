"use client";

import { useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useTheme } from "next-themes";
import { useToast } from "@/lib/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { config } from "@/config";
import { useRouter } from "next/navigation";

function RegisterNewContent() {
  const { theme } = useTheme();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const router = useRouter();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    residentId: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: ""
  });

  

  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
  
    setForm(prev => ({
      ...prev,
      [name]: 
        name === "phone" ? formatPhoneNumber(value) :
        name === "email" ? formatEmail(value) :
        value
    }));
  };
  

  const validatePassword = (password: string) => {
    return (
        password.length >= 8 &&
        password.length <= 16 &&
        /[A-Z]/.test(password) &&
        /[a-z]/.test(password) &&
        /[!@#$%^&*(),.?":{}|<>]/.test(password)
    );
};

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (form.password !== form.confirmPassword) {
      toast({ variant: "destructive", title: "Error", description: "Passwords do not match." });
      setIsLoading(false);
      return;
    }

    if (!validatePassword(form.password)) {
      toast({
        variant: "destructive",
        title: "Invalid Password",
        description: "Password must be 8-16 characters long and contain at least one uppercase, one lowercase, and one special character."
      });
      setIsLoading(false);
      return;
    }

    if (!isValidEmail(form.email)) {
      toast({
        variant: "destructive",
        title: "Invalid Email",
        description: "Please enter a valid email address."
      });
      setIsLoading(false);
      return;
    }
    
    try {
      const res = await fetch(`${config.apiUrl}/api/register/new`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          firstName: form.firstName,
          lastName: form.lastName,
          residentId: form.residentId,
          email: form.email,
          phone: form.phone,
          password: form.password
        })
      });

      const data = await res.json();

      if (!res.ok) {
        toast({ variant: "destructive", title: "Error", description: data.message || "Something went wrong." });
        return;
      }

      toast({ variant: "success", title: "Success", description: "Registration successful!" });
      router.push("/");

    } catch (err) {
      console.error("Request failed:", err);
      toast({ variant: "destructive", title: "Error", description: "Network error. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  const formatPhoneNumber = (value: string): string => {
    const digits = value.replace(/\D/g, '');
  
    if (digits.length <= 3) {
      return digits;
    } else if (digits.length <= 6) {
      return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    } else {
      return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
    }
  };

  const formatEmail = (value: string): string => {
    return value.trim().toLowerCase();
  };
  
  const isValidEmail = (email: string): boolean => {
    return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
  };
  
  

  return (
    <div className="flex flex-col min-h-screen">
      <Toaster />
      {/* Header */}
      <header className="bg-gray-100 dark:bg-neutral-900 text-black dark:text-white p-5 flex items-center justify-between border-b border-gray-300 dark:border-gray-700 shadow-lg">
        <div className="flex items-center">
          <Image src={theme === 'dark' ? "/HCAHeader-white.png" : "/HCAHeader.png"} alt="HCA Logo" width={50} height={50} className="mr-6" />
          <h1 className="text-2xl font-bold">PSYCALL</h1>
        </div>
      </header>

      <div className="flex-grow flex items-center justify-center bg-blue-950 dark:bg-neutral-800">
        <Card className="p-6 sm:p-10 bg-white dark:bg-neutral-900 shadow-lg rounded-3xl w-full max-w-[500px] mx-4">
          <h2 className="text-2xl font-bold mb-4 text-center text-black dark:text-white">Register</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input name="firstName" placeholder="First Name" value={form.firstName} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-500 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400 text-black dark:text-white bg-white dark:bg-neutral-800" required />
            <input name="lastName" placeholder="Last Name" value={form.lastName} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-500 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400 text-black dark:text-white bg-white dark:bg-neutral-800" required />
            <input name="residentId" placeholder="Resident ID" value={form.residentId} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-500 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400 text-black dark:text-white bg-white dark:bg-neutral-800" required />
            <input name="email" placeholder="Email Address" value={form.email} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-500 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400 text-black dark:text-white bg-white dark:bg-neutral-800" required />
            <input name="phone" placeholder="Phone Number" value={form.phone} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-500 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400 text-black dark:text-white bg-white dark:bg-neutral-800" required />
            <input type="password" name="password" placeholder="Password" value={form.password} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-500 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400 text-black dark:text-white bg-white dark:bg-neutral-800" required />
            <input type="password" name="confirmPassword" placeholder="Confirm Password" value={form.confirmPassword} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-500 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400 text-black dark:text-white bg-white dark:bg-neutral-800" required />
            <Button type="submit" disabled={isLoading} className="w-full bg-orange-500 text-white py-3 rounded-md hover:bg-orange-400 disabled:opacity-50 disabled:cursor-not-allowed">
              {isLoading ? "Registering..." : "Register"}
            </Button>
          </form>
        </Card>
      </div>
        {/*Footer*/}
      <footer className="bg-gray-100 dark:bg-neutral-900 text-black dark:text-white p-2 text-center border-t border-gray-300 dark:border-gray-700 shadow-lg">
        <div className="flex justify-center items-center space-x-6 mb-1">
          <Image src="/UCF-College-of-Medicine-Footer.png" alt="UCF Footer Logo" width={150} height={75} className="object-contain" />
          <div className="h-16 w-px bg-gray-400 dark:bg-gray-700" />
          <Image 
            src={theme === 'dark' ? "/HCAFooter-white.png" : "/HCAFooter.png"} 
            alt="HCA Footer Logo" 
            width={150} 
            height={75} 
            className="object-contain" 
          />
        </div>
        <p className="text-sm">&copy; 2025 PSYCALL. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default function RegisterNew() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RegisterNewContent />
    </Suspense>
  );
}
