import { Request, Response } from "express";
import { Op, fn, col } from "sequelize";
import { GroomingAppointment } from "../models/GroomingAppointment";
import { GroomingType } from "../models/GroomingType";
import { AppointmentGroomingType } from "../models/AppointmentGroomingType";
import { Dog } from "../models/Dog";
import { User } from "../models/User";
import { Shop } from "../models/Shop";

// API 응답용 타입 정의
interface GroomingTypeData {
  id: number;
  name: string;
  description?: string;
  default_price?: number;
}

interface AppointmentGroomingTypeData {
  id: number;
  appointment_id: number;
  grooming_type_id: number;
  applied_price: number;
  groomingType?: GroomingTypeData;
}

interface AppointmentData {
  id: number;
  shop_id: number;
  dog_id: number;
  created_by_user_id: number;
  assigned_user_id?: number | null;
  grooming_type?: string;
  memo?: string;
  amount?: number | null;
  appointment_at?: string;
  start_time?: string;
  end_time?: string;
  status?: string;
  groomingTypes?: AppointmentGroomingTypeData[];
  [key: string]: unknown;
}

// appointment 데이터에 grooming_type 필드 동적 추가 (groomingTypes의 name들을 쉼표로 join)
const addComputedGroomingType = (
  appointment: GroomingAppointment | AppointmentData | null
): AppointmentData | null => {
  if (!appointment) return appointment;

  const appointmentData: AppointmentData =
    "toJSON" in appointment && typeof appointment.toJSON === "function"
      ? (appointment.toJSON() as AppointmentData)
      : (appointment as AppointmentData);

  // AppointmentGroomingTypes에서 GroomingType의 name들을 추출하여 join
  const groomingTypeNames =
    appointmentData.groomingTypes
      ?.map((agt: AppointmentGroomingTypeData) => agt.groomingType?.name)
      .filter(Boolean)
      .join(", ") || "";

  return {
    ...appointmentData,
    grooming_type: groomingTypeNames,
  };
};

// 배열에 대해 grooming_type 필드 동적 추가
const addComputedGroomingTypeToList = (
  appointments: (GroomingAppointment | AppointmentData)[]
): (AppointmentData | null)[] => {
  return appointments.map(addComputedGroomingType);
};

// 공통 include 설정
const getCommonIncludes = () => [
  {
    model: Shop,
    attributes: ["id", "name"],
  },
  {
    model: User,
    as: "createdByUser",
    attributes: ["id", "name", "email"],
  },
  {
    model: User,
    as: "assignedUser",
    attributes: ["id", "name", "email"],
  },
  {
    model: Dog,
    attributes: ["id", "name", "breed"],
  },
  {
    model: AppointmentGroomingType,
    include: [
      {
        model: GroomingType,
        attributes: ["id", "name", "description", "default_price"],
      },
    ],
  },
];

// 샵별 모든 예약 조회
export const getAllAppointments = async (req: Request, res: Response) => {
  try {
    const { shopId } = req.query;

    const whereClause = shopId ? { shop_id: shopId } : {};

    const appointments = await GroomingAppointment.findAll({
      where: whereClause,
      include: getCommonIncludes(),
      order: [["appointment_at", "DESC"]],
    });

    res.status(200).json({
      success: true,
      data: addComputedGroomingTypeToList(appointments),
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
          attributes: ["id", "name", "email"],
        },
        {
          model: User,
          as: "assignedUser",
          attributes: ["id", "name", "email"],
        },
        {
          model: Dog,
          attributes: ["id", "name", "breed", "note"],
        },
        {
          model: AppointmentGroomingType,
          include: [
            {
              model: GroomingType,
              attributes: ["id", "name", "description", "default_price"],
            },
          ],
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
      data: addComputedGroomingType(appointment),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "예약 조회 중 오류가 발생했습니다.",
      error: error instanceof Error ? error.message : "알 수 없는 오류",
    });
  }
};

// start_time에서 2시간을 더한 시간 계산
const calculateEndTime = (startTime: string): string => {
  const [hours, minutes] = startTime.split(":").map(Number);
  let endHours = hours + 2;
  const endMinutes = minutes;

  // 24시간 형식 유지
  if (endHours >= 24) {
    endHours = endHours - 24;
  }

  return `${endHours.toString().padStart(2, "0")}:${endMinutes.toString().padStart(2, "0")}`;
};

