"use client";

import { useState, useEffect } from "react";
import {
  Input,
  Textarea,
  Button,
  Spinner,
  Select,
  SelectItem,
} from "@heroui/react";

export interface DogRegisterData {
  name: string;
  breed: string;
  owner_name: string;
  owner_phone_number: string;
  note: string;
  weight: string;
  birth_year: string;
  birth_month: string;
}

export interface DogRegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: DogRegisterData) => Promise<void>;
  isLoading?: boolean;
}

export function DogRegisterModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
}: DogRegisterModalProps) {
  const [formData, setFormData] = useState<DogRegisterData>({
    name: "",
    breed: "",
    owner_name: "",
    owner_phone_number: "",
    note: "",
    weight: "",
    birth_year: "",
    birth_month: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [useAgeInput, setUseAgeInput] = useState(false);
  const [ageInput, setAgeInput] = useState("");

  // 모달이 닫힐 때 폼 초기화
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        name: "",
        breed: "",
        owner_name: "",
        owner_phone_number: "",
        note: "",
        weight: "",
        birth_year: "",
        birth_month: "",
      });
      setUseAgeInput(false);
      setAgeInput("");
    }
  }, [isOpen]);

  // 나이 입력 시 birth_year 자동 계산
  useEffect(() => {
    if (useAgeInput && ageInput) {
      const age = parseInt(ageInput, 10);
      if (!isNaN(age) && age > 0) {
        const currentYear = new Date().getFullYear();
        // 1살 = 올해 태어남, 2살 = 작년 태어남
        const birthYear = currentYear - age + 1;
        setFormData((prev) => ({
          ...prev,
          birth_year: String(birthYear),
          birth_month: "1", // 나이로 입력 시 월은 비움
        }));
      }
    }
  }, [useAgeInput, ageInput]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      alert("강아지 이름을 입력해주세요.");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error("강아지 등록 실패:", error);
      alert("강아지 등록 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 현재 연도 기준으로 최근 30년 생성
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 30 }, (_, i) => currentYear - i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50"
      onClick={handleBackdropClick}
    >
      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            🐕 새 강아지 등록
          </h3>
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
        </div>

        {/* Body */}
        <div className="px-6 py-4 space-y-4 max-h-[60vh] overflow-y-auto">
          {/* 강아지 이름 */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              강아지 이름 <span className="text-red-500">*</span>
            </label>
            <Input
              type="text"
              placeholder="강아지 이름을 입력하세요"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  name: e.target.value,
                }))
              }
              classNames={{
                inputWrapper:
                  "bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700",
              }}
            />
          </div>

          {/* 견종 */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              견종
            </label>
            <Input
              type="text"
              placeholder="예: 푸들, 말티즈, 시츄..."
              value={formData.breed}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  breed: e.target.value,
                }))
              }
              classNames={{
                inputWrapper:
                  "bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700",
              }}
            />
          </div>

          {/* 주인 이름 */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              보호자 이름
            </label>
            <Input
              type="text"
              placeholder="보호자 이름을 입력하세요"
              value={formData.owner_name}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  owner_name: e.target.value,
                }))
              }
              classNames={{
                inputWrapper:
                  "bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700",
              }}
            />
          </div>

          {/* 주인 전화번호 */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              보호자 전화번호
            </label>
            <Input
              type="tel"
              placeholder="예: 010-1234-5678"
              value={formData.owner_phone_number}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  owner_phone_number: e.target.value,
                }))
              }
              classNames={{
                inputWrapper:
                  "bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700",
              }}
            />
          </div>

          {/* 몸무게 */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              몸무게 (kg)
            </label>
            <Input
              type="number"
              step="0.01"
              placeholder="예: 5.5"
              value={formData.weight}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  weight: e.target.value,
                }))
              }
              classNames={{
                inputWrapper:
                  "bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700",
              }}
              endContent={<span className="text-zinc-400 text-sm">kg</span>}
            />
          </div>

          {/* 생년월 / 나이 */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                {useAgeInput ? "나이" : "생년월"}
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={useAgeInput}
                  onChange={(e) => {
                    setUseAgeInput(e.target.checked);
                    if (!e.target.checked) {
                      setAgeInput("");
                    } else {
                      setFormData((prev) => ({
                        ...prev,
                        birth_year: "",
                        birth_month: "",
                      }));
                    }
                  }}
                  className="w-4 h-4 rounded border-zinc-300 dark:border-zinc-600 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-xs text-zinc-500 dark:text-zinc-400">
                  나이로 입력
                </span>
              </label>
            </div>

            {useAgeInput ? (
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min="1"
                  max="30"
                  placeholder="나이 입력"
                  value={ageInput}
                  onChange={(e) => setAgeInput(e.target.value)}
                  classNames={{
                    inputWrapper:
                      "bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700",
                  }}
                  endContent={<span className="text-zinc-400 text-sm">살</span>}
                />
                {ageInput && formData.birth_year && (
                  <span className="text-xs text-zinc-500 dark:text-zinc-400 whitespace-nowrap">
                    ({formData.birth_year}년생)
                  </span>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <Select
                  placeholder="년도"
                  selectedKeys={
                    formData.birth_year ? [formData.birth_year] : []
                  }
                  onSelectionChange={(keys) => {
                    const selected = Array.from(keys)[0] as string;
                    setFormData((prev) => ({
                      ...prev,
                      birth_year: selected || "",
                    }));
                  }}
                  classNames={{
                    trigger:
                      "bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700",
                  }}
                >
                  {years.map((year) => (
                    <SelectItem key={String(year)} textValue={`${year}년`}>
                      {year}년
                    </SelectItem>
                  ))}
                </Select>
                <Select
                  placeholder="월"
                  selectedKeys={
                    formData.birth_month ? [formData.birth_month] : []
                  }
                  onSelectionChange={(keys) => {
                    const selected = Array.from(keys)[0] as string;
                    setFormData((prev) => ({
                      ...prev,
                      birth_month: selected || "",
                    }));
                  }}
                  classNames={{
                    trigger:
                      "bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700",
                  }}
                >
                  {months.map((month) => (
                    <SelectItem key={String(month)} textValue={`${month}월`}>
                      {month}월
                    </SelectItem>
                  ))}
                </Select>
              </div>
            )}
          </div>

          {/* 특이사항 */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              특이사항
            </label>
            <Textarea
              placeholder="강아지 특이사항이나 주의사항을 입력해주세요..."
              value={formData.note}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  note: e.target.value,
                }))
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
            onClick={onClose}
            disabled={isSubmitting || isLoading}
          >
            취소
          </Button>
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
