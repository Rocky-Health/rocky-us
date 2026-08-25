import CustomImage from "@/components/utils/CustomImage";

const ListWithIcons = ({ items }) => {
  return (
    <ul className="space-y-2 md:space-y-3 mb-6 md:mb-10">
      {items.map((item, index) => (
        <li key={item.text ?? index} className="flex items-center gap-2">
          {item.icon && (
            <div className="relative overflow-hidden min-h-[24px] h-[24px] min-w-[24px] w-[24px]">
              <CustomImage src={item.icon} alt={item.alt || "icon"} fill />
            </div>
          )}
          <span className="text-[14px] md:text-[16px] leading-[19.6px] md:leading-[24px] md:tracking-[-0.02em] font-[400]">
            {item.text}
          </span>
        </li>
      ))}
    </ul>
  );
};

export default ListWithIcons;
