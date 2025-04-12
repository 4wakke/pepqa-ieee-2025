import { useEffect, useState, useRef } from "react";
import { toast } from "react-toastify";


const backRoute = import.meta.env.VITE_APP_BACK_ROUTE_PEPQA;

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

function AdminPage() {
  useEffect(() => {
    document.body.classList.add("admin-page");

    return () => {
      document.body.classList.remove("admin-page");
    };
  }, []);

  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [nameFilter, setNameFilter] = useState("");
  const [emailFilter, setEmailFilter] = useState("");
  const [startDateFilter, setStartDateFilter] = useState("");
  const [endDateFilter, setEndDateFilter] = useState("");
  const tableRef = useRef(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch(`${backRoute}/api/users`);
        const data = await response.json();

        if (data.success) {
          handleBackendResponse(data)
          setUsers(data.results);
          setFilteredUsers(data.results);
        }
      } catch (error) {
        handleBackendResponse(error)
        // console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    const filtered = users.filter((user) => {
      const nameMatch = user.name
        .toLowerCase()
        .includes(nameFilter.toLowerCase());
      const emailMatch = user.email
        .toLowerCase()
        .includes(emailFilter.toLowerCase());
  
      // Formatear las fechas
      const formattedStartDate = startDateFilter ? formatDate(startDateFilter) : null;
      const formattedEndDate = endDateFilter ? formatDate(endDateFilter) : null;
      const formattedUserDate = formatDate(user.created_at);
  
      // Comprobación de rango de fechas ajustada
      const isInDateRange =
        (formattedStartDate && formattedEndDate)
          ? formattedUserDate >= formattedStartDate && formattedUserDate <= formattedEndDate
          : (!formattedStartDate && !formattedEndDate) ||
            (formattedStartDate && formattedUserDate >= formattedStartDate) ||
            (formattedEndDate && formattedUserDate <= formattedEndDate);
  
      return nameMatch && emailMatch && isInDateRange;
    });
  
    setFilteredUsers(filtered);
  }, [nameFilter, emailFilter, users, startDateFilter, endDateFilter]);

  // Función para formatear las fechas
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toISOString().split("T")[0]; // Devuelve la fecha en formato "YYYY-MM-DD"
  };

  // Función para mostrar el tipo de documento
  const formatDocType = (docType) => {
    const docTypes = {
      identityCard: "Tarjeta de identidad",
      citizenshipIdCard: "Cédula de ciudadanía",
      foreignResidentCard: "Tarjeta de extranjería",
      passport: "Pasaporte",
      specialStayPermit: "Permiso especial de permanencia",
      nationalIdentityDocument: "Documento Nacional de identidad",
      safeConductPass: "Salvoconducto",
    };
    return docTypes[docType] || docType; // Retorna el tipo si está definido, si no, muestra el tipo original
  };

  // Función para mostrar el género
  const formatGender = (gender) => {
    if (gender === "Male") return "Masculino";
    if (gender === "Female") return "Feminino";
    if (gender === "Other") return "Otro";
    return gender;
  };

  // Función para mostrar la ocupación
  const formatOccupation = (occupation) => {
    if (occupation === "professional") return "Profesional";
    if (occupation === "student") return "Estudiante";
    return occupation;
  };

  // Función para mostrar "Sí" o "No" en los campos de membresía
  const formatMembership = (isMember) => {
    return isMember === 1 ? "Sí" : "No";
  };

  // Función para mostrar tipo de participación
  const formatParticipation = (participationType) => {
    if (participationType === "attendee") return "Asistente";
    if (participationType === "author") return "Autor";
    return participationType;
  };

  // Función para mostrar tipo de asistencia
  const formatAttendance = (attendanceType) => {
    if (attendanceType === "online") return "Virtual";
    if (attendanceType === "inPerson") return "En persona";
    return attendanceType;
  };

  // Función para mostrar número de membresía
  const formatMembershipNumber = (membershipNumber) => {
    return membershipNumber ? membershipNumber : "No";
  };

  const topScrollRef = useRef(null);
  const bottomScrollRef = useRef(null);

  useEffect(() => {
    const top = topScrollRef.current;
    const bottom = bottomScrollRef.current;

    if (top && bottom) {
      const syncScroll = (e) => {
        bottom.scrollLeft = e.target.scrollLeft;
      };
      const syncScrollBottom = (e) => {
        top.scrollLeft = e.target.scrollLeft;
      };

      top.addEventListener("scroll", syncScroll);
      bottom.addEventListener("scroll", syncScrollBottom);

      return () => {
        top.removeEventListener("scroll", syncScroll);
        bottom.removeEventListener("scroll", syncScrollBottom);
      };
    }
  }, []);

  const [scrollWidth, setScrollWidth] = useState("2000px");

  useEffect(() => {
    const filtered = users.filter((user) => {
      const nameMatch = user.name
        .toLowerCase()
        .includes(nameFilter.toLowerCase());
      const emailMatch = user.email
        .toLowerCase()
        .includes(emailFilter.toLowerCase());
      return nameMatch && emailMatch;
    });

    setFilteredUsers(filtered);
  }, [nameFilter, emailFilter, users]);

  useEffect(() => {
    if (tableRef.current) {
      setScrollWidth(`${tableRef.current.scrollWidth}px`);
    }
  }, [filteredUsers]);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-black text-center">
        Tabla de usuarios
      </h1>
      <div className="mb-4 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Filtro por nombre */}
        <div className="flex flex-col md:w-1/3">
          <label htmlFor="nameFilter" className="text-black font-semibold">
            Filtro por nombre
          </label>
          <input
            id="nameFilter"
            type="text"
            value={nameFilter}
            onChange={(e) => setNameFilter(e.target.value)}
            className="border border-gray-400 p-2 rounded-md text-black"
            placeholder="Buscar por nombre"
          />
        </div>

        {/* Filtro por correo */}
        <div className="flex flex-col md:w-1/3">
          <label htmlFor="emailFilter" className="text-black font-semibold">
            Filtro por correo
          </label>
          <input
            id="emailFilter"
            type="text"
            value={emailFilter}
            onChange={(e) => setEmailFilter(e.target.value)}
            className="border border-gray-400 p-2 rounded-md text-black"
            placeholder="Buscar por correo"
          />
        </div>

        {/* Filtros de fechas */}
        
        <div className="flex flex-col md:w-1/3 items-center mt-4 md:mt-0">
          <div className="flex flex-col mb-2 w-full">
            <label
              htmlFor="startDateFilter"
              className="text-black font-semibold"
            >
              Fecha de registro inicial
            </label>
            <input
              id="startDateFilter"
              type="date"
              value={startDateFilter}
              onChange={(e) => setStartDateFilter(e.target.value)}
              className="border border-gray-400 p-2 rounded-md text-black"
            />
          </div>

          <div className="flex flex-col mb-2 w-full">
            <label htmlFor="endDateFilter" className="text-black font-semibold">
              Fecha de registro final
            </label>
            <input
              id="endDateFilter"
              type="date"
              value={endDateFilter}
              onChange={(e) => setEndDateFilter(e.target.value)}
              className="border border-gray-400 p-2 rounded-md text-black"
            />
          </div>
        </div>
      </div>

      <div ref={topScrollRef} className="overflow-x-auto mb-2 h-6">
        <div style={{ width: scrollWidth, height: "1px" }}></div>
      </div>
      {/* cambios drasticos */}
      <div
        ref={bottomScrollRef}
        className="overflow-x-auto bg-white rounded-lg shadow-md"
      >
        <table
          ref={tableRef}
          className="min-w-full text-sm text-left text-gray-700"
        >
          <thead className="bg-[#d2e6dc] text-[#307254] text-sm font-semibold text-center">
            <tr>
              <th className="px-4 py-3 font-semibold">Nombre</th>
              <th className="px-4 py-3 font-semibold">Apellido</th>
              <th className="px-4 py-3 font-semibold">País</th>
              <th className="px-4 py-3 font-semibold">Ciudad</th>
              <th className="px-4 py-3 font-semibold">Dirección</th>
              <th className="px-4 py-3 font-semibold">Género</th>
              <th className="px-4 py-3 font-semibold">Fecha de nacimiento</th>
              <th className="px-4 py-3 font-semibold">Tipo de documento</th>
              <th className="px-4 py-3 font-semibold">Número de documento</th>
              <th className="px-4 py-3 font-semibold">Afiliación</th>
              <th className="px-4 py-3 font-semibold">Correo</th>
              <th className="px-4 py-3 font-semibold">Número telefónico</th>
              <th className="px-4 py-3 font-semibold">Ocupación</th>
              <th className="px-4 py-3 font-semibold">Miembro IEEE</th>
              <th className="px-4 py-3 font-semibold">Miembro TEMS</th>
              <th className="px-4 py-3 font-semibold">Número membresía</th>
              <th className="px-4 py-3 font-semibold">Tipo de participación</th>
              <th className="px-4 py-3 font-semibold">Tipo de asistencia</th>
              <th className="px-4 py-3 font-semibold">Cantidad de impuesto</th>
              <th className="px-4 py-3 font-semibold">Número de artículos</th>
              <th className="px-4 py-3 font-semibold">Fecha de registro</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 text-center">
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <tr
                  key={user.id}
                  className="hover:bg-gray-100"
                >
                  <td className="px-4 py-3">{user.name}</td>
                  <td className="px-4 py-3">{user.last_name}</td>
                  <td className="px-4 py-3">{user.country}</td>
                  <td className="px-4 py-3">{user.city}</td>
                  <td className="px-4 py-3">{user.address}</td>
                  <td className="px-4 py-3">
                    {formatGender(user.gender)}
                  </td>
                  <td className="px-4 py-3">
                    {formatDate(user.birth_date)}
                  </td>
                  <td className="px-4 py-3">
                    {formatDocType(user.doc_type)}
                  </td>
                  <td className="px-4 py-3">{user.doc_number}</td>
                  <td className="px-4 py-3">
                    {user.affiliation}
                  </td>
                  <td className="px-4 py-3">{user.email}</td>
                  <td className="px-4 py-3">
                    {user.phone_number}
                  </td>
                  <td className="px-4 py-3">
                    {formatOccupation(user.occupation)}
                  </td>
                  <td className="px-4 py-3">
                    {formatMembership(user.is_ieee_member)}
                  </td>
                  <td className="px-4 py-3">
                    {formatMembership(user.is_tems)}
                  </td>
                  <td className="px-4 py-3">
                    {formatMembershipNumber(user.membership_number)}
                  </td>
                  <td className="px-4 py-3">
                    {formatParticipation(user.participation_type)}
                  </td>
                  <td className="px-4 py-3">
                    {formatAttendance(user.attendance_type)}
                  </td>
                  <td className="px-4 py-3">{user.tax_amount}</td>
                  <td className="px-4 py-3">
                    {user.qty_articles}
                  </td>
                  <td className="px-4 py-3">
                    {formatDate(user.created_at)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="border border-black p-2 text-center">
                  No users found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminPage;
