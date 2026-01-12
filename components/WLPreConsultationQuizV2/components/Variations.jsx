const Variations = ({ variations, selectedVariation, onSelectVariation }) => {
  return (
    <>
      <p className="mb-4 mt-4">
        
        <span className="font-semibold mt-6">Available Variations:</span>
      </p>
      <div className="flex justify-center items-center gap-4">
        {variations.map((variation) => (
          <div
            key={variation.id}
            className={`p-2 rounded-lg cursor-pointer w-full text-center ${
              selectedVariation && variation.id === selectedVariation.id
                ? "border border-[#A7885A] text-[#A7885A]"
                : "bg-gray-100 text-gray-700"
            }`}
            onClick={() => onSelectVariation(variation)}
          >
            {variation.name}
          </div>
        ))}
      </div>
    </>
  );
};

export default Variations;
