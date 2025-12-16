/**
 * 기존 grooming_type(TEXT) 데이터를 N:N 관계로 마이그레이션하는 스크립트
 *
 * 실행 방법:
 * npx ts-node src/scripts/migrate-grooming-types.ts
 */

import { Op } from "sequelize";
import sequelize from "../config/database";
import { GroomingAppointment } from "../models/GroomingAppointment";
import { GroomingType } from "../models/GroomingType";
import { AppointmentGroomingType } from "../models/AppointmentGroomingType";

async function migrateGroomingTypes() {
  try {
    console.log("🚀 마이그레이션 시작...");

    // DB 연결
    await sequelize.authenticate();
    console.log("✅ 데이터베이스 연결 성공");

    // 모든 예약 조회 (기존 grooming_type이 있는 것만)
    const appointments = await GroomingAppointment.findAll({
      where: sequelize.where(
        sequelize.fn("LENGTH", sequelize.col("grooming_type")),
        { [Op.gt]: 0 }
      ),
      raw: true,
    });

    console.log(`📋 변환할 예약 수: ${appointments.length}건`);

    let migratedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (const appointment of appointments) {
      try {
        const aptId = (appointment as any).id;
        const shopId = (appointment as any).shop_id;
        const groomingTypeName = (appointment as any).grooming_type;
        const amount = (appointment as any).amount || 0;

        // 이미 마이그레이션된 데이터인지 확인
        const existingRelation = await AppointmentGroomingType.findOne({
          where: { appointment_id: aptId },
        });

        if (existingRelation) {
          skippedCount++;
          continue;
        }

        // 1. GroomingType 찾기 또는 생성
        const [groomingType] = await GroomingType.findOrCreate({
          where: {
            shop_id: shopId,
            name: groomingTypeName.trim(),
          },
          defaults: {
            shop_id: shopId,
            name: groomingTypeName.trim(),
            description: null,
            default_price: amount, // 첫 번째 금액을 기본 금액으로 설정
          },
        });

        // 2. 중간 테이블에 관계 저장
        await AppointmentGroomingType.create({
          appointment_id: aptId,
          grooming_type_id: groomingType.id,
          applied_price: amount,
        });

        migratedCount++;

        if (migratedCount % 100 === 0) {
          console.log(`⏳ ${migratedCount}건 처리 완료...`);
        }
      } catch (error) {
        errorCount++;
        console.error(
          `❌ 예약 ID ${(appointment as any).id} 처리 실패:`,
          error
        );
      }
    }

    console.log("\n" + "=".repeat(50));
    console.log("📊 마이그레이션 결과:");
    console.log(`   - 성공: ${migratedCount}건`);
    console.log(`   - 건너뜀 (이미 존재): ${skippedCount}건`);
    console.log(`   - 실패: ${errorCount}건`);
    console.log("=".repeat(50));

    // 검증: 마이그레이션 전후 비교
    const totalAppointments = await GroomingAppointment.count();
    const migratedRelations = await AppointmentGroomingType.count();

    console.log("\n📈 검증:");
    console.log(`   - 전체 예약 수: ${totalAppointments}건`);
    console.log(`   - 마이그레이션된 관계 수: ${migratedRelations}건`);

    console.log("\n✅ 마이그레이션 완료!");
  } catch (error) {
    console.error("❌ 마이그레이션 실패:", error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// 롤백 함수 (필요시 사용)
async function rollbackMigration() {
  try {
    console.log("🔄 롤백 시작...");

    await sequelize.authenticate();

    // 중간 테이블 데이터 삭제
    const deletedCount = await AppointmentGroomingType.destroy({
      where: {},
      truncate: true,
    });

    console.log(`✅ ${deletedCount}건의 관계 데이터 삭제 완료`);
    console.log(
      "💡 참고: 기존 grooming_type, amount 컬럼 데이터는 유지됩니다."
    );
  } catch (error) {
    console.error("❌ 롤백 실패:", error);
  } finally {
    await sequelize.close();
  }
}

// 실행
const args = process.argv.slice(2);

if (args.includes("--rollback")) {
  rollbackMigration();
} else {
  migrateGroomingTypes();
}
