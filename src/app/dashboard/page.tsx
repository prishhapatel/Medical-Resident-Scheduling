import React from "react";
import { Button } from "@/components/ui/button";

import {
  SidebarProvider,
  SidebarTrigger,
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

import { Card } from "@/components/ui/card";
import { url } from "inspector";

// sidebar menu items
const items = [
  // needs to have a url for each item we are going to add on the sidebar
  // look for icons on the left side of the sidebar
  {
    title: "Swap Calls",
    //url: "/dashboard/swap-calls",
    //icon: Swap Calls,
  },
  {
    title: "Request Off",
    //url: "/dashboard/request-off",
    //icon: Request Off,
  },
  {
    title: "Check My Schedule",
    //url: "/dashboard/check-my-schedule",
    //icon: Check My Schedule,
  },
  {
    title: "Admin",
    //url: "/dashboard/admin",
    //icon: Admin,
  },
];

function page({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/*Hamburger*/}
      <div className="md:hidden p-5">
        <Sheet>
          <SheetTrigger asChild>
            <button className="text-xl font-bold">☰</button>
          </SheetTrigger>
          <SheetContent side="left">
            <SheetHeader>
              <SheetTitle className="text-xl">Hamburger For Ricky</SheetTitle>
            </SheetHeader>
            <ul className="mt-3 space-y-4 p-4">
              {items.map((item) => (
                <li key={item.title}>
                  <button className="text-lg font-medium w-full text-left">
                    {item.title}
                  </button>
                </li>
              ))}
            </ul>
          </SheetContent>
        </Sheet>
      </div>
      {/*Sidebar */}
      <div className="hidden md:block">
        <SidebarProvider defaultOpen={true}>
          <Sidebar>
            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupLabel>Person's Sidebar</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {items.map((item) => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton asChild>
                          <span>{item.title}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>
          </Sidebar>
          <main>
            <SidebarTrigger />
            {children}
            <SidebarContent />
          </main>
        </SidebarProvider>
      </div>
    </>
  );
}


export default page;
