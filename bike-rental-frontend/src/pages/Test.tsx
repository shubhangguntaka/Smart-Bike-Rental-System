import { useNavigate } from "react-router-dom";

function Test() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <button
          className="rounded-md bg-primary px-4 py-2 text-white"
          onClick={() => navigate("/verification")}
        >
          Go to Document Verification
        </button>
        <button
          className="rounded-md bg-primary px-4 py-2 text-white"
          onClick={() => navigate("/bike-verification")}
        >
          Go to Bike Document Verification
        </button>
      </div>
    </div>
  );
}

export default Test;