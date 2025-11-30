import { Router } from "express";
import {
  getAllDogs,
  getDogById,
  getDogWithAppointments,
  getDogsByShopId,
  searchDogsByName,
  createDog,
  updateDog,
  deleteDog,
} from "../controllers/dog.controller";

const router = Router();

// 모든 강아지 조회 (쿼리로 shopId 필터 가능)
router.get("/", getAllDogs);

// 강아지 이름으로 검색
router.get("/search", searchDogsByName);

// 특정 강아지 조회
router.get("/:id", getDogById);

// 강아지 상세 정보 조회 (예약 기록 포함)
router.get("/:id/appointments", getDogWithAppointments);

// 샵별 강아지 목록 조회
router.get("/shop/:shopId", getDogsByShopId);

// 새 강아지 등록
router.post("/", createDog);

// 강아지 정보 수정
router.put("/:id", updateDog);

// 강아지 삭제
router.delete("/:id", deleteDog);

export default router;
