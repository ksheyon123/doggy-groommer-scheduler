"use client";

import { useState, useEffect } from "react";
import { useAuth, getAccessToken } from "@/lib/auth";
import { useShop } from "@/lib/shop";
import { useRouter } from "next/navigation";
import { Paginator } from "@repo/ui";

// 타입 정의
interface Shop {
  id: number;
  name: string;
  role: string;
  employee_id: number;
}

interface Employee {
  id: number;
  shop_id: number;
  user_id: number;
  role: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
  shop: {
    id: number;
    name: string;
  };
}

// Pagination 타입
interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  limit: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

// API 기본 URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export default function EmployeeManagementPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  // 전역 샵 상태 사용
  const { selectedShop: globalSelectedShop } = useShop();

  // 상태 관리
  const [ownerShops, setOwnerShops] = useState<Shop[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedShopId, setSelectedShopId] = useState<number | null>(null);
  const [isLoadingShops, setIsLoadingShops] = useState(false);
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const ITEMS_PER_PAGE = 10;

  // 직원 추가 모달 상태
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addShopId, setAddShopId] = useState<number | null>(null);
  const [addEmail, setAddEmail] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  // 알림 모달 상태
  const [alertModal, setAlertModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
  }>({ isOpen: false, title: "", message: "" });

  // 직원 삭제 확인 모달 상태
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    employeeId: number | null;
    employeeName: string;
  }>({ isOpen: false, employeeId: null, employeeName: "" });

  // 알림 모달 표시
  const showAlert = (title: string, message: string) => {
    setAlertModal({ isOpen: true, title, message });
  };

  // 알림 모달 닫기
  const closeAlert = () => {
    setAlertModal({ isOpen: false, title: "", message: "" });
  };

  // Owner인 매장 목록 조회
  const fetchOwnerShops = async () => {
    if (!user?.id) return;

    setIsLoadingShops(true);
    try {
      const accessToken = getAccessToken();
      const response = await fetch(
        `${API_BASE_URL}/api/employees/user/${user.id}/shops`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      const data = await response.json();
      if (response.ok && data.success) {
        // role이 'owner'인 매장만 필터링
        const ownerOnlyShops = data.data.filter(
          (shop: Shop) => shop.role === "owner"
        );
        setOwnerShops(ownerOnlyShops);
      }
    } catch (error) {
      console.error("매장 목록 조회 실패:", error);
    } finally {
      setIsLoadingShops(false);
    }
  };

  // 선택된 매장의 직원 목록 조회
  const fetchEmployees = async (page: number = 1) => {
    if (!selectedShopId) return;

    setIsLoadingEmployees(true);
    try {
      const accessToken = getAccessToken();
      const response = await fetch(
        `${API_BASE_URL}/api/employees/shop/${selectedShopId}?page=${page}&limit=${ITEMS_PER_PAGE}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      const data = await response.json();
      if (response.ok && data.success) {
        setEmployees(data.data);
        if (data.pagination) {
          setPagination(data.pagination);
        }
      } else {
        setEmployees([]);
        setPagination(null);
      }
    } catch (error) {
      console.error("직원 목록 조회 실패:", error);
      setEmployees([]);
      setPagination(null);
    } finally {
      setIsLoadingEmployees(false);
    }
  };

  // 컴포넌트 마운트 시 매장 목록 조회
  useEffect(() => {
    if (user?.id) {
      fetchOwnerShops();
    }
  }, [user?.id]);

  // 전역 상태가 변경되면 로컬 상태에 반영 (초기화 시)
  useEffect(() => {
    if (globalSelectedShop && !isInitialized && ownerShops.length > 0) {
      // 전역 선택된 매장이 owner 매장 목록에 있는지 확인
      const matchingShop = ownerShops.find(
        (shop) => shop.id === globalSelectedShop.id
      );
      if (matchingShop) {
        setSelectedShopId(matchingShop.id);
      }
      setIsInitialized(true);
    }
  }, [globalSelectedShop, ownerShops, isInitialized]);

  // 선택된 매장 변경 시 직원 목록 조회
  useEffect(() => {
    if (selectedShopId) {
      setCurrentPage(1);
      fetchEmployees(1);
    } else {
      setEmployees([]);
      setPagination(null);
    }
  }, [selectedShopId]);

  // 페이지 변경
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchEmployees(page);
  };

  // 직원 추가 처리
  const handleAddEmployee = async () => {
    if (!addShopId || !addEmail.trim()) {
      showAlert("알림", "매장과 이메일을 모두 입력해주세요.");
      return;
    }

    const accessToken = getAccessToken();
    if (!accessToken) {
      showAlert("알림", "로그인이 필요합니다.");
      return;
    }

    setIsAdding(true);
    try {
      // 먼저 이메일로 사용자 조회 (실제로는 이메일로 사용자를 찾는 API가 필요)
      // 여기서는 초대 시스템을 사용한다고 가정
      const response = await fetch(`${API_BASE_URL}/api/invitations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          shop_id: addShopId,
          email: addEmail.trim(),
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setIsAddModalOpen(false);
        setAddShopId(null);
        setAddEmail("");
        showAlert("알림", "초대가 발송되었습니다.");
        // 직원 목록 새로고침
        if (selectedShopId === addShopId) {
          setCurrentPage(1);
          fetchEmployees(1);
        }
      } else {
        showAlert("알림", data.message || "직원 추가에 실패했습니다.");
      }
    } catch (error) {
      console.error("직원 추가 실패:", error);
      showAlert("알림", "직원 추가 중 오류가 발생했습니다.");
    } finally {
      setIsAdding(false);
    }
  };

  // 직원 추가 모달 열기
  const openAddEmployeeModal = () => {
    setAddShopId(ownerShops.length > 0 ? ownerShops[0].id : null);
    setAddEmail("");
    setIsAddModalOpen(true);
  };

  // role 한글 변환
  const getRoleLabel = (role: string) => {
    switch (role) {
      case "owner":
        return "소유자";
      case "manager":
        return "매니저";
      case "staff":
        return "직원";
      default:
        return role;
    }
  };

  // role 배지 색상
  const getRoleBadge = (role: string) => {
    switch (role) {
      case "owner":
        return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400";
      case "manager":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
      case "staff":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
      default:
        return "bg-zinc-100 text-zinc-700 dark:bg-zinc-900/30 dark:text-zinc-400";
    }
  };

  // 직원 해제 처리
  const handleDeleteEmployee = async () => {
    if (!deleteModal.employeeId || !selectedShopId) return;

    const accessToken = getAccessToken();
    if (!accessToken) {
      showAlert("알림", "로그인이 필요합니다.");
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/employees/${deleteModal.employeeId}?shopId=${selectedShopId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        showAlert("알림", "직원이 해제되었습니다.");
        fetchEmployees(currentPage);
      } else {
        showAlert("알림", data.message || "직원 해제에 실패했습니다.");
      }
    } catch (error) {
      console.error("직원 삭제 실패:", error);
      showAlert("알림", "직원 해제 중 오류가 발생했습니다.");
    } finally {
      setDeleteModal({ isOpen: false, employeeId: null, employeeName: "" });
    }
  };

  // 해제 버튼 클릭 핸들러
  const openDeleteModal = (employee: Employee) => {
    setDeleteModal({
      isOpen: true,
      employeeId: employee.id,
      employeeName: employee.user?.name || employee.user?.email || "직원",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 font-sans dark:bg-zinc-950">
      {/* 직원 추가 모달 */}
      {isAddModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsAddModalOpen(false);
          }}
        >
          <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* 모달 헤더 */}
            <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                직원 추가
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

            {/* 모달 본문 */}
            <div className="px-6 py-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  매장 선택
                </label>
                <select
                  value={addShopId || ""}
                  onChange={(e) =>
                    setAddShopId(e.target.value ? Number(e.target.value) : null)
                  }
                  className="w-full px-4 py-3 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {ownerShops.length > 0 ? (
                    ownerShops.map((shop) => (
                      <option key={shop.id} value={shop.id}>
                        {shop.name}
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>
                      Owner인 매장이 없습니다
                    </option>
                  )}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  이메일
                </label>
                <input
                  type="email"
                  value={addEmail}
                  onChange={(e) => setAddEmail(e.target.value)}
                  placeholder="직원의 이메일을 입력하세요"
                  className="w-full px-4 py-3 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && addShopId && addEmail.trim()) {
                      handleAddEmployee();
                    }
                  }}
                  autoFocus
                />
              </div>
            </div>

            {/* 모달 푸터 */}
            <div className="px-6 py-4 bg-zinc-50 dark:bg-zinc-800/50 border-t border-zinc-200 dark:border-zinc-800 flex justify-end gap-3">
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 bg-zinc-200 dark:bg-zinc-700 rounded-lg hover:bg-zinc-300 dark:hover:bg-zinc-600 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleAddEmployee}
                disabled={isAdding || !addShopId || !addEmail.trim()}
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

      {/* 직원 삭제 확인 모달 */}
      {deleteModal.isOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget)
              setDeleteModal({
                isOpen: false,
                employeeId: null,
                employeeName: "",
              });
          }}
        >
          <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                직원 해제 확인
              </h3>
            </div>
            <div className="px-6 py-6">
              <p className="text-zinc-700 dark:text-zinc-300">
                <strong className="text-zinc-900 dark:text-zinc-100">
                  {deleteModal.employeeName}
                </strong>{" "}
                님을 해당 매장에서 해제하시겠습니까?
              </p>
            </div>
            <div className="px-6 py-4 bg-zinc-50 dark:bg-zinc-800/50 border-t border-zinc-200 dark:border-zinc-800 flex justify-end gap-3">
              <button
                onClick={() =>
                  setDeleteModal({
                    isOpen: false,
                    employeeId: null,
                    employeeName: "",
                  })
                }
                className="px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 bg-zinc-200 dark:bg-zinc-700 rounded-lg hover:bg-zinc-300 dark:hover:bg-zinc-600 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleDeleteEmployee}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
              >
                해제
              </button>
            </div>
          </div>
        </div>
      )}

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
                  직원 관리
                </h1>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  매장 직원 목록 및 초대 관리
                </p>
              </div>
            </div>
            <button
              onClick={openAddEmployeeModal}
              disabled={ownerShops.length === 0}
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
              직원 추가
            </button>
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
                  {ownerShops.length > 0 ? (
                    <>
                      <option value="" disabled>
                        매장을 선택하세요
                      </option>
                      {ownerShops.map((shop) => (
                        <option key={shop.id} value={shop.id}>
                          {shop.name}
                        </option>
                      ))}
                    </>
                  ) : (
                    <option value="" disabled>
                      Owner인 매장이 없습니다
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
            {ownerShops.length === 0 && !isLoadingShops && (
              <p className="text-sm text-yellow-600 dark:text-yellow-400">
                Owner 권한이 있는 매장이 없습니다. 먼저 매장을 등록해주세요.
              </p>
            )}
          </div>
        </div>

        {/* 직원 목록 테이블 */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden">
          <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              직원 목록
            </h2>
          </div>
          {isLoadingEmployees ? (
            <div className="px-6 py-12 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-zinc-50 dark:bg-zinc-800/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                      역할
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                      이름
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                      이메일
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                      관리
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {employees.map((employee) => (
                    <tr
                      key={employee.id}
                      className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getRoleBadge(employee.role)}`}
                        >
                          {getRoleLabel(employee.role)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                          {employee.user?.name || "-"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-600 dark:text-zinc-400">
                        {employee.user?.email || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {employee.role !== "owner" && (
                          <button
                            onClick={() => openDeleteModal(employee)}
                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            title="직원 해제"
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
                        )}
                        {employee.role === "owner" && (
                          <span className="text-xs text-zinc-400 dark:text-zinc-500">
                            -
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {!isLoadingEmployees && employees.length === 0 && (
            <div className="px-6 py-12 text-center">
              <p className="text-zinc-500 dark:text-zinc-400">
                {selectedShopId
                  ? "등록된 직원이 없습니다."
                  : "매장을 선택해주세요."}
              </p>
            </div>
          )}
          {pagination && employees.length > 0 && (
            <Paginator
              pagination={pagination}
              onPageChange={handlePageChange}
            />
          )}
        </div>
      </main>
    </div>
  );
}
