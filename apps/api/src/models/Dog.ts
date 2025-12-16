import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  HasMany,
} from "sequelize-typescript";
import { Shop } from "./Shop";
import { GroomingAppointment } from "./GroomingAppointment";

@Table({
  tableName: "dogs",
  timestamps: true,
  createdAt: "created_at",
  updatedAt: "updated_at",
})
export class Dog extends Model {
  @ForeignKey(() => Shop)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  shop_id!: number;

  @BelongsTo(() => Shop)
  shop!: Shop;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  name!: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  breed!: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  owner_name!: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  owner_phone_number!: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  note!: string;

  @Column({
    type: DataType.FLOAT,
    allowNull: true,
  })
  weight!: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  age_months!: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  birth_year!: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  birth_month!: number;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  })
  is_deleted!: boolean;

  @HasMany(() => GroomingAppointment)
  groomingAppointments!: GroomingAppointment[];
}
