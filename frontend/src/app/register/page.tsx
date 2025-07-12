"use client";

import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/lib/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { useTheme } from "next-themes";
import { Card } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { config } from "@/config";

function RegisterContent() {
    const searchParams = useSearchParams();
    const token = searchParams.get("token") || "";
    const { theme } = useTheme();
    const { toast } = useToast();
    const router = useRouter();

    const [form, setForm] = useState({
        phone: "",
        password: "",
        confirmPassword: "",
    });

    const [resident, setResident] = useState<{
        firstName: string;
        lastName: string;
        residentId: string;
        email: string;
    } | null>(null);


    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
      
        setForm(prev => ({
          ...prev,
          [name]: name === "phone" ? formatPhoneNumber(value) : value
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

    const handleSubmit = async () => {
        if (form.password !== form.confirmPassword) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Passwords do not match.",
            });
            return;
        }

        if (!validatePassword(form.password)) {
            toast({
                variant: "destructive",
                title: "Invalid Password",
                description:
                    "Password must be 8-16 characters long and contain at least one uppercase, one lowercase, and one special character.",
            });
            return;
        }

        setIsLoading(true);
        try {
            const res = await fetch(`${config.apiUrl}/api/register/complete`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    token,
                    phone: form.phone,
                    password: form.password,
                }),
            });

            const data = await res.json();
            if (!res.ok) {
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: data.message || "Something went wrong.",
                });
                return;
            }

            toast({
                variant: "success",
                title: "Success",
                description: "Registration complete! You can now log in.",
            });
            router.push("/");

            setForm({ phone: "", password: "", confirmPassword: "" });
        } catch {
            toast({
                variant: "destructive",
                title: "Network Error",
                description: "Please try again later.",
            });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        // hit your GET /api/register/info endpoint
        fetch(`${config.apiUrl}/api/register/info?token=${token}`)
            .then(res => res.json())
            .then(data => {
                if (data.hasEmailOnFile) {
                    setResident(data.resident);
                } else {
                    // this really shouldn't happen on this page…
                }
            })
            .catch(err => {
                console.error("Failed to load invite info", err);
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: "Could not load your registration info.",
                });
            });
    }, [token, toast]);

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

            {/* Main */}
            <div className="flex-grow flex items-center justify-center bg-blue-950 dark:bg-neutral-800">
                <Card className="p-6 sm:p-10 bg-white dark:bg-neutral-900 shadow-lg rounded-3xl w-full max-w-[500px] mx-4">
                    <h2 className="text-2xl font-bold mb-4 text-center text-black dark:text-white">Complete Registration</h2>
                    <div className="space-y-4">
                        <input
                            type="text"
                            value={resident?.firstName || ""}
                            disabled
                            className="mt-1 block w-full px-3 py-2 border border-gray-500 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400 text-black dark:text-white bg-white dark:bg-neutral-800"
                        />
                        <input
                            type="text"
                            value={resident?.lastName || ""}
                            disabled
                            className="mt-1 block w-full px-3 py-2 border border-gray-500 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400 text-black dark:text-white bg-white dark:bg-neutral-800"
                        />
                        <input
                            type="text"
                            value={resident?.residentId || ""}
                            disabled
                            className="mt-1 block w-full px-3 py-2 border border-gray-500 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400 text-black dark:text-white bg-white dark:bg-neutral-800"
                        />
                        <input
                            type="text"
                            value={resident?.email || ""}
                            disabled
                            className="mt-1 block w-full px-3 py-2 border border-gray-500 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400 text-black dark:text-white bg-white dark:bg-neutral-800"
                        />
                        <input
                            name="phone"
                            placeholder="Phone Number"
                            value={form.phone}
                            onChange={handleChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-500 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400 text-black dark:text-white bg-white dark:bg-neutral-800"
                            disabled={isLoading}
                        />
                        <input
                            type="password"
                            name="password"
                            placeholder="Password"
                            value={form.password}
                            onChange={handleChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-500 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400 text-black dark:text-white bg-white dark:bg-neutral-800"
                            disabled={isLoading}
                        />
                        <input
                            type="password"
                            name="confirmPassword"
                            placeholder="Confirm Password"
                            value={form.confirmPassword}
                            onChange={handleChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-500 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400 text-black dark:text-white bg-white dark:bg-neutral-800"
                            disabled={isLoading}
                        />
                        <Button
                            onClick={handleSubmit}
                            className="w-full bg-orange-500 text-white py-3 rounded-md hover:bg-orange-400 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={isLoading}
                        >
                            {isLoading ? "Submitting..." : "Submit"}
                        </Button>
                    </div>
                </Card>
            </div>

            {/* Footer */}
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

export default function Register() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <RegisterContent />
        </Suspense>
    );
}
