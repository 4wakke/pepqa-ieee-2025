import { useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { useNavigate  } from "react-router-dom";
// eslint-disable-next-line no-unused-vars
import { Input, Button, CardReg, Label, Container, SelectReg } from "../components/ui";
import ExchangeDollar from "../hooks/ExchangeRate";
import CountriesSelect from "../hooks/CountrySelect";
import ArticlesSpaces from "../hooks/ArticlesSpaces";
import { toast } from "react-toastify";

const backRoute = import.meta.env.VITE_APP_BACK_ROUTE_PEPQA;

function ProfilePage() {

  const [isEditing, setIsEditing] = useState(false);

  const { 
    register, 
    handleSubmit, 
    setValue, 
    watch, 
    formState: { errors } 
  } = useForm();
  if (isEditing && errors.country ) {
    delete errors.country;
  }

  const navigate = useNavigate();
  const isTaxRequired = watch("isTaxRequired");
  const qtyArticles = watch("qtyArticles", 0);
  const isIeeeMember = watch("isIeeeMember");
  const participationType = watch("participationType"); 
  const [price, setPrice] = useState("");
  const [IsSave, setIsSave] = useState(false);
  const paymentTriggeredByEdit = useRef(false);
  const [userDetails, setUserDetails] = useState(null);
  const [dollarRate, setDollarRate] = useState(null); 
  const priceRef = useRef(null);
  const pendingPriceRef = useRef(null);
  const [pendingPrice, setPendingPrice] = useState(null);
  // eslint-disable-next-line no-unused-vars
  const [pendingUrl, setPendingUrl] = useState(null);

  const userEmail = localStorage.getItem("userEmail");


  useEffect(() => {
    if (isTaxRequired === "no") {
      setValue("taxAmount", "");
    }
  }, [isTaxRequired, setValue]);
  
  useEffect(() => { 
    if (isIeeeMember === "no") {
      setValue("studentGroup", ""); 
      setValue("membershipNumber", ""); 
    }
  }, [isIeeeMember, setValue]);

  useEffect(() => { 
    if (participationType === "attendee") {
      setValue("qtyArticles", 0);
      setValue("articles", []);
    }
  }, [participationType, setValue]); 

  useEffect(() => {
    if (price && priceRef.current) {
      priceRef.current.scrollIntoView({
        behavior: "smooth", 
        block: "center", 
      });
    }
  }, [price]); 

  useEffect(() => {
    if (pendingPrice && pendingPriceRef.current) {
      pendingPriceRef.current.scrollIntoView({
        behavior: "smooth", 
        block: "center", 
      });
    }
  }, [pendingPrice]); 

  const exchangeRate = ExchangeDollar(); 

  useEffect(() => { 
    setDollarRate(exchangeRate); 
  }, [exchangeRate]); 
  
  const handleChangePassword = () => {
    navigate("/profile/changepassword");
  };
  
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

  useEffect(() => {
    if (!userEmail || !exchangeRate) return;  
    
    const fetchUserDetails = async () => {
      
      //? console.log("Correo que se está usando:", userEmail);
      //? console.log("Valor del tipo de cambio (exchangeRate):", exchangeRate);

      toast.success(
        <div>
          <span style={{ color: '#307254', fontWeight: 'bold', fontSize: '18px' }}>
            Recuerda:{' '} 
          </span>
          <span style={{ color: '#000000', fontWeight: 'bold', fontSize: '16px' }}>
            Si tienes un pago pendiente del registro, haz click en  
          </span>
          <span style={{ color: '#d97af3', fontWeight: 'bold', fontSize: '17px' }}>
            {' '}Pago pendiente{' '}
          </span>
          <span style={{ color: '#000000', fontWeight: 'bold', fontSize: '16px' }}>
            para completar el registro.
          </span>
        </div>,
        {
          className: "bg-green-600 text-white font-medium border-2 border-green-800 p-4 rounded-lg shadow-lg",
          progressClassName: "bg-green-300",
          autoClose: 7000,
        }
      );
      
      try {
        const response = await fetch(`${backRoute}/api/userDetail?email=${encodeURIComponent(userEmail)}&exchangeRate=${exchangeRate}`);
        const data = await response.json();
        console.log("Datos recibidos del backend:", data.results) //!

        if (data.success) {
          let userData = {...data.results};
          handleBackendResponse(userData)

          if (userData.admin) { 
            toast.dismiss(); 
            navigate("/profile/admin");
          }
          
          localStorage.setItem("userId", userData.id);

        userData.isIeeeMember = userData.isIeeeMember === 1 ? "yes" : "no";

        if (userData.isIeeeMember === "yes") {
          if (userData.studentGroup === "") {
            userData.studentGroup = "no";
          }
        } else {
          userData.studentGroup = "";
        }

        userData.taxAmount = userData.isTaxRequired === "no" ? "0" : userData.taxAmount;

        if (userData.participationType === "attendee") {
          userData.qtyArticles = 0;  
          userData.articles = [];  
        } else {
          let formattedArticles = [];
          if (userData.qtyArticles > 0 && userData.participationType === "author") {
            formattedArticles = userData.articles?.slice(0, userData.qtyArticles).map(article => ({
              sequence: article?.sequence || "",
              pages: article?.pages ? parseInt(article.pages, 10) : ""
            })) || [];
          } else {
            formattedArticles = [{ sequence: "", pages: "" }];
          }
          userData.articles = formattedArticles;
        }

        setUserDetails(userData);
        
        if (userData.taxAmount > 0) {
          userData.isTaxRequired = "yes";  
        } else {
            userData.isTaxRequired = "no";
        }
        setUserDetails(userData);

          for (const key in userData) {
            if (userData[key]) {
              setValue(key, userData[key]);
            }
          }
        }
      } catch (error) {
        handleBackendResponse(error)
      }
    };

    fetchUserDetails();
  }, [setValue, userEmail, exchangeRate, navigate]);

  const handlePendingPayment = async () => {
    try {
      const userData = userDetails;
    
      const formattedPendingData = {
        occupation: userData.occupation,
        isIeeeMember: userData.isIeeeMember === 'yes',  
        studentGroup: userData.studentGroup,
        participationType: userData.participationType,
        attendanceType: userData.attendanceType,
        qtyArticles: userData.qtyArticles,
        articles: userData.articles,
        userId: userData.id,
        taxAmount: Number(userData.taxAmount)
      };

      //? console.log("Datos que envio a payment pendiente:", formattedPendingData)

      const paymentResponse = await fetch(`${backRoute}/api/payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formattedPendingData),
      });
  
      const paymentData = await paymentResponse.json();
  
      if (paymentData.success && paymentData.results?.price !== undefined) {
        //? console.log("Datos que recibo del payment:", paymentData)
        
        const priceValue = paymentData.results.price;
        setPendingPrice(priceValue);
        handleBackendResponse(paymentData);
      } else {
        setPendingPrice(0);
        setPendingUrl(null);
        handleBackendResponse(paymentData);
      }
    } catch (error) {
      //? console.error("Error en el pago pendiente:", error);
      handleBackendResponse(error);
    }
  };
  
  const handlePendingProcessPayment = async () => {
    try {
      if (pendingPrice > 0) {
        const userData = userDetails;
  
        const processResponse = await fetch(`${backRoute}/api/processPayment`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: pendingPrice,
            dollarRate: dollarRate,
            description: `Pago conferencia Pepqa ${userData.name} ${userData.lastName}`,
            userId: userData.id,
          }),
        });
  
        const processPendingPaymentData = await processResponse.json();
        //? console.log("Respuesta de proceso de pago:", processPendingPaymentData);
  
        if (
          processPendingPaymentData.success &&
          processPendingPaymentData.results.checkoutURL
          
        ) {
          setPendingUrl(processPendingPaymentData.results.checkoutURL);
          handleBackendResponse(processPendingPaymentData);
          toast.success("Redirigiendo a la página de pago, espere unos segundos...", {
            className: "bg-green-600 text-white font-medium",
            progressClassName: "bg-green-300",
            autoClose: 4000,
          });
  
          setTimeout(() => {
            window.open(processPendingPaymentData.results.checkoutURL, "_blank");
          }, 0);
          toast.dismiss(); 
          navigate("/");
        } else {
          //? console.error("Error al obtener la URL de pago", processPendingPaymentData);
          handleBackendResponse(processPendingPaymentData);
        }
      } else {
        toast.info("No tienes pagos pendientes para procesar.", {
          className: "bg-yellow-500 text-white font-medium",
          progressClassName: "bg-yellow-300",
          autoClose: 4000,
        });
      }
    } catch (error) {
      //? console.error("Error al procesar el pago pendiente:", error);
      handleBackendResponse(error);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    if (userDetails?.country) {
      setValue("country", userDetails.country, { shouldValidate: false, shouldTouch: false });
    }
  };

  const handleSave = async (data) => {
    setIsSave(true);

    let updatedData = { ...data };

    if (updatedData.isIeeeMember !== undefined) {
      updatedData.isIeeeMember = updatedData.isIeeeMember === "yes";
    }
    
    if (updatedData.isTaxRequired === "no") {
      updatedData.taxAmount = "0";  
    }

    updatedData.studentGroup = data.studentGroup === "no" ? "" : data.studentGroup;

    if (updatedData.qtyArticles && updatedData.qtyArticles > 0) {
      
      updatedData.articles = updatedData.articles
        .slice(0, updatedData.qtyArticles) 
        .filter(article => article.sequence && article.pages); 

    updatedData.articles = updatedData.articles.map(article => ({
      ...article,
      pages: typeof article.pages === 'string' ? parseInt(article.pages, 10) : article.pages,
    }));
    } else {
      updatedData.articles = []; 
    }

  if (updatedData.qtyArticles === 0) {
    updatedData.articles = [];
  }

    console.log("Datos que se van a enviar:", updatedData);

    if (!userDetails || !userDetails.id) {  
      //? console.error("ID de usuario no disponible");
      return;
    } 

    data.studentGroup = data.studentGroup === "" ? "no" : data.studentGroup;

    try {
      const response = await fetch(`${backRoute}/api/users/${userDetails.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
      });
      
      const result = await response.json();
      
      //? console.log("Resultado de la respuesta:", result); // Verifica la respuesta  del servidor
      if (result.success) {
        handleBackendResponse(result)
        setIsEditing(false);

        const formattedData = {
          occupation: data.occupation,
          isIeeeMember: data.isIeeeMember === 'yes', 
          studentGroup: data.studentGroup,
          participationType: data.participationType,
          attendanceType: data.attendanceType,
          qtyArticles: data.qtyArticles,
          articles: data.articles,
          userId: userDetails.id,
          taxAmount: Number(data.taxAmount)
        };

        paymentTriggeredByEdit.current = true;

        //? console.log("Respuesta de payment:", formattedData);

        const response = await fetch(`${backRoute}/api/payment`, {
          method: "POST",
          body: JSON.stringify(formattedData), 
          headers: { "Content-Type": "application/json" },
        });
        
        const responseData = await response.json();
        //? console.log("Respuesta de payment:", responseData);

        if (responseData.success && responseData.results?.price !== undefined) {
          setPendingPrice(null);
          if (paymentTriggeredByEdit.current) {
            setPrice(responseData.results.price);
          }
          handleBackendResponse(responseData);
        }
        paymentTriggeredByEdit.current = false;
      } 
      
    } catch (error) {
      handleBackendResponse(error)
    } 
  };

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
          userId: userDetails.id,
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
  

  if (!userDetails) {
    return <p>Cargando...</p>;
  }

  return (
    <div className="flex items-center justify-center ">
      <div className="bg-[#307254] bg-opacity-85 shadow-lg p-6 rounded-lg w-full max-w-5xl mx-auto ">
        <h3 className="text-3xl font-bold text-center mb-4 tracking-wide">Perfil de usuario</h3>
        <form onSubmit={handleSubmit(handleSave)} autoComplete="off">

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 tracking-wide"> {/* GRID */}

            <div>
            <Label htmlFor="name">Nombre</Label>
              <Input type="text" placeholder="Ingresa tu nombre"
              {...register("name", { required: true })} disabled={!isEditing} />
              {errors.name && <p className="text-red-500 font-bold">El nombre es requerido</p>} 
            </div>

            <div>
              <Label htmlFor="lastName">Apellidos</Label>
              <Input type="text" placeholder="Editar apellido"
              {...register("lastName", { required: true })} disabled={!isEditing}/>
              {errors.lastName && (
              <p className="text-red-500 font-bold">El apellido es requerido</p>
              )} 
            </div>

            <div>
              <Label htmlFor="country">País</Label>
              {isEditing ? (
                <CountriesSelect
                  register={register}
                  errors={errors}
                  disabled={!isEditing}
                  selectedCountry={watch("country")}
                  onChange={(e) => setValue("country", e.target.value)} 
                />
              ) : (
                <Input
                  type="text"
                  value={watch("country") || ""}
                  disabled
                />
              )}
            </div>

            <div>
              <Label htmlFor="city">Ciudad</Label>
              <Input type="text" placeholder="Ingresa tu ciudad"
                {...register("city", { required: true })} disabled={!isEditing}/>
              {errors.city && (
              <p className="text-red-500 font-bold">La ciudad es requerida</p>
              )} 
            </div>

            <div>
              <Label htmlFor="birthDate">Fecha de nacimiento</Label>
              <Input type="date" placeholder="Editar fecha de nacimiento" {...register("birthDate", { required: true })} disabled={!isEditing} />
              {errors.name && <p className="text-red-500 font-bold">El nombre es requerido</p>} 
            </div>

            <div>
              <Label htmlFor="gender">Género</Label>
                <SelectReg 
                  {...register("gender", { required: true })} disabled={!isEditing}>
                  <option value="">Selecciona tu género</option>
                  <option value="Male">Masculino</option>
                  <option value="Female">Femenino</option>
                  <option value="Other">Otro</option>
                </SelectReg>
                {errors.gender && (
                <p className="text-red-500 font-bold">El género es requerido</p>
                )} 
            </div>

            <div>
              <Label htmlFor="docType">Tipo de documento</Label>
              <SelectReg
              {...register("docType", { required: true })}disabled={!isEditing}>
                <option value="">Selecciona el tipo de documento</option>
                <option value="civilRegistry">Registro civil</option>
                <option value="identityCard">Tarjeta de identidad</option>
                <option value="citizenshipIdCard">Cédula de ciudadanía</option>
                <option value="foreignResidentCard">Tarjeta de extranjería</option>
                <option value="passport">Pasaporte</option>
                <option value="specialStayPermit">Permiso especial de permanencia</option>
                <option value="nationalIdentityDocument">Documento Nacional de identidad</option>
                <option value="safeConduct
                Pass">Salvoconducto</option>
              </SelectReg>
              {errors.docType && (
              <p className="text-red-500 font-bold">El tipo de documento es requerido</p>
              )} 
            </div>

            <div>
              <Label htmlFor="docNumber">
                Número de documento
              </Label>
              <Input type="text" placeholder="Editar número de documento"
              {...register("docNumber", { required: true })} disabled={!isEditing} />
              {errors.docNumber && (
              <p className="text-red-500 font-bold">El número de documento es requerido</p>
              )} 
            </div>

            <div>
              <Label htmlFor="email">Correo</Label>
              <Input type="email" placeholder="Editar correo electrónico"
              {...register("email", { required: true })}
              disabled={!isEditing} />
              {errors.email && (
              <p className="text-red-500 font-bold">El correo es requerido</p>
              )} 
            </div>

            <div>
              <Label htmlFor="phoneNumber">Número de teléfono</Label>
              <Input type="tel" placeholder="Ingresa tu número de teléfono"
              {...register("phoneNumber", { required: true })} disabled={!isEditing}/>
              {errors.phoneNumber && (
              <p className="text-red-500 font-medium">La número de teléfono es requerido</p>
              )} 
            </div>

            <div>
              <Label htmlFor="address">Dirección</Label>
                  <Input type="text" placeholder="Editar dirección"
                  {...register("address", { required: true })} disabled={!isEditing}/>
                  {errors.address && (
                  <p className="text-red-500 font-medium">La dirección es requerida</p>
                  )} 
            </div>

            <div>
              <Label htmlFor="affiliation">Afiliación</Label>
                <Input type="text" placeholder="Ingresa tu afiliación"
                {...register("affiliation", { required: true })}disabled={!isEditing}/>
                {errors.affiliation && (
                <p className="text-red-500 font-medium">La empresa afiliada es requerida</p>
                )} 
            </div>

            <div>
              <Label htmlFor="attendanceType">Tipo de asistencia</Label>
              <SelectReg {...register("attendanceType", { required: true })}disabled={!isEditing} >
              <option value="">Selecciona el tipo de asistencia</option>
                <option value="event">Evento</option>
                <option value="tutorial">Tutorial</option>
                <option value="both">Ambos</option>
              </SelectReg>
              {errors.attendanceType && (
              <p className="text-red-500 font-medium">El tipo de asistencia es requerido</p>
              )} 
            </div>
            
            <div>
              <Label htmlFor="participationType">Tipo de participación</Label>
              <SelectReg {...register("participationType", { required: true })} disabled={!isEditing}>
                <option value="">Selecciona el tipo de participación</option>
                <option value="author">Autor</option>
                <option value="attendee">Asistente</option>
              </SelectReg>
              {errors.participationType && (
              <p className="text-red-500 font-medium">El tipo de participación es requerido</p>
              )} 
            </div>

            <div>
            <Label htmlFor="occupation">Ocupación</Label>
              <SelectReg className="text-[#000000] w-full px-3 py-2 mt-2 border bg-white"
              {...register("occupation", { required: true })}disabled={!isEditing}>
                <option value="">Selecciona el tipo de ocupación</option>
                <option value="student">Estudiante</option>
                <option value="professional">Profesional</option>
              </SelectReg>
              {errors.birthDate && (
              <p className="text-red-500 font-medium">La ocupación es requerida</p>
              )} 
            </div>

            <div>
            <Label htmlFor="isIeeeMember">¿Eres miembro de IEEE?</Label>
                <SelectReg
                  {...register("isIeeeMember", { required: true })} disabled={!isEditing}
                >
                  <option value="">Selecciona</option>
                  <option value="yes">Sí</option>
                  <option value="no">No</option>
                </SelectReg>
                {errors.isIeeeMember && (
                  <p className="text-red-500 font-medium">Este campo es requerido</p>
                )}
  
                {isIeeeMember === "yes" && (
                  <>
                  <div className="mt-2">
                  <Label htmlFor="membershipNumber">Número de membresía IEEE</Label>
                  </div>
                    <Input 
                      type="text" 
                      placeholder="Ingresa tu número de membresía"
                      {...register("membershipNumber", { required: true })} disabled={!isEditing}
                    />
                    {errors.membershipNumber && (
                      <p className="text-red-500 font-medium">El número de membresía IEEE es requerido</p>
                    )}
  
                    <Label htmlFor="studentGroup">¿Pertenece a: IAS, PES o PELS?</Label>
                    <SelectReg {...register("studentGroup", { required: true })} disabled={!isEditing}>
                      <option value="">Selecciona</option>
                      <option value="ias">IAS</option>
                      <option value="pes">PES</option>
                      <option value="pels">PELS</option>
                      <option value="no">Ninguna de las opciones</option>
                    </SelectReg>
                    {errors.studentGroup && (
                      <p className="text-red-500 font-medium">Este campo es requerido</p>
                    )}
                  </>
                )}
            </div>

            <div>
            {participationType === "author" && ( 
            <div >
              <Label htmlFor="qtyArticles">Número de artículos</Label>
              <Input type="number" placeholder="Ingresa el número de artículos"
              {...register("qtyArticles", { required: "Este campo es obligatorio", min: 0 })} onWheel={(e) => e.target.blur()} disabled={!isEditing}/>
              {qtyArticles > 0 && (
                <ArticlesSpaces register={register} errors={errors} qtyArticles={qtyArticles} isEditing={isEditing} />)}
                {errors.qtyArticles && (
              <p className="text-red-500 font-medium">El número de artículos es requerido</p>
              )}
            </div>
            )} 
            </div>

            <div>
            <Label htmlFor="isTaxRequired">¿Requiere impuesto?</Label>
              <SelectReg {...register("isTaxRequired", { required: true })} disabled={!isEditing}>
                <option value="">Selecciona</option>
                <option value="yes">Sí</option>
                <option value="no">No</option>
              </SelectReg>
              {errors.isTaxRequired && <p className="text-red-500 font-medium">Este campo es requerido</p>}

              {isTaxRequired === "yes" && (
              <div className="mt-2">
                <Label htmlFor="taxAmount">Pago por impuesto</Label>
                <Input 
                  type="number" 
                  placeholder="Ingresa el valor por impuesto"
                  {...register("taxAmount", {
                    required: isTaxRequired === "yes" ? "Este campo es requerido" : false, 
                    min: { value: 1, message: "El valor mínimo es 1" },
                    max: { value: 100, message: "El valor máximo es 100" },
                    validate: value => Number.isInteger(Number(value)) || "Debe ser un número entero"
                  })} disabled={!isEditing}
                  onWheel={(e) => e.target.blur()}
                />
                {errors.taxAmount && (
                <p className="text-red-500 font-medium">{errors.taxAmount.message}</p>
                )}
              </div>
            )}
            </div>

          </div> {/* FIN GRID */}

          <div className=" flex justify-center space-x-4 mt-4">
            <div>
              {isEditing ? (
                <button type="submit" className="bg-[#ffffff] hover:bg-[#66994a] text-[#307254] px-4 py-2 rounded font-semibold hover:text-[#fff] tracking-wide duration-300 shadow-md hover:shadow-lg">Guardar</button>
              ) : (
                <button type="button" onClick={handleEdit} className="bg-[#ffffff] hover:bg-[#66994a] text-[#307254] px-4 py-2 rounded font-semibold hover:text-[#fff] tracking-wide duration-300 shadow-md hover:shadow-lg ">Editar</button>
              )}
              </div>
              <div>
                <button type="button" onClick={handleChangePassword} className="bg-[#ffffff] hover:bg-[#66994a] text-[#307254] px-4 py-2 rounded font-semibold hover:text-[#fff] tracking-wide duration-300 shadow-md hover:shadow-lg">
                    Cambiar Contraseña
                </button>
              </div>
              <div>
              {!isEditing && !IsSave && (
              <div>
                <button type="button" onClick={handlePendingPayment} className="bg-[#ffffff] hover:bg-[#b468b3] text-[#b468b3] px-4 py-2 rounded font-semibold hover:text-[#fff] tracking-wide duration-300 shadow-md hover:shadow-lg">
                  Pago pendiente
                </button>
              </div>
            )}
              </div>
          </div>
          <div ref={pendingPriceRef}>
          {!isEditing && pendingPrice !== null && (
          <div className="mt-4 p-4 bg-[#04542d] text-white rounded-md shadow-md sm:w-[50%] md:w-[50%] lg:w-[40%] mx-auto">
            <div className="text-center">
              <h4 className="text-xl font-bold">Cobro pendiente</h4>
              <p className="mt-2">
                {pendingPrice > 0
                  ? <>
                  <span className="font-bold text-gray-50">
                    {userDetails.name}{" "}
                  </span> 
                  <span className="font-bold text-gray-50">
                    {userDetails.lastName}
                  </span>, debes pagar 
                  <span className="text-white font-bold ">
                    {" "}{pendingPrice}$ USD
                  </span> para completar el registro.
                </>
                  : <>
                  <span className="font-bold text-gray-50">
                    {userDetails.name}{" "}
                  </span> 
                  <span className="font-bold text-gray-50">
                    {userDetails.lastName}
                  </span>, no tienes pagos pendientes.
                </>
            }
              </p>
                
              {pendingPrice > 0 && (
                <div className="mt-4 text-center">
                <button onClick={handlePendingProcessPayment} disabled={!pendingPrice} className="bg-[#ffffff] hover:bg-[#66994a] text-[#307254] px-4 py-2 rounded font-semibold hover:text-[#fff] tracking-wide duration-300 shadow-md hover:shadow-lg">
                  Pagar
                </button>
              </div>
              )}
            </div>
          </div>
            )}
          </div>
          <div ref={priceRef}>
              {IsSave && price > 0 && pendingPrice === null && (
              <div className="mt-4 p-4 bg-[#04542d] text-white rounded-md shadow-md sm:w-[50%] md:w-[50%] lg:w-[40%] mx-auto">
                <div className="text-center">
                  <h4 className="text-xl font-bold">Nuevo cobro</h4>
                  <p className="mt-2">
                    {price > 0
                    ? <>
                    <span className="font-bold text-gray-50">
                      {userDetails.name}{" "}
                    </span> 
                    <span className="font-bold text-gray-50">
                      {userDetails.lastName}
                    </span>, usted debe 
                    <span className="text-white font-bold ">
                      {" "}{price}$ USD
                    </span> por los cambios realizados.
                  </>
                      : <>
                      <span className="font-bold text-gray-50">
                        {userDetails.name}{" "}
                      </span> 
                      <span className="font-bold text-gray-50">
                        {userDetails.lastName}
                      </span>, no tienes pagos pendientes.
                    </>
                }
                  </p>
                </div>
                    
                {price > 0 && IsSave && (
                  <div className="mt-4 text-center">
                    <button onClick={handlePayment} className="bg-[#ffffff] hover:bg-[#66994a] text-[#307254] px-4 py-2 rounded font-semibold hover:text-[#fff] tracking-wide duration-300 shadow-md hover:shadow-lg">
                      Pagar
                    </button>
                  </div>
                )}
                
              </div>
              )}
              </div>
        </form>
      </div>
    </div>
  );
}

export default ProfilePage;