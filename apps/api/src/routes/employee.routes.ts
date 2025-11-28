import { Router } from "express";
import {
  getEmployeesByShopId,
  getEmployeeById,
  getShopsByUserId,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} from "../controllers/employee.controller";

const router = Router();

// 샵별 직원 목록 조회
router.get("/shop/:shopId", getEmployeesByShopId);

// 특정 직원 조회
router.get("/:id", getEmployeeById);

// 사용자가 속한 샵 목록 조회
router.get("/user/:userId/shops", getShopsByUserId);

// 직원 추가 (샵에 사용자 등록)
router.post("/", createEmployee);

// 직원 역할 수정
router.put("/:id", updateEmployee);

// 직원 삭제 (샵에서 사용자 제거)
router.delete("/:id", deleteEmployee);

export default router;
