"use client";

import {
  Dropdown as HeroDropdown,
  DropdownTrigger as HeroDropdownTrigger,
  DropdownMenu as HeroDropdownMenu,
  DropdownItem as HeroDropdownItem,
  Button,
} from "@heroui/react";
import type {
  DropdownProps,
  DropdownTriggerProps,
  DropdownMenuProps,
  DropdownItemProps,
} from "@heroui/react";
import type { Key, ReactNode } from "react";

// 기본 컴포넌트 re-export
export function Dropdown(props: DropdownProps) {
  return <HeroDropdown {...props} />;
}

export function DropdownTrigger(props: DropdownTriggerProps) {
  return <HeroDropdownTrigger {...props} />;
}

export function DropdownMenu<T extends object>(props: DropdownMenuProps<T>) {
  return <HeroDropdownMenu {...props} />;
}

export function DropdownItem(props: DropdownItemProps) {
  return <HeroDropdownItem {...props} />;
}

// 커스텀 ViewModeDropdown 컴포넌트
export type ViewMode = "daily" | "weekly" | "monthly" | "yearly";

export interface ViewModeDropdownProps {
  value: ViewMode;
  onChange: (value: ViewMode) => void;
  label?: string;
}

const viewModeLabels: Record<ViewMode, string> = {
  daily: "일일",
  weekly: "주간",
  monthly: "월간",
  yearly: "연간",
};

export function ViewModeDropdown({
  value,
  onChange,
  label = "보기",
}: ViewModeDropdownProps) {
  const handleSelectionChange = (keys: "all" | Set<Key>) => {
    if (keys !== "all" && keys.size > 0) {
      const selectedKey = Array.from(keys)[0] as ViewMode;
      onChange(selectedKey);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {label && (
        <span className="text-sm font-medium text-zinc-600 dark:text-zinc-300">
          {label}:
        </span>
      )}
      <HeroDropdown>
        <HeroDropdownTrigger>
          <Button
            variant="bordered"
            className="min-w-[100px] justify-between"
            endContent={
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            }
          >
            {viewModeLabels[value]}
          </Button>
        </HeroDropdownTrigger>
        <HeroDropdownMenu
          aria-label="보기 모드 선택"
          selectionMode="single"
          selectedKeys={new Set([value])}
          onSelectionChange={handleSelectionChange}
        >
          <HeroDropdownItem key="daily">
            {viewModeLabels.daily}
          </HeroDropdownItem>
          <HeroDropdownItem key="weekly">
            {viewModeLabels.weekly}
          </HeroDropdownItem>
          <HeroDropdownItem key="monthly">
            {viewModeLabels.monthly}
          </HeroDropdownItem>
          <HeroDropdownItem key="yearly">
            {viewModeLabels.yearly}
          </HeroDropdownItem>
        </HeroDropdownMenu>
      </HeroDropdown>
    </div>
  );
}
