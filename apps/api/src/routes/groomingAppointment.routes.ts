import { Router } from "express";
import {
  getAllAppointments,
  getAppointmentById,
  createAppointment,
  updateAppointment,
  deleteAppointment,
  getAppointmentsByUserId,
  getAppointmentsByDogId,
} from "../controllers/groomingAppointment.controller";

const router = Router();

// 모든 예약 조회
router.get("/", getAllAppointments);

// 특정 예약 조회
router.get("/:id", getAppointmentById);

// 사용자별 예약 조회
router.get("/user/:userId", getAppointmentsByUserId);

// 강아지별 예약 조회
router.get("/dog/:dogId", getAppointmentsByDogId);

// 새 예약 생성
router.post("/", createAppointment);

// 예약 수정
router.put("/:id", updateAppointment);

// 예약 삭제
router.delete("/:id", deleteAppointment);

export default router;
