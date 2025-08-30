import { Sidebar } from "@/components/Admin-sidebar";
import { Outlet } from "react-router";

export default function AdminLayout() {
  return (
    <>
      <Sidebar />
      <Outlet />

    </>
  );
}
