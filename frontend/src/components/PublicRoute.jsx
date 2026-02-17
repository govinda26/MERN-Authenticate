import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

//children - here is the component to render admin page or user page etc

export default function PublicRoute({ children }) {
  const { auth, loading } = useAuth();

  if (loading) {
    //Show a loading state while checking auth
    return <div>Loading...</div>;
  }

  if (auth || auth?.accessToken) {
    //Redirect to home if already authenticated
    return <Navigate to="/" />;
  }

  //Render the public route if not authenticated
  return children;
}
