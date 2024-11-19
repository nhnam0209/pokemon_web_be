import { HttpStatus, Injectable, NestMiddleware } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import * as dotenv from "dotenv";
import { NextFunction } from "express";
import * as jwt from "jsonwebtoken";

import { UserLogin, UserVerifyInformation } from "src/management/user_auth/entities/user_auth.entity";
import { responseMessage } from "src/utils/constant";
import { LoggerService } from "src/management/common/services/log_service.service";
import { Repository } from "typeorm";
dotenv.config();

@Injectable()
export class VerifyLoginMiddleware implements NestMiddleware {
  constructor(
    @InjectRepository(UserVerifyInformation)
    private readonly userRepository: Repository<UserVerifyInformation>,

    @InjectRepository(UserLogin)
    private readonly userLoginRepository: Repository<UserLogin>,

    private readonly logger: LoggerService
  ) {}

  async use(req: any, res: any, next: NextFunction) {
    try {
      const accessTokenSecret: string = process.env.PROJ_JWT_SECRET;
      const token: string = req.headers.authorization?.split(" ")[1];
      if (!token) {
        return res.status(HttpStatus.OK).json({ code: -3, message: responseMessage.unauthenticate });
      }

      const userLoginToken = await this.userLoginRepository.findOne({ where: { access_token: token, status_id: 2 } });

      if (userLoginToken) {
        return res.status(HttpStatus.OK).json({ code: -3, message: responseMessage.unauthenticate });
      }

      const decoded = jwt.verify(token, accessTokenSecret);
      req.userData = decoded;
      if (req.userData) {
        const userQueryBuilder = this.userRepository.createQueryBuilder("users").where("users.status_id != :statusId", { statusId: 2 }).andWhere("users.username = :username ", {
          username: req.userData.username,
        });

        const user = await userQueryBuilder.getOne();

        if (!user) {
          return res.status(HttpStatus.OK).json({ code: -3, message: responseMessage.unauthenticate });
        }

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password, ...userWithoutSensitiveData } = user;
        req.userData = {
          ...userWithoutSensitiveData,
        };
        return next();
      } else {
        return res.status(HttpStatus.OK).json({ code: -3, message: responseMessage.unauthenticate });
      }
    } catch (error) {
      this.logger.error("Error in VerifyLoginMiddleware:", error);
      if (error) {
        return res.status(HttpStatus.OK).json({ code: -3, message: responseMessage.unauthenticate });
      } else {
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ code: -5, message: responseMessage.serviceError });
      }
    }
  }
}
