import * as dotenv from "dotenv";
import { TypeOrmModuleOptions } from "@nestjs/typeorm";

dotenv.config();

export interface DatabaseConfig {
  username: string;
  password: string;
  database: string;
  type: string;
  port: number;
  host: string;
  entities: object;
  synchronize: boolean;
  options: object;
}

export const databaseConfig = (): TypeOrmModuleOptions => ({
  type: "mssql",
  host: process.env.DB_SERVER,
  port: 1433,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [__dirname + "/../**/*.entity{.ts,.js}"], 
  synchronize: false, 
  options: {
    encrypt: true,
    trustServerCertificate: true,
  },
  cache: true,
});
