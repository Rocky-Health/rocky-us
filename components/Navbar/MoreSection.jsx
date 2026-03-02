"use client";
import Link from "next/link";

const MoreSection = ({ items }) => {
  return (
    <div className="mt-8">
      <h3 className="text-xs font-bold text-gray-600 mb-4 uppercase">
        Meet MyRocky
      </h3>
      <ul className="space-y-4">
        {items.map((item, index) => (
          <li key={index}>
            <Link href={item.link} className="text-sm text-black">
              {item.text}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MoreSection;
