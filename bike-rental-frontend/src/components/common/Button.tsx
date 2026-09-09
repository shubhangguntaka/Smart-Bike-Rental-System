import Spinner from "./Spinner";

interface ButtonProps {
    title: string;
    type?: "button" | "submit" | "reset";
    loading?: boolean;
    disabled?: boolean;
    onClick?: () => void;
    className?: string;
}

const Button = ({
    title,
    type = "button",
    loading = false,
    disabled = false,
    onClick,
    className
}: ButtonProps) => {
    return (
        <button
            type={type}
            onClick={onClick}
            disabled={loading || disabled}
            className={`rounded-2xl bg-primary text-white font-semibold transition duration-300 hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60 flex items-center justify-center gap-2 shadow-md shadow-primary/30 ${className || "w-full py-2.5 text-sm uppercase tracking-[0.04em]"}`}
        >
            {loading && <Spinner />}
            {loading ? "Please Wait..." : title}
        </button>
    );
};

export default Button;