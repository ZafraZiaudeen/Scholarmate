import { Sidebar } from "@/components/Admin-sidebar";
import { Outlet } from "react-router";

export default function AdminLayout() {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <Outlet />
      </div>
    </div>
  );
}
