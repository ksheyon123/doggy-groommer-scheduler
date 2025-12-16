"use client";

import { useState, useEffect, useRef } from "react";
import { getAccessToken } from "@/lib/auth";
import { useShop } from "@/lib/shop";
import { useRouter } from "next/navigation";
import {
  useModal,
  GroomingTypeRegisterModal,
  type GroomingTypeRegisterData,
} from "@repo/ui";

// 미용 타입
interface GroomingType {
  id: number;
  name: string;
  description?: string;
  default_price?: number;
  is_active?: boolean;
}

// API 기본 URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export default function ShopSettingsPage() {
  const router = useRouter();
  const { showModal, closeModal } = useModal();

  // 전역 샵 상태 사용
  const {
    shops,
    selectedShop: globalSelectedShop,
    isLoadingShops,
    refreshShops,
  } = useShop();

  // 로컬 선택 상태 (전역 상태를 기본값으로 사용)
  const [selectedShopId, setSelectedShopId] = useState<number | null>(null);

  // 미용 타입 관련 상태
  const [groomingTypes, setGroomingTypes] = useState<GroomingType[]>([]);
  const [isLoadingTypes, setIsLoadingTypes] = useState(false);

  // 미용 타입 추가 모달 상태
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // 폼 입력값을 위한 refs (수정 모달용)
  const formDataRef = useRef({
    name: "",
    description: "",
    price: "",
  });

  // 선택된 매장 정보
  const selectedShop = shops.find((shop) => shop.id === selectedShopId);

  // 전역 상태가 변경되면 로컬 상태에 반영 (초기화 시)
  useEffect(() => {
    if (globalSelectedShop && selectedShopId === null) {
      setSelectedShopId(globalSelectedShop.id);
    }
  }, [globalSelectedShop, selectedShopId]);

  // 컴포넌트 마운트 시 매장 목록 조회
  useEffect(() => {
    refreshShops();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 미용 타입 목록 조회 (비활성화 포함)
  const fetchGroomingTypes = async (shopId: number) => {
    const accessToken = getAccessToken();
    if (!accessToken) return;

    setIsLoadingTypes(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/shops/${shopId}/grooming-types?include_inactive=true`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      const data = await response.json();
      if (response.ok && data.success) {
        setGroomingTypes(data.data);
      }
    } catch (error) {
      console.error("미용 타입 조회 실패:", error);
    } finally {
      setIsLoadingTypes(false);
    }
  };

  // 알림 모달 표시
  const showAlertModal = (title: string, message: string) => {
    showModal(
      {
        header: title,
        body: message,
        footer: (_, __, onClose) => (
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              확인
            </button>
          </div>
        ),
      },
      closeModal,
      closeModal
    );
  };

  // 금액 포맷팅 함수
  const formatPrice = (price?: number) => {
    if (price === undefined || price === null || price === 0) return "-";
    return price.toLocaleString("ko-KR") + "원";
  };

  // 미용 타입 추가 핸들러 (공통 컴포넌트용)
  const handleAddGroomingType = async (data: GroomingTypeRegisterData) => {
    const accessToken = getAccessToken();
    if (!accessToken || !selectedShopId) {
      throw new Error("인증 또는 매장 선택이 필요합니다.");
    }

    const response = await fetch(
      `${API_BASE_URL}/api/shops/${selectedShopId}/grooming-types`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          name: data.name,
          description: data.description || undefined,
          default_price: data.default_price || 0,
        }),
      }
    );

    const result = await response.json();

    if (response.ok && result.success) {
      showAlertModal("알림", "미용 타입이 추가되었습니다.");
      fetchGroomingTypes(selectedShopId);
    } else {
      throw new Error(result.message || "미용 타입 추가에 실패했습니다.");
    }
  };

  // 미용 타입 수정 모달
  const showEditModal = (type: GroomingType) => {
    if (!selectedShopId) return;

    formDataRef.current = {
      name: type.name,
      description: type.description || "",
      price: type.default_price?.toString() || "",
    };

    showModal(
      {
        header: "미용 타입 수정",
        body: () => (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                미용 타입명 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                defaultValue={type.name}
                onChange={(e) => (formDataRef.current.name = e.target.value)}
                placeholder="예: 전체 미용, 부분 미용, 목욕"
                className="w-full px-4 py-3 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                autoFocus
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                기본 금액
              </label>
              <input
                type="number"
                defaultValue={type.default_price || ""}
                onChange={(e) => (formDataRef.current.price = e.target.value)}
                placeholder="예: 50000"
                className="w-full px-4 py-3 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                설명
              </label>
              <textarea
                defaultValue={type.description || ""}
                onChange={(e) =>
                  (formDataRef.current.description = e.target.value)
                }
                placeholder="미용 타입에 대한 설명을 입력하세요"
                rows={3}
                className="w-full px-4 py-3 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>
          </div>
        ),
        footer: (onConfirm, _, onClose) => (
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 bg-zinc-200 dark:bg-zinc-700 rounded-lg hover:bg-zinc-300 dark:hover:bg-zinc-600 transition-colors"
            >
              취소
            </button>
            <button
              onClick={() => {
                onConfirm();
              }}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              저장
            </button>
          </div>
        ),
      },
      async () => {
        // onConfirm
        if (!formDataRef.current.name.trim()) {
          showAlertModal("알림", "미용 타입명을 입력해주세요.");
          return;
        }

        const accessToken = getAccessToken();
        if (!accessToken || !selectedShopId) return;

        try {
          const response = await fetch(
            `${API_BASE_URL}/api/shops/${selectedShopId}/grooming-types/${type.id}`,
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
              },
              body: JSON.stringify({
                name: formDataRef.current.name.trim(),
                description:
                  formDataRef.current.description.trim() || undefined,
                default_price: formDataRef.current.price
                  ? parseInt(formDataRef.current.price, 10)
                  : 0,
              }),
            }
          );

          const data = await response.json();

          if (response.ok && data.success) {
            showAlertModal("알림", "미용 타입이 수정되었습니다.");
            fetchGroomingTypes(selectedShopId);
          } else {
            showAlertModal(
              "알림",
              data.message || "미용 타입 수정에 실패했습니다."
            );
          }
        } catch (error) {
          console.error("미용 타입 수정 실패:", error);
          showAlertModal("알림", "미용 타입 수정 중 오류가 발생했습니다.");
        }
      },
      closeModal
    );
  };

  // 삭제 확인 모달
  const showDeleteModal = (type: GroomingType) => {
    if (!selectedShopId) return;

    showModal(
      {
        header: "삭제 확인",
        body: () => (
          <p>
            <strong className="text-zinc-900 dark:text-zinc-100">
              {type.name}
            </strong>{" "}
            미용 타입을 삭제하시겠습니까?
          </p>
        ),
        footer: (onConfirm, _, onClose) => (
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 bg-zinc-200 dark:bg-zinc-700 rounded-lg hover:bg-zinc-300 dark:hover:bg-zinc-600 transition-colors"
            >
              취소
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
            >
              삭제
            </button>
          </div>
        ),
      },
      async () => {
        // onConfirm
        const accessToken = getAccessToken();
        if (!accessToken || !selectedShopId) return;

        try {
          const response = await fetch(
            `${API_BASE_URL}/api/shops/${selectedShopId}/grooming-types/${type.id}`,
            {
              method: "DELETE",
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            }
          );

          const data = await response.json();

          if (response.ok && data.success) {
            showAlertModal("알림", "미용 타입이 삭제되었습니다.");
            fetchGroomingTypes(selectedShopId);
          } else {
            showAlertModal(
              "알림",
              data.message || "미용 타입 삭제에 실패했습니다."
            );
          }
        } catch (error) {
          console.error("미용 타입 삭제 실패:", error);
          showAlertModal("알림", "미용 타입 삭제 중 오류가 발생했습니다.");
        }
      },
      closeModal
    );
  };

  // 선택된 매장이 변경되면 미용 타입 목록 조회
  useEffect(() => {
    if (selectedShopId) {
      fetchGroomingTypes(selectedShopId);
    }
  }, [selectedShopId]);

  return (
    <div className="min-h-screen bg-zinc-50 font-sans dark:bg-zinc-950">
      {/* 헤더 */}
      <header className="bg-white dark:bg-zinc-900 shadow-sm border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-6xl mx-auto px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push("/")}
                className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
              >
                <svg
                  className="w-5 h-5 text-zinc-600 dark:text-zinc-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <div>
                <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                  매장 설정
                </h1>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  미용 타입 관리
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="max-w-6xl mx-auto p-8">
        {/* 매장 선택 섹션 */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 p-6 mb-6">
          <div className="flex flex-col gap-4">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              매장 선택
            </h2>
            <div className="relative w-full max-w-md">
              {isLoadingShops ? (
                <div className="flex items-center gap-2 px-4 py-3 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span className="text-zinc-500 dark:text-zinc-400">
                    로딩 중...
                  </span>
                </div>
              ) : (
                <select
                  value={selectedShopId || ""}
                  onChange={(e) =>
                    setSelectedShopId(
                      e.target.value ? Number(e.target.value) : null
                    )
                  }
                  className="w-full px-4 py-3 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none cursor-pointer"
                >
                  {shops.length > 0 ? (
                    <>
                      <option value="" disabled>
                        매장을 선택하세요
                      </option>
                      {shops.map((shop) => (
                        <option key={shop.id} value={shop.id}>
                          {shop.name}
                        </option>
                      ))}
                    </>
                  ) : (
                    <option value="" disabled>
                      등록된 매장이 없습니다
                    </option>
                  )}
                </select>
              )}
              {!isLoadingShops && (
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg
                    className="w-5 h-5 text-zinc-400"
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
                </div>
              )}
            </div>
            {selectedShop && (
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                선택된 매장: <strong>{selectedShop.name}</strong>
              </p>
            )}
          </div>
        </div>

        {/* 미용 타입 목록 섹션 */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden">
          <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              미용 타입 목록
            </h2>
            <button
              onClick={() => setIsAddModalOpen(true)}
              disabled={!selectedShopId}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
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
              미용 타입 추가
            </button>
          </div>

          {isLoadingTypes ? (
            <div className="px-6 py-12 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-zinc-500 dark:text-zinc-400">로딩 중...</p>
            </div>
          ) : !selectedShopId ? (
            <div className="px-6 py-12 text-center">
              <p className="text-zinc-500 dark:text-zinc-400">
                매장을 먼저 선택해주세요.
              </p>
            </div>
          ) : groomingTypes.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-zinc-500 dark:text-zinc-400">
                등록된 미용 타입이 없습니다.
              </p>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="mt-4 px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
              >
                + 첫 미용 타입 추가하기
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-zinc-50 dark:bg-zinc-800/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                      미용 타입
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                      설명
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                      기본 금액
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                      상태
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                      관리
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {groomingTypes.map((type) => (
                    <tr
                      key={type.id}
                      className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                          {type.name}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-zinc-600 dark:text-zinc-400 max-w-md">
                        {type.description || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                          {formatPrice(type.default_price)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {type.is_active === false ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                            비활성화
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                            활성화
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => showEditModal(type)}
                            className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                            title="수정"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                          </button>
                          <button
                            onClick={() => showDeleteModal(type)}
                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            title="삭제"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* 미용 타입 추가 모달 (공통 컴포넌트) */}
      <GroomingTypeRegisterModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddGroomingType}
      />
    </div>
  );
}
