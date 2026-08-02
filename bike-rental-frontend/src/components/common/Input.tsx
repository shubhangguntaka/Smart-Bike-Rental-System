import React from "react";

interface Props {

    label:string;

    name:string;

    value:string;

    onChange:(e:React.ChangeEvent<HTMLInputElement>)=>void;

    type?:string;

}

const Input=({

    label,

    name,

    value,

    onChange,

    type="text"

}:Props)=>{

    return(

        <div>

            <label className="block mb-2 text-sm font-semibold text-slate-700">

                {label}

            </label>

            <input

                className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"

                name={name}

                type={type}

                value={value}

                onChange={onChange}

            />

        </div>

    )

}

export default Input;