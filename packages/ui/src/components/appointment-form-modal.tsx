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
import { SearchDropdown } from "./search-dropdown";
import type { DogSearchItem } from "./search-dropdown";

export interface GroomingTypeItem {
  id: number;
  name: string;
  description?: string;
}

export interface GroomerItem {
  id: number;
  user_id: number;
  name: string;
  role?: string;
}

export interface AppointmentFormData {
  dog_id: number | null;
  dogName: string;
  assigned_user_id: number | null;
  appointment_at: string;
  start_time: string;
  end_time: string;
  memo: string;
  grooming_type: string;
}

export interface DogRegisterData {
  name: string;
  breed: string;
  owner_name: string;
  owner_phone_number: string;
  note: string;
}

export interface AppointmentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: AppointmentFormData) => Promise<void>;
  onSearchDog: (query: string) => Promise<DogSearchItem[]>;
  onRegisterDog?: (data: DogRegisterData) => Promise<DogSearchItem>;
  groomingTypes?: GroomingTypeItem[];
  groomers?: GroomerItem[];
  initialDate?: string;
  initialTime?: string;
  groomerId?: number;
  groomerName?: string;
}

export function AppointmentFormModal({
  isOpen,
  onClose,
  onSubmit,
  onSearchDog,
  onRegisterDog,
  groomingTypes = [],
  groomers = [],
  initialDate,
  initialTime,
  groomerId,
  groomerName,
}: AppointmentFormModalProps) {
  const [formData, setFormData] = useState<AppointmentFormData>({
    dog_id: null,
    dogName: "",
    assigned_user_id: groomerId || null,
    appointment_at: initialDate || "",
    start_time: initialTime || "",
    end_time: "",
    memo: "",
    grooming_type: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDog, setSelectedDog] = useState<DogSearchItem | null>(null);

  // 강아지 등록 모달 상태
  const [isDogRegisterOpen, setIsDogRegisterOpen] = useState(false);
  const [dogRegisterData, setDogRegisterData] = useState<DogRegisterData>({
    name: "",
    breed: "",
    owner_name: "",
    owner_phone_number: "",
    note: "",
  });
  const [isDogRegistering, setIsDogRegistering] = useState(false);

  // 초기값 설정
  useEffect(() => {
    if (isOpen) {
      setFormData((prev) => ({
        ...prev,
        appointment_at: initialDate || prev.appointment_at,
        start_time: initialTime || prev.start_time,
        assigned_user_id: groomerId || prev.assigned_user_id,
      }));
    }
  }, [isOpen, initialDate, initialTime, groomerId]);

  // 모달 닫을 때 폼 초기화
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        dog_id: null,
        dogName: "",
        assigned_user_id: null,
        appointment_at: "",
        start_time: "",
        end_time: "",
        memo: "",
        grooming_type: "",
      });
      setSelectedDog(null);
      setIsDogRegisterOpen(false);
    }
  }, [isOpen]);

  const handleDogSelect = (dog: DogSearchItem) => {
    setSelectedDog(dog);
    setFormData((prev) => ({
      ...prev,
      dog_id: dog.id,
      dogName: dog.name,
    }));
  };

  const handleInputChange = (
    field: keyof AppointmentFormData,
    value: string | number | null
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.dog_id) {
      alert("강아지를 선택해주세요.");
      return;
    }

    if (!formData.appointment_at || !formData.start_time) {
      alert("날짜와 시작 시간을 입력해주세요.");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error("예약 생성 실패:", error);
      alert("예약 생성 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // 강아지 등록 핸들러
  const handleDogRegisterSubmit = async () => {
    if (!dogRegisterData.name.trim()) {
      alert("강아지 이름을 입력해주세요.");
      return;
    }

    if (!onRegisterDog) {
      alert("강아지 등록 기능이 설정되지 않았습니다.");
      return;
    }

    setIsDogRegistering(true);
    try {
      const newDog = await onRegisterDog(dogRegisterData);
      // 등록된 강아지 자동 선택
      handleDogSelect(newDog);
      setIsDogRegisterOpen(false);
      setDogRegisterData({
        name: "",
        breed: "",
        owner_name: "",
        owner_phone_number: "",
        note: "",
      });
    } catch (error) {
      console.error("강아지 등록 실패:", error);
      alert("강아지 등록 중 오류가 발생했습니다.");
    } finally {
      setIsDogRegistering(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              예약 등록
            </h2>
            {groomerName && !groomers.length && (
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                담당: {groomerName}
              </p>
            )}
          </div>
          <button
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
        <form onSubmit={handleSubmit}>
          <div className="px-6 py-4 space-y-4 max-h-[60vh] overflow-y-auto">
            {/* 강아지 검색 */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  강아지 검색 <span className="text-red-500">*</span>
                </label>
                {onRegisterDog && (
                  <button
                    type="button"
                    onClick={() => setIsDogRegisterOpen(true)}
                    className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
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
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    새 강아지 등록
                  </button>
                )}
              </div>
              <SearchDropdown
                placeholder="강아지 이름으로 검색..."
                onSearch={onSearchDog}
                onSelect={handleDogSelect}
              />
              {selectedDog && (
                <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-zinc-900 dark:text-zinc-100">
                        🐕 {selectedDog.name}
                      </p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                        {selectedDog.breed && (
                          <span>견종: {selectedDog.breed}</span>
                        )}
                        {selectedDog.owner_name && (
                          <span>주인: {selectedDog.owner_name}</span>
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedDog(null);
                        setFormData((prev) => ({
                          ...prev,
                          dog_id: null,
                          dogName: "",
                        }));
                      }}
                      className="text-zinc-400 hover:text-zinc-600"
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
                </div>
              )}
            </div>

            {/* 담당 미용사 */}
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                담당 미용사
              </label>
              {groomers.length > 0 ? (
                <Select
                  placeholder="담당 미용사를 선택하세요"
                  selectedKeys={
                    formData.assigned_user_id
                      ? [String(formData.assigned_user_id)]
                      : []
                  }
                  onSelectionChange={(keys) => {
                    const selected = Array.from(keys)[0] as string;
                    handleInputChange(
                      "assigned_user_id",
                      selected ? Number(selected) : null
                    );
                  }}
                  classNames={{
                    trigger:
                      "bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700",
                  }}
                >
                  {groomers.map((groomer) => (
                    <SelectItem
                      key={String(groomer.user_id)}
                      textValue={groomer.name}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-sm font-medium text-blue-600 dark:text-blue-400">
                          {groomer.name.charAt(0)}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm">{groomer.name}</span>
                          {groomer.role && (
                            <span className="text-xs text-zinc-500">
                              {groomer.role === "owner"
                                ? "원장"
                                : groomer.role === "manager"
                                  ? "매니저"
                                  : "직원"}
                            </span>
                          )}
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </Select>
              ) : groomerName ? (
                <Input
                  type="text"
                  value={groomerName}
                  isReadOnly
                  classNames={{
                    inputWrapper:
                      "bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700",
                  }}
                />
              ) : (
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  직원 목록을 불러올 수 없습니다.
                </p>
              )}
            </div>

            {/* 날짜 */}
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                예약 날짜 <span className="text-red-500">*</span>
              </label>
              <Input
                type="date"
                value={formData.appointment_at}
                onChange={(e) =>
                  handleInputChange("appointment_at", e.target.value)
                }
                classNames={{
                  inputWrapper:
                    "bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700",
                }}
              />
            </div>

            {/* 시간 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  시작 시간 <span className="text-red-500">*</span>
                </label>
                <Input
                  type="time"
                  value={formData.start_time}
                  onChange={(e) =>
                    handleInputChange("start_time", e.target.value)
                  }
                  classNames={{
                    inputWrapper:
                      "bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700",
                  }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  종료 시간
                </label>
                <Input
                  type="time"
                  value={formData.end_time}
                  onChange={(e) =>
                    handleInputChange("end_time", e.target.value)
                  }
                  classNames={{
                    inputWrapper:
                      "bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700",
                  }}
                />
              </div>
            </div>

            {/* 미용 종류 */}
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                미용 종류
              </label>
              {groomingTypes.length > 0 ? (
                <Select
                  placeholder="미용 종류를 선택하세요"
                  selectedKeys={
                    formData.grooming_type ? [formData.grooming_type] : []
                  }
                  onSelectionChange={(keys) => {
                    const selected = Array.from(keys)[0] as string;
                    handleInputChange("grooming_type", selected || "");
                  }}
                  classNames={{
                    trigger:
                      "bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700",
                  }}
                >
                  {groomingTypes.map((type) => (
                    <SelectItem key={type.name} textValue={type.name}>
                      <div className="flex flex-col">
                        <span className="text-sm">{type.name}</span>
                        {type.description && (
                          <span className="text-xs text-zinc-500">
                            {type.description}
                          </span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </Select>
              ) : (
                <Input
                  type="text"
                  placeholder="예: 전체 미용, 부분 미용, 목욕..."
                  value={formData.grooming_type}
                  onChange={(e) =>
                    handleInputChange("grooming_type", e.target.value)
                  }
                  classNames={{
                    inputWrapper:
                      "bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700",
                  }}
                />
              )}
            </div>

            {/* 메모 */}
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                메모
              </label>
              <Textarea
                placeholder="특이사항이나 요청사항을 입력해주세요..."
                value={formData.memo}
                onChange={(e) => handleInputChange("memo", e.target.value)}
                minRows={3}
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
              disabled={isSubmitting}
            >
              취소
            </Button>
            <Button
              type="submit"
              color="primary"
              disabled={isSubmitting || !formData.dog_id}
            >
              {isSubmitting ? <Spinner size="sm" /> : "예약 등록"}
            </Button>
          </div>
        </form>
      </div>

      {/* 강아지 등록 모달 */}
      {isDogRegisterOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsDogRegisterOpen(false);
            }
          }}
        >
          <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                🐕 새 강아지 등록
              </h3>
              <button
                type="button"
                onClick={() => setIsDogRegisterOpen(false)}
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
            <div className="px-6 py-4 space-y-4 max-h-[50vh] overflow-y-auto">
              {/* 강아지 이름 */}
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  강아지 이름 <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  placeholder="강아지 이름을 입력하세요"
                  value={dogRegisterData.name}
                  onChange={(e) =>
                    setDogRegisterData((prev) => ({
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
                  value={dogRegisterData.breed}
                  onChange={(e) =>
                    setDogRegisterData((prev) => ({
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
                  주인 이름
                </label>
                <Input
                  type="text"
                  placeholder="주인 이름을 입력하세요"
                  value={dogRegisterData.owner_name}
                  onChange={(e) =>
                    setDogRegisterData((prev) => ({
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
                  주인 전화번호
                </label>
                <Input
                  type="tel"
                  placeholder="예: 010-1234-5678"
                  value={dogRegisterData.owner_phone_number}
                  onChange={(e) =>
                    setDogRegisterData((prev) => ({
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

              {/* 특이사항 */}
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  특이사항
                </label>
                <Textarea
                  placeholder="강아지 특이사항이나 주의사항을 입력해주세요..."
                  value={dogRegisterData.note}
                  onChange={(e) =>
                    setDogRegisterData((prev) => ({
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
                onClick={() => setIsDogRegisterOpen(false)}
                disabled={isDogRegistering}
              >
                취소
              </Button>
              <Button
                type="button"
                color="primary"
                onClick={handleDogRegisterSubmit}
                disabled={isDogRegistering || !dogRegisterData.name.trim()}
              >
                {isDogRegistering ? <Spinner size="sm" /> : "등록"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
