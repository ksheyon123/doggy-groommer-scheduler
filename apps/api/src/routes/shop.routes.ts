import { Router } from "express";
import {
  getAllShops,
  getShopById,
  createShop,
  updateShop,
  deleteShop,
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

export default router;
