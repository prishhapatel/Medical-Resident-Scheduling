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
      <div>
        <Card className="flex text-black font-bold bg-gray-200 ml-300 mt-50 mr-40 px-60 py-30 shadow:lg">
          Calendar
        </Card>

        <Card className="flex text-black font-bold bg-gray-200 ml-300 mt-50 mr-40 px-60 py-30 shadow:lg">
          Reminders
        </Card>
      </div>

      <div>
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
