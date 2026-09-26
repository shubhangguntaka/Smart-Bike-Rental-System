interface Props {
  success: boolean;
}

const VerificationStatus = ({ success }: Props) => {
  return (
    <div
      className={`mt-6 sm:mt-8 rounded-2xl p-4 sm:p-5 text-center text-sm sm:text-base font-bold border transition-colors ${
        success
          ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-600 dark:text-emerald-400"
          : "bg-destructive/10 border-destructive/25 text-destructive"
      }`}
    >
      {success
        ? "✓ Aadhaar Details Extracted Successfully"
        : "✕ Unable to Extract Aadhaar Details"}
    </div>
  );
};

export default VerificationStatus;