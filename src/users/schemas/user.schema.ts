import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

import { UserRole } from '../../enums/user-role.enum';

export type UserDocument = HydratedDocument<User>;

@Schema({
  timestamps: true,
  collection: 'users',
})
export class User {
  @Prop({
    required: true,
    trim: true,
  })
  name!: string;

  @Prop({
    required: true,
    unique: true, // This decorator alone handles the unique index setup
    lowercase: true,
    trim: true,
  })
  email!: string;

  @Prop({
    required: true,
    select: false, // Prevents password leak during standard queries
  })
  passwordHash!: string;

  @Prop({
    trim: true,
  })
  phone?: string;

  @Prop({
    type: String,
    enum: UserRole,
    default: UserRole.INVESTOR,
  })
  role!: UserRole;

  @Prop({
    default: true,
  })
  isActive!: boolean;

  @Prop({ default: null })
  staffQRToken!: string;

  @Prop({ default: false })
  isInside!: boolean;

  @Prop({ default: null })
  companyName!: string;

  @Prop({ default: null })
  companyLogo!: string;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.index({ role: 1, isActive: 1 });
