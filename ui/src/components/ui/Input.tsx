import React from "react";
import styles from "./Input.module.css";
import clsx from "clsx";
import { Eye, EyeOff } from "lucide-react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, label, error, type, ...props }, ref) => {
        const [showPassword, setShowPassword] = React.useState(false);
        const isPassword = type === "password";

        // Determine the actual input type to render
        const inputType = isPassword
            ? (showPassword ? "text" : "password")
            : type;

        return (
            <div className={styles.wrapper}>
                <input
                    ref={ref}
                    type={inputType}
                    className={clsx(
                        styles.input,
                        error && styles.errorInput,
                        isPassword && styles.hasToggle,
                        className
                    )}
                    placeholder=" " /* Required for :placeholder-shown */
                    {...props}
                />
                {label && <label className={styles.label}>{label}</label>}

                {isPassword && (
                    <button
                        type="button"
                        className={styles.toggleButton}
                        onClick={() => setShowPassword(!showPassword)}
                        tabIndex={-1} // Skip tab focus for better UX
                    >
                        {showPassword ? (
                            <EyeOff size={20} />
                        ) : (
                            <Eye size={20} />
                        )}
                    </button>
                )}

                {error && <span className={styles.errorMessage}>{error}</span>}
            </div>
        );
    }
);

Input.displayName = "Input";
