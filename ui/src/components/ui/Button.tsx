import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import styles from "./Button.module.css";
import clsx from "clsx";

interface ButtonProps extends HTMLMotionProps<"button"> {
    variant?: "primary" | "secondary" | "destructive" | "ghost";
    size?: "sm" | "md" | "lg";
    isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "primary", size = "md", isLoading, children, ...props }, ref) => {
        return (
            <motion.button
                ref={ref}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={clsx(styles.button, styles[variant], styles[size], className)}
                disabled={isLoading || props.disabled}
                {...props}
            >
                {isLoading ? <span className={styles.loader}></span> : children}
            </motion.button>
        );
    }
);

Button.displayName = "Button";
