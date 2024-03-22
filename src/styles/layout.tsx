// src/app/styles/layout.tsx
import React, { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col h-screen bg-gradient-to-r from-blue-500 to-purple-500 text-white">
      <header className="bg-blue-500 p-4 text-center">
        <h1 className="text-3xl font-bold">ChatApp</h1>
      </header>
      <main className="flex-grow p-4 flex items-center justify-center">
        <div className="w-full max-w-md bg-white rounded-lg shadow-md overflow-hidden text-black">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
