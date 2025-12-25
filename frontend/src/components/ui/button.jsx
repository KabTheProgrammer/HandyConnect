import React from "react";
import { cn } from "../../lib/utils";

const Button = ({
  children,
  className = "",
  variant = "primary",
  size = "md",
  fullWidth = false,
  disabled = false,
  ...props
}) => {
  const baseStyles =
    "inline-flex items-center justify-center font-medium rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2";

  const variants = {
    primary: "rounded-full bg-[#0099E6] text-white hover:bg-primary/90 focus:ring-primary",
    secondary:
      "bg-secondary text-primary hover:bg-secondary/80 focus:ring-secondary",
    outline:
      "border border-primary text-primary hover:bg-primary/10 focus:ring-primary",
    ghost:
      "text-primary hover:bg-primary/10 focus:ring-primary",
    danger:
      "bg-red-500 text-white hover:bg-red-600 focus:ring-red-500",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-5 py-3 text-lg",
  };

  return (
    <button
      className={cn(
        baseStyles,
        variants[variant],
        sizes[size],
        fullWidth ? "w-full" : "",
        disabled ? "opacity-50 cursor-not-allowed" : "",
        className
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
