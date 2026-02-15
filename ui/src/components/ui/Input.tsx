import React from "react";
import styles from "./Input.module.css";
import clsx from "clsx";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, label, error, ...props }, ref) => {
        return (
            <div className={styles.wrapper}>
                <input
                    ref={ref}
                    className={clsx(styles.input, error && styles.errorInput, className)}
                    placeholder=" " /* Required for :placeholder-shown */
                    {...props}
                />
                {label && <label className={styles.label}>{label}</label>}
                {error && <span className={styles.errorMessage}>{error}</span>}
            </div>
        );
    }
);

Input.displayName = "Input";
