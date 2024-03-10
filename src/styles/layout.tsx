// src/app/styles/layout.tsx
import React, { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <header className="bg-blue-500 text-white p-4 text-center">
        <h1 className="text-2xl font-bold">Chat App</h1>
      </header>
      <main className="flex-grow p-4 flex items-center justify-center">
        <div className="w-full max-w-md bg-white rounded-lg shadow-md overflow-hidden">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
