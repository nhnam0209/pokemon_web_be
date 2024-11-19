import { Body, Controller, Get, HttpStatus, Post, Req, Res, UseGuards } from "@nestjs/common";
import { ApiBody, ApiHeader, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { LoggerService } from "src/management/common/services/log_service.service";
import { UserAuthenticateService } from "../services/user_auth.service";
import { responseMessage } from "src/utils/constant";
import { VerifyLoginMiddleware } from "src/middleware/verify_user.middleware";
import { NextFunction } from "express";
import { ErrorResponseDto, LoginManagementDto, RegisterManagementDto, ResetPasswordDto } from "../dtos/user_auth.dto";
import { ManagementLoginRequestData, RegisterManagementRequestData, ResetPasswordData } from "../interfaces/user_auth.interface";

@Controller("/v1/user_auth")
@ApiTags("API Authentication")
export class UserAuthenticateManagementController {
  constructor(
    private readonly authenticateService: UserAuthenticateService,
    private readonly logger: LoggerService
  ) {}

  @Post("/login")
  @ApiOperation({ summary: "Đăng nhập trên trang Admin" })
  @ApiBody({ type: LoginManagementDto }) // Use type object to define the schema
  @ApiResponse({
    status: 400,
    description: "Yêu cầu không hợp lệ",
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 500,
    description: "Lỗi dịch vụ",
    type: ErrorResponseDto,
  })
  async handleLoginManagement(@Body() loginRequest: ManagementLoginRequestData, @Req() req: any, @Res() res: any): Promise<any> {
    try {
      if (Object.keys(req.body).length === 0) {
        return res.status(HttpStatus.OK).json({
          code: -2,
          message: responseMessage.badRequest,
        });
      }
      const user = await this.authenticateService.validateUserManagement(loginRequest.username, loginRequest.password);

      return res.status(HttpStatus.OK).json({
        code: 0,
        message: responseMessage.success,
        data: user,
      });
    } catch (error) {
      //Log thông tin vào bảng audit_log
      this.logger.error(responseMessage.serviceError, error);
      const status = error.status !== 500 ? HttpStatus.OK : HttpStatus.INTERNAL_SERVER_ERROR;
      const message = error.status !== 500 ? error.response.message : responseMessage.serviceError;
      const code = error.status !== 500 ? error.response.code : -6;

      return res.status(status).json({ code, message });
    }
  }

  @Post("/register")
  @ApiOperation({
    summary: "Đăng ký tài khoản mới",
  })
  @ApiResponse({
    status: 400,
    description: "Yêu cầu không hợp lệ",
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 500,
    description: "Lỗi dịch vụ",
    type: ErrorResponseDto,
  })
  @ApiBody({ type: RegisterManagementDto })
  async handleRegister(@Body() registerRequest: RegisterManagementRequestData, @Req() req: any, @Res() res: any): Promise<any> {
    try {
      if (Object.keys(req.body).length === 0) {
        return res.status(HttpStatus.OK).json({
          code: -2,
          message: responseMessage.badRequest,
        });
      }

      await this.authenticateService.registerUserManagement(registerRequest);

      return res.status(HttpStatus.OK).json({
        code: 0,
        message: responseMessage.success,
      });
    } catch (error) {
      this.logger.error("Error in register:", error);

      const status = error.status !== 500 ? HttpStatus.OK : HttpStatus.INTERNAL_SERVER_ERROR;
      const message = error.status !== 500 ? error.response.message : responseMessage.serviceError;
      const code = error.status !== 500 ? error.response.code : -6;

      return res.status(status).json({ code, message });
    }
  }

  @Get("/verify_login")
  @ApiOperation({ summary: "Xác thực đăng nhập" })
  @ApiHeader({
    name: "Authorization",
    description: "Bearer token cho authentication",
    required: true,
  })
  @UseGuards(VerifyLoginMiddleware)
  async getVerifyLogin(@Req() req: any, @Res() res: any, next: NextFunction): Promise<any> {
    try {
      res.status(HttpStatus.OK).json({
        code: 0,
        message: responseMessage.success,
        data: req.userData,
      });
    } catch (error) {
      next(error);
    }
  }

  @Post("/reset_password")
  @ApiOperation({ summary: "Reset password mới" })
  @ApiBody({ type: ResetPasswordDto })
  async handleResetPassword(@Body() resetPasswordData: ResetPasswordData, @Req() req: any, @Res() res: any): Promise<any> {
    try {
      if (Object.keys(req.body).length === 0) {
        return res.status(HttpStatus.OK).json({
          code: -2,
          message: responseMessage.badRequest,
        });
      }

      await this.authenticateService.handleResetPassword(resetPasswordData);

      return res.status(HttpStatus.OK).json({
        code: 0,
        message: responseMessage.success,
      });
    } catch (error) {
      this.logger.error("Error in /reset_password:", error);

      const status = error.status !== 500 ? HttpStatus.OK : HttpStatus.INTERNAL_SERVER_ERROR;
      const message = error.status !== 500 ? error.response.message : responseMessage.serviceError;
      const code = error.status !== 500 ? error.response.code : -6;

      return res.status(status).json({ code, message });
    }
  }
}
