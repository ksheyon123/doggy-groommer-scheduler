"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import type { ReactNode } from "react";
import { getAccessToken } from "@/lib/auth";

// API 기본 URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

// Shop 타입
export interface Shop {
  id: number;
  name: string;
  address?: string;
  phone?: string;
}

interface ShopContextType {
  shops: Shop[];
  selectedShop: Shop | null;
  isLoadingShops: boolean;
  setSelectedShop: (shop: Shop | null) => void;
  refreshShops: () => Promise<void>;
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);

interface ShopProviderProps {
  children: ReactNode;
}

export function ShopProvider({ children }: ShopProviderProps) {
  const [shops, setShops] = useState<Shop[]>([]);
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
  const [isLoadingShops, setIsLoadingShops] = useState(false);
  const selectedShopRef = useRef<Shop | null>(null);

  // selectedShop이 변경될 때 ref도 업데이트
  useEffect(() => {
    selectedShopRef.current = selectedShop;
  }, [selectedShop]);

  // 매장 목록 가져오기
  const refreshShops = useCallback(async () => {
    const accessToken = getAccessToken();
    if (!accessToken) {
      setShops([]);
      setSelectedShop(null);
      return;
    }

    setIsLoadingShops(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/shops`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const data = await response.json();

      if (response.ok && data.success) {
        setShops(data.data);

        // localStorage에서 저장된 매장 ID 확인
        const savedShopId = localStorage.getItem("selectedShopId");
        const currentSelectedShop = selectedShopRef.current;

        // 선택된 매장이 없으면 localStorage 또는 첫 번째 매장을 기본 선택
        if (data.data.length > 0 && !currentSelectedShop) {
          if (savedShopId) {
            const savedShop = data.data.find(
              (s: Shop) => s.id === Number(savedShopId)
            );
            if (savedShop) {
              setSelectedShop(savedShop);
            } else {
              setSelectedShop(data.data[0]);
            }
          } else {
            setSelectedShop(data.data[0]);
          }
        }
        // 선택된 매장이 목록에 없으면 첫 번째 매장으로 변경
        else if (
          currentSelectedShop &&
          !data.data.find((s: Shop) => s.id === currentSelectedShop.id)
        ) {
          setSelectedShop(data.data.length > 0 ? data.data[0] : null);
        }
      }
    } catch (error) {
      console.error("매장 목록 조회 실패:", error);
    } finally {
      setIsLoadingShops(false);
    }
  }, []);

  // 선택된 매장을 localStorage에 저장
  useEffect(() => {
    if (selectedShop) {
      localStorage.setItem("selectedShopId", String(selectedShop.id));
    }
  }, [selectedShop]);

  // 컴포넌트 마운트 시 localStorage에서 선택된 매장 복원
  useEffect(() => {
    const savedShopId = localStorage.getItem("selectedShopId");
    if (savedShopId && shops.length > 0) {
      const savedShop = shops.find((s) => s.id === Number(savedShopId));
      if (savedShop) {
        setSelectedShop(savedShop);
      }
    }
  }, [shops]);

  const value: ShopContextType = {
    shops,
    selectedShop,
    isLoadingShops,
    setSelectedShop,
    refreshShops,
  };

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}

export function useShop(): ShopContextType {
  const context = useContext(ShopContext);
  if (context === undefined) {
    throw new Error("useShop must be used within a ShopProvider");
  }
  return context;
}
