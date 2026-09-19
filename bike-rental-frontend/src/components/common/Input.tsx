import React from "react";

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  error?: string;
}

const Input = ({
  label,
  name,
  value,
  onChange,
  type = "text",
  placeholder,
  disabled,
  required,
  className = "",
  error,
  ...rest
}: Props) => {
  return (
    <div className="w-full">
      <label htmlFor={name} className="block mb-1.5 text-sm font-semibold text-foreground/80">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </label>
      <input
        id={name}
        className={`w-full rounded-2xl border border-border bg-card/50 px-4 py-2.5 text-sm text-foreground transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        {...rest}
      />
      {error && <p className="mt-1 text-xs text-destructive break-words">{error}</p>}
    </div>
  );
};

export default Input;