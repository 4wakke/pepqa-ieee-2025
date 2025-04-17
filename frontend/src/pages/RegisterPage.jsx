
// eslint-disable-next-line no-unused-vars
import { Input, Button, CardReg, Label, Container, SelectReg } from "../components/ui";
import { useForm } from "react-hook-form";
// eslint-disable-next-line no-unused-vars
import { Link, useNavigate } from "react-router-dom"; //?
import { useAuth} from "../context/AuthContext";
import { useEffect, useState, useRef  } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa"; 
import CountriesSelect from "../hooks/CountrySelect";
import ArticlesSpaces from "../hooks/ArticlesSpaces";
import ExchangeDollar from "../hooks/ExchangeRate";
import { toast } from "react-toastify";


const backRoute = import.meta.env.VITE_APP_BACK_ROUTE_PEPQA;

function RegisterPage() {

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm();

  // eslint-disable-next-line no-unused-vars
  const { signup, errors: signupErrors } = useAuth();
  const isTaxRequired = watch("isTaxRequired");
  const isCouponRequired = watch("isCouponRequired");
  const qtyArticles = watch("qtyArticles", 0);
  const isIeeeMember = watch("isIeeeMember");
  const participationType = watch("participationType"); 
  const [price, setPrice] = useState(""); 
  const [copPrice, setCopPrice] = useState(""); //*
  const [coupon, setCoupon] = useState(""); 
  const [showPassword, setShowPassword] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [userId, setUserId] = useState(null); //?
  const priceRef = useRef(null);
  const [dollarRate, setDollarRate] = useState(null); 
  const cardRef = useRef(null);

  useEffect(() => {
    if (cardRef.current) {
      cardRef.current.scrollIntoView({
        behavior: "smooth",  
        block: "center",     
      });
    }
  }, []); 

  useEffect(() => {
    if (isTaxRequired === "no") {
      setValue("taxAmount", "");
    }
  }, [isTaxRequired, setValue]);

  useEffect(() => {
    if (isCouponRequired === "no") {
      setValue("coupon", "");
    }
  }, [isCouponRequired, setValue]);

  useEffect(() => { 
      if (isIeeeMember === "no") {
        setValue("studentGroup", ""); 
        setValue("membershipNumber", ""); 
      }
    }, [isIeeeMember, setValue]);

  useEffect(() => { 
    if (participationType === "attendee") {
      setValue("qtyArticles", "");
      setValue("articles", []);
    }
  }, [participationType, setValue]); 

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

  const exchangeRate = ExchangeDollar(); 

  useEffect(() => { 
    setDollarRate(exchangeRate); 
  }, [exchangeRate]);   

  useEffect(() => {
    if (price && priceRef.current) {
      priceRef.current.scrollIntoView({
        behavior: "smooth", 
        block: "center", 
      });
    }
  }, [price]); 

  useEffect(() => {
    const filteredErrors = { ...errors };
    delete filteredErrors.membershipNumber;
  
    if (Object.keys(filteredErrors).length > 0) {
      toast.error("Debes completar todos los campos requeridos para registrar tu cuenta.", {
        className: "bg-red-600 text-white font-medium",
        progressClassName: "bg-red-300",
        autoClose: 5000,
      });
    }
  }, [errors]);


  const handlePayment = async () => {
    try {

      if (!dollarRate) { 
        //? console.error("No se pudo obtener la tasa de cambio del dólar.");
        return;
      } 

      //? console.log(dollarRate); 
      
      const processPaymentResp = await fetch(`${backRoute}/api/processPayment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: price,
          dollarRate: dollarRate, 
          description: `Pago conferencia Pepqa ${watch("name")} ${watch("lastName")}`,
          userId,
          coupon: coupon === "" ? null : coupon,
          copAmount: copPrice, //*
        }),
      });

      const processPaymentData = await processPaymentResp.json();
      //? console.log("Respuesta de proceso de pago:", processPaymentData);


      if (processPaymentData.success && processPaymentData.results.checkoutURL) {
        handleBackendResponse(processPaymentData);
        toast.success("Redirigiendo a la página de pago, espere unos segundos...", {
          className: "bg-green-600 text-white font-medium",
          progressClassName: "bg-green-300",
          autoClose: 5000,
        });
        setTimeout(() => {
          window.open(processPaymentData.results.checkoutURL, "_blank");
        }, 4000);

        toast.info(
          <div className="flex flex-col items-center text-center mt-2">
            <p className="text-gray-700 text-sm sm:text-base max-w-md leading-snug">Si no pudiste acceder a la página de pago debido a problemas con tu navegador, aquí te dejamos el enlace.</p>
            <div className="flex flex-col items-center space-y-2 mt-3">
              <span className="truncate max-w-[200px] bg-[#cce3d7]/85 px-3 py-1.5 rounded text-sm sm:text-base text-center">{processPaymentData.results.checkoutURL}</span>
              <button
                onClick={() => navigator.clipboard.writeText(processPaymentData.results.checkoutURL)}
                className="bg-[#307254] text-white px-4 py-1.5 rounded hover:brightness-110 transition-all"
              >
                Copiar
              </button>
            </div>
          </div>,
          {
            autoClose: false, 
            closeOnClick: false, 
            draggable: false, 
            className: "bg-blue-600 text-white font-medium p-4 rounded",
            progressClassName: "bg-blue-300",
          }
        );

        
      } else {
        //? console.error("Error al obtener la URL de pago", processPaymentData);
        handleBackendResponse(processPaymentData);
      }
    } catch (error) {
      handleBackendResponse(error); 
  }
  };

    const onSubmit = handleSubmit(async (data) => {
      try {

      data.isIeeeMember = data.isIeeeMember === "yes";
      data.studentGroup = data.studentGroup === "no" ? "" : data.studentGroup;
      data.taxAmount = data.isTaxRequired === "no" ? "0" : data.taxAmount;
      data.coupon = data.isCouponRequired === "no" ? null : data.coupon || null;


      if (data.participationType === "attendee") {
        data.qtyArticles = 0;  
        data.articles = [];  
      } else {
        let formattedArticles = [];
        if (data.qtyArticles > 0 && data.participationType === "author") {
          formattedArticles = data.articles?.slice(0, data.qtyArticles).map(article => {
            const formattedArticle = {};
            
            // Solo asigna la propiedad `sequence` si existe
            if (article?.sequence) {
              formattedArticle.sequence = article.sequence;
            }
      
            // Solo asigna la propiedad `pages` si existe y tiene un valor válido
            if (article?.pages) {
              formattedArticle.pages = parseInt(article.pages, 10);
            }
      
            return formattedArticle;
          }) || [];
        } else {
          formattedArticles = [{}];
        }
        data.articles = formattedArticles;
      }

      
      
      console.log("Datos enviados a signup:", data);
  
      const resp = await fetch(`${backRoute}/api/signup`, {
        method: "POST",
        body: JSON.stringify({ 
          ...data,
          articles: data.articles
        }),
        headers: { "Content-Type": "application/json" },
      });
  
      const dataSignup = await resp.json();
      //? console.log("Respuesta de signup:", dataSignup);

      if (dataSignup.success) {
      setIsRegistered(true);
      toast.info("Si hubo algún error en el registro, la información puede ser modificada en el perfil.", {
        className: "bg-green-600 text-white font-medium",
        progressClassName: "bg-green-300",
        autoClose: 12000,
      });
      handleBackendResponse(dataSignup);
      const userId = dataSignup.results[0]?.userId;
      setUserId(userId);
      setCoupon(data.coupon); 

      await signup(dataSignup);

      const formattedData = {
        occupation: data.occupation,
        isIeeeMember: data.isIeeeMember,  
        studentGroup: data.studentGroup,   
        participationType: data.participationType,
        attendanceType: data.attendanceType,
        qtyArticles: data.qtyArticles,
        articles: data.articles,
        userId,
        taxAmount: Number(data.taxAmount),
        coupon: data.coupon === "" ? null : data.coupon,
      };
  
      //? console.log("Datos enviados a payment:", formattedData);
        const response = await fetch(`${backRoute}/api/payment`, {
          method: "POST",
          body: JSON.stringify(formattedData), 
          headers: { "Content-Type": "application/json" },
        });

        const responseData = await response.json();
        //? console.log("Respuesta de payment:", responseData);

        if (responseData.success && responseData.results?.price !== undefined) {
          setPrice(responseData.results.price);
          setCopPrice(responseData.results.copPrice); //*
          handleBackendResponse(responseData);

          if (responseData.results.price === 0){ 
            // eslint-disable-next-line no-unused-vars
            const processPaymentResp = await fetch(`${backRoute}/api/processPayment`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                amount: price,
                dollarRate: dollarRate, 
                description: `Pago conferencia Pepqa ${watch("name")} ${watch("lastName")}`,
                userId,
                coupon: coupon === "" ? null : coupon,
                copAmount: copPrice, //*
              }),
            });
          }
        }
        
      } else {
        handleBackendResponse(dataSignup); 
    }
    } catch (error) {
      handleBackendResponse(error); 

    }
      
    });

  return (
    <Container className=" flex items-center justify-center min-h-screen">
      <CardReg ref={cardRef}>  
            
        <h3 className="text-3xl font-bold text-center mb-2 tracking-wide">Registro</h3>
        <form onSubmit={onSubmit} autoComplete="off">


          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 tracking-wide">
            
            <div> 
              <Label htmlFor="name">Nombre</Label>
              <Input type="text" placeholder="Ingresa tu nombre"
              {...register("name", { required: true })}/>
              {errors.name && (
              <p className="text-red-500 font-medium tracking-wide">El nombre es requerido</p>
              )}
            </div>

            <div>
              <Label htmlFor="lastName">Apellidos</Label>
              <Input type="text" placeholder="Ingresa tus apellidos"
              {...register("lastName", { required: true })}/>
              {errors.lastName && (
              <p className="text-red-500 font-medium">El apellido es requerido</p>
              )}
            </div>

            <div>
              <Label htmlFor="password">Contraseña</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Ingresa tu contraseña"
                    {...register("password", { required: true })}
                    />
                    {errors.password && (
                    <p className="text-red-500 font-medium">La contraseña es requerida</p>
                      )}      
                    <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-3 flex items-center text-gray-600"
                    >
                    {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
                    </button>
                </div>
            </div>

            <div>
              <Label htmlFor="country">País</Label>
              <CountriesSelect register={register} errors={errors} disabled={false} />
            </div>

            <div>
              <Label htmlFor="city">Ciudad</Label>
              <Input type="text" placeholder="Ingresa tu ciudad"
                {...register("city", { required: true })}/>
              {errors.city && (
              <p className="text-red-500 font-medium">La ciudad es requerida</p>
              )}
            </div>

            <div>
              <Label htmlFor="birthDate">Fecha de nacimiento</Label>
              <Input type="date"
              {...register("birthDate", { required: true })}/>
              {errors.birthDate && (
              <p className="text-red-500 font-medium">La fecha es requerida</p>
              )}
            </div>

            <div>
            <Label htmlFor="gender">Género</Label>
              <SelectReg 
                {...register("gender", { required: true })}>
                <option value="">Selecciona tu género</option>
                <option value="Male">Masculino</option>
                <option value="Female">Femenino</option>
                <option value="Other">Otro</option>
              </SelectReg>
              {errors.gender && (
              <p className="text-red-500 font-medium mt-2">El género es requerido</p>
              )}
            </div>

            <div>
              <Label htmlFor="docType">Tipo de documento</Label>
              <SelectReg
              {...register("docType", { required: true })}>
                <option value="">Selecciona el tipo de documento</option>
                <option value="civilRegistry">Registro civil</option>
                <option value="identityCard">Tarjeta de identidad</option>
                <option value="citizenshipIdCard">Cédula de ciudadanía</option>
                <option value="foreignResidentCard">Tarjeta de extranjería</option>
                <option value="passport">Pasaporte</option>
                <option value="specialStayPermit">Permiso especial de permanencia</option>
                <option value="nationalIdentityDocument">Documento Nacional de identidad</option>
                <option value="safeConductPass">Salvoconducto</option>
              </SelectReg>
              {errors.docType && (
              <p className="text-red-500 font-medium mt-2">El tipo de documento es requerido</p>
              )}
            </div>

            <div>
              <Label htmlFor="docNumber">
                Número de documento
              </Label>
              <Input type="text" placeholder="Ingresa el número de documento"
              {...register("docNumber", { required: true })}/>
              {errors.docNumber && (
              <p className="text-red-500 font-medium">El número de documento es requerido</p>
              )}
            </div>

            <div>
              <Label htmlFor="email">Correo</Label>
              <Input type="email" placeholder="Ingresa tu correo electrónico"
              {...register("email", { required: true })}
              />
              {errors.email && (
              <p className="text-red-500 font-medium mt-2">El correo es requerido</p>
              )}
            </div>

            <div>
              <Label htmlFor="phoneNumber">Número de teléfono</Label>
              <Input type="tel" placeholder="Ingresa tu número de teléfono"
              {...register("phoneNumber", { required: true })}/>
              {errors.phoneNumber && (
              <p className="text-red-500 font-medium">La número de teléfono es requerido</p>
              )}
            </div>

            <div>
              <Label htmlFor="address">Dirección</Label>
                  <Input type="text" placeholder="Ingresa tu dirección"
                  {...register("address", { required: true })}/>
                  {errors.address && (
                  <p className="text-red-500 font-medium">La dirección es requerida</p>
                  )}
            </div>

            <div>
            <Label htmlFor="affiliation">Afiliación</Label>
              <Input type="text" placeholder="Ingresa tu afiliación"
              {...register("affiliation", { required: true })}/>
              {errors.affiliation && (
              <p className="text-red-500 font-medium">La empresa afiliada es requerida</p>
              )}
            </div>

            <div>
              <Label htmlFor="attendanceType">Tipo de asistencia</Label>
              <SelectReg {...register("attendanceType", { required: true })}>
                <option value="">Selecciona el tipo de asistencia</option>
                <option value="event">Evento:  5 y 6 de Junio</option>
                <option value="tutorials">Tutorial: 4 de Junio</option>
                <option value="both">Ambos</option>
              </SelectReg>
              {errors.attendanceType && (
              <p className="text-red-500 font-medium mt-2">El tipo de asistencia es requerido</p>
              )}
            </div>

            <div>
            <Label htmlFor="occupation">Ocupación</Label>
              <SelectReg className="text-[#000000] w-full px-3 py-2 mt-2 border bg-white"
              {...register("occupation", { required: true })}>
                <option value="">Selecciona el tipo de ocupación</option>
                <option value="student">Estudiante</option>
                <option value="professional">Profesional</option>
              </SelectReg>
              {errors.occupation && (
              <p className="text-red-500 font-medium mt-2">La ocupación es requerida</p>
              )}
            </div>

            

          </div> {/* FIN GRID */}

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 tracking-wide mt-6">  {/* Inicio GRID 2 */}

          <div>
                <Label htmlFor="isTaxRequired">¿Requiere impuesto?</Label>
                <SelectReg {...register("isTaxRequired", { required: true })}>
                  <option value="">Selecciona</option>
                  <option value="yes">Sí</option>
                  <option value="no">No</option>
                </SelectReg>
                {errors.isTaxRequired && (
                  <p className="text-red-500 font-medium mt-2">Este campo es requerido</p>
                )}

              {isTaxRequired === "yes" && (
              <div className="mt-4">
                <Label htmlFor="taxAmount">Pago por impuesto</Label>
                <Input 
                  type="number" 
                  placeholder="Ingresa el valor por impuesto"
                  {...register("taxAmount", {
                    required: isTaxRequired === "yes" ? "Este campo es requerido" : false, 
                    min: { value: 1, message: "El valor mínimo es 1" },
                    max: { value: 100, message: "El valor máximo es 100" },
                    validate: value => Number.isInteger(Number(value)) || "Debe ser un número entero"
                  })}
                  onWheel={(e) => e.target.blur()}
                />
                {errors.taxAmount && (
                <p className="text-red-500 font-medium">{errors.taxAmount.message}</p>
                )}
              </div>
                )}
                <div className="mt-4">
                <Label htmlFor="isCouponRequired">¿Tiene código de descuento?</Label> {/* //* */}
                <SelectReg {...register("isCouponRequired", { required: true })}>
                  <option value="">Selecciona</option>
                  <option value="yes">Sí</option>
                  <option value="no">No</option>
                </SelectReg>
                {errors.isCouponRequired && (
                  <p className="text-red-500 font-medium mt-2">Este campo es requerido</p>
                )}

              {isCouponRequired === "yes" && (
              <div className="mt-4">
                <Label htmlFor="coupon">Cupón de descuento</Label>
                <Input 
                  type="text" 
                  placeholder="Ingresa el cupón de descuento"
                  {...register("coupon", {
                    required: isCouponRequired === "yes" ? "Este campo es requerido" : false,
                  })}
                  onWheel={(e) => e.target.blur()}
                />
                {errors.coupon && (
                  <p className="text-red-500 font-medium mt-2">Este campo es requerido</p>
                )}
              </div>
                )}
            </div>
            </div>

              <div>
              <Label htmlFor="participationType">Tipo de participación</Label>
              <SelectReg {...register("participationType", { required: true })}>
                <option value="">Selecciona el tipo de participación</option>
                <option value="author">Autor</option>
                <option value="attendee">Asistente</option>
              </SelectReg>
              {errors.participationType && (
              <p className="text-red-500 font-medium mt-2">El tipo de participación es requerido</p>
              )}

            {participationType === "author" && ( 
            <div>
              <div className="mt-4">
              <Label htmlFor="qtyArticles">Número de artículos</Label>
              </div>
              <Input type="number" placeholder="Ingresa el número de artículos"
              {...register("qtyArticles", { required: "Este campo es obligatorio", min: 1 })} onWheel={(e) => e.target.blur()}/>
              <div className="mt-4">
              {qtyArticles > 0 && (
                <ArticlesSpaces register={register} errors={errors} qtyArticles={qtyArticles} isRegister={true}/>)}
                {errors.qtyArticles && (
              <p className="text-red-500 font-medium">El número de artículos es requerido</p>
              )}
              </div>
            </div>
            )}
            </div>

            <div>
                <Label htmlFor="isIeeeMember">¿Eres miembro de IEEE?</Label>
                <SelectReg
                  {...register("isIeeeMember", { required: true })}
                >
                  <option value="">Selecciona</option>
                  <option value="yes">Sí</option>
                  <option value="no">No</option>
                </SelectReg>
                {errors.isIeeeMember && (
                  <p className="text-red-500 font-medium mt-2">Este campo es requerido</p>
                )}
  
                {isIeeeMember === "yes" && (
                  <>
                  <div className="mt-4">
                    <Label htmlFor="membershipNumber">Número de membresía IEEE</Label>
                  </div>
                    <Input 
                      type="text" 
                      placeholder="Ingresa tu número de membresía"
                      {...register("membershipNumber", { required: true })}
                    />
                    {errors.membershipNumber && (
                      <p className="text-red-500 font-medium pb-2">El número de membresía es requerido</p>
                    )}

                    <div className="mt-4">
                    <Label htmlFor="studentGroup">¿Pertenece a: IAS, PES o PELS?</Label>
                    <SelectReg {...register("studentGroup", { required: true })}>
                      <option value="">Selecciona</option>
                      <option value="ias">IAS</option>
                      <option value="pes">PES</option>
                      <option value="pels">PELS</option>
                      <option value="no">Ninguna de las opciones</option>
                    </SelectReg>
                    {errors.studentGroup && (
                      <p className="text-red-500 font-medium mt-2">Este campo es requerido</p>
                    )}
                    </div>
                  </>
                )}
              </div>


          </div> {/* FIN GRID 2 */}

          <div className="mt-4 text-center mb-6">
            <button className="bg-[#ffffff] hover:bg-[#66994a] text-[#307254] px-4 py-2 rounded font-semibold hover:text-[#fff] tracking-wide duration-300 shadow-md hover:shadow-lg" disabled={isRegistered} >Registrarse</button> 
          </div>
          {/* disabled={isRegistered} */}

          <div className="mt-4 text-center">
            <div className="flex justify-center tracking-wide"> 
            <p className="mr-4">¿Ya estás registrado?</p>
            <Link to="/login" className="font-bold">
              Iniciar sesión
            </Link>
            </div>
            
          </div>
        </form>

        <div ref={priceRef}>
            {isRegistered && price !== null && (
              <div className="mt-2 p-4 bg-[#04542d] text-white rounded-md shadow-md sm:w-[50%] md:w-[50%] lg:w-[40%] mx-auto duration-5000 ease-in opacity-0 animate-fadeIn">
                <div className="text-center">
                {price > 0 ? (
        <>
        <h4 className="text-xl font-bold">Cobro pendiente</h4>
        <p className="mt-2">El precio que debes pagar por el registro es:</p>
        <p className="text-white font-bold">$ {price} USD</p>
        <p className=" text-white font-bold ml-1">
          ( {Number(copPrice).toLocaleString("es-CO", {
            style: "currency",
            currency: "COP",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          })} COP )
        </p>
      </>
      ) : (
        <>
          <h4 className="text-xl font-bold">Estado de cobro</h4>
          <p className="mt-2">
            <span className="font-bold text-gray-50">
              {watch("name")}{" "}
            </span>
            <span className="font-bold text-gray-50">
              {watch("lastName")}
            </span>
            , no tienes pagos pendientes.
          </p>
        </>
      )}
    </div>
            
                {price > 0 && (
                <div className="mt-4 text-center">
                  <button onClick={handlePayment} disabled={!price} className="bg-[#ffffff] hover:bg-[#66994a] text-[#307254] px-4 py-2 rounded font-semibold hover:text-[#fff] tracking-wide duration-300 shadow-md hover:shadow-lg">
                    Pagar
                  </button>
                </div>
                )}
              </div>
            )}
          </div>
        
      </CardReg>
    </Container>
  );
}

export default RegisterPage;
