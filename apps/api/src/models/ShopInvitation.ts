import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
} from "sequelize-typescript";
import { Shop } from "./Shop";
import { User } from "./User";

@Table({
  tableName: "shop_invitations",
  timestamps: true,
  createdAt: "created_at",
  updatedAt: "updated_at",
})
export class ShopInvitation extends Model {
  @ForeignKey(() => Shop)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  shop_id!: number;

  @BelongsTo(() => Shop)
  shop!: Shop;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  invited_by_user_id!: number;

  @BelongsTo(() => User, "invited_by_user_id")
  invitedByUser!: User;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  email!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  token!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    defaultValue: "staff",
  })
  role!: string;

  @Column({
    type: DataType.ENUM("pending", "accepted", "expired", "cancelled"),
    allowNull: false,
    defaultValue: "pending",
  })
  status!: "pending" | "accepted" | "expired" | "cancelled";

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  expires_at!: Date;
}
