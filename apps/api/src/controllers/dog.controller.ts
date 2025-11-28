import { Request, Response } from "express";
import { Dog } from "../models/Dog";
import { User } from "../models/User";
import { GroomingAppointment } from "../models/GroomingAppointment";

// 모든 강아지 조회
export const getAllDogs = async (req: Request, res: Response) => {
  try {
    const dogs = await Dog.findAll({
      include: [
        {
          model: User,
          attributes: ["id", "username", "email"],
        },
      ],
      order: [["created_at", "DESC"]],
    });

    res.status(200).json({
      success: true,
      data: dogs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "강아지 목록 조회 중 오류가 발생했습니다.",
      error: error instanceof Error ? error.message : "알 수 없는 오류",
    });
  }
};

// 특정 강아지 조회
export const getDogById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const dog = await Dog.findByPk(id, {
      include: [
        {
          model: User,
          attributes: ["id", "username", "email"],
        },
      ],
    });

    if (!dog) {
      return res.status(404).json({
        success: false,
        message: "강아지를 찾을 수 없습니다.",
      });
    }

    res.status(200).json({
      success: true,
      data: dog,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "강아지 조회 중 오류가 발생했습니다.",
      error: error instanceof Error ? error.message : "알 수 없는 오류",
    });
  }
};

// 강아지 상세 정보 조회 (예약 기록 포함)
export const getDogWithAppointments = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const dog = await Dog.findByPk(id, {
      include: [
        {
          model: User,
          attributes: ["id", "username", "email"],
        },
      ],
    });

    if (!dog) {
      return res.status(404).json({
        success: false,
        message: "강아지를 찾을 수 없습니다.",
      });
    }

    // 해당 강아지의 예약 기록 조회
    const appointments = await GroomingAppointment.findAll({
      where: { dog_id: id },
      order: [["appointment_at", "DESC"]],
    });

    res.status(200).json({
      success: true,
      data: {
        ...dog.toJSON(),
        appointments,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "강아지 상세 정보 조회 중 오류가 발생했습니다.",
      error: error instanceof Error ? error.message : "알 수 없는 오류",
    });
  }
};

// 사용자별 강아지 목록 조회
export const getDogsByUserId = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const dogs = await Dog.findAll({
      where: { user_id: userId },
      include: [
        {
          model: User,
          attributes: ["id", "username", "email"],
        },
      ],
      order: [["created_at", "DESC"]],
    });

    res.status(200).json({
      success: true,
      data: dogs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "강아지 목록 조회 중 오류가 발생했습니다.",
      error: error instanceof Error ? error.message : "알 수 없는 오류",
    });
  }
};

// 새 강아지 등록
export const createDog = async (req: Request, res: Response) => {
  try {
    const { user_id, name, breed, note } = req.body;

    // 필수 필드 검증
    if (!user_id || !name) {
      return res.status(400).json({
        success: false,
        message: "user_id와 name은 필수입니다.",
      });
    }

    // 사용자 존재 확인
    const user = await User.findByPk(user_id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "사용자를 찾을 수 없습니다.",
      });
    }

    const newDog = await Dog.create({
      user_id,
      name,
      breed,
      note,
    });

    const dogWithUser = await Dog.findByPk(newDog.id, {
      include: [
        {
          model: User,
          attributes: ["id", "username", "email"],
        },
      ],
    });

    res.status(201).json({
      success: true,
      message: "강아지가 성공적으로 등록되었습니다.",
      data: dogWithUser,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "강아지 등록 중 오류가 발생했습니다.",
      error: error instanceof Error ? error.message : "알 수 없는 오류",
    });
  }
};

// 강아지 정보 수정
export const updateDog = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, breed, note } = req.body;

    const dog = await Dog.findByPk(id);

    if (!dog) {
      return res.status(404).json({
        success: false,
        message: "강아지를 찾을 수 없습니다.",
      });
    }

    // 업데이트할 필드만 설정
    if (name !== undefined) dog.name = name;
    if (breed !== undefined) dog.breed = breed;
    if (note !== undefined) dog.note = note;

    await dog.save();

    const updatedDog = await Dog.findByPk(id, {
      include: [
        {
          model: User,
          attributes: ["id", "username", "email"],
        },
      ],
    });

    res.status(200).json({
      success: true,
      message: "강아지 정보가 성공적으로 수정되었습니다.",
      data: updatedDog,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "강아지 정보 수정 중 오류가 발생했습니다.",
      error: error instanceof Error ? error.message : "알 수 없는 오류",
    });
  }
};

// 강아지 삭제
export const deleteDog = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const dog = await Dog.findByPk(id);

    if (!dog) {
      return res.status(404).json({
        success: false,
        message: "강아지를 찾을 수 없습니다.",
      });
    }

    // 해당 강아지의 예약이 있는지 확인
    const appointmentCount = await GroomingAppointment.count({
      where: { dog_id: id },
    });

    if (appointmentCount > 0) {
      return res.status(400).json({
        success: false,
        message:
          "예약이 존재하는 강아지는 삭제할 수 없습니다. 먼저 예약을 삭제해주세요.",
      });
    }

    await dog.destroy();

    res.status(200).json({
      success: true,
      message: "강아지가 성공적으로 삭제되었습니다.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "강아지 삭제 중 오류가 발생했습니다.",
      error: error instanceof Error ? error.message : "알 수 없는 오류",
    });
  }
};
