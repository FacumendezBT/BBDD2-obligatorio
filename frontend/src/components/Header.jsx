import React from 'react';
// import { BsBell } from 'react-icons/bs';
// import { NavUser } from '@/shared/components/topbar/nav-user';
// import { BranchSelector } from '@/shared/components/topbar/branch-selector';
// import { GlobalSearch } from '@/shared/components/topbar/global-search';

export function Header() {
  return (
    <div className="py-2 border-b border-border flex items-center px-1 bg-card">
      <div className="w-1/3 flex justify-start">
        {/* <BranchSelector /> */}
      </div>

      <div className="w-1/3 flex justify-center">
        {/* <GlobalSearch /> */}
      </div>

      <div className="w-1/3 flex items-center justify-end gap-4">
        {/* <BsBell className="h-5 w-5 text-muted-foreground" />
        <NavUser /> */}
      </div>
    </div>
  );
}
