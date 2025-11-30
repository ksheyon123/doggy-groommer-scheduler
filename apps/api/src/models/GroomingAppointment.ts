import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
} from "sequelize-typescript";
import { User } from "./User";
import { Dog } from "./Dog";
import { Shop } from "./Shop";

@Table({
  tableName: "grooming_appointments",
  timestamps: true,
  createdAt: "created_at",
  updatedAt: "updated_at",
})
export class GroomingAppointment extends Model {
  @ForeignKey(() => Shop)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  shop_id!: number;

  @BelongsTo(() => Shop)
  shop!: Shop;

  @ForeignKey(() => Dog)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  dog_id!: number;

  @BelongsTo(() => Dog)
  dog!: Dog;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: "created_by_user_id",
  })
  created_by_user_id!: number;

  @BelongsTo(() => User, {
    foreignKey: "created_by_user_id",
    as: "createdByUser",
  })
  createdByUser!: User;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    field: "assigned_user_id",
  })
  assigned_user_id!: number;

  @BelongsTo(() => User, { foreignKey: "assigned_user_id", as: "assignedUser" })
  assignedUser!: User;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  grooming_type!: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  memo!: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  amount!: number;

  @Column({
    type: DataType.DATEONLY,
    allowNull: true,
  })
  appointment_at!: string;

  @Column({
    type: DataType.TIME,
    allowNull: true,
  })
  start_time!: string;

  @Column({
    type: DataType.TIME,
    allowNull: true,
  })
  end_time!: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    defaultValue: "scheduled",
  })
  status!: string;
}
