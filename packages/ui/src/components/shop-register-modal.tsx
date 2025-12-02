"use client";

import { useState, useEffect } from "react";
import { Input, Button, Spinner } from "@heroui/react";

export interface ShopRegisterData {
  name: string;
}

export interface ShopRegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ShopRegisterData) => Promise<void>;
  isLoading?: boolean;
  isRequired?: boolean; // 매장 등록이 필수인지 여부 (닫기 버튼 표시 안함)
}

export function ShopRegisterModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
  isRequired = false,
}: ShopRegisterModalProps) {
  const [formData, setFormData] = useState<ShopRegisterData>({
    name: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 모달이 닫힐 때 폼 초기화
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        name: "",
      });
    }
  }, [isOpen]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    // 필수 모달인 경우 백드롭 클릭으로 닫기 방지
    if (isRequired) return;
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      alert("매장명을 입력해주세요.");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error("매장 등록 실패:", error);
      alert("매장 등록 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            🏪 매장 등록
          </h3>
          {!isRequired && (
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
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
          )}
        </div>

        {/* Body */}
        <div className="px-6 py-6">
          {isRequired && (
            <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-300">
                시작하기 위해 매장을 먼저 등록해주세요.
              </p>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              매장명 <span className="text-red-500">*</span>
            </label>
            <Input
              type="text"
              placeholder="매장명을 입력하세요"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  name: e.target.value,
                }))
              }
              onKeyDown={handleKeyDown}
              classNames={{
                inputWrapper:
                  "bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700",
              }}
              autoFocus
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 flex justify-end gap-3">
          {!isRequired && (
            <Button
              type="button"
              variant="flat"
              onClick={onClose}
              disabled={isSubmitting || isLoading}
            >
              취소
            </Button>
          )}
          <Button
            type="button"
            color="primary"
            onClick={handleSubmit}
            disabled={isSubmitting || isLoading || !formData.name.trim()}
          >
            {isSubmitting || isLoading ? <Spinner size="sm" /> : "등록"}
          </Button>
        </div>
      </div>
    </div>
  );
}
