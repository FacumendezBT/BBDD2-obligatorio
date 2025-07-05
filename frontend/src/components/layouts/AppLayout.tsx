import React from 'react';
import { Outlet } from 'react-router-dom';

export function AppLayout() {
  return (
    <div className="min-h-screen bg-background">
      <main className="w-full">
        <Outlet />
      </main>
    </div>
  );
}
