import { sanitizeHtml } from "@/utils/sanitizeHtml";

const ListWithNumbers = ({ items, bgNumberGradient }) => {
  return (
    <ul className="space-y-2 md:space-y-3 mb-6 md:mb-10">
      {items.map((item, index) => (
        <li key={item ?? index} className="flex items-start gap-[8px]">
          <span
            className={` text-[18px] leading-[25.2px] font-[600] text-transparent bg-clip-text ${bgNumberGradient}`}
          >
            {String(index + 1).padStart(2, "0")}
          </span>
          <div
            className="text-[16px] leading-[22.4px] font-[400]"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(item) }}
          ></div>
        </li>
      ))}
    </ul>
  );
};

export default ListWithNumbers;
