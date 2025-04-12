/* eslint-disable react/prop-types */
// src/components/CountriesSelect.jsx
// eslint-disable-next-line no-unused-vars
import React, { useEffect, useState } from "react";
import { SelectReg } from "../components/ui";
const backRoute = import.meta.env.VITE_APP_BACK_ROUTE_PEPQA;


const CountriesSelect = ({ register, errors, disabled, selectedCountry, onChange }) => {
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Llamada al endpoint REST Countries para obtener la lista de países
    const fetchCountries = async () => {
      try {
        const response = await fetch(`${backRoute}/api/country`);
        const data = await response.json();

        // Filtramos solo los nombres de los países
        // Verifica si la respuesta es exitosa y existe la propiedad "results"
        if (data.success && data.results) {
          // Extrae los nombres de los países de "results"
          const countryNames = data.results.map((country) => country.name);
          countryNames.sort((a, b) => a.localeCompare(b)); // Ordena alfabéticamente
          setCountries(countryNames);
        } else {
          console.error("Error: No se recibieron datos de países.");
        }
        setLoading(false);
      } catch (error) {
        console.error("Error al obtener los países:", error);
        setLoading(false);
      }
    };

    fetchCountries();
  }, []);

  return (
    <div className="mb-4">
      <label htmlFor="country">
      </label>
      <SelectReg
        id="country"
        {...register("country", { required: true })}
        disabled={disabled}
        value={selectedCountry}
        onChange={onChange}
      >
        <option value="">Selecciona un país</option>
        {loading ? (
          <option>Cargando...</option>
        ) : (
          countries.map((country, index) => (
            <option key={index} value={country}>
              {country}
            </option>
          ))
        )}
      </SelectReg>
      {errors.country && (
      <p className="text-red-500 font-medium mt-2">El país es requerido</p>
      )}
    </div>
  );
};

export default CountriesSelect;