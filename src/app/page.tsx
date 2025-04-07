import Image from "next/image";
import { ModeToggle } from "@/components/ui/modetoggle";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-gray-150 text-black p-5 flex items-center justify-between border-b border-gray-300 shadow-lg">
        <div className="flex items-center">
          <Image
            src="/HCA.png"
            alt="HCA Logo"
            width={50}
            height={50}
            className="mr-6"
          />
          <h1 className="text-2xl font-bold">PYSCALL</h1>
        </div>
        <div className="flex space-x-10 pr-5">
          <h1 className="text-2xl font-medium">Contact</h1>
          <h1 className="text-2xl font-medium">About</h1>
          <h1 className="text-2xl font-medium">Location</h1>
        </div>
      </header>
      <div className="bg-blue-950 flex-grow" />
      <footer className="bg-gray-150 text-black p-2 text-center">
        <div className="flex justify-center items-center space-x-6 mb-2">
          <Image
            src="/UCFFooter.jpg"
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
        <p className="text-sm">&copy; 2025 PYSCALL. All rights reserved.</p>
      </footer>
    </div>
  );
}
