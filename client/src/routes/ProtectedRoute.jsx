import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading)
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
          <p className="text-sm text-gray-500">Loading, please wait...</p>
        </div>
      </div>
    );

  // Not logged in → redirect to login and save current URL
  if (!user) {
    return <Navigate to="/admin-login" />;
  } else {
    return children;
  }
};

export default ProtectedRoute;
