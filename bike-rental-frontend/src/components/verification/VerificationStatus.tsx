interface Props {
  success: boolean;
}

const VerificationStatus = ({ success }: Props) => {
  return (
    <div
      className={`mt-8 rounded-xl p-5 text-center text-lg font-bold ${
        success
          ? "bg-green-100 text-green-700"
          : "bg-red-100 text-red-700"
      }`}
    >
      {success
        ? "✅ Aadhaar Details Extracted Successfully"
        : "❌ Unable to Extract Aadhaar"}
    </div>
  );
};

export default VerificationStatus;