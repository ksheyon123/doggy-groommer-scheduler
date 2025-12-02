import { Request, Response } from "express";
import { Op } from "sequelize";
import { Dog } from "../models/Dog";
import { Shop } from "../models/Shop";
import { GroomingAppointment } from "../models/GroomingAppointment";

// 샵별 모든 강아지 조회
export const getAllDogs = async (req: Request, res: Response) => {
  try {
    const { shopId } = req.query;

    const whereClause = shopId
      ? { shop_id: shopId, is_deleted: false }
      : { is_deleted: false };

    const dogs = await Dog.findAll({
      where: whereClause,
      include: [
        {
          model: Shop,
          attributes: ["id", "name"],
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

    const dog = await Dog.findOne({
      where: { id, is_deleted: false },
      include: [
        {
          model: Shop,
          attributes: ["id", "name"],
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

    const dog = await Dog.findOne({
      where: { id, is_deleted: false },
      include: [
        {
          model: Shop,
          attributes: ["id", "name"],
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

// 샵별 강아지 목록 조회 (pagination 지원)
export const getDogsByShopId = async (req: Request, res: Response) => {
  try {
    const { shopId } = req.params;
    const { page = "1", limit = "20" } = req.query;

    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.min(
      100,
      Math.max(1, parseInt(limit as string, 10) || 20)
    );
    const offset = (pageNum - 1) * limitNum;

    const { count, rows: dogs } = await Dog.findAndCountAll({
      where: { shop_id: shopId, is_deleted: false },
      include: [
        {
          model: Shop,
          attributes: ["id", "name"],
        },
      ],
      order: [["created_at", "DESC"]],
      limit: limitNum,
      offset: offset,
    });

    const totalPages = Math.ceil(count / limitNum);

    res.status(200).json({
      success: true,
      data: dogs,
      pagination: {
        currentPage: pageNum,
        totalPages: totalPages,
        totalCount: count,
        limit: limitNum,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "강아지 목록 조회 중 오류가 발생했습니다.",
      error: error instanceof Error ? error.message : "알 수 없는 오류",
    });
  }
};

// 강아지 이름으로 검색
export const searchDogsByName = async (req: Request, res: Response) => {
  try {
    const { name, shopId } = req.query;

    if (!name || typeof name !== "string") {
      return res.status(400).json({
        success: false,
        message: "검색할 이름(name)을 입력해주세요.",
      });
    }

    if (!shopId) {
      return res.status(400).json({
        success: false,
        message: "shopId는 필수입니다.",
      });
    }

    const dogs = await Dog.findAll({
      where: {
        shop_id: shopId,
        name: {
          [Op.like]: `%${name}%`,
        },
        is_deleted: false,
      },
      attributes: ["id", "name", "owner_name", "breed"],
      order: [["name", "ASC"]],
      limit: 10,
    });

    res.status(200).json({
      success: true,
      data: dogs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "강아지 검색 중 오류가 발생했습니다.",
      error: error instanceof Error ? error.message : "알 수 없는 오류",
    });
  }
};

// 새 강아지 등록
export const createDog = async (req: Request, res: Response) => {
  try {
    const {
      shop_id,
      name,
      breed,
      owner_name,
      owner_phone_number,
      note,
      weight,
      age_months,
    } = req.body;

    // 필수 필드 검증
    if (!shop_id || !name) {
      return res.status(400).json({
        success: false,
        message: "shop_id와 name은 필수입니다.",
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

    const newDog = await Dog.create({
      shop_id,
      name,
      breed,
      owner_name,
      owner_phone_number,
      note,
      weight,
      age_months,
    });

    const dogWithDetails = await Dog.findByPk(newDog.id, {
      include: [
        {
          model: Shop,
          attributes: ["id", "name"],
        },
      ],
    });

    res.status(201).json({
      success: true,
      message: "강아지가 성공적으로 등록되었습니다.",
      data: dogWithDetails,
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
    const {
      name,
      breed,
      owner_name,
      owner_phone_number,
      note,
      weight,
      age_months,
    } = req.body;

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
    if (owner_name !== undefined) dog.owner_name = owner_name;
    if (owner_phone_number !== undefined)
      dog.owner_phone_number = owner_phone_number;
    if (note !== undefined) dog.note = note;
    if (weight !== undefined) dog.weight = weight;
    if (age_months !== undefined) dog.age_months = age_months;

    await dog.save();

    const updatedDog = await Dog.findByPk(id, {
      include: [
        {
          model: Shop,
          attributes: ["id", "name"],
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

// 강아지 삭제 (Soft Delete)
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

    // 이미 삭제된 강아지인지 확인
    if (dog.is_deleted) {
      return res.status(400).json({
        success: false,
        message: "이미 삭제된 강아지입니다.",
      });
    }

    // Soft delete: is_deleted 플래그를 true로 설정
    dog.is_deleted = true;
    await dog.save();

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
