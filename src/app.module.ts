import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { databaseConfig } from "./config/data.config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ManagementPKMWebImports } from "./config/imports.config";
import { ManagementPKMWebProviders } from "./config/providers.config";
import { UserAuthModule } from "./management/user_auth/modules/user_auth.module";

@Module({
  imports: [ConfigModule.forRoot(), TypeOrmModule.forRoot(databaseConfig()), ...ManagementPKMWebImports, UserAuthModule],
  controllers: [],
  providers: [...ManagementPKMWebProviders],
})
export class AppModule {}
