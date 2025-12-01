import { Request, Response } from "express";
import { Employee } from "../models/Employee";
import { Shop } from "../models/Shop";
import { User } from "../models/User";

// 샵별 직원 목록 조회 (pagination 지원)
export const getEmployeesByShopId = async (req: Request, res: Response) => {
  try {
    const { shopId } = req.params;
    const { page = "1", limit = "20" } = req.query;

    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.min(
      100,
      Math.max(1, parseInt(limit as string, 10) || 20)
    );
    const offset = (pageNum - 1) * limitNum;

    const { count, rows: employees } = await Employee.findAndCountAll({
      where: { shop_id: shopId },
      include: [
        {
          model: User,
          attributes: ["id", "name", "email"],
        },
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
      data: employees,
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
      message: "직원 목록 조회 중 오류가 발생했습니다.",
      error: error instanceof Error ? error.message : "알 수 없는 오류",
    });
  }
};

// 특정 직원 조회
export const getEmployeeById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const employee = await Employee.findByPk(id, {
      include: [
        {
          model: User,
          attributes: ["id", "name", "email"],
        },
        {
          model: Shop,
          attributes: ["id", "name"],
        },
      ],
    });

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "직원을 찾을 수 없습니다.",
      });
    }

    res.status(200).json({
      success: true,
      data: employee,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "직원 조회 중 오류가 발생했습니다.",
      error: error instanceof Error ? error.message : "알 수 없는 오류",
    });
  }
};

// 사용자가 속한 샵 목록 조회
export const getShopsByUserId = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const employees = await Employee.findAll({
      where: { user_id: userId },
      include: [
        {
          model: Shop,
        },
      ],
      order: [["created_at", "DESC"]],
    });

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

// 직원 추가 (샵에 사용자 등록)
export const createEmployee = async (req: Request, res: Response) => {
  try {
    const { shop_id, user_id, role } = req.body;

    if (!shop_id || !user_id) {
      return res.status(400).json({
        success: false,
        message: "shop_id와 user_id는 필수입니다.",
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
    const user = await User.findByPk(user_id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "사용자를 찾을 수 없습니다.",
      });
    }

    // 이미 해당 샵에 등록된 직원인지 확인
    const existingEmployee = await Employee.findOne({
      where: { shop_id, user_id },
    });

    if (existingEmployee) {
      return res.status(400).json({
        success: false,
        message: "이미 해당 샵에 등록된 직원입니다.",
      });
    }

    const newEmployee = await Employee.create({
      shop_id,
      user_id,
      role: role || "staff",
    });

    const employeeWithDetails = await Employee.findByPk(newEmployee.id, {
      include: [
        {
          model: User,
          attributes: ["id", "name", "email"],
        },
        {
          model: Shop,
          attributes: ["id", "name"],
        },
      ],
    });

    res.status(201).json({
      success: true,
      message: "직원이 성공적으로 등록되었습니다.",
      data: employeeWithDetails,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "직원 등록 중 오류가 발생했습니다.",
      error: error instanceof Error ? error.message : "알 수 없는 오류",
    });
  }
};

// 직원 역할 수정
export const updateEmployee = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const employee = await Employee.findByPk(id);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "직원을 찾을 수 없습니다.",
      });
    }

    if (role !== undefined) employee.role = role;

    await employee.save();

    const updatedEmployee = await Employee.findByPk(id, {
      include: [
        {
          model: User,
          attributes: ["id", "name", "email"],
        },
        {
          model: Shop,
          attributes: ["id", "name"],
        },
      ],
    });

    res.status(200).json({
      success: true,
      message: "직원 정보가 성공적으로 수정되었습니다.",
      data: updatedEmployee,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "직원 정보 수정 중 오류가 발생했습니다.",
      error: error instanceof Error ? error.message : "알 수 없는 오류",
    });
  }
};

// 직원 삭제 (샵에서 사용자 제거)
export const deleteEmployee = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const employee = await Employee.findByPk(id);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "직원을 찾을 수 없습니다.",
      });
    }

    await employee.destroy();

    res.status(200).json({
      success: true,
      message: "직원이 성공적으로 삭제되었습니다.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "직원 삭제 중 오류가 발생했습니다.",
      error: error instanceof Error ? error.message : "알 수 없는 오류",
    });
  }
};
