import React from "react";

interface Props {

    label:string;

    name:string;

    value:string;

    onChange:(e:React.ChangeEvent<HTMLInputElement>)=>void;

    type?:string;

}

const Input = ({
    label,
    name,
    value,
    onChange,
    type = "text"
}: Props) => {
    return (
        <div>
            <label className="block mb-2 text-sm font-semibold text-foreground/80">
                {label}
            </label>
            <input
                className="w-full rounded-2xl border border-border bg-card/50 px-4 py-2.5 text-sm text-foreground transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                name={name}
                type={type}
                value={value}
                onChange={onChange}
            />
        </div>
    );
};

export default Input;