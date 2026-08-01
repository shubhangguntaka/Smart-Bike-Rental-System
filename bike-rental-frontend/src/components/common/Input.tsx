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

            <label className="block mb-2 font-medium">

                {label}

            </label>

            <input

                className="w-full border rounded-lg p-3"

                name={name}

                type={type}

                value={value}

                onChange={onChange}

            />

        </div>

    )

}

export default Input;