import React, { forwardRef, InputHTMLAttributes, useState } from "react"

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string
    error?: string
    helperText?: string
    variant?: "default" | "success" | "error"
    leftIcon?: React.ReactNode
    rightIcon?: React.ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    (
        {
            type = "text",
            label,
            error,
            helperText,
            variant = "default",
            leftIcon,
            rightIcon,
            className = "",
            disabled,
            ...props
        },
        ref
    ) => {
        const [isFocused, setIsFocused] = useState(false)

        const baseStyles =
            "w-full px-3 py-2 rounded-lg border outline-none transition-all duration-200"

        const variants = {
            default: "border-gray-300 focus:border-blue-500",
            success: "border-green-500 focus:border-green-600",
            error: "border-red-500 focus:border-red-600",
        }

        return (
            <div className="w-full">
                {label && (
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                        {label}
                    </label>
                )}

                <div
                    className={`flex items-center gap-2 ${baseStyles} ${variants[error ? "error" : variant]
                        } ${isFocused ? "ring-2 ring-blue-200" : ""} ${disabled ? "bg-gray-100 cursor-not-allowed" : ""
                        }`}
                >
                    {leftIcon && <span className="text-gray-500">{leftIcon}</span>}

                    <input
                        ref={ref}
                        type={type}
                        disabled={disabled}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        className={`flex-1 bg-transparent outline-none ${className}`}
                        {...props}
                    />

                    {rightIcon && <span className="text-gray-500">{rightIcon}</span>}
                </div>

                {error ? (
                    <p className="mt-1 text-sm text-red-500">{error}</p>
                ) : helperText ? (
                    <p className="mt-1 text-sm text-gray-500">{helperText}</p>
                ) : null}
            </div>
        )
    }
)

Input.displayName = "Input"