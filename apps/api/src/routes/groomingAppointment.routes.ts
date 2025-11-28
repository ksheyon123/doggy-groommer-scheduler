import { Router } from "express";
import {
  getAllAppointments,
  getAppointmentById,
  createAppointment,
  updateAppointment,
  deleteAppointment,
  getAppointmentsByShopId,
  getAppointmentsByDogId,
  getAppointmentsByCreatedByUserId,
} from "../controllers/groomingAppointment.controller";

const router = Router();

// 모든 예약 조회 (쿼리로 shopId 필터 가능)
router.get("/", getAllAppointments);

// 특정 예약 조회
router.get("/:id", getAppointmentById);

// 샵별 예약 조회
router.get("/shop/:shopId", getAppointmentsByShopId);

// 강아지별 예약 조회
router.get("/dog/:dogId", getAppointmentsByDogId);

// 생성자별 예약 조회
router.get("/created-by/:userId", getAppointmentsByCreatedByUserId);

// 새 예약 생성
router.post("/", createAppointment);

// 예약 수정
router.put("/:id", updateAppointment);

// 예약 삭제
router.delete("/:id", deleteAppointment);

export default router;
