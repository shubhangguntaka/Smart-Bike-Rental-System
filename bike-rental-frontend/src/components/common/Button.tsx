import Spinner from "./Spinner";

interface ButtonProps {

    title: string;

    type?: "button" | "submit" | "reset";

    loading?: boolean;

    disabled?: boolean;

    onClick?: () => void;

}

const Button = ({

    title,

    type = "button",

    loading = false,

    disabled = false,

    onClick

}: ButtonProps) => {

    return (

        <button

            type={type}

            onClick={onClick}

            disabled={loading || disabled}

            className="
                w-full
                rounded-2xl
                bg-blue-600
                py-2.5
                text-sm
                font-semibold
                uppercase
                tracking-[0.04em]
                text-white
                transition
                duration-300
                hover:bg-blue-700
                disabled:cursor-not-allowed
                disabled:opacity-60
                flex
                items-center
                justify-center
                gap-2
                shadow-[0_18px_40px_rgba(59,130,246,0.22)]
            "

        >

            {loading && <Spinner />}

            {loading ? "Please Wait..." : title}

        </button>

    );

};

export default Button;