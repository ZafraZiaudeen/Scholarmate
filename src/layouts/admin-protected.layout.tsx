import { useUser } from "@clerk/clerk-react";
import { Navigate, Outlet } from "react-router-dom"; // Change to react-router-dom for consistency

const AdminProtectedLayout: React.FC = () => {
  const { isLoaded, user } = useUser();

  // If user data is not yet loaded, show a loading state
  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  // Log metadata for debugging
  console.log("User publicMetadata:", user?.publicMetadata);

  // Check if user exists and has admin role
  if (!user || user.publicMetadata?.role !== "admin") {
    console.log("Redirecting: User is not admin or not logged in", {
      userId: user?.id,
      role: user?.publicMetadata?.role,
    });
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default AdminProtectedLayout;