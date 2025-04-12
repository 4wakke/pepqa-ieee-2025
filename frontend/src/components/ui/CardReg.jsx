// eslint-disable-next-line no-unused-vars
import React, { forwardRef } from 'react';

/* eslint-disable react/prop-types */
export const CardReg = forwardRef(({ children, className }, ref) => {
  return (
    <div 
      ref={ref} // Pasamos el ref aquí
      className={`bg-[#307254] bg-opacity-85 shadow-lg p-6 rounded-lg w-full max-w-5xl mx-auto duration-500 ease-in opacity-0 animate-fadeIn ${className}`}
    >
      {children}
    </div>
  );
});

CardReg.displayName = 'CardReg';

export default CardReg;