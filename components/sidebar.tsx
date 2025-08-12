import React from 'react';
import { Sidebar } from 'flowbite-react';
import { MilkIcon as Cow, FileText, Droplets, Baby, Users } from 'lucide-react';
import { SimplifiedSidebar } from "./simplified-sidebar";

const SidebarComponent = () => {
  return (
    <Sidebar aria-label="Default sidebar example">
      <Sidebar.Items>
        <Sidebar.ItemGroup>
          {
            title: "Cow Management",
            icon: Cow,
            items: [
              {
                title: "Cow Records",
                href: "/cows",
                icon: FileText,
              },
              {
                title: "Milk Records", 
                href: "/production",
                icon: Droplets,
              },
              {
                title: "Calves",
                href: "/calves",
                icon: Baby,
              },
              {
                title: "Vendors & Milk",
                href: "/vendors",
                icon: Users,
              },
            ],
          }
        </Sidebar.ItemGroup>
        {/* rest of code here */}
      </Sidebar.Items>
    </Sidebar>
  );
};

export { SimplifiedSidebar as default } from "./simplified-sidebar";
