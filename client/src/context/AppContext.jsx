import axios from "axios";
import { createContext, useState, useEffect } from "react";
import { toast } from "react-toastify";

export const AppContext = createContext();

const AppContextProvider = (props) => {
  axios.defaults.withCredentials = true;

  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(false);
  // 1. Add a loading state (defaults to true)
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  const getUserData = async () => {
    try {
      const { data } = await axios.get(backendUrl + "/api/user/get-user-data");
      console.log("Current user data:", data);
      data.success ? setUserData(data.userData) : toast.error(data.message);
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  const getAuthState = async () => {
    try {
      const { data } = await axios.get(
        backendUrl + "/api/auth/is-authenticated",
      );
      if (data.success) {
        setIsLoggedIn(true);
        await getUserData();
      }
    } catch (error) {
      setIsLoggedIn(false);
      setUserData(false);
    } finally {
      // 2. Auth check is complete, turn off loading
      setIsAuthLoading(false);
    }
  };

  useEffect(() => {
    getAuthState();
  }, []);

  const appContextValue = {
    backendUrl,
    isLoggedIn,
    setIsLoggedIn,
    userData,
    setUserData,
    getUserData,
    isAuthLoading, // 3. Export the loading state
  };

  return (
    <AppContext.Provider value={appContextValue}>
      {props.children}
    </AppContext.Provider>
  );
};

export default AppContextProvider;
