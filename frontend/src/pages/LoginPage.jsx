import { Card, Input, Label, Container } from "../components/ui";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";

function LoginPage() {
  // useEffect(() => {
  //   document.body.classList.add("login-page");
  //   return () => {
  //     document.body.classList.remove("login-page");
  //   };
  // }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const { signin, errors: loginErrors } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = handleSubmit(async (data) => {
    const user = await signin(data);

    if (user) {
      navigate("/profile");
    }
  });

  return (
    <Container className="min-h-[85vh] min-w-[70vw] flex items-center justify-center ">
      <Card>
        {loginErrors && loginErrors.message && (
          <p
            className={`${
              loginErrors.success ? "text-green-500" : "text-red-500"
            } font-bold text-center my-4`}
          >
            {loginErrors.message}
          </p>
        )}

        <h1 className="text-4xl font-bold my-2 text-center mb-4 tracking-wide">Inicio sesión</h1>

        <form onSubmit={onSubmit}>
          <Label htmlFor="email">Correo electrónico</Label>
          <Input
            type="email"
            placeholder="Correo electrónico"
            {...register("email", {
              required: "El correo es requerido",
            })}
          />
          {errors.email && <p className="text-red-500 font-medium">{errors.email.message}</p>}

          <Label htmlFor="password">Contraseña</Label>
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Contraseña"
              {...register("password", {
                required: "La contraseña es requerida",
              })}
            />
            {errors.password && (
              <p className="text-red-500 font-bold">{errors.password.message}</p>
            )}
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-3 flex items-center text-gray-600 "
            >
              {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
            </button>
          </div>

          <div className="mt-4">
            <button className="bg-[#ffffff] hover:bg-[#66994a] text-[#307254] px-4 py-2 rounded font-semibold hover:text-[#fff] tracking-wide duration-300 shadow-md hover:shadow-lg">
              Iniciar sesión
            </button>
          </div>

          <div className="flex justify-between my-4 tracking-wide">
            <p className="mr-4">¿No te has registrado?</p>
            <Link to="/register" className="font-bold tracking-wide">
              <div className="flex flex-col justify-center items-center">
                <span>Regístrate</span>
              </div>
            </Link>
          </div>

          <div className="flex justify-center items-center my-4 tracking-wide">
            <p className="mr-4">¿Olvidaste tu contraseña?</p>
            <Link to="/forgotpassword" className="font-bold tracking-wide">
              <div className="flex flex-col justify-center items-center">
                <span>Recuperar</span>
              </div>
            </Link>
          </div>

          
        </form>
      </Card>
    </Container>
  );
}

export default LoginPage;