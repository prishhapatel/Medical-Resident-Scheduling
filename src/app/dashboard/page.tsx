import React from "react";
import {
  SidebarProvider,
  SidebarTrigger,
  Sidebar,
} from "@/components/ui/sidebar";
import { Card } from "@/components/ui/card";

function page({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <SidebarProvider>
        <Sidebar />
        <main>
          <SidebarTrigger />
          {children}
        </main>
      </SidebarProvider>

      <div>
        <Card className = "">

        </Card>

      </div>

    </div>
  );
}

export default page;
