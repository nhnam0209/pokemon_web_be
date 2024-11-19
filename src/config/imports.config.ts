import { TypeOrmModule } from "@nestjs/typeorm";
import { UserVerifyInformation } from "src/management/user_auth/entities/user_auth.entity";

export const ManagementPKMWebImports = [TypeOrmModule.forFeature([UserVerifyInformation])];
