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
        const cleaned = value.replace(/[^0-9]/g, "");
        if (!cleaned && value !== "") return;

        const char = cleaned.slice(-1);
        const newOtp = [...otp];
        newOtp[index] = char;
        setOtp(newOtp);

        if (char && index < otp.length - 1) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (
        e: React.KeyboardEvent<HTMLInputElement>,
        index: number
    ) => {
        if (e.key === "Backspace") {
            if (!otp[index] && index > 0) {
                const newOtp = [...otp];
                newOtp[index - 1] = "";
                setOtp(newOtp);
                inputRefs.current[index - 1]?.focus();
            } else if (otp[index]) {
                const newOtp = [...otp];
                newOtp[index] = "";
                setOtp(newOtp);
            }
        } else if (e.key === "ArrowLeft" && index > 0) {
            inputRefs.current[index - 1]?.focus();
        } else if (e.key === "ArrowRight" && index < otp.length - 1) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData("text").replace(/[^0-9]/g, "").slice(0, otp.length);
        if (!pastedData) return;

        const newOtp = [...otp];
        for (let i = 0; i < pastedData.length; i++) {
            newOtp[i] = pastedData[i];
        }
        setOtp(newOtp);

        const focusIndex = Math.min(pastedData.length, otp.length - 1);
        inputRefs.current[focusIndex]?.focus();
    };

    return (
        <div className="flex w-full items-center justify-center gap-1.5 xs:gap-2 sm:gap-2.5 md:gap-3 py-1">
            {otp.map((digit, index) => (
                <input
                    key={index}
                    ref={(el) => {
                        inputRefs.current[index] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    pattern="[0-9]*"
                    maxLength={1}
                    value={digit}
                    aria-label={`OTP Digit ${index + 1}`}
                    onChange={(e) => handleChange(e.target.value, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    onPaste={handlePaste}
                    className="h-11 w-9.5 min-w-0 sm:h-12 sm:w-11 md:h-13 md:w-12 rounded-lg border border-border bg-card/50 text-center text-lg sm:text-xl font-bold text-foreground transition focus:border-primary focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/25 shadow-xs"
                />
            ))}
        </div>
    );
};

export default OtpInput;