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

        <div className="space-y-1">

            <label className="text-sm font-semibold text-slate-700">

                {label}

            </label>

            <div className="relative">

                <input

                    type={showPassword ? "text" : "password"}

                    name={name}

                    value={value}

                    placeholder={placeholder}

                    onChange={onChange}

                    className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-2.5 pr-12 text-sm text-slate-900 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"

                />

                <button

                    type="button"

                    onClick={() => setShowPassword(!showPassword)}

                    className="absolute right-3 top-1/2 -translate-y-1/2"

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