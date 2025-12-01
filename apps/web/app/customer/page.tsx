"use client";

import { useState, useEffect } from "react";
import { useAuth, getAccessToken } from "@/lib/auth";
import { useShop } from "@/lib/shop";
import { useRouter } from "next/navigation";
import { Paginator } from "@repo/ui";

interface Dog {
  id: number;
  shop_id: number;
  name: string;
  breed: string | null;
  owner_name: string | null;
  owner_phone_number: string | null;
  note: string | null;
  created_at: string;
  updated_at: string;
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  limit: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export default function CustomerManagementPage() {
  const router = useRouter();
  const { isLoading } = useAuth();
  const [dogs, setDogs] = useState<Dog[]>([]);
  const [isLoadingDogs, setIsLoadingDogs] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const ITEMS_PER_PAGE = 10;
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedDog, setSelectedDog] = useState<Dog | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [newDog, setNewDog] = useState({
    name: "",
    breed: "",
    owner_name: "",
    owner_phone_number: "",
    note: "",
  });
  const [isRegistering, setIsRegistering] = useState(false);
  const [alertModal, setAlertModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
  }>({ isOpen: false, title: "", message: "" });

  const {
    shops,
    selectedShop: globalSelectedShop,
    isLoadingShops,
    refreshShops,
  } = useShop();
  const [selectedShopId, setSelectedShopId] = useState<number | null>(null);

  useEffect(() => {
    if (globalSelectedShop && selectedShopId === null)
      setSelectedShopId(globalSelectedShop.id);
  }, [globalSelectedShop, selectedShopId]);

  useEffect(() => {
    refreshShops();
  }, []);

  const showAlert = (title: string, message: string) =>
    setAlertModal({ isOpen: true, title, message });
  const closeAlert = () =>
    setAlertModal({ isOpen: false, title: "", message: "" });

