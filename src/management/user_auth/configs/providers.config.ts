import { LoggerService } from "src/management/common/services/log_service.service";
import { UserAuthenticateService } from "../services/user_auth.service";

export const UserAuthenticateManagementProviders = [UserAuthenticateService, LoggerService];
