"use client";

/**
 * OptionRenderer
 *
 * Renders a single answer option card for radio and multi-select questions.
 * The visual layout is controlled by the `layout` prop (set at question level).
 *
 * Layout presets:
 *   "centered"            → icon top, label centre, description below
 *   "horizontal"          → icon left · label + description stacked right
 *   "horizontal-reversed" → label + description left · icon right
 *   "text-only"           → label only (default, no icon required)
 *
 * Selected state: brand gold border (#A7885A).
 * Unselected state: light grey border that darkens slightly on hover.
 */
export default function OptionRenderer({
  option,
  layout = "text-only",
  selected,
  onSelect,
}) {
  const { value, label, description, icon } = option;

  const borderClass = selected
    ? "border-[#A7885A] bg-[#fdfaf6]"
    : "border-gray-200 hover:border-gray-300 bg-white";

  const renderInner = () => {
    switch (layout) {
      case "centered":
        return (
          <div className="flex flex-col items-center justify-center gap-2 py-1 text-center">
            {icon && (
              <img src={icon} alt="" className="w-10 h-10 object-contain" />
            )}
            <span className="font-medium text-[15px] leading-snug">
              {label}
            </span>
            {description && (
              <span className="text-xs text-gray-500 leading-snug">
                {description}
              </span>
            )}
          </div>
        );

      case "horizontal":
        return (
          <div className="flex items-center gap-4">
            {icon && (
              <img
                src={icon}
                alt=""
                className="w-9 h-9 flex-shrink-0 object-contain"
              />
            )}
            <div className="flex flex-col min-w-0">
              <span className="font-medium text-[15px] leading-snug">
                {label}
              </span>
              {description && (
                <span className="text-sm text-gray-500 mt-0.5 leading-snug">
                  {description}
                </span>
              )}
            </div>
          </div>
        );

      case "horizontal-reversed":
        return (
          <div className="flex items-center justify-between gap-4">
            <div className="flex flex-col min-w-0">
              <span className="font-medium text-[15px] leading-snug">
                {label}
              </span>
              {description && (
                <span className="text-sm text-gray-500 mt-0.5 leading-snug">
                  {description}
                </span>
              )}
            </div>
            {icon && (
              <img
                src={icon}
                alt=""
                className="w-9 h-9 flex-shrink-0 object-contain"
              />
            )}
          </div>
        );

      case "text-only":
      default:
        return (
          <div className="flex items-center justify-between gap-3">
            <span className="font-medium text-[15px] leading-snug">
              {label}
            </span>
            {description && (
              <span className="text-sm text-gray-400 leading-snug shrink-0">
                {description}
              </span>
            )}
          </div>
        );
    }
  };

  return (
    <button
      type="button"
      onClick={() => onSelect(value)}
      className={`w-full mb-3 px-5 py-4 border-2 rounded-[12px] text-left cursor-pointer transition-colors duration-150 ${borderClass}`}
    >
      {renderInner()}
    </button>
  );
}