  const fetchDogs = async (shopId: number, page: number = 1) => {
    const accessToken = getAccessToken();
    if (!accessToken) return;
    setIsLoadingDogs(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/dogs/shop/${shopId}?page=${page}&limit=${ITEMS_PER_PAGE}`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      const data = await response.json();
      if (response.ok && data.success) {
        setDogs(data.data);
        if (data.pagination) {
          setPagination(data.pagination);
        }
      } else {
        setDogs([]);
        setPagination(null);
      }
    } catch {
      setDogs([]);
      setPagination(null);
    } finally {
      setIsLoadingDogs(false);
    }
  };

  useEffect(() => {
    if (selectedShopId) {
      setCurrentPage(1);
      fetchDogs(selectedShopId, 1);
    } else {
      setDogs([]);
      setPagination(null);
    }
  }, [selectedShopId]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    if (selectedShopId) {
      fetchDogs(selectedShopId, page);
    }
  };

  const handleRegisterDog = async () => {
    if (!newDog.name.trim()) {
      showAlert("알림", "강아지 이름을 입력해주세요.");
      return;
    }
    if (!selectedShopId) {
      showAlert("알림", "매장을 선택해주세요.");
      return;
    }
    const accessToken = getAccessToken();
    if (!accessToken) {
      showAlert("알림", "로그인이 필요합니다.");
      return;
    }
    setIsRegistering(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/dogs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          shop_id: selectedShopId,
          name: newDog.name.trim(),
          breed: newDog.breed.trim() || null,
          owner_name: newDog.owner_name.trim() || null,
          owner_phone_number: newDog.owner_phone_number.trim() || null,
          note: newDog.note.trim() || null,
        }),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setNewDog({
          name: "",
          breed: "",
          owner_name: "",
          owner_phone_number: "",
          note: "",
        });
        setIsRegisterModalOpen(false);
        showAlert("알림", "강아지가 등록되었습니다.");
        setCurrentPage(1);
        fetchDogs(selectedShopId, 1);
      } else showAlert("알림", data.message || "등록에 실패했습니다.");
    } catch {
      showAlert("알림", "등록 중 오류가 발생했습니다.");
    } finally {
      setIsRegistering(false);
    }
  };

  const handleUpdateDog = async () => {
    if (!selectedDog) return;
    const accessToken = getAccessToken();
    if (!accessToken) {
      showAlert("알림", "로그인이 필요합니다.");
      return;
    }
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/dogs/${selectedDog.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            name: selectedDog.name.trim(),
            breed: selectedDog.breed?.trim() || null,
            owner_name: selectedDog.owner_name?.trim() || null,
            owner_phone_number: selectedDog.owner_phone_number?.trim() || null,
            note: selectedDog.note?.trim() || null,
          }),
        }
      );
      const data = await response.json();
      if (response.ok && data.success) {
        setIsEditMode(false);
        showAlert("알림", "정보가 수정되었습니다.");
        if (selectedShopId) fetchDogs(selectedShopId, currentPage);
      } else showAlert("알림", data.message || "수정에 실패했습니다.");
    } catch {
      showAlert("알림", "수정 중 오류가 발생했습니다.");
    }
  };

  const handleDeleteDog = async () => {
    if (!selectedDog) return;
    const accessToken = getAccessToken();
    if (!accessToken) {
      showAlert("알림", "로그인이 필요합니다.");
      return;
    }
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/dogs/${selectedDog.id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      const data = await response.json();
      if (response.ok && data.success) {
        setIsDetailModalOpen(false);
        setSelectedDog(null);
        showAlert("알림", "삭제되었습니다.");
        if (selectedShopId) {
          setCurrentPage(1);
          fetchDogs(selectedShopId, 1);
        }
      } else showAlert("알림", data.message || "삭제에 실패했습니다.");
    } catch {
      showAlert("알림", "삭제 중 오류가 발생했습니다.");
    }
  };

  const filteredDogs = dogs.filter((dog) => {
    const s = searchTerm.toLowerCase();
    return (
      dog.name.toLowerCase().includes(s) ||
      dog.owner_name?.toLowerCase().includes(s) ||
      dog.breed?.toLowerCase().includes(s) ||
      dog.owner_phone_number?.includes(searchTerm)
    );
  });

  const openDetailModal = (dog: Dog) => {
    setSelectedDog({ ...dog });
    setIsEditMode(false);
    setIsDetailModalOpen(true);
  };

  if (isLoading)
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );

  return (
    <div className="min-h-screen bg-zinc-50 font-sans dark:bg-zinc-950">
      {alertModal.isOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeAlert();
          }}
        >
          <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-2xl w-full max-w-sm mx-4">
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
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}

      {isRegisterModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsRegisterModalOpen(false);
          }}
        >
          <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-2xl w-full max-w-md mx-4">
            <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                강아지 등록
              </h3>
              <button
                onClick={() => setIsRegisterModalOpen(false)}
                className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg"
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
            <div className="px-6 py-6 space-y-4 max-h-[60vh] overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  강아지 이름 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newDog.name}
                  onChange={(e) =>
                    setNewDog({ ...newDog, name: e.target.value })
                  }
                  placeholder="강아지 이름"
                  className="w-full px-4 py-3 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  견종
                </label>
                <input
                  type="text"
                  value={newDog.breed}
                  onChange={(e) =>
                    setNewDog({ ...newDog, breed: e.target.value })
                  }
                  placeholder="견종"
                  className="w-full px-4 py-3 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  보호자 이름
                </label>
                <input
                  type="text"
                  value={newDog.owner_name}
                  onChange={(e) =>
                    setNewDog({ ...newDog, owner_name: e.target.value })
                  }
                  placeholder="보호자 이름"
                  className="w-full px-4 py-3 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  연락처
                </label>
                <input
                  type="tel"
                  value={newDog.owner_phone_number}
                  onChange={(e) =>
                    setNewDog({ ...newDog, owner_phone_number: e.target.value })
                  }
                  placeholder="연락처"
                  className="w-full px-4 py-3 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  메모
                </label>
                <textarea
                  value={newDog.note}
                  onChange={(e) =>
                    setNewDog({ ...newDog, note: e.target.value })
                  }
                  placeholder="메모"
                  rows={3}
                  className="w-full px-4 py-3 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 resize-none"
                />
              </div>
            </div>
            <div className="px-6 py-4 bg-zinc-50 dark:bg-zinc-800/50 border-t border-zinc-200 dark:border-zinc-800 flex justify-end gap-3">
              <button
                onClick={() => setIsRegisterModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 bg-zinc-200 dark:bg-zinc-700 rounded-lg"
              >
                취소
              </button>
              <button
                onClick={handleRegisterDog}
                disabled={isRegistering || !newDog.name.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg disabled:opacity-50"
              >
                {isRegistering ? "등록 중..." : "등록"}
              </button>
            </div>
          </div>
        </div>
      )}

      {isDetailModalOpen && selectedDog && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsDetailModalOpen(false);
              setSelectedDog(null);
              setIsEditMode(false);
            }
          }}
        >
          <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-2xl w-full max-w-md mx-4">
            <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                {isEditMode ? "정보 수정" : "상세 정보"}
              </h3>
              <button
                onClick={() => {
                  setIsDetailModalOpen(false);
                  setSelectedDog(null);
                  setIsEditMode(false);
                }}
                className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg"
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
            <div className="px-6 py-6 space-y-4 max-h-[60vh] overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  강아지 이름
                </label>
                {isEditMode ? (
                  <input
                    type="text"
                    value={selectedDog.name}
                    onChange={(e) =>
                      setSelectedDog({ ...selectedDog, name: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                  />
                ) : (
                  <p className="px-4 py-3 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-zinc-900 dark:text-zinc-100">
                    {selectedDog.name}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  견종
                </label>
                {isEditMode ? (
                  <input
                    type="text"
                    value={selectedDog.breed || ""}
                    onChange={(e) =>
                      setSelectedDog({ ...selectedDog, breed: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                  />
                ) : (
                  <p className="px-4 py-3 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-zinc-900 dark:text-zinc-100">
                    {selectedDog.breed || "-"}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  보호자 이름
                </label>
                {isEditMode ? (
                  <input
                    type="text"
                    value={selectedDog.owner_name || ""}
                    onChange={(e) =>
                      setSelectedDog({
                        ...selectedDog,
                        owner_name: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                  />
                ) : (
                  <p className="px-4 py-3 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-zinc-900 dark:text-zinc-100">
                    {selectedDog.owner_name || "-"}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  연락처
                </label>
                {isEditMode ? (
                  <input
                    type="tel"
                    value={selectedDog.owner_phone_number || ""}
                    onChange={(e) =>
                      setSelectedDog({
                        ...selectedDog,
                        owner_phone_number: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                  />
                ) : (
                  <p className="px-4 py-3 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-zinc-900 dark:text-zinc-100">
                    {selectedDog.owner_phone_number || "-"}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  메모
                </label>
                {isEditMode ? (
                  <textarea
                    value={selectedDog.note || ""}
                    onChange={(e) =>
                      setSelectedDog({ ...selectedDog, note: e.target.value })
                    }
                    rows={3}
                    className="w-full px-4 py-3 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 resize-none"
                  />
                ) : (
                  <p className="px-4 py-3 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-zinc-900 dark:text-zinc-100 whitespace-pre-wrap">
                    {selectedDog.note || "-"}
                  </p>
                )}
              </div>
            </div>
            <div className="px-6 py-4 bg-zinc-50 dark:bg-zinc-800/50 border-t border-zinc-200 dark:border-zinc-800 flex justify-between">
              {isEditMode ? (
                <>
                  <button
                    onClick={() => setIsEditMode(false)}
                    className="px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 bg-zinc-200 dark:bg-zinc-700 rounded-lg"
                  >
                    취소
                  </button>
                  <button
                    onClick={handleUpdateDog}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg"
                  >
                    저장
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleDeleteDog}
                    className="px-4 py-2 text-sm font-medium text-red-600 bg-red-100 rounded-lg"
                  >
                    삭제
                  </button>
                  <button
                    onClick={() => setIsEditMode(true)}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg"
                  >
                    수정
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <header className="bg-white dark:bg-zinc-900 shadow-sm border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-6xl mx-auto px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push("/")}
                className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg"
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
                  고객 관리
                </h1>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  강아지 및 보호자 정보 관리
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsRegisterModalOpen(true)}
              disabled={!selectedShopId}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
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
              등록
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-8">
        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 p-6 mb-6">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
            매장 선택
          </h2>
          {isLoadingShops ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span className="text-zinc-500">로딩 중...</span>
            </div>
          ) : (
            <select
              value={selectedShopId || ""}
              onChange={(e) =>
                setSelectedShopId(
                  e.target.value ? Number(e.target.value) : null
                )
              }
              className="w-full max-w-md px-4 py-3 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
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
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400"
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
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="강아지 이름, 보호자 이름, 연락처로 검색"
                className="w-full pl-10 pr-4 py-3 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
              />
            </div>
            <span className="text-sm text-zinc-500">
              총 {filteredDogs.length}건
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden">
          <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              강아지 목록
            </h2>
          </div>
          {isLoadingDogs ? (
            <div className="px-6 py-12 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-zinc-500">로딩 중...</span>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-zinc-50 dark:bg-zinc-800/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase">
                        강아지 이름
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase">
                        견종
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase">
                        보호자
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase">
                        연락처
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-zinc-500 uppercase">
                        관리
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                    {filteredDogs.map((dog) => (
                      <tr
                        key={dog.id}
                        className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                      >
                        <td className="px-6 py-4">
                          <span className="font-medium text-zinc-900 dark:text-zinc-100">
                            {dog.name}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-zinc-600 dark:text-zinc-400">
                          {dog.breed || "-"}
                        </td>
                        <td className="px-6 py-4 text-zinc-600 dark:text-zinc-400">
                          {dog.owner_name || "-"}
                        </td>
                        <td className="px-6 py-4 text-zinc-600 dark:text-zinc-400">
                          {dog.owner_phone_number || "-"}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => openDetailModal(dog)}
                            className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg"
                          >
                            상세
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {filteredDogs.length === 0 && (
                <div className="px-6 py-12 text-center">
                  <p className="text-zinc-500">
                    {selectedShopId
                      ? "등록된 강아지가 없습니다."
                      : "매장을 선택해주세요."}
                  </p>
                </div>
              )}
              {pagination && filteredDogs.length > 0 && (
                <Paginator
                  pagination={pagination}
                  onPageChange={handlePageChange}
                />
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
