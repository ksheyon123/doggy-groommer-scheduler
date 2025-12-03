"use client";

import { Select, SelectItem } from "@heroui/react";

export interface AvatarSelectItem {
  id: number | string;
  name: string;
  subtitle?: string;
  avatarColor?: string;
}

export interface AvatarSelectProps {
  items: AvatarSelectItem[];
  selectedId: number | string | null;
  onSelectionChange: (id: number | string | null) => void;
  placeholder?: string;
  label?: string;
  emptyMessage?: string;
  className?: string;
  defaultAvatarColor?: string;
}

export function AvatarSelect({
  items,
  selectedId,
  onSelectionChange,
  placeholder = "선택하세요",
  label,
  emptyMessage = "항목이 없습니다",
  className = "",
  defaultAvatarColor = "purple",
}: AvatarSelectProps) {
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
        </label>
      )}
      <Select
        placeholder={placeholder}
        selectedKeys={selectedId ? [String(selectedId)] : []}
        onSelectionChange={(keys) => {
          const selected = Array.from(keys)[0] as string;
          if (selected === "empty") {
            onSelectionChange(null);
          } else {
            // 원래 타입으로 복원 (숫자인지 문자열인지 확인)
            const originalItem = items.find(
              (item) => String(item.id) === selected
            );
            onSelectionChange(originalItem?.id || null);
          }
        }}
        classNames={{
          trigger:
            "bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700",
        }}
      >
        {items.length > 0 ? (
          items.map((item) => (
            <SelectItem key={String(item.id)} textValue={item.name}>
              <div className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${getAvatarColorClass(item.avatarColor)}`}
                >
                  {item.name.charAt(0)}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm">{item.name}</span>
                  {item.subtitle && (
                    <span className="text-xs text-zinc-500">
                      {item.subtitle}
                    </span>
                  )}
                </div>
              </div>
            </SelectItem>
          ))
        ) : (
          <SelectItem key="empty" textValue={emptyMessage}>
            {emptyMessage}
          </SelectItem>
        )}
      </Select>
    </div>
  );
}
