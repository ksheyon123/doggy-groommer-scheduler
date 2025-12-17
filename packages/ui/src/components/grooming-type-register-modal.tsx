"use client";

import { useState } from "react";
import { Spinner } from "@heroui/react";
import { Input } from "./input";
import { Textarea } from "./textarea";
import { Button } from "./button";
import { CloseButton } from "./close-button";

export interface GroomingTypeRegisterData {
  name: string;
  description?: string;
  default_price?: number;
}

export interface GroomingTypeRegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: GroomingTypeRegisterData) => Promise<void>;
}

export function GroomingTypeRegisterModal({
  isOpen,
  onClose,
  onSubmit,
}: GroomingTypeRegisterModalProps) {
  const [formData, setFormData] = useState<GroomingTypeRegisterData>({
    name: "",
    description: "",
    default_price: undefined,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ name?: string }>({});

  const handleInputChange = (
    field: keyof GroomingTypeRegisterData,
    value: string | number | undefined
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // 에러 초기화
    if (field === "name" && errors.name) {
      setErrors((prev) => ({ ...prev, name: undefined }));
    }
  };

  const handleSubmit = async () => {
    // 유효성 검사
    if (!formData.name.trim()) {
      setErrors({ name: "미용 타입명을 입력해주세요." });
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      await onSubmit({
        name: formData.name.trim(),
        description: formData.description?.trim() || undefined,
        default_price: formData.default_price || 0,
      });
      // 성공 후 폼 초기화
      setFormData({ name: "", description: "", default_price: undefined });
      onClose();
    } catch (error) {
      console.error("미용 타입 등록 실패:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isSubmitting) {
      handleClose();
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setFormData({ name: "", description: "", default_price: undefined });
      setErrors({});
      onClose();
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
          <div>
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              미용 타입 추가
            </h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              새로운 미용 타입을 등록합니다
            </p>
          </div>
          <CloseButton onClick={onClose} disabled={isSubmitting} />
        </div>

        {/* Body */}
        <div>
          <div className="px-6 py-4 space-y-4">
            {/* 미용 타입명 */}
            <div>
              <Input
                type="text"
                placeholder="예: 전체 미용, 부분 미용, 목욕"
                labelComponent={
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                    미용 타입명 <span className="text-red-500">*</span>
                  </label>
                }
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                isInvalid={!!errors.name}
                errorMessage={errors.name}
                classNames={{
                  inputWrapper: `bg-white dark:bg-zinc-800 border ${
                    errors.name
                      ? "border-red-500"
                      : "border-zinc-200 dark:border-zinc-700"
                  }`,
                }}
              />
            </div>
            {/* 기본 금액 */}
            <div>
              <Input
                type="number"
                placeholder="예: 50000"
                labelComponent={
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                    기본 금액 (선택)
                  </label>
                }
                value={formData.default_price?.toString() || ""}
                onChange={(e) =>
                  handleInputChange(
                    "default_price",
                    e.target.value ? parseInt(e.target.value, 10) : undefined
                  )
                }
                startContent={<span className="text-zinc-400 text-sm">₩</span>}
                classNames={{
                  inputWrapper:
                    "bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700",
                }}
                description={
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                    예약 시 기본값으로 사용되며, 개별 예약에서 변경 가능합니다
                  </p>
                }
              />
            </div>

            {/* 설명 */}
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                설명 (선택)
              </label>
              <Textarea
                placeholder="미용 타입에 대한 설명을 입력하세요"
                value={formData.description || ""}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                minRows={2}
                classNames={{
                  inputWrapper:
                    "bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700",
                }}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 flex justify-end gap-3">
            <Button
              type="button"
              variant="flat"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              취소
            </Button>
            <Button
              type="button"
              color="primary"
              disabled={isSubmitting}
              onClick={handleSubmit}
            >
              {isSubmitting ? <Spinner size="sm" /> : "추가"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
