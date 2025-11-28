import { Request, Response } from "express";
import { GroomingAppointment } from "../models/GroomingAppointment";
import { Dog } from "../models/Dog";
import { User } from "../models/User";
import { Shop } from "../models/Shop";

// 샵별 모든 예약 조회
export const getAllAppointments = async (req: Request, res: Response) => {
  try {
    const { shopId } = req.query;

    const whereClause = shopId ? { shop_id: shopId } : {};

    const appointments = await GroomingAppointment.findAll({
      where: whereClause,
      include: [
        {
          model: Shop,
          attributes: ["id", "name"],
        },
        {
          model: User,
          as: "createdByUser",
          attributes: ["id", "username", "email"],
        },
        {
          model: Dog,
          attributes: ["id", "name", "breed"],
        },
      ],
      order: [["appointment_at", "DESC"]],
    });

    res.status(200).json({
      success: true,
      data: appointments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "예약 목록 조회 중 오류가 발생했습니다.",
      error: error instanceof Error ? error.message : "알 수 없는 오류",
    });
  }
};

// 특정 예약 조회
export const getAppointmentById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const appointment = await GroomingAppointment.findByPk(id, {
      include: [
        {
          model: Shop,
          attributes: ["id", "name"],
        },
        {
          model: User,
          as: "createdByUser",
          attributes: ["id", "username", "email"],
        },
        {
          model: Dog,
          attributes: ["id", "name", "breed", "note"],
        },
      ],
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "예약을 찾을 수 없습니다.",
      });
    }

    res.status(200).json({
      success: true,
      data: appointment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "예약 조회 중 오류가 발생했습니다.",
      error: error instanceof Error ? error.message : "알 수 없는 오류",
    });
  }
};

// 새 예약 생성
export const createAppointment = async (req: Request, res: Response) => {
  try {
    const {
      shop_id,
      dog_id,
      created_by_user_id,
      grooming_type,
      memo,
      amount,
      appointment_at,
      status,
    } = req.body;

    // 필수 필드 검증
    if (!shop_id || !dog_id || !created_by_user_id) {
      return res.status(400).json({
        success: false,
        message: "shop_id, dog_id, created_by_user_id는 필수입니다.",
      });
    }

    // 샵 존재 확인
    const shop = await Shop.findByPk(shop_id);
    if (!shop) {
      return res.status(404).json({
        success: false,
        message: "샵을 찾을 수 없습니다.",
      });
    }

    // 사용자 존재 확인
    const user = await User.findByPk(created_by_user_id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "사용자를 찾을 수 없습니다.",
      });
    }

    // 강아지 존재 확인
    const dog = await Dog.findByPk(dog_id);
    if (!dog) {
      return res.status(404).json({
        success: false,
        message: "강아지를 찾을 수 없습니다.",
      });
    }

    // 강아지가 해당 샵의 것인지 확인
    if (dog.shop_id !== shop_id) {
      return res.status(403).json({
        success: false,
        message: "해당 강아지는 이 샵에 등록되어 있지 않습니다.",
      });
    }

    const newAppointment = await GroomingAppointment.create({
      shop_id,
      dog_id,
      created_by_user_id,
      grooming_type,
      memo,
      amount,
      appointment_at,
      status: status || "scheduled",
    });

    const appointmentWithDetails = await GroomingAppointment.findByPk(
      newAppointment.id,
      {
        include: [
          {
            model: Shop,
            attributes: ["id", "name"],
          },
          {
            model: User,
            as: "createdByUser",
            attributes: ["id", "username", "email"],
          },
          {
            model: Dog,
            attributes: ["id", "name", "breed"],
          },
        ],
      }
    );

    res.status(201).json({
      success: true,
      message: "예약이 성공적으로 생성되었습니다.",
      data: appointmentWithDetails,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "예약 생성 중 오류가 발생했습니다.",
      error: error instanceof Error ? error.message : "알 수 없는 오류",
    });
  }
};

