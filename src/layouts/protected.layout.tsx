import { useUser } from "@clerk/clerk-react";
import { Navigate, Outlet } from "react-router";

export default function ProtectedLayout() {
  const { isLoaded, isSignedIn } = useUser();

  if (!isLoaded) {
    return null; // Or a loading spinner
  }

  if (!isSignedIn) {
    return <Navigate to="/sign-in" />;
  }

  return <Outlet />;
}
