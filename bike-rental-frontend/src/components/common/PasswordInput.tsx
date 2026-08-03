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
            <label className="text-sm font-semibold text-foreground/80">
                {label}
            </label>
            <div className="relative">
                <input
                    type={showPassword ? "text" : "password"}
                    name={name}
                    value={value}
                    placeholder={placeholder}
                    onChange={onChange}
                    className="w-full rounded-2xl border border-border bg-card/50 px-4 py-2.5 pr-12 text-sm text-foreground transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
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