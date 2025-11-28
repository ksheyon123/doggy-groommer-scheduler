import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { User } from './User';

@Table({
  tableName: 'dogs',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
})
export class Dog extends Model {
  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  user_id!: number;

  @BelongsTo(() => User)
  user!: User;

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
    type: DataType.TEXT,
    allowNull: true,
  })
  note!: string;
}
