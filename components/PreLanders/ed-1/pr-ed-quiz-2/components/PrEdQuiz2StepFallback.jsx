/** Shown briefly while a lazy step chunk downloads (step change / first paint). */
export default function PrEdQuiz2StepFallback() {
  return (
    <div
      className="flex min-h-[45vh] w-full flex-col items-center justify-center gap-4 px-4"
      aria-busy="true"
      aria-label="Loading step"
    >
      <div
        className="h-9 w-9 animate-spin rounded-full border-2 border-[#AE7E56] border-t-transparent"
        aria-hidden
      />
    </div>
  );
}
