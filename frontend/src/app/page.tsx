import Image from "next/image";
import { Button } from "src/components/ui/button";
import { Card } from "src/components/ui/card";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/*Header Section*/}
      <header className="bg-gray-100 text-black p-5 flex items-center justify-between border-b border-gray-300 shadow-lg">
        <div className="flex items-center">
          <Image
            src="/HCAHeader.png"
            alt="HCA Logo"
            width={50}
            height={50}
            className="mr-6"
          />
          <h1 className="text-2xl font-bold">PSYCALL</h1>
        </div>
        <div className="flex space-x-10 pr-5">
          <Button className="text-2xl font-medium bg-orange-600 text-white px-4 py-2 pb-3 rounded-md hover:bg-orange-400 shadow-md">
            Contact
          </Button>
        </div>
      </header>

      {/*Login Card*/}
      <div className="flex-grow flex items-center justify-center pt-8 bg-blue-950">
        <Card className="p-6 sm:p-10 bg-white shadow-lg rounded-3xl w-full max-w-[400px] mx-4">
          <h2 className="text-2xl font-bold mb-4 text-center text-black">
            Login
          </h2>
          <form className="space-y-4">
            {/* Username Field*/}
            <div>
              <label
                htmlFor="username"
                className="block text-lg font-medium text-gray-700"
              >
                Username
              </label>
              <input
                type="text"
                id="username"
                placeholder="Username"
                className="mt-1 block w-full px-3 py-2 border border-gray-500 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            {/* Password Field*/}
            <div>
              <label
                htmlFor="password"
                className="block text-lg font-medium text-gray-700"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                placeholder="Password"
                className="mt-1 block w-full px-3 py-2 border border-gray-500 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            {/* Login Button */}
            <Button className="w-full bg-orange-500 text-white py-3 rounded-md hover:bg-orange-400">
              Login
            </Button>
          </form>
        </Card>
      </div>
      {/*Footer Section*/}
      <footer className="bg-gray-100 text-black p-2 text-center">
        <div className="flex justify-center items-center space-x-6 mb-1">
          <Image
            src="/UCF-College-of-Medicine-Footer.png"
            alt="UCF Footer Logo"
            width={150}
            height={75}
            className="object-contain"
          />
          <div className="h-16 w-px bg-gray-400" />
          <Image
            src="/HCAFooter.png"
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

