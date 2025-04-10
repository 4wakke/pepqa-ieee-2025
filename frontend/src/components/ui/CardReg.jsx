/* eslint-disable react/prop-types */
export function CardReg({ children, className }) {
  return (
    <div className={"bg-[#307254] bg-opacity-85 shadow-lg p-6 rounded-lg w-full max-w-5xl mx-auto  " + className}> {/* h-auto */}
      {children}
    </div>
  );
};

export default CardReg;