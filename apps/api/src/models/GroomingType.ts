import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
} from "sequelize-typescript";
import { Shop } from "./Shop";

@Table({
  tableName: "grooming_types",
  timestamps: true,
  createdAt: "created_at",
  updatedAt: "updated_at",
})
export class GroomingType extends Model {
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  name!: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  description!: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    defaultValue: 0,
  })
  default_price!: number;

  @ForeignKey(() => Shop)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  shop_id!: number;

  @BelongsTo(() => Shop)
  shop!: Shop;
}
