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
                rounded-lg
                bg-blue-600
                py-3
                font-semibold
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
            "

        >

            {loading && <Spinner />}

            {loading ? "Please Wait..." : title}

        </button>

    );

};

export default Button;