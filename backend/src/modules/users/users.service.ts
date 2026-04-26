import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity';
import { UserConsumer } from '../../entities/user-consumer.entity';
import { UserTailor } from '../../entities/user-tailor.entity';
import { UpdateConsumerProfileDto } from './dto/update-consumer-profile.dto';
import { UpdateTailorProfileDto } from './dto/update-tailor-profile.dto';
import { ErrorCodes } from '../../common/constants/error-codes';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(UserConsumer) private consumerRepo: Repository<UserConsumer>,
    @InjectRepository(UserTailor) private tailorRepo: Repository<UserTailor>,
  ) {}

  async getUserDetails(userId: number, currentUser: any) {
    if (currentUser.id !== userId && currentUser.role !== 'admin') {
      throw new ForbiddenException({
        error_code: ErrorCodes.FORBIDDEN,
        message: 'You can only view your own profile',
      });
    }

    const user = await this.userRepo.findOne({
      where: { id: userId, is_active: true },
      relations: ['role', 'consumer_profile', 'tailor_profile'],
    });

    if (!user) {
      throw new NotFoundException({
        error_code: ErrorCodes.USER_NOT_FOUND,
        message: 'User not found',
      });
    }

    const result: any = {
      user_id: user.id,
      email: user.email,
      phone_number: user.phone_number,
      first_name: user.first_name,
      last_name: user.last_name,
      profile_picture_url: user.profile_picture_url,
      role: user.role.role_name,
      is_verified: user.is_verified,
      created_at: user.created_at,
      updated_at: user.updated_at,
    };

    if (user.consumer_profile) {
      result.consumer_profile = {
        consumer_id: user.consumer_profile.id,
        address_line1: user.consumer_profile.address_line1,
        address_line2: user.consumer_profile.address_line2,
        city: user.consumer_profile.city,
        state: user.consumer_profile.state,
        postal_code: user.consumer_profile.postal_code,
        country: user.consumer_profile.country,
        latitude: user.consumer_profile.latitude,
        longitude: user.consumer_profile.longitude,
        preferred_radius_km: user.consumer_profile.preferred_radius_km,
        consumer_status: user.consumer_profile.consumer_status,
        bio: user.consumer_profile.bio,
      };
    }

    if (user.tailor_profile) {
      result.tailor_profile = {
        tailor_id: user.tailor_profile.id,
        shop_name: user.tailor_profile.shop_name,
        shop_address_line1: user.tailor_profile.shop_address_line1,
        shop_address_line2: user.tailor_profile.shop_address_line2,
        city: user.tailor_profile.city,
        state: user.tailor_profile.state,
        postal_code: user.tailor_profile.postal_code,
        country: user.tailor_profile.country,
        latitude: user.tailor_profile.latitude,
        longitude: user.tailor_profile.longitude,
        business_type: user.tailor_profile.business_type,
        years_of_experience: user.tailor_profile.years_of_experience,
        average_rating: user.tailor_profile.average_rating,
        total_orders: user.tailor_profile.total_orders,
        is_verified: user.tailor_profile.is_verified,
        verification_status: user.tailor_profile.verification_status,
        tailor_status: user.tailor_profile.tailor_status,
        bio: user.tailor_profile.bio,
      };
    }

    return result;
  }

  async updateUserProfile(userId: number, dto: UpdateConsumerProfileDto | UpdateTailorProfileDto, currentUser: any) {
    if (currentUser.id !== userId && currentUser.role !== 'admin') {
      throw new ForbiddenException({
        error_code: ErrorCodes.FORBIDDEN,
        message: 'You can only update your own profile',
      });
    }

    const user = await this.userRepo.findOne({
      where: { id: userId, is_active: true },
      relations: ['role', 'consumer_profile', 'tailor_profile'],
    });

    if (!user) {
      throw new NotFoundException({
        error_code: ErrorCodes.USER_NOT_FOUND,
        message: 'User not found',
      });
    }

    // Update base user fields
    if ('first_name' in dto && dto.first_name) user.first_name = dto.first_name;
    if ('last_name' in dto && dto.last_name) user.last_name = dto.last_name;
    if ('profile_picture_url' in dto && dto.profile_picture_url) user.profile_picture_url = dto.profile_picture_url;
    await this.userRepo.save(user);

    // Update consumer profile
    if (user.consumer_profile && user.role.role_name === 'consumer') {
      const consumerDto = dto as UpdateConsumerProfileDto;
      const profile = user.consumer_profile;
      if (consumerDto.bio !== undefined) profile.bio = consumerDto.bio;
      if (consumerDto.address_line1) profile.address_line1 = consumerDto.address_line1;
      if (consumerDto.address_line2 !== undefined) profile.address_line2 = consumerDto.address_line2;
      if (consumerDto.city) profile.city = consumerDto.city;
      if (consumerDto.state) profile.state = consumerDto.state;
      if (consumerDto.postal_code) profile.postal_code = consumerDto.postal_code;
      if (consumerDto.latitude !== undefined) profile.latitude = consumerDto.latitude;
      if (consumerDto.longitude !== undefined) profile.longitude = consumerDto.longitude;
      if (consumerDto.preferred_radius_km !== undefined) profile.preferred_radius_km = consumerDto.preferred_radius_km;
      await this.consumerRepo.save(profile);
    }

    // Update tailor profile
    if (user.tailor_profile && user.role.role_name === 'tailor') {
      const tailorDto = dto as UpdateTailorProfileDto;
      const profile = user.tailor_profile;
      if (tailorDto.shop_name) profile.shop_name = tailorDto.shop_name;
      if (tailorDto.shop_address_line1) profile.shop_address_line1 = tailorDto.shop_address_line1;
      if (tailorDto.shop_address_line2 !== undefined) profile.shop_address_line2 = tailorDto.shop_address_line2;
      if (tailorDto.city) profile.city = tailorDto.city;
      if (tailorDto.state) profile.state = tailorDto.state;
      if (tailorDto.postal_code) profile.postal_code = tailorDto.postal_code;
      if (tailorDto.latitude !== undefined) profile.latitude = tailorDto.latitude;
      if (tailorDto.longitude !== undefined) profile.longitude = tailorDto.longitude;
      if (tailorDto.business_type) profile.business_type = tailorDto.business_type;
      if (tailorDto.years_of_experience !== undefined) profile.years_of_experience = tailorDto.years_of_experience;
      if (tailorDto.bio !== undefined) profile.bio = tailorDto.bio;
      await this.tailorRepo.save(profile);
    }

    return {
      message: 'Profile updated successfully',
      data: { user_id: userId, updated_at: new Date() },
    };
  }
}
