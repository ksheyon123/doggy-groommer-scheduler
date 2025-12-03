"use client";

import { useState, useEffect } from "react";
import { Button, Spinner } from "@heroui/react";
import { Input } from "./input";
import { Textarea } from "./textarea";
import { Select } from "./select";
import { SearchDropdown } from "./search-dropdown";
import { InputDropdown } from "./input-dropdown";
import { DogRegisterModal, type DogRegisterData } from "./dog-register-modal";
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
  id?: number; // 수정 시 예약 ID
  dog_id: number | null;
  dogName: string;
  assigned_user_id: number | null;
  appointment_at: string;
  start_time: string;
  end_time: string;
  memo: string;
  grooming_type: string;
  amount: number | null;
}

export interface AppointmentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: AppointmentFormData) => Promise<void>;
  onDelete?: (id: number) => Promise<void>;
  onSearchDog: (query: string) => Promise<DogSearchItem[]>;
  onRegisterDog?: (data: DogRegisterData) => Promise<DogSearchItem>;
  groomingTypes?: GroomingTypeItem[];
  groomers?: GroomerItem[];
  initialDate?: string;
  initialTime?: string;
  groomerId?: number;
  groomerName?: string;
  // 수정 모드용 props
  editMode?: boolean;
  editData?: {
    id: number;
    dog_id: number;
    dogName: string;
    dogBreed?: string;
    ownerName?: string;
    assigned_user_id: number | null;
    appointment_at: string;
    start_time: string;
    end_time: string;
    memo: string;
    grooming_type: string;
    amount: number | null;
  };
}

