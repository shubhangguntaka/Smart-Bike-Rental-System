interface LoaderProps {
  size?: number;
  text?: string;
  fullScreen?: boolean;
  className?: string;
}

const Loader = ({
  size = 40,
  text = "Loading...",
  fullScreen = false,
  className = "",
}: LoaderProps) => {
  return (
    <div
      className={`
        flex flex-col items-center justify-center gap-4
        ${fullScreen ? "min-h-screen" : "py-10"}
        ${className}
      `}
    >
      <div
        className="animate-spin rounded-full border-4 border-blue-600 border-t-transparent"
        style={{
          width: size,
          height: size,
        }}
      />

      {text && (
        <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
          {text}
        </p>
      )}
    </div>
  );
};

export default Loader;