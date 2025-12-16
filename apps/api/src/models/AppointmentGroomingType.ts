import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
} from "sequelize-typescript";
import { GroomingAppointment } from "./GroomingAppointment";
import { GroomingType } from "./GroomingType";

@Table({
  tableName: "appointment_grooming_types",
  timestamps: true,
  createdAt: "created_at",
  updatedAt: "updated_at",
})
export class AppointmentGroomingType extends Model {
  @ForeignKey(() => GroomingAppointment)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  appointment_id!: number;

  @BelongsTo(() => GroomingAppointment)
  appointment!: GroomingAppointment;

  @ForeignKey(() => GroomingType)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  grooming_type_id!: number;

  @BelongsTo(() => GroomingType)
  groomingType!: GroomingType;

  @Column({
    type: DataType.FLOAT,
    allowNull: true,
    defaultValue: 0,
  })
  applied_price!: number;
}
