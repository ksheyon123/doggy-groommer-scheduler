import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { User } from './User';
import { Dog } from './Dog';

@Table({
  tableName: 'grooming_appointments',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
})
export class GroomingAppointment extends Model {
  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  user_id!: number;

  @BelongsTo(() => User)
  user!: User;

  @ForeignKey(() => Dog)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  dog_id!: number;

  @BelongsTo(() => Dog)
  dog!: Dog;

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
    type: DataType.DATE,
    allowNull: true,
  })
  appointment_at!: Date;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    defaultValue: 'scheduled',
  })
  status!: string;
}
