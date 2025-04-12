import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Input, Label, Container } from "../components/ui"; // Asumimos que estos componentes están definidos
import { useForm } from "react-hook-form";
// import { useEffect } from "react";
import { toast } from "react-toastify";


const backRoute = import.meta.env.VITE_APP_BACK_ROUTE_PEPQA;


function ForgotPassword() {

  // useEffect(() => {
  //     document.body.classList.add("forgot-page");
  
  //     return () => {
  //       document.body.classList.remove("forgot-page");
  //     };
  //   }, []);

  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);

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

  const onSubmit = async (data) => {
    setLoading(true);
    //? console.log("Datos enviados:", data);
    try {
      const response = await fetch(`${backRoute}/api/forgotPassword`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: data.email }),
      });

      const result = await response.json();

      if (response.ok) {
        handleBackendResponse(result)
        navigate("/");
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
    <Container className="min-h-[85vh] min-w-[70vw] flex items-center justify-center ">
      <div className="sd:w-[420px] md:w-[500px] lg:w-[450px] h-auto bg-opacity-90">
      <Card>
        <h1 className="text-4xl font-bold my-2 text-center mb-6 tracking-wide ">
          Recuperación<br />contraseña
        </h1>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Label htmlFor="email">Correo para recuperación</Label>
          <Input 
            type="email"
            placeholder="Ingrese correo para recuperación"
            {...register("email", {
              required: "El correo es requerido",
            })}
          />
          {errors.email && <p className="text-red-500 font-medium">{errors.email.message}</p>}

          <div className="mt-4 flex items-center justify-center">
            <button
              type="submit"
              className="bg-[#ffffff] hover:bg-[#66994a] text-[#307254] px-4 py-2 rounded font-semibold hover:text-[#fff] tracking-wide duration-300 shadow-md hover:shadow-lg my-2"
              disabled={loading}
            >
              {loading ? "Enviando..." : "Enviar correo"}
            </button>
          </div>
        </form>
      </Card>
      </div>
    </Container>
  );
}

export default ForgotPassword;
