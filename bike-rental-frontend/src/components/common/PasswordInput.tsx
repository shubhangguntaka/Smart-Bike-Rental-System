import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    name: string;
    value: string;
    placeholder?: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    error?: string;
    required?: boolean;
    disabled?: boolean;
    className?: string;
}

const PasswordInput = ({
    label,
    name,
    value,
    placeholder,
    onChange,
    error,
    required,
    disabled,
    className = "",
    autoComplete = "current-password",
    ...rest
}: PasswordInputProps) => {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className="w-full">
            <label className="block mb-1.5 text-sm font-semibold text-foreground/80">
                {label}
                {required && <span className="text-destructive ml-1">*</span>}
            </label>
            <div className="relative w-full">
                <input
                    type={showPassword ? "text" : "password"}
                    name={name}
                    id={name}
                    value={value}
                    placeholder={placeholder}
                    onChange={onChange}
                    disabled={disabled}
                    required={required}
                    autoComplete={autoComplete}
                    className={`w-full rounded-2xl border border-border bg-card/50 px-4 py-2.5 pr-11 text-sm text-foreground transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
                    {...rest}
                />
                <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    tabIndex={0}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded-md"
                >
                    {showPassword ? (
                        <EyeOff size={18} aria-hidden="true" />
                    ) : (
                        <Eye size={18} aria-hidden="true" />
                    )}
                </button>
            </div>
            {error && <p className="mt-1 text-xs text-destructive break-words">{error}</p>}
        </div>
    );
};

export default PasswordInput;