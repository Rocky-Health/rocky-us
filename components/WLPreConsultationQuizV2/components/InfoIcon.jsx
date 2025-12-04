import React from "react";

const InfoIcon = ({ infoContent }) => {
  if (!infoContent) return null;

  return (
    <div className="relative group">
      <div className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 cursor-help">
        <span className="text-sm font-medium">i</span>
      </div>

      {/* Tooltip */}
      <div className="absolute left-1/2 transform -translate-x-1/2 bottom-full mb-2 w-80 max-w-[calc(100vw-2rem)] bg-white border border-gray-200 rounded-lg shadow-lg p-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
        {/* Arrow */}
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-200"></div>

        {/* Content */}
        <p className="text-sm text-gray-700 mb-2">{infoContent.description}</p>
        <ul className="text-sm text-gray-600 space-y-1">
          {Object.entries(infoContent.details).map(([key, value]) => (
            <li key={key}>
              <strong>{key}:</strong> {value}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default InfoIcon;
