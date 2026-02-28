import React from "react";
import Navbar from "./Navbar";
import CommandPalette from "@/components/common/CommandPalette";

interface LayoutProps {
  children: React.ReactNode;
  showNavbar?: boolean;
}

const Layout: React.FC<LayoutProps> = ({
  children,
  showNavbar = true,
}) => {
  return (
    <>
      {/* Global Command Palette (Accessible Everywhere) */}
      <CommandPalette />

      <div className="min-h-screen bg-background">
        {showNavbar && <Navbar />}

        <main className="container mx-auto py-6 animate-fade-in">
          {children}
        </main>
      </div>
    </>
  );
};

export default Layout;