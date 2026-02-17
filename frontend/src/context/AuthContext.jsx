import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  //this stores access token or role
  const [auth, setAuth] = useState(null);

  //tells app to wait while we check if user is logged in
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await axios.get("/api/auth/refresh", {
          withCredentials: true,
        });
        setAuth({
          accessToken: res.data.data.accessToken,
          role: res.data.data.user.role,
        });
      } catch (error) {
        setAuth(null);
        console.error("Error while checking Auth: ", error);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ auth, setAuth, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
