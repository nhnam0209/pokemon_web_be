/*
https://docs.nestjs.com/modules
*/

import { Module } from "@nestjs/common";
import { UserAuthenticateManagementImports } from "../configs/imports.config";
import { UserAuthenticateManagementController } from "../controllers/user_auth.controller";
import { UserAuthenticateManagementProviders } from "../configs/providers.config";

@Module({
  imports: [...UserAuthenticateManagementImports],
  controllers: [UserAuthenticateManagementController],
  providers: [...UserAuthenticateManagementProviders],
})
export class UserAuthModule {}
