import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

//children - here is the component to render admin page or user page etc

export default function PrivateRoute({ children, allowedRoles }) {
  const { auth, loading } = useAuth();

  if (loading) {
    //Show a loading state while checking auth
    return <div>Loading...</div>;
  }

  if (!auth || !auth.accessToken) {
    //Redirect to login if not authenticated
    return <Navigate to="/login" />;
  }

  if (allowedRoles && !allowedRoles.includes(auth.role)) {
    //Redirect if role is not allowed
    return <Navigate to="/login" />;
  }

  //Render the protected component if authenticated
  return typeof children === "function" ? children(auth) : children;
}
