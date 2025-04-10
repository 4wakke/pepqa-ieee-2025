import { Link } from "react-router-dom";

function HomePage() {
  return (
    <div className="home flex items-center justify-center px-4 min-h-[85vh] w-full mx-auto">
      <div className="bg-[#307254] bg-opacity-90 w-full max-w-[850px] rounded-2xl shadow-lg p-6 sm:p-8 flex flex-col items-center justify-center text-center">
        
        <h2 className="text-2xl sm:text-4xl font-bold text-white mb-4 sm:mb-6 leading-tight">
          IEEE Power Electronics and Power Quality Applications 2025
        </h2>

        <h3 className="italic text-[#e5ffcc] text-lg sm:text-xl mb-4">
          Modelando la Red Moderna y Resiliente
        </h3>

        <p className="text-white text-base sm:text-lg mb-4">
          Cartagena, Colombia | 4 al 6 de junio de 2025
        </p>

        <h3 className="italic text-[#e5ffcc] text-base sm:text-lg mb-6">
          Organizado por los capítulos estudiantiles IAS, PES y PELS
        </h3>

        <p className="text-white text-base sm:text-lg mb-3">
        Para completar tu inscripción al evento, haz clic en el siguiente botón:
        </p>

        <Link to="/register">
          <button className="bg-white text-[#307254] font-semibold py-3 px-7 rounded-md hover:bg-[#66994a] text-lg mb-2 hover:text-white transition-all duration-300 shadow-md hover:shadow-lg tracking-wide">
            Registrarse
          </button>
        </Link>

        <p className="text-white text-base sm:text-lg mb-2">
          ¿Ya tienes una cuenta?
        </p>

        <Link to="/login">
          <button className="bg-white text-[#307254] font-semibold py-2 sm:py-3 px-6 sm:px-7 rounded-md text-base sm:text-lg mb-4 hover:bg-[#66994a] hover:text-white transition-all duration-300 shadow-md hover:shadow-lg tracking-wide w-full sm:w-auto">
            Iniciar sesión
          </button>
        </Link>
      </div>
    </div>
  );
}

export default HomePage;