export function AppointmentFormModal({
  isOpen,
  onClose,
  onSubmit,
  onDelete,
  onSearchDog,
  onRegisterDog,
  groomingTypes = [],
  groomers = [],
  initialDate,
  initialTime,
  groomerId,
  groomerName,
  editMode = false,
  editData,
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
    amount: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDog, setSelectedDog] = useState<DogSearchItem | null>(null);
  const [errors, setErrors] = useState<{
    dog?: string;
    appointment_at?: string;
    start_time?: string;
  }>({});
  const [searchKey, setSearchKey] = useState(0);

  // 강아지 등록 모달 상태
  const [isDogRegisterOpen, setIsDogRegisterOpen] = useState(false);

  // 초기값 설정
  useEffect(() => {
    if (isOpen) {
      if (editMode && editData) {
        // 수정 모드: editData로 폼 초기화
        setFormData({
          id: editData.id,
          dog_id: editData.dog_id,
          dogName: editData.dogName,
          assigned_user_id: editData.assigned_user_id,
          appointment_at: editData.appointment_at,
          start_time: editData.start_time,
          end_time: editData.end_time,
          memo: editData.memo,
          grooming_type: editData.grooming_type,
          amount: editData.amount,
        });
        setSelectedDog({
          id: editData.dog_id,
          name: editData.dogName,
          breed: editData.dogBreed || "",
          owner_name: editData.ownerName || "",
        });
      } else {
        // 등록 모드: 기존 로직
        setFormData((prev) => ({
          ...prev,
          appointment_at: initialDate || prev.appointment_at,
          start_time: initialTime || prev.start_time,
          assigned_user_id: groomerId || prev.assigned_user_id,
        }));
      }
    }
  }, [isOpen, initialDate, initialTime, groomerId, editMode, editData]);

  // 모달 닫을 때 폼 초기화
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        id: undefined,
        dog_id: null,
        dogName: "",
        assigned_user_id: null,
        appointment_at: "",
        start_time: "",
        end_time: "",
        memo: "",
        grooming_type: "",
        amount: null,
      });
      setSelectedDog(null);
      setIsDogRegisterOpen(false);
      setErrors({});
      setSearchKey((prev) => prev + 1);
    }
  }, [isOpen]);

  // 삭제 처리
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDelete = async () => {
    if (!editData?.id || !onDelete) return;

    setIsDeleting(true);
    try {
      await onDelete(editData.id);
      onClose();
    } catch (error) {
      console.error("예약 삭제 실패:", error);
      alert("예약 삭제 중 오류가 발생했습니다.");
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleDogSelect = (dog: DogSearchItem) => {
    setSelectedDog(dog);
    setFormData((prev) => ({
      ...prev,
      dog_id: dog.id,
      dogName: dog.name,
    }));
    // 강아지 선택 시 에러 초기화
    if (errors.dog) {
      setErrors((prev) => ({ ...prev, dog: undefined }));
    }
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

    // 유효성 검사
    const newErrors: typeof errors = {};

    if (!formData.dog_id) {
      newErrors.dog =
        "목록에서 강아지를 선택해주세요. 목록에 나타나지 않을 시, 등록해 주세요.";
    }

    if (!formData.appointment_at) {
      newErrors.appointment_at = "예약 날짜를 선택해주세요.";
    }

    if (!formData.start_time) {
      newErrors.start_time = "시작 시간을 입력해주세요.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
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
  const handleDogRegisterSubmit = async (data: DogRegisterData) => {
    if (!onRegisterDog) {
      throw new Error("강아지 등록 기능이 설정되지 않았습니다.");
    }

    const newDog = await onRegisterDog(data);
    // 등록된 강아지 자동 선택
    handleDogSelect(newDog);
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
              {editMode ? "예약 수정" : "예약 등록"}
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
                  강아지 {editMode ? "" : "검색"}{" "}
                  <span className="text-red-500">*</span>
                </label>
                {!editMode && onRegisterDog && (
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
              {!editMode && (
                <SearchDropdown
                  key={searchKey}
                  placeholder="강아지 이름으로 검색..."
                  onSearch={onSearchDog}
                  onSelect={handleDogSelect}
                />
              )}
              {errors.dog && !selectedDog && (
                <div className="mt-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                  <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
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
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    {errors.dog}
                  </p>
                </div>
              )}
              {selectedDog && (
                <div
                  className={`${editMode ? "" : "mt-2"} p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg`}
                >
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
                    {!editMode && (
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
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* 담당 미용사 */}
            <div>
              {groomers.length > 0 ? (
                <Select
                  label="담당 미용사"
                  placeholder="담당 미용사를 선택하세요"
                  options={groomers.map((groomer) => ({
                    id: groomer.user_id,
                    label: groomer.name,
                    subtitle: groomer.role
                      ? groomer.role === "owner"
                        ? "원장"
                        : groomer.role === "manager"
                          ? "매니저"
                          : "직원"
                      : undefined,
                    avatarColor: "blue",
                  }))}
                  selectedId={formData.assigned_user_id}
                  onSelectionChange={(id) =>
                    handleInputChange("assigned_user_id", id as number | null)
                  }
                  showAvatar
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
                onChange={(e) => {
                  handleInputChange("appointment_at", e.target.value);
                  if (errors.appointment_at) {
                    setErrors((prev) => ({
                      ...prev,
                      appointment_at: undefined,
                    }));
                  }
                }}
                classNames={{
                  inputWrapper: `bg-white dark:bg-zinc-800 border ${errors.appointment_at ? "border-red-500" : "border-zinc-200 dark:border-zinc-700"}`,
                }}
              />
              {errors.appointment_at && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.appointment_at}
                </p>
              )}
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
                  min="06:00"
                  max="22:00"
                  onChange={(e) => {
                    handleInputChange("start_time", e.target.value);
                    if (errors.start_time) {
                      setErrors((prev) => ({ ...prev, start_time: undefined }));
                    }
                  }}
                  classNames={{
                    inputWrapper: `bg-white dark:bg-zinc-800 border ${errors.start_time ? "border-red-500" : "border-zinc-200 dark:border-zinc-700"}`,
                  }}
                />
                {errors.start_time ? (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.start_time}
                  </p>
                ) : (
                  <p className="text-xs text-zinc-500 mt-1">06:00 ~ 22:00</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  종료 시간
                </label>
                <Input
                  type="time"
                  value={formData.end_time}
                  min="06:00"
                  max="22:00"
                  onChange={(e) =>
                    handleInputChange("end_time", e.target.value)
                  }
                  classNames={{
                    inputWrapper:
                      "bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700",
                  }}
                />
                <p className="text-xs text-zinc-500 mt-1">06:00 ~ 22:00</p>
              </div>
            </div>

            {/* 미용 종류 */}
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                미용 종류
              </label>
              <InputDropdown
                placeholder="예: 전체 미용, 부분 미용, 목욕..."
                items={groomingTypes}
                value={formData.grooming_type}
                onChange={(value) => handleInputChange("grooming_type", value)}
              />
            </div>

            {/* 금액 */}
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                금액 (원)
              </label>
              <Input
                type="number"
                placeholder="예: 50000"
                value={formData.amount !== null ? String(formData.amount) : ""}
                onChange={(e) => {
                  const value = e.target.value;
                  handleInputChange(
                    "amount",
                    value === "" ? null : Number(value)
                  );
                }}
                classNames={{
                  inputWrapper:
                    "bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700",
                }}
                startContent={<span className="text-zinc-400 text-sm">₩</span>}
              />
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
                  input: "outline-none",
                  inputWrapper:
                    "bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700",
                }}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 flex justify-between">
            {/* 삭제 버튼 (수정 모드에서만) */}
            <div>
              {editMode && onDelete && (
                <Button
                  type="button"
                  color="danger"
                  variant="flat"
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={isSubmitting || isDeleting}
                >
                  삭제
                </Button>
              )}
            </div>
            <div className="flex gap-3">
              <Button
                type="button"
                variant="flat"
                onClick={onClose}
                disabled={isSubmitting || isDeleting}
              >
                취소
              </Button>
              <Button
                type="submit"
                color="primary"
                disabled={isSubmitting || isDeleting}
              >
                {isSubmitting ? (
                  <Spinner size="sm" />
                ) : editMode ? (
                  "수정"
                ) : (
                  "예약 등록"
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>

      {/* 삭제 확인 모달 */}
      {showDeleteConfirm && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowDeleteConfirm(false);
            }
          }}
        >
          <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                예약 삭제
              </h3>
            </div>
            <div className="px-6 py-4">
              <p className="text-zinc-600 dark:text-zinc-400">
                정말로 이 예약을 삭제하시겠습니까?
              </p>
              <p className="text-sm text-zinc-500 dark:text-zinc-500 mt-2">
                이 작업은 되돌릴 수 없습니다.
              </p>
            </div>
            <div className="px-6 py-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 flex justify-end gap-3">
              <Button
                type="button"
                variant="flat"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
              >
                취소
              </Button>
              <Button
                type="button"
                color="danger"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? <Spinner size="sm" /> : "삭제"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 강아지 등록 모달 */}
      <DogRegisterModal
        isOpen={isDogRegisterOpen}
        onClose={() => setIsDogRegisterOpen(false)}
        onSubmit={handleDogRegisterSubmit}
      />
    </div>
  );
}

export type { DogRegisterData };
