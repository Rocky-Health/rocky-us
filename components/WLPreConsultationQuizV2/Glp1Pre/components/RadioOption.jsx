const RadioOption = ({ label, value, selected, onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`relative flex items-center transition-all duration-200 ease-in-out rounded-lg cursor-pointer select-none w-auto
        ${
          selected
            ? "border-2 border-[#AE7E56] bg-white shadow-sm"
            : "border border-[rgba(56,49,44,0.15)] bg-white hover:border-[rgba(56,49,44,0.3)]"
        }`}
    >
      <div className="flex items-center w-full h-full px-3 py-[9px] rounded-lg text-[1.0625rem] font-normal leading-[1.3em]">
        <span className="inline-flex items-center gap-3">
          <span
            className={`flex items-center justify-center w-5 h-5 rounded-full border-2 transition-all duration-200
              ${
                selected
                  ? "border-[#AE7E56]"
                  : "border-[rgba(56,49,44,0.25)] bg-white"
              }`}
          >
            {selected && (
              <span className="w-2.5 h-2.5 rounded-full bg-[#AE7E56] block" />
            )}
          </span>
          <span className={`block min-w-[30px] font-normal text-black"}`}>
            {label}
          </span>
        </span>
      </div>
    </div>
  );
};

export default RadioOption;
