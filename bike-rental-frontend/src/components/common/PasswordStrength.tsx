interface PasswordStrengthProps {
    password: string;
}

const PasswordStrength = ({ password }: PasswordStrengthProps) => {

    let strength = "";
    let color = "";

    if (password.length === 0) {
        return null;
    }

    if (password.length < 8) {
        strength = "Weak";
        color = "text-red-500";
    } else if (password.length < 12) {
        strength = "Medium";
        color = "text-yellow-500";
    } else {
        strength = "Strong";
        color = "text-green-500";
    }

    return (
        <p className={`mt-2 text-sm font-medium ${color}`}>
            Password Strength: {strength}
        </p>
    );
};

export default PasswordStrength;