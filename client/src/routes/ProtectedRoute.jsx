import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;

  // Not logged in → redirect to login and save current URL
  if (!user) {
    return <Navigate to="/admin-login" />;
  } else {
    return children;
  }
};

export default ProtectedRoute;
