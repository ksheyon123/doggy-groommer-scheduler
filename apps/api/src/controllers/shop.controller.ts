import { Request, Response } from "express";
import { Shop } from "../models/Shop";
import { Employee } from "../models/Employee";
import { User } from "../models/User";
import { GroomingType } from "../models/GroomingType";

// 사용자가 속한 샵 조회 (Owner 또는 Employee인 샵만)
export const getAllShops = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "인증이 필요합니다.",
      });
    }

    // Employee 테이블에서 사용자가 속한 샵 조회
    const employees = await Employee.findAll({
      where: {
        user_id: userId,
        is_active: true, // 활성화된 직원만 조회
      },
      include: [
        {
          model: Shop,
        },
      ],
      order: [["created_at", "DESC"]],
    });

    // Shop 정보와 역할 정보를 합쳐서 반환
    const shops = employees.map((emp) => ({
      ...emp.shop.toJSON(),
      role: emp.role,
      employee_id: emp.id,
    }));

    res.status(200).json({
      success: true,
      data: shops,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "샵 목록 조회 중 오류가 발생했습니다.",
      error: error instanceof Error ? error.message : "알 수 없는 오류",
    });
  }
};

// 특정 샵 조회
export const getShopById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const shop = await Shop.findByPk(id, {
      include: [
        {
          model: Employee,
          include: [
            {
              model: User,
              attributes: ["id", "name", "email"],
            },
          ],
        },
        {
          model: GroomingType,
        },
      ],
    });

    if (!shop) {
      return res.status(404).json({
        success: false,
        message: "샵을 찾을 수 없습니다.",
      });
    }

    res.status(200).json({
      success: true,
      data: shop,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "샵 조회 중 오류가 발생했습니다.",
      error: error instanceof Error ? error.message : "알 수 없는 오류",
    });
  }
};

// 새 샵 등록
export const createShop = async (req: Request, res: Response) => {
  try {
    const { name, address, phone } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "인증이 필요합니다.",
      });
    }

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "name은 필수입니다.",
      });
    }

    const newShop = await Shop.create({
      name,
      address,
      phone,
    });

    // 매장 생성자를 Owner로 Employee 테이블에 등록
    await Employee.create({
      shop_id: newShop.id,
      user_id: userId,
      role: "owner",
    });

    res.status(201).json({
      success: true,
      message: "샵이 성공적으로 등록되었습니다.",
      data: newShop,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "샵 등록 중 오류가 발생했습니다.",
      error: error instanceof Error ? error.message : "알 수 없는 오류",
    });
  }
};

// 샵 정보 수정
export const updateShop = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, address, phone } = req.body;

    const shop = await Shop.findByPk(id);

    if (!shop) {
      return res.status(404).json({
        success: false,
        message: "샵을 찾을 수 없습니다.",
      });
    }

    if (name !== undefined) shop.name = name;
    if (address !== undefined) shop.address = address;
    if (phone !== undefined) shop.phone = phone;

    await shop.save();

    res.status(200).json({
      success: true,
      message: "샵 정보가 성공적으로 수정되었습니다.",
      data: shop,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "샵 정보 수정 중 오류가 발생했습니다.",
      error: error instanceof Error ? error.message : "알 수 없는 오류",
    });
  }
};

// 샵 삭제
export const deleteShop = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const shop = await Shop.findByPk(id);

    if (!shop) {
      return res.status(404).json({
        success: false,
        message: "샵을 찾을 수 없습니다.",
      });
    }

    // 직원이 있는지 확인
    const employeeCount = await Employee.count({
      where: { shop_id: id },
    });

    if (employeeCount > 0) {
      return res.status(400).json({
        success: false,
        message:
          "직원이 있는 샵은 삭제할 수 없습니다. 먼저 직원을 삭제해주세요.",
      });
    }

    await shop.destroy();

    res.status(200).json({
      success: true,
      message: "샵이 성공적으로 삭제되었습니다.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "샵 삭제 중 오류가 발생했습니다.",
      error: error instanceof Error ? error.message : "알 수 없는 오류",
    });
  }
};

// 미용 타입 목록 조회
export const getGroomingTypes = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { include_inactive } = req.query;

    const shop = await Shop.findByPk(id);

    if (!shop) {
      return res.status(404).json({
        success: false,
        message: "샵을 찾을 수 없습니다.",
      });
    }

    // include_inactive=true가 아니면 활성화된 미용 타입만 조회
    const whereClause: { shop_id: string; is_active?: boolean } = {
      shop_id: id,
    };
    if (include_inactive !== "true") {
      whereClause.is_active = true;
    }

    const groomingTypes = await GroomingType.findAll({
      where: whereClause,
      order: [["created_at", "DESC"]],
    });

    res.status(200).json({
      success: true,
      data: groomingTypes,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "미용 타입 조회 중 오류가 발생했습니다.",
      error: error instanceof Error ? error.message : "알 수 없는 오류",
    });
  }
};

// 미용 타입 추가
export const addGroomingType = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, default_price = 0 } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "name은 필수입니다.",
      });
    }

    const shop = await Shop.findByPk(id);

    if (!shop) {
      return res.status(404).json({
        success: false,
        message: "샵을 찾을 수 없습니다.",
      });
    }

    const newGroomingType = await GroomingType.create({
      name,
      description,
      default_price,
      shop_id: id,
    });

    res.status(201).json({
      success: true,
      message: "미용 타입이 추가되었습니다.",
      data: newGroomingType,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "미용 타입 추가 중 오류가 발생했습니다.",
      error: error instanceof Error ? error.message : "알 수 없는 오류",
    });
  }
};

// 미용 타입 수정
export const updateGroomingType = async (req: Request, res: Response) => {
  try {
    const { id, typeId } = req.params;
    const { name, description, default_price } = req.body;

    const shop = await Shop.findByPk(id);

    if (!shop) {
      return res.status(404).json({
        success: false,
        message: "샵을 찾을 수 없습니다.",
      });
    }

    const groomingType = await GroomingType.findOne({
      where: { id: typeId, shop_id: id },
    });

    if (!groomingType) {
      return res.status(404).json({
        success: false,
        message: "미용 타입을 찾을 수 없습니다.",
      });
    }

    if (name !== undefined) groomingType.name = name;
    if (description !== undefined) groomingType.description = description;
    if (default_price !== undefined) groomingType.default_price = default_price;

    await groomingType.save();

    res.status(200).json({
      success: true,
      message: "미용 타입이 수정되었습니다.",
      data: groomingType,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "미용 타입 수정 중 오류가 발생했습니다.",
      error: error instanceof Error ? error.message : "알 수 없는 오류",
    });
  }
};

// 미용 타입 삭제
export const deleteGroomingType = async (req: Request, res: Response) => {
  try {
    const { id, typeId } = req.params;

    const shop = await Shop.findByPk(id);

    if (!shop) {
      return res.status(404).json({
        success: false,
        message: "샵을 찾을 수 없습니다.",
      });
    }

    const groomingType = await GroomingType.findOne({
      where: { id: typeId, shop_id: id },
    });

    if (!groomingType) {
      return res.status(404).json({
        success: false,
        message: "미용 타입을 찾을 수 없습니다.",
      });
    }
    groomingType.is_active = false;
    await groomingType.save();

    res.status(200).json({
      success: true,
      message: "미용 타입이 삭제되었습니다.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "미용 타입 삭제 중 오류가 발생했습니다.",
      error: error instanceof Error ? error.message : "알 수 없는 오류",
    });
  }
};
