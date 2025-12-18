"use client";

import { forwardRef } from "react";

export interface BackButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export const BackButton = forwardRef<HTMLButtonElement, BackButtonProps>(
  ({ className = "", ...props }, ref) => {
    return (
      <button
        ref={ref}
        type="button"
        className={`p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors ${className}`}
        {...props}
      >
        <svg
          className="w-5 h-5 text-zinc-600 dark:text-zinc-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>
    );
  }
);

BackButton.displayName = "BackButton";
