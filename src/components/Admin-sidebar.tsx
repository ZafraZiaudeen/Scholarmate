import { useLocation } from "react-router-dom";
import { Link } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { LayoutDashboard, FileText, Users, BarChart3, GraduationCap, MessageSquare, Play, Home } from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Papers Management", href: "/admin/papers", icon: FileText },
  { name: "User Management", href: "/admin/users", icon: Users },
  { name: "Contact Management", href: "/admin/contacts", icon: MessageSquare },
  { name: "Videos Management", href: "/admin/videos", icon: Play },
  { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
];

export function Sidebar() {
  const location = useLocation();
  const pathname = location.pathname;
  const { user } = useUser();

  return (
    <div className="flex flex-col w-64 h-screen bg-white border-r border-gray-200">
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
          <img
            className="h-10 w-10 rounded-full"
            src={user?.imageUrl}
            alt="User profile"
          />
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-900">
              {user?.fullName || "Admin User"}
            </p>
            <p className="text-xs text-gray-500">
              {user?.primaryEmailAddress?.emailAddress || "admin@example.com"}
            </p>
          </div>
        </div>
        <Link
          to="/"
          className="mt-3 flex items-center w-full px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg"
        >
          <Home className="h-4 w-4 mr-2" />
          Return to Home
        </Link>
      </div>
    </div>
  );
}