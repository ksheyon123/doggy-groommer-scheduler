"use client";

import { Select as HeroSelect, SelectItem } from "@heroui/react";

export interface SelectOption {
  id: number | string;
  label: string;
  value?: string | number;
  subtitle?: string;
  avatarColor?: string;
}

export interface SelectProps {
  options: SelectOption[];
  selectedId: number | string | null;
  onSelectionChange: (id: number | string | null) => void;
  placeholder?: string;
  label?: string;
  emptyMessage?: string;
  className?: string;
  isDisabled?: boolean;
  isRequired?: boolean;
  showAvatar?: boolean;
  defaultAvatarColor?: string;
}

export function Select({
  options,
  selectedId,
  onSelectionChange,
  placeholder = "선택하세요",
  label,
  emptyMessage = "항목이 없습니다",
  className = "",
  isDisabled = false,
  isRequired = false,
  showAvatar = false,
  defaultAvatarColor = "purple",
}: SelectProps) {
  const getAvatarColorClass = (color?: string) => {
    const avatarColor = color || defaultAvatarColor;
    const colorMap: Record<string, string> = {
      purple:
        "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400",
      blue: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
      green:
        "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400",
      red: "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400",
      yellow:
        "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400",
      orange:
        "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400",
    };
    return colorMap[avatarColor] || colorMap.purple;
  };

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
          {label}
          {isRequired && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <HeroSelect
        placeholder={placeholder}
        selectedKeys={selectedId ? [String(selectedId)] : []}
        onSelectionChange={(keys) => {
          const selected = Array.from(keys)[0] as string;
          if (selected === "empty") {
            onSelectionChange(null);
          } else {
            // 원래 타입으로 복원
            const originalItem = options.find(
              (item) => String(item.id) === selected
            );
            onSelectionChange(originalItem?.id || null);
          }
        }}
        classNames={{
          trigger:
            "bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700",
        }}
        isDisabled={isDisabled}
        isRequired={isRequired}
      >
        {options.length > 0 ? (
          options.map((option) => (
            <SelectItem key={String(option.id)} textValue={option.label}>
              {showAvatar ? (
                <div className="flex items-center gap-2">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${getAvatarColorClass(option.avatarColor)}`}
                  >
                    {option.label.charAt(0)}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm">{option.label}</span>
                    {option.subtitle && (
                      <span className="text-xs text-zinc-500">
                        {option.subtitle}
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                option.label
              )}
            </SelectItem>
          ))
        ) : (
          <SelectItem key="empty" textValue={emptyMessage}>
            {emptyMessage}
          </SelectItem>
        )}
      </HeroSelect>
    </div>
  );
}
