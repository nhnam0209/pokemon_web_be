import { TypeOrmModule } from "@nestjs/typeorm";
import { ChangePasswordInformation, UserLogin, UserLoginInformation, UserVerifyInformation } from "../entities/user_auth.entity";
export const UserAuthenticateManagementImports = [TypeOrmModule.forFeature([UserLoginInformation, UserVerifyInformation, ChangePasswordInformation, UserLogin])];
