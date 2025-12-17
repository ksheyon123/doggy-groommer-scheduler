"use client";

import { forwardRef } from "react";

export interface CloseButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export const CloseButton = forwardRef<HTMLButtonElement, CloseButtonProps>(
  ({ className = "", ...props }, ref) => {
    return (
      <button
        ref={ref}
        type="button"
        className={`p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors ${className}`}
        {...props}
      >
        <svg
          className="w-5 h-5 text-zinc-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    );
  }
);

CloseButton.displayName = "CloseButton";
