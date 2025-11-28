import { Request, Response } from "express";
import { Shop } from "../models/Shop";
import { Employee } from "../models/Employee";
import { User } from "../models/User";

// 모든 샵 조회
export const getAllShops = async (req: Request, res: Response) => {
  try {
    const shops = await Shop.findAll({
      order: [["created_at", "DESC"]],
    });

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
              attributes: ["id", "username", "email"],
            },
          ],
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
