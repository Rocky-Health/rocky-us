import CustomImage from "../utils/CustomImage";

const ProductCard = ({ product }) => {
  const activeIngredient =
    product.activeIngredient || product.activeIngeredient;

  return (
    <div className="bg-white md:max-w-[370px] border border-gray-200 rounded-[16px] overflow-hidden w-full">
      {/* Image */}
      <div className="relative">
        <CustomImage
          src={product.image}
          width={370}
          height={280}
          alt={product.name}
          className="w-full object-cover"
        />
        {product.label && (
          <div className="absolute top-[12px] left-[12px] bg-white px-[10px] py-[5px] rounded-[6px]">
            <span className="text-black text-[11px] font-bold uppercase tracking-wider">
              {product.label}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="px-[20px] pt-[20px] pb-[24px]">
        {activeIngredient && (
          <p className="text-[14px] font-normal leading-[140%] tracking-normal text-black">
            {activeIngredient}
          </p>
        )}
        <h3 className="text-[36px] font-bold leading-[140%] tracking-[-0.02em] mt-[4px] text-black">
          {product.name}
        </h3>
        <p className="text-[14px] font-normal leading-[140%] tracking-normal mt-[4px] text-black">
          {product.description}
        </p>

        <div className="mt-[16px]">
          <p className="text-[14px] font-normal leading-[140%] text-black">
            Only
          </p>
          <div className="flex items-baseline gap-[12px] mt-[2px]">
            {product.hasSale && (
              <span className="text-[32px] font-bold line-through text-black/50">
                ${product.oldPrice}
              </span>
            )}
            <span className="text-[32px] font-bold text-black">
              ${product.price}
            </span>
            <span className="text-[16px] font-normal text-black">/mo</span>
          </div>
          {product.WLPrograme && (
            <p className="text-[14px] font-normal leading-[140%] text-black mt-[6px]">
              + $99/mo Program Membership
            </p>
          )}
        </div>

        <button className="w-full bg-black text-white text-[16px] font-medium py-[18px] rounded-full mt-[20px] flex items-center justify-center gap-[8px]">
          Select {product.name} →
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
