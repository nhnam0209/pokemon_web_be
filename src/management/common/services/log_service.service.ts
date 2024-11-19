import { Injectable, ConsoleLogger, Scope } from "@nestjs/common";
import { createLogger, transports, format, Logger as WinstonLogger } from "winston";
import * as DailyRotateFile from "winston-daily-rotate-file";

@Injectable({ scope: Scope.TRANSIENT })
export class LoggerService extends ConsoleLogger {
  private readonly logger: WinstonLogger;

  constructor() {
    super();

    const logFormat = format.combine(
      format.timestamp(),
      format.printf(({ timestamp, level, message, context, stack }) => {
        return `${timestamp} [${context || "Application"}] ${level}: ${message} ${stack || ""}`;
      })
    );

    const dailyRotateFileConfig = (filename: string, level: string) => ({
      filename,
      datePattern: "DD-MM-YYYY",
      level,
      zippedArchive: true,
      maxSize: "20m",
      maxFiles: "14d",
    });

    this.logger = createLogger({
      level: process.env.NODE_ENV === "production" ? "info" : "debug",
      format: logFormat,
      transports: [
        new transports.Console(),
        new DailyRotateFile(dailyRotateFileConfig("logs/error/error-%DATE%.log", "error")),
        new DailyRotateFile(dailyRotateFileConfig("logs/combined/combined-%DATE%.log", "info")),
        new DailyRotateFile(dailyRotateFileConfig("logs/debug/debug-%DATE%.log", "debug")),
        new DailyRotateFile(dailyRotateFileConfig("logs/warn/warn-%DATE%.log", "warn")),
        new DailyRotateFile(dailyRotateFileConfig("logs/log/log-%DATE%.log", "info")),
      ],
    });
  }

  error(message: any, trace?: string, context?: string): void {
    this.logger.error({ message, context, stack: trace });
    super.error(`Code: ERROR_CODE, Message: ${message}, Trace: ${trace}`, trace, context);
  }

  warn(message: any, context?: string): void {
    this.logger.warn({ message, context });
    super.warn(`Code: WARN_CODE, Message: ${message}`, context);
  }

  log(message: any, context?: string): void {
    this.logger.info({ message, context });
    super.log(`Code: LOG_CODE, Message: ${message}`, context);
  }

  debug(message: any, context?: string): void {
    this.logger.debug({ message, context });
    super.debug(`Code: DEBUG_CODE, Message: ${message}`, context);
  }

  verbose(message: any, context?: string): void {
    this.logger.verbose({ message, context });
    super.verbose(`Code: VERBOSE_CODE, Message: ${message}`, context);
  }
}
