"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Input, Spinner } from "@heroui/react";

export interface DogSearchItem {
  id: number;
  name: string;
  owner_name: string;
  breed?: string;
}

export interface SearchDropdownProps {
  placeholder?: string;
  onSearch: (query: string) => Promise<DogSearchItem[]>;
  onSelect: (item: DogSearchItem) => void;
  debounceMs?: number;
  minSearchLength?: number;
  className?: string;
}

export function SearchDropdown({
  placeholder = "강아지 이름으로 검색...",
  onSearch,
  onSelect,
  debounceMs = 300,
  minSearchLength = 1,
  className = "",
}: SearchDropdownProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<DogSearchItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // 검색 실행
  const performSearch = useCallback(
    async (searchQuery: string) => {
      if (searchQuery.length < minSearchLength) {
        setResults([]);
        setIsOpen(false);
        return;
      }

      setIsLoading(true);
      try {
        const searchResults = await onSearch(searchQuery);
        setResults(searchResults);
        setIsOpen(searchResults.length > 0);
        setHighlightedIndex(-1);
      } catch (error) {
        console.error("검색 중 오류 발생:", error);
        setResults([]);
        setIsOpen(false);
      } finally {
        setIsLoading(false);
      }
    },
    [onSearch, minSearchLength]
  );

  // 디바운스 검색
  const handleInputChange = useCallback(
    (value: string) => {
      setQuery(value);

      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      debounceRef.current = setTimeout(() => {
        performSearch(value);
      }, debounceMs);
    },
    [performSearch, debounceMs]
  );

  // 아이템 선택
  const handleSelect = useCallback(
    (item: DogSearchItem) => {
      setQuery(item.name);
      setIsOpen(false);
      setResults([]);
      onSelect(item);
    },
    [onSelect]
  );

  // 키보드 네비게이션
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!isOpen || results.length === 0) return;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setHighlightedIndex((prev) =>
            prev < results.length - 1 ? prev + 1 : 0
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setHighlightedIndex((prev) =>
            prev > 0 ? prev - 1 : results.length - 1
          );
          break;
        case "Enter":
          e.preventDefault();
          if (highlightedIndex >= 0 && highlightedIndex < results.length) {
            handleSelect(results[highlightedIndex]);
          }
          break;
        case "Escape":
          e.preventDefault();
          setIsOpen(false);
          setHighlightedIndex(-1);
          break;
      }
    },
    [isOpen, results, highlightedIndex, handleSelect]
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

  // 컴포넌트 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <Input
        ref={inputRef}
        type="text"
        placeholder={placeholder}
        value={query}
        onValueChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={() => {
          if (results.length > 0) setIsOpen(true);
        }}
        endContent={
          isLoading ? (
            <Spinner size="sm" />
          ) : (
            <svg
              className="w-4 h-4 text-zinc-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          )
        }
        classNames={{
          inputWrapper:
            "bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700",
        }}
      />

      {/* 드롭다운 결과 목록 */}
      {isOpen && results.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {results.map((item, index) => (
            <div
              key={item.id}
              className={`px-4 py-3 cursor-pointer transition-colors ${
                index === highlightedIndex
                  ? "bg-blue-50 dark:bg-blue-900/30"
                  : "hover:bg-zinc-50 dark:hover:bg-zinc-700/50"
              } ${index !== results.length - 1 ? "border-b border-zinc-100 dark:border-zinc-700" : ""}`}
              onClick={() => handleSelect(item)}
              onMouseEnter={() => setHighlightedIndex(index)}
            >
              <div className="flex flex-col gap-1">
                {/* 강아지 이름 */}
                <div className="flex items-center gap-2">
                  <span className="text-lg">🐕</span>
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                    {item.name}
                  </span>
                </div>
                {/* 견종 & 주인 이름 */}
                <div className="flex items-center gap-3 ml-7 text-sm text-zinc-600 dark:text-zinc-400">
                  {item.breed && (
                    <span className="flex items-center gap-1">
                      <span className="text-zinc-400">견종:</span>
                      <span className="font-medium">{item.breed}</span>
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    <span className="font-medium">
                      {item.owner_name || "주인 정보 없음"}
                    </span>
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 검색 결과 없음 */}
      {isOpen &&
        query.length >= minSearchLength &&
        results.length === 0 &&
        !isLoading && (
          <div className="absolute z-50 w-full mt-1 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-lg">
            <div className="px-4 py-3 text-center text-zinc-500 dark:text-zinc-400">
              검색 결과가 없습니다
            </div>
          </div>
        )}
    </div>
  );
}