// 새 예약 생성
export const createAppointment = async (req: Request, res: Response) => {
  try {
    const {
      shop_id,
      dog_id,
      created_by_user_id,
      assigned_user_id,
      grooming_type,
      grooming_types, // 새로운 배열 형식: [{ grooming_type_id: number, applied_price?: number }]
      memo,
      amount,
      appointment_at,
      start_time,
      end_time,
      status,
    } = req.body;

    // 필수 필드 검증
    if (!shop_id || !dog_id || !created_by_user_id) {
      return res.status(400).json({
        success: false,
        message: "shop_id, dog_id, created_by_user_id는 필수입니다.",
      });
    }

    // end_time이 없으면 start_time + 2시간으로 설정
    const calculatedEndTime =
      end_time || (start_time ? calculateEndTime(start_time) : undefined);

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

    // (레거시) grooming_type이 있으면 GroomingType 테이블에 추가 (없을 경우에만)
    if (grooming_type && grooming_type.trim()) {
      await GroomingType.findOrCreate({
        where: {
          shop_id: shop_id,
          name: grooming_type.trim(),
        },
        defaults: {
          shop_id: shop_id,
          name: grooming_type.trim(),
          description: null,
        },
      });
    }

    const newAppointment = await GroomingAppointment.create({
      shop_id,
      dog_id,
      created_by_user_id,
      assigned_user_id,
      grooming_type, // 레거시 필드 유지
      memo,
      amount,
      appointment_at,
      start_time,
      end_time: calculatedEndTime,
      status: status || "scheduled",
    });

    // 새로운 grooming_types 배열 처리
    if (
      grooming_types &&
      Array.isArray(grooming_types) &&
      grooming_types.length > 0
    ) {
      // 먼저 모든 미용 타입 유효성 검증
      for (const gt of grooming_types) {
        const groomingType = await GroomingType.findByPk(gt.grooming_type_id);

        if (!groomingType || groomingType.shop_id !== shop_id) {
          return res.status(400).json({
            success: false,
            message: "유효하지 않은 미용 타입이 포함되어 있습니다.",
          });
        }

        if (groomingType.is_active === false) {
          return res.status(400).json({
            success: false,
            message: `미용 타입 '${groomingType.name}'은(는) 현재 비활성화되어 사용할 수 없습니다.`,
          });
        }
      }

      // 검증 통과 후 미용 타입 등록
      for (const gt of grooming_types) {
        const groomingType = await GroomingType.findByPk(gt.grooming_type_id);
        if (groomingType) {
          await AppointmentGroomingType.create({
            appointment_id: newAppointment.id,
            grooming_type_id: gt.grooming_type_id,
            applied_price: gt.applied_price ?? groomingType.default_price ?? 0,
          });
        }
      }
    }

    const appointmentWithDetails = await GroomingAppointment.findByPk(
      newAppointment.id,
      {
        include: getCommonIncludes(),
      }
    );

    res.status(201).json({
      success: true,
      message: "예약이 성공적으로 생성되었습니다.",
      data: addComputedGroomingType(appointmentWithDetails),
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
    const {
      assigned_user_id,
      grooming_type,
      grooming_types, // 새로운 배열 형식: [{ grooming_type_id: number, applied_price?: number }]
      memo,
      amount,
      appointment_at,
      start_time,
      end_time,
      status,
    } = req.body;

    const appointment = await GroomingAppointment.findByPk(id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "예약을 찾을 수 없습니다.",
      });
    }

    // (레거시) grooming_type이 있으면 GroomingType 테이블에 추가 (없을 경우에만)
    if (grooming_type && grooming_type.trim()) {
      await GroomingType.findOrCreate({
        where: {
          shop_id: appointment.shop_id,
          name: grooming_type.trim(),
        },
        defaults: {
          shop_id: appointment.shop_id,
          name: grooming_type.trim(),
          description: null,
        },
      });
    }

    // 업데이트할 필드만 설정
    if (assigned_user_id !== undefined)
      appointment.assigned_user_id = assigned_user_id;
    if (grooming_type !== undefined) appointment.grooming_type = grooming_type;
    if (memo !== undefined) appointment.memo = memo;
    if (amount !== undefined) appointment.amount = amount;
    if (appointment_at !== undefined)
      appointment.appointment_at = appointment_at;
    if (start_time !== undefined) appointment.start_time = start_time;
    if (end_time !== undefined) appointment.end_time = end_time;
    if (status !== undefined) appointment.status = status;

    await appointment.save();

    // 새로운 grooming_types 배열 처리 (기존 관계 삭제 후 재생성)
    if (grooming_types !== undefined && Array.isArray(grooming_types)) {
      // 먼저 모든 미용 타입 유효성 검증
      for (const gt of grooming_types) {
        const groomingType = await GroomingType.findByPk(gt.grooming_type_id);

        if (!groomingType || groomingType.shop_id !== appointment.shop_id) {
          return res.status(400).json({
            success: false,
            message: "유효하지 않은 미용 타입이 포함되어 있습니다.",
          });
        }

        if (groomingType.is_active === false) {
          return res.status(400).json({
            success: false,
            message: `미용 타입 '${groomingType.name}'은(는) 현재 비활성화되어 사용할 수 없습니다.`,
          });
        }
      }

      // 기존 관계 삭제
      await AppointmentGroomingType.destroy({
        where: { appointment_id: Number(id) },
      });

      // 검증 통과 후 새로운 관계 생성
      for (const gt of grooming_types) {
        const groomingType = await GroomingType.findByPk(gt.grooming_type_id);
        if (groomingType) {
          await AppointmentGroomingType.create({
            appointment_id: Number(id),
            grooming_type_id: gt.grooming_type_id,
            applied_price: gt.applied_price ?? groomingType.default_price ?? 0,
          });
        }
      }
    }

    const updatedAppointment = await GroomingAppointment.findByPk(id, {
      include: getCommonIncludes(),
    });

    res.status(200).json({
      success: true,
      message: "예약이 성공적으로 수정되었습니다.",
      data: addComputedGroomingType(updatedAppointment),
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

// 샵별 예약 조회 (pagination 및 기간 필터링 지원)
export const getAppointmentsByShopId = async (req: Request, res: Response) => {
  try {
    const { shopId } = req.params;
    const { page = "1", limit = "20", startDate, endDate } = req.query;

    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.min(
      100,
      Math.max(1, parseInt(limit as string, 10) || 20)
    );
    const offset = (pageNum - 1) * limitNum;

    // where 절 구성
    const whereClause: Record<string, unknown> = { shop_id: shopId };

    // 기간 필터링 추가
    if (startDate && endDate) {
      whereClause.appointment_at = {
        [Op.between]: [startDate as string, endDate as string],
      };
    } else if (startDate) {
      whereClause.appointment_at = {
        [Op.gte]: startDate as string,
      };
    } else if (endDate) {
      whereClause.appointment_at = {
        [Op.lte]: endDate as string,
      };
    }

    // 페이지네이션된 예약 목록 조회
    const { count, rows: appointments } =
      await GroomingAppointment.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: Shop,
            attributes: ["id", "name"],
          },
          {
            model: User,
            as: "createdByUser",
            attributes: ["id", "name", "email"],
          },
          {
            model: User,
            as: "assignedUser",
            attributes: ["id", "name", "email"],
          },
          {
            model: Dog,
            attributes: ["id", "name", "breed"],
          },
          {
            model: AppointmentGroomingType,
            include: [
              {
                model: GroomingType,
                attributes: ["id", "name", "description", "default_price"],
              },
            ],
          },
        ],
        order: [["appointment_at", "DESC"]],
        limit: limitNum,
        offset: offset,
      });

    // 상태별 매출 합계 조회 (페이지네이션과 상관없이 전체 기간 합계)
    const statusSummary = await GroomingAppointment.findAll({
      where: whereClause,
      attributes: [
        "status",
        [fn("COALESCE", fn("SUM", col("amount")), 0), "amount"],
      ],
      group: ["status"],
      raw: true,
    });

    // 상태별 매출 합계 객체로 변환 및 총합 계산
    const summaryByStatus: Record<string, number> = {};
    let totalAmount = 0;
    (
      statusSummary as unknown as Array<{
        status: string;
        amount: string | number;
      }>
    ).forEach((item) => {
      const amount = Number(item.amount) || 0;
      summaryByStatus[item.status] = amount;
      totalAmount += amount;
    });

    // scheduled 또는 settled 상태의 매출 합계
    const scheduledAmount =
      (summaryByStatus["scheduled"] || 0) + (summaryByStatus["settled"] || 0);
    const pendingAmount = totalAmount - scheduledAmount;

    const totalPages = Math.ceil(count / limitNum);

    res.status(200).json({
      success: true,
      data: addComputedGroomingTypeToList(appointments),
      pagination: {
        currentPage: pageNum,
        totalPages: totalPages,
        totalCount: count,
        limit: limitNum,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1,
      },
      summary: {
        totalAmount: totalAmount,
        scheduledAmount: scheduledAmount,
        pendingAmount: pendingAmount,
        byStatus: summaryByStatus,
      },
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
          attributes: ["id", "name", "email"],
        },
        {
          model: User,
          as: "assignedUser",
          attributes: ["id", "name", "email"],
        },
        {
          model: Dog,
          attributes: ["id", "name", "breed"],
        },
        {
          model: AppointmentGroomingType,
          include: [
            {
              model: GroomingType,
              attributes: ["id", "name", "description", "default_price"],
            },
          ],
        },
      ],
      order: [["appointment_at", "DESC"]],
    });

    res.status(200).json({
      success: true,
      data: addComputedGroomingTypeToList(appointments),
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
          attributes: ["id", "name", "email"],
        },
        {
          model: User,
          as: "assignedUser",
          attributes: ["id", "name", "email"],
        },
        {
          model: Dog,
          attributes: ["id", "name", "breed"],
        },
        {
          model: AppointmentGroomingType,
          include: [
            {
              model: GroomingType,
              attributes: ["id", "name", "description", "default_price"],
            },
          ],
        },
      ],
      order: [["appointment_at", "DESC"]],
    });

    res.status(200).json({
      success: true,
      data: addComputedGroomingTypeToList(appointments),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "예약 목록 조회 중 오류가 발생했습니다.",
      error: error instanceof Error ? error.message : "알 수 없는 오류",
    });
  }
};
