import { LuCircleUserRound } from "react-icons/lu";


export const publicRoutes = [
  {
    name: "Sobre nosotros",
    path: "https://www.pepqa.co/",
  },
  {
    name: "Iniciar sesión",
    path: "/login",
  },
  {
    name: "Registrarse",
    path: "/register",
  },
];

export const privateRoutes = [
  {
    name: (
      <div className="flex items-center space-x-2 bg-[#307254] rounded-md text-slate-300 px-3 py-1 gap-x-1  transition-all duration-150 hover:text-[#ffff] hover:bg-[#6bb24d] hover:brightness-100 hover:cursor-pointer">
        <LuCircleUserRound className="w-5 h-5 text-[white]" />
        <span className="font-medium text-[white]">Perfil</span>
      </div>
    ),
    path: "/profile",
  },
];
