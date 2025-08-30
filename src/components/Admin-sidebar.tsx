import { useLocation } from "react-router-dom";
import { Link } from "react-router-dom";
import { LayoutDashboard, FileText, Users, BookOpen, BarChart3, Settings, LogOut, GraduationCap, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils"; 

const navigation = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Papers Management", href: "/admin/papers", icon: FileText },
  { name: "User Management", href: "/admin/users", icon: Users },
  { name: "Contact Management", href: "/admin/contacts", icon: MessageSquare },
  { name: "Tasks Management", href: "/admin/tasks", icon: BookOpen },
  { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { name: "Settings", href: "/admin/settings", icon: Settings },
];

export function Sidebar() {
  const location = useLocation();
  const pathname = location.pathname;

  return (
    <div className="flex flex-col w-64 bg-white border-r border-gray-200">
      {/* Logo */}
      <div className="flex items-center px-6 py-4 border-b border-gray-200">
        <GraduationCap className="h-8 w-8 text-cyan-600" />
        <span className="ml-2 text-xl font-bold text-gray-900">Admin Panel</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                isActive
                  ? "bg-cyan-50 text-cyan-700 border-r-2 border-cyan-600"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <item.icon className="h-5 w-5 mr-3" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="border-t border-gray-200 p-4">
        <div className="flex items-center">
          <div className="h-10 w-10 rounded-full bg-cyan-100 flex items-center justify-center">
            <span className="text-sm font-medium text-cyan-700">AD</span>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-900">Admin User</p>
            <p className="text-xs text-gray-500">admin@example.com</p>
          </div>
        </div>
        <button className="mt-3 flex items-center w-full px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg">
          <LogOut className="h-4 w-4 mr-2" />
          Sign out
        </button>
      </div>
    </div>
  );
}