import { Link, useLocation } from "react-router-dom";
import { publicRoutes, privateRoutes } from "./navigation";
import { Container } from "../ui";
import { useAuth } from "../../context/AuthContext";
import { twMerge } from "tailwind-merge";
import { MdLogout } from "react-icons/md";
import { LuUserPen } from "react-icons/lu";

function Navbar() {
  const location = useLocation();
  const { isAuth, signout, user } = useAuth();
  // bg-[#cce3d7]/85
  return ( 
    <nav className=" bg-gradient-to-r from-[#ffffff]/90 to-[#a3cf8b]/80 shadow-md border-b-1 border-[#307254] "> 
      <Container className="flex justify-between py-3   ">
        <div className="flex-1 min-w-0 lg:ml-6 sm:ml-1 md:ml-6 ml-2 ">
          <div className="flex items-center">
            <Link to="./" className="flex items-center ">
              <img src="/assets/pepqa.png" alt="PEPQA Logo" className="h-10 sm:h-12 w-auto max-w-[120px] sm:max-w-none object-contain" />
              <h2 className="font-extrabold sm:text-1xl md:text-2xl lg:text-2xl  pl-4 text-[#66994a]"> PEPQA</h2>
            </Link>
            {/* <Link to="https://www.ieee.org/" className="hidden lg:block shrink-0 ">
              <img src="/assets/logo-ieee-verde.svg" alt="IEEE Logo" className="h-8 w-auto object-contain" />
            </Link> */}
          </div>
        </div>

        <div className="flex items-center justify-center md:gap-x-1 mx-10 sm:mx-1 px-2">
          <ul className="flex items-center justify-center gap-x-1 sm:gap-x-3 text-xs sm:text-sm">
            {isAuth ? (
              <>
                {privateRoutes.map(({ path, name, icon }) => (
                  <li key={path}>
                    <Link
                      to={path}
                      className={twMerge(
                        "text-slate-300 flex items-center py-1 rounded-md transition-all duration-150 hover:brightness-125",
                        location.pathname === path && ""
                      )}
                    >
                      {icon}
                      <span className="font-medium text-white hidden sm:block">{name}</span>
                    </Link>
                  </li>
                ))}

                <li
                  className="bg-[#307254] text-white flex items-center px-3 py-1 gap-x-1 rounded-md hover:cursor-pointer mx-2 transition-all duration-150 hover:text-[#ffff] hover:bg-[#6bb24d]"
                  onClick={() => {
                    signout();
                  }}
                >
                  <MdLogout className="w-5 h-5" />
                  <span className="hidden sm:block">Salir</span>
                </li>

                <li className="flex gap-x-1 items-center justify-center text-[#ffffff]">
                  <LuUserPen className="w-5 h-5 sm:inline" />
                  <span className="font-black">{user.name}</span>
                </li>
              </>
            ) : (
              publicRoutes.map(({ path, name }) => (
                <li
                className={twMerge(
                  "text-[#045c32] flex items-center px-3 py-2 font-semibold  rounded-md transition-colors duration-150  hover:bg-[#6bb24d] bg-[#ffff] shadow-sm hover:shadow-md hover:text-[#ffff]",
                  location.pathname === path && "bg-[#045c32] text-[#fff]"
                )}
                  key={path}
                >
                  <Link to={path}>
            <span className="hidden sm:inline">
              {name} 
            </span>
            {name === "Sobre nosotros" && <span className="sm:hidden jus">PEPQA</span>}
            {name === "Iniciar sesión" && <span className="sm:hidden">Ingresa</span>}
            {name === "Registrarse" && <span className="sm:hidden">Registro</span>}
          </Link>
                </li>
              ))
            )}
          </ul>
        </div>
      
      </Container>
    </nav>
  );
}

export default Navbar;