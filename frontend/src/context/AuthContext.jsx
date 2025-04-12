import { createContext, useState, useContext, useEffect } from "react";
import Cookie from "js-cookie";
import axios from "../api/axios";
const backRoute = import.meta.env.VITE_APP_BACK_ROUTE_PEPQA;

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// eslint-disable-next-line react/prop-types
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuth, setIsAuth] = useState(false);
  const [errors, setErrors] = useState(null);
  const [loading, setLoading] = useState(false); //! LOADING

  // const clearErrors = () => {
  //   setErrors(null);
  // }; //! LIMPIAR ERROR

  const signup = async (data) => {
    try {
      setUser(data);
      // setIsAuth(true); //!
      return data;
    } catch (error) {
      console.log(error);
      if (Array.isArray(error.response.data)) {
        return setErrors(error.response.data);
      }
      setErrors([error.response.data.message]);
    }
  };

  const signin = async (data) => {
    try {
      const response = await axios.post(`${backRoute}/api/signin`, data);
      console.log(response)
      if(response.data.success){
        setErrors({ message: response.data.message, success: true }); //?
      }else {
        // Si la respuesta es un error, lo gestionamos
        setErrors({ message: response.data.message, success: false }); //?
      }

      setUser(response.data.results);
      setIsAuth(true);
      localStorage.setItem("userEmail", data.email);
      // clearErrors(); //! LIMPIAR ERRORES
      return response.data, response.data.user ;
    } catch (error) {
          // Si ocurre un error con Axios, lo capturamos y mostramos el mensaje del backend //?
      console.log(error);
      if (error.response) {
        setErrors({ message: error.response.data.message || 'Error desconocido', success: false });
      } else {
        setErrors({ message: 'Error en la solicitud', success: false });
      }
    }
  };

  const signout = async () => {
    await axios.post(`${backRoute}/api/signout`);
    setUser(null);
    setIsAuth(false);
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userId");

  };

  useEffect(() => {
    setLoading(true); //! LOADING
    if (Cookie.get("token")) {
      axios
        .get(`${backRoute}/profile`)
        .then((res) => {
          setUser(res.data.results);
          setIsAuth(true);
        })
        .catch((err) => {
          console.log(err); //?
          setUser(null);
          setIsAuth(false);
        });
    }
    setLoading(false); //! LOADING
  }, []);

  useEffect(() => {
    //! LIMPIAR ERRORES CON MÓDULO
    const clean = setTimeout(() => {
      setErrors(null);
    }, 5000);

    return () => clearTimeout(clean);
  }, [errors]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuth,
        errors,
        signup,
        signin,
        signout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
