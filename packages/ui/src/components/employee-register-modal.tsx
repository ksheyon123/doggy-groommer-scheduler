"use client";

import { useState, useEffect } from "react";
import { Button } from "@heroui/react";
import { Input } from "./input";
import { AvatarSelect } from "./avatar-select";

export interface EmployeeRegisterShop {
  id: number;
  name: string;
}

export interface EmployeeRegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  shops: EmployeeRegisterShop[];
  onAddEmployee: (shopId: number, email: string) => Promise<void>;
  isAdding?: boolean;
}

export function EmployeeRegisterModal({
  isOpen,
  onClose,
  shops,
  onAddEmployee,
  isAdding = false,
}: EmployeeRegisterModalProps) {
  const [selectedShopId, setSelectedShopId] = useState<number | null>(
    shops.length > 0 ? shops[0].id : null
  );
  const [email, setEmail] = useState("");

  // shops가 변경되면 selectedShopId 업데이트
  useEffect(() => {
    if (shops.length > 0 && !selectedShopId) {
      setSelectedShopId(shops[0].id);
    }
  }, [shops, selectedShopId]);

  // 모달이 닫힐 때 폼 초기화
  useEffect(() => {
    if (!isOpen) {
      setEmail("");
      setSelectedShopId(shops.length > 0 ? shops[0].id : null);
    }
  }, [isOpen, shops]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleSubmit = async () => {
    if (!selectedShopId || !email.trim()) return;

    await onAddEmployee(selectedShopId, email.trim());
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* 모달 헤더 */}
        <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            직원 추가
          </h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
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

        {/* 모달 본문 */}
        <div className="px-6 py-6 space-y-4">
          <AvatarSelect
            label="매장 선택"
            placeholder="매장을 선택하세요"
            items={shops}
            selectedId={selectedShopId}
            onSelectionChange={(id) => setSelectedShopId(id as number | null)}
            emptyMessage="Owner인 매장이 없습니다"
          />
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              이메일
            </label>
            <Input
              type="email"
              value={email}
              onValueChange={setEmail}
              placeholder="직원의 이메일을 입력하세요"
              classNames={{
                inputWrapper:
                  "bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700",
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && selectedShopId && email.trim()) {
                  handleSubmit();
                }
              }}
              autoFocus
            />
          </div>
        </div>

        {/* 모달 푸터 */}
        <div className="px-6 py-4 bg-zinc-50 dark:bg-zinc-800/50 border-t border-zinc-200 dark:border-zinc-800 flex justify-end gap-3">
          <Button type="button" variant="flat" onClick={onClose}>
            취소
          </Button>
          <Button
            type="button"
            color="primary"
            onClick={handleSubmit}
            disabled={isAdding || !selectedShopId || !email.trim()}
          >
            {isAdding ? "추가 중..." : "추가"}
          </Button>
        </div>
      </div>
    </div>
  );
}
