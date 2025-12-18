"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Input } from "./input";

export interface InputDropdownItem {
  id: number | string;
  name: string;
  description?: string;
}

export interface InputDropdownProps {
  placeholder?: string;
  items: InputDropdownItem[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
  label?: string;
}

export function InputDropdown({
  placeholder = "입력하세요...",
  items,
  value,
  onChange,
  className = "",
}: InputDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [filteredItems, setFilteredItems] = useState<InputDropdownItem[]>([]);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 입력값에 따라 필터링
  useEffect(() => {
    if (value.trim() === "") {
      setFilteredItems(items);
    } else {
      const filtered = items.filter((item) =>
        item.name.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredItems(filtered);
    }
    setHighlightedIndex(-1);
  }, [value, items]);

  // 입력 변경
  const handleInputChange = useCallback(
    (inputValue: string) => {
      onChange(inputValue);
      setIsOpen(true);
    },
    [onChange]
  );

  // 아이템 선택
  const handleSelect = useCallback(
    (item: InputDropdownItem) => {
      onChange(item.name);
      setIsOpen(false);
      setHighlightedIndex(-1);
    },
    [onChange]
  );

  // 키보드 네비게이션
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!isOpen || filteredItems.length === 0) {
        if (e.key === "ArrowDown" && items.length > 0) {
          setIsOpen(true);
          return;
        }
        return;
      }

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setHighlightedIndex((prev) =>
            prev < filteredItems.length - 1 ? prev + 1 : 0
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setHighlightedIndex((prev) =>
            prev > 0 ? prev - 1 : filteredItems.length - 1
          );
          break;
        case "Enter":
          e.preventDefault();
          if (
            highlightedIndex >= 0 &&
            highlightedIndex < filteredItems.length
          ) {
            handleSelect(filteredItems[highlightedIndex]);
          }
          break;
        case "Escape":
          e.preventDefault();
          setIsOpen(false);
          setHighlightedIndex(-1);
          break;
      }
    },
    [isOpen, filteredItems, highlightedIndex, handleSelect, items.length]
  );

  // 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <Input
        ref={inputRef}
        type="text"
        placeholder={placeholder}
        value={value}
        onValueChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={() => {
          if (items.length > 0) setIsOpen(true);
        }}
        endContent={
          items.length > 0 ? (
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded transition-colors"
            >
              <svg
                className={`w-4 h-4 text-zinc-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
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
            </button>
          ) : null
        }
        classNames={{
          inputWrapper:
            "bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700",
        }}
      />

      {/* 드롭다운 목록 */}
      {isOpen && filteredItems.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {filteredItems.map((item, index) => (
            <div
              key={item.id}
              className={`px-4 py-3 cursor-pointer transition-colors ${
                index === highlightedIndex
                  ? "bg-blue-50 dark:bg-blue-900/30"
                  : "hover:bg-zinc-50 dark:hover:bg-zinc-700/50"
              } ${index !== filteredItems.length - 1 ? "border-b border-zinc-100 dark:border-zinc-700" : ""}`}
              onClick={() => handleSelect(item)}
              onMouseEnter={() => setHighlightedIndex(index)}
            >
              <div className="flex flex-col">
                <span className="font-medium text-zinc-900 dark:text-zinc-100">
                  {item.name}
                </span>
                {item.description && (
                  <span className="text-sm text-zinc-500 dark:text-zinc-400">
                    {item.description}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 필터링 결과 없음 (입력 중일 때만) */}
      {isOpen && value.trim() !== "" && filteredItems.length === 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-lg">
          <div className="px-4 py-3 text-sm text-zinc-500 dark:text-zinc-400">
            일치하는 항목이 없습니다. 입력한 값이 그대로 사용됩니다.
          </div>
        </div>
      )}
    </div>
  );
}
