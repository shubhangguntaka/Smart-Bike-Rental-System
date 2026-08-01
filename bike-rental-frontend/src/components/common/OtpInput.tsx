import { useRef } from "react";

interface Props {

    otp: string[];

    setOtp: React.Dispatch<React.SetStateAction<string[]>>;

}

const OtpInput = ({

    otp,

    setOtp

}: Props) => {

    const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

    const handleChange = (

        value: string,

        index: number

    ) => {

        if (!/^[0-9]?$/.test(value)) return;

        const newOtp = [...otp];

        newOtp[index] = value;

        setOtp(newOtp);

        if (value && index < 5) {

            inputRefs.current[index + 1]?.focus();

        }

    };

    const handleKeyDown = (

        e: React.KeyboardEvent<HTMLInputElement>,

        index: number

    ) => {

        if (

            e.key === "Backspace" &&

            !otp[index] &&

            index > 0

        ) {

            inputRefs.current[index - 1]?.focus();

        }

    };

    return (

        <div className="flex justify-center gap-3">

            {

                otp.map((digit, index) => (

                    <input

                        key={index}

                        ref={(el) => {

                            inputRefs.current[index] = el;

                        }}

                        maxLength={1}

                        value={digit}

                        onChange={(e) =>

                            handleChange(

                                e.target.value,

                                index

                            )

                        }

                        onKeyDown={(e) =>

                            handleKeyDown(e, index)

                        }

                        className="h-14 w-14 rounded-lg border text-center text-xl font-semibold focus:border-blue-500 focus:outline-none"

                    />

                ))

            }

        </div>

    );

};

export default OtpInput;