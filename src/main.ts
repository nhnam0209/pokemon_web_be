import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { LoggerService } from "./management/common/services/log_service.service";
import helmet from "helmet";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

async function bootstrap() {
  const port = process.env.PORT || 5000;

  const app = await NestFactory.create(AppModule, { cors: true, logger: new LoggerService(), bufferLogs: true });
  app.useLogger(new LoggerService());
  app.use(helmet());
  const config = new DocumentBuilder().setTitle("Pokemon Web API").setVersion("1.0").build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api-docs", app, document);

  await app.listen(port);
}
bootstrap();
