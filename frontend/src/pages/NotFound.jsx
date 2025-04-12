import { Link } from "react-router-dom";
// import { useEffect } from "react";

function NotFound() {
  // useEffect(() => {
  //   document.body.classList.add("not-page");

  //   return () => {
  //     document.body.classList.remove("not-page");
  //   };
  // }, []);

  return (
    <div className="w-screen h-screen flex items-center justify-center">
  <div className="bg-[#307254] bg-opacity-85 w-full max-w-[450px] h-auto p-8 rounded-2xl shadow-2xl flex flex-col items-center justify-center text-center mb-16 duration-500 ease-in opacity-0 animate-fadeIn">
    <h1 className="text-5xl font-extrabold text-white mb-4">Página no encontrada</h1>
    <h3 className="text-3xl text-white mb-4 font-bold">Error 404</h3>
    <p className="text-white text-lg mb-6 font-medium">Para volver al inicio, presiona el botón:</p>
    <Link
      to="/"
      className="bg-[#ffffff] hover:bg-[#66994a] text-[#307254] px-4 py-2 rounded font-semibold hover:text-[#fff] tracking-wide duration-300 shadow-md hover:shadow-lg"
    >
      Inicio
    </Link>
  </div>
</div>
  );
}

export default NotFound;