// 예약 수정
export const updateAppointment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { grooming_type, memo, amount, appointment_at, status } = req.body;

    const appointment = await GroomingAppointment.findByPk(id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "예약을 찾을 수 없습니다.",
      });
    }

    // 업데이트할 필드만 설정
    if (grooming_type !== undefined) appointment.grooming_type = grooming_type;
    if (memo !== undefined) appointment.memo = memo;
    if (amount !== undefined) appointment.amount = amount;
    if (appointment_at !== undefined)
      appointment.appointment_at = appointment_at;
    if (status !== undefined) appointment.status = status;

    await appointment.save();

    const updatedAppointment = await GroomingAppointment.findByPk(id, {
      include: [
        {
          model: Shop,
          attributes: ["id", "name"],
        },
        {
          model: User,
          as: "createdByUser",
          attributes: ["id", "username", "email"],
        },
        {
          model: Dog,
          attributes: ["id", "name", "breed"],
        },
      ],
    });

    res.status(200).json({
      success: true,
      message: "예약이 성공적으로 수정되었습니다.",
      data: updatedAppointment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "예약 수정 중 오류가 발생했습니다.",
      error: error instanceof Error ? error.message : "알 수 없는 오류",
    });
  }
};

// 예약 삭제
export const deleteAppointment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const appointment = await GroomingAppointment.findByPk(id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "예약을 찾을 수 없습니다.",
      });
    }

    await appointment.destroy();

    res.status(200).json({
      success: true,
      message: "예약이 성공적으로 삭제되었습니다.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "예약 삭제 중 오류가 발생했습니다.",
      error: error instanceof Error ? error.message : "알 수 없는 오류",
    });
  }
};

// 샵별 예약 조회
export const getAppointmentsByShopId = async (req: Request, res: Response) => {
  try {
    const { shopId } = req.params;

    const appointments = await GroomingAppointment.findAll({
      where: { shop_id: shopId },
      include: [
        {
          model: Shop,
          attributes: ["id", "name"],
        },
        {
          model: User,
          as: "createdByUser",
          attributes: ["id", "username", "email"],
        },
        {
          model: Dog,
          attributes: ["id", "name", "breed"],
        },
      ],
      order: [["appointment_at", "DESC"]],
    });

    res.status(200).json({
      success: true,
      data: appointments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "예약 목록 조회 중 오류가 발생했습니다.",
      error: error instanceof Error ? error.message : "알 수 없는 오류",
    });
  }
};

// 강아지별 예약 조회
export const getAppointmentsByDogId = async (req: Request, res: Response) => {
  try {
    const { dogId } = req.params;

    const appointments = await GroomingAppointment.findAll({
      where: { dog_id: dogId },
      include: [
        {
          model: Shop,
          attributes: ["id", "name"],
        },
        {
          model: User,
          as: "createdByUser",
          attributes: ["id", "username", "email"],
        },
        {
          model: Dog,
          attributes: ["id", "name", "breed"],
        },
      ],
      order: [["appointment_at", "DESC"]],
    });

    res.status(200).json({
      success: true,
      data: appointments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "예약 목록 조회 중 오류가 발생했습니다.",
      error: error instanceof Error ? error.message : "알 수 없는 오류",
    });
  }
};

// 생성자별 예약 조회
export const getAppointmentsByCreatedByUserId = async (
  req: Request,
  res: Response
) => {
  try {
    const { userId } = req.params;

    const appointments = await GroomingAppointment.findAll({
      where: { created_by_user_id: userId },
      include: [
        {
          model: Shop,
          attributes: ["id", "name"],
        },
        {
          model: User,
          as: "createdByUser",
          attributes: ["id", "username", "email"],
        },
        {
          model: Dog,
          attributes: ["id", "name", "breed"],
        },
      ],
      order: [["appointment_at", "DESC"]],
    });

    res.status(200).json({
      success: true,
      data: appointments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "예약 목록 조회 중 오류가 발생했습니다.",
      error: error instanceof Error ? error.message : "알 수 없는 오류",
    });
  }
};
