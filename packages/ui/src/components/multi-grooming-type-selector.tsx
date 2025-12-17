"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Input } from "@repo/ui";
import {
  GroomingTypeRegisterModal,
  type GroomingTypeRegisterData,
} from "./grooming-type-register-modal";
import { AddButton } from "./add-button";

export interface GroomingTypeWithPrice {
  id: number;
  name: string;
  description?: string;
  default_price?: number;
}

export interface SelectedGroomingType {
  grooming_type_id: number;
  name: string;
  applied_price: number;
}

export interface MultiGroomingTypeSelectorProps {
  placeholder?: string;
  items: GroomingTypeWithPrice[];
  selectedItems: SelectedGroomingType[];
  onChange: (items: SelectedGroomingType[]) => void;
  onRegisterGroomingType?: (
    data: GroomingTypeRegisterData
  ) => Promise<GroomingTypeWithPrice>;
  className?: string;
}

export function MultiGroomingTypeSelector({
  placeholder = "미용 종류를 선택하세요...",
  items,
  selectedItems,
  onChange,
  onRegisterGroomingType,
  className = "",
}: MultiGroomingTypeSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [filteredItems, setFilteredItems] = useState<GroomingTypeWithPrice[]>(
    []
  );

  // 미용 타입 등록 모달 상태
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 이미 선택된 아이템 필터링
  const getAvailableItems = useCallback(() => {
    const selectedIds = selectedItems.map((item) => item.grooming_type_id);
    return items.filter((item) => !selectedIds.includes(item.id));
  }, [items, selectedItems]);

  // 검색어에 따라 필터링
  useEffect(() => {
    const available = getAvailableItems();
    if (searchValue.trim() === "") {
      setFilteredItems(available);
    } else {
      const filtered = available.filter((item) =>
        item.name.toLowerCase().includes(searchValue.toLowerCase())
      );
      setFilteredItems(filtered);
    }
    setHighlightedIndex(-1);
  }, [searchValue, getAvailableItems]);

  // 아이템 선택
  const handleSelect = useCallback(
    (item: GroomingTypeWithPrice) => {
      const newSelectedItem: SelectedGroomingType = {
        grooming_type_id: item.id,
        name: item.name,
        applied_price: item.default_price || 0,
      };
      onChange([...selectedItems, newSelectedItem]);
      setSearchValue("");
      setIsOpen(false);
      setHighlightedIndex(-1);
    },
    [selectedItems, onChange]
  );

  // 아이템 삭제
  const handleRemove = useCallback(
    (groomingTypeId: number) => {
      onChange(
        selectedItems.filter((item) => item.grooming_type_id !== groomingTypeId)
      );
    },
    [selectedItems, onChange]
  );

  // 가격 변경
  const handlePriceChange = useCallback(
    (groomingTypeId: number, price: number) => {
      onChange(
        selectedItems.map((item) =>
          item.grooming_type_id === groomingTypeId
            ? { ...item, applied_price: price }
            : item
        )
      );
    },
    [selectedItems, onChange]
  );

  // 키보드 네비게이션
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!isOpen || filteredItems.length === 0) {
        if (e.key === "ArrowDown" && getAvailableItems().length > 0) {
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
    [isOpen, filteredItems, highlightedIndex, handleSelect, getAvailableItems]
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

  // 총 금액 계산
  const totalAmount = selectedItems.reduce(
    (sum, item) => sum + item.applied_price,
    0
  );

  return (
    <div ref={containerRef} className={`space-y-3 ${className}`}>
      {/* 선택된 미용 타입들 */}
      {selectedItems.length > 0 && (
        <div className="space-y-2">
          {selectedItems.map((item) => (
            <div
              key={item.grooming_type_id}
              className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800"
            >
              <div className="flex-1">
                <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  {item.name}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-zinc-500 dark:text-zinc-400">
                  ₩
                </span>
                <input
                  value={item.applied_price}
                  onChange={(e) =>
                    handlePriceChange(
                      item.grooming_type_id,
                      e.target.value === "" ? 0 : Number(e.target.value)
                    )
                  }
                  className="w-24 px-2 py-1 text-sm text-right bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-600 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="금액"
                />
              </div>
              <button
                type="button"
                onClick={() => handleRemove(item.grooming_type_id)}
                className="p-1 text-zinc-400 hover:text-red-500 transition-colors"
              >
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          ))}

          {/* 총 금액 표시 */}
          {selectedItems.length > 1 && (
            <div className="flex justify-end px-3 py-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
              <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                총 금액: ₩{totalAmount.toLocaleString()}
              </span>
            </div>
          )}
        </div>
      )}

      {/* 미용 종류 검색/선택 */}
      <div className="relative">
        <Input
          ref={inputRef}
          type="text"
          placeholder={
            selectedItems.length > 0 ? "미용 종류 추가..." : placeholder
          }
          value={searchValue}
          onValueChange={(value) => {
            setSearchValue(value);
            setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (getAvailableItems().length > 0) setIsOpen(true);
          }}
          endContent={
            getAvailableItems().length > 0 ? (
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
                <div className="flex items-center justify-between">
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
                  {item.default_price !== undefined &&
                    item.default_price > 0 && (
                      <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                        ₩{item.default_price.toLocaleString()}
                      </span>
                    )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 선택 가능한 항목 없음 */}
        {isOpen &&
          filteredItems.length === 0 &&
          getAvailableItems().length === 0 && (
            <div className="absolute z-50 w-full mt-1 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-lg">
              <div className="px-4 py-3 text-sm text-zinc-500 dark:text-zinc-400">
                {items.length === 0
                  ? "등록된 미용 종류가 없습니다."
                  : "모든 미용 종류가 선택되었습니다."}
              </div>
            </div>
          )}

        {/* 검색 결과 없음 */}
        {isOpen &&
          searchValue.trim() !== "" &&
          filteredItems.length === 0 &&
          getAvailableItems().length > 0 && (
            <div className="absolute z-50 w-full mt-1 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-lg">
              <div className="px-4 py-3 text-sm text-zinc-500 dark:text-zinc-400">
                일치하는 미용 종류가 없습니다.
              </div>
            </div>
          )}
      </div>

      {/* 새 미용 타입 추가 버튼 */}
      {onRegisterGroomingType && (
        <AddButton onClick={() => setIsRegisterModalOpen(true)}>
          새 미용 타입 추가
        </AddButton>
      )}

      {/* 도움말 */}
      {items.length > 0 && selectedItems.length === 0 && (
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          목록에서 미용 종류를 선택하면 기본 금액이 자동으로 입력됩니다.
        </p>
      )}

      {/* 미용 타입 등록 모달 */}
      {onRegisterGroomingType && (
        <GroomingTypeRegisterModal
          isOpen={isRegisterModalOpen}
          onClose={() => setIsRegisterModalOpen(false)}
          onSubmit={async (data) => {
            const newGroomingType = await onRegisterGroomingType(data);
            console.log("newGroomingType : ", newGroomingType);
            // 등록 후 자동으로 선택
            handleSelect(newGroomingType);
          }}
        />
      )}
    </div>
  );
}
