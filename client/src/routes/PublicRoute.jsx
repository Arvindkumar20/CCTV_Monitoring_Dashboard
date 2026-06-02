import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
console.log(user)
  // If logged in → redirect based on role
  if (user) {
   

    if (
      user.userType === "school" &&
      ["admin", "teacher", "security", "principal"].includes(user.role)
    ) {
      return <Navigate to="/dashboard" />;
    }
  }

  // Not logged in → allow access
  return children;
};

export default PublicRoute;