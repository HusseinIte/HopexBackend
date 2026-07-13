import { Exclude, Expose } from 'class-transformer';

export class UserResponseDto {
  @Expose()
  _id!: string;

  @Expose()
  name!: string;

  @Expose()
  email!: string;

  @Expose()
  phone?: string;

  @Expose()
  role!: string;

  @Expose()
  isActive!: boolean;

  @Expose()
  createdAt!: Date;

  @Expose()
  updatedAt!: Date;

  @Exclude()
  passwordHash?: string;
}
