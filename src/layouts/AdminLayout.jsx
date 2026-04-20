import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from '@components/AdminSidebar';
import AdminHeader from '@components/AdminHeader';

const AdminLayout = () => {
  return (
    <div className="flex min-h-screen bg-background-light dark:bg-background-dark font-display text-[#111318]">
      <AdminSidebar />
      <main className="flex-1 ml-64 flex flex-col">
        <AdminHeader />
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
