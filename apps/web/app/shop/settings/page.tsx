"use client";

import { useState, useEffect } from "react";
import { getAccessToken } from "@/lib/auth";
import { useShop } from "@/lib/shop";
import { useRouter } from "next/navigation";
import { Select } from "@repo/ui";

// 미용 타입
interface GroomingType {
  id: number;
  name: string;
  description?: string;
}

// API 기본 URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export default function ShopSettingsPage() {
  const router = useRouter();

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

  // 미용 타입 추가 폼 상태
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTypeName, setNewTypeName] = useState("");
  const [newTypeDescription, setNewTypeDescription] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  // 알림 모달 상태
  const [alertModal, setAlertModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
  }>({ isOpen: false, title: "", message: "" });

  // 삭제 확인 모달 상태
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    typeId: number | null;
    typeName: string;
  }>({ isOpen: false, typeId: null, typeName: "" });

  // 선택된 매장 정보
  const selectedShop = shops.find((shop) => shop.id === selectedShopId);

  // 알림 모달 표시
  const showAlert = (title: string, message: string) => {
    setAlertModal({ isOpen: true, title, message });
  };

  // 알림 모달 닫기
  const closeAlert = () => {
    setAlertModal({ isOpen: false, title: "", message: "" });
  };

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

  // 미용 타입 목록 조회
  const fetchGroomingTypes = async (shopId: number) => {
    const accessToken = getAccessToken();
    if (!accessToken) return;

    setIsLoadingTypes(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/shops/${shopId}/grooming-types`,
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

  // 미용 타입 추가
  const handleAddGroomingType = async () => {
    if (!newTypeName.trim()) {
      showAlert("알림", "미용 타입명을 입력해주세요.");
      return;
    }

    const accessToken = getAccessToken();
    if (!accessToken || !selectedShopId) return;

    setIsAdding(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/shops/${selectedShopId}/grooming-types`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            name: newTypeName.trim(),
            description: newTypeDescription.trim() || undefined,
          }),
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        setNewTypeName("");
        setNewTypeDescription("");
        setIsAddModalOpen(false);
        showAlert("알림", "미용 타입이 추가되었습니다.");
        fetchGroomingTypes(selectedShopId);
      } else {
        showAlert("알림", data.message || "미용 타입 추가에 실패했습니다.");
      }
    } catch (error) {
      console.error("미용 타입 추가 실패:", error);
      showAlert("알림", "미용 타입 추가 중 오류가 발생했습니다.");
    } finally {
      setIsAdding(false);
    }
  };

  // 미용 타입 삭제
  const handleDeleteGroomingType = async () => {
    if (!deleteModal.typeId || !selectedShopId) return;

    const accessToken = getAccessToken();
    if (!accessToken) return;

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/shops/${selectedShopId}/grooming-types/${deleteModal.typeId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        showAlert("알림", "미용 타입이 삭제되었습니다.");
        fetchGroomingTypes(selectedShopId);
      } else {
        showAlert("알림", data.message || "미용 타입 삭제에 실패했습니다.");
      }
    } catch (error) {
      console.error("미용 타입 삭제 실패:", error);
      showAlert("알림", "미용 타입 삭제 중 오류가 발생했습니다.");
    } finally {
      setDeleteModal({ isOpen: false, typeId: null, typeName: "" });
    }
  };

  // 선택된 매장이 변경되면 미용 타입 목록 조회
  useEffect(() => {
    if (selectedShopId) {
      fetchGroomingTypes(selectedShopId);
    }
  }, [selectedShopId]);

  return (
    <div className="min-h-screen bg-zinc-50 font-sans dark:bg-zinc-950">
      {/* 알림 모달 */}
      {alertModal.isOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeAlert();
          }}
        >
          <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                {alertModal.title}
              </h3>
            </div>
            <div className="px-6 py-6">
              <p className="text-zinc-700 dark:text-zinc-300">
                {alertModal.message}
              </p>
            </div>
            <div className="px-6 py-4 bg-zinc-50 dark:bg-zinc-800/50 border-t border-zinc-200 dark:border-zinc-800 flex justify-end">
              <button
                onClick={closeAlert}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 삭제 확인 모달 */}
      {deleteModal.isOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget)
              setDeleteModal({ isOpen: false, typeId: null, typeName: "" });
          }}
        >
          <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                삭제 확인
              </h3>
            </div>
            <div className="px-6 py-6">
              <p className="text-zinc-700 dark:text-zinc-300">
                <strong className="text-zinc-900 dark:text-zinc-100">
                  {deleteModal.typeName}
                </strong>{" "}
                미용 타입을 삭제하시겠습니까?
              </p>
            </div>
            <div className="px-6 py-4 bg-zinc-50 dark:bg-zinc-800/50 border-t border-zinc-200 dark:border-zinc-800 flex justify-end gap-3">
              <button
                onClick={() =>
                  setDeleteModal({ isOpen: false, typeId: null, typeName: "" })
                }
                className="px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 bg-zinc-200 dark:bg-zinc-700 rounded-lg hover:bg-zinc-300 dark:hover:bg-zinc-600 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleDeleteGroomingType}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 미용 타입 추가 모달 */}
      {isAddModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsAddModalOpen(false);
          }}
        >
          <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                미용 타입 추가
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
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

            <div className="px-6 py-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  미용 타입명 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newTypeName}
                  onChange={(e) => setNewTypeName(e.target.value)}
                  placeholder="예: 전체 미용, 부분 미용, 목욕"
                  className="w-full px-4 py-3 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  설명 (선택)
                </label>
                <textarea
                  value={newTypeDescription}
                  onChange={(e) => setNewTypeDescription(e.target.value)}
                  placeholder="미용 타입에 대한 설명을 입력하세요"
                  rows={3}
                  className="w-full px-4 py-3 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>
            </div>

            <div className="px-6 py-4 bg-zinc-50 dark:bg-zinc-800/50 border-t border-zinc-200 dark:border-zinc-800 flex justify-end gap-3">
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 bg-zinc-200 dark:bg-zinc-700 rounded-lg hover:bg-zinc-300 dark:hover:bg-zinc-600 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleAddGroomingType}
                disabled={isAdding || !newTypeName.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                {isAdding ? (
                  <>
                    <svg
                      className="animate-spin w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    추가 중...
                  </>
                ) : (
                  "추가"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

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
            <div className="w-full max-w-md">
              {isLoadingShops ? (
                <div className="flex items-center gap-2 px-4 py-3 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span className="text-zinc-500 dark:text-zinc-400">
                    로딩 중...
                  </span>
                </div>
              ) : (
                <Select
                  placeholder="매장을 선택하세요"
                  options={shops.map((shop) => ({
                    id: shop.id,
                    label: shop.name,
                  }))}
                  selectedId={selectedShopId}
                  onSelectionChange={(id) =>
                    setSelectedShopId(id as number | null)
                  }
                  emptyMessage="등록된 매장이 없습니다"
                />
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
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <button
                          onClick={() =>
                            setDeleteModal({
                              isOpen: true,
                              typeId: type.id,
                              typeName: type.name,
                            })
                          }
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
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
