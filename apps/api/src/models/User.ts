import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
} from "sequelize-typescript";
import { Shop } from "./Shop";

export type AuthProvider = "google" | "kakao" | "naver" | "local";

@Table({
  tableName: "users",
  timestamps: true,
  createdAt: "created_at",
  updatedAt: "updated_at",
})
export class User extends Model {
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  email!: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  password?: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  name?: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  profile_image?: string;

  @Column({
    type: DataType.ENUM("google", "kakao", "naver", "local"),
    allowNull: false,
    defaultValue: "local",
  })
  provider!: AuthProvider;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  provider_id?: string;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  is_staff!: boolean;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: true,
  })
  is_active!: boolean;

  @ForeignKey(() => Shop)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  shop_id?: number;

  @BelongsTo(() => Shop)
  shop?: Shop;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  refresh_token?: string;
}
