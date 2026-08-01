import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

interface PasswordInputProps {

    label: string;

    name: string;

    value: string;

    placeholder?: string;

    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;

}

const PasswordInput = ({

    label,

    name,

    value,

    placeholder,

    onChange

}: PasswordInputProps) => {

    const [showPassword, setShowPassword] = useState(false);

    return (

        <div className="space-y-2">

            <label className="text-sm font-medium text-gray-700">

                {label}

            </label>

            <div className="relative">

                <input

                    type={showPassword ? "text" : "password"}

                    name={name}

                    value={value}

                    placeholder={placeholder}

                    onChange={onChange}

                    className="w-full rounded-lg border border-gray-300 px-4 py-3 pr-12 focus:border-blue-500 focus:outline-none"

                />

                <button

                    type="button"

                    onClick={() => setShowPassword(!showPassword)}

                    className="absolute right-4 top-1/2 -translate-y-1/2"

                >

                    {

                        showPassword ?

                            <EyeOff size={20} /> :

                            <Eye size={20} />

                    }

                </button>

            </div>

        </div>

    );

};

export default PasswordInput;