import { Table, Column, Model, DataType, HasMany } from "sequelize-typescript";
import { Employee } from "./Employee";
import { Dog } from "./Dog";
import { GroomingAppointment } from "./GroomingAppointment";

@Table({
  tableName: "shops",
  timestamps: true,
  createdAt: "created_at",
  updatedAt: "updated_at",
})
export class Shop extends Model {
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  name!: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  address!: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  phone!: string;

  @HasMany(() => Employee)
  employees!: Employee[];

  @HasMany(() => Dog)
  dogs!: Dog[];

  @HasMany(() => GroomingAppointment)
  groomingAppointments!: GroomingAppointment[];
}
