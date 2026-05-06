/** Shown while the quiz shell chunk downloads (page-level dynamic import). */
export default function PrEdQuiz2FlowLoading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#F5F4EF] px-4">
      <div
        className="h-10 w-10 animate-spin rounded-full border-2 border-[#AE7E56] border-t-transparent"
        aria-hidden
      />
      <p className="poppins-font text-sm text-[#1c1b19]/65">Loading quiz…</p>
    </div>
  );
}
