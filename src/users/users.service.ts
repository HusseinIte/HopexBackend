import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRole } from '../enums/user-role.enum';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  async create(dto: CreateUserDto): Promise<UserDocument> {
    const existing = await this.userModel.findOne({ email: dto.email }).exec();
    if (existing) {
      throw new ConflictException('Email already exists');
    }
    const passwordHash = await bcrypt.hash(dto.password, 10);
    // توليد QR token فريد للموظف عند إنشائه
    const staffQRToken = crypto.randomBytes(32).toString('hex');
    const created = new this.userModel({ ...dto, passwordHash, staffQRToken });
    return created.save();
  }

  async findAll(): Promise<UserDocument[]> {
    return this.userModel.find().exec();
  }

  async findAllStaff(): Promise<UserDocument[]> {
    return this.userModel.find({ role: UserRole.STAFF }).select('name email phone isInside staffQRToken isActive').exec();
  }

  async findById(id: string): Promise<UserDocument> {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException(`User with id "${id}" not found`);
    }
    return user;
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async generateStaffQR(staffId: string): Promise<{ staffQRToken: string; message: string }> {
    const staff = await this.userModel.findById(staffId).exec();
    if (!staff) {
      throw new NotFoundException(`Staff with id "${staffId}" not found`);
    }
    if (staff.role !== UserRole.STAFF) {
      throw new ConflictException('User is not a staff member');
    }
    // توليد QR token جديد
    const newToken = crypto.randomBytes(32).toString('hex');
    staff.staffQRToken = newToken;
    await staff.save();
    return {
      staffQRToken: newToken,
      message: 'QR token generated successfully',
    };
  }

  async update(id: string, dto: UpdateUserDto): Promise<UserDocument> {
    const updateData: Record<string, unknown> = { ...dto };

    // If password is being updated, hash it
    if (dto.password) {
      updateData.passwordHash = await bcrypt.hash(dto.password, 10);
      delete updateData.password;
    }

    // If email is being updated, check for uniqueness
    if (dto.email) {
      const existing = await this.userModel
        .findOne({ email: dto.email, _id: { $ne: id } })
        .exec();
      if (existing) {
        throw new ConflictException('Email already exists');
      }
    }

    const updated = await this.userModel
      .findByIdAndUpdate(id, { $set: updateData }, { new: true })
      .exec();

    if (!updated) {
      throw new NotFoundException(`User with id "${id}" not found`);
    }

    return updated;
  }

  async remove(id: string): Promise<{ deleted: boolean }> {
    const result = await this.userModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`User with id "${id}" not found`);
    }
    return { deleted: true };
  }
}
