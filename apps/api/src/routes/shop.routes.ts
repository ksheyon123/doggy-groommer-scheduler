import { Router } from "express";
import {
  getAllShops,
  getShopById,
  createShop,
  updateShop,
  deleteShop,
  getGroomingTypes,
  addGroomingType,
  updateGroomingType,
  deleteGroomingType,
} from "../controllers/shop.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

// 모든 샵 조회 (사용자가 속한 샵만)
router.get("/", authMiddleware, getAllShops);

// 특정 샵 조회
router.get("/:id", getShopById);

// 새 샵 등록 (인증 필요)
router.post("/", authMiddleware, createShop);

// 샵 정보 수정
router.put("/:id", updateShop);

// 샵 삭제
router.delete("/:id", deleteShop);

// 미용 타입 관련 라우트
// 미용 타입 목록 조회
router.get("/:id/grooming-types", authMiddleware, getGroomingTypes);

// 미용 타입 추가
router.post("/:id/grooming-types", authMiddleware, addGroomingType);

// 미용 타입 수정
router.put("/:id/grooming-types/:typeId", authMiddleware, updateGroomingType);

// 미용 타입 삭제
router.delete(
  "/:id/grooming-types/:typeId",
  authMiddleware,
  deleteGroomingType
);

export default router;
