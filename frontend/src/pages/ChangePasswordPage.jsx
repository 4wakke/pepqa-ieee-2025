import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Input, Label, Container } from "../components/ui"; // Asumimos que estos componentes están definidos
import { useForm } from "react-hook-form";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { toast } from "react-toastify";



const backRoute = import.meta.env.VITE_APP_BACK_ROUTE_PEPQA;

function ChangePassword() {
  // useEffect(() => {
  //   document.body.classList.add("change-page");

  //   return () => {
  //     document.body.classList.remove("change-page");
  //   };
  // }, []);

  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const handleBackendResponse = (response) => {
    if (response.success) {
      toast.success(response.message, {
        className: "bg-green-600 text-white font-medium",
        progressClassName: "bg-green-300",
        autoClose: 5000,
      });
    } else {
      toast.error(response.message, {
        className: "bg-red-600 text-white font-medium",
        progressClassName: "bg-red-300",
        autoClose: 5000,
      });
    }
  };

  const userId = localStorage.getItem("userId");
  //? console.log(userId); 


  const onSubmit = async (data) => {
    setLoading(true);
    //? console.log("Datos enviados:", data);
    //? console.log("id está:", userId);

    try {
      const response = await fetch(`${backRoute}/api/changePassword`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          oldPassword: data.oldPassword,
          newPassword: data.newPassword,
        }),
      });
      const result = await response.json();
      if (response.ok) {
        
        handleBackendResponse(result)
        navigate("/profile");
      } else {
        handleBackendResponse(result)
      }
    } catch (error) {
      handleBackendResponse(error)
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="min-h-[85vh] min-w-[70vw] flex items-center justify-center">
      <div className="w-[420px] md:w-[500px] lg:w-[400px] h-auto bg-opacity-90">
      <Card>
        <h1 className="text-3xl font-bold text-center mb-6 tracking-wide">
          Cambiar<br />  Contraseña
        </h1>

        <form onSubmit={handleSubmit(onSubmit)}>
        <Label htmlFor="oldPassword">Contraseña actual</Label>
      <div className="relative">
        <Input
          type={showOldPassword ? "text" : "password"}
          placeholder="Ingrese su contraseña actual"
          {...register("oldPassword", {
            required: "La contraseña actual es requerida",
          })}
        />
        {errors.oldPassword && (
          <p className="text-red-500 font-medium">{errors.oldPassword.message}</p>
        )}
        <button
          type="button"
          onClick={() => setShowOldPassword(!showOldPassword)}
          className="absolute inset-y-0 right-3 flex items-center text-gray-600"
        >
          {showOldPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
        </button>
      </div>

      <Label htmlFor="newPassword">Nueva contraseña</Label>
      <div className="relative">
        <Input
          type={showNewPassword ? "text" : "password"}
          placeholder="Ingrese su nueva contraseña"
          {...register("newPassword", {
            required: "La nueva contraseña es requerida",
          })}
        />
        {errors.newPassword && (
          <p className="text-red-500 font-medium">{errors.newPassword.message}</p>
        )}
        <button
          type="button"
          onClick={() => setShowNewPassword(!showNewPassword)}
          className="absolute inset-y-0 right-3 flex items-center text-gray-600"
        >
          {showNewPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
        </button>
      </div>

          <div className="mt-6 flex items-center justify-center">
            <button
              type="submit"
              className="bg-[#ffffff] hover:bg-[#66994a] text-[#307254] px-4 py-2 rounded font-semibold hover:text-[#fff] tracking-wide duration-300 shadow-md hover:shadow-lg"
              disabled={loading}
            >
              {loading ? "Enviando..." : "Enviar cambios"}
            </button>
          </div>
        </form>
      </Card>
      </div>
    </Container>
  );
}

export default ChangePassword;