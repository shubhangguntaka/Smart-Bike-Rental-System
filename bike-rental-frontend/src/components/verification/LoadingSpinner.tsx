interface LoadingSpinnerProps {
  message?: string;
}

const LoadingSpinner = ({
  message = "Extracting Aadhaar Details...",
}: LoadingSpinnerProps) => {
  return (
    <div className="flex flex-col items-center justify-center py-10">
      <div className="h-16 w-16 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>

      <p className="mt-5 text-gray-600 font-medium">
        {message}
      </p>
    </div>
  );
};

export default LoadingSpinner;