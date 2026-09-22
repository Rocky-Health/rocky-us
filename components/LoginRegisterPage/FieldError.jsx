"use client";

// Shared error red used across the login/register forms for the field label,
// the input border, and the message text so an errored field reads as one piece.
export const ERROR_COLOR = "#E5484D";

// Input classes. On error we swap the border to a medium red box outline; the
// normal (non-error) border is left unchanged. Focus styles are preserved.
export const fieldInputClass = (hasError) =>
  `block w-[100%] rounded-[8px] h-[40px] text-base m-auto border px-4 focus:outline focus:outline-2 focus:outline-black focus:ring-0 focus:border-transparent ${
    hasError ? "border-[#E5484D]" : "border-gray-500"
  }`;

// Label classes: the label turns red when its field is in error.
export const fieldLabelClass = (hasError) => (hasError ? "text-[#E5484D]" : "");

/**
 * Inline form-field error message with a permanently reserved one-line slot.
 *
 * The wrapper is always rendered (even with no message) so toggling an error
 * on/off never changes the field's height and never pushes sibling fields or
 * the two-column name row out of alignment. When present the message is small,
 * regular-weight red text sitting tight under the input; when absent the slot
 * is empty but keeps its height.
 *
 * Props:
 *   message   - the error string (falsy = empty reserved slot)
 *   className - extra classes for the wrapper (spacing tweaks per form)
 */
const FieldError = ({ message, className = "" }) => (
  <div
    className={`min-h-[15px] w-full leading-[15px] text-[12px] font-normal text-[#E5484D] ${className}`}
    aria-live="polite"
  >
    {message || null}
  </div>
);

export default FieldError;
