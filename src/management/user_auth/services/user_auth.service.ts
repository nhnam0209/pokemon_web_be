/*
https://docs.nestjs.com/providers#services
*/

import { BadRequestException, ConflictException, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from "@nestjs/common";
import * as bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";
import * as dotenv from "dotenv";
import { LoggerService } from "src/management/common/services/log_service.service";
import { InjectRepository } from "@nestjs/typeorm";
import { Brackets, Repository } from "typeorm";
import { responseMessage } from "src/utils/constant";
import { RegisterManagementDto } from "../dtos/user_auth.dto";
import { ChangePasswordInformation, UserLogin, UserLoginInformation, UserVerifyInformation } from "../entities/user_auth.entity";
import { ManagementLoginResponseData, ResetPasswordData } from "../interfaces/user_auth.interface";
dotenv.config();
const JWT_SECRET = process.env.PROJ_JWT_SECRET;
@Injectable()
export class UserAuthenticateService {
  constructor(
    @InjectRepository(UserLoginInformation)
    private readonly userLoginInformationRepository: Repository<UserLoginInformation>,

    @InjectRepository(UserVerifyInformation)
    private readonly userVerifyInformationRepository: Repository<UserVerifyInformation>,

    @InjectRepository(ChangePasswordInformation)
    private readonly changePasswordRepository: Repository<ChangePasswordInformation>,

    @InjectRepository(UserLogin)
    private readonly userLoginRepository: Repository<UserLogin>,
    private readonly logger: LoggerService
  ) {}

  private generateAccessToken(user: UserLoginInformation): any {
    const payload = { username: user.username, sub: user.id };
    return jwt.sign(payload, JWT_SECRET, { expiresIn: "86400s" });
  }

  async validateUserManagement(username: string, password: string): Promise<ManagementLoginResponseData | null> {
    try {
      if (!username || !password) {
        throw new BadRequestException({
          code: -2,
          message: responseMessage.badRequest,
        });
      }

      const queryBuilder = this.userLoginInformationRepository
        .createQueryBuilder("users")
        .where("users.status_id != :statusId", { statusId: 2 })
        .andWhere(
          new Brackets((qb) => {
            qb.where("users.username = :username", { username });
          })
        );

      const user = await queryBuilder.getOne();

      if (!user) {
        throw new UnauthorizedException({
          code: -1,
          message: "Tên đăng nhập không đúng hoặc không tồn tại",
        });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new UnauthorizedException({
          code: -3,
          message: "Password không đúng",
        });
      }

      const accessToken = this.generateAccessToken(user);

      const { password: _, ...userWithoutPassword } = user;
      const newUserLogin = this.userLoginRepository.create({
        user_id: user.id,
        access_token: accessToken,
        status_id: 1,
      });
      await this.userLoginRepository.save(newUserLogin);
      return {
        user: userWithoutPassword,
        accessToken,
      };
    } catch (error) {
      console.error("error", error);
      this.logger.error(responseMessage.serviceError, error);
      if (error instanceof BadRequestException || error instanceof UnauthorizedException) {
        throw error;
      } else {
        throw new InternalServerErrorException({
          code: -5,
          message: responseMessage.serviceError,
        });
      }
    }
  }
  async registerUserManagement(RegisterManagementDto: RegisterManagementDto): Promise<UserVerifyInformation> {
    const { fullname, email, username, password } = RegisterManagementDto;
    const user = await this.userLoginInformationRepository.findOne({
      where: { username },
    });

    if (user) {
      throw new ConflictException({ code: -1, message: "User này đã tồn tại" });
    }

    if (!email && !username) {
      throw new BadRequestException({
        code: -2,
        message: "Username bị thiếu",
      });
    }

    try {
      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = this.userVerifyInformationRepository.create({
        fullname,
        email,
        username,
        password: hashedPassword,
        status_id: 1,
      });
      const savedUser = await this.userVerifyInformationRepository.save(newUser);

      return savedUser;
    } catch (error) {
      console.error(error);
      this.logger.error(responseMessage.serviceError, error);
      throw new InternalServerErrorException({
        code: -5,
        message: responseMessage.serviceError,
      });
    }
  }

  async handleResetPassword(resetPasswordData: ResetPasswordData): Promise<any> {
    try {
      const { email, username, newPassword } = resetPasswordData;
      const queryBuilder = this.userVerifyInformationRepository.createQueryBuilder("users").where("users.email = :email", { email }).andWhere("users.username = :username", { username }).andWhere("users.status_id != :statusId", { statusId: 2 });
      const userData = await queryBuilder.getOne();

      if (!userData) {
        throw new NotFoundException({
          code: -4,
          message: responseMessage.notFound,
        });
      }
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      await this.changePasswordRepository.update(userData.id, {
        password: hashedPassword,
        modified_date: new Date(),
      });
      return;
    } catch (error) {
      console.error(error);
      this.logger.error(responseMessage.serviceError, error);
      throw new InternalServerErrorException({
        code: -5,
        message: responseMessage.serviceError,
      });
    }
  }

  async logout(userId: number, accessToken: string): Promise<string> {
    // Kiểm tra access token tồn tại
    try {
      const userLogin = await this.userLoginRepository.findOne({
        where: { user_id: userId, access_token: accessToken },
      });

      if (!userLogin) {
        throw new NotFoundException({
          code: -4,
          message: responseMessage.notFound,
        });
      }

      // Kiểm tra trạng thái hiện tại
      if (userLogin.status_id === 2) {
        // Giả sử 0 là trạng thái đã đăng xuất
        throw new NotFoundException({
          code: -1,
          message: responseMessage.badRequest,
        });
      }

      await this.userLoginRepository.update({ id: userLogin.id }, { status_id: 2, modified_date: new Date() });

      return "Logout successful.";
    } catch (error) {
      console.error(error);
      this.logger.error(responseMessage.serviceError, error);
      throw new InternalServerErrorException({
        code: -5,
        message: responseMessage.serviceError,
      });
    }
  }
}
